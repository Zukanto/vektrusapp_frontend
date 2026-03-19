import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { MODULE_TO_PATH } from '../routes';

export function useModuleNavigate() {
  const navigate = useNavigate();

  const navigateToModule = useCallback(
    (moduleId: string) => {
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
