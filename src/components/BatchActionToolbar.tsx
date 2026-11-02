import React, { useState } from 'react';
import {
  X,
  Archive,
  FolderInput,
  Heart,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { Folder, MediaItem } from '../types';
import { formatBytes } from '../services/mediaExtractor';

interface BatchActionToolbarProps {
  selectedItems: MediaItem[];
  folders: Folder[];
  onDeselectAll: () => void;
  onDownloadZip: () => void;
  onMoveSelected: (folderId: string) => void;
  onFavoriteSelected: () => void;
  onDeleteSelected: () => void;
}

export const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({
  selectedItems,
  folders,
  onDeselectAll,
  onDownloadZip,
  onMoveSelected,
  onFavoriteSelected,
  onDeleteSelected,
}) => {
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  if (selectedItems.length === 0) return null;

  const totalBytes = selectedItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  return (
    <div
      id="batch-action-toolbar"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 dark:bg-zinc-800/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 flex flex-wrap items-center gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Count & size info */}
      <div className="flex items-center gap-2 pr-3 border-r border-zinc-700">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
          {selectedItems.length}
        </div>
        <div className="text-xs">
          <p className="font-semibold leading-tight">Selected</p>
          <p className="text-[11px] text-zinc-400 font-mono">{formatBytes(totalBytes)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Download ZIP */}
        <button
          id="batch-download-zip-btn"
          type="button"
          onClick={onDownloadZip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Download ZIP</span>
        </button>

        {/* Move Folder Menu */}
        <div className="relative">
          <button
            id="batch-move-btn"
            type="button"
            onClick={() => setShowFolderMenu(!showFolderMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            <FolderInput className="w-3.5 h-3.5 text-indigo-400" />
            <span>Move to...</span>
          </button>

          {showFolderMenu && (
            <div
              id="batch-folder-dropdown"
              className="absolute bottom-full mb-2 left-0 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-1.5 space-y-1 z-50 text-left"
            >
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-zinc-400">
                Select Destination
              </div>
              {folders
                .filter((f) => f.id !== 'all' && f.id !== 'favorites')
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onMoveSelected(f.id);
                      setShowFolderMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Favorite all */}
        <button
          id="batch-fav-btn"
          type="button"
          onClick={onFavoriteSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          title="Favorite All"
        >
          <Heart className="w-3.5 h-3.5 fill-amber-400" />
          <span className="hidden sm:inline">Favorite</span>
        </button>

        {/* Delete all */}
        <button
          id="batch-delete-btn"
          type="button"
          onClick={onDeleteSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/80 transition-colors cursor-pointer"
          title="Delete All Selected"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* Dismiss / Deselect */}
      <button
        id="batch-dismiss-btn"
        type="button"
        onClick={onDeselectAll}
        className="p-1 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer ml-1"
        title="Deselect All"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
