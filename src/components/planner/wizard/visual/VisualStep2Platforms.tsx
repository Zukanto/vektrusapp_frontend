import React from 'react';
import { Instagram, Linkedin, Facebook, Twitter, Check, Image } from 'lucide-react';
import { VisualWizardData } from './types';

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7.56a8.16 8.16 0 0 0 4.77 1.52v-3.39a4.85 4.85 0 0 1-1.04 0z" />
  </svg>
);

interface VisualStep2PlatformsProps {
  data: VisualWizardData;
  onUpdate: (partial: Partial<VisualWizardData>) => void;
}

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-pink-500 via-pink-500 to-orange-400', comingSoon: false },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', comingSoon: false },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-500', comingSoon: false },
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon, color: 'bg-black', comingSoon: true },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black', comingSoon: false },
];

const VisualStep2Platforms: React.FC<VisualStep2PlatformsProps> = ({ data, onUpdate }) => {
  const togglePlatform = (id: string) => {
    const next = data.platforms.includes(id)
      ? data.platforms.filter(p => p !== id)
      : [...data.platforms, id];
    onUpdate({ platforms: next });
  };

  const imageCount = data.images.filter(i => i.publicUrl && !i.error).length;
  const totalPosts = imageCount * data.platforms.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h3
          className="text-2xl font-bold text-[#111111] mb-2"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Wo sollen die Posts erscheinen?
        </h3>
        <p className="text-[#7A7A7A] leading-relaxed">
          Pro Bild wird ein Post pro Plattform erstellt.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-3">Plattformen</label>
        <div className="flex flex-wrap gap-3">
          {platforms.map(p => {
            const Icon = p.icon;
            const selected = data.platforms.includes(p.id);
            if (p.comingSoon) {
              return (
                <div
                  key={p.id}
                  className="relative flex items-center space-x-2.5 px-4 py-3 rounded-[var(--vektrus-radius-md)] border-2 border-[rgba(73,183,227,0.10)] bg-[#F4FCFE] cursor-not-allowed opacity-60"
                >
                  <div className="w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center bg-gray-300">
                    <Icon className="text-white w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-400">{p.label}</span>
                  <span className="text-[10px] font-semibold text-gray-400 bg-[#B6EBF7]/20 rounded-full px-2 py-0.5 leading-tight">
                    Coming soon
                  </span>
                </div>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-[var(--vektrus-radius-lg)] border-2 transition-all duration-300 border-gradient-ai ${
                  selected
                    ? 'ai-active bg-[rgba(124,108,242,0.04)] shadow-lg border-transparent'
                    : 'border-[rgba(73,183,227,0.18)] hover:border-[#B4E8E5] bg-white hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-[var(--vektrus-radius-sm)] flex items-center justify-center ${p.color}`}>
                  <Icon className="text-white w-4 h-4" />
                </div>
                <span className={`text-sm font-medium ${selected ? 'text-[#111111]' : 'text-[#7A7A7A]'}`}>
                  {p.label}
                </span>
                {selected && (
                  <div className="w-5 h-5 pulse-gradient-icon rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {data.platforms.length > 0 && imageCount > 0 && (
        <div className="bg-gradient-to-r from-[#F4FCFE] to-white rounded-[var(--vektrus-radius-md)] p-5 border border-[#B6EBF7] flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#49D69E]/15 rounded-[var(--vektrus-radius-md)] flex items-center justify-center">
              <Image className="w-5 h-5 text-[#49D69E]" />
            </div>
            <div className="text-sm text-[#7A7A7A]">
              <span className="font-bold text-[#111111]">{imageCount} {imageCount === 1 ? 'Bild' : 'Bilder'}</span>
              {' x '}
              <span className="font-bold text-[#111111]">{data.platforms.length} {data.platforms.length === 1 ? 'Plattform' : 'Plattformen'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#49B7E3]">{totalPosts}</div>
            <div className="text-xs text-[#7A7A7A]">Posts</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualStep2Platforms;
