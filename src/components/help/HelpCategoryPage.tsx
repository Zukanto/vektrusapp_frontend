import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { getCategoryBySlug } from './helpData';
import { getCategoryIcon, DIFFICULTY_LABELS } from './helpConstants';

const HelpCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  if (!category) {
    return (
      <div className="h-full bg-[#F4FCFE] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#111111] mb-2">Kategorie nicht gefunden</h2>
          <p className="text-[#7A7A7A] mb-4">Diese Hilfekategorie existiert nicht.</p>
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

  const IconComp = getCategoryIcon(category.iconName);

  return (
    <div className="h-full bg-[#F4FCFE] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(73,183,227,0.18)] p-6 lg:p-8 flex-shrink-0">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-[#7A7A7A] mb-4">
            <button
              onClick={() => navigate('/help')}
              className="hover:text-[#49B7E3] transition-colors"
            >
              Hilfe
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#111111] font-medium">{category.title}</span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/help')}
              className="w-9 h-9 flex items-center justify-center rounded-[var(--vektrus-radius-sm)] border border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7] hover:bg-[#F4FCFE] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#7A7A7A]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#B6EBF7]/30 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center">
                <IconComp className="w-5 h-5 text-[#49B7E3]" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-[#111111] font-manrope">
                  {category.title}
                </h1>
                <p className="text-sm text-[#7A7A7A]">{category.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] divide-y divide-[rgba(73,183,227,0.08)]">
            {category.articles.map((article) => (
              <button
                key={article.slug}
                onClick={() => navigate(`/help/${category.slug}/${article.slug}`)}
                className="w-full text-left px-5 py-5 hover:bg-[#F4FCFE] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#111111] group-hover:text-[#49B7E3] transition-colors mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#7A7A7A] leading-relaxed">{article.summary}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[#7A7A7A] bg-[#F4FCFE] px-2 py-0.5 rounded">
                        {DIFFICULTY_LABELS[article.difficulty]}
                      </span>
                      <span className="text-xs text-[#7A7A7A]">
                        Aktualisiert {new Date(article.updatedAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#7A7A7A] flex-shrink-0 ml-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>

          {category.articles.length === 0 && (
            <div className="bg-white rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] p-12 text-center">
              <BookOpen className="w-10 h-10 text-[#7A7A7A] mx-auto mb-3 opacity-40" />
              <p className="text-[#7A7A7A]">In dieser Kategorie sind noch keine Artikel verfügbar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpCategoryPage;
