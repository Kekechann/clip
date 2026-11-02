import React, { useState } from 'react';
import {
  X,
  Settings,
  Clipboard,
  Zap,
  Folder as FolderIcon,
  Video,
  Trash2,
  HardDrive,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { AppSettings, Folder, MediaItem, MediaQuality } from '../types';
import { formatBytes } from '../services/mediaExtractor';
import { StorageAnalytics } from './StorageAnalytics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  folders: Folder[];
  mediaItems: MediaItem[];
  totalStorageBytes: number;
  totalItemsCount: number;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onClearAllMedia: () => void;
  onOpenSamplePreview: () => void;
  initialTab?: 'analytics' | 'preferences';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  folders,
  mediaItems,
  totalStorageBytes,
  totalItemsCount,
  onUpdateSettings,
  onClearAllMedia,
  onOpenSamplePreview,
  initialTab = 'analytics',
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'preferences'>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {activeTab === 'analytics' ? (
                <PieChartIcon className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                {activeTab === 'analytics' ? 'Storage Analytics & Insights' : 'Preferences & Automation'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {activeTab === 'analytics'
                  ? 'Visual breakdown of storage usage across platforms and media formats'
                  : 'Manage auto-capture, default quality, albums, and storage cleanup'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
          <button
            type="button"
            id="tab-storage-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Storage Analytics</span>
            <span className="px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono">
              {formatBytes(totalStorageBytes)}
            </span>
          </button>

          <button
            type="button"
            id="tab-preferences-automation"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Preferences & Defaults</span>
          </button>
        </div>

        {/* Content based on Active Tab */}
        {activeTab === 'analytics' ? (
          <StorageAnalytics mediaItems={mediaItems} />
        ) : (
          <div className="space-y-6">
            {/* Automation Settings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Clipboard Detection & Capture
              </h4>

              {/* Auto Clipboard Monitor */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Clipboard className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Auto-Detect Clipboard URLs
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Automatically listens when you copy Instagram, TikTok, or YouTube links
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoClipboardDetection}
                  onChange={(e) =>
                    onUpdateSettings({ autoClipboardDetection: e.target.checked })
                  }
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Instant Auto-Download on Copy */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Zap className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Instant Auto-Download on Copy
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Directly starts download without showing confirmation banner
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDownloadOnCopy}
                  onChange={(e) =>
                    onUpdateSettings({ autoDownloadOnCopy: e.target.checked })
                  }
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Default Download Preferences */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Download Defaults
              </h4>

              {/* Default Quality */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Default Resolution
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Target quality for newly queued videos
                    </p>
                  </div>
                </div>
                <select
                  value={settings.defaultVideoQuality}
                  onChange={(e) =>
                    onUpdateSettings({ defaultVideoQuality: e.target.value as MediaQuality })
                  }
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="4k">4K (2160p)</option>
                  <option value="1080p">1080p FHD</option>
                  <option value="720p">720p HD</option>
                  <option value="audio-mp3">Audio MP3</option>
                </select>
              </div>

              {/* Default Folder */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Default Destination Folder
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Automatic destination album
                    </p>
                  </div>
                </div>
                <select
                  value={settings.defaultFolderId}
                  onChange={(e) => onUpdateSettings({ defaultFolderId: e.target.value })}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer"
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

            {/* Quick Testing & Sample Preview */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Sample Media Previewer
                  </p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Explore real video feeds and test one-click saving
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSamplePreview();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Preview Samples
              </button>
            </div>
          </div>
        )}

        {/* Footer: Storage Stats & Cleanup */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Total Storage: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{formatBytes(totalStorageBytes)}</strong> ({totalItemsCount} items)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all saved media items from local storage?')) {
                onClearAllMedia();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
