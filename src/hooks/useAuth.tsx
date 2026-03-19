import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role?: string;
  website?: string;
  bio?: string;
  avatar_url?: string;
  industry?: string;
  subscription_tier?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  email: string;
  company_name?: string;
  industry?: string;
  subscription_tier?: string;
  is_active?: boolean;
  first_name?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    companyName: string,
    role?: string,
    industry?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createFullAccount: (data: any) => Promise<{ success: boolean; error?: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  
  // Prüfen ob wir im Password-Recovery-Flow sind
  const isRecoveryFlow = 
    window.location.pathname === '/auth/reset-password' ||
    window.location.hash.includes('type=recovery');

  if (session?.user && !isRecoveryFlow) {
    loadUserProfile(session.user.id);
  }
  setLoading(false);
});

    // Listen for auth changes
// NEU:
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    // Session setzen damit updateUser() funktioniert,
    // aber user NICHT laden → verhindert Weiterleitung zur App
    setSession(session);
    return;
  }
  setSession(session);
  if (session?.user) {
    loadUserProfile(session.user.id);
  } else {
    setUser(null);
  }
});

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Try loading by auth_user_id first (new structure)
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

      // Fallback: Try loading by id (old structure)
      if (!data && !error) {
        const fallback = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        data = fallback.data;
        error = fallback.error;
      }

      if (data) {
        setUser(data);
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!session?.user) {
        return { success: false, error: { message: 'Not authenticated' } };
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.auth_user_id;
      delete updateData.email;
      delete updateData.created_at;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('auth_user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error };
      }

      if (data) {
        setUser(data);
        setUserProfile(data as UserProfile);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    companyName: string,
    role?: string,
    industry?: string
  ) => {
    try {
      console.log('Starting signup process for:', email);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            company_name: companyName,
            role: role || 'user'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { error: authError };
      }
      
      if (!authData.user) {
        return { error: { message: 'User creation failed' } };
      }

      console.log('Auth user created:', authData.user.id);

      // 2. Create user profile in users table
const { error: profileError } = await supabase
  .from('users')
  .insert({
    id: authData.user.id,
    auth_user_id: authData.user.id,
    email: email,
    first_name: firstName,
    company_name: companyName || `${firstName}'s Company`,
    industry: industry || 'Allgemein',
    role: role || 'User',
    subscription_tier: 'trial',
    is_active: true,
    credits_remaining: 100,
    onboarding_completed: false
  });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway - profile can be fixed later
      }

      // 3. Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: companyName || `${firstName}'s Team`
        })
        .select()
        .single();

      if (teamData && !teamError) {
        console.log('Team created:', teamData.id);
        
        // 4. Add user as team member
        await supabase
          .from('team_members')
          .insert({
            team_id: teamData.id,
            user_id: authData.user.id,
            role: 'owner'
          });

        // 5. Create AI profile
        await supabase
          .from('user_ai_profiles')
          .insert({
            user_id: authData.user.id,
            brand_voice: 'professional',
            target_audience: 'B2B Kunden',
            key_messages: [],
            tone_settings: {
              formality: 'professional',
              enthusiasm: 'moderate'
            }
          });

        // 6. Create n8n webhook config
        const webhookSecret = generateWebhookSecret();
        await supabase
          .from('team_n8n_config')
          .insert({
            team_id: teamData.id,
            webhook_base_url: 'https://n8n.vektrus.ai/webhook',
            webhook_secret: webhookSecret
          });
      }

      console.log('Signup completed successfully');
      return { error: null };
      
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const createFullAccount = async (data: any) => {
    console.log('Creating full account with data:', data);
    
    try {
      // Basis-Registrierung
      const result = await signUp(
        data.email,
        data.password,
        data.firstName,
        data.companyName,
        data.role,
        data.industry
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Get the user ID for additional data
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !result.error) {
        // Social Media Accounts speichern (später implementieren)
        if (data.connectedAccounts?.length > 0) {
          console.log('TODO: Save social accounts:', data.connectedAccounts);
          // TODO: Create social_accounts table entries
        }

        // Rechnungsdaten speichern
// Rechnungsdaten speichern
if (data.billingInfo && data.paymentMethod === 'invoice') {
  await supabase.from('billing_addresses').insert({
    user_id: user.id,
    company_name: data.billingInfo.companyName,
    street: data.billingInfo.street,
    postal_code: data.billingInfo.postalCode,
    city: data.billingInfo.city,
    country: data.billingInfo.country,
    vat_id: data.billingInfo.vatId,
    billing_email: data.billingInfo.billingEmail
  });
}
      }

      return { success: true, error: null };
      
    } catch (error) {
      console.error('Full account creation error:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const generateWebhookSecret = () => {
    return 'wh_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    createFullAccount,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}