import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  Film,
  Image as ImageIcon,
  ExternalLink,
  Folder as FolderIcon,
  Video,
} from 'lucide-react';
import { Folder, MediaQuality, MediaPlatform } from '../types';
import { SAMPLE_PRESETS, extractMediaInfo, formatDuration } from '../services/mediaExtractor';

interface SamplePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  defaultFolderId: string;
  defaultQuality: MediaQuality;
  onStartDownload: (url: string, quality: MediaQuality, folderId: string) => void;
}

export const SamplePreviewModal: React.FC<SamplePreviewModalProps> = ({
  isOpen,
  onClose,
  folders,
  defaultFolderId,
  defaultQuality,
  onStartDownload,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<MediaQuality>(defaultQuality);
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolderId);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentPreset = SAMPLE_PRESETS[selectedIndex] || SAMPLE_PRESETS[0];
  const extracted = extractMediaInfo(currentPreset.url);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentPreset.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // safe
    }
  };

  const handleDownload = () => {
    onStartDownload(currentPreset.url, selectedQuality, selectedFolder);
    onClose();
  };

  return (
    <div
      id="sample-preview-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="sample-preview-card"
        className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Interactive Sample Media Feed
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Preview live video streams, high-res photos & test one-click auto-capture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Carousel / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SAMPLE_PRESETS.map((preset, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shrink-0 text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <img
                  src={preset.previewThumb}
                  alt={preset.title}
                  className="w-5 h-5 rounded-md object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="truncate max-w-[140px]">{preset.platform.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Live Preview Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Video / Image Player */}
          <div className="md:col-span-7 bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[420px] relative border border-zinc-800 shadow-inner">
            {extracted.type === 'video' ? (
              <video
                key={extracted.availableQualities[0]?.url}
                src={extracted.availableQualities[0]?.url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full max-h-[400px] object-contain"
              />
            ) : (
              <img
                src={extracted.thumbnailUrl}
                alt={extracted.title}
                className="w-full h-full max-h-[400px] object-contain"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
              {extracted.type === 'video' ? (
                <Film className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{extracted.platform}</span>
            </div>
          </div>

          {/* Right: Metadata & Download Controls */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <img
                  src={extracted.author.avatarUrl}
                  alt={extracted.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {extracted.author.name}
                    </p>
                    {extracted.author.verified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {extracted.author.handle}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                  {extracted.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-3">
                  {extracted.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {extracted.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Download Option Selectors */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Quality
                  </label>
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value as MediaQuality)}
                    className="w-full px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="4k">4K (2160p)</option>
                    <option value="1080p">1080p FHD</option>
                    <option value="720p">720p HD</option>
                    <option value="audio-mp3">MP3 Audio</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Save To
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    {folders
                      .filter((f) => f.id !== 'all' && f.id !== 'favorites')
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="sample-start-download-btn"
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save to ClipVault</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'URL Copied to Clipboard!' : 'Copy Social Media URL'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
