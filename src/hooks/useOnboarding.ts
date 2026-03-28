import { useReducer, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { callN8n } from '../lib/n8n';

// ── Types ──────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  // Schritt 1
  firstName: string;
  lastName: string;
  companyName: string;
  industry: string;
  website: string;

  // Schritt 2
  targetAudience: string;
  brandVoice: 'professional' | 'friendly' | 'bold';
  keyMessages: [string, string, string];
  formality: number;
  creativity: number;
  emojiUsage: 'none' | 'subtle' | 'balanced' | 'many';
  noGoRules: string[];
  competitors: string[];
  callToAction: string;
}

interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  saving: boolean;
  error: string | null;
}

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_FIELD'; field: keyof OnboardingFormData; value: any }
  | { type: 'PREFILL'; data: Partial<OnboardingFormData> }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// ── Initial state ──────────────────────────────────────────────────────

const initialFormData: OnboardingFormData = {
  firstName: '',
  lastName: '',
  companyName: '',
  industry: '',
  website: '',

  targetAudience: '',
  brandVoice: 'professional',
  keyMessages: ['', '', ''],
  formality: 7,
  creativity: 6,
  emojiUsage: 'balanced',
  noGoRules: [],
  competitors: [],
  callToAction: '',
};

const initialState: OnboardingState = {
  currentStep: 1,
  formData: initialFormData,
  saving: false,
  error: null,
};

// ── Reducer ────────────────────────────────────────────────────────────

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4), error: null };
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1), error: null };
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: null };
    case 'UPDATE_FIELD':
      return { ...state, formData: { ...state.formData, [action.field]: action.value } };
    case 'PREFILL':
      return { ...state, formData: { ...state.formData, ...action.data } };
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useOnboarding() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const nextStep = useCallback(() => dispatch({ type: 'NEXT_STEP' }), []);
  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), []);
  const setStep = useCallback((step: number) => dispatch({ type: 'SET_STEP', step }), []);

  const prefill = useCallback((data: Partial<OnboardingFormData>) => {
    dispatch({ type: 'PREFILL', data });
  }, []);

  const updateField = useCallback(
    <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  const saveStep1 = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const fd = state.formData;

      const { error: userError } = await supabase
        .from('users')
        .update({
          company_name: fd.companyName,
          industry: fd.industry,
          website: fd.website,
          first_name: fd.firstName,
          last_name: fd.lastName,
        })
        .eq('id', userId);

      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('user_ai_profiles')
        .upsert(
          { user_id: userId, company_name: fd.companyName },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;

      // User aktivieren (Late Profile erstellen) — blocking, harte Voraussetzung für Step 3
      const activateResult = await callN8n('vektrus-activate-user', {});
      if (!activateResult.success) {
        throw new Error('Benutzerprofil konnte nicht aktiviert werden. Bitte versuche es erneut.');
      }

      nextStep();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'Speichern fehlgeschlagen' });
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.formData, nextStep]);

  const saveStep2 = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_SAVING', saving: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const fd = state.formData;

      const { error } = await supabase
        .from('user_ai_profiles')
        .upsert(
          {
            user_id: userId,
            target_audience: fd.targetAudience,
            brand_voice: fd.brandVoice,
            key_messages: fd.keyMessages.filter((m) => m.trim() !== ''),
            tone_settings: {
              formality: fd.formality,
              creativity: fd.creativity,
              emoji_usage: fd.emojiUsage,
            },
            no_go_rules: fd.noGoRules,
            competitors: fd.competitors,
            call_to_action: fd.callToAction,
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      nextStep();
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', error: err.message || 'Speichern fehlgeschlagen' });
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [state.formData, nextStep]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'SET_SAVING', saving: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Keine Session');

      // onboarding_completed setzen
      const { error } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', session.user.id);

      if (error) throw error;

      return true;
    } catch (err: any) {
      dispatch({
        type: 'SET_ERROR',
        error: err.message || 'Einrichtung fehlgeschlagen. Bitte versuche es erneut.',
      });
      return false;
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, []);

  return {
    currentStep: state.currentStep,
    formData: state.formData,
    saving: state.saving,
    error: state.error,
    nextStep,
    prevStep,
    setStep,
    prefill,
    updateField,
    saveStep1,
    saveStep2,
    completeOnboarding,
  };
}
