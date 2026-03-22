import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ModuleWrapper from '../ui/ModuleWrapper';
import HelpHub from './HelpHub';
import HelpUpdatesPage from './HelpUpdatesPage';
import HelpCategoryPage from './HelpCategoryPage';
import HelpArticlePage from './HelpArticlePage';

interface HelpPageProps {
  onModuleChange?: (module: string) => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onModuleChange }) => {
  return (
    <ModuleWrapper module="help">
      <Routes>
        <Route index element={<HelpHub onModuleChange={onModuleChange} />} />
        <Route path="updates" element={<HelpUpdatesPage />} />
        <Route path=":categorySlug" element={<HelpCategoryPage />} />
        <Route path=":categorySlug/:articleSlug" element={<HelpArticlePage />} />
      </Routes>
    </ModuleWrapper>
  );
};

export default HelpPage;
