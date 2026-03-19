import React from 'react';
import { ToolHubHeader } from './ToolHubHeader';
import { QuickStartGuide } from './QuickStartGuide';
import { ToolGrid } from './ToolGrid';
import { HowItWorks } from './HowItWorks';
import { TipsCarousel } from './TipsCarousel';
import { RoadmapSection } from './RoadmapSection';
import { FeedbackSection } from './FeedbackSection';
import { FaqSection } from './FaqSection';

interface ToolHubPageProps {
  onModuleChange?: (module: string) => void;
}

const ToolHubPage: React.FC<ToolHubPageProps> = ({ onModuleChange }) => {
  return (
    <div className="h-full bg-[#F4FCFE] overflow-auto">
      <div className="max-w-[1240px] mx-auto p-6 md:p-8">
        <ToolHubHeader />
        <QuickStartGuide onModuleChange={onModuleChange} />
        <ToolGrid onModuleChange={onModuleChange} />
        <HowItWorks />
        <TipsCarousel />
        <RoadmapSection />
        <FeedbackSection />
        <FaqSection />
      </div>
    </div>
  );
};

export default ToolHubPage;
