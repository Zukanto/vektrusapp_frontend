import React, { useState } from 'react';
import { Check, ArrowRight, PartyPopper } from 'lucide-react';

const OnboardingChecklist: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    account: true,
    content: false,
    post: false,
    insights: false
  });

  const checklistItems = [
    {
      id: 'account',
      title: 'Konto verknüpft',
      description: 'Social Media Accounts verbinden',
      completed: checkedItems.account
    },
    {
      id: 'content',
      title: 'Contentplan erstellt',
      description: 'Ersten Contentplan generieren',
      completed: checkedItems.content
    },
    {
      id: 'post',
      title: 'Ersten Post geplant',
      description: 'Ersten Beitrag einplanen',
      completed: checkedItems.post
    },
    {
      id: 'insights',
      title: 'Insights geöffnet',
      description: 'Analytics Dashboard erkunden',
      completed: checkedItems.insights
    }
  ];

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.10)] shadow-sm sticky top-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#111111] mb-2">Erste Schritte</h3>
        <p className="text-sm text-[#7A7A7A] mb-4">
          Vervollständige dein Setup für die beste Vektrus-Erfahrung
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#111111]">Fortschritt</span>
            <span className="text-sm text-[#7A7A7A]">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-[#B6EBF7]/40 rounded-full h-2">
            <div
              className="bg-[#49D69E] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-[var(--vektrus-radius-sm)] transition-all duration-200 ${
              item.completed ? 'bg-[#F4FCFE] border border-[#B6EBF7]' : 'hover:bg-[#F4FCFE]'
            }`}
          >
            <button
              onClick={() => toggleItem(item.id)}
              className={`w-5 h-5 rounded-[var(--vektrus-radius-sm)] border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5 ${
                item.completed
                  ? 'bg-[#49D69E] border-[#49D69E]'
                  : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
              }`}
            >
              {item.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  item.completed ? 'text-[#111111] line-through' : 'text-[#111111]'
                }`}>
                  {item.title}
                </h4>
                {!item.completed && (
                  <button className="text-[#49B7E3] hover:text-[#49B7E3]/80 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className={`text-xs mt-1 ${
                item.completed ? 'text-[#7A7A7A] line-through' : 'text-[#7A7A7A]'
              }`}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {completedCount === totalCount && (
        <div className="mt-6 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7] text-center">
          <p className="text-sm font-medium text-[#49D69E] mb-2 flex items-center justify-center gap-1.5"><PartyPopper className="w-4 h-4" /> Setup abgeschlossen!</p>
          <p className="text-xs text-[#7A7A7A]">Du bist bereit, mit Vektrus durchzustarten!</p>
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklist;