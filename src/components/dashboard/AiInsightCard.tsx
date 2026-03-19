import React from 'react';
import { Lightbulb, ArrowRight, MessageSquare, Sparkles, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import { DEMO_AI_INSIGHTS } from '../../services/demoData';

const AiInsightCard: React.FC = () => {
  const mainInsight = DEMO_AI_INSIGHTS[0];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#111111]">KI-Empfehlungen</h2>

      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border-gradient-ai ai-active shadow-subtle">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 pulse-gradient-icon rounded-[var(--vektrus-radius-md)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#111111] mb-2 flex items-center gap-2">
              {mainInsight.type === 'positive' && <Target className="w-4 h-4 text-[#49D69E] flex-shrink-0" />}
              {mainInsight.type === 'recommendation' && <Lightbulb className="w-4 h-4 text-[#49B7E3] flex-shrink-0" />}
              {mainInsight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#FA7E70] flex-shrink-0" />}
              <span>{mainInsight.title}</span>
            </h3>
            <p className="text-[#7A7A7A] leading-relaxed">
              {mainInsight.description}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-planner'))}
            className="w-full flex items-center justify-center space-x-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] py-3 px-4 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200 hover:shadow-lg"
          >
            <span>Jetzt einplanen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-chat'))}
            className="w-full flex items-center justify-center space-x-2 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 text-[#7A7A7A] hover:text-[#111111] py-3 px-4 rounded-[var(--vektrus-radius-md)] font-medium transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mehr Empfehlungen</span>
          </button>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.10)] shadow-sm">
        <h3 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#49B7E3]" />
          <span>Wöchentliche Insights</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
            <div>
              <p className="text-sm font-medium text-[#111111]">Beste Posting-Zeit</p>
              <p className="text-xs text-[#7A7A7A]">18:00 - 20:00 Uhr</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#49D69E]">+23%</p>
              <p className="text-xs text-[#7A7A7A]">Engagement</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
            <div>
              <p className="text-sm font-medium text-[#111111]">Top Content-Typ</p>
              <p className="text-xs text-[#7A7A7A]">Video-Posts</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#49D69E]">+45%</p>
              <p className="text-xs text-[#7A7A7A]">Reichweite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsightCard;