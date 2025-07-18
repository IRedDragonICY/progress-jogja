import React, { useState, useEffect } from 'react';
import { getMonthlyRevenueSummary } from '@/lib/supabase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DocumentChartBarIcon,
  BanknotesIcon,
  UsersIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type ReportType = 'financial' | 'users' | 'products' | 'organization_profile';
type ChartData = { date: string; Pendapatan: number };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 backdrop-blur-sm p-4 rounded-xl border border-slate-600/50 shadow-lg">
        <p className="text-sm font-semibold text-slate-300">{label}</p>
        <p className="text-lg font-bold text-teal-400">
          {`Rp ${payload[0].value.toLocaleString('id-ID')}`}
        </p>
      </div>
    );
  }
  return null;
};

const ExportCard = ({
  icon: Icon,
  title,
  description,
  reportType,
  onExport,
  isLoading,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  reportType: ReportType;
  onExport: (type: ReportType) => void;
  isLoading: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/40 flex flex-col"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
    <div className="flex-grow" />
    <button
      onClick={() => onExport(reportType)}
      disabled={isLoading}
      className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Mengekspor...</span>
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Ekspor ke Excel</span>
        </>
      )}
    </button>
  </motion.div>
);

export function ReportsTab() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState<ReportType | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsChartLoading(true);
      try {
        const data = await getMonthlyRevenueSummary();
        const formattedData = data.map(item => ({
          date: new Date(item.month_start).toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
          Pendapatan: Number(item.total_revenue),
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setIsChartLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async (reportType: ReportType) => {
    setExportLoading(reportType);
    try {
      const response = await fetch(`/api/admin/export?reportType=${reportType}`);
      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `progress_jogja_${reportType}_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Gagal mengekspor data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExportLoading(null);
    }
  };

  const exportCards = [
    { icon: BanknotesIcon, title: "Laporan Keuangan", description: "Semua data transaksi dan pendapatan.", reportType: 'financial' as ReportType },
    { icon: UsersIcon, title: "Data Pengguna", description: "Informasi lengkap semua pengguna terdaftar.", reportType: 'users' as ReportType },
    { icon: CubeIcon, title: "Data Produk", description: "Katalog lengkap produk dan kategorinya.", reportType: 'products' as ReportType },
    { icon: BuildingStorefrontIcon, title: "Profil Perusahaan", description: "Ekspor semua data profil organisasi.", reportType: 'organization_profile' as ReportType },
  ];

  return (
    <div className="p-8 space-y-12">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <DocumentChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">Pusat Laporan</h2>
            <p className="text-slate-400">Analisis data dan ekspor informasi penting</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/50 shadow-2xl shadow-slate-900/50"
        >
          <h3 className="text-xl font-bold text-white mb-4">Tinjauan Pendapatan 6 Bulan Terakhir</h3>
          <div className="h-80 w-full">
            {isChartLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-400"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `Rp${(value / 1000000).toFixed(1)}jt`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45, 212, 191, 0.1)' }} />
                  <Area type="monotone" dataKey="Pendapatan" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Ekspor Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {exportCards.map((card, index) => (
            <motion.div key={card.reportType} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + index * 0.1 }}>
              <ExportCard
                icon={card.icon}
                title={card.title}
                description={card.description}
                reportType={card.reportType}
                onExport={handleExport}
                isLoading={exportLoading === card.reportType}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}