import React, { useState, useRef, useCallback } from 'react';
import { CircleCheck as CheckCircle, Copy, Download, ChevronDown, ChevronUp, Image as ImageIcon, Calendar, Target, Sparkles, RefreshCw, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import { GeneratedPost, ContentFormat } from './types';
import { WebhookResponse } from '../../../services/contentGenerator';
import SocialIcon, { getPlatformLabel } from '../../ui/SocialIcon';
import RegenerateDesignModal from './RegenerateDesignModal';
import { DesignStatusBanner, DesignSkeleton } from './DesignStatusBadge';
import GenerationProgressBanner from './GenerationProgressBanner';
import { useDesignRegen } from '../../../hooks/useDesignRegen';
import CarouselSlideNavigator, { CarouselExpandedList } from './CarouselSlideNavigator';
import StoryPostCard from './StoryPostCard';

interface PostResultsListProps {
  posts: GeneratedPost[];
  webhookResponse?: WebhookResponse | null;
  onViewInCalendar: () => void;
  onPostUpdate?: (postId: string, updates: Partial<GeneratedPost>) => void;
  pulseStatus?: 'processing' | 'completed' | 'timeout';
  totalExpectedPosts?: number;
  onNavigateToBrandStudio?: () => void;
}

export function getPostImageUrl(post: GeneratedPost): string | undefined {
  if (post.designStatus === 'success' && post.designImageUrl) return post.designImageUrl;
  if (post.designStatus === 'pending' || post.designStatus === 'regenerating') return post.imageUrl;
  if (!post.designStatus && post.applyCI && post.designImageUrl) return post.designImageUrl;
  return post.imageUrl;
}

function scoreLabel(score?: { total: number }) {
  const total = score?.total ?? 0;
  if (total >= 85) return { label: `${total}`, badge: 'bg-green-50 text-green-700', dot: 'bg-green-500' };
  if (total >= 70) return { label: `${total}`, badge: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
  if (total >= 55) return { label: `${total}`, badge: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' };
  return { label: `${total}`, badge: 'bg-[#F4FCFE] text-[#7A7A7A]', dot: 'bg-gray-400' };
}

const PLATFORM_BORDER_COLOR: Record<string, string> = {
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  tiktok: '#010101',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
};

function FormatBadge({ format, slideCount }: { format: ContentFormat; slideCount?: number }) {
  if (format === 'single_image' || !format) return null;

  if (format === 'text_only') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold bg-[#F4FCFE] text-[#7A7A7A]">
        📝 Text
      </span>
    );
  }

  if (format === 'carousel') {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--vektrus-radius-sm)] text-[10px] font-semibold text-white"
        style={{ backgroundColor: '#49B7E3' }}
      >
        🎠 Carousel{slideCount ? ` · ${slideCount} Slides` : ''}
      </span>
    );
  }

  return null;
}

interface PostCardProps {
  post: GeneratedPost;
  index: number;
  onPostUpdate?: (postId: string, updates: Partial<GeneratedPost>) => void;
  onNavigateToBrandStudio?: () => void;
  onOpenRegenModal: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  index,
  onPostUpdate,
  onNavigateToBrandStudio,
  onOpenRegenModal,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [localDesignImageUrl, setLocalDesignImageUrl] = useState<string | undefined>(post.designImageUrl);
  const [localDesignStatus, setLocalDesignStatus] = useState<string | undefined>(post.designStatus);

  const handleRegenSuccess = useCallback((newDesignUrl: string) => {
    setLocalDesignImageUrl(newDesignUrl);
    setLocalDesignStatus('success');
    onPostUpdate?.(post.id, { designImageUrl: newDesignUrl, designStatus: 'success' });
  }, [post.id, onPostUpdate]);

  const { state: regenState, message: regenMessage, trigger: triggerRegen } = useDesignRegen(
    post.id,
    handleRegenSuccess
  );

  const effectiveDesignStatus = localDesignStatus;
  const effectiveDesignImageUrl = localDesignImageUrl;

  const contentFormat: ContentFormat = post.contentFormat || 'single_image';
  const isCarousel = contentFormat === 'carousel';
  const isTextOnly = contentFormat === 'text_only';
  const isStory = contentFormat === 'story_teaser' || contentFormat === 'story_standalone';
  const isSingleImage = !isCarousel && !isTextOnly && !isStory;

  const hasPhoto = !!post.imageUrl;
  const hasDesign = effectiveDesignStatus === 'success' && !!effectiveDesignImageUrl;
  const isLegacyDesign = !effectiveDesignStatus && post.applyCI && !!effectiveDesignImageUrl;
  const showDesign = hasDesign || isLegacyDesign;
  const isPending = effectiveDesignStatus === 'pending' || effectiveDesignStatus === 'regenerating';
  const displayImageUrl = showDesign ? effectiveDesignImageUrl! : (isPending ? undefined : post.imageUrl);
  const downloadUrl = showDesign ? effectiveDesignImageUrl! : post.imageUrl;

  const isFailed = effectiveDesignStatus === 'failed_timeout' ||
    effectiveDesignStatus === 'failed_download' ||
    effectiveDesignStatus === 'failed_generation' ||
    effectiveDesignStatus === 'failed_quality';

  const isNoBrand = effectiveDesignStatus === 'no_brand_profile';
  const isSkipped = effectiveDesignStatus === 'skipped';
  const showNoBrandBadge =
    !!post.imageUrl &&
    !isPending &&
    !showDesign &&
    (!post.applyCI || post.applyCI === undefined) &&
    (effectiveDesignStatus !== 'success');

  const canRegen = (hasPhoto || showDesign) && isSingleImage;
  const needsDesignButton = !showDesign && !isPending && isSingleImage;
  const isRegenLoading = regenState === 'loading' || regenState === 'polling';
  const isRegenNoBrand = regenState === 'no_brand';
  const isRegenSuccess = regenState === 'success';
  const isRegenError = regenState === 'error';

  const eng = scoreLabel(post.contentScore);
  const slideCount = post.carouselSlides?.length;

  const handleCopy = () => {
    const text = [post.hook, post.body, post.cta, post.hashtags.map(h => `#${h}`).join(' ')].filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const platformBorderColor = PLATFORM_BORDER_COLOR[post.platform] || '#E5E7EB';

  if (isStory) {
    return <StoryPostCard post={post} index={index} />;
  }

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] overflow-hidden shadow-subtle">

      {/* Single Image media section */}
      {isSingleImage && (
        <>
          {isPending ? (
            <DesignSkeleton label="Design wird erstellt..." />
          ) : displayImageUrl ? (
            <div className="relative w-full h-44 bg-[#F4FCFE]">
              {post.imageType === 'video' ? (
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!videoRef.current) return;
                    if (videoRef.current.paused) { videoRef.current.play(); setPlayingVideo(true); }
                    else { videoRef.current.pause(); setPlayingVideo(false); }
                  }}
                >
                  <video
                    ref={videoRef}
                    src={`${displayImageUrl}#t=0.1`}
                    className="w-full h-full object-cover"
                    muted playsInline loop preload="metadata"
                    onEnded={() => setPlayingVideo(false)}
                  />
                  {!playingVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-[var(--vektrus-radius-sm)] pointer-events-none">
                    Video
                  </div>
                </div>
              ) : (
                <img
                  src={displayImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}

              {showDesign && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold" style={{ backgroundColor: 'var(--vektrus-ai-violet)' }}>
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Design
                </div>
              )}

              {showNoBrandBadge && (
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span
                    className="text-[11px] font-medium"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      border: '1px solid #D1D5DB',
                      color: '#7A7A7A',
                      padding: '3px 8px',
                      borderRadius: '20px',
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.4',
                    }}
                  >
                    Ohne Markendesign
                  </span>
                  <button
                    onClick={() => onNavigateToBrandStudio?.()}
                    className="text-[11px] font-medium transition-colors hover:underline"
                    style={{
                      color: '#49B7E3',
                      fontFamily: 'Inter, sans-serif',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Stil anpassen →
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {(isFailed || isNoBrand || isSkipped) && (
            <DesignStatusBanner
              status={post.designStatus}
              statusMessage={post.designStatusMessage}
              onBrandStudio={isNoBrand ? onNavigateToBrandStudio : undefined}
            />
          )}

          {needsDesignButton && (
            <div className="px-4 pt-3 pb-0">
              <button
                onClick={triggerRegen}
                disabled={isRegenLoading || isRegenNoBrand}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors w-full justify-center"
                style={{
                  border: '1px solid #49B7E3',
                  color: isRegenLoading || isRegenNoBrand ? '#9CA3AF' : '#49B7E3',
                  background: 'transparent',
                  cursor: isRegenLoading || isRegenNoBrand ? 'not-allowed' : 'pointer',
                }}
              >
                {isRegenLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Wird generiert…</span>
                  </>
                ) : isRegenSuccess ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Design erfolgreich erstellt</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Design neu generieren</span>
                  </>
                )}
              </button>

              {(isRegenError || isRegenNoBrand) && regenMessage && (
                <div className="mt-1.5 flex items-start gap-1.5 px-1">
                  <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-red-500 leading-snug">{regenMessage}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Carousel section */}
      {isCarousel && post.carouselSlides && post.carouselSlides.length > 0 && (
        <div className="px-4 pt-4">
          <CarouselSlideNavigator slides={post.carouselSlides} compact />
        </div>
      )}

      <div className="p-4">
        {/* Header: platform + format badge + score */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <SocialIcon platform={post.platform} size={20} branded={true} />
            <span className="text-xs font-medium text-[#111111]">{getPlatformLabel(post.platform)}</span>
            <FormatBadge format={contentFormat} slideCount={slideCount} />
            <span className="text-xs text-[#7A7A7A]">Post {index + 1}</span>
            <span className="text-xs text-[#7A7A7A]">
              {post.scheduledDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          {post.contentScore && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${eng.badge}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${eng.dot}`} />
              Score {eng.label}
            </div>
          )}
        </div>

        {/* Text-only caption block */}
        {isTextOnly ? (
          <div
            className={`rounded-[var(--vektrus-radius-sm)] p-3 mb-2 border-l-4 ${expanded ? '' : ''}`}
            style={{
              backgroundColor: '#F4FCFE',
              borderLeftColor: platformBorderColor,
            }}
          >
            <p className={`text-sm text-[#111111] leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}>
              {post.hook} {post.body}
            </p>
          </div>
        ) : isCarousel ? (
          /* Carousel caption label + text */
          <div className="mb-2">
            <p className="text-[10px] text-[#7A7A7A] font-medium mb-1">Caption:</p>
            <p className={`text-sm text-[#111111] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {post.hook} {post.body}
            </p>
          </div>
        ) : (
          /* Single image — standard text */
          <p className={`text-sm text-[#111111] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {post.hook} {post.body}
          </p>
        )}

        {post.hashtags.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-1 ${expanded ? '' : 'line-clamp-1 overflow-hidden max-h-6'}`}>
            {post.hashtags.map((h, hi) => (
              <span key={hi} className="text-xs text-[#49B7E3] font-medium">#{h}</span>
            ))}
          </div>
        )}

        {/* Expanded: carousel slide list */}
        {expanded && isCarousel && post.carouselSlides && post.carouselSlides.length > 0 && (
          <CarouselExpandedList
            slides={post.carouselSlides}
            currentSlide={-1}
            onSelect={() => {}}
          />
        )}

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-xs text-[#7A7A7A] hover:text-[#111111] transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? 'Weniger' : 'Mehr anzeigen'}</span>
          </button>
          <div className="flex items-center space-x-2">
            {canRegen && (
              <button
                onClick={() => onOpenRegenModal(post.id)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                style={{ backgroundColor: '#F4FCFE', color: '#49B7E3', border: '1px solid #B6EBF7' }}
                title={showDesign ? 'Design neu generieren' : 'Design generieren'}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{showDesign ? 'Regenerieren' : 'Design'}</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] text-xs font-medium bg-[#F4FCFE] hover:bg-[#F4FCFE] text-[#111111] transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedId ? 'Kopiert!' : 'Kopieren'}</span>
            </button>
            {downloadUrl && isSingleImage && (
              <a
                href={downloadUrl}
                download={`pulse_post_${index + 1}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
                style={{ backgroundColor: '#F4FCFE', color: '#49B7E3', border: '1px solid #B6EBF7' }}
              >
                <Download className="w-3 h-3" />
                <span>Bild</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PostResultsList: React.FC<PostResultsListProps> = ({
  posts,
  webhookResponse,
  onViewInCalendar,
  onPostUpdate,
  pulseStatus,
  totalExpectedPosts,
  onNavigateToBrandStudio,
}) => {
  const [regenModalPostId, setRegenModalPostId] = useState<string | null>(null);

  const imageCount = posts.filter(p => p.imageUrl).length;
  const regenModalPost = regenModalPostId ? posts.find(p => p.id === regenModalPostId) : null;

  const isProcessing = pulseStatus === 'processing';
  const isTimeout = pulseStatus === 'timeout';
  const isCompleted = pulseStatus === 'completed' || (!pulseStatus && posts.length > 0);
  const showProgressBanner = pulseStatus !== undefined;

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-[#49B7E3] to-[#B6EBF7] rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#111111] mb-1">
        {isProcessing ? 'Generierung läuft...' : 'Content erstellt!'}
      </h3>
      <p className="text-sm text-[#7A7A7A] mb-6">
        {posts.length} {posts.length === 1 ? 'Post' : 'Posts'} {isProcessing ? 'bisher erstellt' : 'erfolgreich generiert'}
        {imageCount > 0 ? ` mit ${imageCount} Bildern` : ''}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6 w-full max-w-md">
        <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-3 text-center border border-[#B6EBF7]/40">
          <Target className="w-5 h-5 text-[#49B7E3] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#111111]">{posts.length}</div>
          <div className="text-[10px] text-[#7A7A7A]">Posts</div>
        </div>
        <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-3 text-center border border-[#B6EBF7]/40">
          <Calendar className="w-5 h-5 text-[#49D69E] mx-auto mb-1" />
          <div className="text-lg font-bold text-[#111111]">{new Set(posts.map(p => p.platform)).size}</div>
          <div className="text-[10px] text-[#7A7A7A]">Plattformen</div>
        </div>
        {imageCount > 0 && (
          <div className="bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] p-3 text-center border border-[#B6EBF7]/40">
            <ImageIcon className="w-5 h-5 text-[#B6EBF7] mx-auto mb-1" />
            <div className="text-lg font-bold text-[#111111]">{imageCount}</div>
            <div className="text-[10px] text-[#7A7A7A]">Bilder</div>
          </div>
        )}
      </div>

      {showProgressBanner && (
        <div className="w-full max-w-2xl">
          <GenerationProgressBanner
            status={isTimeout ? 'timeout' : isCompleted ? 'completed' : 'processing'}
            currentPosts={posts.length}
            totalPosts={totalExpectedPosts || 0}
          />
        </div>
      )}

      <div className="w-full max-w-2xl space-y-3 mb-6 max-h-[340px] overflow-y-auto pr-1">
        {posts.map((post, i) => (
          <PostCard
            key={post.id}
            post={post}
            index={i}
            onPostUpdate={onPostUpdate}
            onNavigateToBrandStudio={onNavigateToBrandStudio}
            onOpenRegenModal={setRegenModalPostId}
          />
        ))}
      </div>

      <button
        onClick={onViewInCalendar}
        disabled={posts.length === 0}
        className="w-full max-w-md flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#49B7E3] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] font-semibold transition-all hover:scale-[1.02] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Calendar className="w-5 h-5" />
        <span>Posts in Kalender übernehmen</span>
      </button>

      {regenModalPost && (
        <RegenerateDesignModal
          postId={regenModalPost.id}
          currentImageUrl={
            (regenModalPost.designStatus === 'success' && regenModalPost.designImageUrl)
              ? regenModalPost.designImageUrl
              : regenModalPost.imageUrl
          }
          onClose={() => setRegenModalPostId(null)}
          onSuccess={(newDesignUrl) => {
            onPostUpdate?.(regenModalPost.id, {
              designImageUrl: newDesignUrl,
              designStatus: 'success',
            });
            setRegenModalPostId(null);
          }}
        />
      )}
    </div>
  );
};

export default PostResultsList;
