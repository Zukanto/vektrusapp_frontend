import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MediaItem {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  public_url: string;
  storage_path: string;
  generated_by: string;
  generation_prompt: string | null;
  source: string;
  file_size: number | null;
  created_at: string;
}

interface MediaInsertContextType {
  selectedMedia: MediaItem | null;
  setSelectedMedia: (media: MediaItem | null) => void;
  triggerPostCreation: boolean;
  setTriggerPostCreation: (trigger: boolean) => void;
  clearSelection: () => void;
}

const MediaInsertContext = createContext<MediaInsertContextType | undefined>(undefined);

export const MediaInsertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [triggerPostCreation, setTriggerPostCreation] = useState(false);

  const clearSelection = () => {
    setSelectedMedia(null);
    setTriggerPostCreation(false);
  };

  return (
    <MediaInsertContext.Provider
      value={{
        selectedMedia,
        setSelectedMedia,
        triggerPostCreation,
        setTriggerPostCreation,
        clearSelection
      }}
    >
      {children}
    </MediaInsertContext.Provider>
  );
};

export const useMediaInsert = () => {
  const context = useContext(MediaInsertContext);
  if (context === undefined) {
    throw new Error('useMediaInsert must be used within a MediaInsertProvider');
  }
  return context;
};
