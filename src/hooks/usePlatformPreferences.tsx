import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PlatformPreference {
  platform_id: string;
  is_expanded: boolean;
  is_active: boolean;
  sort_order: number;
}

export function usePlatformPreferences() {
  const [preferences, setPreferences] = useState<PlatformPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_platform_preferences')
        .select('platform_id, is_expanded, is_active, sort_order')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading platform preferences:', error);
      } else if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading platform preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (
    platformId: string,
    updates: Partial<Omit<PlatformPreference, 'platform_id'>>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_platform_preferences')
        .upsert({
          user_id: user.id,
          platform_id: platformId,
          ...updates
        }, {
          onConflict: 'user_id,platform_id'
        });

      if (error) {
        console.error('Error updating platform preference:', error);
      } else {
        loadPreferences();
      }
    } catch (error) {
      console.error('Error updating platform preference:', error);
    }
  };

  const getPreference = (platformId: string): PlatformPreference | undefined => {
    return preferences.find(p => p.platform_id === platformId);
  };

  const isExpanded = (platformId: string): boolean => {
    const pref = getPreference(platformId);
    return pref?.is_expanded ?? false;
  };

  const isActive = (platformId: string): boolean => {
    const pref = getPreference(platformId);
    return pref?.is_active ?? true;
  };

  const toggleExpanded = (platformId: string) => {
    const currentState = isExpanded(platformId);
    updatePreference(platformId, { is_expanded: !currentState });
  };

  const toggleActive = (platformId: string) => {
    const currentState = isActive(platformId);
    updatePreference(platformId, { is_active: !currentState });
  };

  return {
    preferences,
    loading,
    updatePreference,
    getPreference,
    isExpanded,
    isActive,
    toggleExpanded,
    toggleActive
  };
}
