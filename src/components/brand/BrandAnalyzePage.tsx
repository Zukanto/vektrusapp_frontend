import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { BrandProfile, PageState, WizardData } from './types';
import BrandWizard from './BrandWizard';
import BrandProcessing from './BrandProcessing';
import BrandResult from './BrandResult';

const N8N_WEBHOOK = 'https://n8n.vektrus.ai/webhook/vektrus-brand-analyze';

const BrandAnalyzePage: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [designCount, setDesignCount] = useState(0);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setPageState('wizard');
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data?.onboarding_status === 'completed') {
        setBrandProfile(data as BrandProfile);
        setPageState('result');
      } else if (data?.onboarding_status === 'processing') {
        const updatedAt = data.updated_at ? new Date(data.updated_at).getTime() : 0;
        const ageMs = Date.now() - updatedAt;
        if (ageMs > 10 * 60 * 1000) {
          await supabase
            .from('brand_profiles')
            .update({ onboarding_status: 'pending', updated_at: new Date().toISOString() })
            .eq('user_id', session.user.id);
          setPageState('wizard');
        } else {
          setPageState('processing');
          startPolling(session.user.id);
        }
      } else {
        setPageState('wizard');
      }
    };

    load();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = (uid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      const { data } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (data?.onboarding_status === 'completed') {
        clearInterval(pollRef.current!);
        setBrandProfile(data as BrandProfile);
        setPageState('result');
      }
    }, 5000);

    setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        setError('Die Analyse dauert ungewöhnlich lange. Bitte lade die Seite neu.');
        setPageState('wizard');
      }
    }, 300000);
  };

  const handleStartAnalysis = async (data: WizardData) => {
    const uploadedDesigns = data.designs.filter((d) => d.uploaded && d.publicUrl);
    const allDesigns = data.designs;

    if (allDesigns.length === 0) {
      setError('Bitte lade mindestens ein Design hoch.');
      return;
    }

    const effectiveDesigns = uploadedDesigns.length > 0 ? uploadedDesigns : allDesigns;
    setDesignCount(effectiveDesigns.length);
    setPageState('processing');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const uid = session.user.id;

    await supabase
      .from('brand_profiles')
      .upsert({
        user_id: uid,
        onboarding_status: 'processing',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    const referenceDesigns = effectiveDesigns.map((d) => ({
      url: d.publicUrl || d.previewUrl,
      platform: d.platform.toLowerCase(),
    }));

    const logo = data.logoPublicUrl ? { url: data.logoPublicUrl } : null;

    try {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: uid,
          reference_designs: referenceDesigns,
          logo,
          manual_ci: {
            colors: {
              primary: data.primaryColor || undefined,
              secondary: data.secondaryColor || undefined,
            },
            fonts: {
              heading: data.headingFont || undefined,
              body: data.bodyFont || undefined,
            },
            slogan: data.slogan || undefined,
            visual_style: data.visualStyle || undefined,
            tonality: {
              addressing: data.addressing || undefined,
            },
          },
        }),
      });
    } catch {
    }

    startPolling(uid);
  };

  const handleReanalyze = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('brand_profiles')
        .update({ onboarding_status: 'pending', updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    }
    setPageState('wizard');
  };

  const handleCancelProcessing = async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('brand_profiles')
        .update({ onboarding_status: 'pending', updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
    }
    setPageState('wizard');
  };

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-7 h-7 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[#FA7E70] text-sm">{error}</p>
        <button
          onClick={() => { setError(''); setPageState('wizard'); }}
          className="px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] bg-[#49B7E3] text-white text-sm font-semibold hover:bg-[#2E9FD0] transition-colors shadow-card"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F4FCFE]">
      {pageState === 'wizard' && (
        <BrandWizard userId={userId} onStartAnalysis={handleStartAnalysis} />
      )}
      {pageState === 'processing' && (
        <div className="flex-1 overflow-y-auto px-8">
          <BrandProcessing designCount={designCount} onCancel={handleCancelProcessing} />
        </div>
      )}
      {pageState === 'result' && brandProfile && (
        <BrandResult
          profile={brandProfile}
          onReanalyze={handleReanalyze}
          onProfileUpdate={setBrandProfile}
        />
      )}
    </div>
  );
};

export default BrandAnalyzePage;
