import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, BookOpen, CheckCircle, AlertTriangle,
  Lightbulb, ListChecks, ArrowRight, Info,
} from 'lucide-react';
import { getArticleBySlug, getCategoryBySlug, getRelatedArticles, type HelpSection } from './helpData';
import { DIFFICULTY_LABELS } from './helpConstants';

const SectionIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'intro': return <Info className={className} />;
    case 'prerequisites': return <ListChecks className={className} />;
    case 'steps': return <CheckCircle className={className} />;
    case 'tips': return <Lightbulb className={className} />;
    case 'pitfalls': return <AlertTriangle className={className} />;
    default: return <BookOpen className={className} />;
  }
};

const SECTION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  intro: { bg: 'bg-[#F4FCFE]', text: 'text-[#49B7E3]', border: 'border-[#B6EBF7]' },
  prerequisites: { bg: 'bg-[#F4FCFE]', text: 'text-[#49B7E3]', border: 'border-[#B6EBF7]' },
  steps: { bg: 'bg-white', text: 'text-[#49B7E3]', border: 'border-[rgba(73,183,227,0.18)]' },
  tips: { bg: 'bg-[#49D69E]/5', text: 'text-[#49D69E]', border: 'border-[#49D69E]/20' },
  pitfalls: { bg: 'bg-[#FA7E70]/5', text: 'text-[#FA7E70]', border: 'border-[#FA7E70]/20' },
};

const RenderSection: React.FC<{ section: HelpSection }> = ({ section }) => {
  const colors = SECTION_COLORS[section.type] || SECTION_COLORS.steps;

  if (section.type === 'intro') {
    return (
      <div className={`${colors.bg} rounded-[var(--vektrus-radius-md)] p-5 border ${colors.border}`}>
        <div className="flex items-start gap-3">
          <SectionIcon type={section.type} className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className="font-semibold text-[#111111] mb-1">{section.title}</h3>
            <p className="text-[#7A7A7A] text-sm leading-relaxed">{section.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'prerequisites' && section.items) {
    return (
      <div className={`${colors.bg} rounded-[var(--vektrus-radius-md)] p-5 border ${colors.border}`}>
        <div className="flex items-start gap-3">
          <SectionIcon type={section.type} className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className="font-semibold text-[#111111] mb-3">{section.title}</h3>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#7A7A7A]">
                  <CheckCircle className="w-4 h-4 text-[#49B7E3] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'steps' && section.steps) {
    return (
      <div>
        <h3 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
          <SectionIcon type={section.type} className={`w-5 h-5 ${colors.text}`} />
          {section.title}
        </h3>
        <div className="space-y-4">
          {section.steps.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 bg-[#B6EBF7]/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#49B7E3]">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#111111] mb-1">{step.title}</h4>
                  <p className="text-sm text-[#7A7A7A] leading-relaxed">{step.description}</p>
                  {step.note && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-[#49B7E3] bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] p-2.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{step.note}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if ((section.type === 'tips' || section.type === 'pitfalls') && section.items) {
    return (
      <div className={`${colors.bg} rounded-[var(--vektrus-radius-md)] p-5 border ${colors.border}`}>
        <h3 className="font-semibold text-[#111111] mb-3 flex items-center gap-2">
          <SectionIcon type={section.type} className={`w-5 h-5 ${colors.text}`} />
          {section.title}
        </h3>
        <ul className="space-y-2.5">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#7A7A7A]">
              <span className={`w-1.5 h-1.5 rounded-full ${section.type === 'tips' ? 'bg-[#49D69E]' : 'bg-[#FA7E70]'} flex-shrink-0 mt-2`} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

const HelpArticlePage: React.FC = () => {
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug: string }>();
  const navigate = useNavigate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const article = categorySlug && articleSlug ? getArticleBySlug(categorySlug, articleSlug) : undefined;

  // Scroll to top when navigating between articles
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [articleSlug]);

  if (!article || !category) {
    return (
      <div className="h-full bg-[#F4FCFE] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#111111] mb-2">Artikel nicht gefunden</h2>
          <p className="text-[#7A7A7A] mb-4">Dieser Hilfeartikel existiert nicht.</p>
          <button
            onClick={() => navigate('/help')}
            className="text-[#49B7E3] hover:text-[#49B7E3]/80 font-medium transition-colors"
          >
            Zurück zur Hilfe
          </button>
        </div>
      </div>
    );
  }

  const related = getRelatedArticles(article);

  return (
    <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6 lg:p-8 flex-shrink-0">
        <div className="max-w-[720px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[#7A7A7A] mb-4 flex-wrap">
            <button
              onClick={() => navigate('/help')}
              className="hover:text-[#49B7E3] transition-colors"
            >
              Hilfe
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => navigate(`/help/${category.slug}`)}
              className="hover:text-[#49B7E3] transition-colors"
            >
              {category.title}
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#111111] font-medium">{article.title}</span>
          </nav>

          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(`/help/${category.slug}`)}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] transition-colors flex-shrink-0 mt-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-[#7A7A7A]" />
            </button>
            <div>
              <h1
                className="text-xl lg:text-2xl font-bold text-[#111111] mb-1 font-manrope"
              >
                {article.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-[#7A7A7A]">
                <span className="bg-[#F4FCFE] px-2 py-0.5 rounded">
                  {DIFFICULTY_LABELS[article.difficulty]}
                </span>
                <span>
                  Aktualisiert {new Date(article.updatedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[720px] mx-auto space-y-6">

          {/* Article Sections */}
          {article.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="pt-2">
              <h3 className="font-semibold text-[#111111] mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#49B7E3]" />
                Verwandte Artikel
              </h3>
              <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.08)]">
                {related.map((rel) => (
                  <button
                    key={`${rel.categorySlug}/${rel.slug}`}
                    onClick={() => navigate(`/help/${rel.categorySlug}/${rel.slug}`)}
                    className="w-full text-left px-5 py-3.5 hover:bg-[#F4FCFE] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#111111] group-hover:text-[#49B7E3] transition-colors text-sm">
                        {rel.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#7A7A7A] flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HelpArticlePage;
