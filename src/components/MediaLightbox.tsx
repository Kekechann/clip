import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Folder, MediaItem } from '../types';
import { formatBytes, formatDuration } from '../services/mediaExtractor';

interface MediaLightboxProps {
  item: MediaItem;
  itemsList: MediaItem[];
  folders: Folder[];
  onClose: () => void;
  onNavigate: (item: MediaItem) => void;
  onDownload: (item: MediaItem) => void;
  onShare: (item: MediaItem) => void;
  onToggleFavorite: (id: string, currentVal: boolean) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  item,
  itemsList,
  folders,
  onClose,
  onNavigate,
  onDownload,
  onShare,
  onToggleFavorite,
}) => {
  const [showMetadata, setShowMetadata] = useState(true);

  const currentIndex = itemsList.findIndex((i) => i.id === item.id);
  const prevItem = currentIndex > 0 ? itemsList[currentIndex - 1] : null;
  const nextItem = currentIndex < itemsList.length - 1 ? itemsList[currentIndex + 1] : null;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prevItem) onNavigate(prevItem);
      if (e.key === 'ArrowRight' && nextItem) onNavigate(nextItem);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevItem, nextItem, onClose, onNavigate]);

  const folder = folders.find((f) => f.id === item.folderId);

  return (
    <div
      id="media-lightbox-overlay"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent text-white z-10">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.author.avatarUrl}
            alt={item.author.name}
            className="w-9 h-9 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{item.title}</h3>
            <p className="text-xs text-zinc-400 truncate">
              {item.author.name} ({item.author.handle}) • {item.platform.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id, item.isFavorite)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Toggle Favorite"
          >
            <Heart
              className={`w-5 h-5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
            />
          </button>

          <button
            type="button"
            onClick={() => onShare(item)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Share Media"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onDownload(item)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md transition-colors cursor-pointer"
            title="Download file to device"
          >
            <Download className="w-4 h-4" />
            <span>Save to Device</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showMetadata ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Toggle Info Drawer"
          >
            <Info className="w-5 h-5" />
          </button>

          <button
            id="lightbox-close-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-2"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {/* Navigation arrows */}
        {prevItem && (
          <button
            type="button"
            onClick={() => onNavigate(prevItem)}
            className="absolute left-4 z-20 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {nextItem && (
          <button
            type="button"
            onClick={() => onNavigate(nextItem)}
            className="absolute right-4 z-20 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs border border-white/10 transition-colors cursor-pointer"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Media Container */}
        <div className="max-h-[80vh] max-w-[85vw] flex items-center justify-center">
          {item.type === 'video' ? (
            <video
              src={item.mediaUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl object-contain bg-black"
            />
          ) : (
            <img
              src={item.mediaUrl || item.thumbnailUrl}
              alt={item.title}
              className="max-h-[78vh] max-w-full rounded-2xl shadow-2xl object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Side Metadata Inspector Drawer */}
        {showMetadata && (
          <div
            id="lightbox-sidebar-info"
            className="absolute right-4 top-4 bottom-4 w-80 bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-zinc-800 p-4 text-zinc-100 overflow-y-auto space-y-4 shadow-2xl z-30"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Media Details
              </span>
              <button
                type="button"
                onClick={() => setShowMetadata(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform & Folder */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Platform</span>
                <span className="font-semibold uppercase">{item.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Quality / Format</span>
                <span className="font-mono uppercase">
                  {item.quality} • {item.format}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">File Size</span>
                <span className="font-mono">{formatBytes(item.sizeBytes)}</span>
              </div>
              {item.durationSeconds ? (
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Duration</span>
                  <span className="font-mono">{formatDuration(item.durationSeconds)}</span>
                </div>
              ) : null}
              {item.dimensions && (
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Resolution</span>
                  <span className="font-mono">
                    {item.dimensions.width} x {item.dimensions.height}
                  </span>
                </div>
              )}
              {folder && (
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Album / Folder</span>
                  <span className="font-medium">{folder.name}</span>
                </div>
              )}
            </div>

            {/* Description & Tags */}
            {item.description && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Caption</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            {item.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-300 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Original Link */}
            <div className="pt-2">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-indigo-400 rounded-xl transition-colors"
              >
                <span>View Original Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="p-3 bg-black/70 flex items-center justify-center gap-2 overflow-x-auto z-10">
        {itemsList.map((i) => {
          const isCurrent = i.id === item.id;
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => onNavigate(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                isCurrent
                  ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/40'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={i.thumbnailUrl}
                alt={i.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
