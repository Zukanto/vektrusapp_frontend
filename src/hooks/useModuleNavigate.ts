import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { MODULE_TO_PATH } from '../routes';
import { enterStudio } from '../components/studio/studioTransition';

export function useModuleNavigate() {
  const navigate = useNavigate();

  const navigateToModule = useCallback(
    (moduleId: string) => {
      // Studio gets the "Dimming the Lights" cinematic transition
      if (moduleId === 'studio') {
        enterStudio(navigate);
        return;
      }

      const path = MODULE_TO_PATH[moduleId];
      if (path) {
        navigate(path);
      } else {
        navigate('/toolhub');
      }
    },
    [navigate]
  );

  return navigateToModule;
}
