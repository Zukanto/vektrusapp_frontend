import React from 'react';
import { MessageSquare, Calendar, BarChart3, Sparkles, Image, User, Rocket } from 'lucide-react';
import { Component as GlassIcons } from '../ui/glass-icons';

interface ToolGridProps {
  onModuleChange?: (module: string) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onModuleChange }) => {
  const toolItems = [
    { icon: <MessageSquare className="w-6 h-6" />, color: 'teal', label: 'Vektrus Chat', onClick: () => onModuleChange?.('chat') },
    { icon: <Calendar className="w-6 h-6" />, color: 'blue', label: 'Content Planner', onClick: () => onModuleChange?.('planner') },
    { icon: <BarChart3 className="w-6 h-6" />, color: 'purple', label: 'Insights', onClick: () => onModuleChange?.('insights') },
    { icon: <Sparkles className="w-6 h-6" />, color: 'rose', label: 'Vision', onClick: () => onModuleChange?.('vision') },
    { icon: <Image className="w-6 h-6" />, color: 'orange', label: 'Mediathek', onClick: () => onModuleChange?.('media') },
    { icon: <User className="w-6 h-6" />, color: 'indigo', label: 'Profil', onClick: () => onModuleChange?.('profile') },
  ];

  return (
    <div className="mb-16">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Rocket className="w-5 h-5 text-[#49B7E3]" />
        <h2 className="text-2xl font-semibold text-[#111111]">Alle Vektrus Tools</h2>
      </div>

      <div className="flex justify-center">
        <GlassIcons items={toolItems} className="justify-items-center" />
      </div>
    </div>
  );
};
