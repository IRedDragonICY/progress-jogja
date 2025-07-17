'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, DocumentArrowDownIcon, UserGroupIcon, CubeIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const LaporanPage = () => {
  // Dummy data for chart
  const chartData = [
    { name: 'Jan', pendapatan: 4000 },
    { name: 'Feb', pendapatan: 3000 },
    { name: 'Mar', pendapatan: 2000 },
    { name: 'Apr', pendapatan: 2780 },
    { name: 'Mei', pendapatan: 1890 },
    { name: 'Jun', pendapatan: 2390 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const handleExport = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <motion.div
      className="p-6 md:p-8 bg-slate-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className="text-3xl font-bold text-slate-800 mb-2" variants={itemVariants}>
        Dasbor Laporan
      </motion.h1>
      <motion.p className="text-slate-500 mb-8" variants={itemVariants}>
        Analisis dan ekspor data bisnis Anda.
      </motion.p>

      {/* Financial Widgets */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={containerVariants}>
        <motion.div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pendapatan Bulan Ini</p>
              <p className="text-2xl font-bold text-slate-800">Rp 12.345.678</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BanknotesIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-1" />
            <span>+15% dari bulan lalu</span>
          </div>
        </motion.div>
        <motion.div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Transaksi Bulan Ini</p>
              <p className="text-2xl font-bold text-slate-800">452</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CubeIcon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-1" />
            <span>+8% dari bulan lalu</span>
          </div>
        </motion.div>
        <motion.div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pelanggan Baru</p>
              <p className="text-2xl font-bold text-slate-800">78</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <ArrowTrendingDownIcon className="w-5 h-5 mr-1" />
            <span>-3% dari bulan lalu</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Financial Chart */}
      <motion.div className="bg-white p-6 rounded-2xl shadow-sm mb-8" variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Grafik Keuangan (6 Bulan Terakhir)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pendapatan" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Export Section */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Ekspor Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ExportCard
            icon={BanknotesIcon}
            title="Laporan Keuangan"
            description="Ekspor laporan bulanan, tahunan, atau keseluruhan."
            color="green"
            onClick={() => handleExport(chartData, 'laporan-keuangan')}
          />
          <ExportCard
            icon={UserGroupIcon}
            title="Data Pengguna"
            description="Ekspor semua data pengguna terdaftar."
            color="indigo"
            onClick={() => handleExport([{ name: 'John Doe', email: 'john@example.com' }], 'data-pengguna')}
          />
          <ExportCard
            icon={CubeIcon}
            title="Data Produk"
            description="Ekspor semua informasi produk."
            color="blue"
            onClick={() => handleExport([{ name: 'Produk A', price: 10000 }], 'data-produk')}
          />
          <ExportCard
            icon={BuildingOfficeIcon}
            title="Profil Perusahaan"
            description="Ekspor profil lengkap perusahaan."
            color="purple"
            onClick={() => handleExport([{ name: 'Progress Jogja', address: 'Yogyakarta' }], 'profil-perusahaan')}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const ExportCard = ({ icon: Icon, title, description, color, onClick }) => (
  <motion.div
    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
    whileHover={{ y: -5 }}
  >
    <div className={`p-3 bg-${color}-100 rounded-full w-max mb-4`}>
      <Icon className={`w-6 h-6 text-${color}-500`} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-4 flex-grow">{description}</p>
    <button
      onClick={onClick}
      className={`mt-auto w-full bg-${color}-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-${color}-600 transition-colors duration-300 flex items-center justify-center gap-2`}
    >
      <DocumentArrowDownIcon className="w-5 h-5" />
      Ekspor Excel
    </button>
  </motion.div>
);

export default LaporanPage;
