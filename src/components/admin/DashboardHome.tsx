import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import type { Product, ProductType, ProductDraft, StorageUsageData } from "@/types/supabase";
import { StorageUsageWidget } from '@/components/admin/StorageUsageWidget';

interface DashboardHomeProps {
  products: Product[];
  productTypes: ProductType[];
  userDrafts: ProductDraft[];
  storageUsage: StorageUsageData | null;
  setShowDraftsDialog: (show: boolean) => void;
  onCreateNewProduct: () => void;
  onEditDraft: (draft: ProductDraft) => void;
  onSetActiveTab: (tab: string) => void;
  isProcessing: boolean;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  description
}: {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  description?: string;
}) => (
  <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
          {title}
        </p>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value}
        </p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient.replace('text-', 'from-').replace('to-', 'to-')} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

const QuickActionButton = ({
  onClick,
  icon: Icon,
  children,
  variant = "secondary",
  disabled = false
}: {
  onClick: () => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}) => {
  const baseClasses = "group w-full px-6 py-4 font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border";

  const variantClasses = variant === "primary"
    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-transparent shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5"
    : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 hover:text-white border-slate-600/50 hover:border-slate-500/50 backdrop-blur-sm";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
    >
      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <span>{children}</span>
    </button>
  );
};

export function DashboardHome({
  products,
  productTypes,
  userDrafts,
  storageUsage,
  setShowDraftsDialog,
  onCreateNewProduct,
  onEditDraft,
  onSetActiveTab,
  isProcessing
}: DashboardHomeProps) {
  const publishedProductsCount = products.filter(p => p.is_published).length;
  const unpublishedProductsCount = products.filter(p => !p.is_published).length;

  return (
    <Tabs.Content value="home" className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Ringkasan Dasbor
          </h2>
          <p className="text-slate-400">Pantau produk dan kelola toko Anda</p>
        </div>

        <Dialog.Trigger asChild>
            <button
                onClick={() => setShowDraftsDialog(true)}
                className="relative px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 flex items-center gap-2.5 border border-amber-400/20">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Draf</span>
              {userDrafts.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {userDrafts.length}
                </span>
              )}
            </button>
        </Dialog.Trigger>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Produk"
          value={products.length}
          icon={CubeIcon}
          gradient="from-blue-400 to-blue-600"
          description="Semua produk dalam sistem"
        />
        <StatsCard
          title="Diterbitkan"
          value={publishedProductsCount}
          icon={CheckCircleIcon}
          gradient="from-emerald-400 to-emerald-600"
          description="Terlihat oleh pelanggan"
        />
        <StatsCard
          title="Tidak Diterbitkan"
          value={unpublishedProductsCount}
          icon={ClockIcon}
          gradient="from-amber-400 to-amber-600"
          description="Tersembunyi dari pelanggan"
        />
        <StatsCard
          title="Tipe Produk"
          value={productTypes.length}
          icon={TagIcon}
          gradient="from-purple-400 to-purple-600"
          description="Kategori produk"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
           <StorageUsageWidget data={storageUsage} isLoading={!storageUsage} />
           <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <PlusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tindakan Cepat</h3>
                <p className="text-slate-400 text-sm">Fitur yang sering digunakan</p>
              </div>
            </div>

            <div className="space-y-4">
              <QuickActionButton
                onClick={onCreateNewProduct}
                icon={PlusIcon}
                variant="primary"
                disabled={isProcessing}
              >
                Buat Produk Baru
              </QuickActionButton>
              <QuickActionButton
                onClick={() => onSetActiveTab('products')}
                icon={CubeIcon}
              >
                Kelola Produk
              </QuickActionButton>
              <QuickActionButton
                onClick={() => { onSetActiveTab('products'); }}
                icon={TagIcon}
              >
                Kelola Tipe
              </QuickActionButton>
              <QuickActionButton
                onClick={() => onSetActiveTab('profile')}
                icon={BuildingStorefrontIcon}
              >
                Ubah Profil
              </QuickActionButton>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Draf Terbaru</h3>
              <p className="text-slate-400 text-sm">Pekerjaan yang sedang berlangsung</p>
            </div>
          </div>

          <div className="space-y-4">
            {userDrafts.length > 0 ? (
              userDrafts.slice(0, 3).map(draft => (
                <div key={draft.id} className="group flex items-center justify-between p-4 bg-slate-700/30 backdrop-blur-sm rounded-2xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:bg-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-red-300 transition-colors">
                      {draft.name || "[Draf Tanpa Judul]"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(draft.updated_at!).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <button
                    onClick={() => onEditDraft(draft)}
                    className="ml-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
                  >
                    <PencilIcon className="w-3 h-3" />
                    Ubah
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 mb-3">Tidak ada draf terbaru</p>
                <button
                  onClick={onCreateNewProduct}
                  className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  Buat draf pertama Anda →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tabs.Content>
  );
}