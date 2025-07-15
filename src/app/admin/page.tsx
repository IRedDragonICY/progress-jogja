'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  signOut, getProductTypes, createProductType, deleteProductType,
  getProducts, deleteMasterProductAndDrafts, toggleProductPublishStatus, getUserDrafts,
  createOrUpdateDraft, deleteDraft, deleteAllUserDrafts, publishDraft, ProductFormData,
  getOrganizationProfile, upsertOrganizationProfile, updateProductType, getUserWithProfile,
  getStorageUsage,
} from "@/lib/supabase";
import type { UserWithProfile } from "@/types/supabase";
import type { Product, ProductType, ProductDraft, OrganizationProfileData, StorageUsageData } from "@/types/supabase";
import AdminProductForm from "@/components/AdminProductForm";
import { AdminSidebar, type AdminTab } from "@/components/admin/AdminSidebar";
import { DashboardHome } from "@/components/admin/DashboardHome";
import { ProductsTab } from "@/components/admin/ProductsTab";
import { ProfileTab } from "@/components/admin/ProfileTab";
import { TransactionsTab } from "@/components/admin/TransactionsTab";
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { XMarkIcon, DocumentTextIcon, PencilIcon, TrashIcon, ArrowRightIcon, ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [userDrafts, setUserDrafts] = useState<ProductDraft[]>([]);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfileData | null>(null);
  const [storageUsage, setStorageUsage] = useState<StorageUsageData | null>(null);
  const [showProductFormDialog, setShowProductFormDialog] = useState(false);
  const [formInitialData, setFormInitialData] = useState<Partial<ProductFormData> | undefined>(undefined);
  const [activeDraftIdForForm, setActiveDraftIdForForm] = useState<string | undefined>(undefined);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message); setToastType(type); setToastOpen(true);
  };

  const loadAllAdminData = useCallback(async (userId: string, force = false) => {
    if (!userId) return;
    setIsDataLoading(true); setNetworkError(null);
    try {
      const [productsData, typesData, draftsData, profileData, storageData] = await Promise.all([
        getProducts(force), getProductTypes(force), getUserDrafts(userId, force), getOrganizationProfile(force), getStorageUsage(force)
      ]);
      setProducts(productsData); setProductTypes(typesData); setUserDrafts(draftsData); setOrganizationProfile(profileData); setStorageUsage(storageData);
    } catch (err: unknown) {
      setNetworkError(`Gagal memuat data: ${(err as Error).message}`);
    } finally { setIsDataLoading(false); }
  }, []);

  useEffect(() => {
    const initializeAdmin = async () => {
        const profile = await getUserWithProfile();
        setUserProfile(profile);
        if (profile?.user.id) {
            await loadAllAdminData(profile.user.id, true);
        }
        setLoading(false);
    };
    initializeAdmin();
  }, [loadAllAdminData]);

  const handleLogout = async () => { await signOut(); };
  const handleAddProductType = async (name: string) => { setIsProcessing(true); try { await createProductType(name); await loadAllAdminData(userProfile!.user.id, true); showToast('Tipe produk berhasil ditambahkan!'); } catch (error: unknown) { showToast((error as Error).message, 'error'); } finally { setIsProcessing(false); }};
  const handleUpdateProductType = async (id: string, name: string) => { setIsProcessing(true); try { await updateProductType(id, name); await loadAllAdminData(userProfile!.user.id, true); showToast('Tipe produk berhasil diperbarui!'); } catch (error: unknown) { showToast(`Gagal memperbarui tipe: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const handleDeleteProductType = async (id: string) => { setIsProcessing(true); try { await deleteProductType(id); await loadAllAdminData(userProfile!.user.id, true); showToast('Tipe produk berhasil dihapus!'); } catch (error: unknown) { showToast((error as Error).message, 'error'); } finally { setIsProcessing(false); }};
  const handleDeleteMasterProduct = async (id: string) => { setIsProcessing(true); try { await deleteMasterProductAndDrafts(id); await loadAllAdminData(userProfile!.user.id, true); showToast('Produk berhasil dihapus!'); } catch (error: unknown) { showToast((error as Error).message, 'error'); } finally { setIsProcessing(false); }};
  const handleTogglePublish = async (product: Product) => { setIsProcessing(true); try { await toggleProductPublishStatus(product.id, !product.is_published); await loadAllAdminData(userProfile!.user.id, true); showToast(`Produk berhasil ${!product.is_published ? "diterbitkan" : "dibatalkan publikasinya"}!`); } catch (error: unknown) { showToast(`Gagal: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const handleFormSave = async (draftId: string, data: ProductFormData) => { if (!userProfile) throw new Error("Pengguna tidak terotentikasi."); try { const savedDraft = await createOrUpdateDraft(userProfile.user.id, data, draftId); setUserDrafts(prev => { const idx = prev.findIndex(d => d.id === savedDraft.id); if (idx > -1) { const u = [...prev]; u[idx] = savedDraft; return u; } return [savedDraft, ...prev]; }); } catch (error) { console.error("Gagal menyimpan draf:", error); throw error; }};
  const handleFormPublish = async (draftId: string) => { if (!userProfile) return showToast("Kesalahan otentikasi.", 'error'); setIsProcessing(true); try { await publishDraft(draftId, userProfile.user.id); showToast("Produk berhasil diterbitkan!"); setShowProductFormDialog(false); setActiveDraftIdForForm(undefined); setFormInitialData(undefined); await loadAllAdminData(userProfile.user.id, true); } catch (error: unknown) { showToast(`Gagal menerbitkan: ${(error as Error).message}`, 'error'); throw error; } finally { setIsProcessing(false); }};
  const openFormForNewProduct = async () => { if (!userProfile) return; setIsProcessing(true); try { const newDraft = await createOrUpdateDraft(userProfile.user.id, { name: "Draf Tanpa Judul", price: 0 }); setActiveDraftIdForForm(newDraft.id); setFormInitialData(newDraft); setShowProductFormDialog(true); setShowDraftsDialog(false); } catch (error: unknown) { showToast(`Gagal membuat draf: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const openFormToEditMasterProduct = async (product: Product) => { if (!userProfile) return; setIsProcessing(true); try { const draftData: ProductFormData = { name: product.name, description: product.description, price: product.price, image_urls: product.image_urls, store_links: product.store_links, product_type_id: product.product_type_id }; const newDraft = await createOrUpdateDraft(userProfile.user.id, draftData, undefined, product.id); setActiveDraftIdForForm(newDraft.id); setFormInitialData(newDraft); setShowProductFormDialog(true); setShowDraftsDialog(false); } catch (error: unknown) { showToast(`Gagal membuat draf: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const openFormToEditExistingDraft = (draft: ProductDraft) => { setActiveDraftIdForForm(draft.id); setFormInitialData(draft); setShowProductFormDialog(true); setShowDraftsDialog(false);};
  const handleDeleteUserDraft = async (draftId: string) => { setIsProcessing(true); try { await deleteDraft(draftId); if (activeDraftIdForForm === draftId) { setShowProductFormDialog(false); setActiveDraftIdForForm(undefined); setFormInitialData(undefined); } await loadAllAdminData(userProfile!.user.id, true); showToast('Draf berhasil dihapus!'); } catch (error: unknown) { showToast(`Gagal menghapus draf: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const handleDeleteAllUserDraftsAction = async () => { if (!userProfile) return showToast("Kesalahan otentikasi.", 'error'); setIsProcessing(true); try { await deleteAllUserDrafts(userProfile.user.id); if (showProductFormDialog && userDrafts.some(d => d.id === activeDraftIdForForm)) { setShowProductFormDialog(false); setActiveDraftIdForForm(undefined); setFormInitialData(undefined); } setUserDrafts([]); showToast('Semua draf berhasil dihapus!'); } catch (error: unknown) { showToast(`Gagal menghapus semua draf: ${(error as Error).message}`, 'error'); } finally { setIsProcessing(false); }};
  const handleFormCancel = () => { setShowProductFormDialog(false); setActiveDraftIdForForm(undefined); setFormInitialData(undefined); };
  const handleProfileSave = async (data: OrganizationProfileData) => { setIsProfileSaving(true); try { const updatedProfile = await upsertOrganizationProfile(data); setOrganizationProfile(updatedProfile); showToast('Profil organisasi berhasil disimpan!'); } catch (error: unknown) { showToast(`Gagal menyimpan profil: ${(error as Error).message}`, 'error'); } finally { setIsProfileSaving(false); }};
  const handleTabChange = (tab: AdminTab) => { 
    setActiveTab(tab); 
    
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
    
    if (showProductFormDialog && tab !== 'products' && tab !== 'home') { 
      setShowProductFormDialog(false); 
      setActiveDraftIdForForm(undefined); 
      setFormInitialData(undefined); 
    }
  };
  const handleSetActiveTab = (tab: string) => { setActiveTab(tab as AdminTab); };
  const handleCreateNewProduct = () => { openFormForNewProduct().catch(console.error); };

  const filteredProducts = useMemo(() => { if (!searchTerm) return products; return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))); }, [products, searchTerm]);
  const LoadingSpinner = () => (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>);

  if (loading) { return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"><div className="text-center"><div className="animate-spin rounded-full h-20 w-20 border-b-2 border-red-500 mx-auto mb-6"></div><h1 className="text-2xl font-bold text-white mb-2">Memuat Dasbor</h1><p className="text-slate-400">Mempersiapkan panel admin Anda...</p></div></div>); }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome products={products} productTypes={productTypes} userDrafts={userDrafts} storageUsage={storageUsage} setShowDraftsDialog={setShowDraftsDialog} onCreateNewProduct={handleCreateNewProduct} onEditDraft={openFormToEditExistingDraft} onSetActiveTab={handleSetActiveTab} isProcessing={isProcessing}/>;
      case 'products':
        return <ProductsTab products={filteredProducts} userDrafts={userDrafts} setShowDraftsDialog={setShowDraftsDialog} onCreateNewProduct={handleCreateNewProduct} onEditProduct={openFormToEditMasterProduct} onDeleteProduct={handleDeleteMasterProduct} onTogglePublish={handleTogglePublish} isProcessing={isProcessing} isDataLoading={isDataLoading} productTypes={productTypes} onAddType={handleAddProductType} onDeleteType={handleDeleteProductType} onUpdateType={handleUpdateProductType} searchTerm={searchTerm} onSearchChange={setSearchTerm}/>;
      case 'transactions':
        return <TransactionsTab />;
      case 'profile':
        return <ProfileTab organizationProfile={organizationProfile} onProfileSave={handleProfileSave} isProfileSaving={isProfileSaving} isDataLoading={isDataLoading}/>;
      default:
        return (
          <div className="p-8 text-center">
            <div className="text-slate-400 mb-4">
              <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
              <p>The requested page could not be found.</p>
            </div>
            <button 
              onClick={() => setActiveTab('home')}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <Toast.Provider swipeDirection="right">
      <Dialog.Root open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
          {/* Sidebar */}
          <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            userProfile={userProfile ? {
              name: userProfile.user.email?.split('@')[0] || 'Admin',
              email: userProfile.user.email || ''
            } : undefined}
            stats={{
              totalProducts: products.length,
              totalTransactions: 0, // This would come from actual transaction data
              pendingDrafts: userDrafts.length
            }}
          />
          
          {/* Main Content */}
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-72'} min-h-screen`}>
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="lg:hidden p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                  >
                    {sidebarCollapsed ? (
                      <Bars3Icon className="w-5 h-5 text-slate-400" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <div className="space-y-2"><h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">Progress Jogja</h1><p className="text-slate-400 text-lg">Dasbor Admin</p><p className="text-slate-500 text-sm">Kelola produk, transaksi, dan profil organisasi</p></div>
                </div>
                <div className="flex items-center gap-4"><div className="hidden md:block text-right"><p className="text-sm text-slate-400">Masuk sebagai</p><p className="text-white font-medium">{userProfile?.user?.email}</p></div><button onClick={() => window.open('/', '_blank')} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2.5"><HomeIcon className="w-5 h-5" /><span>Halaman Utama</span></button><AlertDialog.Root><AlertDialog.Trigger asChild><button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5">Keluar</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" /><AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md z-50 border border-slate-700/50 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"><AlertDialog.Title className="text-2xl font-bold text-white mb-3">Konfirmasi Keluar</AlertDialog.Title><AlertDialog.Description className="text-slate-400 mb-8 text-lg">Apakah Anda yakin ingin keluar dari dasbor admin?</AlertDialog.Description><div className="flex gap-4 justify-end"><AlertDialog.Cancel asChild><button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200">Batal</button></AlertDialog.Cancel><AlertDialog.Action asChild><button onClick={handleLogout} className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-200">Keluar</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root></div>
              </header>
              {(isProcessing || isDataLoading || isProfileSaving) && (<div className="mb-6 p-6 bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-lg"><div className="flex items-center justify-center gap-4"><LoadingSpinner /><span className="text-red-200 font-semibold text-lg">{isDataLoading ? 'Mengambil data...' : isProfileSaving ? 'Menyimpan profil...' : 'Memproses...'}</span></div></div>)}
              {networkError && (<div className="mb-6 p-6 bg-gradient-to-r from-red-900/40 to-red-800/40 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-lg"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div><span className="text-red-200 font-medium">{networkError}</span></div><button onClick={() => loadAllAdminData(userProfile!.user.id, true).catch(console.error)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200">Coba Lagi</button></div></div>)}
              
              {/* Main Content Area */}
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 overflow-hidden">
                {renderMainContent()}
              </div>
            </div>
          </div>
          <Dialog.Root open={showProductFormDialog} onOpenChange={setShowProductFormDialog}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" /><Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[90vh] max-h-[90vh] bg-transparent border-none shadow-none z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] p-0"><VisuallyHidden><Dialog.Title>Editor Produk</Dialog.Title></VisuallyHidden>{activeDraftIdForForm && formInitialData !== undefined && (<AdminProductForm key={activeDraftIdForForm} activeDraftId={activeDraftIdForForm} initialDraftData={formInitialData} productTypes={productTypes} onSave={handleFormSave} onPublish={handleFormPublish} onCancel={handleFormCancel} isExternallySaving={isProcessing}/>)}</Dialog.Content></Dialog.Portal></Dialog.Root>
          <Dialog.Portal><Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" /><Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl max-h-[85vh] bg-slate-800/95 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 gap-4"><div className="flex-1"><Dialog.Title className="text-2xl font-bold text-white mb-1">Draf Saya</Dialog.Title><p className="text-slate-400">Kelola draf pekerjaan Anda</p></div><div className="flex flex-wrap gap-3">{userDrafts.length > 0 && (<AlertDialog.Root><AlertDialog.Trigger asChild><button disabled={isProcessing} className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-4 h-4" />Hapus Semua</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" /><AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-2xl p-8 w-full max-w-md z-50 border border-slate-700 shadow-2xl"><AlertDialog.Title className="text-xl font-semibold text-white mb-2 flex items-center gap-2"><ExclamationTriangleIcon className="w-6 h-6 text-red-400"/>Konfirmasi Penghapusan</AlertDialog.Title><AlertDialog.Description className="text-slate-400 mb-6">Apakah Anda yakin ingin menghapus SEMUA draf? Tindakan ini tidak dapat dibatalkan.</AlertDialog.Description><div className="flex gap-3 justify-end"><AlertDialog.Cancel asChild><button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Batal</button></AlertDialog.Cancel><AlertDialog.Action asChild><button onClick={handleDeleteAllUserDraftsAction} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">Hapus Semua Draf</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>)}<button onClick={handleCreateNewProduct} disabled={isProcessing} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Buat Draf Baru</button></div><Dialog.Close asChild><button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"><XMarkIcon className="w-6 h-6" /></button></Dialog.Close></div><div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)]">{!userDrafts.length ? (<div className="text-center py-16"><div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6"><DocumentTextIcon className="w-10 h-10 text-slate-400" /></div><h3 className="text-xl font-semibold text-slate-300 mb-2">Belum ada draf</h3><p className="text-slate-500 mb-6">Mulai buat draf produk pertama Anda</p></div>) : (<div className="grid gap-4">{userDrafts.map(draft => (<div key={draft.id} className="group bg-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:bg-slate-700/50"><div className="flex flex-col lg:flex-row justify-between gap-4"><div className="flex-1 space-y-3"><h4 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">{draft.name || "[Draf Tanpa Judul]"}</h4><div className="space-y-1.5"><p className="text-sm text-slate-400">{draft.product_id ? `Mengedit Produk ID: ...${draft.product_id.slice(-6)}` : "Draf Produk Baru"}</p><p className="text-sm text-slate-400">Terakhir disimpan: {new Date(draft.updated_at!).toLocaleString('id-ID')}</p></div></div><div className="flex flex-wrap gap-2 items-start"><button onClick={() => openFormToEditExistingDraft(draft)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2"><PencilIcon className="w-4 h-4" />Ubah</button><AlertDialog.Root><AlertDialog.Trigger asChild><button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2"><ArrowRightIcon className="w-4 h-4" />Terbitkan</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" /><AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-2xl p-8 w-full max-w-md z-50 border border-slate-700 shadow-2xl"><AlertDialog.Title className="text-xl font-semibold text-white mb-2">Terbitkan Draf</AlertDialog.Title><AlertDialog.Description className="text-slate-400 mb-6">Apakah Anda yakin ingin menerbitkan "{draft.name || 'draf ini'}"?</AlertDialog.Description><div className="flex gap-3 justify-end"><AlertDialog.Cancel asChild><button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Batal</button></AlertDialog.Cancel><AlertDialog.Action asChild><button onClick={() => handleFormPublish(draft.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors">Terbitkan</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root><AlertDialog.Root><AlertDialog.Trigger asChild><button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2"><TrashIcon className="w-4 h-4" />Hapus</button></AlertDialog.Trigger><AlertDialog.Portal><AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" /><AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-2xl p-8 w-full max-w-md z-50 border border-slate-700 shadow-2xl"><AlertDialog.Title className="text-xl font-semibold text-white mb-2">Hapus Draf</AlertDialog.Title><AlertDialog.Description className="text-slate-400 mb-6">Apakah Anda yakin ingin menghapus "{draft.name || 'draf ini'}"?</AlertDialog.Description><div className="flex gap-3 justify-end"><AlertDialog.Cancel asChild><button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Batal</button></AlertDialog.Cancel><AlertDialog.Action asChild><button onClick={() => handleDeleteUserDraft(draft.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">Hapus</button></AlertDialog.Action></div></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root></div></div></div>))}</div>)}</div></Dialog.Content></Dialog.Portal>
        </div>
      </Dialog.Root>
      <Toast.Root className={`fixed bottom-6 right-6 p-6 rounded-2xl shadow-2xl border z-50 transition-all duration-500 backdrop-blur-xl ${toastType === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-red-900/90 border-red-500/50 text-red-100'} data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipe-out`} open={toastOpen} onOpenChange={setToastOpen}><div className="flex items-start gap-4"><div className={`w-2 h-2 rounded-full mt-2 ${toastType === 'success' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div><div className="flex-1"><Toast.Title className="font-bold text-lg mb-1">{toastType === 'success' ? 'Berhasil!' : 'Gagal!'}</Toast.Title><Toast.Description className="text-sm opacity-90 leading-relaxed">{toastMessage}</Toast.Description></div><Toast.Close className="ml-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors"><XMarkIcon className="w-5 h-5" /></Toast.Close></div></Toast.Root>
      <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
      <style jsx global>{`:root { --radix-toast-swipe-move-x: 0px; --radix-toast-swipe-end-x: 0px; } @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } } @keyframes swipe-out { from { transform: translateX(var(--radix-toast-swipe-end-x)); } to { transform: translateX(100%); } }`}</style>
    </Toast.Provider>
  );
}