import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import VisionPage from './VisionPage';
import VisionReelConceptView from './VisionReelConceptView';
import VisionBRollStudio from './VisionBRollStudio';
import VisionThumbnailGenerator from './VisionThumbnailGenerator';

const VisionRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="reel/:contentId" element={<VisionReelConceptView />} />
      <Route path="b-roll" element={<VisionBRollStudio />} />
      <Route path="thumbnails" element={<VisionThumbnailGenerator />} />
      <Route index element={<VisionPage />} />
      <Route path="*" element={<Navigate to="/vision" replace />} />
    </Routes>
  );
};

export default VisionRouter;
