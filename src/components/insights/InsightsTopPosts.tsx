import React, { useState } from 'react';
import { RefreshCcw, ExternalLink, Image as ImageIcon, Calendar, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { InsightCard, PLATFORM_CONFIG, FORMAT_LABELS, TIER_CONFIG, formatNumber } from './insightsHelpers';
import type { TopPost } from '../../hooks/useAnalyticsData';

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'IG',
  linkedin: 'LI',
  facebook: 'FB',
  tiktok: 'TT',
};

interface PostCardProps {
  post: TopPost;
  rank: number;
  isRecycle?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, rank, isRecycle }) => {
  const [hovered, setHovered] = useState(false);
  const [recycleToast, setRecycleToast] = useState(false);

  const platform = PLATFORM_CONFIG[post.platform] || { label: post.platform, color: '#7A7A7A' };
  const tier = TIER_CONFIG[post.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG['medium'];

  const handleRecycle = () => {
    setRecycleToast(true);
    setTimeout(() => setRecycleToast(false), 2500);
  };

  return (
    <div
      className="relative flex flex-col rounded-[var(--vektrus-radius-lg)] overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white',
        boxShadow: hovered ? 'var(--vektrus-shadow-card)' : 'var(--vektrus-shadow-subtle)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{ height: 160, background: post.thumbnail ? 'transparent' : `${platform.color}18` }}
      >
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt="Post thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={40} style={{ color: platform.color, opacity: 0.4 }} />
          </div>
        )}

        <div
          className="absolute top-2 left-2 rounded-full flex items-center justify-center font-bold text-white"
          style={{ width: 28, height: 28, background: '#49B7E3', fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 13 }}
        >
          {rank}
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <span
            className="rounded-full text-[11px] font-semibold px-2 py-0.5 text-white"
            style={{ background: platform.color, fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {PLATFORM_ICONS[post.platform] || platform.label}
          </span>
          <span
            className="rounded-full text-[11px] font-medium px-2 py-0.5"
            style={{
              background: 'rgba(0,0,0,0.45)',
              color: 'white',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {FORMAT_LABELS[post.format] || 'Post'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p
            className="font-medium leading-snug line-clamp-2"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111' }}
          >
            {post.content}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>
              <Calendar size={11} /> {post.date}
            </span>
            {post.original_date_label && (
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>
                · {post.original_date_label}
              </span>
            )}
          </div>
        </div>

        {post.recycle_reason && (
          <div
            className="rounded-[var(--vektrus-radius-sm)] px-3 py-2 text-[12px]"
            style={{
              background: 'rgba(124,108,242,0.07)',
              color: '#7C6CF2',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            <Sparkles size={12} className="flex-shrink-0" /> {post.recycle_reason}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div
              className="font-bold"
              style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
            >
              {post.reach > 0 ? formatNumber(post.reach) : '—'}
            </div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>Reichweite</div>
          </div>
          <div>
            <div
              className="font-bold"
              style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#49D69E' }}
            >
              {post.engagement_rate.toFixed(2)}%
            </div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>Engagement Rate</div>
          </div>
        </div>

        <div className="flex items-center gap-3" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
          <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments}</span>
          <span className="flex items-center gap-1"><Share2 size={12} /> {post.shares}</span>
          <span
            className="ml-auto flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded"
            style={{ background: `${tier.dot}18`, color: tier.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tier.dot, display: 'inline-block' }} />
            {tier.label}
          </span>
        </div>

        <div className="flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid #F5F5F5' }}>
          <button
            onClick={handleRecycle}
            className="flex items-center gap-1.5 rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-all duration-150 flex-1 justify-center"
            style={{
              padding: '8px',
              fontFamily: 'Inter, system-ui, sans-serif',
              border: isRecycle ? 'none' : '1.5px solid #49B7E3',
              background: isRecycle ? '#49B7E3' : 'transparent',
              color: isRecycle ? 'white' : '#49B7E3',
            }}
          >
            <RefreshCcw size={13} />
            Recyceln
          </button>
          {post.post_url && (
            <a
              href={post.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium"
              style={{
                padding: '8px 12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                border: '1.5px solid #E0E0E0',
                color: '#7A7A7A',
              }}
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {recycleToast && (
          <div
            className="absolute inset-x-4 bottom-4 rounded-[var(--vektrus-radius-md)] text-center text-[13px] font-medium py-2"
            style={{
              background: 'rgba(124,108,242,0.12)',
              color: '#7C6CF2',
              fontFamily: 'Inter, system-ui, sans-serif',
              zIndex: 10,
            }}
          >
            <Sparkles size={13} className="inline mr-1" /> Funktion kommt bald
          </div>
        )}
      </div>
    </div>
  );
};

interface InsightsTopPostsProps {
  topPosts: TopPost[];
  recyclingPosts: TopPost[];
}

const InsightsTopPosts: React.FC<InsightsTopPostsProps> = ({ topPosts, recyclingPosts }) => {
  const [activeTab, setActiveTab] = useState<'top' | 'recycle'>('top');

  const tabs = [
    { id: 'top', label: 'Top Posts', subtitle: 'Deine erfolgreichsten Inhalte' },
    { id: 'recycle', label: 'Recycling-Vorschläge', subtitle: 'Posts die vor 30+ Tagen überdurchschnittlich performt haben' },
  ];

  const posts = activeTab === 'top' ? topPosts : recyclingPosts;

  return (
    <InsightCard>
      <div className="flex items-center gap-6 mb-1" style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'top' | 'recycle')}
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#49B7E3' : '#7A7A7A',
              borderBottom: activeTab === tab.id ? '2px solid #49B7E3' : '2px solid transparent',
              paddingBottom: 12,
              marginBottom: -1,
              background: 'transparent',
              transition: 'color 150ms, border-color 150ms',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p
        className="mt-3 mb-4"
        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#7A7A7A' }}
      >
        {tabs.find(t => t.id === activeTab)?.subtitle}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <PostCard
            key={i}
            post={post}
            rank={i + 1}
            isRecycle={activeTab === 'recycle'}
          />
        ))}
      </div>
    </InsightCard>
  );
};

export default InsightsTopPosts;
