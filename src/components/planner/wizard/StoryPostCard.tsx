import React from 'react';
import { Smartphone, AlertTriangle, Theater, Clock } from 'lucide-react';
import { GeneratedPost, StoryMood } from './types';
import SocialIcon, { getPlatformLabel } from '../../ui/SocialIcon';

interface StoryPostCardProps {
  post: GeneratedPost;
  index: number;
}

const MOOD_CONFIG: Record<StoryMood, { label: string; bg: string; text: string }> = {
  energetic: { label: 'energetisch', bg: 'bg-orange-100', text: 'text-orange-700' },
  calm: { label: 'ruhig', bg: 'bg-blue-100', text: 'text-blue-700' },
  playful: { label: 'verspielt', bg: 'bg-pink-100', text: 'text-pink-700' },
  professional: { label: 'professionell', bg: 'bg-[#F4FCFE]', text: 'text-[#111111]' },
  urgent: { label: 'dringend', bg: 'bg-red-100', text: 'text-red-700' },
};

const StoryPostCard: React.FC<StoryPostCardProps> = ({ post, index }) => {
  const isTeaser = post.contentFormat === 'story_teaser';
  const isStandalone = post.contentFormat === 'story_standalone';

  const textOverlay = post.hook || '';
  const subtext = post.body || '';
  const mood: StoryMood = 'professional';
  const moodCfg = MOOD_CONFIG[mood];

  const isPending = post.designStatus === 'pending' || post.designStatus === 'regenerating';
  const isFailed = post.designStatus === 'failed_generation' || post.designStatus === 'failed_timeout' ||
    post.designStatus === 'failed_quality' || post.designStatus === 'failed_download';
  const hasImage = post.designStatus === 'success' && !!post.designImageUrl;

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <SocialIcon platform={post.platform} size={20} branded={true} />
          <span className="text-xs font-medium text-[#111111]">{getPlatformLabel(post.platform)}</span>
          {isTeaser ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold bg-amber-100 text-amber-700">
              <Smartphone className="w-2.5 h-2.5" /> Story Teaser
            </span>
          ) : isStandalone ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold bg-pink-100 text-pink-700">
              <Smartphone className="w-2.5 h-2.5" /> Story
            </span>
          ) : null}
          <span className="text-xs text-[#7A7A7A]">Post {index + 1}</span>
        </div>
        <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> 24h</span>
      </div>

      {/* 9:16 image area */}
      <div className="px-4">
        <div
          className="w-full rounded-[var(--vektrus-radius-sm)] overflow-hidden bg-[#F4FCFE] flex items-center justify-center"
          style={{ aspectRatio: '9/16', maxHeight: 320 }}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <div className="w-8 h-8 border-2 border-[#49B7E3] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#7A7A7A]">Story wird generiert...</p>
            </div>
          ) : isFailed ? (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="w-6 h-6 text-[#FA7E70]" />
              <p className="text-xs text-[#7A7A7A]">Story-Design fehlgeschlagen</p>
            </div>
          ) : hasImage ? (
            <img
              src={post.designImageUrl!}
              alt="Story Design"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Smartphone className="w-8 h-8 text-[#7A7A7A]" />
              <p className="text-xs text-gray-400">Story Preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Content info */}
      <div className="px-4 pt-3 pb-4 space-y-2">
        {textOverlay && (
          <div>
            <p className="text-[10px] text-gray-400 font-medium mb-0.5">Text-Overlay:</p>
            <p className="text-base font-semibold text-[#111111] leading-tight">{textOverlay}</p>
          </div>
        )}
        {subtext && (
          <p className="text-sm text-[#7A7A7A] leading-snug">{subtext}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${moodCfg.bg} ${moodCfg.text}`}>
            <Theater className="w-2.5 h-2.5" /> {moodCfg.label}
          </span>
          {post.scheduledDate && (
            <span className="text-[10px] text-gray-400">
              {post.scheduledDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · {post.scheduledTime}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPostCard;
