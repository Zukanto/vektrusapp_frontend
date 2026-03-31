import React from 'react';

interface StudioContentProps {
  children?: React.ReactNode;
}

const StudioContent: React.FC<StudioContentProps> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {children || (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#FAFAFA]/30 text-lg font-manrope font-bold">
              Studio wird vorbereitet ...
            </p>
            <p className="text-[#FAFAFA]/15 text-sm mt-2">
              Storyboard, B-Roll und mehr folgen in Kürze.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioContent;
