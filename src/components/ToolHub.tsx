import React from 'react';
import { Component as GlassIcons } from './ui/glass-icons';
import { MessageSquare, Calendar, BarChart3, Image, User, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

interface ToolHubProps {
  onModuleChange: (module: string) => void;
}

const ToolHub: React.FC<ToolHubProps> = ({ onModuleChange }) => {
  const toolItems = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'teal',
      label: 'Vektrus Chat',
      onClick: () => onModuleChange('chat')
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      color: 'blue',
      label: 'Content Planner',
      onClick: () => onModuleChange('planner')
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'purple',
      label: 'Insights',
      onClick: () => onModuleChange('insights')
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      color: 'mint',
      label: 'Vision',
      onClick: () => onModuleChange('vision')
    },
    {
      icon: <Image className="w-6 h-6" />,
      color: 'orange',
      label: 'Mediathek',
      onClick: () => onModuleChange('media')
    },
    {
      icon: <User className="w-6 h-6" />,
      color: 'indigo',
      label: 'Profil',
      onClick: () => onModuleChange('profile')
    }
  ];

  const quickActions = [
    {
      title: 'Ersten Wochenplan erstellen',
      description: 'Nutze den KI-Wizard für deinen perfekten Start',
      icon: <Sparkles className="w-6 h-6 text-[#C0A6F8]" />,
      action: () => onModuleChange('planner'),
      color: 'bg-[#C0A6F8]/10 border-[#C0A6F8]'
    },
    {
      title: 'KI-Chat ausprobieren',
      description: 'Stelle Fragen und erhalte personalisierte Empfehlungen',
      icon: <MessageSquare className="w-6 h-6 text-[#49B7E3]" />,
      action: () => onModuleChange('chat'),
      color: 'bg-[#B6EBF7]/20 border-[#B6EBF7]'
    },
    {
      title: 'Performance analysieren',
      description: 'Verstehe deine Insights und optimiere deine Strategie',
      icon: <TrendingUp className="w-6 h-6 text-[#49D69E]" />,
      action: () => onModuleChange('insights'),
      color: 'bg-[#49D69E]/10 border-[#49D69E]'
    }
  ];

  return (
    <div className="h-full bg-[#F4FCFE] overflow-auto">
      <div className="max-w-[1240px] mx-auto p-6">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img
              src="https://res.cloudinary.com/dcgwtngml/image/upload/v1756215064/vektrus_H15_sp8eco.png"
              alt="Vektrus Logo"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#111111] mb-4">
            Willkommen im <span className="text-[#49B7E3]">Vektrus</span> Tool-Hub! 🎉
          </h1>
          <p className="text-xl text-[#7A7A7A] max-w-2xl mx-auto leading-relaxed">
            Deine zentrale Kommandozentrale für intelligente Social Media Strategien.
            Wähle ein Tool und starte durch!
          </p>
        </div>

        {/* Main Tools Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-[#111111] text-center mb-8">
            🛠️ Alle Vektrus Tools
          </h2>
          
          <div className="flex justify-center">
            <GlassIcons items={toolItems} className="max-w-4xl" />
          </div>
        </div>

        {/* Quick Start Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[#111111] text-center mb-8">
            ⚡ Schnellstart-Aktionen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className={`p-6 rounded-[var(--vektrus-radius-md)] border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${action.color}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#111111] mb-2">{action.title}</h3>
                    <p className="text-sm text-[#7A7A7A] leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-[var(--vektrus-radius-md)] p-8 border border-[rgba(73,183,227,0.18)] shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111111] text-center mb-8">
            ✨ Was macht Vektrus besonders?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#49B7E3]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">KI-gestützt</h3>
              <p className="text-sm text-[#7A7A7A]">
                Intelligente Empfehlungen für optimale Content-Performance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#49D69E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-[#49D69E]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Zielgerichtet</h3>
              <p className="text-sm text-[#7A7A7A]">
                Strategien basierend auf deinen spezifischen Zielen
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#C0A6F8]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#C0A6F8]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Datenbasiert</h3>
              <p className="text-sm text-[#7A7A7A]">
                Entscheidungen auf Basis echter Performance-Daten
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#F4BE9D]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#F4BE9D]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Automatisiert</h3>
              <p className="text-sm text-[#7A7A7A]">
                Spare Zeit durch intelligente Automatisierung
              </p>
            </div>
          </div>
        </div>

        {/* Getting Started Tips */}
        <div className="mt-12 bg-gradient-to-r from-[#B6EBF7]/20 to-[#C0A6F8]/20 rounded-[var(--vektrus-radius-md)] p-8 border border-[#B6EBF7]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-[#111111] mb-4">
              🚀 Bereit durchzustarten?
            </h2>
            <p className="text-[#7A7A7A] mb-6 max-w-2xl mx-auto">
              Beginne mit dem Chat für erste Empfehlungen oder erstelle direkt deinen ersten Wochenplan. 
              Vektrus führt dich durch jeden Schritt!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onModuleChange('chat')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                <span>KI-Chat starten</span>
              </button>
              
              <button
                onClick={() => onModuleChange('planner')}
                className="flex items-center space-x-2 px-6 py-3 bg-[#C0A6F8] hover:bg-[#A084F5] text-[#4C3D99] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                <span>Ersten Plan erstellen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolHub;