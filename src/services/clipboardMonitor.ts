import { isValidMediaUrl, detectPlatform } from './mediaExtractor';

type ClipboardCallback = (url: string, platform: string, autoTriggered: boolean) => void;

class ClipboardMonitorService {
  private lastUrl = '';
  private isListening = false;
  private intervalId: number | null = null;
  private callbacks: Set<ClipboardCallback> = new Set();
  private isPermissionGranted = false;

  constructor() {
    this.handleWindowFocus = this.handleWindowFocus.bind(this);
  }

  public subscribe(cb: ClipboardCallback): () => void {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  public startListening() {
    if (this.isListening) return;
    this.isListening = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.handleWindowFocus);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkClipboard(false);
        }
      });
      // Periodic check while tab is active (every 4 seconds)
      this.intervalId = window.setInterval(() => {
        if (document.hasFocus()) {
          this.checkClipboard(false);
        }
      }, 4000);
    }
  }

  public stopListening() {
    this.isListening = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.handleWindowFocus);
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }

  private handleWindowFocus() {
    this.checkClipboard(false);
  }

  public async checkClipboard(manualTrigger = true): Promise<string | null> {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.readText) {
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text || typeof text !== 'string') return null;

      const trimmed = text.trim();
      if (isValidMediaUrl(trimmed)) {
        if (manualTrigger || trimmed !== this.lastUrl) {
          this.lastUrl = trimmed;
          const platform = detectPlatform(trimmed);
          this.callbacks.forEach((cb) => cb(trimmed, platform, !manualTrigger));
          return trimmed;
        }
      }
    } catch {
      // Clipboard read permission might be denied or unprompted yet
    }
    return null;
  }

  public async readClipboardText(): Promise<string | null> {
    try {
      if (navigator?.clipboard?.readText) {
        return await navigator.clipboard.readText();
      }
    } catch (e) {
      console.warn('Clipboard read error:', e);
    }
    return null;
  }

  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn('Clipboard write error:', e);
    }
    return false;
  }
}

export const clipboardMonitor = new ClipboardMonitorService();
