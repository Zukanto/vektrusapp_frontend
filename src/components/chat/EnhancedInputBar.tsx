import React, { useState, useRef } from 'react';
import { Send, ImagePlus, PenLine, Calendar, BarChart3, Target, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  suggestions: string[];
}

interface EnhancedInputBarProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
}

const EnhancedInputBar: React.FC<EnhancedInputBarProps> = ({ onSendMessage, disabled = false }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Category[] = [
    {
      id: 'content',
      label: 'Content',
      icon: <PenLine className="w-4 h-4" />,
      suggestions: [
        'Erstelle 3 Post-Ideen für diese Woche basierend auf unserem Unternehmensprofil',
        'Schreibe einen LinkedIn-Post der unsere Expertise zeigt',
        'Welche Content-Formate funktionieren gerade am besten für unsere Zielgruppe?',
        'Erstelle eine Caption für Instagram mit passenden Hashtags',
        'Gib mir 5 Story-Ideen die unsere Marke nahbar machen'
      ]
    },
    {
      id: 'planning',
      label: 'Planung',
      icon: <Calendar className="w-4 h-4" />,
      suggestions: [
        'Erstelle einen Content-Plan für die nächsten 7 Tage',
        'Wann sind die besten Posting-Zeiten für unsere Kanäle?',
        'Welche Themen und Anlässe können wir diesen Monat nutzen?',
        'Wie oft sollten wir pro Woche posten und auf welchen Plattformen?',
        'Plane eine Social-Media-Kampagne zu einem Thema unserer Wahl'
      ]
    },
    {
      id: 'analytics',
      label: 'Analyse',
      icon: <BarChart3 className="w-4 h-4" />,
      suggestions: [
        'Wie performen unsere Social-Media-Kanäle aktuell?',
        'Welche unserer letzten Posts haben am besten funktioniert und warum?',
        'Vergleiche unsere Engagement-Rate mit dem Branchendurchschnitt',
        'Zeig mir Trends in unserer Follower-Entwicklung der letzten Wochen',
        'Was machen erfolgreiche Accounts in unserer Branche anders?'
      ]
    },
    {
      id: 'strategy',
      label: 'Strategie',
      icon: <Target className="w-4 h-4" />,
      suggestions: [
        'Wie können wir mit Social Media mehr Anfragen generieren?',
        'Welche Plattform hat für uns das größte Wachstumspotenzial?',
        'Erstelle eine Strategie um unsere Reichweite in 3 Monaten zu verdoppeln',
        'Wie positionieren wir uns als Experte in unserem Bereich?',
        'Was sind die 3 wichtigsten Dinge die wir sofort verbessern sollten?'
      ]
    }
  ];

  const uploadChatImage = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const filename = `chat-images/${user.id}/${timestamp}.${ext}`;

    const { data, error } = await supabase.storage
      .from('user-images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(filename);

    return urlData.publicUrl;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Bild darf maximal 10MB groß sein');
      return;
    }

    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (message: string) => {
    if (disabled || isUploading) return;

    const finalMessage = message.trim() || (selectedImage ? 'Was siehst du auf diesem Bild?' : '');

    if (!finalMessage && !selectedImage) return;

    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        setIsUploading(true);
        imageUrl = await uploadChatImage(selectedImage);
      }

      onSendMessage(finalMessage, imageUrl);

      setInput('');
      setActiveCategory(null);
      handleRemoveImage();

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Bild-Upload fehlgeschlagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setActiveCategory(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-5">
      {imagePreviewUrl && (
        <div className="relative inline-block">
          <div className="relative rounded-[var(--vektrus-radius-sm)] overflow-hidden border-2 border-[#49B7E3]/30 shadow-sm">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="max-h-20 object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          {!isUploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 whitespace-nowrap flex-shrink-0
              ${activeCategory === cat.id
                ? 'chat-smart-chip-active text-white'
                : 'chat-smart-chip text-[#7A7A7A]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative chat-input-glass rounded-[var(--vektrus-radius-lg)]">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Schreib mir was du brauchst..."
          rows={1}
          disabled={disabled}
          className="
            w-full px-4 py-3 pr-28
            bg-transparent
            resize-none
            focus:outline-none
            text-[#111111]
            placeholder-gray-400
            min-h-[52px] max-h-32
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="p-2 text-gray-400 hover:text-[#7C6CF2] rounded-[var(--vektrus-radius-md)] hover:bg-[rgba(124,108,242,0.08)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Bild hochladen"
          >
            <ImagePlus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(input)}
            disabled={(!input.trim() && !selectedImage) || disabled || isUploading}
            className={`
              p-2.5 rounded-[var(--vektrus-radius-md)] transition-all duration-200
              ${(input.trim() || selectedImage) && !disabled && !isUploading
                ? 'pulse-gradient-icon text-white shadow-md hover:shadow-lg hover:scale-105'
                : 'bg-[#B6EBF7]/20 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {activeCategory && (
        <div className="animate-in slide-in-from-bottom-2 duration-200 mb-4">
          <div className="flex flex-wrap gap-2">
            {categories
              .find(c => c.id === activeCategory)
              ?.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={disabled}
                  className="chat-smart-chip text-sm text-[#374151] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="chip-label">{suggestion}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInputBar;
