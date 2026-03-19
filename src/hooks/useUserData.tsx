import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { getDisplayName } from '../lib/utils';

export interface UserData {
  name: string;
  companyName: string;
  pendingPosts: number;
}

export const useUserData = () => {
  const { user, userProfile } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    companyName: '',
    pendingPosts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('users')
          .select('company_name, email, first_name')
          .eq('id', user.id)
          .maybeSingle();

        const { count } = await supabase
          .from('pulse_generated_content')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'draft');

        setUserData({
          name: getDisplayName(user, profile || userProfile),
          companyName: profile?.company_name || userProfile?.company_name || 'dein Unternehmen',
          pendingPosts: count || 0
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, userProfile]);

  return { userData, isLoading };
};
