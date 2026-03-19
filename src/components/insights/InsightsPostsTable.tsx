import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { InsightCard, PLATFORM_CONFIG, FORMAT_LABELS, TIER_CONFIG, formatNumber } from './insightsHelpers';
import type { TablePost } from '../../hooks/useAnalyticsData';

type SortKey = 'date' | 'reach' | 'likes' | 'comments' | 'shares' | 'engagement';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

const PLATFORM_ABBR: Record<string, string> = {
  instagram: 'IG', linkedin: 'LI', facebook: 'FB', tiktok: 'TT', twitter: 'TW',
};

const TableRow: React.FC<{ post: TablePost; platform: { label: string; color: string }; tier: { label: string; dot: string; text: string } }> = ({ post, platform, tier }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#F4FCFE' : 'transparent' }}
    >
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5' }}>
        <div className="flex items-center gap-2">
          <div
            className="rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ width: 28, height: 28, background: platform.color }}
          >
            {PLATFORM_ABBR[post.platform] || 'SM'}
          </div>
          <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, color: '#7A7A7A' }}>
            {FORMAT_LABELS[post.format] || post.format}
          </span>
        </div>
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', maxWidth: 280 }}>
        <span
          title={post.content}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            color: '#111111',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {post.content.length > 40 ? post.content.substring(0, 40) + '...' : post.content}
        </span>
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111' }}>
        {post.date}
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111', textAlign: 'right' }}>
        {post.reach > 0 ? formatNumber(post.reach) : '\u2014'}
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111', textAlign: 'right' }}>
        {post.likes}
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111', textAlign: 'right' }}>
        {post.comments}
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, color: '#111111', textAlign: 'right' }}>
        {post.shares}
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', textAlign: 'right' }}>
        <span
          className="font-semibold"
          style={{
            fontFamily: 'Manrope, system-ui, sans-serif',
            fontSize: 14,
            color: post.engagement >= 4 ? '#49D69E' : post.engagement >= 2.5 ? '#F4BE9D' : '#FA7E70',
          }}
        >
          {post.engagement.toFixed(2)}%
        </span>
      </td>
      <td style={{ padding: '14px 16px', borderBottom: '1px solid #F5F5F5', textAlign: 'center' }}>
        <span
          className="inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded"
          style={{ background: `${tier.dot}18`, color: tier.text }}
        >
          <span className="rounded-full" style={{ width: 6, height: 6, background: tier.dot, display: 'inline-block' }} />
          {tier.label}
        </span>
      </td>
    </tr>
  );
};

const InsightsPostsTable: React.FC<{ data: TablePost[] }> = ({ data }) => {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(0);

  const handleSort = (key: SortKey) => {
    setSort(prev => ({
      key,
      dir: prev.key === key ? (prev.dir === 'desc' ? 'asc' : 'desc') : 'desc',
    }));
    setPage(0);
  };

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let av: any = a[sort.key];
      let bv: any = b[sort.key];
      if (sort.key === 'date') {
        av = a.published_at ? new Date(a.published_at).getTime() : 0;
        bv = b.published_at ? new Date(b.published_at).getTime() : 0;
      }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sort]);

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sort.key !== col) return <ChevronDown size={12} style={{ opacity: 0.3 }} />;
    return sort.dir === 'desc'
      ? <ChevronDown size={12} style={{ color: '#49B7E3' }} />
      : <ChevronUp size={12} style={{ color: '#49B7E3' }} />;
  };

  const cols: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'date', label: 'Datum' },
    { key: 'reach', label: 'Reichweite', align: 'right' },
    { key: 'likes', label: 'Likes', align: 'right' },
    { key: 'comments', label: 'Komm.', align: 'right' },
    { key: 'shares', label: 'Shares', align: 'right' },
    { key: 'engagement', label: 'ER', align: 'right' },
  ];

  if (data.length === 0) return null;

  return (
    <InsightCard>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', fontSize: 18, color: '#111111' }}
        >
          Alle Posts
        </h2>
        <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
          {sorted.length} Posts gefunden
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 680 }}>
          <thead>
            <tr>
              <th
                className="text-left"
                style={{
                  padding: '12px 16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#7A7A7A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #F0F0F0',
                  userSelect: 'none',
                }}
              >
                Plattform
              </th>
              <th
                className="text-left"
                style={{
                  padding: '12px 16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#7A7A7A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #F0F0F0',
                }}
              >
                Post
              </th>
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer select-none"
                  style={{
                    padding: '12px 16px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: sort.key === col.key ? '#49B7E3' : '#7A7A7A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '2px solid #F0F0F0',
                    textAlign: col.align || 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th
                style={{
                  padding: '12px 16px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#7A7A7A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #F0F0F0',
                  textAlign: 'center',
                }}
              >
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((post, i) => {
              const platform = PLATFORM_CONFIG[post.platform] || { label: post.platform, color: '#7A7A7A' };
              const tier = TIER_CONFIG[post.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG['medium'];
              return <TableRow key={i} post={post} platform={platform} tier={tier} />;
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid #F0F0F0' }}>
          <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
            Zeige {page * PAGE_SIZE + 1}\u2013{Math.min((page + 1) * PAGE_SIZE, sorted.length)} von {sorted.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-[var(--vektrus-radius-sm)] px-4 py-2 text-[13px] font-medium transition-all"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                border: '1.5px solid #E0E0E0',
                color: page === 0 ? '#C0C0C0' : '#111111',
                background: 'transparent',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Zur\u00FCck
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-[var(--vektrus-radius-sm)] px-4 py-2 text-[13px] font-medium transition-all"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                border: '1.5px solid #E0E0E0',
                color: page >= totalPages - 1 ? '#C0C0C0' : '#111111',
                background: 'transparent',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Vor
            </button>
          </div>
        </div>
      )}
    </InsightCard>
  );
};

export default InsightsPostsTable;
