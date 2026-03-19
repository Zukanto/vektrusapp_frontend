import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { topPosts } from './dashboardData';

const PlatformIcon: React.FC<{ platform: string; size?: number }> = ({ platform, size = 20 }) => {
  if (platform === 'linkedin') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#0077B5" />
        <path d="M7 10h2v7H7v-7zm1-3a1.1 1.1 0 1 1 0 2.2A1.1 1.1 0 0 1 8 7zm4 3h1.9v.96h.03C14.28 10.57 15.16 10 16.3 10c2.07 0 2.45 1.36 2.45 3.13V17h-2v-3.45c0-.82-.01-1.88-1.14-1.88-1.15 0-1.32.9-1.32 1.82V17H12v-7z" fill="white" />
      </svg>
    );
  }
  if (platform === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="ig-top-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#ffd879" />
            <stop offset="20%" stopColor="#f9943b" />
            <stop offset="50%" stopColor="#e1306c" />
            <stop offset="80%" stopColor="#833ab4" />
            <stop offset="100%" stopColor="#405de6" />
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-top-grad)" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
      </svg>
    );
  }
  if (platform === 'facebook') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
        <path d="M13.5 8.5H15V6.5h-1.6C11.9 6.5 11 7.4 11 8.8V10H9.5v2H11v5.5h2V12h1.5l.3-2H13v-.9c0-.4.2-.6.5-.6z" fill="white" />
      </svg>
    );
  }
  return null;
};

const maxER = Math.max(...topPosts.map(p => p.engagementRate));

const DashTopPosts: React.FC = () => {
  return (
    <div className="bg-white rounded-[var(--vektrus-radius-lg)] p-6 h-full flex flex-col" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <h3
        className="font-semibold text-lg mb-4"
        style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
      >
        Top Posts der letzten 14 Tage
      </h3>

      <div className="flex flex-col flex-1 divide-y" style={{ borderColor: '#F0F0F0' }}>
        {topPosts.map((post, i) => {
          const barWidth = (post.engagementRate / maxER) * 100;
          return (
            <div
              key={i}
              className="py-4 first:pt-0 last:pb-0 cursor-default rounded-[var(--vektrus-radius-sm)] px-2 -mx-2 transition-colors duration-150 hover:bg-[#F4FCFE]"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <PlatformIcon platform={post.platform} size={16} />
                <span className="text-[12px] capitalize font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
                  {post.platform} · {post.date}
                </span>
              </div>
              <p
                className="text-sm mb-2 leading-snug"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  color: '#111111',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.content}
              </p>
              <div className="flex items-center gap-4 mb-2">
                <span className="flex items-center gap-1 text-[13px]" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
                  <Heart size={12} />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-[13px]" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
                  <MessageCircle size={12} />
                  {post.comments}
                </span>
                <span className="flex items-center gap-1 text-[13px]" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#7A7A7A' }}>
                  <Share2 size={12} />
                  {post.shares}
                </span>
                <span className="ml-auto text-[13px] font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#49D69E' }}>
                  {post.engagementRate}% ER
                </span>
              </div>
              <div className="h-1 rounded-full w-full" style={{ background: '#F0F0F0' }}>
                <div
                  className="h-1 rounded-full transition-all duration-700"
                  style={{ width: `${barWidth}%`, background: '#49D69E' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashTopPosts;
