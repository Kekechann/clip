import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MediaItem,
  Folder,
  DownloadTask,
  AppSettings,
  MediaQuality,
  MediaPlatform,
  MediaType,
} from './types';
import { dbService } from './services/db';
import { downloadManager } from './services/downloadManager';
import { clipboardMonitor } from './services/clipboardMonitor';
import { seedInitialMediaIfEmpty } from './services/seedData';
import { detectPlatform, isValidMediaUrl } from './services/mediaExtractor';

import { Header } from './components/Header';
import { ClipboardBar } from './components/ClipboardBar';
import { FolderSidebar } from './components/FolderSidebar';
import { GalleryView } from './components/GalleryView';
import { MediaLightbox } from './components/MediaLightbox';
import { DownloadQueueDrawer } from './components/DownloadQueueDrawer';
import { BatchActionToolbar } from './components/BatchActionToolbar';
import { NewFolderModal } from './components/NewFolderModal';
import { SettingsModal } from './components/SettingsModal';
import { SamplePreviewModal } from './components/SamplePreviewModal';
import { ShareModal } from './components/ShareModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';

export default function App() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => ({
    autoClipboardDetection: true,
    autoDownloadOnCopy: true,
    defaultFolderId: 'social',
    defaultVideoQuality: '1080p',
    darkMode: true,
    saveToDeviceDirectly: false,
    notifyOnComplete: true,
  }));

  // Filtering states
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<MediaPlatform | 'all'>('all');
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Batch selections
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Modals & Panels
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSamplePreviewOpen, setIsSamplePreviewOpen] = useState<boolean>(false);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [shareItem, setShareItem] = useState<MediaItem | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string, actionLabel?: string, onAction?: () => void) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      setToasts((prev) => [...prev, { id, type, title, description, actionLabel, onAction }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Load initial data
  useEffect(() => {
    const initApp = async () => {
      await dbService.ready();
      const savedSettings = await dbService.getSettings();
      setSettings(savedSettings);

      await seedInitialMediaIfEmpty();
      const loadedFolders = await dbService.getAllFolders();
      setFolders(loadedFolders);

      const loadedMedia = await dbService.getAllMedia();
      setMediaItems(loadedMedia);
    };

    initApp();
  }, []);

  // Listen to Download Manager tasks
  useEffect(() => {
    const unsubscribe = downloadManager.subscribe((tasks) => {
      setDownloadTasks(tasks);
    });

    downloadManager.onMediaCompleted(async (newItem) => {
      const updatedList = await dbService.getAllMedia();
      setMediaItems(updatedList);
      addToast(
        'success',
        'Download Complete!',
        `Saved "${newItem.title}" to ${newItem.platform.toUpperCase()} folder.`
      );
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
      } catch {
        // confetti optional
      }
    });

    return () => {
      unsubscribe();
    };
  }, [addToast]);

  // Clipboard Auto-Detection Monitor
  useEffect(() => {
    if (settings.autoClipboardDetection) {
      clipboardMonitor.startListening();
    } else {
      clipboardMonitor.stopListening();
    }

    const unsubscribe = clipboardMonitor.subscribe((url, platform, autoTriggered) => {
      if (!isValidMediaUrl(url)) return;

      if (settings.autoDownloadOnCopy) {
        // Auto download right away!
        addToast(
          'clipboard',
          `Detected ${platform.toUpperCase()} Link in Clipboard`,
          `Auto-downloading to "${settings.defaultFolderId}" folder...`
        );
        downloadManager.startDownload(
          url,
          settings.defaultVideoQuality,
          settings.defaultFolderId
        );
        setIsQueueOpen(true);
      } else {
        // Prompt user with 1-click action
        addToast(
          'clipboard',
          `Found ${platform.toUpperCase()} Media Link`,
          url.substring(0, 45) + '...',
          'Download Now',
          () => {
            downloadManager.startDownload(
              url,
              settings.defaultVideoQuality,
              settings.defaultFolderId
            );
            setIsQueueOpen(true);
          }
        );
      }
    });

    return () => {
      unsubscribe();
      clipboardMonitor.stopListening();
    };
  }, [settings.autoClipboardDetection, settings.autoDownloadOnCopy, settings.defaultFolderId, settings.defaultVideoQuality, addToast]);

  // Start Download handler
  const handleStartDownload = useCallback(
    async (url: string, quality: MediaQuality, folderId: string) => {
      const platform = detectPlatform(url);
      addToast(
        'info',
        `Extracting ${platform.toUpperCase()} Media...`,
        'Connecting and initiating download task.'
      );
      await downloadManager.startDownload(url, quality, folderId);
      setIsQueueOpen(true);
    },
    [addToast]
  );

  // Toggle favorite
  const handleToggleFavorite = async (id: string, currentVal: boolean) => {
    await dbService.updateMedia(id, { isFavorite: !currentVal });
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !currentVal } : item))
    );
    if (lightboxItem?.id === id) {
      setLightboxItem((prev) => (prev ? { ...prev, isFavorite: !currentVal } : null));
    }
  };

  // Move item to folder
  const handleMoveFolder = async (id: string, newFolderId: string) => {
    await dbService.updateMedia(id, { folderId: newFolderId });
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, folderId: newFolderId } : item))
    );
    addToast('success', 'Moved to Folder', 'Item destination folder updated.');
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    await dbService.deleteMedia(id);
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (lightboxItem?.id === id) {
      setLightboxItem(null);
    }
    addToast('info', 'Item Removed', 'Media deleted from local storage.');
  };

  // Create folder
  const handleCreateFolder = async (name: string, color: string, description: string) => {
    const newFolder: Folder = {
      id: 'f_' + Date.now(),
      name,
      iconName: 'Folder',
      color,
      description,
      createdAt: Date.now(),
    };
    await dbService.saveFolder(newFolder);
    setFolders((prev) => [...prev, newFolder]);
    addToast('success', 'Folder Created', `Created folder "${name}"`);
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: string) => {
    const target = folders.find((f) => f.id === folderId);
    if (!target) return;
    if (window.confirm(`Delete folder "${target.name}"? Media items will be moved to default folder.`)) {
      await dbService.deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      if (selectedFolderId === folderId) {
        setSelectedFolderId('all');
      }
      // Reassign media in deleted folder
      mediaItems
        .filter((i) => i.folderId === folderId)
        .forEach(async (item) => {
          await dbService.updateMedia(item.id, { folderId: 'social' });
        });
      const reloaded = await dbService.getAllMedia();
      setMediaItems(reloaded);
      addToast('info', 'Folder Deleted', `Deleted "${target.name}"`);
    }
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    dbService.saveSettings(updated);
  };

  // Clear all media
  const handleClearAllMedia = async () => {
    for (const item of mediaItems) {
      await dbService.deleteMedia(item.id);
    }
    setMediaItems([]);
    setSelectedItemIds(new Set());
    addToast('info', 'Library Cleared', 'All saved media files have been removed.');
  };

  // Batch actions
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedItemIds(new Set(ids));
  };

  const selectedItemsList = useMemo(() => {
    return mediaItems.filter((item) => selectedItemIds.has(item.id));
  }, [mediaItems, selectedItemIds]);

  const handleBatchDownloadZip = async () => {
    if (selectedItemsList.length === 0) return;
    addToast('info', 'Creating ZIP Archive...', `Packing ${selectedItemsList.length} media files.`);
    await downloadManager.exportMediaAsZip(selectedItemsList);
    addToast('success', 'ZIP Download Ready', 'Saved archive to your device.');
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    } catch {
      // safe
    }
  };

  const handleBatchMove = async (newFolderId: string) => {
    for (const item of selectedItemsList) {
      await dbService.updateMedia(item.id, { folderId: newFolderId });
    }
    const updated = await dbService.getAllMedia();
    setMediaItems(updated);
    setSelectedItemIds(new Set());
    addToast('success', 'Batch Moved', `Moved ${selectedItemsList.length} items to folder.`);
  };

  const handleBatchFavorite = async () => {
    for (const item of selectedItemsList) {
      await dbService.updateMedia(item.id, { isFavorite: true });
    }
    const updated = await dbService.getAllMedia();
    setMediaItems(updated);
    setSelectedItemIds(new Set());
    addToast('success', 'Added to Favorites', `Updated ${selectedItemsList.length} items.`);
  };

  const handleBatchDelete = async () => {
    if (window.confirm(`Delete ${selectedItemsList.length} selected items permanently?`)) {
      for (const item of selectedItemsList) {
        await dbService.deleteMedia(item.id);
      }
      const updated = await dbService.getAllMedia();
      setMediaItems(updated);
      setSelectedItemIds(new Set());
      addToast('info', 'Batch Deleted', `Removed ${selectedItemsList.length} items.`);
    }
  };

  // Group Zip Download
  const handleDownloadGroupZip = async (groupItems: MediaItem[], groupName: string) => {
    addToast('info', 'Packaging Group ZIP...', `Exporting ${groupItems.length} items from ${groupName}.`);
    await downloadManager.exportMediaAsZip(groupItems, `${groupName.replace(/\s+/g, '_')}_media.zip`);
    addToast('success', 'Group Export Complete', 'Archive downloaded successfully.');
  };

  const totalStorageBytes = useMemo(() => {
    return mediaItems.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  }, [mediaItems]);

  const activeDownloadsCount = useMemo(() => {
    return downloadTasks.filter((t) => t.status === 'downloading' || t.status === 'queued').length;
  }, [downloadTasks]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* M3 Header Top Bar */}
      <Header
        darkMode={settings.darkMode}
        onToggleTheme={() => handleUpdateSettings({ darkMode: !settings.darkMode })}
        activeDownloadsCount={activeDownloadsCount}
        totalItemsCount={mediaItems.length}
        totalStorageBytes={totalStorageBytes}
        autoClipboardEnabled={settings.autoClipboardDetection}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQueue={() => setIsQueueOpen(true)}
        onOpenSamplePreview={() => setIsSamplePreviewOpen(true)}
        onSelectSamplePreset={(url) =>
          handleStartDownload(url, settings.defaultVideoQuality, settings.defaultFolderId)
        }
      />

      {/* Floating Hero Clipboard Auto-Capture Bar */}
      <ClipboardBar
        onStartDownload={handleStartDownload}
        folders={folders}
        defaultFolderId={settings.defaultFolderId}
        defaultQuality={settings.defaultVideoQuality}
        autoClipboardEnabled={settings.autoClipboardDetection}
        onToggleAutoClipboard={(val) => handleUpdateSettings({ autoClipboardDetection: val })}
        onOpenSamplePreview={() => setIsSamplePreviewOpen(true)}
      />

      {/* Main App Workspace: Left Navigation Folder Drawer + Right Media Gallery */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <FolderSidebar
          folders={folders}
          mediaItems={mediaItems}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          selectedDateFilter={selectedDateFilter}
          onSelectDateFilter={setSelectedDateFilter}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          onlyFavorites={onlyFavorites}
          onToggleFavorites={setOnlyFavorites}
          onOpenNewFolderModal={() => setIsNewFolderOpen(true)}
          onDeleteFolder={handleDeleteFolder}
        />

        <GalleryView
          mediaItems={mediaItems}
          folders={folders}
          selectedFolderId={selectedFolderId}
          selectedDateFilter={selectedDateFilter}
          selectedPlatform={selectedPlatform}
          selectedType={selectedType}
          onlyFavorites={onlyFavorites}
          selectedItemIds={selectedItemIds}
          onToggleSelectItem={handleToggleSelectItem}
          onSelectAll={handleSelectAll}
          onOpenLightbox={(item) => setLightboxItem(item)}
          onDownloadItem={(item) => downloadManager.downloadFileToDisk(item)}
          onShareItem={(item) => setShareItem(item)}
          onToggleFavorite={handleToggleFavorite}
          onMoveFolder={handleMoveFolder}
          onDeleteItem={handleDeleteItem}
          onDownloadGroupZip={handleDownloadGroupZip}
        />
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionToolbar
        selectedItems={selectedItemsList}
        folders={folders}
        onDeselectAll={() => setSelectedItemIds(new Set())}
        onDownloadZip={handleBatchDownloadZip}
        onMoveSelected={handleBatchMove}
        onFavoriteSelected={handleBatchFavorite}
        onDeleteSelected={handleBatchDelete}
      />

      {/* Fullscreen Media Lightbox Viewer */}
      {lightboxItem && (
        <MediaLightbox
          item={lightboxItem}
          itemsList={mediaItems}
          folders={folders}
          onClose={() => setLightboxItem(null)}
          onNavigate={(item) => setLightboxItem(item)}
          onDownload={(item) => downloadManager.downloadFileToDisk(item)}
          onShare={(item) => setShareItem(item)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Download Manager Queue Drawer */}
      <DownloadQueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        tasks={downloadTasks}
        onPauseTask={(id) => downloadManager.pauseTask(id)}
        onResumeTask={(id) => downloadManager.resumeTask(id)}
        onCancelTask={(id) => downloadManager.cancelTask(id)}
        onRetryTask={(id) => downloadManager.retryTask(id)}
        onClearCompleted={() => downloadManager.clearCompletedTasks()}
      />

      {/* Cross-Platform Share Dialog */}
      {shareItem && (
        <ShareModal item={shareItem} onClose={() => setShareItem(null)} />
      )}

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        folders={folders}
        mediaItems={mediaItems}
        totalStorageBytes={totalStorageBytes}
        totalItemsCount={mediaItems.length}
        onUpdateSettings={handleUpdateSettings}
        onClearAllMedia={handleClearAllMedia}
        onOpenSamplePreview={() => setIsSamplePreviewOpen(true)}
      />

      {/* Sample Media Preview Modal */}
      <SamplePreviewModal
        isOpen={isSamplePreviewOpen}
        onClose={() => setIsSamplePreviewOpen(false)}
        folders={folders}
        defaultFolderId={settings.defaultFolderId}
        defaultQuality={settings.defaultVideoQuality}
        onStartDownload={handleStartDownload}
      />

      {/* M3 Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
