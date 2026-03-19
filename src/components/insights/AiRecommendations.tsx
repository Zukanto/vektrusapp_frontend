import React, { useState } from 'react';
import { Lightbulb, Sparkles, ArrowRight, RefreshCw, TrendingUp, Clock, Target, Zap } from 'lucide-react';

interface AiRecommendationsProps {
  filters: any;
}

interface Recommendation {
  id: string;
  type: 'timing' | 'content' | 'platform' | 'format' | 'strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  actionable: boolean;
  cta?: string;
  data?: {
    metric: string;
    improvement: string;
    timeframe: string;
  };
}

const AiRecommendations: React.FC<AiRecommendationsProps> = ({ filters }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'timing',
      priority: 'high',
      title: 'Optimale Posting-Zeit nutzen',
      description: 'Deine Reels performen freitags um 18:00 Uhr 38% besser als zu anderen Zeiten. Nutze dieses Zeitfenster für deine wichtigsten Video-Inhalte.',
      impact: '+38% Reichweite',
      confidence: 92,
      actionable: true,
      cta: 'Freitag-Reel planen',
      data: {
        metric: 'Engagement-Rate',
        improvement: '38%',
        timeframe: 'Freitag 18:00'
      }
    },
    {
      id: '2',
      type: 'content',
      priority: 'high',
      title: 'Mehr Behind-the-Scenes Content',
      description: 'Deine "Behind the Scenes" Posts haben eine 67% höhere Engagement-Rate. Deine Community liebt authentische Einblicke in deine Arbeit.',
      impact: '+67% Engagement',
      confidence: 88,
      actionable: true,
      cta: 'BTS-Content planen',
      data: {
        metric: 'Engagement-Rate',
        improvement: '67%',
        timeframe: 'Kontinuierlich'
      }
    },
    {
      id: '3',
      type: 'platform',
      priority: 'medium',
      title: 'LinkedIn-Potenzial ausschöpfen',
      description: 'LinkedIn generiert 80% deiner Leads, aber nur 25% deiner Posts. Erhöhe die Posting-Frequenz auf LinkedIn für mehr Business-Impact.',
      impact: '+80% Lead-Potenzial',
      confidence: 85,
      actionable: true,
      cta: 'LinkedIn-Plan erstellen',
      data: {
        metric: 'Lead-Generation',
        improvement: '80%',
        timeframe: '2-3 Posts/Woche'
      }
    },
    {
      id: '4',
      type: 'format',
      priority: 'medium',
      title: 'Carousel-Posts ausbauen',
      description: 'Deine Carousel-Posts haben die höchste Verweildauer (45 Sekunden) und werden 3x häufiger gespeichert. Perfekt für Educational Content.',
      impact: '+3x Saves',
      confidence: 79,
      actionable: true,
      cta: 'Carousel-Serie starten',
      data: {
        metric: 'Verweildauer',
        improvement: '45 Sek.',
        timeframe: 'Wöchentlich'
      }
    },
    {
      id: '5',
      type: 'strategy',
      priority: 'low',
      title: 'Cross-Platform Strategie',
      description: 'Adaptiere erfolgreiche TikTok-Inhalte für Instagram Reels. 73% deiner TikTok-Hits würden auch auf Instagram funktionieren.',
      impact: '+73% Content-Effizienz',
      confidence: 71,
      actionable: true,
      cta: 'Content recyceln',
      data: {
        metric: 'Content-Effizienz',
        improvement: '73%',
        timeframe: 'Sofort umsetzbar'
      }
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'timing':
        return <Clock className="w-5 h-5 text-[#49B7E3]" />;
      case 'content':
        return <Sparkles className="w-5 h-5 text-[var(--vektrus-ai-violet)]" />;
      case 'platform':
        return <Target className="w-5 h-5 text-[#49D69E]" />;
      case 'format':
        return <TrendingUp className="w-5 h-5 text-[#F4BE9D]" />;
      case 'strategy':
        return <Zap className="w-5 h-5 text-[#49B7E3]" />;
      default:
        return <Lightbulb className="w-5 h-5 text-[#7A7A7A]" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-[#FA7E70] bg-[#FA7E70]/10';
      case 'medium':
        return 'border-[#F4BE9D] bg-[#F4BE9D]/10';
      default:
        return 'border-[#B6EBF7] bg-[#B6EBF7]/10';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Hoch';
      case 'medium':
        return 'Mittel';
      default:
        return 'Niedrig';
    }
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsGenerating(false);
      // In real app, this would fetch new recommendations from AI
    }, 2000);
  };

  const handleActionClick = (recommendation: Recommendation) => {
    switch (recommendation.type) {
      case 'timing':
      case 'content':
      case 'format':
        window.dispatchEvent(new CustomEvent('navigate-to-planner'));
        break;
      case 'platform':
      case 'strategy':
        window.dispatchEvent(new CustomEvent('navigate-to-chat'));
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111] flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-[var(--vektrus-ai-violet)]" />
          <span>KI-Empfehlungen</span>
        </h2>
        
        <button
          onClick={handleGenerateNew}
          disabled={isGenerating}
          className={`flex items-center space-x-2 px-4 py-2 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 ${
            isGenerating
              ? 'bg-[#B6EBF7]/20 text-[#7A7A7A] cursor-not-allowed'
              : 'bg-[var(--vektrus-ai-violet)] hover:bg-[#6b5ce0] text-white hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-[var(--vektrus-ai-violet)] border-t-transparent rounded-full animate-spin" />
              <span>Analysiert...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Neue Analyse</span>
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Header */}
      <div className="bg-gradient-to-r from-[var(--vektrus-ai-violet)]/20 to-[#B6EBF7]/20 rounded-[var(--vektrus-radius-md)] p-6 border border-[var(--vektrus-ai-violet)]">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[var(--vektrus-ai-violet)] rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111111] mb-2">
              🧠 Vektrus KI-Analyse
            </h3>
            <p className="text-[#7A7A7A] leading-relaxed">
              Basierend auf deinen letzten {filters.timeRange === '7d' ? '7 Tagen' : '30 Tagen'} Performance-Daten 
              habe ich {recommendations.length} personalisierte Optimierungsvorschläge für dich identifiziert.
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-[#49D69E] rounded-full"></div>
                <span className="text-[#7A7A7A]">
                  {recommendations.filter(r => r.priority === 'high').length} Hohe Priorität
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-[#F4BE9D] rounded-full"></div>
                <span className="text-[#7A7A7A]">
                  {recommendations.filter(r => r.actionable).length} Sofort umsetzbar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.id}
            className={`bg-white rounded-[var(--vektrus-radius-md)] p-6 border-2 transition-all duration-200 hover:shadow-card ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  {getTypeIcon(rec.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-[#111111]">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-[#FA7E70] text-white' :
                      rec.priority === 'medium' ? 'bg-[#F4BE9D] text-[#111111]' :
                      'bg-[#B6EBF7] text-[#111111]'
                    }`}>
                      {getPriorityLabel(rec.priority)}
                    </span>
                  </div>
                  
                  <p className="text-[#7A7A7A] leading-relaxed mb-3">
                    {rec.description}
                  </p>

                  {/* Data Metrics */}
                  {rec.data && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="text-center p-2 bg-[#F4FCFE] rounded">
                        <div className="text-xs text-[#7A7A7A]">Metrik</div>
                        <div className="font-medium text-[#111111] text-sm">{rec.data.metric}</div>
                      </div>
                      <div className="text-center p-2 bg-[#F4FCFE] rounded">
                        <div className="text-xs text-[#7A7A7A]">Verbesserung</div>
                        <div className="font-bold text-[#49D69E] text-sm">{rec.data.improvement}</div>
                      </div>
                      <div className="text-center p-2 bg-[#F4FCFE] rounded">
                        <div className="text-xs text-[#7A7A7A]">Zeitrahmen</div>
                        <div className="font-medium text-[#111111] text-sm">{rec.data.timeframe}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm text-[#7A7A7A] mb-1">KI-Konfidenz</div>
                <div className="text-lg font-bold text-[#111111]">{rec.confidence}%</div>
                <div className="w-16 bg-[#B6EBF7]/20 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-[#49D69E] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Impact & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-[rgba(73,183,227,0.10)]">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-[#7A7A7A]">Erwarteter Impact:</span>
                  <span className="font-bold text-[#49D69E] ml-2">{rec.impact}</span>
                </div>
              </div>

              {rec.actionable && rec.cta && (
                <button
                  onClick={() => handleActionClick(rec)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 hover:scale-105"
                >
                  <span>{rec.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-[var(--vektrus-ai-violet)]/10 to-[#B6EBF7]/10 rounded-[var(--vektrus-radius-md)] p-6 border border-[var(--vektrus-ai-violet)]">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-[var(--vektrus-ai-violet)] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🧠</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#111111] mb-2">KI-Gesamteinschätzung</h4>
            <p className="text-[#7A7A7A] leading-relaxed mb-4">
              Deine Content-Strategie zeigt starke Performance-Trends. Besonders Video-Content und authentische 
              Behind-the-Scenes Inhalte resonieren gut mit deiner Community. Fokussiere dich auf diese Stärken 
              und optimiere deine Posting-Zeiten für maximalen Impact.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
                <div className="text-sm font-medium text-[#111111] mb-1">🎯 Nächster Schritt</div>
                <div className="text-xs text-[#7A7A7A]">
                  Plane 2 Behind-the-Scenes Reels für kommende Woche
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
                <div className="text-sm font-medium text-[#111111] mb-1">⏰ Timing-Optimierung</div>
                <div className="text-xs text-[#7A7A7A]">
                  Freitag 18:00 für maximale Reichweite nutzen
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
                <div className="text-sm font-medium text-[#111111] mb-1">📈 Potenzial</div>
                <div className="text-xs text-[#7A7A7A]">
                  +45% Gesamtperformance möglich
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h4 className="font-medium text-[#111111] mb-4">⚡ Empfehlungen sofort umsetzen</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-planner'))}
            className="flex items-center justify-center space-x-2 p-4 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:scale-105"
          >
            <Target className="w-5 h-5" />
            <span>Optimierten Wochenplan erstellen</span>
          </button>
          
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-chat'))}
            className="flex items-center justify-center space-x-2 p-4 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-[#7A7A7A] hover:text-[#111111] rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200"
          >
            <Lightbulb className="w-5 h-5" />
            <span>KI nach Details fragen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendations;