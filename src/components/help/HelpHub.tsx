import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Rocket, Zap, ArrowRight, BookOpen, MessageCircle, Mail,
  ChevronRight, TrendingUp, Megaphone, Construction, Clock,
  MessageSquareText,
} from 'lucide-react';
import { helpCategories, getPopularArticles, searchArticles, getCategoryBySlug, type HelpArticle } from './helpData';
import { getCategoryIcon } from './helpConstants';
import { getRecentUpdates, inProgressItems, UPDATE_STATUS_CONFIG } from './updatesData';

interface HelpHubProps {
  onModuleChange?: (module: string) => void;
}

const HelpHub: React.FC<HelpHubProps> = ({ onModuleChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const popularArticles = getPopularArticles();

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setSearchResults(searchArticles(value));
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const navigateToArticle = (article: HelpArticle) => {
    navigate(`/help/${article.categorySlug}/${article.slug}`);
    setIsSearching(false);
    setSearchQuery('');
  };

  const navigateToCategory = (slug: string) => {
    navigate(`/help/${slug}`);
  };

  const gettingStartedItems = [
    {
      title: 'Konto einrichten',
      description: 'Erstelle dein Vektrus-Konto und nimm die ersten Einstellungen vor.',
      categorySlug: 'erste-schritte',
      articleSlug: 'konto-einrichten',
      icon: Rocket,
    },
    {
      title: 'Profil vervollständigen',
      description: 'Je vollständiger dein Profil, desto besser die KI-Ergebnisse.',
      categorySlug: 'erste-schritte',
      articleSlug: 'profil-vervollstaendigen',
      icon: BookOpen,
    },
    {
      title: 'Ersten Wochenplan erstellen',
      description: 'Generiere in wenigen Minuten einen kompletten Content-Plan.',
      categorySlug: 'pulse',
      articleSlug: 'erste-woche-mit-pulse',
      icon: Zap,
    },
  ];

  return (
    <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6 lg:p-8 flex-shrink-0">
        <div className="max-w-[1000px] mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111111] mb-2 font-manrope">
            Hilfe & Support
          </h1>
          <p className="text-[#7A7A7A] mb-6">
            Finde Antworten, lerne die Funktionen kennen und hole das Beste aus Vektrus heraus.
          </p>

          {/* Search */}
          <div className="relative max-w-[640px]" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7A7A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length >= 2) setIsSearching(true); }}
              placeholder="Wonach suchst du?"
              className="w-full pl-12 pr-4 py-3.5 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] focus:outline-none focus:ring-2 focus:ring-[#B6EBF7] bg-[#F4FCFE] text-[#111111] placeholder:text-[#7A7A7A]/60"
            />

            {/* Search Results Dropdown */}
            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] shadow-[var(--vektrus-shadow-elevated)] z-20 max-h-[320px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(article => (
                    <button
                      key={`${article.categorySlug}/${article.slug}`}
                      onClick={() => navigateToArticle(article)}
                      className="w-full text-left px-4 py-3 hover:bg-[#F4FCFE] border-b border-[rgba(73,183,227,0.08)] last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#111111] text-sm">{article.title}</span>
                        <span className="text-xs text-[#49B7E3] bg-[#F4FCFE] px-1.5 py-0.5 rounded flex-shrink-0">
                          {getCategoryBySlug(article.categorySlug)?.title}
                        </span>
                      </div>
                      <div className="text-xs text-[#7A7A7A] mt-0.5">{article.summary}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-[#7A7A7A] text-sm">
                    Keine Ergebnisse für „{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1000px] mx-auto space-y-8">

          {/* Getting Started */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2 font-manrope">
              <Rocket className="w-5 h-5 text-[#49B7E3]" />
              Schnellstart
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gettingStartedItems.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.articleSlug}
                    onClick={() => navigate(`/help/${item.categorySlug}/${item.articleSlug}`)}
                    className="text-left bg-white p-5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:shadow-[var(--vektrus-shadow-card)] transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 bg-[#B6EBF7]/30 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center mb-3">
                      <IconComp className="w-5 h-5 text-[#49B7E3]" />
                    </div>
                    <h3 className="font-semibold text-[#111111] mb-1 group-hover:text-[#49B7E3] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#7A7A7A] leading-relaxed">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Category Grid */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4 font-manrope">
              Alle Hilfethemen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {helpCategories.map((category) => {
                const IconComp = getCategoryIcon(category.iconName);
                return (
                  <button
                    key={category.slug}
                    onClick={() => navigateToCategory(category.slug)}
                    className="text-left bg-white p-5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:shadow-[var(--vektrus-shadow-card)] transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                        <IconComp className="w-5 h-5 text-[#49B7E3]" />
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7A7A7A] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                    <h3 className="font-semibold text-[#111111] mb-1">{category.title}</h3>
                    <p className="text-sm text-[#7A7A7A] leading-relaxed mb-2">{category.description}</p>
                    <span className="text-xs text-[#49B7E3] font-medium">
                      {category.articles.length} Artikel
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Popular Articles */}
          <section>
            <h2 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2 font-manrope">
              <TrendingUp className="w-5 h-5 text-[#49B7E3]" />
              Beliebte Artikel
            </h2>
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.08)]">
              {popularArticles.map((article) => (
                <button
                  key={`${article.categorySlug}/${article.slug}`}
                  onClick={() => navigateToArticle(article)}
                  className="w-full text-left px-5 py-4 hover:bg-[#F4FCFE] transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#111111] group-hover:text-[#49B7E3] transition-colors">
                      {article.title}
                    </div>
                    <div className="text-sm text-[#7A7A7A] mt-0.5 truncate">{article.summary}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7A7A7A] flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </section>

          {/* Support Footer */}
          <section className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-6">
            <h2 className="text-lg font-semibold text-[#111111] mb-2 font-manrope">
              Nicht gefunden, was du suchst?
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-5">
              Unser Support-Team hilft dir gerne weiter.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onModuleChange?.('chat')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#49B7E3] hover:bg-[#49B7E3]/90 text-white rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Im Chat fragen
              </button>
              <a
                href="mailto:support@vektrus.com"
                className="flex items-center gap-2 px-4 py-2.5 border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] text-[#111111] rounded-[var(--vektrus-radius-sm)] font-medium transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-[#7A7A7A]" />
                E-Mail schreiben
              </a>
            </div>
          </section>

          {/* ── Produkt-Updates / Transparenz (sekundärer Layer) ── */}
          <div className="pt-4 border-t border-[rgba(73,183,227,0.10)]">

            {/* Neu bei Vektrus — kompakte Vorschau */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#111111] flex items-center gap-2 font-manrope">
                  <Megaphone className="w-5 h-5 text-[#49B7E3]" />
                  Neu bei Vektrus
                </h2>
                <button
                  onClick={() => navigate('/help/updates')}
                  className="text-sm text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium transition-colors flex items-center gap-1"
                >
                  Alle Updates
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getRecentUpdates(4).map(update => {
                  const statusConf = UPDATE_STATUS_CONFIG[update.status];
                  return (
                    <button
                      key={update.id}
                      onClick={() => update.linkTo ? navigate(update.linkTo) : navigate('/help/updates')}
                      className="text-left bg-white p-4 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:shadow-[var(--vektrus-shadow-card)] transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConf.className}`}>
                          {statusConf.label}
                        </span>
                        <span className="text-[11px] text-[#7A7A7A] flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(update.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm text-[#111111] group-hover:text-[#49B7E3] transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-xs text-[#7A7A7A] mt-0.5 leading-relaxed line-clamp-2">
                        {update.teaser}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Gerade in Arbeit — klein und ruhig */}
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-[#7A7A7A] mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Construction className="w-4 h-4" />
                Gerade in Arbeit
              </h2>
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.08)]">
                {inProgressItems.map((item, i) => (
                  <div key={i} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#111111] font-medium">{item.title}</span>
                      <p className="text-xs text-[#7A7A7A] mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-[11px] text-[#7A7A7A] bg-[#F4FCFE] px-1.5 py-0.5 rounded flex-shrink-0">
                      {item.module}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#7A7A7A] mt-2 italic">
                Diese Übersicht zeigt aktuelle Schwerpunkte. Prioritäten können sich ändern.
              </p>
            </section>

            {/* Feedback & Probleme — Rückkanalverlinkung */}
            <section className="mt-6">
              <button
                onClick={() => navigate('/toolhub')}
                className="w-full text-left bg-white p-5 rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:shadow-[var(--vektrus-shadow-card)] transition-all duration-200 group flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] flex items-center justify-center flex-shrink-0">
                  <MessageSquareText className="w-5 h-5 text-[#49B7E3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#111111] group-hover:text-[#49B7E3] transition-colors">
                    Feedback & Wünsche
                  </h3>
                  <p className="text-sm text-[#7A7A7A] mt-0.5 leading-relaxed">
                    Du hast eine Idee oder ein Problem entdeckt? Gib uns Rückmeldung.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7A7A7A] flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpHub;
