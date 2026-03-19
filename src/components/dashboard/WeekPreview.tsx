import React from 'react';
import { Calendar, Plus, Instagram, Linkedin, Facebook, Music2, Twitter } from 'lucide-react';
import { DEMO_WEEK_PREVIEW } from '../../services/demoData';

const WeekPreview: React.FC = () => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const postsForDay = DEMO_WEEK_PREVIEW.filter(post => {
      const postDate = new Date(post.date);
      return postDate.getDate() === date.getDate() &&
             postDate.getMonth() === date.getMonth();
    });

    return {
      day: dayNames[date.getDay()],
      date: date.getDate().toString(),
      posts: postsForDay.map(post => ({
        platform: post.platform,
        status: post.status === 'scheduled' ? 'planned' : post.status === 'draft' ? 'pending' : 'planned'
      }))
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-[#49D69E]';
      case 'pending':
        return 'bg-[#F4BE9D]';
      case 'failed':
        return 'bg-[#FA7E70]';
      default:
        return 'bg-[rgba(73,183,227,0.25)]';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const iconProps = { className: "w-3.5 h-3.5" };
    switch (platform) {
      case 'instagram': return <Instagram {...iconProps} />;
      case 'tiktok': return <Music2 {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'twitter': return <Twitter {...iconProps} />;
      default: return <Calendar {...iconProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111] flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-[#49B7E3]" />
          <span>Geplante Inhalte</span>
        </h2>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-planner'))}
          className="flex items-center space-x-2 px-4 py-2 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-md)] transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-planner'))}>
            Zur Planungsansicht →
          </span>
        </button>
      </div>

      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.10)] shadow-sm">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="mb-3">
                <p className="text-sm font-medium text-[#7A7A7A] mb-1">{day.day}</p>
                <p className="text-lg font-semibold text-[#111111]">{day.date}</p>
              </div>
              
              <div className="space-y-2 min-h-[80px]">
                {day.posts.length > 0 ? (
                  day.posts.map((post, postIndex) => (
                    <div
                      key={postIndex}
                      className={`w-full h-8 ${getStatusColor(post.status)} rounded-[var(--vektrus-radius-sm)] flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                      title={`${post.platform} - ${post.status}`}
                    >
                      {getPlatformIcon(post.platform)}
                    </div>
                  ))
                ) : (
                  <div className="w-full h-8 border-2 border-dashed border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center cursor-pointer hover:border-[#B6EBF7] hover:bg-[#B6EBF7]/10 transition-colors group">
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#49B7E3]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[rgba(73,183,227,0.10)]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#49D69E] rounded-full"></div>
                <span className="text-[#7A7A7A]">Geplant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#F4BE9D] rounded-full"></div>
                <span className="text-[#7A7A7A]">Ausstehend</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#FA7E70] rounded-full"></div>
                <span className="text-[#7A7A7A]">Fehlgeschlagen</span>
              </div>
            </div>
            <button className="text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium">
              Zur Planungsansicht →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekPreview;