import React from 'react';
import { Crown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';

const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, error, getSubscriptionPlan, isActive, isPastDue, isCanceled } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)] animate-pulse">
        <div className="h-4 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] w-1/3 mb-2"></div>
        <div className="h-3 bg-[#B6EBF7]/20 rounded-[var(--vektrus-radius-sm)] w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[#FA7E70] text-center">
        <AlertTriangle className="w-6 h-6 text-[#FA7E70] mx-auto mb-2" />
        <p className="text-sm text-[#FA7E70]">Fehler beim Laden der Abo-Daten</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#F4FCFE] rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-[#111111]">Kein aktives Abo</p>
            <p className="text-sm text-[#7A7A7A]">Upgrade für alle Features</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = getSubscriptionPlan();
  const getStatusIcon = () => {
    if (isActive()) return <CheckCircle className="w-5 h-5 text-[#49D69E]" />;
    if (isPastDue()) return <AlertTriangle className="w-5 h-5 text-[#F4BE9D]" />;
    if (isCanceled()) return <AlertTriangle className="w-5 h-5 text-[#FA7E70]" />;
    return <Clock className="w-5 h-5 text-[#7A7A7A]" />;
  };

  const getStatusText = () => {
    switch (subscription.subscription_status) {
      case 'active':
        return 'Aktiv';
      case 'trialing':
        return 'Testphase';
      case 'past_due':
        return 'Zahlung überfällig';
      case 'canceled':
        return 'Gekündigt';
      case 'incomplete':
        return 'Unvollständig';
      default:
        return 'Unbekannt';
    }
  };

  const getStatusColor = () => {
    if (isActive()) return 'text-[#49D69E]';
    if (isPastDue()) return 'text-[#F4BE9D]';
    if (isCanceled()) return 'text-[#FA7E70]';
    return 'text-[#7A7A7A]';
  };

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-4 border border-[rgba(73,183,227,0.18)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#B6EBF7] rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-[#49B7E3]" />
          </div>
          <div>
            <p className="font-medium text-[#111111]">
              {plan?.name || 'Vektrus Plan'}
            </p>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        {subscription.current_period_end && (
          <div className="text-right">
            <p className="text-xs text-[#7A7A7A]">
              {subscription.cancel_at_period_end ? 'Endet am' : 'Verlängert am'}
            </p>
            <p className="text-sm font-medium text-[#111111]">
              {new Date(subscription.current_period_end * 1000).toLocaleDateString('de-DE')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;