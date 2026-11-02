import React, { useState } from 'react';
import {
  Play,
  Download,
  Share2,
  Heart,
  MoreVertical,
  Trash2,
  FolderInput,
  Film,
  Image as ImageIcon,
  Music,
  ExternalLink,
  Check,
} from 'lucide-react';
import { MediaItem, Folder } from '../types';
import { formatBytes, formatDuration } from '../services/mediaExtractor';

interface MediaCardProps {
  item: MediaItem;
  folders: Folder[];
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (item: MediaItem) => void;
  onDownloadItem: (item: MediaItem) => void;
  onShareItem: (item: MediaItem) => void;
  onToggleFavorite: (id: string, currentVal: boolean) => void;
  onMoveFolder: (id: string, newFolderId: string) => void;
  onDeleteItem: (id: string) => void;
  viewMode?: 'grid' | 'masonry' | 'list';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  folders,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  onDownloadItem,
  onShareItem,
  onToggleFavorite,
  onMoveFolder,
  onDeleteItem,
  viewMode = 'grid',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  const folder = folders.find((f) => f.id === item.folderId) || {
    id: 'social',
    name: 'Social',
    color: '#6366f1',
  };

  const getPlatformBadge = () => {
    switch (item.platform) {
      case 'instagram':
        return { label: 'Instagram', color: 'bg-pink-500/90' };
      case 'tiktok':
        return { label: 'TikTok', color: 'bg-teal-500/90' };
      case 'youtube':
        return { label: 'YouTube', color: 'bg-red-500/90' };
      case 'twitter':
        return { label: 'X', color: 'bg-sky-500/90' };
      case 'pinterest':
        return { label: 'Pinterest', color: 'bg-rose-500/90' };
      case 'reddit':
        return { label: 'Reddit', color: 'bg-orange-500/90' };
      default:
        return { label: item.platform.toUpperCase(), color: 'bg-zinc-700/90' };
    }
  };

  const badge = getPlatformBadge();

  if (viewMode === 'list') {
    return (
      <div
        id={`media-list-item-${item.id}`}
        className={`group relative flex items-center justify-between gap-4 p-3 rounded-2xl transition-all border ${
          isSelected
            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500'
            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs'
        }`}
      >
        {/* Selection Checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />

          {/* Thumbnail preview */}
          <div
            className="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 bg-zinc-100 dark:bg-zinc-800"
            onClick={() => onOpenLightbox(item)}
          >
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            {item.type === 'video' && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                <Play className="w-4 h-4 fill-white" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                {item.quality.toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400">• {formatBytes(item.sizeBytes)}</span>
            </div>
            <h4
              onClick={() => onOpenLightbox(item)}
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {item.title}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {item.author.name} ({item.author.handle})
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(item.id, item.isFavorite)}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Favorite"
          >
            <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onDownloadItem(item)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Save file to disk"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onShareItem(item)}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteItem(item.id)}
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`media-card-${item.id}`}
      className={`group relative rounded-2xl overflow-hidden transition-all flex flex-col border ${
        isSelected
          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Media Thumbnail Container */}
      <div
        className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer"
        onClick={() => onOpenLightbox(item)}
      >
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Selection Checkbox Overlay */}
        <div
          className="absolute top-2.5 left-2.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-4 h-4 rounded-md text-indigo-600 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs border-zinc-300 focus:ring-indigo-500 cursor-pointer shadow-xs"
          />
        </div>

        {/* Platform Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span
            className={`text-[10px] text-white font-bold px-2 py-0.5 rounded-full shadow-md backdrop-blur-xs ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Video Duration / Image Dimensions Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
          {item.type === 'video' && (
            <span className="text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <Film className="w-3 h-3" />
              {item.durationSeconds ? formatDuration(item.durationSeconds) : 'Video'}
            </span>
          )}
          {item.type === 'image' && (
            <span className="text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Photo
            </span>
          )}
          {item.type === 'audio' && (
            <span className="text-[10px] font-bold text-white bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <Music className="w-3 h-3" />
              Audio
            </span>
          )}
          <span className="text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-md uppercase">
            {item.quality}
          </span>
        </div>

        {/* Play Overlay Button on Hover */}
        {item.type === 'video' && (
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-indigo-600 ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Creator Profile */}
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={item.author.avatarUrl}
              alt={item.author.name}
              className="w-5 h-5 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
              {item.author.name}
            </span>
            <span className="text-[10px] text-zinc-400 truncate">{item.author.handle}</span>
          </div>

          {/* Title */}
          <h4
            onClick={() => onOpenLightbox(item)}
            className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          >
            {item.title}
          </h4>
        </div>

        {/* Bottom Metadata & Action Icons */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          {/* Folder pill & Size */}
          <div className="flex items-center gap-1.5 truncate">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
              {folder.name}
            </span>
            <span className="text-[10px] text-zinc-400">• {formatBytes(item.sizeBytes)}</span>
          </div>

          {/* Action Button Set */}
          <div className="flex items-center gap-1 relative">
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id, item.isFavorite)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Favorite"
            >
              <Heart
                className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => onDownloadItem(item)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Download to device"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onShareItem(item)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(!showMenu);
                  setShowFolderMenu(false);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div
                  id={`media-card-menu-${item.id}`}
                  className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-1 z-30 space-y-0.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowFolderMenu(!showFolderMenu);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FolderInput className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Move to Folder</span>
                    </div>
                  </button>

                  {showFolderMenu && (
                    <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-indigo-200 dark:border-indigo-800 my-1">
                      {folders
                        .filter((f) => f.id !== 'all')
                        .map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              onMoveFolder(item.id, f.id);
                              setShowMenu(false);
                              setShowFolderMenu(false);
                            }}
                            className="w-full flex items-center justify-between p-1.5 rounded text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          >
                            <span className="truncate">{f.name}</span>
                            {item.folderId === f.id && (
                              <Check className="w-3 h-3 text-indigo-500" />
                            )}
                          </button>
                        ))}
                    </div>
                  )}

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Open Source Post</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteItem(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
