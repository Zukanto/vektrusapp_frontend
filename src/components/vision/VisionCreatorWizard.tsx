import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Upload, Lightbulb, Rocket, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { WizardFormData } from './types';

interface VisionCreatorWizardProps {
  onSubmit: (data: WizardFormData) => void;
  onClose: () => void;
  submitting: boolean;
}

const STYLE_OPTIONS = ['Realistisch', 'Clean', 'Energetisch', 'Luxuriös', 'Minimalistisch'];

const MODEL_OPTIONS = [
  {
    id: 'Nano + Veo 3.1',
    title: 'Nano + Veo 3.1',
    badge: 'Empfohlen',
    badgeColor: 'bg-[rgba(73,214,158,0.12)] text-[#2a8a5e]',
    description:
      'Erstellt zuerst ein authentisches UGC-Bild mit deinem Produkt, dann ein Video daraus. Beste Qualität.',
    details: [
      'Dauer: ~8 Sekunden',
      'Format: 9:16 (Story/Reel)',
      'Schritte: Bild \u2192 Analyse \u2192 Video',
    ],
  },
  {
    id: 'Veo 3.1',
    title: 'Veo 3.1',
    badge: 'Schnell',
    badgeColor: 'bg-[rgba(244,190,157,0.15)] text-[#9a5e2a]',
    description:
      'Generiert direkt ein Video aus deinem Referenzbild. Schneller, aber ohne Zwischenbild.',
    details: [
      'Dauer: ~8 Sekunden',
      'Format: 9:16 (Story/Reel)',
      'Schritte: Referenzbild \u2192 Video',
    ],
  },
  {
    id: 'Sora 2',
    title: 'Sora 2',
    badge: 'Alternativ',
    badgeColor: 'bg-[rgba(244,190,157,0.2)] text-[#9a5e2a]',
    description:
      'Anderer Stil und Ästhetik. Gut zum Vergleichen oder für einen frischen Look.',
    details: [
      'Dauer: ~10 Sekunden',
      'Format: 9:16 (Story/Reel)',
      'Schritte: Referenzbild \u2192 Video',
    ],
  },
];

const VisionCreatorWizard: React.FC<VisionCreatorWizardProps> = ({
  onSubmit,
  onClose,
  submitting,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [formData, setFormData] = useState<WizardFormData>({
    productName: '',
    targetAudience: '',
    productFeatures: '',
    referenceImages: [],
    description: '',
    styleTags: [],
    modelSelection: 'Nano + Veo 3.1',
  });

  const progress = (step / 4) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.productName.trim().length > 0;
      case 2:
        return formData.referenceImages.length > 0;
      case 3:
        return formData.description.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onSubmit(formData);
  };

  const uploadFiles = async (files: File[]) => {
    if (!user?.id) return;
    setUploading(true);
    setUploadError('');
    const newImages: { url: string }[] = [];

    for (const file of files.slice(0, 5 - formData.referenceImages.length)) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `vision-references/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(filename, file, {
          contentType: file.type,
          upsert: false,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('user-images')
          .getPublicUrl(data.path);
        newImages.push({ url: urlData.publicUrl });
      } else if (error) {
        console.error('Upload error:', error);
        setUploadError('Upload fehlgeschlagen. Bitte versuche es erneut.');
      }
    }

    setFormData((prev) => ({
      ...prev,
      referenceImages: [...prev.referenceImages, ...newImages].slice(0, 5),
    }));
    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) uploadFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      referenceImages: prev.referenceImages.filter((_, i) => i !== index),
    }));
  };

  const toggleStyle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      styleTags: prev.styleTags.includes(style)
        ? prev.styleTags.filter((s) => s !== style)
        : [...prev.styleTags, style],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal max-w-2xl w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="h-1 bg-[#F4FCFE] sticky top-0 z-10">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-[var(--vektrus-ai-violet)] rounded-full"
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-[#7A7A7A]/70 hover:text-[#7A7A7A] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <p className="text-sm text-[#7A7A7A]/70 mb-1">Schritt {step} von 4</p>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#111111] font-manrope">Produkt &amp; Ziel</h2>
                  <p className="text-[#7A7A7A] text-sm mt-1">
                    Beschreibe dein Produkt und die Zielgruppe
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                    Produkt *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        productName: e.target.value.slice(0, 100),
                      }))
                    }
                    placeholder="z.B. Protein Shake Mix"
                    className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                    Zielgruppe
                  </label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        targetAudience: e.target.value.slice(0, 300),
                      }))
                    }
                    placeholder="z.B. Junge Frauen, 20-30, fitness-affin, Instagram-aktiv"
                    rows={2}
                    className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20 resize-none"
                  />
                  <p className="text-xs text-[#7A7A7A]/70 mt-1">
                    Je genauer die Zielgruppe, desto authentischer das Video
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                    Besondere Produktmerkmale (optional)
                  </label>
                  <textarea
                    value={formData.productFeatures}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        productFeatures: e.target.value.slice(0, 300),
                      }))
                    }
                    placeholder="z.B. Bio-zertifiziert, vegan, schnelle Zubereitung"
                    rows={2}
                    className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20 resize-none"
                  />
                </div>

                <div className="bg-[rgba(124,108,242,0.06)] border border-[rgba(124,108,242,0.15)] rounded-[var(--vektrus-radius-md)] p-3 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--vektrus-ai-violet)]">
                    Vektrus analysiert deine Eingaben, um den perfekten Content zu generieren.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#111111] font-manrope">Referenzen</h2>
                  <p className="text-[#7A7A7A] text-sm mt-1">
                    Lade Produktfotos hoch, die als Basis dienen sollen
                  </p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[var(--vektrus-radius-lg)] p-12 text-center cursor-pointer transition-colors ${
                    dragOver
                      ? 'border-[var(--vektrus-ai-violet)] bg-[rgba(124,108,242,0.06)]'
                      : 'border-[rgba(124,108,242,0.3)] bg-[rgba(124,108,242,0.06)]/30 hover:bg-[rgba(124,108,242,0.06)]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {uploading ? (
                    <Loader className="w-10 h-10 text-[var(--vektrus-ai-violet)]/60 mx-auto animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 text-[var(--vektrus-ai-violet)]/60 mx-auto" />
                  )}
                  <p className="font-semibold text-[#111111] mt-3">Bilder hochladen</p>
                  <p className="text-sm text-[#7A7A7A]/70 mt-1">PNG, JPG bis zu 10MB</p>
                </div>

                {uploadError && (
                  <p className="text-sm text-red-600">{uploadError}</p>
                )}

                {formData.referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.referenceImages.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-[var(--vektrus-radius-md)] overflow-hidden">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                          className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-[#7A7A7A] hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-start space-x-2 text-xs text-[#7A7A7A]/70">
                  <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Echte Produktfotos funktionieren besser als Stockbilder</span>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#111111] font-manrope">Beschreibung</h2>
                  <p className="text-[#7A7A7A] text-sm mt-1">
                    Beschreibe, wie das finale Bild/Video aussehen soll
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-1.5">
                    Deine Vision *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value.slice(0, 500),
                      }))
                    }
                    placeholder="z.B. Junge Frau beim Workout, hält das Produkt in der Hand. Helle Studiobeleuchtung, freundlicher Stil."
                    rows={4}
                    className="w-full px-3 py-3 border border-[rgba(73,183,227,0.18)] rounded-[var(--vektrus-radius-md)] text-sm focus:outline-none focus:border-[#49B7E3] focus:ring-2 focus:ring-[#49B7E3]/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#111111] mb-2">
                    Stil wählen (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-all ${
                          formData.styleTags.includes(style)
                            ? 'bg-[rgba(124,108,242,0.06)] border border-[var(--vektrus-ai-violet)] text-[var(--vektrus-ai-violet)] font-medium'
                            : 'bg-white border border-[rgba(73,183,227,0.18)] text-[#7A7A7A] hover:border-[var(--vektrus-ai-violet)]/40'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[rgba(124,108,242,0.06)] border border-[rgba(124,108,242,0.15)] rounded-[var(--vektrus-radius-md)] p-3 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-[var(--vektrus-ai-violet)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--vektrus-ai-violet)]">
                    Vektrus erweitert deine Beschreibung mit Stil &amp; Kamera-Parametern.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#111111] font-manrope">Modell wählen</h2>
                  <p className="text-[#7A7A7A] text-sm mt-1">
                    Wähle das KI-Modell für deine Video-Generierung
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, modelSelection: model.id }))
                      }
                      className={`text-left p-5 rounded-[var(--vektrus-radius-lg)] border-2 transition-all ${
                        formData.modelSelection === model.id
                          ? 'border-[var(--vektrus-ai-violet)] bg-[rgba(124,108,242,0.06)]/30 shadow-card'
                          : 'border-[rgba(73,183,227,0.18)] hover:border-[var(--vektrus-ai-violet)]/40'
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${model.badgeColor} mb-2`}
                      >
                        {model.badge}
                      </span>
                      <h3 className="text-lg font-bold text-[#111111]">{model.title}</h3>
                      <p className="text-sm text-[#7A7A7A] mt-1">{model.description}</p>
                      <ul className="mt-3 space-y-1">
                        {model.details.map((d, i) => (
                          <li key={i} className="text-xs text-[#7A7A7A]/70">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="bg-[#F4FCFE] border border-[rgba(73,183,227,0.10)] rounded-[var(--vektrus-radius-md)] p-3">
                  <p className="text-sm text-[#7A7A7A]">
                    Alle Modelle generieren vertikale Videos (9:16) im Selfie-Style, optimiert für
                    Social Media.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-[#7A7A7A] hover:text-[#111111] text-sm font-medium transition-colors"
              >
                Zurück
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-[var(--vektrus-radius-md)] font-semibold transition-all ${
                canProceed() && !submitting
                  ? 'bg-[var(--vektrus-ai-violet)] text-white shadow-card hover:shadow-elevated'
                  : 'bg-[#F4FCFE] text-[#7A7A7A]/70 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Wird erstellt...</span>
                </>
              ) : step === 4 ? (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Vision-Projekt starten</span>
                </>
              ) : (
                <>
                  <span>Weiter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisionCreatorWizard;
