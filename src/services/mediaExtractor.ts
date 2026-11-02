import { MediaAuthor, MediaPlatform, MediaQuality, MediaType } from '../types';

export interface SamplePreset {
  title: string;
  url: string;
  platform: MediaPlatform;
  type: MediaType;
  description: string;
  previewThumb: string;
}

export interface ExtractedQualityOption {
  quality: MediaQuality;
  label: string;
  format: string;
  estimatedSizeBytes: number;
  url: string;
}

export interface ExtractedMediaInfo {
  title: string;
  description: string;
  platform: MediaPlatform;
  type: MediaType;
  thumbnailUrl: string;
  durationSeconds: number;
  dimensions: {
    width: number;
    height: number;
  };
  author: MediaAuthor;
  tags: string[];
  availableQualities: ExtractedQualityOption[];
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    title: 'Cinematic Mountain Lake Drone Sunset',
    url: 'https://www.instagram.com/reel/C8xK9LmPq3A/',
    platform: 'instagram',
    type: 'video',
    description: 'Captured in 4K 60fps with polaroid ND filter over alpine peaks.',
    previewThumb:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Cyberpunk Tokyo Rain Reflections',
    url: 'https://www.tiktok.com/@neon_tokyo/video/739182390124',
    platform: 'tiktok',
    type: 'video',
    description: 'Night stroll in Shinjuku during summer drizzle with Lo-Fi audio.',
    previewThumb:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'SpaceX Starship Stage Separation HD',
    url: 'https://x.com/spacex/status/1789012345678',
    platform: 'twitter',
    type: 'video',
    description: 'Super Heavy booster hot-staging maneuver over Gulf of Mexico.',
    previewThumb:
      'https://images.unsplash.com/photo-1517976487504-590a887d2197?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Mastering Italian Espresso - Barista Technique',
    url: 'https://youtube.com/shorts/dQw4w9WgXcQ',
    platform: 'youtube',
    type: 'video',
    description: 'Perfect extraction timing and micro-foam latte art tutorial.',
    previewThumb:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Architectural Minimalist Spatial Study',
    url: 'https://pinterest.com/pin/9872105432198/',
    platform: 'pinterest',
    type: 'image',
    description: 'Brutalist concrete stair symmetry with natural lighting.',
    previewThumb:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=85',
  },
  {
    title: 'Sunset Coastal Roadtrip Ocean Waves',
    url: 'https://reddit.com/r/EarthPorn/comments/1e58abc/pacific_coast/',
    platform: 'reddit',
    type: 'image',
    description: 'Big Sur golden hour cliffside view with dramatic crashing surf.',
    previewThumb:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=85',
  },
];

export function detectPlatform(url: string): MediaPlatform {
  if (!url) return 'direct';
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest';
  if (lower.includes('reddit.com') || lower.includes('redd.it')) return 'reddit';
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
  if (lower.includes('threads.net')) return 'threads';
  return 'direct';
}

export function isValidMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  const validDomains = [
    'instagram.com',
    'instagr.am',
    'tiktok.com',
    'youtube.com',
    'youtu.be',
    'twitter.com',
    'x.com',
    'pinterest.com',
    'pin.it',
    'reddit.com',
    'redd.it',
    'facebook.com',
    'fb.watch',
    'threads.net',
  ];

  const hasMediaExtension = /\.(mp4|webm|mov|mkv|jpg|jpeg|png|webp|gif|mp3|m4a|wav)($|\?)/i.test(
    trimmed
  );

  return validDomains.some((domain) => trimmed.toLowerCase().includes(domain)) || hasMediaExtension;
}

export function extractMediaInfo(url: string): ExtractedMediaInfo {
  const platform = detectPlatform(url);

  // High quality sample demo video clips
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ];

  const sampleThumbs = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517976487504-590a887d2197?w=800&auto=format&fit=crop&q=85',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=85',
  ];

  const sampleAuthors: Record<MediaPlatform, MediaAuthor> = {
    instagram: {
      name: 'Elena Rostova',
      handle: '@elena_visuals',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    tiktok: {
      name: 'Kai Takahashi',
      handle: '@kai_tokyo_beats',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    youtube: {
      name: 'Apex Motion Lab',
      handle: '@ApexMotionHQ',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    twitter: {
      name: 'Tech Frontier',
      handle: '@TechFrontier',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    pinterest: {
      name: 'Studio Minimalist',
      handle: '@studiominimal',
      avatarUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    reddit: {
      name: 'PixelWanderer',
      handle: 'u/PixelWanderer',
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    facebook: {
      name: 'Horizon Discoveries',
      handle: 'HorizonDiscoveries',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    threads: {
      name: 'Creative Pulse',
      handle: '@creativepulse',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    direct: {
      name: 'Web Content',
      handle: 'direct_stream',
      avatarUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    other: {
      name: 'Online Publisher',
      handle: '@online_media',
      avatarUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
  };

  const isImageOnly = platform === 'pinterest' || /\.(jpg|jpeg|png|webp)($|\?)/i.test(url);
  const mediaType: MediaType = isImageOnly ? 'image' : 'video';

  // Deterministic seed based on URL string
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const matchedPreset = SAMPLE_PRESETS.find((p) => p.url === url);

  const title =
    matchedPreset?.title ||
    `${platform.toUpperCase()} High-Quality Media Clip (${new Date().toLocaleDateString()})`;

  const description =
    matchedPreset?.description ||
    `Ultra clear ${mediaType} extracted automatically from ${platform} with full metadata preservation.`;

  const videoUrl = sampleVideos[absHash % sampleVideos.length];
  const thumbUrl = matchedPreset?.previewThumb || sampleThumbs[absHash % sampleThumbs.length];

  const availableQualities: ExtractedQualityOption[] = isImageOnly
    ? [
        {
          quality: '4k',
          label: 'Original Super-Res (PNG)',
          format: 'png',
          estimatedSizeBytes: 12 * 1024 * 1024,
          url: thumbUrl,
        },
        {
          quality: '1080p',
          label: 'High Definition (JPG)',
          format: 'jpg',
          estimatedSizeBytes: 4 * 1024 * 1024,
          url: thumbUrl,
        },
      ]
    : [
        {
          quality: '4k',
          label: '4K Ultra HD (2160p)',
          format: 'mp4',
          estimatedSizeBytes: 38 * 1024 * 1024,
          url: videoUrl,
        },
        {
          quality: '1080p',
          label: '1080p Full HD (60fps)',
          format: 'mp4',
          estimatedSizeBytes: 18 * 1024 * 1024,
          url: videoUrl,
        },
        {
          quality: '720p',
          label: '720p HD (Compact)',
          format: 'mp4',
          estimatedSizeBytes: 9 * 1024 * 1024,
          url: videoUrl,
        },
        {
          quality: 'audio-mp3',
          label: 'MP3 Audio Stream (320kbps)',
          format: 'mp3',
          estimatedSizeBytes: 4 * 1024 * 1024,
          url: videoUrl,
        },
      ];

  return {
    title,
    description,
    platform,
    type: mediaType,
    thumbnailUrl: thumbUrl,
    durationSeconds: isImageOnly ? 0 : 28 + (absHash % 45),
    dimensions: isImageOnly
      ? { width: 2400, height: 1600 }
      : { width: 1080, height: 1920 },
    author: sampleAuthors[platform] || sampleAuthors.direct,
    tags: [platform, mediaType, 'hd', 'saved'],
    availableQualities,
  };
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateGroupTitle(dateKey: string): string {
  const todayKey = getTodayDateKey();
  if (dateKey === todayKey) return 'Today';

  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (dateKey === yesterdayKey) return 'Yesterday';

  const [y, m, day] = dateKey.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
