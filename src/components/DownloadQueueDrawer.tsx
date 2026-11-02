import React from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderSync,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DownloadTask } from '../types';
import { formatBytes } from '../services/mediaExtractor';

interface DownloadQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: DownloadTask[];
  onPauseTask: (id: string) => void;
  onResumeTask: (id: string) => void;
  onCancelTask: (id: string) => void;
  onRetryTask: (id: string) => void;
  onClearCompleted: () => void;
}

export const DownloadQueueDrawer: React.FC<DownloadQueueDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  onPauseTask,
  onResumeTask,
  onCancelTask,
  onRetryTask,
  onClearCompleted,
}) => {
  if (!isOpen) return null;

  const activeCount = tasks.filter((t) => t.status === 'downloading' || t.status === 'queued').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div
      id="download-queue-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="download-queue-panel"
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Download Manager
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeCount} active • {completedCount} finished
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {completedCount > 0 && (
              <button
                type="button"
                onClick={onClearCompleted}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Clear completed tasks"
              >
                Clear Done
              </button>
            )}
            <button
              id="close-queue-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close task manager"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <FolderSync className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
                No Active Downloads
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs">
                Copy any image or video link to download it automatically into your folders.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2.5 transition-all"
              >
                {/* Top Row: Thumbnail, Title, Platform & Actions */}
                <div className="flex items-start gap-3">
                  <img
                    src={task.thumbnailUrl}
                    alt={task.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-200 dark:bg-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                        {task.platform}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {task.quality.toUpperCase()}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {task.sourceUrl}
                    </p>
                  </div>

                  {/* Task Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {task.status === 'downloading' && (
                      <button
                        type="button"
                        onClick={() => onPauseTask(task.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                        title="Pause"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {task.status === 'paused' && (
                      <button
                        type="button"
                        onClick={() => onResumeTask(task.id)}
                        className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                        title="Resume"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {task.status === 'failed' && (
                      <button
                        type="button"
                        onClick={() => onRetryTask(task.id)}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 cursor-pointer"
                        title="Retry"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCancelTask(task.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'failed'
                          ? 'bg-rose-500'
                          : task.status === 'paused'
                          ? 'bg-amber-500'
                          : 'bg-indigo-600 animate-pulse'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>

                  {/* Progress Stats */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      {task.status === 'completed' && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Saved to folder
                        </span>
                      )}
                      {task.status === 'downloading' && (
                        <span>
                          {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalBytes)} (
                          {formatBytes(task.speedBytesPerSec)}/s)
                        </span>
                      )}
                      {task.status === 'paused' && (
                        <span className="text-amber-600 dark:text-amber-400">Paused</span>
                      )}
                      {task.status === 'failed' && (
                        <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Download failed
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Files saved locally via IndexedDB</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
