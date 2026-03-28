import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [initialStep, setInitialStep] = useState(1);
  const [initialData, setInitialData] = useState<Record<string, any>>({});

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      // Check onboarding_completed
      const { data: userData } = await supabase
        .from('users')
        .select('onboarding_completed, first_name, last_name, company_name, industry, website')
        .eq('id', session.user.id)
        .single();

      if (userData?.onboarding_completed === true) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // Check existing profile data to determine resume step
      const { data: profile } = await supabase
        .from('user_ai_profiles')
        .select('company_name, target_audience, brand_voice, key_messages, tone_settings, no_go_rules, competitors, call_to_action')
        .eq('user_id', session.user.id)
        .maybeSingle();

      // Determine start step based on saved data
      let step = 1;
      const prefillData: Record<string, any> = {};

      if (userData?.company_name) {
        prefillData.firstName = userData.first_name || '';
        prefillData.lastName = userData.last_name || '';
        prefillData.companyName = userData.company_name || '';
        prefillData.industry = userData.industry || '';
        prefillData.website = userData.website || '';
        step = 2;
      }

      if (profile?.target_audience && profile?.brand_voice) {
        prefillData.targetAudience = profile.target_audience || '';
        prefillData.brandVoice = profile.brand_voice || 'professional';
        if (profile.key_messages) {
          const msgs = profile.key_messages as string[];
          prefillData.keyMessages = [msgs[0] || '', msgs[1] || '', msgs[2] || ''];
        }
        if (profile.tone_settings) {
          const tone = profile.tone_settings as Record<string, any>;
          prefillData.formality = tone.formality ?? 7;
          prefillData.creativity = tone.creativity ?? 6;
          prefillData.emojiUsage = tone.emoji_usage ?? 'balanced';
        }
        if (profile.no_go_rules) prefillData.noGoRules = profile.no_go_rules;
        if (profile.competitors) prefillData.competitors = profile.competitors;
        if (profile.call_to_action) prefillData.callToAction = profile.call_to_action;
        step = 3;
      }

      // OAuth-Callback: User kommt von Social-Connect zurück → immer Step 3
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('connected')) {
        step = 3;
      }

      setInitialStep(step);
      setInitialData(prefillData);
      setChecking(false);
    };

    checkOnboarding();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[var(--vektrus-mint)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--vektrus-blue)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--vektrus-gray)] text-sm">Lade Vektrus…</p>
        </div>
      </div>
    );
  }

  return <OnboardingWizard initialStep={initialStep} initialData={initialData} />;
};

export default Onboarding;
