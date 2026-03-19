import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, Check, Loader as Loader2, Type } from 'lucide-react';

export interface GoogleFont {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
}

const POPULAR_FONTS: GoogleFont[] = [
  { family: 'Inter', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Outfit', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'DM Sans', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Lato', category: 'sans-serif', variants: ['regular', '700'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['regular', '500', '700'] },
  { family: 'Source Sans 3', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Playfair Display', category: 'serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Lora', category: 'serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Merriweather', category: 'serif', variants: ['regular', '700'] },
  { family: 'EB Garamond', category: 'serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['regular', '700'] },
  { family: 'Crimson Pro', category: 'serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Josefin Sans', category: 'sans-serif', variants: ['regular', '300', '600', '700'] },
  { family: 'Space Grotesk', category: 'sans-serif', variants: ['regular', '500', '600', '700'] },
  { family: 'Syne', category: 'sans-serif', variants: ['regular', '500', '600', '700', '800'] },
  { family: 'Cabinet Grotesk', category: 'sans-serif', variants: ['regular', '500', '700', '800'] },
  { family: 'Bebas Neue', category: 'display', variants: ['regular'] },
  { family: 'Righteous', category: 'display', variants: ['regular'] },
  { family: 'Abril Fatface', category: 'display', variants: ['regular'] },
  { family: 'Pacifico', category: 'handwriting', variants: ['regular'] },
  { family: 'Dancing Script', category: 'handwriting', variants: ['regular', '500', '600', '700'] },
  { family: 'Sacramento', category: 'handwriting', variants: ['regular'] },
  { family: 'Great Vibes', category: 'handwriting', variants: ['regular'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['regular', '500', '700'] },
  { family: 'Fira Code', category: 'monospace', variants: ['regular', '500', '700'] },
];

const CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'sans-serif', label: 'Sans-Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'handwriting', label: 'Handwriting' },
  { id: 'monospace', label: 'Monospace' },
] as const;

const FONT_PAIRINGS: Record<string, { body: string; label: string }> = {
  'Playfair Display': { body: 'Lato', label: 'Klassisch & elegant' },
  'Cormorant Garamond': { body: 'Montserrat', label: 'Luxuriös & modern' },
  'Montserrat': { body: 'Merriweather', label: 'Modern & lesbar' },
  'Raleway': { body: 'Open Sans', label: 'Schlicht & klar' },
  'Bebas Neue': { body: 'Lato', label: 'Bold & Impact' },
  'Josefin Sans': { body: 'EB Garamond', label: 'Editorial & zeitlos' },
  'Syne': { body: 'Inter', label: 'Zeitgeistig & clean' },
  'Space Grotesk': { body: 'DM Sans', label: 'Tech & modern' },
  'Poppins': { body: 'Nunito', label: 'Freundlich & rund' },
  'Outfit': { body: 'Lato', label: 'Frisch & professionell' },
};

const loadedFonts = new Set<string>();

const loadGoogleFont = (family: string): Promise<void> => {
  if (loadedFonts.has(family)) return Promise.resolve();
  return new Promise((resolve) => {
    const encoded = encodeURIComponent(family);
    const url = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700&display=swap`;
    const existing = document.querySelector(`link[data-font="${encoded}"]`);
    if (existing) { loadedFonts.add(family); resolve(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-font', encoded);
    link.onload = () => { loadedFonts.add(family); resolve(); };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
};

const PREVIEW_TEXT = 'Aa – Schrift & Design';

interface FontPickerProps {
  value: string;
  onChange: (family: string) => void;
  label: string;
  pairedFont?: string;
  onPairSuggestion?: (heading: string, body: string) => void;
  showPairings?: boolean;
}

const FontPicker: React.FC<FontPickerProps> = ({
  value,
  onChange,
  label,
  onPairSuggestion,
  showPairings = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [loadingFont, setLoadingFont] = useState<string | null>(null);
  const [loadedPreviews, setLoadedPreviews] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = POPULAR_FONTS.filter(f => {
    const matchCat = category === 'all' || f.category === category;
    const matchSearch = f.family.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const pairing = value ? FONT_PAIRINGS[value] : null;

  const loadPreviewBatch = useCallback(async (fonts: GoogleFont[]) => {
    for (const f of fonts.slice(0, 12)) {
      if (!loadedPreviews.has(f.family)) {
        await loadGoogleFont(f.family);
        setLoadedPreviews(prev => new Set([...prev, f.family]));
      }
    }
  }, [loadedPreviews]);

  useEffect(() => {
    if (open) {
      loadPreviewBatch(filtered);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    loadPreviewBatch(filtered);
  }, [search, category]);

  useEffect(() => {
    if (value) loadGoogleFont(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (family: string) => {
    setLoadingFont(family);
    await loadGoogleFont(family);
    setLoadingFont(null);
    onChange(family);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs font-medium text-[#7A7A7A] block mb-1.5">{label}</label>

      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-[var(--vektrus-radius-md)] border transition-all text-left"
        style={{
          border: open ? '1.5px solid #49B7E3' : '1.5px solid rgba(73,183,227,0.25)',
          background: '#FFFFFF',
          boxShadow: open ? '0 0 0 3px rgba(73,183,227,0.1)' : 'none',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Type className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#49B7E3' }} />
          {value ? (
            <span
              style={{ fontFamily: `'${value}', sans-serif`, fontSize: '14px', color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {value}
            </span>
          ) : (
            <span style={{ fontSize: '13px', color: '#ABABAB', fontFamily: 'Inter, sans-serif' }}>Schrift wählen…</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-[#F4FCFE] transition-colors"
            >
              <X className="w-3 h-3 text-[#ABABAB]" />
            </button>
          )}
          <ChevronDown
            className="w-4 h-4 text-[#7A7A7A] transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(73,183,227,0.2)',
            boxShadow: '0 8px 32px rgba(17,17,17,0.12)',
            top: '100%',
          }}
        >
          <div className="p-3 border-b border-[rgba(73,183,227,0.10)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#ABABAB]" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Schrift suchen…"
                className="w-full pl-8 pr-3 h-8 rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none"
                style={{
                  border: '1.5px solid #E8E8E8',
                  background: '#FAFAFA',
                  color: '#111111',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-[#ABABAB]" />
                </button>
              )}
            </div>

            <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: category === cat.id ? '#49B7E3' : '#F0F0F0',
                    color: category === cat.id ? '#FFFFFF' : '#555555',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p style={{ color: '#ABABAB', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>Keine Schriften gefunden</p>
              </div>
            ) : (
              filtered.map(font => {
                const isSelected = value === font.family;
                const isLoading = loadingFont === font.family;
                const isPreviewed = loadedPreviews.has(font.family);

                return (
                  <button
                    key={font.family}
                    onClick={() => handleSelect(font.family)}
                    className="w-full flex items-center justify-between px-4 py-2.5 transition-colors text-left"
                    style={{
                      background: isSelected ? 'rgba(73,183,227,0.06)' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        style={{
                          fontFamily: isPreviewed ? `'${font.family}', sans-serif` : 'Inter, sans-serif',
                          fontSize: '15px',
                          color: '#111111',
                          lineHeight: '1.2',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {PREVIEW_TEXT}
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#ABABAB', marginTop: 1 }}>
                        {font.family} · {font.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {isLoading && <Loader2 className="w-3.5 h-3.5 text-[#49B7E3] animate-spin" />}
                      {isSelected && !isLoading && <Check className="w-3.5 h-3.5" style={{ color: '#49D69E' }} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {showPairings && pairing && onPairSuggestion && (
        <div
          className="mt-2 px-3 py-2 rounded-[var(--vektrus-radius-md)] flex items-center justify-between gap-2"
          style={{ background: 'rgba(73,214,158,0.06)', border: '1px solid rgba(73,214,158,0.2)' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#7A7A7A' }}>
            Passt gut zu: <span style={{ color: '#111111', fontWeight: 500 }}>{pairing.body}</span>
            <span style={{ marginLeft: 6, color: '#ABABAB' }}>· {pairing.label}</span>
          </p>
          <button
            type="button"
            onClick={() => onPairSuggestion(value, pairing.body)}
            className="flex-shrink-0 px-2.5 py-1 rounded-[var(--vektrus-radius-sm)] text-xs font-medium transition-colors"
            style={{ background: 'rgba(73,214,158,0.15)', color: '#1A8A60', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            Anwenden
          </button>
        </div>
      )}
    </div>
  );
};

export { loadGoogleFont, POPULAR_FONTS };
export default FontPicker;
