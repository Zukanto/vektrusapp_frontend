import { Navigate } from 'react-router-dom';
import Chat from './components/Chat';
import ContentPlanner from './components/planner/ContentPlanner';
import ProfilePage from './components/profile/ProfilePage';
import SocialAuthCallback from './components/profile/SocialAuthCallback';
import MediaPage from './components/media/MediaPage';
import InsightsPage from './components/insights/InsightsPage';
import HelpPage from './components/help/HelpPage';
import ToolHubPage from './components/toolhub/ToolHubPage';
import VisionPage from './components/vision/VisionPage';
import PulsePage from './components/pulse/PulsePage';
import BrandAnalyzePage from './components/brand/BrandAnalyzePage';
import DashboardHome from './components/dashboard/DashboardHome';

export interface RouteConfig {
  path: string;
  moduleId: string;
  element: (props: { onModuleChange: (m: string) => void }) => React.ReactNode;
}

export const MODULE_TO_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  toolhub: '/toolhub',
  chat: '/chat',
  planner: '/planner',
  pulse: '/pulse',
  insights: '/insights',
  vision: '/vision',
  media: '/media',
  brand: '/brand',
  profile: '/profile',
  'profile-callback': '/profile/callback',
  help: '/help',
};

export const PATH_TO_MODULE: Record<string, string> = Object.fromEntries(
  Object.entries(MODULE_TO_PATH).map(([mod, path]) => [path, mod])
);

export const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    moduleId: 'dashboard',
    element: () => <DashboardHome />,
  },
  {
    path: '/toolhub',
    moduleId: 'toolhub',
    element: ({ onModuleChange }) => <ToolHubPage onModuleChange={onModuleChange} />,
  },
  {
    path: '/chat',
    moduleId: 'chat',
    element: ({ onModuleChange }) => <Chat onModuleChange={onModuleChange} />,
  },
  {
    path: '/planner',
    moduleId: 'planner',
    element: () => <ContentPlanner />,
  },
  {
    path: '/pulse',
    moduleId: 'pulse',
    element: ({ onModuleChange }) => <PulsePage onModuleChange={onModuleChange} />,
  },
  {
    path: '/insights',
    moduleId: 'insights',
    element: () => <InsightsPage />,
  },
  {
    path: '/vision',
    moduleId: 'vision',
    element: () => <VisionPage />,
  },
  {
    path: '/media',
    moduleId: 'media',
    element: ({ onModuleChange }) => <MediaPage onModuleChange={onModuleChange} />,
  },
  {
    path: '/brand',
    moduleId: 'brand',
    element: () => <BrandAnalyzePage />,
  },
  {
    path: '/profile',
    moduleId: 'profile',
    element: () => <ProfilePage />,
  },
  {
    path: '/profile/callback',
    moduleId: 'profile-callback',
    element: () => <SocialAuthCallback />,
  },
  {
    path: '/help',
    moduleId: 'help',
    element: ({ onModuleChange }) => <HelpPage onModuleChange={onModuleChange} />,
  },
];
