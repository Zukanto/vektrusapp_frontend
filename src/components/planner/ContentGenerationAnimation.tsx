import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Calendar, MessageSquare, Hash, Image, Clock, Target, CheckCircle, Instagram, Linkedin, Music2, Facebook, Twitter, Globe, Megaphone, Heart, DollarSign, Rocket, Users } from 'lucide-react';

interface ContentGenerationAnimationProps {
  onComplete: () => void;
  wizardData: {
    goal: string;
    platforms: string[];
    frequency: number;
    theme?: string;
    tone?: string;
  };
}

const ContentGenerationAnimation: React.FC<ContentGenerationAnimationProps> = ({ 
  onComplete, 
  wizardData 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const generationSteps = [
    {
      id: 'analyzing',
      title: 'Analysiere deine Präferenzen',
      description: 'Ziel, Plattformen und Tonalität werden verarbeitet...',
      icon: Target,
      color: '#49B7E3',
      duration: 1500
    },
    {
      id: 'content',
      title: 'Erstelle Content-Ideen',
      description: 'KI generiert personalisierte Post-Inhalte...',
      icon: MessageSquare,
      color: '#7C6CF2',
      duration: 2000
    },
    {
      id: 'timing',
      title: 'Optimiere Posting-Zeiten',
      description: 'Beste Zeiten basierend auf deiner Audience...',
      icon: Clock,
      color: '#49D69E',
      duration: 1200
    },
    {
      id: 'hashtags',
      title: 'Generiere Hashtags',
      description: 'Relevante Hashtags für jede Plattform...',
      icon: Hash,
      color: '#F4BE9D',
      duration: 1000
    },
    {
      id: 'visuals',
      title: 'Wähle passende Visuals',
      description: 'Bildvorschläge aus deiner Mediathek...',
      icon: Image,
      color: '#B6EBF7',
      duration: 1500
    },
    {
      id: 'finalizing',
      title: 'Finalisiere deinen Plan',
      description: 'Alles wird zusammengestellt...',
      icon: CheckCircle,
      color: '#49D69E',
      duration: 800
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < generationSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        setProgress(((currentStep + 1) / generationSteps.length) * 100);
      } else {
        // Animation complete
        setTimeout(onComplete, 500);
      }
    }, generationSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const currentStepData = generationSteps[currentStep];
  const IconComponent = currentStepData.icon;

  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'tiktok': return <Music2 {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      default: return <Globe {...iconProps} />;
    }
  };

  const getGoalIcon = (goal: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (goal) {
      case 'awareness': return <Megaphone {...iconProps} />;
      case 'engagement': return <Heart {...iconProps} />;
      case 'leads': return <Target {...iconProps} />;
      case 'sales': return <DollarSign {...iconProps} />;
      case 'launch': return <Rocket {...iconProps} />;
      case 'community': return <Users {...iconProps} />;
      default: return <Target {...iconProps} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-[rgba(73,183,227,0.18)]">
          <div className="w-20 h-20 bg-gradient-to-br from-[#B6EBF7] to-[var(--vektrus-ai-violet)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#111111] mb-2">
            Vektrus KI arbeitet für dich
          </h2>
          <p className="text-[#7A7A7A]">
            Dein personalisierter Wochenplan wird erstellt...
          </p>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#111111]">Fortschritt</span>
            <span className="text-sm text-[#7A7A7A]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[#B6EBF7]/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#49B7E3] to-[var(--vektrus-ai-violet)] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div 
              className="w-12 h-12 rounded-[var(--vektrus-radius-md)] flex items-center justify-center animate-pulse"
              style={{ backgroundColor: `${currentStepData.color}20` }}
            >
              <IconComponent 
                className="w-6 h-6 animate-bounce" 
                style={{ color: currentStepData.color }} 
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#111111] mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-[#7A7A7A] leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Context Summary */}
          <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-4 border border-[#B6EBF7] mb-4">
            <h4 className="font-medium text-[#111111] mb-3">📋 Deine Vorgaben:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getGoalIcon(wizardData.goal)}</span>
                <div>
                  <div className="text-[#7A7A7A]">Ziel:</div>
                  <div className="font-medium text-[#111111] capitalize">{wizardData.goal}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg">📅</span>
                <div>
                  <div className="text-[#7A7A7A]">Frequenz:</div>
                  <div className="font-medium text-[#111111]">{wizardData.frequency}x/Woche</div>
                </div>
              </div>
              
              <div className="col-span-2">
                <div className="text-[#7A7A7A] mb-1">Plattformen:</div>
                <div className="flex items-center space-x-2">
                  {wizardData.platforms.map(platform => (
                    <span key={platform} className="text-lg" title={platform}>
                      {getPlatformIcon(platform)}
                    </span>
                  ))}
                  <span className="text-sm font-medium text-[#111111]">
                    ({wizardData.platforms.length} ausgewählt)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Generation Steps Preview */}
          <div>
            <div className="space-y-2">
              {generationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-2 rounded-[var(--vektrus-radius-sm)] transition-all duration-300 ${
                    index < currentStep 
                      ? 'bg-[#49D69E]/10 text-[#49D69E]' 
                      : index === currentStep 
                      ? 'bg-[#B6EBF7]/20 text-[#49B7E3]' 
                      : 'text-[#7A7A7A]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index < currentStep 
                      ? 'bg-[#49D69E]' 
                      : index === currentStep 
                      ? 'bg-[#49B7E3]' 
                      : 'bg-[#B6EBF7]/20'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : index === currentStep ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <span className="text-xs font-bold text-[#7A7A7A]">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                  {index === currentStep && (
                    <div className="flex space-x-1 ml-auto">
                      <div className="w-1 h-1 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-[#49B7E3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerationAnimation;