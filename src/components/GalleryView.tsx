import React, { useState, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  Grid,
  List,
  Calendar,
  Archive,
  CheckSquare,
  Square,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import { Folder, MediaItem, MediaPlatform, MediaType } from '../types';
import { MediaCard } from './MediaCard';
import { getDateGroupTitle } from '../services/mediaExtractor';

interface GalleryViewProps {
  mediaItems: MediaItem[];
  folders: Folder[];
  selectedFolderId: string;
  selectedDateFilter: string;
  selectedPlatform: MediaPlatform | 'all';
  selectedType: MediaType | 'all';
  onlyFavorites: boolean;
  selectedItemIds: Set<string>;
  onToggleSelectItem: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onOpenLightbox: (item: MediaItem) => void;
  onDownloadItem: (item: MediaItem) => void;
  onShareItem: (item: MediaItem) => void;
  onToggleFavorite: (id: string, currentVal: boolean) => void;
  onMoveFolder: (id: string, newFolderId: string) => void;
  onDeleteItem: (id: string) => void;
  onDownloadGroupZip: (items: MediaItem[], groupName: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  mediaItems,
  folders,
  selectedFolderId,
  selectedDateFilter,
  selectedPlatform,
  selectedType,
  onlyFavorites,
  selectedItemIds,
  onToggleSelectItem,
  onSelectAll,
  onOpenLightbox,
  onDownloadItem,
  onShareItem,
  onToggleFavorite,
  onMoveFolder,
  onDeleteItem,
  onDownloadGroupZip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'masonry' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'duration'>('newest');

  // Filtered items
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      // Folder filter
      if (selectedFolderId !== 'all') {
        if (selectedFolderId === 'favorites') {
          if (!item.isFavorite) return false;
        } else if (item.folderId !== selectedFolderId) {
          return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }

      // Favorites only
      if (onlyFavorites && !item.isFavorite) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAuthor =
          item.author.name.toLowerCase().includes(q) ||
          item.author.handle.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthor && !matchTags) return false;
      }

      return true;
    });
  }, [mediaItems, selectedFolderId, selectedPlatform, selectedType, onlyFavorites, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'largest') return b.sizeBytes - a.sizeBytes;
      if (sortBy === 'duration') return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      return 0;
    });
  }, [filteredItems, sortBy]);

  // Group by Date for timeline view
  const groupedByDate = useMemo(() => {
    const groups: { [dateKey: string]: MediaItem[] } = {};
    sortedItems.forEach((item) => {
      const key = item.dateKey || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [sortedItems]);

  const allFilteredIds = useMemo(() => sortedItems.map((i) => i.id), [sortedItems]);
  const isAllSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedItemIds.has(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(allFilteredIds);
    }
  };

  const currentFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <main id="gallery-main" className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Gallery Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Count */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {currentFolder ? currentFolder.name : 'Saved Media'}
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {sortedItems.length}
            </span>
          </div>
          {currentFolder?.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {currentFolder.description}
            </p>
          )}
        </div>

        {/* Search, Sort, View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              id="gallery-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, tag..."
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Sort selector */}
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="largest">Largest Size</option>
            <option value="duration">Longest Duration</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('masonry')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewLayout === 'masonry'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Compact View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewLayout === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Select all button */}
          {sortedItems.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Deselect All</span>
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 text-zinc-400" />
                  <span>Select All ({sortedItems.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Media Grid / Date Sections */}
      {sortedItems.length === 0 ? (
        <div
          id="empty-gallery-state"
          className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4"
        >
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              No media saved in this view
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Paste any Instagram Reel, TikTok, YouTube Short, or X link above to auto-download, or try our sample links.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(groupedByDate) as [string, MediaItem[]][]).map(([dateKey, itemsInDate]) => {
            const dateTitle = getDateGroupTitle(dateKey);

            return (
              <section key={dateKey} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {dateTitle}
                    </h3>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                      ({itemsInDate.length})
                    </span>
                  </div>

                  {/* Export this group as ZIP */}
                  <button
                    type="button"
                    onClick={() => onDownloadGroupZip(itemsInDate, dateTitle)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium cursor-pointer"
                    title="Export all items in this date group as ZIP"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download Group ZIP</span>
                  </button>
                </div>

                {/* Cards Container */}
                <div
                  className={
                    viewLayout === 'list'
                      ? 'space-y-2'
                      : viewLayout === 'masonry'
                        ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                        : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  }
                >
                  {itemsInDate.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      folders={folders}
                      isSelected={selectedItemIds.has(item.id)}
                      onToggleSelect={onToggleSelectItem}
                      onOpenLightbox={onOpenLightbox}
                      onDownloadItem={onDownloadItem}
                      onShareItem={onShareItem}
                      onToggleFavorite={onToggleFavorite}
                      onMoveFolder={onMoveFolder}
                      onDeleteItem={onDeleteItem}
                      viewMode={viewLayout}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
};
