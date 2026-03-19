import React, { useState, useRef } from 'react';
import { Send, Sparkles, Paperclip, Loader2, Smile, AtSign } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
  onQuickAction?: (action: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ 
  onSendMessage, 
  disabled = false, 
  showSuggestions = true,
  onQuickAction 
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    {
      text: 'Contentplan generieren',
      prompt: 'Erstelle einen strukturierten Content-Plan für die nächsten 4 Wochen mit konkreten Post-Ideen, optimalen Posting-Zeiten und passenden Formaten für meine Zielgruppe.'
    },
    {
      text: 'Statistiken analysieren',
      prompt: 'Analysiere meine bisherige Performance und gib mir konkrete Empfehlungen: Welche Content-Formate funktionieren am besten? Zu welchen Zeiten sollte ich posten? Welche Themen kommen gut an?'
    },
    {
      text: 'Caption erstellen',
      prompt: 'Schreibe mir 3 verschiedene Caption-Varianten für meinen nächsten Post mit passenden Hashtags und einem klaren Call-to-Action. Berücksichtige dabei meinen Tonality-Guide und meine Zielgruppe.'
    },
    {
      text: 'Strategie optimieren',
      prompt: 'Entwickle eine konkrete Content-Strategie zur Steigerung meiner Reichweite und meines Engagements. Welche Formate, Themen und Posting-Frequenzen empfiehlst du basierend auf meiner Branche und Zielgruppe?'
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleSuggestionClick = (suggestion: { text: string; prompt: string }) => {
    onSendMessage(suggestion.prompt);
  };

  return (
    <div className="space-y-4">
      {/* Quick Suggestions */}
      {showSuggestions && message.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-[#7A7A7A] mb-2 font-medium">Schnellzugriff</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className={`inline-flex items-center px-3 py-2 chat-smart-chip rounded-[var(--vektrus-radius-sm)] text-sm text-[#111111] ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-end space-x-3 bg-white border-2 border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] p-4 focus-within:border-[#49B7E3] transition-all duration-200 ${
          disabled ? 'opacity-50' : ''
        }`}>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Was brauchst du heute? Frag mich nach Ideen, Strategien oder Tipps..."
            disabled={disabled}
            className="flex-1 resize-none border-none outline-none text-[#111111] placeholder-[#7A7A7A] text-base leading-relaxed min-h-[24px] max-h-[120px] bg-transparent"
            rows={1}
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`px-4 py-2 rounded-[var(--vektrus-radius-sm)] font-semibold text-sm transition-all duration-200 flex items-center space-x-2 ${
                message.trim() && !disabled
                  ? 'bg-[#49B7E3] text-white hover:bg-[#3a9fd1] shadow-card hover:shadow-elevated'
                  : 'bg-[#F4FCFE] text-[#7A7A7A] cursor-not-allowed'
              }`}
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Senden</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 px-1">
          <p className="text-xs text-[#7A7A7A]">
            <span className="font-semibold">Enter</span> zum Senden • <span className="font-semibold">Shift + Enter</span> für neue Zeile
          </p>
        </div>
      </form>
    </div>
  );
};

export default InputBar;