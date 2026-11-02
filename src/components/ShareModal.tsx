import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageSquare,
  Send,
  Mail,
  QrCode,
} from 'lucide-react';
import { MediaItem } from '../types';
import { downloadManager } from '../services/downloadManager';

interface ShareModalProps {
  item: MediaItem;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.sourceUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(
        `${item.title} by ${item.author.name} (${item.author.handle})\n${item.sourceUrl}`
      );
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out this clip by ${item.author.name}`,
          url: item.sourceUrl,
        });
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="share-modal-card"
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Share Media Item
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Thumbnail */}
        <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {item.title}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {item.author.name} • {item.platform.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Quick copy links */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono flex-1 pl-2">
              {item.sourceUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyTitle}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {copiedTitle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Full Caption & Attribution</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => downloadManager.downloadFileToDisk(item)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save to Device</span>
          </button>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Link</span>
          </a>
        </div>
      </div>
    </div>
  );
};
