import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronRight, ChevronDown as ChevronDownSmall } from 'lucide-react';
import { recentPosts } from './dashboardData';

type SortKey = 'date' | 'reach' | 'likes' | 'engagement';
type SortDir = 'asc' | 'desc';

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  if (platform === 'linkedin') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#0077B5" />
        <path d="M7 10h2v7H7v-7zm1-3a1.1 1.1 0 1 1 0 2.2A1.1 1.1 0 0 1 8 7zm4 3h1.9v.96h.03C14.28 10.57 15.16 10 16.3 10c2.07 0 2.45 1.36 2.45 3.13V17h-2v-3.45c0-.82-.01-1.88-1.14-1.88-1.15 0-1.32.9-1.32 1.82V17H12v-7z" fill="white" />
      </svg>
    );
  }
  if (platform === 'instagram') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="ig-tbl-grad" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#ffd879" />
            <stop offset="20%" stopColor="#f9943b" />
            <stop offset="50%" stopColor="#e1306c" />
            <stop offset="80%" stopColor="#833ab4" />
            <stop offset="100%" stopColor="#405de6" />
          </radialGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-tbl-grad)" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
      </svg>
    );
  }
  if (platform === 'facebook') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
        <path d="M13.5 8.5H15V6.5h-1.6C11.9 6.5 11 7.4 11 8.8V10H9.5v2H11v5.5h2V12h1.5l.3-2H13v-.9c0-.4.2-.6.5-.6z" fill="white" />
      </svg>
    );
  }
  if (platform === 'tiktok') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#111111" />
        <path d="M15.5 6.5c.4.9 1.1 1.6 2 1.9v1.9a4.8 4.8 0 0 1-2-.5v4.2a3.6 3.6 0 1 1-3.6-3.6h.4v2a1.6 1.6 0 1 0 1.2 1.6V6.5h2z" fill="white" />
      </svg>
    );
  }
  return null;
};

const tierConfig: Record<string, { dot: string; label: string }> = {
  high: { dot: '#49D69E', label: 'high' },
  medium: { dot: '#F4BE9D', label: 'medium' },
  low: { dot: '#FA7E70', label: 'low' },
};

function formatReach(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const platforms = ['Alle', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok'];

const DashPostsTable: React.FC = () => {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterPlatform, setFilterPlatform] = useState('Alle');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = recentPosts.filter(p =>
    filterPlatform === 'Alle' || p.platform.toLowerCase() === filterPlatform.toLowerCase()
  );

  const sorted = [...filtered].sort((a, b) => {
    let va: number | string;
    let vb: number | string;
    if (sortKey === 'date') {
      const parse = (d: string) => {
        const [day, month, year] = d.split('.');
        return new Date(+year, +month - 1, +day).getTime();
      };
      va = parse(a.date);
      vb = parse(b.date);
    } else if (sortKey === 'reach') {
      va = a.reach; vb = b.reach;
    } else if (sortKey === 'likes') {
      va = a.likes; vb = b.likes;
    } else {
      va = a.engagement; vb = b.engagement;
    }
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const SortIndicator: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} style={{ color: '#CCCCCC' }} />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ color: '#49B7E3' }} />
      : <ChevronDown size={12} style={{ color: '#49B7E3' }} />;
  };

  const thStyle: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 12,
    color: '#7A7A7A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '12px 16px',
    borderBottom: '2px solid #F0F0F0',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: '1px solid #F5F5F5',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    verticalAlign: 'middle',
  };

  return (
    <div className="bg-white rounded-[var(--vektrus-radius-lg)]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3
          className="font-semibold text-lg"
          style={{ fontFamily: 'Manrope, system-ui, sans-serif', color: '#111111' }}
        >
          Letzte Posts
        </h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--vektrus-radius-sm)] text-sm border transition-colors"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: '#111111',
              borderColor: '#E0E0E0',
              background: 'white',
            }}
          >
            {filterPlatform}
            <ChevronDownSmall size={14} style={{ color: '#49B7E3' }} />
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-1 bg-white rounded-[var(--vektrus-radius-md)] overflow-hidden z-20"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 140 }}
            >
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => { setFilterPlatform(p); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    color: filterPlatform === p ? '#49B7E3' : '#111111',
                    background: filterPlatform === p ? '#F0FAFF' : 'white',
                  }}
                  onMouseEnter={e => { if (filterPlatform !== p) (e.currentTarget as HTMLButtonElement).style.background = '#F4FCFE'; }}
                  onMouseLeave={e => { if (filterPlatform !== p) (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th style={thStyle}>Plattform</th>
              <th style={thStyle}>Post</th>
              <th
                style={{ ...thStyle, cursor: 'pointer' }}
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">Datum <SortIndicator col="date" /></div>
              </th>
              <th
                style={{ ...thStyle, cursor: 'pointer' }}
                onClick={() => handleSort('reach')}
              >
                <div className="flex items-center gap-1">Reichweite <SortIndicator col="reach" /></div>
              </th>
              <th
                style={{ ...thStyle, cursor: 'pointer' }}
                onClick={() => handleSort('likes')}
              >
                <div className="flex items-center gap-1">Likes <SortIndicator col="likes" /></div>
              </th>
              <th
                style={{ ...thStyle, cursor: 'pointer' }}
                onClick={() => handleSort('engagement')}
              >
                <div className="flex items-center gap-1">ER <SortIndicator col="engagement" /></div>
              </th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((post, i) => {
              const tier = tierConfig[post.tier] || tierConfig.medium;
              return (
                <tr
                  key={i}
                  className="transition-colors duration-150"
                  onMouseEnter={e => (e.currentTarget.style.background = '#F4FCFE')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(182,235,247,0.25)' }}
                    >
                      <PlatformIcon platform={post.platform} />
                    </div>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: 280 }}>
                    <span
                      className="block truncate"
                      style={{ color: '#111111', maxWidth: 280 }}
                    >
                      {post.content}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#7A7A7A' }}>{post.date}</td>
                  <td style={{ ...tdStyle, color: '#111111', fontWeight: 500 }}>
                    {formatReach(post.reach)}
                  </td>
                  <td style={{ ...tdStyle, color: '#111111', fontWeight: 500 }}>
                    {post.likes}
                  </td>
                  <td style={{ ...tdStyle, color: '#49B7E3', fontWeight: 600 }}>
                    {post.engagement.toFixed(2)}%
                  </td>
                  <td style={tdStyle}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: tier.dot }}
                      />
                      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, color: '#7A7A7A' }}>
                        {tier.label}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t" style={{ borderColor: '#F0F0F0' }}>
        <button
          className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#49B7E3' }}
        >
          Alle Posts anzeigen
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default DashPostsTable;
