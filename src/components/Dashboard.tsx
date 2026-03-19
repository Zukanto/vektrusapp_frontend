import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { VektrusSidebar } from './dashboard/VektrusSidebar';
import WelcomeBanner from './dashboard/WelcomeBanner';
import KpiCardList from './dashboard/KpiCardList';
import WeekPreview from './dashboard/WeekPreview';
import AiInsightCard from './dashboard/AiInsightCard';
import OnboardingChecklist from './dashboard/OnboardingChecklist';
import Header from './dashboard/Header';
import { BetaHint } from './ui/BetaHint';
import Chat from './Chat';
import ContentPlanner from './planner/ContentPlanner';
import ProfilePage from './profile/ProfilePage';
import SocialAuthCallback from './profile/SocialAuthCallback';
import MediaPage from './media/MediaPage';
import InsightsPage from './insights/InsightsPage';
import HelpPage from './help/HelpPage';
import ToolHub from './toolhub/ToolHubPage';
import VisionPage from './vision/VisionPage';
import PulsePage from './pulse/PulsePage';
import BrandAnalyzePage from './brand/BrandAnalyzePage';

interface DashboardProps {
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeModule = 'dashboard', onModuleChange }) => {
const { user: authUser } = useAuth(); // Echte User-Daten
   // User-Daten aus Auth-Context
  const user = {
    firstName: authUser?.user_metadata?.full_name?.split(' ')[0] || 'User',
    hasConnectedAccounts: true,
    isNewUser: false
  };
  // Event Listener für Navigation von Dashboard-Komponenten
  React.useEffect(() => {
    const handleNavigateToPlanner = () => {
      onModuleChange?.('planner');
    };

    const handleNavigateToPlannerWithMedia = () => {
      onModuleChange?.('planner');
    };

    const handleNavigateToChat = () => {
      onModuleChange?.('chat');
    };

    const handleNavigateToBrandStudio = () => {
      onModuleChange?.('brand');
    };

    window.addEventListener('navigate-to-planner', handleNavigateToPlanner);
    window.addEventListener('navigate-to-planner-with-media', handleNavigateToPlannerWithMedia);
    window.addEventListener('navigate-to-chat', handleNavigateToChat);
    window.addEventListener('navigate-to-brand-studio', handleNavigateToBrandStudio);

    return () => {
      window.removeEventListener('navigate-to-planner', handleNavigateToPlanner);
      window.removeEventListener('navigate-to-planner-with-media', handleNavigateToPlannerWithMedia);
      window.removeEventListener('navigate-to-chat', handleNavigateToChat);
      window.removeEventListener('navigate-to-brand-studio', handleNavigateToBrandStudio);
    };
  }, [onModuleChange]);

  const renderContent = () => {
    switch (activeModule) {
      case 'toolhub':
        return <ToolHub onModuleChange={onModuleChange} />;
      case 'chat':
        return <Chat onModuleChange={onModuleChange} />;
      case 'planner':
        return (
          <ContentPlanner />
        );
      case 'pulse':
        return <PulsePage onModuleChange={onModuleChange} />;
      case 'profile':
        return <ProfilePage />;
      case 'profile-callback':
        return <SocialAuthCallback />;
      case 'insights':
        return (
          <InsightsPage />
        );
      case 'media':
        return (
          <MediaPage onModuleChange={onModuleChange} />
        );
      case 'vision':
        return <VisionPage />;
      case 'brand':
        return <BrandAnalyzePage />;
      case 'help':
        return <HelpPage onModuleChange={onModuleChange} />;
      default:
        return (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <Header />

            {/* Dashboard Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <div className="max-w-[1240px] mx-auto w-full">
                <BetaHint
                  type="demo"
                  title="Du siehst aktuell Demo-Daten."
                  description="So wird dein Dashboard aussehen, wenn deine Social-Media-Konten verknüpft sind und Vektrus Live ist. Mit echten Performance-Daten, Trends und Empfehlungen fuer dein Unternehmen."
                  className="mb-6"
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Welcome Banner - Full Width */}
                  <div className="lg:col-span-12">
                    <WelcomeBanner />
                  </div>

                  {/* KPI Cards - 8 columns on desktop */}
                  <div className="lg:col-span-8">
                    <KpiCardList />
                  </div>

                  {/* AI Insight Card - 4 columns on desktop */}
                  <div className="lg:col-span-4">
                    <AiInsightCard />
                  </div>

                  {/* Week Preview - 8 columns on desktop */}
                  <div className="lg:col-span-8">
                    <WeekPreview />
                  </div>

                  {/* Onboarding Checklist - 4 columns on desktop (only for new users) */}
                  <div className="lg:col-span-4">
                    <div className="lg:col-span-4">
                      <OnboardingChecklist />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F4FCFE]">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <VektrusSidebar activeModule={activeModule} onModuleChange={onModuleChange} />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;