import React, { useState, useRef } from 'react';
import { X, Upload, Image, Video, File } from 'lucide-react';

interface MediaUploadModalProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
}

const MediaUploadModal: React.FC<MediaUploadModalProps> = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    videos: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
  };

  const maxFileSize = 50 * 1024 * 1024; // 50MB
  const maxFiles = 10;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = [
        ...acceptedTypes.images,
        ...acceptedTypes.videos
      ].includes(file.type);
      
      const isValidSize = file.size <= maxFileSize;
      
      return isValidType && isValidSize;
    });

    if (selectedFiles.length + validFiles.length > maxFiles) {
      alert(`Maximal ${maxFiles} Dateien erlaubt`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      onUpload(selectedFiles);
      setUploading(false);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-[var(--vektrus-blue)]" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4 text-[var(--vektrus-blue)]" />;
    }
    return <File className="w-4 h-4 text-[var(--vektrus-gray)]" />;
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] w-full max-w-2xl max-h-[90vh] overflow-hidden" style={{ boxShadow: 'var(--vektrus-shadow-modal)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--vektrus-border-default)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-manrope font-bold text-[18px] text-[var(--vektrus-anthrazit)]">Medien hochladen</h2>
              <p className="text-[13px] text-[var(--vektrus-gray)] mt-1">
                Bilder und Videos für deine Mediathek
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:bg-[var(--vektrus-mint)] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[var(--vektrus-radius-md)] p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-[var(--vektrus-blue-light)] bg-[var(--vektrus-blue-light)]/10'
                : 'border-[var(--vektrus-border-default)] hover:border-[var(--vektrus-blue-light)]'
            }`}
          >
            <div className="w-14 h-14 bg-[var(--vektrus-blue-light)]/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-[var(--vektrus-blue)]" />
            </div>

            <h3 className="text-[15px] font-medium text-[var(--vektrus-anthrazit)] mb-1.5">
              Dateien hierher ziehen oder auswählen
            </h3>
            <p className="text-[13px] text-[var(--vektrus-gray)] mb-4">
              JPG, PNG, WebP, GIF, MP4, MOV, AVI, WebM
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white rounded-[var(--vektrus-radius-sm)] text-[14px] font-medium shadow-subtle hover:shadow-card transition-all"
            >
              Dateien auswählen
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File Limits Info */}
          <div className="mt-3 px-3 py-2.5 bg-[var(--vektrus-mint)] rounded-lg border border-[var(--vektrus-border-subtle)]">
            <p className="text-[12px] text-[var(--vektrus-gray)]">
              Maximal {maxFiles} Dateien, je bis zu 50 MB
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-5">
              <h4 className="text-[13px] font-medium text-[var(--vektrus-anthrazit)] mb-2.5">
                Ausgewählt ({selectedFiles.length})
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2.5 bg-[var(--vektrus-mint)] rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {getFileIcon(file)}
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[var(--vektrus-anthrazit)] truncate">
                          {file.name}
                        </div>
                        <div className="text-[12px] text-[var(--vektrus-gray)]">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-[var(--vektrus-gray)] hover:text-[var(--vektrus-error)] transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--vektrus-border-default)] flex items-center justify-between">
          <div className="text-[13px] text-[var(--vektrus-gray)]">
            {selectedFiles.length === 0
              ? 'Keine Dateien ausgewählt'
              : `${selectedFiles.length} Datei${selectedFiles.length > 1 ? 'en' : ''} bereit`
            }
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-[var(--vektrus-border-default)] text-[var(--vektrus-gray)] hover:text-[var(--vektrus-anthrazit)] hover:border-[var(--vektrus-border-strong)] rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-colors"
            >
              Abbrechen
            </button>

            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--vektrus-radius-sm)] text-[13px] font-medium transition-all duration-200 ${
                selectedFiles.length > 0 && !uploading
                  ? 'bg-[var(--vektrus-blue)] hover:bg-[#3a9fd1] text-white shadow-subtle hover:shadow-card'
                  : 'bg-[var(--vektrus-blue)]/10 text-[var(--vektrus-gray)] cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Hochladen...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Hochladen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUploadModal;