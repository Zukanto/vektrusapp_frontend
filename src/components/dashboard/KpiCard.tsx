import React from 'react';
import { DivideIcon as LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: 'positive' | 'negative' | 'neutral';
  color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color 
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-[#49D69E]" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-[#FA7E70]" />;
      default:
        return <Minus className="w-4 h-4 text-[#F4BE9D]" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-[#49D69E]';
      case 'negative':
        return 'text-[#FA7E70]';
      default:
        return 'text-[#F4BE9D]';
    }
  };

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.10)] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="font-medium text-[#7A7A7A] text-sm">{title}</h3>
          </div>
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="space-y-1">
        <p className={`text-2xl font-bold ${getTrendColor()}`}>
          {value}
        </p>
        <p className="text-sm text-[#7A7A7A]">{description}</p>
      </div>
    </div>
  );
};

export default KpiCard;