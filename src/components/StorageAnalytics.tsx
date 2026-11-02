import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  HardDrive,
  PieChart as PieChartIcon,
  Layers,
  FileVideo,
  FileImage,
  FileAudio,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import { MediaItem, MediaPlatform, MediaType } from '../types';
import { formatBytes } from '../services/mediaExtractor';

interface StorageAnalyticsProps {
  mediaItems: MediaItem[];
}

export type AnalyticsViewMode = 'platform' | 'fileType' | 'format';

interface DataPoint {
  id: string;
  label: string;
  bytes: number;
  count: number;
  color: string;
  percentage: number;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  tiktok: { label: 'TikTok', color: '#25F4EE' },
  youtube: { label: 'YouTube', color: '#FF0000' },
  twitter: { label: 'X (Twitter)', color: '#1DA1F2' },
  reddit: { label: 'Reddit', color: '#FF4500' },
  pinterest: { label: 'Pinterest', color: '#E60023' },
  facebook: { label: 'Facebook', color: '#1877F2' },
  threads: { label: 'Threads', color: '#8B5CF6' },
  direct: { label: 'Direct Media', color: '#6366F1' },
  other: { label: 'Other', color: '#71717A' },
};

const TYPE_CONFIG: Record<MediaType, { label: string; color: string }> = {
  video: { label: 'Videos (MP4/WebM)', color: '#8B5CF6' },
  image: { label: 'Images (JPG/PNG)', color: '#F59E0B' },
  audio: { label: 'Audio Tracks (MP3)', color: '#10B981' },
};

const FORMAT_COLORS: Record<string, string> = {
  mp4: '#8B5CF6',
  webm: '#3B82F6',
  jpg: '#EC4899',
  jpeg: '#EC4899',
  png: '#F97316',
  gif: '#06B6D4',
  mp3: '#10B981',
  wav: '#14B8A6',
  other: '#64748B',
};

export const StorageAnalytics: React.FC<StorageAnalyticsProps> = ({ mediaItems }) => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('platform');
  const [hoveredSlice, setHoveredSlice] = useState<DataPoint | null>(null);

  const totalBytes = useMemo(() => {
    return mediaItems.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  }, [mediaItems]);

  const totalCount = mediaItems.length;

  // Process data for Platforms
  const platformData = useMemo<DataPoint[]>(() => {
    if (totalBytes === 0) return [];
    const map: Record<string, { bytes: number; count: number }> = {};
    mediaItems.forEach((item) => {
      const p = item.platform || 'other';
      if (!map[p]) map[p] = { bytes: 0, count: 0 };
      map[p].bytes += item.sizeBytes || 0;
      map[p].count += 1;
    });

    return Object.entries(map)
      .map(([key, val]) => {
        const conf = PLATFORM_CONFIG[key] || { label: key.toUpperCase(), color: '#71717A' };
        return {
          id: key,
          label: conf.label,
          bytes: val.bytes,
          count: val.count,
          color: conf.color,
          percentage: totalBytes > 0 ? (val.bytes / totalBytes) * 100 : 0,
        };
      })
      .sort((a, b) => b.bytes - a.bytes);
  }, [mediaItems, totalBytes]);

  // Process data for Media Types
  const typeData = useMemo<DataPoint[]>(() => {
    if (totalBytes === 0) return [];
    const map: Record<string, { bytes: number; count: number }> = {};
    mediaItems.forEach((item) => {
      const t = item.type || 'video';
      if (!map[t]) map[t] = { bytes: 0, count: 0 };
      map[t].bytes += item.sizeBytes || 0;
      map[t].count += 1;
    });

    return Object.entries(map)
      .map(([key, val]) => {
        const conf = TYPE_CONFIG[key as MediaType] || { label: key.toUpperCase(), color: '#6366F1' };
        return {
          id: key,
          label: conf.label,
          bytes: val.bytes,
          count: val.count,
          color: conf.color,
          percentage: totalBytes > 0 ? (val.bytes / totalBytes) * 100 : 0,
        };
      })
      .sort((a, b) => b.bytes - a.bytes);
  }, [mediaItems, totalBytes]);

  // Process data for Formats
  const formatData = useMemo<DataPoint[]>(() => {
    if (totalBytes === 0) return [];
    const map: Record<string, { bytes: number; count: number }> = {};
    mediaItems.forEach((item) => {
      const f = (item.format || 'other').toLowerCase();
      if (!map[f]) map[f] = { bytes: 0, count: 0 };
      map[f].bytes += item.sizeBytes || 0;
      map[f].count += 1;
    });

    return Object.entries(map)
      .map(([key, val]) => {
        const color = FORMAT_COLORS[key] || FORMAT_COLORS.other;
        return {
          id: key,
          label: `.${key.toUpperCase()}`,
          bytes: val.bytes,
          count: val.count,
          color: color,
          percentage: totalBytes > 0 ? (val.bytes / totalBytes) * 100 : 0,
        };
      })
      .sort((a, b) => b.bytes - a.bytes);
  }, [mediaItems, totalBytes]);

  const currentDataset = useMemo(() => {
    if (viewMode === 'platform') return platformData;
    if (viewMode === 'fileType') return typeData;
    return formatData;
  }, [viewMode, platformData, typeData, formatData]);

  // D3 Pie & Arc Calculations
  const width = 240;
  const height = 240;
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.58; // Donut hole
  const outerRadius = radius - 8;
  const hoverOuterRadius = radius - 2;

  const pieGenerator = useMemo(() => {
    return d3
      .pie<DataPoint>()
      .value((d) => d.bytes)
      .sort(null)
      .padAngle(0.025);
  }, []);

  const pieArcs = useMemo(() => {
    return pieGenerator(currentDataset);
  }, [pieGenerator, currentDataset]);

  const arcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(4);
  }, [innerRadius, outerRadius]);

  const hoveredArcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(innerRadius - 2)
      .outerRadius(hoverOuterRadius)
      .cornerRadius(5);
  }, [innerRadius, hoverOuterRadius]);

  // Top consumers
  const topPlatform = platformData[0];
  const topType = typeData[0];
  const avgFileSize = totalCount > 0 ? totalBytes / totalCount : 0;

  return (
    <div id="storage-analytics-dashboard" className="space-y-5 animate-in fade-in duration-200">
      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Usage</span>
          </div>
          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatBytes(totalBytes)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{totalCount} files cached</p>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-pink-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Top Source</span>
          </div>
          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
            {topPlatform ? topPlatform.label : 'None'}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
            {topPlatform ? `${topPlatform.percentage.toFixed(1)}% of library` : '0%'}
          </p>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
            <FileVideo className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Primary Type</span>
          </div>
          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
            {topType ? topType.label.split(' ')[0] : 'None'}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">
            {topType ? formatBytes(topType.bytes) : '0 B'}
          </p>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg File Size</span>
          </div>
          <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatBytes(avgFileSize)}
          </p>
          <p className="text-[10px] text-zinc-400 mt-0.5">per saved clip</p>
        </div>
      </div>

      {/* Breakdown Mode Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <PieChartIcon className="w-4 h-4 text-indigo-500" />
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Storage Distribution Breakdown
          </h4>
        </div>

        {/* View mode toggle pills */}
        <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setViewMode('platform');
              setHoveredSlice(null);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'platform'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            By Platform
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('fileType');
              setHoveredSlice(null);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'fileType'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            By File Type
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('format');
              setHoveredSlice(null);
            }}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'format'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            By Extension
          </button>
        </div>
      </div>

      {/* Main D3 Chart and Interactive Legend Container */}
      {totalBytes === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
          <HardDrive className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            No media storage recorded yet
          </p>
          <p className="text-[11px] text-zinc-400 max-w-xs">
            Save or download media from Instagram, TikTok, YouTube, or X to see live storage analytics.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
          {/* D3 Pie / Donut SVG Chart */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="overflow-visible select-none"
            >
              <defs>
                <filter id="pie-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
                </filter>
              </defs>

              <g transform={`translate(${width / 2}, ${height / 2})`}>
                {/* Background Track Circle */}
                <circle
                  r={radius - 12}
                  fill="none"
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800/60"
                  strokeWidth={2}
                />

                {/* Slices rendered with D3 arc calculations */}
                {pieArcs.map((arcData) => {
                  const isHovered = hoveredSlice?.id === arcData.data.id;
                  const path = isHovered
                    ? hoveredArcGenerator(arcData)
                    : arcGenerator(arcData);

                  return (
                    <path
                      key={arcData.data.id}
                      d={path || undefined}
                      fill={arcData.data.color}
                      stroke="transparent"
                      className="cursor-pointer transition-all duration-150"
                      filter={isHovered ? 'url(#pie-glow)' : undefined}
                      opacity={hoveredSlice && !isHovered ? 0.45 : 1}
                      onMouseEnter={() => setHoveredSlice(arcData.data)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Donut Hole Center Stats Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {hoveredSlice ? (
                <>
                  <span
                    className="w-2.5 h-2.5 rounded-full mb-1"
                    style={{ backgroundColor: hoveredSlice.color }}
                  />
                  <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[100px] leading-tight">
                    {hoveredSlice.label}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {formatBytes(hoveredSlice.bytes)}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                    {hoveredSlice.percentage.toFixed(1)}% • {hoveredSlice.count} clips
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Total
                  </span>
                  <span className="text-sm font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                    {formatBytes(totalBytes)}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {totalCount} files
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend and Progress Item Breakdown */}
          <div className="flex-1 w-full space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {currentDataset.map((item) => {
              const isHovered = hoveredSlice?.id === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredSlice(item)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border ${
                    isHovered
                      ? 'bg-white dark:bg-zinc-800 border-indigo-400/50 shadow-sm scale-[1.01]'
                      : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        ({item.count} {item.count === 1 ? 'file' : 'files'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {formatBytes(item.bytes)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(item.percentage, 2)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Helpful Storage Insight Tip */}
      <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong>Storage Tip:</strong> High-resolution 4K and FHD video clips consume the majority of disk space. You can change your default download resolution in the <em>Preferences</em> tab below or export batch ZIP archives to free up local browser storage.
        </p>
      </div>
    </div>
  );
};
