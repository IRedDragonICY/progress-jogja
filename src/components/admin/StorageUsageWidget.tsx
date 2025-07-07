import React from 'react';
import { ServerStackIcon, CircleStackIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { StorageUsageData } from '@/types/supabase';

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes || bytes < 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const RadialProgress = ({ percentage }: { percentage: number }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      <circle
        stroke="rgba(255, 255, 255, 0.1)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="url(#progressGradient)"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export function StorageUsageWidget({ data, isLoading }: { data: StorageUsageData | null; isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 flex items-center justify-center min-h-[240px]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-400"></div>
            <p className="text-slate-400">Memuat penyimpanan...</p>
          </div>
        ) : (
          <div className="text-center">
            <ServerStackIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Gagal memuat data penyimpanan.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
          <ServerStackIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Penyimpanan Proyek</h3>
          <p className="text-slate-400 text-sm">Penggunaan total database & aset</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
        <div className="relative flex-shrink-0">
          <RadialProgress percentage={data.used_percentage} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {data.used_percentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex-1 w-full space-y-4">
           <div className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
                <CircleStackIcon className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300 font-medium">Database</span>
            </div>
            <span className="text-base font-semibold text-blue-300">
              {formatBytes(data.database_size_bytes)}
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 font-medium">Aset (Storage)</span>
            </div>
            <span className="text-base font-semibold text-emerald-300">
              {formatBytes(data.storage_size_bytes)}
            </span>
          </div>
          <div className="border-t border-slate-700/50 pt-4 flex justify-between items-baseline">
            <span className="text-slate-400">Total Digunakan</span>
            <span className="text-lg font-bold text-red-300">
              {formatBytes(data.total_used_bytes)}
            </span>
          </div>
           <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500">Total Kuota</span>
            <span className="font-medium text-slate-400">
              {formatBytes(data.total_project_limit_bytes)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}