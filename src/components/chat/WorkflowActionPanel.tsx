import React, { useState } from 'react';
import { Sparkles, ChevronRight, Check, Calendar, Target, TrendingUp, Lightbulb, BarChart3, MessageSquare, Zap, PanelRightClose } from 'lucide-react';
import { useModuleColors } from '../../hooks/useModuleColors';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  prompt: string;
  category: 'strategy' | 'content' | 'analysis' | 'optimization';
}

interface WorkflowActionPanelProps {
  onActionTrigger: (prompt: string, actions: string[]) => void;
  onClose?: () => void;
}

const WorkflowActionPanel: React.FC<WorkflowActionPanelProps> = ({ onActionTrigger, onClose }) => {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const chatColors = useModuleColors('chat');
  const plannerColors = useModuleColors('planner');
  const insightsColors = useModuleColors('insights');

  const workflows: WorkflowStep[] = [
    {
      id: 'strategy-setup',
      title: 'Content-Strategie entwickeln',
      description: 'Ich helfe dir, eine vollständige Social Media Strategie aufzubauen',
      icon: Target,
      category: 'strategy',
      prompt: 'Entwickle eine vollständige Content-Strategie für mein Business. Erstelle ein Framework mit: 1) Zielgruppendefinition und deren Pain Points, 2) Unique Value Proposition und Positionierung, 3) 4-5 Content-Säulen mit konkreten Themenbeispielen, 4) Content-Mix Empfehlung (Educational/Entertainment/Promotional), 5) Messbare KPIs und Erfolgskriterien. Alles strukturiert und direkt umsetzbar.'
    },
    {
      id: 'competitor-analysis',
      title: 'Wettbewerber analysieren',
      description: 'Analysiere erfolgreiche Konkurrenten und leite Strategien ab',
      icon: TrendingUp,
      category: 'analysis',
      prompt: 'Analysiere typische Wettbewerber in meiner Branche und erstelle einen Competitive Analysis Report mit: 1) 3-5 erfolgreiche Content-Muster der Konkurrenz, 2) Deren Stärken und Schwächen, 3) Marktlücken und Differenzierungsmöglichkeiten, 4) 5 konkrete Strategien, die ich übernehmen kann, 5) Unique Angles, die mich abheben. Praxisnah und actionable.'
    },
    {
      id: 'content-calendar',
      title: 'Redaktionsplan erstellen',
      description: 'Plane deine Inhalte für die nächsten Wochen strategisch',
      icon: Calendar,
      category: 'content',
      prompt: 'Erstelle einen detaillierten 4-Wochen-Redaktionsplan für meine Hauptplattform(en). Inkludiere: Wochentag, Uhrzeit, Format (Reel/Post/Story/Carousel), Thema, Hook-Idee und Content-Säule. Achte auf ausgewogenen Content-Mix und strategische Themenverteilung. Direkt als Kalender-Template nutzbar.'
    },
    {
      id: 'post-ideas',
      title: 'Post-Ideen generieren',
      description: 'Bekomme konkrete Content-Vorschläge für deine Zielgruppe',
      icon: Lightbulb,
      category: 'content',
      prompt: 'Generiere 10 konkrete, sofort umsetzbare Post-Ideen für meine Branche und Zielgruppe. Für jede Idee: 1) Eingängiger Titel, 2) Hook für die ersten 3 Sekunden, 3) Kernaussage/Value, 4) Format-Empfehlung (Reel/Carousel/Static), 5) Warum diese Idee zur Zielgruppe passt. Kreativ, trendy und engagement-stark.'
    },
    {
      id: 'caption-writing',
      title: 'Captions schreiben lassen',
      description: 'Perfekt formulierte Texte für deine Posts',
      icon: MessageSquare,
      category: 'content',
      prompt: 'Schreibe mir 3 verschiedene Caption-Varianten für einen Social Media Post in meiner Branche. Variante 1: Storytelling-Ansatz (emotional, persönlich), Variante 2: Direkt & wertvoll (Educational), Variante 3: Call-to-Action fokussiert. Jede Caption mit: starkem Hook, Mehrwert, Emoji-Einsatz und 5-8 strategischen Hashtags.'
    },
    {
      id: 'hashtag-strategy',
      title: 'Hashtag-Strategie optimieren',
      description: 'Finde die perfekte Hashtag-Kombination',
      icon: Zap,
      category: 'optimization',
      prompt: 'Entwickle eine optimierte Hashtag-Strategie für meine Nische. Erstelle 3 Hashtag-Sets à 8-10 Hashtags mit unterschiedlichen Reichweiten: 1) High-Reach Set (100k+ Posts), 2) Mid-Tier Set (10k-100k), 3) Niche Set (<10k). Erkläre die Strategie dahinter und wann ich welches Set nutzen sollte. Plus: 5 Branded Hashtag Ideen.'
    },
    {
      id: 'performance-check',
      title: 'Performance analysieren',
      description: 'Verstehe, was funktioniert und was nicht',
      icon: BarChart3,
      category: 'analysis',
      prompt: 'Erstelle einen Performance-Analyse-Framework für meinen Content. Definiere: 1) Welche KPIs ich tracken sollte (Reach, Engagement, Saves, Shares), 2) Benchmarks für meine Branche, 3) Typische Erfolgsmuster (Formate, Themen, Posting-Zeiten), 4) Red Flags bei schlechter Performance, 5) 5 Quick Wins zur sofortigen Optimierung. Datenbasiert und umsetzbar.'
    },
    {
      id: 'posting-schedule',
      title: 'Posting-Zeiten optimieren',
      description: 'Finde heraus, wann deine Zielgruppe online ist',
      icon: TrendingUp,
      category: 'optimization',
      prompt: 'Erstelle einen optimalen Posting-Schedule basierend auf meiner Zielgruppe und Plattform. Empfehle: 1) Beste Posting-Zeiten pro Wochentag, 2) Ideale Posting-Frequenz, 3) Prime-Time-Slots für maximale Reach, 4) Off-Peak-Zeiten für Community-Engagement, 5) Saisonale/monatliche Besonderheiten. Begründe jede Empfehlung mit Zielgruppenverhalten.'
    },
    {
      id: 'content-pillars',
      title: 'Content-Säulen definieren',
      description: 'Strukturiere deine Themen strategisch',
      icon: Target,
      category: 'strategy',
      prompt: 'Definiere 4-5 Content-Säulen für meine Marke. Für jede Säule: 1) Säulenname und Kernthema, 2) Warum diese Säule wichtig für meine Zielgruppe ist, 3) 5 konkrete Content-Ideen pro Säule, 4) Empfohlene Formate, 5) Verhältnis/Frequenz der Säulen (z.B. 40% Educational, 30% Entertainment, 20% Promotional, 10% Personal). Strategisch durchdacht.'
    },
    {
      id: 'engagement-boost',
      title: 'Engagement steigern',
      description: 'Konkrete Tipps für mehr Interaktion',
      icon: Sparkles,
      category: 'optimization',
      prompt: 'Entwickle eine umfassende Engagement-Boost-Strategie. Gib mir konkrete Tactics für: 1) Call-to-Actions, die funktionieren (5 Varianten), 2) Community-Management Best Practices (Antworten, DMs, Stories), 3) Interaktive Content-Formate (Polls, Q&A, Challenges), 4) Story-Strategien für Engagement, 5) Timing-Hacks für maximale Interaktion. Alles mit Beispielen und Umsetzungstipps.'
    }
  ];

  const categories = [
    { id: 'all', label: 'Alle', icon: Sparkles },
    { id: 'strategy', label: 'Strategie', icon: Target },
    { id: 'content', label: 'Content', icon: Lightbulb },
    { id: 'analysis', label: 'Analyse', icon: BarChart3 },
    { id: 'optimization', label: 'Optimierung', icon: TrendingUp }
  ];

  const filteredWorkflows = activeCategory === 'all'
    ? workflows
    : workflows.filter(w => w.category === activeCategory);

  const handleActionClick = (actionId: string) => {
    setSelectedActions(prev => {
      if (prev.includes(actionId)) {
        return prev.filter(id => id !== actionId);
      }
      return [...prev, actionId];
    });
  };

  const handleStartWorkflow = () => {
    if (selectedActions.length === 0) return;

    const selectedWorkflows = workflows.filter(w => selectedActions.includes(w.id));

    if (selectedActions.length === 1) {
      onActionTrigger(selectedWorkflows[0].prompt, selectedActions);
    } else {
      const combinedPrompt = `Perfekt! Du hast ${selectedActions.length} Aktionen ausgewählt. Lass uns der Reihe nach durchgehen:\n\n${selectedWorkflows.map((w, idx) => `${idx + 1}. ${w.title}`).join('\n')}\n\nStarten wir mit "${selectedWorkflows[0].title}": ${selectedWorkflows[0].prompt}`;
      onActionTrigger(combinedPrompt, selectedActions);
    }

    setSelectedActions([]);
  };

  return (
    <div className="relative w-96 bg-white border-l border-[rgba(73,183,227,0.10)] flex flex-col animate-in slide-in-from-right duration-200">
      {/* Close Button - Positioned outside left */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -left-12 top-6 p-3 bg-white border border-[rgba(73,183,227,0.10)] rounded-[var(--vektrus-radius-md)] hover:bg-[#F4FCFE] transition-all duration-200 text-[#7A7A7A] hover:text-[#49B7E3] shadow-sm"
          title="Schnellaktionen ausblenden"
        >
          <PanelRightClose className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="p-6 border-b border-[rgba(73,183,227,0.10)]">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-[#49B7E3] rounded-[var(--vektrus-radius-md)] flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#111111]">
            Smart Actions
          </h3>
        </div>
        <p className="text-sm text-[#7A7A7A] leading-relaxed">
          Wähle eine oder mehrere Aktionen. Ich führe dich Schritt für Schritt durch.
        </p>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-4 border-b border-[rgba(73,183,227,0.10)] bg-[#F4FCFE]">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`inline-flex items-center space-x-1 px-3 py-2 rounded-[var(--vektrus-radius-md)] text-xs font-semibold transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-[#49B7E3] text-white shadow-md'
                    : 'bg-white text-[#7A7A7A] hover:bg-[#F4FCFE] border border-[rgba(73,183,227,0.18)]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredWorkflows.map((workflow) => {
            const IconComponent = workflow.icon;
            const isSelected = selectedActions.includes(workflow.id);
            const selectionIndex = selectedActions.indexOf(workflow.id);

            const categoryColors = workflow.category === 'content' ? plannerColors :
                                  workflow.category === 'analysis' ? insightsColors :
                                  chatColors;

            return (
              <button
                key={workflow.id}
                onClick={() => handleActionClick(workflow.id)}
                className="w-full text-left p-4 rounded-[var(--vektrus-radius-md)] transition-all duration-200 relative shadow-sm"
                style={{
                  background: isSelected ? categoryColors.gradient : 'white',
                  color: isSelected ? 'white' : '#111111',
                  border: isSelected ? 'none' : `2px solid ${categoryColors.borderLight}`,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = categoryColors.border;
                    e.currentTarget.style.backgroundColor = categoryColors.primaryVeryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = categoryColors.borderLight;
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color: categoryColors.primary }}>{selectionIndex + 1}</span>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : categoryColors.primaryLight + '20',
                    }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: isSelected ? 'white' : categoryColors.primary }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                      {workflow.title}
                    </div>
                    <div
                      className="text-xs leading-relaxed"
                      style={{ color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#7A7A7A' }}
                    >
                      {workflow.description}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[rgba(73,183,227,0.10)]">
        {selectedActions.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-[#B4E8E5]/20 rounded-[var(--vektrus-radius-md)] p-3">
              <div className="flex items-center space-x-2 text-sm">
                <Check className="w-4 h-4 text-[#49B7E3]" />
                <span className="font-medium text-[#111111]">
                  {selectedActions.length} {selectedActions.length === 1 ? 'Aktion' : 'Aktionen'} ausgewählt
                </span>
              </div>
            </div>

            <button
              onClick={handleStartWorkflow}
              className="w-full text-white py-3 px-4 rounded-[var(--vektrus-radius-md)] font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
              style={{
                background: chatColors.gradient,
              }}
            >
              <span>Workflow starten</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="bg-[#B4E8E5]/10 rounded-[var(--vektrus-radius-md)] p-4 text-center">
            <Sparkles className="w-8 h-8 text-[#49B7E3] mx-auto mb-2" />
            <p className="text-xs text-[#7A7A7A] leading-relaxed">
              Wähle eine oder mehrere Aktionen aus. Ich leite dich dann Schritt für Schritt durch den Prozess.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowActionPanel;
