import { MediaItem } from '../types';
import { dbService } from './db';
import { getTodayDateKey } from './mediaExtractor';

const INITIAL_MEDIA_SEED: MediaItem[] = [
  {
    id: 'seed_insta_1',
    title: 'Cinematic Mountain Drone Sunset',
    description: 'Captured in 4K 60fps with polaroid ND filter over alpine peaks.',
    sourceUrl: 'https://www.instagram.com/reel/C8xK9LmPq3A/',
    platform: 'instagram',
    type: 'video',
    format: 'mp4',
    quality: '4k',
    sizeBytes: 24 * 1024 * 1024,
    durationSeconds: 28,
    dimensions: { width: 1080, height: 1920 },
    thumbnailUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=85',
    mediaUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    folderId: 'social',
    createdAt: Date.now() - 3600 * 1000 * 2,
    dateKey: getTodayDateKey(),
    author: {
      name: 'Alex Rivera',
      handle: '@alex_wanderlust',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    tags: ['instagram', 'reels', 'mountains', 'drone', '4k'],
    isFavorite: true,
  },
  {
    id: 'seed_tiktok_1',
    title: 'Cyberpunk Tokyo Rain Reflections',
    description: 'Night stroll in Shinjuku during summer drizzle with Lo-Fi audio.',
    sourceUrl: 'https://www.tiktok.com/@neon_tokyo/video/739182390124',
    platform: 'tiktok',
    type: 'video',
    format: 'mp4',
    quality: '1080p',
    sizeBytes: 16 * 1024 * 1024,
    durationSeconds: 15,
    dimensions: { width: 1080, height: 1920 },
    thumbnailUrl:
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=85',
    mediaUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    folderId: 'social',
    createdAt: Date.now() - 3600 * 1000 * 5,
    dateKey: getTodayDateKey(),
    author: {
      name: 'Neon Tokyo',
      handle: '@neon_tokyo',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    tags: ['tiktok', 'tokyo', 'neon', 'cyberpunk', 'lofi'],
    isFavorite: true,
  },
  {
    id: 'seed_yt_1',
    title: 'Mastering Italian Espresso - Barista Technique',
    description: 'Perfect extraction timing and micro-foam latte art tutorial.',
    sourceUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ',
    platform: 'youtube',
    type: 'video',
    format: 'mp4',
    quality: '1080p',
    sizeBytes: 19 * 1024 * 1024,
    durationSeconds: 35,
    dimensions: { width: 1080, height: 1920 },
    thumbnailUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=85',
    mediaUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    folderId: 'work',
    createdAt: Date.now() - 3600 * 1000 * 26,
    dateKey: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    author: {
      name: 'Coffee Craftsman',
      handle: '@coffeecraftsman',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      verified: true,
    },
    tags: ['youtube', 'shorts', 'espresso', 'tutorial'],
    isFavorite: false,
  },
  {
    id: 'seed_pin_1',
    title: 'Architectural Minimalist Spatial Study',
    description: 'Brutalist concrete stair symmetry with natural morning lighting.',
    sourceUrl: 'https://pinterest.com/pin/9872105432198/',
    platform: 'pinterest',
    type: 'image',
    format: 'jpg',
    quality: '4k',
    sizeBytes: 4 * 1024 * 1024,
    dimensions: { width: 2400, height: 1600 },
    thumbnailUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=85',
    mediaUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85',
    folderId: 'work',
    createdAt: Date.now() - 3600 * 1000 * 48,
    dateKey: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    author: {
      name: 'Nordic Spaces',
      handle: '@interior_design_pins',
      avatarUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      verified: false,
    },
    tags: ['pinterest', 'architecture', 'minimal', 'interior'],
    isFavorite: true,
  },
];

export async function seedInitialMediaIfEmpty(): Promise<void> {
  const existing = await dbService.getAllMedia();
  if (existing.length === 0) {
    for (const item of INITIAL_MEDIA_SEED) {
      await dbService.saveMedia(item);
    }
  }
}
