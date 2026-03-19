import React from 'react';

export interface MediaFile {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  public_url: string;
  storage_path: string;
  generated_by: string;
  generation_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
  isAnimating?: boolean;
  messageType?: 'text' | 'image' | 'loading';
  imageData?: MediaFile;
  imageUrl?: string;
}

export interface ChatAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: 'primary' | 'secondary';
}

export interface ChatContext {
  audience?: string;
  goal?: string;
  platform?: string;
}