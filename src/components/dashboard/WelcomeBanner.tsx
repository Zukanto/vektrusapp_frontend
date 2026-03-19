import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const WelcomeBanner: React.FC = () => {
  const { userProfile, user } = useAuth();

  const firstName = userProfile?.first_name || user?.first_name || 'User';

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-8 border border-[rgba(73,183,227,0.10)] shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-4xl">👋</span>
            <div>
              <h1 className="text-3xl font-bold text-[#111111] mb-2">
                Willkommen zurück, {firstName}!
              </h1>
              <p className="text-[#7A7A7A] text-lg">
                Du hast letzte Woche 4 Posts veröffentlicht und 12% mehr Reichweite erzielt.
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#111111]">Wochenplan</span>
              <span className="text-sm text-[#7A7A7A]">3/5 Posts geplant</span>
            </div>
            <div className="w-full bg-[#B6EBF7]/40 rounded-full h-2">
              <div
                className="bg-[#49D69E] h-2 rounded-full transition-all duration-500"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        </div>

        {/* Stats Icon */}
        <div className="hidden lg:flex items-center justify-center w-20 h-20 bg-[#49B7E3] rounded-[var(--vektrus-radius-md)] shadow-md">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;