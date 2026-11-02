import React from 'react';
import {
  Download,
  Sun,
  Moon,
  Settings,
  Sparkles,
  Layers,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes } from '../services/mediaExtractor';

interface HeaderProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  activeDownloadsCount: number;
  totalItemsCount: number;
  totalStorageBytes: number;
  autoClipboardEnabled: boolean;
  onOpenSettings: () => void;
  onOpenQueue: () => void;
  onOpenSamplePreview: () => void;
  onSelectSamplePreset?: (url: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleTheme,
  activeDownloadsCount,
  totalItemsCount,
  totalStorageBytes,
  autoClipboardEnabled,
  onOpenSettings,
  onOpenQueue,
  onOpenSamplePreview,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 lg:px-8 py-3 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight">
                ClipVault
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 hidden sm:block">
              Universal Social Media & Video Downloader
            </p>
          </div>
        </div>

        {/* Stats indicators */}
        <div className="hidden md:flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {totalItemsCount}
            </span>
            <span>items saved</span>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
            title="View Storage Analytics & Distribution"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {formatBytes(totalStorageBytes)}
            </span>
            <span>storage</span>
          </button>

          {autoClipboardEnabled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
              <span className="font-medium">Auto-Clip Active</span>
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Preview Trigger */}
          <button
            id="header-sample-preview-btn"
            type="button"
            onClick={onOpenSamplePreview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-pink-500/20 text-indigo-600 dark:text-indigo-300 font-semibold text-xs border border-indigo-500/20 transition-all cursor-pointer shadow-xs"
            title="Preview sample videos and social posts"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Sample Preview</span>
          </button>

          {/* Download Queue Trigger */}
          <button
            id="download-queue-btn"
            type="button"
            onClick={onOpenQueue}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Queue</span>
            {activeDownloadsCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full animate-pulse">
                {activeDownloadsCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Settings Trigger */}
          <button
            id="settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            title="Download & Automation Settings"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
