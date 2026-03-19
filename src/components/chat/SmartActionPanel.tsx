import React, { useState } from 'react';
import { ChevronLeft, Target, Users, Instagram, Linkedin, Facebook, Calendar, Lightbulb, BarChart3, Sparkles, Building2, Palette, Rocket, Megaphone, Heart, DollarSign, Music2 } from 'lucide-react';
import CrossModuleAction from '../ui/CrossModuleAction';

interface SmartActionPanelProps {
  onGenerateRecommendations: (context: any) => void;
}

const SmartActionPanel: React.FC<SmartActionPanelProps> = ({ onGenerateRecommendations }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeContext, setActiveContext] = useState({
    audience: '',
    goal: '',
    platform: ''
  });

  const audiences = [
    { id: 'b2b', label: 'B2B Kunden', icon: <Building2 className="w-4 h-4" /> },
    { id: 'consumers', label: 'Endverbraucher', icon: <Users className="w-4 h-4" /> },
    { id: 'creators', label: 'Content Creator', icon: <Palette className="w-4 h-4" /> },
    { id: 'startups', label: 'Startups', icon: <Rocket className="w-4 h-4" /> }
  ];

  const goals = [
    { id: 'awareness', label: 'Awareness', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'engagement', label: 'Engagement', icon: <Heart className="w-4 h-4" /> },
    { id: 'leads', label: 'Lead Generation', icon: <Target className="w-4 h-4" /> },
    { id: 'sales', label: 'Sales', icon: <DollarSign className="w-4 h-4" /> }
  ];

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'tiktok', label: 'TikTok', icon: Music2, color: 'text-black' }
  ];

  const quickActions = [
    { id: 'content-calendar', label: 'Content-Kalender', icon: Calendar, description: 'Monatsplan mit Post-Ideen' },
    { id: 'post-ideas', label: 'Post-Ideen', icon: Lightbulb, description: '10 konkrete Content-Ideen' },
    { id: 'caption-variants', label: 'Caption-Varianten', icon: Target, description: '3 Textvarianten mit Hashtags' },
    { id: 'trend-analysis', label: 'Trend-Analyse', icon: BarChart3, description: 'Aktuelle Trends & Empfehlungen' }
  ];

  const handleGenerateRecommendations = () => {
    if (!activeContext.audience || !activeContext.goal || !activeContext.platform) {
      alert('Bitte wähle zuerst Zielgruppe, Ziel und Plattform aus.');
      return;
    }

    const audienceMap: Record<string, string> = {
      'b2b': 'B2B Kunden',
      'consumers': 'Endverbraucher',
      'creators': 'Content Creator',
      'startups': 'Startups'
    };

    const goalMap: Record<string, string> = {
      'awareness': 'Markenbekanntheit steigern',
      'engagement': 'Engagement erhöhen',
      'leads': 'Leads generieren',
      'sales': 'Verkäufe steigern'
    };

    const platformMap: Record<string, string> = {
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'tiktok': 'TikTok'
    };

    const audience = audienceMap[activeContext.audience] || activeContext.audience;
    const goal = goalMap[activeContext.goal] || activeContext.goal;
    const platform = platformMap[activeContext.platform] || activeContext.platform;

    const prompt = `Entwickle eine umfassende Content-Strategie für ${platform}. Zielgruppe: ${audience}. Hauptziel: ${goal}.

Gib mir konkrete Empfehlungen zu:
1. Content-Formate (welche Formate eignen sich am besten?)
2. Themencluster (3-5 Haupt-Themen für regelmäßigen Content)
3. Posting-Frequenz und beste Zeiten
4. Content-Mix (Educational, Entertainment, Promotional - Verhältnis?)
5. 5 konkrete Post-Ideen für den Start

Alle Empfehlungen sollen praxisnah und direkt umsetzbar sein.`;

    onGenerateRecommendations({ ...activeContext, prompt });
  };

  const handleQuickAction = (actionId: string) => {
    // Quick Action mit aktuellem Kontext ausführen
    const contextualPrompt = buildContextualPrompt(actionId, activeContext);
    onGenerateRecommendations({ ...activeContext, quickAction: actionId, prompt: contextualPrompt });
  };

  const buildContextualPrompt = (actionId: string, context: any) => {
    const audienceMap: Record<string, string> = {
      'b2b': 'B2B Kunden',
      'consumers': 'Endverbraucher',
      'creators': 'Content Creator',
      'startups': 'Startups'
    };

    const goalMap: Record<string, string> = {
      'awareness': 'Markenbekanntheit steigern',
      'engagement': 'Engagement erhöhen',
      'leads': 'Leads generieren',
      'sales': 'Verkäufe steigern'
    };

    const platformMap: Record<string, string> = {
      'instagram': 'Instagram',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'tiktok': 'TikTok'
    };

    const audience = context.audience ? audienceMap[context.audience] || context.audience : '';
    const goal = context.goal ? goalMap[context.goal] || context.goal : '';
    const platform = context.platform ? platformMap[context.platform] || context.platform : '';

    const hasContext = audience && goal && platform;
    const contextStr = hasContext
      ? ` für ${platform}. Zielgruppe: ${audience}. Ziel: ${goal}.`
      : ' für Social Media.';

    switch (actionId) {
      case 'content-calendar':
        return `Erstelle einen detaillierten Content-Kalender für die nächsten 4 Wochen${contextStr} Inkludiere: konkrete Post-Ideen mit Formaten (Carousel, Reel, Story etc.), optimale Posting-Zeiten, Themencluster und eine ausgewogene Content-Mischung (Educational, Entertainment, Promotional).`;

      case 'post-ideas':
        return `Generiere 10 konkrete, umsetzbare Content-Ideen${contextStr} Für jede Idee: Titel, Hook, Kernaussage, Format-Empfehlung (Bild/Video/Carousel) und warum diese Idee zur Zielgruppe passt.`;

      case 'caption-variants':
        return `Schreibe 3 verschiedene Caption-Varianten für einen Social-Media-Post${contextStr} Jede Variante sollte einen anderen Ansatz haben (z.B. storytelling, direkt, emotional). Inkludiere jeweils: Hook in erster Zeile, Call-to-Action und 5-8 relevante Hashtags.`;

      case 'trend-analysis':
        return hasContext
          ? `Analysiere aktuelle Content-Trends auf ${platform} für ${audience} und entwickle daraus 5 konkrete Trend-basierte Content-Ideen zum Ziel: ${goal}. Erkläre pro Trend: Was ist der Trend? Warum funktioniert er? Wie kann ich ihn für mein Business nutzen?`
          : `Analysiere aktuelle Content-Trends auf Social Media und entwickle daraus 5 konkrete Trend-basierte Content-Ideen. Erkläre pro Trend: Was ist der Trend? Warum funktioniert er? Wie kann ich ihn nutzen?`;

      default:
        return `Entwickle eine Content-Strategie${contextStr} Inkludiere konkrete Empfehlungen zu Formaten, Themen, Posting-Frequenz und Best Practices.`;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-l border-[rgba(73,183,227,0.18)] flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors rotate-180"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-[rgba(73,183,227,0.18)] flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(73,183,227,0.18)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111111] font-manrope">Smart Actions</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#7A7A7A] mt-1">Kontext für bessere Empfehlungen</p>
      </div>

      {/* Context Settings */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Audience Selection */}
        <div>
          <label className="text-sm font-medium text-[#111111] block mb-3">
            <Target className="w-4 h-4 inline mr-2" />
            Zielgruppe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {audiences.map((audience) => (
              <button
                key={audience.id}
                onClick={() => setActiveContext(prev => ({ ...prev, audience: audience.id }))}
                className={`p-3 rounded-[var(--vektrus-radius-sm)] border text-left transition-all duration-200 ${
                  activeContext.audience === audience.id
                    ? 'border-[#B6EBF7] bg-[#B6EBF7]/20 text-[#111111]'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111]'
                }`}
              >
                <div className="mb-1 flex justify-center text-[#49B7E3]">{audience.icon}</div>
                <div className="text-xs font-medium">{audience.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Selection */}
        <div>
          <label className="text-sm font-medium text-[#111111] block mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            Ziel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setActiveContext(prev => ({ ...prev, goal: goal.id }))}
                className={`p-3 rounded-[var(--vektrus-radius-sm)] border text-left transition-all duration-200 ${
                  activeContext.goal === goal.id
                    ? 'border-[#B6EBF7] bg-[#B6EBF7]/20 text-[#111111]'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111]'
                }`}
              >
                <div className="mb-1 flex justify-center text-[#49B7E3]">{goal.icon}</div>
                <div className="text-xs font-medium">{goal.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="text-sm font-medium text-[#111111] block mb-3">
            <Instagram className="w-4 h-4 inline mr-2" />
            Plattform
          </label>
          <div className="space-y-2">
            {platforms.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => setActiveContext(prev => ({ ...prev, platform: platform.id }))}
                  className={`w-full p-3 rounded-[var(--vektrus-radius-sm)] border text-left transition-all duration-200 flex items-center space-x-3 ${
                    activeContext.platform === platform.id
                      ? 'border-[#B6EBF7] bg-[#B6EBF7]/20 text-[#111111]'
                      : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] text-[#7A7A7A] hover:text-[#111111]'
                  }`}
                >
                  <div className={platform.color}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{platform.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cross-Module Actions */}
        <div>
          <label className="text-sm font-medium text-[#111111] block mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Zu anderen Modulen
          </label>
          <div className="space-y-3">
            <CrossModuleAction
              sourceModule="chat"
              targetModule="planner"
              title="Zum Content Planner"
              description="Erstelle einen Redaktionsplan aus den Chat-Empfehlungen"
              icon={Calendar}
              onClick={() => handleQuickAction('content-calendar')}
              showFlow={true}
            />

            <CrossModuleAction
              sourceModule="chat"
              targetModule="insights"
              title="Performance analysieren"
              description="Trend-Analyse und Insights anzeigen"
              icon={BarChart3}
              onClick={() => handleQuickAction('trend-analysis')}
              showFlow={true}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="text-sm font-medium text-[#111111] block mb-3">
            <Lightbulb className="w-4 h-4 inline mr-2" />
            Schnellaktionen
          </label>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className="w-full p-3 rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-left transition-all duration-200 group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-[#49B7E3] group-hover:text-[#49B7E3]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111111] group-hover:text-[#111111]">
                        {action.label}
                      </div>
                      <div className="text-xs text-[#7A7A7A] mt-1">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="p-4 border-t border-[rgba(73,183,227,0.18)]">
        <button
          onClick={handleGenerateRecommendations}
          disabled={!activeContext.audience || !activeContext.goal || !activeContext.platform}
          className={`w-full py-3 px-4 rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 ${
            activeContext.audience && activeContext.goal && activeContext.platform
              ? 'bg-[var(--vektrus-ai-violet)] hover:bg-[#6B5BD6] text-white shadow-card hover:shadow-elevated'
              : 'bg-[#F4FCFE] text-[#7A7A7A] cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Empfehlungen generieren
        </button>
      </div>
    </div>
  );
};

export default SmartActionPanel;