import React, { useState, useRef } from 'react';
import { X, Upload, Image, Video, File, Check, AlertTriangle } from 'lucide-react';

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
      return <Image className="w-5 h-5 text-[#49B7E3]" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-5 h-5 text-[#49B7E3]" />;
    }
    return <File className="w-5 h-5 text-[#7A7A7A]" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[var(--vektrus-radius-lg)] shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(73,183,227,0.18)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#111111] font-manrope">Medien hochladen</h2>
              <p className="text-sm text-[#7A7A7A] mt-1">
                Bilder und Videos für deine Content-Bibliothek
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7A7A7A] hover:text-[#111111] hover:bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[var(--vektrus-radius-md)] p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-[#B6EBF7] bg-[#B6EBF7]/10' 
                : 'border-[rgba(73,183,227,0.18)] hover:border-[#B6EBF7]'
            }`}
          >
            <div className="w-16 h-16 bg-[#B6EBF7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-[#49B7E3]" />
            </div>
            
            <h3 className="text-lg font-medium text-[#111111] mb-2">
              Dateien hierher ziehen oder hochladen
            </h3>
            <p className="text-[#7A7A7A] mb-4">
              Unterstützt: JPG, PNG, WebP, GIF, MP4, MOV, AVI, WebM
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-[#49B7E3] hover:bg-[#3a9fd1] text-white rounded-[10px] font-medium shadow-card hover:shadow-elevated transition-all"
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
          <div className="mt-4 p-4 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)] border border-[#B6EBF7]">
            <div className="flex items-center space-x-2 text-sm text-[#111111]">
              <AlertTriangle className="w-4 h-4 text-[#F4BE9D]" />
              <span>Maximal {maxFiles} Dateien, je bis zu 50MB</span>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-[#111111] mb-3">
                Ausgewählte Dateien ({selectedFiles.length})
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F4FCFE] rounded-[var(--vektrus-radius-sm)]">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#111111] text-sm truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-[#7A7A7A]">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-[#7A7A7A] hover:text-[#FA7E70] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[rgba(73,183,227,0.18)] flex items-center justify-between">
          <div className="text-sm text-[#7A7A7A]">
            {selectedFiles.length === 0 
              ? 'Keine Dateien ausgewählt'
              : `${selectedFiles.length} Datei${selectedFiles.length > 1 ? 'en' : ''} bereit zum Upload`
            }
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[rgba(73,183,227,0.18)] hover:border-[#49B7E3] text-[#7A7A7A] hover:text-[#111111] rounded-[10px] font-medium transition-colors"
            >
              Abbrechen
            </button>
            
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-[10px] font-medium transition-all duration-200 ${
                selectedFiles.length > 0 && !uploading
                  ? 'bg-[#49B7E3] hover:bg-[#3a9fd1] text-white shadow-card hover:shadow-elevated'
                  : 'bg-[rgba(73,183,227,0.12)] text-[#7A7A7A] cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Hochladen...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
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