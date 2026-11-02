import { DownloadTask, MediaItem, MediaQuality, Folder } from '../types';
import { extractMediaInfo, formatBytes, getTodayDateKey } from './mediaExtractor';
import { dbService } from './db';
import JSZip from 'jszip';

type Listener = (tasks: DownloadTask[]) => void;

class DownloadManager {
  private tasks: Map<string, DownloadTask> = new Map();
  private listeners: Set<Listener> = new Set();
  private abortControllers: Map<string, AbortController> = new Map();
  private onTaskCompletedCallbacks: ((item: MediaItem) => void)[] = [];

  constructor() {
    // initialize
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getAllTasks());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onMediaCompleted(cb: (item: MediaItem) => void) {
    this.onTaskCompletedCallbacks.push(cb);
  }

  private notify() {
    const list = this.getAllTasks();
    this.listeners.forEach((l) => l(list));
  }

  public getAllTasks(): DownloadTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public async startDownload(
    url: string,
    quality: MediaQuality = '1080p',
    targetFolderId = 'social'
  ): Promise<string> {
    const info = extractMediaInfo(url);
    const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const mediaId = 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const qualityConfig =
      info.availableQualities.find((q) => q.quality === quality) ||
      info.availableQualities[0];

    const totalBytes = qualityConfig ? qualityConfig.estimatedSizeBytes : 15 * 1024 * 1024;

    const task: DownloadTask = {
      id: taskId,
      mediaId,
      title: info.title,
      sourceUrl: url,
      platform: info.platform,
      type: info.type,
      quality,
      targetFolderId,
      progress: 0,
      totalBytes,
      downloadedBytes: 0,
      speedBytesPerSec: 0,
      status: 'downloading',
      createdAt: Date.now(),
      thumbnailUrl: info.thumbnailUrl,
    };

    this.tasks.set(taskId, task);
    this.notify();

    // Start background download stream
    this.processDownloadTask(task, info, qualityConfig.url, qualityConfig.format);

    return taskId;
  }

  private async processDownloadTask(
    task: DownloadTask,
    info: ReturnType<typeof extractMediaInfo>,
    targetUrl: string,
    format: string
  ) {
    const controller = new AbortController();
    this.abortControllers.set(task.id, controller);

    const totalBytes = task.totalBytes;
    const chunkSize = Math.max(1024 * 128, Math.floor(totalBytes / 25)); // ~25 steps
    let downloaded = 0;
    let lastTime = Date.now();
    let lastDownloaded = 0;

    // Check if real CORS fetch is possible or simulated streaming
    let fetchedBlob: Blob | null = null;
    try {
      if (targetUrl.startsWith('http')) {
        // Attempt quick non-blocking fetch with fallback
        fetch(targetUrl, { mode: 'cors' })
          .then((res) => {
            if (res.ok) return res.blob();
            return null;
          })
          .then((blob) => {
            if (blob) fetchedBlob = blob;
          })
          .catch(() => {
            // CORS blocked or offline, use fallback synthetic blob
          });
      }
    } catch {
      // safe fallback
    }

    const interval = setInterval(async () => {
      if (controller.signal.aborted) {
        clearInterval(interval);
        return;
      }

      const currentTask = this.tasks.get(task.id);
      if (!currentTask || currentTask.status === 'paused') {
        return;
      }

      // Add random jitter to simulate real network bursts
      const variance = 0.7 + Math.random() * 0.6;
      const stepBytes = Math.min(Math.floor(chunkSize * variance), totalBytes - downloaded);
      downloaded += stepBytes;

      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000;
      let speed = 0;
      if (timeDiff > 0) {
        speed = Math.floor((downloaded - lastDownloaded) / timeDiff);
      }
      lastTime = now;
      lastDownloaded = downloaded;

      const progress = Math.min(100, Math.floor((downloaded / totalBytes) * 100));

      currentTask.downloadedBytes = downloaded;
      currentTask.progress = progress;
      currentTask.speedBytesPerSec = speed;

      if (progress >= 100) {
        clearInterval(interval);
        currentTask.status = 'completed';
        currentTask.speedBytesPerSec = 0;
        this.notify();

        // Create completed MediaItem
        const newMediaItem: MediaItem = {
          id: task.mediaId,
          title: task.title,
          description: info.description,
          sourceUrl: task.sourceUrl,
          platform: task.platform,
          type: task.type,
          format,
          quality: task.quality,
          sizeBytes: totalBytes,
          durationSeconds: info.durationSeconds,
          dimensions: info.dimensions,
          thumbnailUrl: info.thumbnailUrl,
          mediaUrl: targetUrl,
          hasBlobData: !!fetchedBlob,
          folderId: task.targetFolderId,
          createdAt: Date.now(),
          dateKey: getTodayDateKey(),
          author: info.author,
          tags: info.tags,
          isFavorite: false,
        };

        await dbService.saveMedia(newMediaItem, fetchedBlob || undefined);
        this.onTaskCompletedCallbacks.forEach((cb) => cb(newMediaItem));
      } else {
        this.notify();
      }
    }, 180);
  }

  public pauseTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'downloading') {
      task.status = 'paused';
      task.speedBytesPerSec = 0;
      this.notify();
    }
  }

  public resumeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'downloading';
      this.notify();
    }
  }

  public cancelTask(taskId: string): void {
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }
    this.tasks.delete(taskId);
    this.notify();
  }

  public retryTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.progress = 0;
      task.downloadedBytes = 0;
      task.status = 'downloading';
      const info = extractMediaInfo(task.sourceUrl);
      const qualityConfig =
        info.availableQualities.find((q) => q.quality === task.quality) ||
        info.availableQualities[0];
      this.processDownloadTask(task, info, qualityConfig.url, qualityConfig.format);
      this.notify();
    }
  }

  public clearCompletedTasks(): void {
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === 'completed' || task.status === 'failed') {
        this.tasks.delete(id);
      }
    }
    this.notify();
  }

  // Cross Platform Batch Export as ZIP
  public async exportMediaAsZip(items: MediaItem[], zipName = 'ClipVault_Downloads.zip'): Promise<void> {
    const zip = new JSZip();
    const manifest = items.map((item) => ({
      id: item.id,
      title: item.title,
      platform: item.platform,
      type: item.type,
      author: item.author.handle,
      sourceUrl: item.sourceUrl,
      savedAt: new Date(item.createdAt).toISOString(),
    }));

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const safeTitle = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
      const fileName = `${item.platform}_${safeTitle}_${item.id.slice(-4)}.${item.format || (item.type === 'video' ? 'mp4' : 'jpg')}`;

      try {
        const localBlob = await dbService.getMediaBlob(item.id);
        if (localBlob) {
          zip.file(fileName, localBlob);
        } else {
          // fetch or embed reference card
          const res = await fetch(item.thumbnailUrl);
          if (res.ok) {
            const blob = await res.blob();
            zip.file(fileName, blob);
          }
        }
      } catch (err) {
        console.warn(`Could not bundle file ${fileName}:`, err);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Save single item to disk
  public async downloadFileToDisk(item: MediaItem): Promise<void> {
    try {
      const localBlob = await dbService.getMediaBlob(item.id);
      let downloadUrl = item.mediaUrl;
      let cleanup = false;

      if (localBlob) {
        downloadUrl = URL.createObjectURL(localBlob);
        cleanup = true;
      }

      const safeTitle = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 35);
      const fileName = `${item.platform}_${safeTitle}.${item.format || (item.type === 'video' ? 'mp4' : 'jpg')}`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (cleanup) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
      }
    } catch (e) {
      console.error('Download failed:', e);
      window.open(item.mediaUrl, '_blank');
    }
  }
}

export const downloadManager = new DownloadManager();
