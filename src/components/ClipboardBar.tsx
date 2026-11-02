import React, { useState, useEffect } from 'react';
import {
  Clipboard,
  Download,
  Link as LinkIcon,
  Sparkles,
  Layers,
  FolderOpen,
  ChevronDown,
  Check,
  Zap,
  Globe,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { MediaPlatform, MediaQuality, Folder } from '../types';
import { detectPlatform, isValidMediaUrl, SAMPLE_PRESETS } from '../services/mediaExtractor';
import { clipboardMonitor } from '../services/clipboardMonitor';

interface ClipboardBarProps {
  onStartDownload: (url: string, quality: MediaQuality, folderId: string) => void;
  folders: Folder[];
  defaultFolderId: string;
  defaultQuality: MediaQuality;
  autoClipboardEnabled: boolean;
  onToggleAutoClipboard: (val: boolean) => void;
  onOpenSamplePreview: () => void;
}

export const ClipboardBar: React.FC<ClipboardBarProps> = ({
  onStartDownload,
  folders,
  defaultFolderId,
  defaultQuality,
  autoClipboardEnabled,
  onToggleAutoClipboard,
  onOpenSamplePreview,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<MediaQuality>(defaultQuality);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId);
  const [detectedPlatform, setDetectedPlatform] = useState<MediaPlatform>('other');
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    setSelectedQuality(defaultQuality);
  }, [defaultQuality]);

  useEffect(() => {
    setSelectedFolderId(defaultFolderId);
  }, [defaultFolderId]);

  useEffect(() => {
    if (urlInput) {
      setDetectedPlatform(detectPlatform(urlInput));
    } else {
      setDetectedPlatform('other');
    }
  }, [urlInput]);

  const handlePasteFromClipboard = async () => {
    const text = await clipboardMonitor.readClipboardText();
    if (text) {
      setUrlInput(text);
      setDetectedPlatform(detectPlatform(text));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!isValidMediaUrl(cleanUrl)) return;

    onStartDownload(cleanUrl, selectedQuality, selectedFolderId);
    setUrlInput('');
  };

  const handlePresetSelect = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setShowPresets(false);
  };

  const getPlatformBadge = (platform: MediaPlatform) => {
    switch (platform) {
      case 'instagram':
        return { label: 'Instagram Reel/Post', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' };
      case 'tiktok':
        return { label: 'TikTok Video', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
      case 'youtube':
        return { label: 'YouTube / Shorts', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
      case 'twitter':
        return { label: 'X / Twitter Post', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' };
      case 'pinterest':
        return { label: 'Pinterest Pin', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'reddit':
        return { label: 'Reddit Media', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
      case 'facebook':
        return { label: 'Facebook Video', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'threads':
        return { label: 'Threads Media', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'direct':
        return { label: 'Direct Media File', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      default:
        return { label: 'Auto Detect URL', bg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' };
    }
  };

  const activeFolder = folders.find((f) => f.id === selectedFolderId) || folders[0] || {
    id: 'social',
    name: 'Social Reels',
    color: '#ec4899',
  };

  const badge = getPlatformBadge(detectedPlatform);

  return (
    <div
      id="clipboard-hero-container"
      className="w-full bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-zinc-900/60 dark:via-zinc-950 dark:to-transparent pt-6 pb-4 border-b border-zinc-200/70 dark:border-zinc-800/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Top Control Bar: Auto-Capture Toggle & Sample Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <label
              htmlFor="auto-detect-toggle"
              className="flex items-center gap-2 cursor-pointer select-none bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="relative">
                <input
                  id="auto-detect-toggle"
                  type="checkbox"
                  checked={autoClipboardEnabled}
                  onChange={(e) => onToggleAutoClipboard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Auto-Download Clipboard Links
              </span>
            </label>

            <span className="text-zinc-400 dark:text-zinc-500 hidden sm:inline">•</span>

            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              Copies on any app will automatically trigger download
            </span>
          </div>

          {/* Quick Presets & Sample Preview Dropdown */}
          <div className="flex items-center gap-2">
            <button
              id="sample-preview-lab-btn"
              type="button"
              onClick={onOpenSamplePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/70 dark:to-purple-950/70 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/70 dark:hover:to-purple-900/70 text-indigo-700 dark:text-indigo-300 font-semibold transition-all border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs cursor-pointer"
              title="Preview working video & photo samples before downloading"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sample Preview</span>
            </button>

            <div className="relative">
              <button
                id="try-preset-btn"
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                <span>Sample Links</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {showPresets && (
                <div
                  id="presets-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-40 space-y-1"
                >
                  <div className="px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Quick Sample URLs
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPresets(false);
                        onOpenSamplePreview();
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Full Preview</span>
                    </button>
                  </div>
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(preset.url)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <img
                        src={preset.previewThumb}
                        alt={preset.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {preset.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  ))}

                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPresets(false);
                        onOpenSamplePreview();
                      }}
                      className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl text-center text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Open Interactive Sample Previewer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Input Form with M3 Aesthetics */}
        <form
          id="url-input-form"
          onSubmit={handleSubmit}
          className="relative bg-white dark:bg-zinc-900 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/50 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center gap-2"
        >
          {/* Left: Input with Platform Tag */}
          <div className="relative flex-1 flex items-center min-w-0 px-2">
            <LinkIcon className="w-5 h-5 text-zinc-400 shrink-0 mr-2.5" />
            <input
              id="media-url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste Instagram, TikTok, YouTube Shorts, X, or Pinterest link here..."
              className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none py-2"
            />

            {/* Platform Detection Pill */}
            {urlInput && (
              <span
                id="detected-platform-badge"
                className={`shrink-0 ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg}`}
              >
                {badge.label}
              </span>
            )}
          </div>

          {/* Action Row: Quality & Folder Selectors + Paste & Download buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/80">
            {/* Quick Paste Button */}
            <button
              id="paste-clipboard-btn"
              type="button"
              onClick={handlePasteFromClipboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              title="Paste URL from Clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Paste</span>
            </button>

            {/* Target Folder Selector Dropdown */}
            <div className="relative">
              <button
                id="folder-select-btn"
                type="button"
                onClick={() => {
                  setIsFolderOpen(!isFolderOpen);
                  setIsQualityOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700/60"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activeFolder.color || '#6366f1' }}
                />
                <span className="truncate max-w-[100px]">{activeFolder.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isFolderOpen && (
                <div
                  id="folder-select-menu"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-1.5 z-40 space-y-0.5"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Save to Folder:
                  </div>
                  {folders
                    .filter((f) => f.id !== 'all')
                    .map((folder) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          setSelectedFolderId(folder.id);
                          setIsFolderOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: folder.color }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        {selectedFolderId === folder.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Quality Selector Dropdown */}
            <div className="relative">
              <button
                id="quality-select-btn"
                type="button"
                onClick={() => {
                  setIsQualityOpen(!isQualityOpen);
                  setIsFolderOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700/60"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {selectedQuality === '4k'
                    ? '4K (2160p)'
                    : selectedQuality === '1080p'
                    ? '1080p Full HD'
                    : selectedQuality === '720p'
                    ? '720p HD'
                    : selectedQuality === 'audio-mp3'
                    ? 'MP3 Audio'
                    : 'Original'}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isQualityOpen && (
                <div
                  id="quality-select-menu"
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-1.5 z-40 space-y-0.5"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Target Quality:
                  </div>
                  {[
                    { id: '4k' as MediaQuality, label: '4K Ultra HD (2160p)', desc: 'Best clarity' },
                    { id: '1080p' as MediaQuality, label: '1080p Full HD', desc: 'Recommended' },
                    { id: '720p' as MediaQuality, label: '720p Standard HD', desc: 'Faster download' },
                    { id: 'audio-mp3' as MediaQuality, label: 'MP3 Audio Extract', desc: 'Sound only' },
                    { id: 'original' as MediaQuality, label: 'Original Source', desc: 'For images/raw' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuality(q.id);
                        setIsQualityOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="font-semibold">{q.label}</p>
                        <p className="text-[10px] text-zinc-400">{q.desc}</p>
                      </div>
                      {selectedQuality === q.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Download Button */}
            <button
              id="start-download-btn"
              type="submit"
              disabled={!urlInput.trim()}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                urlInput.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
