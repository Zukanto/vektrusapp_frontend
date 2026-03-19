import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, FlaskConical } from 'lucide-react';
import { VisionProject } from './types';

interface VisionVideoPreviewProps {
  project: VisionProject;
  onClose: () => void;
}

const MODEL_BADGE_COLORS: Record<string, string> = {
  'Veo 3.1': 'bg-[rgba(73,214,158,0.12)] text-[#2a8a5e]',
  'Nano + Veo 3.1': 'bg-[rgba(73,183,227,0.12)] text-[#2a7da0]',
  'Sora 2': 'bg-[rgba(244,190,157,0.2)] text-[#9a5e2a]',
};

const VisionVideoPreview: React.FC<VisionVideoPreviewProps> = ({ project, onClose }) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal max-w-lg w-full overflow-hidden"
      >
        <div className="p-5 border-b border-[rgba(73,183,227,0.10)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#111111]">{project.product_name}</span>
            {project.model_selection && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  MODEL_BADGE_COLORS[project.model_selection] || 'bg-[#F4FCFE] text-[#7A7A7A]'
                }`}
              >
                {project.model_selection}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#7A7A7A]/70">
              {formatDate(project.finished_at || project.created_at)}
            </span>
            <button
              onClick={onClose}
              className="text-[#7A7A7A]/70 hover:text-[#7A7A7A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-black flex items-center justify-center" style={{ maxHeight: '70vh' }}>
          {project.video_url ? (
            <video
              src={project.video_url}
              controls
              autoPlay
              playsInline
              className="w-auto max-h-[70vh]"
            />
          ) : project.image_url ? (
            <img
              src={project.image_url}
              alt={project.product_name}
              className="w-auto max-h-[70vh]"
            />
          ) : (
            <div className="text-[#7A7A7A]/70 py-20">Kein Medium verfügbar</div>
          )}
        </div>

        {project.isDemo && (
          <div className="px-5 pt-4 pb-0">
            <div className="bg-[rgba(244,190,157,0.1)] border border-[rgba(244,190,157,0.3)] rounded-[var(--vektrus-radius-sm)] px-3 py-2 flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-[#c07a3a] flex-shrink-0" />
              <p className="text-xs text-[#9a5e2a]">
                Demo-Vorschau &ndash; In der finalen Version werden hier deine generierten Videos angezeigt.
              </p>
            </div>
          </div>
        )}

        <div className="p-5 flex gap-3">
          {project.video_url && !project.isDemo && (
            <a
              href={project.video_url}
              download
              className="flex items-center gap-2 px-5 py-2.5 bg-[#49B7E3] hover:bg-[#3a9fd1] text-white rounded-[10px] font-medium shadow-card hover:shadow-elevated transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Herunterladen</span>
            </a>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[rgba(73,183,227,0.18)] bg-white text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[10px] font-medium transition-colors"
          >
            Schließen
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VisionVideoPreview;
