import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { VektrusSidebar } from '../dashboard/VektrusSidebar';
import { useModuleNavigate } from '../../hooks/useModuleNavigate';
import { routes, PATH_TO_MODULE } from '../../routes';

const AppLayout: React.FC = () => {
  const navigateToModule = useModuleNavigate();
  const location = useLocation();

  const activeModule = PATH_TO_MODULE[location.pathname]
    || (location.pathname.startsWith('/help') ? 'help' : null)
    || (location.pathname.startsWith('/vision') ? 'studio' : null)
    || 'dashboard';

  useEffect(() => {
    const handleNavigateToPlanner = () => navigateToModule('planner');
    const handleNavigateToPlannerWithMedia = () => navigateToModule('planner');
    const handleNavigateToChat = () => navigateToModule('chat');
    const handleNavigateToBrandStudio = () => navigateToModule('brand');
    const handleNavigateToPulse = () => navigateToModule('pulse');
    const handleNavigateToProfile = () => navigateToModule('profile');

    window.addEventListener('navigate-to-planner', handleNavigateToPlanner);
    window.addEventListener('navigate-to-planner-with-media', handleNavigateToPlannerWithMedia);
    window.addEventListener('navigate-to-chat', handleNavigateToChat);
    window.addEventListener('navigate-to-brand-studio', handleNavigateToBrandStudio);
    window.addEventListener('navigate-to-pulse', handleNavigateToPulse);
    window.addEventListener('navigate-to-profile', handleNavigateToProfile);

    return () => {
      window.removeEventListener('navigate-to-planner', handleNavigateToPlanner);
      window.removeEventListener('navigate-to-planner-with-media', handleNavigateToPlannerWithMedia);
      window.removeEventListener('navigate-to-chat', handleNavigateToChat);
      window.removeEventListener('navigate-to-brand-studio', handleNavigateToBrandStudio);
      window.removeEventListener('navigate-to-pulse', handleNavigateToPulse);
      window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
    };
  }, [navigateToModule]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('register-module-navigate', { detail: navigateToModule })
    );
  }, [navigateToModule]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F4FCFE]">
      <div className="flex-shrink-0">
        <VektrusSidebar activeModule={activeModule} onModuleChange={navigateToModule} />
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element({ onModuleChange: navigateToModule })}
            />
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppLayout;
