import React from 'react';
import { Crown, Eye, Heart, MessageSquare, Share, ExternalLink, Calendar } from 'lucide-react';
import { DEMO_TOP_POSTS } from '../../services/demoData';

interface TopPostsProps {
  filters: any;
}

interface TopPost {
  id: string;
  title: string;
  platform: string;
  contentType: 'post' | 'reel' | 'carousel' | 'story';
  thumbnailUrl: string;
  publishDate: Date;
  metrics: {
    reach: number;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    clicks?: number;
  };
  performance: {
    reachIncrease: number;
    engagementRate: number;
  };
}

const TopPosts: React.FC<TopPostsProps> = ({ filters }) => {
  const topPosts: TopPost[] = DEMO_TOP_POSTS.map(post => ({
    id: post.id,
    title: post.title,
    platform: post.platform,
    contentType: post.contentType,
    thumbnailUrl: post.thumbnailUrl,
    publishDate: post.publishedAt,
    metrics: {
      reach: post.metrics.reach,
      engagement: post.metrics.likes + post.metrics.comments + post.metrics.shares,
      likes: post.metrics.likes,
      comments: post.metrics.comments,
      shares: post.metrics.shares,
      clicks: 0
    },
    performance: {
      reachIncrease: 42.5,
      engagementRate: post.metrics.engagement
    }
  }));

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📷',
      linkedin: '💼',
      tiktok: '🎵',
      facebook: '👥',
      twitter: '🐦'
    };
    return icons[platform] || '📱';
  };

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      post: '📝',
      reel: '🎥',
      carousel: '🔄',
      story: '📖'
    };
    return icons[type] || '📝';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleOpenInPlanner = (postId: string) => {
    // Navigate to planner with specific post
    window.dispatchEvent(new CustomEvent('navigate-to-planner', { detail: { postId } }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#111111] flex items-center space-x-2">
          <Crown className="w-5 h-5 text-[#F4BE9D]" />
          <span>Top Posts</span>
        </h2>
        <div className="text-sm text-[#7A7A7A]">
          Deine erfolgreichsten Inhalte der letzten {filters.timeRange === '7d' ? '7 Tage' : '30 Tage'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {topPosts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-200 group"
          >
            {/* Rank Badge */}
            <div className="relative">
              <div className="absolute top-3 left-3 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-[#F4BE9D]' : 
                  index === 1 ? 'bg-[#B6EBF7] text-[#111111]' : 
                  'bg-[#49D69E]'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Platform & Type Badges */}
              <div className="absolute top-3 right-3 z-10 flex space-x-2">
                <div className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-[var(--vektrus-radius-sm)] flex items-center space-x-1">
                  <span>{getPlatformIcon(post.platform)}</span>
                  <span className="capitalize">{post.platform}</span>
                </div>
                <div className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded">
                  {getContentTypeIcon(post.contentType)} {post.contentType}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden">
                <img 
                  src={post.thumbnailUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-[#111111] mb-2 line-clamp-2">
                {post.title}
              </h3>
              
              <div className="flex items-center space-x-2 text-xs text-[#7A7A7A] mb-4">
                <Calendar className="w-3 h-3" />
                <span>{post.publishDate.toLocaleDateString('de-DE')}</span>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Eye className="w-3 h-3 text-[#49B7E3]" />
                    <span className="text-xs text-[#7A7A7A]">Reichweite</span>
                  </div>
                  <div className="font-bold text-[#111111] text-sm">
                    {formatNumber(post.metrics.reach)}
                  </div>
                  <div className="text-xs text-[#49D69E]">
                    +{post.performance.reachIncrease}%
                  </div>
                </div>
                
                <div className="text-center p-2 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Heart className="w-3 h-3 text-[#FA7E70]" />
                    <span className="text-xs text-[#7A7A7A]">Engagement</span>
                  </div>
                  <div className="font-bold text-[#111111] text-sm">
                    {post.performance.engagementRate}%
                  </div>
                  <div className="text-xs text-[#49D69E]">
                    {formatNumber(post.metrics.engagement)} Interaktionen
                  </div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs text-[#7A7A7A] mb-4">
                <div className="text-center">
                  <div className="font-medium text-[#111111]">{formatNumber(post.metrics.likes)}</div>
                  <div>Likes</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-[#111111]">{post.metrics.comments}</div>
                  <div>Kommentare</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-[#111111]">{post.metrics.shares}</div>
                  <div>Shares</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenInPlanner(post.id)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-[#B6EBF7] hover:bg-[#49B7E3] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-all duration-200 hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Im Planner öffnen</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-[var(--vektrus-radius-md)] p-6 border border-[rgba(73,183,227,0.18)]">
        <h3 className="font-semibold text-[#111111] mb-4">🏆 Top-Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <div className="text-sm text-[#7A7A7A] mb-1">Beste Plattform</div>
            <div className="font-bold text-[#111111] flex items-center space-x-2">
              <span>🎵</span>
              <span>TikTok</span>
            </div>
            <div className="text-xs text-[#49D69E] mt-1">+78% Reichweite</div>
          </div>
          
          <div className="p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <div className="text-sm text-[#7A7A7A] mb-1">Bester Content-Typ</div>
            <div className="font-bold text-[#111111] flex items-center space-x-2">
              <span>🎥</span>
              <span>Reels</span>
            </div>
            <div className="text-xs text-[#49D69E] mt-1">6.5% Engagement-Rate</div>
          </div>
          
          <div className="p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <div className="text-sm text-[#7A7A7A] mb-1">Beste Zeit</div>
            <div className="font-bold text-[#111111] flex items-center space-x-2">
              <span>🕕</span>
              <span>18:00 Uhr</span>
            </div>
            <div className="text-xs text-[#49D69E] mt-1">Freitags optimal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPosts;