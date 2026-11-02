export type MediaPlatform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'pinterest'
  | 'reddit'
  | 'facebook'
  | 'threads'
  | 'direct'
  | 'other';

export type MediaType = 'image' | 'video' | 'audio';

export type MediaQuality =
  | '4k'
  | '1080p'
  | '720p'
  | '480p'
  | 'original'
  | 'hd'
  | 'audio-mp3';

export interface MediaAuthor {
  name: string;
  handle: string;
  avatarUrl: string;
  verified?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  sourceUrl: string;
  platform: MediaPlatform;
  type: MediaType;
  format: string; // e.g. 'mp4', 'jpg', 'png', 'mp3', 'webm'
  quality: MediaQuality;
  sizeBytes: number;
  durationSeconds?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnailUrl: string;
  mediaUrl: string; // Direct Blob URL or Remote URL
  hasBlobData?: boolean;
  folderId: string;
  createdAt: number; // timestamp
  dateKey: string; // YYYY-MM-DD for grouping
  author: MediaAuthor;
  tags: string[];
  isFavorite: boolean;
}

export interface Folder {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description?: string;
  createdAt: number;
  isSystem?: boolean;
}

export interface DownloadTask {
  id: string;
  mediaId: string;
  title: string;
  sourceUrl: string;
  platform: MediaPlatform;
  type: MediaType;
  quality: MediaQuality;
  targetFolderId: string;
  progress: number; // 0 to 100
  totalBytes: number;
  downloadedBytes: number;
  speedBytesPerSec: number;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';
  error?: string;
  createdAt: number;
  thumbnailUrl: string;
}

export interface ExtractedMediaInfo {
  title: string;
  description: string;
  platform: MediaPlatform;
  type: MediaType;
  author: MediaAuthor;
  thumbnailUrl: string;
  availableQualities: {
    quality: MediaQuality;
    label: string;
    format: string;
    estimatedSizeBytes: number;
    url: string;
  }[];
  durationSeconds?: number;
  dimensions?: { width: number; height: number };
  tags: string[];
}

export interface AppSettings {
  autoClipboardDetection: boolean;
  autoDownloadOnCopy: boolean;
  defaultFolderId: string;
  defaultVideoQuality: MediaQuality;
  darkMode: boolean;
  saveToDeviceDirectly: boolean;
  notifyOnComplete: boolean;
}
