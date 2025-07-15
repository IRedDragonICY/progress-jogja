import React, { useState, useMemo } from 'react';
import * as Form from '@radix-ui/react-form';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Select from '@radix-ui/react-select';
import Image from 'next/image';
import {
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  TagIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  LinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import type { Product, ProductDraft, ProductType } from "@/types/supabase";

interface ProductsTabProps {
  products: Product[];
  userDrafts: ProductDraft[];
  setShowDraftsDialog: (show: boolean) => void;
  onCreateNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onTogglePublish: (product: Product) => void;
  isProcessing: boolean;
  isDataLoading: boolean;
  productTypes: ProductType[];
  onAddType: (name: string) => Promise<void>;
  onDeleteType: (id: string) => Promise<void>;
  onUpdateType: (id: string, name: string) => Promise<void>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const StatusBadge = ({ published }: { published: boolean }) => (
  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
    published
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/20'
  }`}>
    {published ? <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" /> : <ClockIcon className="w-3.5 h-3.5 mr-1.5" />}
    {published ? 'Diterbitkan' : 'Draf'}
  </span>
);

const ActionButton = React.forwardRef<HTMLButtonElement, {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
}>(({ onClick, icon: Icon, children, variant = "secondary", disabled = false }, ref) => {
  const variants = {
    primary: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30",
    secondary: "bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border-slate-500/30",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30",
    success: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <button ref={ref} onClick={onClick} disabled={disabled} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}>
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
});
ActionButton.displayName = 'ActionButton';

const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  startIndex,
  endIndex,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  startIndex: number;
  endIndex: number;
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">
          Menampilkan {startIndex} - {endIndex} dari {totalItems} produk
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Tampilkan:</span>
          <Select.Root value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-white border border-slate-600/50 rounded-lg hover:bg-slate-700/70 transition-all duration-200 min-w-[80px]">
              <Select.Value />
              <Select.Icon>
                <ChevronDownIcon className="w-4 h-4" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <Select.Viewport className="p-1">
                  <Select.Item value="10" className="px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-lg cursor-pointer outline-none data-[highlighted]:bg-slate-700">
                    <Select.ItemText>10</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="15" className="px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-lg cursor-pointer outline-none data-[highlighted]:bg-slate-700">
                    <Select.ItemText>15</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="30" className="px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-lg cursor-pointer outline-none data-[highlighted]:bg-slate-700">
                    <Select.ItemText>30</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {typeof page === 'string' ? (
                <span className="px-3 py-1.5 text-slate-500">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const ConfirmationDialog = ({ trigger, title, description, onConfirm, confirmButtonText, confirmButtonVariant }: {
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    confirmButtonText: string;
    confirmButtonVariant: 'danger' | 'success' | 'warning' | 'default';
}) => {
    const variantClasses = {
        danger: 'bg-red-600 hover:bg-red-700',
        success: 'bg-emerald-600 hover:bg-emerald-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        default: 'bg-slate-600 hover:bg-slate-700',
    };
    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-2xl p-8 w-full max-w-md z-50 border border-slate-700 shadow-2xl">
                    <AlertDialog.Title className="text-xl font-semibold text-white mb-2">{title}</AlertDialog.Title>
                    <AlertDialog.Description className="text-slate-400 mb-6">{description}</AlertDialog.Description>
                    <div className="flex gap-3 justify-end">
                        <AlertDialog.Cancel asChild>
                            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Batal</button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild>
                            <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-xl transition-colors ${variantClasses[confirmButtonVariant]}`}>{confirmButtonText}</button>
                        </AlertDialog.Action>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
};

export function ProductsTab({
  products,
  userDrafts,
  onCreateNewProduct,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
  isProcessing,
  isDataLoading,
  productTypes,
  onAddType,
  onDeleteType,
  onUpdateType,
  searchTerm,
  onSearchChange,
}: ProductsTabProps) {
  const [newTypeName, setNewTypeName] = useState('');
  const [isEditTypeDialogOpen, setIsEditTypeDialogOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [editedProductTypeName, setEditedProductTypeName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const { paginatedProducts, totalPages, startIndex, endIndex } = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, products.length);
    return {
      paginatedProducts: products.slice(startIdx, endIdx),
      totalPages: Math.ceil(products.length / itemsPerPage),
      startIndex: products.length > 0 ? startIdx + 1 : 0,
      endIndex: endIdx
    };
  }, [products, currentPage, itemsPerPage]);

  // Reset to first page when search changes or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    await onAddType(newTypeName.trim());
    setNewTypeName('');
  };

  const openEditTypeDialog = (type: ProductType) => {
    setEditingProductType(type);
    setEditedProductTypeName(type.name);
    setIsEditTypeDialogOpen(true);
  };

  const handleUpdateTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductType || !editedProductTypeName.trim()) return;
    await onUpdateType(editingProductType.id, editedProductTypeName.trim());
    setIsEditTypeDialogOpen(false);
    setEditingProductType(null);
    setEditedProductTypeName('');
  };

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Manajemen Produk
          </h2>
          <p className="text-slate-400">Buat, sunting, dan kelola katalog produk Anda</p>
        </div>

        <div className="flex gap-3">
          <Dialog.Trigger asChild>
            <button
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

          <button
            onClick={onCreateNewProduct}
            disabled={isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 border border-red-400/20"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari produk berdasarkan nama..."
            className="w-full pl-16 pr-6 py-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-white rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 placeholder-slate-400 text-lg"
          />
        </div>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/60 backdrop-blur-sm">
              <tr>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">
                  Produk
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">
                  Tipe
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">
                  Status
                </th>
                <th className="px-8 py-6 text-right text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {paginatedProducts.map(product => (
                <tr key={product.id} onClick={() => handleViewDetails(product)} className="group hover:bg-slate-700/20 transition-all duration-200 cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {product.image_urls?.[0] ? (
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-700/50 border border-slate-600/50 flex-shrink-0">
                          <Image
                            src={product.image_urls[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-700/50 rounded-2xl border border-slate-600/50 flex items-center justify-center flex-shrink-0">
                          <CubeIcon className="w-8 h-8 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white text-lg group-hover:text-red-300 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-1">
                          {product.description || 'Tanpa deskripsi'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {product.product_types?.name || 'Tanpa Kategori'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge published={product.is_published} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <ActionButton onClick={() => onEditProduct(product)} icon={PencilIcon} variant="secondary">
                        Sunting
                      </ActionButton>

                      <ConfirmationDialog
                          trigger={
                            <ActionButton onClick={(e) => e.stopPropagation()} icon={product.is_published ? EyeSlashIcon : EyeIcon} variant={product.is_published ? "secondary" : "success"}>
                                {product.is_published ? 'Batal Terbit' : 'Terbitkan'}
                            </ActionButton>
                          }
                          title={`${product.is_published ? 'Batalkan Penerbitan' : 'Terbitkan'} Produk`}
                          description={`Apakah Anda yakin ingin ${product.is_published ? 'menyembunyikan' : 'menerbitkan'} "${product.name}"?`}
                          onConfirm={() => onTogglePublish(product)}
                          confirmButtonText={product.is_published ? 'Batal Terbit' : 'Terbitkan'}
                          confirmButtonVariant={product.is_published ? 'warning' : 'success'}
                      />

                      <ConfirmationDialog
                          trigger={
                            <ActionButton onClick={(e) => e.stopPropagation()} icon={TrashIcon} variant="danger">
                                Hapus
                            </ActionButton>
                          }
                          title="Hapus Produk"
                          description={`Apakah Anda yakin ingin menghapus "${product.name}"? Tindakan ini tidak dapat dibatalkan.`}
                          onConfirm={() => onDeleteProduct(product.id)}
                          confirmButtonText="Hapus"
                          confirmButtonVariant="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!paginatedProducts.length && !isDataLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-700/50 rounded-3xl flex items-center justify-center mb-6">
                        <MagnifyingGlassIcon className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        {products.length === 0 ? 'Tidak ada produk' : 'Tidak ada produk yang cocok'}
                      </h3>
                      <p className="text-slate-500 mb-6">
                        {products.length === 0 
                          ? 'Buat produk pertama Anda untuk memulai.'
                          : searchTerm 
                            ? 'Coba kata kunci lain atau bersihkan pencarian.'
                            : 'Tidak ada produk yang sesuai dengan filter saat ini.'
                        }
                      </p>
                      {products.length === 0 && (
                        <button
                          onClick={onCreateNewProduct}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300"
                        >
                          Buat Produk
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {products.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-700/50">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={products.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
      
      <div className="mt-12">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
          Tipe Produk
        </h2>
        <p className="text-slate-400 mb-8">Atur produk Anda dengan kategori khusus</p>
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PlusIcon className="w-4 h-4 text-white" />
              </div>
              Tambah Tipe Baru
            </h3>
            <Form.Root onSubmit={handleAddTypeSubmit}>
              <div className="flex gap-4">
                <Form.Field name="typeName" className="flex-1">
                  <Form.Control asChild>
                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="Masukkan nama tipe (misalnya, Elektronik, Pakaian)"
                      className="w-full px-6 py-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 text-white rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 placeholder-slate-400"
                    />
                  </Form.Control>
                </Form.Field>
                <Form.Submit asChild>
                  <button
                    type="submit"
                    disabled={isProcessing || !newTypeName.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Tambah Tipe
                  </button>
                </Form.Submit>
              </div>
            </Form.Root>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <TagIcon className="w-4 h-4 text-white" />
              </div>
              Tipe yang Ada ({productTypes.length})
            </h3>
            {!productTypes.length && !isDataLoading ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <TagIcon className="w-10 h-10 text-slate-500" />
                </div>
                <h4 className="text-xl font-semibold text-slate-300 mb-2">Belum ada tipe produk</h4>
                <p className="text-slate-500 mb-6">Buat tipe produk pertama Anda untuk mengatur katalog</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {productTypes.map(type => (
                  <div key={type.id} className="group flex justify-between items-center p-6 bg-slate-700/30 backdrop-blur-sm rounded-2xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:bg-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
                        <TagIcon className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg group-hover:text-purple-300 transition-colors">
                          {type.name}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          Kategori produk
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => openEditTypeDialog(type)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PencilSquareIcon className="w-4 h-4" />
                            Sunting
                        </button>
                        <ConfirmationDialog
                          trigger={
                             <button disabled={isProcessing} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                <TrashIcon className="w-4 h-4" />
                                Hapus
                             </button>
                          }
                          title="Hapus Tipe Produk"
                          description={`Apakah Anda yakin ingin menghapus tipe produk “${type.name}”? Tindakan ini tidak dapat dibatalkan.`}
                          onConfirm={() => onDeleteType(type.id)}
                          confirmButtonText="Hapus"
                          confirmButtonVariant="danger"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog.Root open={isEditTypeDialogOpen} onOpenChange={setIsEditTypeDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md z-50 border border-slate-700/50 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <AlertDialog.Title className="text-2xl font-bold text-white mb-3">
              Sunting Tipe Produk
            </AlertDialog.Title>
            <AlertDialog.Description className="text-slate-400 mb-6 text-lg">
              Perbarui nama untuk “{editingProductType?.name}”.
            </AlertDialog.Description>
            <Form.Root onSubmit={handleUpdateTypeSubmit}>
              <Form.Field name="editTypeName" className="mb-6">
                <Form.Label className="block text-sm font-semibold text-slate-300 mb-2">
                  Nama Tipe Baru
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    value={editedProductTypeName}
                    onChange={(e) => setEditedProductTypeName(e.target.value)}
                    required
                    className="w-full px-5 py-3.5 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 placeholder-slate-400"
                    placeholder="Masukkan nama tipe baru"
                  />
                </Form.Control>
                <Form.Message match="valueMissing" className="text-red-400 text-sm mt-1">
                  Nama tipe tidak boleh kosong.
                </Form.Message>
              </Form.Field>
              <div className="flex gap-4 justify-end">
                <AlertDialog.Cancel asChild>
                  <button type="button" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200">
                    Batal
                  </button>
                </AlertDialog.Cancel>
                <Form.Submit asChild>
                  <button
                    type="submit"
                    disabled={isProcessing || !editedProductTypeName.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Simpan Perubahan
                  </button>
                </Form.Submit>
              </div>
            </Form.Root>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
      <Dialog.Root open={!!selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {selectedProduct && (
              <>
                <div className="flex justify-between items-center p-6 border-b border-slate-700/50 flex-shrink-0">
                  <Dialog.Title className="text-2xl font-bold text-white">
                    Detail Produk
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-all">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </Dialog.Close>
                </div>
                <div className="p-8 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? (
                        <div className="space-y-4">
                          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-700">
                            <Image src={selectedProduct.image_urls[0]} alt={selectedProduct.name} fill className="object-cover"/>
                          </div>
                          {selectedProduct.image_urls.length > 1 && (
                             <div className="grid grid-cols-4 gap-3">
                                {selectedProduct.image_urls.slice(1, 5).map((url, index) => (
                                  <div key={index} className="relative aspect-square w-full rounded-lg overflow-hidden border border-slate-700">
                                    <Image src={url} alt={`${selectedProduct.name} image ${index + 2}`} fill className="object-cover" />
                                  </div>
                                ))}
                             </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square w-full bg-slate-700/50 rounded-2xl border border-slate-600/50 flex items-center justify-center">
                          <CubeIcon className="w-24 h-24 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                        {selectedProduct.name}
                      </h3>
                      <div className="flex flex-wrap gap-4 items-center">
                        <StatusBadge published={selectedProduct.is_published} />
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {selectedProduct.product_types?.name || 'Tanpa Kategori'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-300 text-lg mb-2">Deskripsi</h4>
                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                          {selectedProduct.description || 'Tidak ada deskripsi untuk produk ini.'}
                        </p>
                      </div>

                      {selectedProduct.store_links && selectedProduct.store_links.length > 0 && (
                        <div>
                           <h4 className="font-semibold text-slate-300 text-lg mb-3">Tautan Toko</h4>
                           <div className="space-y-3">
                            {selectedProduct.store_links.map((link, index) => (
                              <a href={link.url} target="_blank" rel="noopener noreferrer" key={index} className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-red-500/50 hover:bg-slate-700/80 transition-all duration-200">
                                <div className="p-2 bg-slate-600/50 rounded-lg">
                                    <LinkIcon className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-medium text-white truncate">{link.name || new URL(link.url).hostname}</p>
                                    <p className="text-xs text-slate-400 truncate">{link.url}</p>
                                </div>
                              </a>
                            ))}
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}