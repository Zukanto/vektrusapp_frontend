import { useState, useEffect, useCallback } from 'react';
import { SocialAccountService } from '../services/socialAccountService';

const PLANNER_SUPPORTED_PLATFORMS = ['instagram', 'linkedin', 'tiktok', 'facebook'];

export function useConnectedPlatforms() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const accounts = await SocialAccountService.getConnectedAccounts();

      const platforms = accounts
        .map(a => a.platform.toLowerCase())
        .filter(p => PLANNER_SUPPORTED_PLATFORMS.includes(p));

      const unique = Array.from(new Set(platforms));
      setConnectedPlatforms(unique);
    } catch {
      setConnectedPlatforms([]);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { connectedPlatforms, isLoading, hasError, retry: load };
}
