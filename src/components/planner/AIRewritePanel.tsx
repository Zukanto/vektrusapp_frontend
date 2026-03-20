import React, { useState } from 'react';
import { Wand2, Check, Loader2, X, ArrowRight } from 'lucide-react';
import { rewriteOptions, simulateAIRewrite } from '../../services/plannerDemoContent';
import { useModuleColors } from '../../hooks/useModuleColors';

interface AIRewritePanelProps {
  originalContent: string;
  currentTone?: string;
  onApplyRewrite: (newContent: string, tone: string) => void;
  onClose: () => void;
}

const AIRewritePanel: React.FC<AIRewritePanelProps> = ({
  originalContent,
  currentTone,
  onApplyRewrite,
  onClose
}) => {
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plannerColors = useModuleColors('planner');

  const handleRewrite = async (toneId: string) => {
    setSelectedTone(toneId);
    setIsLoading(true);
    setError(null);

    try {
      const result = await simulateAIRewrite(originalContent, toneId, currentTone);
      setRewrittenContent(result);
    } catch (err) {
      setError('Fehler beim Umschreiben. Bitte versuche es erneut.');
      console.error('Rewrite error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (rewrittenContent && selectedTone) {
      onApplyRewrite(rewrittenContent, selectedTone);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: plannerColors.borderLight }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center"
              style={{ background: 'rgba(124, 108, 242, 0.08)' }}
            >
              <Wand2 className="w-5 h-5" style={{ color: 'var(--vektrus-ai-violet)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-manrope text-[#111111]">KI Text-Optimierung</h2>
              <p className="text-xs text-[#7A7A7A]">Wähle einen Stil und lass die KI deinen Text umschreiben</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[var(--vektrus-radius-sm)] hover:bg-[#F4FCFE] flex items-center justify-center transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-[#7A7A7A]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#111111] mb-3">
              Wähle einen Schreibstil
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {rewriteOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleRewrite(option.id)}
                  disabled={isLoading}
                  className="p-4 rounded-[var(--vektrus-radius-md)] border-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: selectedTone === option.id ? plannerColors.border : plannerColors.borderLight,
                    background: selectedTone === option.id ? plannerColors.primaryVeryLight : 'white',
                  }}
                  aria-label={`${option.label} - ${option.description}`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-semibold text-[#111111] mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-[#7A7A7A] leading-tight">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: 'var(--vektrus-ai-violet)' }} />
              <p className="text-sm font-medium text-[#111111] mb-2">KI schreibt deinen Text um...</p>
              <p className="text-xs text-[#7A7A7A]">Das dauert nur einen Moment</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-[#FA7E70]/30 rounded-[var(--vektrus-radius-md)]">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Comparison View */}
          {rewrittenContent && !isLoading && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Original */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <label className="text-sm font-semibold text-[#7A7A7A]">Original</label>
                  </div>
                  <div className="p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-md)] border border-[rgba(73,183,227,0.18)] min-h-[200px]">
                    <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">
                      {originalContent}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-[#7A7A7A]">
                    {originalContent.length} Zeichen
                  </div>
                </div>

                {/* Rewritten */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <ArrowRight className="w-4 h-4" style={{ color: plannerColors.primary }} />
                    <label className="text-sm font-semibold" style={{ color: plannerColors.primary }}>
                      Neu ({rewriteOptions.find(o => o.id === selectedTone)?.label})
                    </label>
                  </div>
                  <div
                    className="p-4 rounded-[var(--vektrus-radius-md)] border-2 min-h-[200px]"
                    style={{
                      background: plannerColors.primaryVeryLight,
                      borderColor: plannerColors.border,
                    }}
                  >
                    <p className="text-sm text-[#111111] whitespace-pre-wrap leading-relaxed">
                      {rewrittenContent}
                    </p>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: plannerColors.primary }}>
                    {rewrittenContent.length} Zeichen
                    {rewrittenContent.length !== originalContent.length && (
                      <span className="ml-2">
                        ({rewrittenContent.length > originalContent.length ? '+' : ''}
                        {rewrittenContent.length - originalContent.length})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Changes */}
              <div className="p-4 rounded-[var(--vektrus-radius-md)]" style={{ background: plannerColors.primaryVeryLight }}>
                <h4 className="text-sm font-semibold text-[#111111] mb-2">Änderungen</h4>
                <ul className="space-y-1 text-xs text-[#7A7A7A]">
                  <li className="flex items-start space-x-2">
                    <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: plannerColors.primary }} />
                    <span>Ton angepasst: {rewriteOptions.find(o => o.id === selectedTone)?.label}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: plannerColors.primary }} />
                    <span>
                      Länge {rewrittenContent.length > originalContent.length ? 'erhöht' : 'reduziert'} um{' '}
                      {Math.abs(rewrittenContent.length - originalContent.length)} Zeichen
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: plannerColors.primary }} />
                    <span>Struktur optimiert für bessere Lesbarkeit</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!selectedTone && !isLoading && (
            <div className="py-12 text-center">
              <div
                className="w-20 h-20 rounded-[var(--vektrus-radius-lg)] mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(124, 108, 242, 0.06)' }}
              >
                <Wand2 className="w-10 h-10" style={{ color: 'var(--vektrus-ai-violet)' }} />
              </div>
              <p className="text-sm font-medium text-[#111111] mb-2">
                Wähle einen Schreibstil aus
              </p>
              <p className="text-xs text-[#7A7A7A] max-w-md mx-auto">
                Unsere KI optimiert deinen Text basierend auf dem gewählten Stil und behält dabei die Kernbotschaft bei
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t flex items-center justify-end space-x-3"
          style={{ borderColor: plannerColors.borderLight }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleApply}
            disabled={!rewrittenContent || isLoading}
            className="px-6 py-2 text-sm font-semibold text-white rounded-[var(--vektrus-radius-sm)] transition-all duration-200 shadow-card hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            style={{
              background: 'var(--vektrus-ai-violet)',
            }}
            aria-label="Umgeschriebenen Text übernehmen"
          >
            <Check className="w-4 h-4" />
            <span>Text übernehmen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRewritePanel;
