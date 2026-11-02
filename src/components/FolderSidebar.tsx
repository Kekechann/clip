import React from 'react';
import {
  Folder as FolderIcon,
  Plus,
  Heart,
  Calendar,
  Layers,
  Trash2,
  Filter,
  Film,
  Image as ImageIcon,
  Music,
  Share2,
  Briefcase,
  Globe,
} from 'lucide-react';
import { Folder, MediaItem, MediaPlatform, MediaType } from '../types';

interface FolderSidebarProps {
  folders: Folder[];
  mediaItems: MediaItem[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  selectedDateFilter: string;
  onSelectDateFilter: (filter: string) => void;
  selectedPlatform: MediaPlatform | 'all';
  onSelectPlatform: (platform: MediaPlatform | 'all') => void;
  selectedType: MediaType | 'all';
  onSelectType: (type: MediaType | 'all') => void;
  onlyFavorites: boolean;
  onToggleFavorites: (val: boolean) => void;
  onOpenNewFolderModal: () => void;
  onDeleteFolder: (folderId: string) => void;
}

const PLATFORMS: { id: MediaPlatform | 'all'; label: string; iconColor: string }[] = [
  { id: 'all', label: 'All Sources', iconColor: 'bg-zinc-400' },
  { id: 'instagram', label: 'Instagram', iconColor: 'bg-pink-500' },
  { id: 'tiktok', label: 'TikTok', iconColor: 'bg-teal-500' },
  { id: 'youtube', label: 'YouTube', iconColor: 'bg-red-500' },
  { id: 'twitter', label: 'X / Twitter', iconColor: 'bg-blue-500' },
  { id: 'pinterest', label: 'Pinterest', iconColor: 'bg-rose-600' },
  { id: 'reddit', label: 'Reddit', iconColor: 'bg-orange-500' },
];

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  mediaItems,
  selectedFolderId,
  onSelectFolder,
  selectedDateFilter,
  onSelectDateFilter,
  selectedPlatform,
  onSelectPlatform,
  selectedType,
  onSelectType,
  onlyFavorites,
  onToggleFavorites,
  onOpenNewFolderModal,
  onDeleteFolder,
}) => {
  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Share2':
        return <Share2 className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <FolderIcon className="w-4 h-4" />;
    }
  };

  const getFolderCount = (folderId: string) => {
    if (folderId === 'all') return mediaItems.length;
    if (folderId === 'favorites') return mediaItems.filter((i) => i.isFavorite).length;
    return mediaItems.filter((i) => i.folderId === folderId).length;
  };

  const getPlatformCount = (p: MediaPlatform | 'all') => {
    if (p === 'all') return mediaItems.length;
    return mediaItems.filter((i) => i.platform === p).length;
  };

  const getTypeCount = (t: MediaType | 'all') => {
    if (t === 'all') return mediaItems.length;
    return mediaItems.filter((i) => i.type === t).length;
  };

  return (
    <aside
      id="folder-sidebar"
      className="w-full md:w-64 lg:w-72 p-4 md:border-r border-zinc-200/80 dark:border-zinc-800/80 shrink-0 space-y-6 select-none"
    >
      {/* Folders Section */}
      <div>
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Folders & Albums
          </span>
          <button
            id="add-folder-btn"
            type="button"
            onClick={onOpenNewFolderModal}
            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            title="Create New Folder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            const count = getFolderCount(folder.id);

            return (
              <div
                key={folder.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
                onClick={() => onSelectFolder(folder.id)}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color || '#6366f1' }}
                  />
                  <span className="truncate">{folder.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-mono">
                    {count}
                  </span>
                  {!folder.isSystem && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded transition-opacity"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Filters: Media Types */}
      <div>
        <div className="px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Media Format
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => onSelectType('all')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60'
            }`}
          >
            <Layers className="w-4 h-4 mb-1" />
            <span>All ({getTypeCount('all')})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectType('video')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              selectedType === 'video'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60'
            }`}
          >
            <Film className="w-4 h-4 mb-1" />
            <span>Videos ({getTypeCount('video')})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectType('image')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              selectedType === 'image'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60'
            }`}
          >
            <ImageIcon className="w-4 h-4 mb-1" />
            <span>Images ({getTypeCount('image')})</span>
          </button>
        </div>
      </div>

      {/* Quick Filters: Platforms */}
      <div>
        <div className="px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Source Platform
          </span>
        </div>
        <div className="space-y-1">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            const count = getPlatformCount(platform.id);

            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => onSelectPlatform(platform.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${platform.iconColor}`} />
                  <span>{platform.label}</span>
                </div>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorites Toggle */}
      <div>
        <button
          type="button"
          onClick={() => onToggleFavorites(!onlyFavorites)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
            onlyFavorites
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className={`w-4 h-4 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Favorites Only</span>
          </div>
          <span className="font-mono">
            {mediaItems.filter((i) => i.isFavorite).length}
          </span>
        </button>
      </div>
    </aside>
  );
};
