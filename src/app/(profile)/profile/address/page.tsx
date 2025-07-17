'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {
  getUserWithProfile,
  updateUserProfile,
} from '@/lib/supabase';
import { fetchAddressFromCoords } from '@/lib/location';
import type { UserWithProfile, Profile, Address } from '@/types/supabase';
import {
  ArrowLeftIcon,
  MapPinIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  StarIcon as StarSolidIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon as OtherIcon,
  CheckIcon,
  PhoneIcon,
  UserIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 animate-pulse">
      Memuat Peta...
    </div>
  ),
});

const MaterialInput = React.forwardRef<HTMLInputElement, {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  name: string;
  icon?: React.ElementType;
  disabled?: boolean;
}>(({ label, value, icon: Icon, ...props }, ref) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />}
    <input
      ref={ref}
      value={value}
      {...props}
      placeholder=" "
      className={`w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-base disabled:opacity-70 disabled:bg-gray-200 ${Icon ? 'pl-12' : 'pl-4'}`}
    />
    <label
      className={`absolute top-4 transition-all duration-200 text-gray-500 pointer-events-none ${Icon ? 'left-12' : 'left-4'} ${(value) ? 'text-xs -translate-y-4 bg-white px-1' : ''}`}
    >
      {label}
    </label>
  </div>
));
MaterialInput.displayName = "MaterialInput";

const MaterialTextarea = React.forwardRef<HTMLTextAreaElement, {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  rows?: number;
  disabled?: boolean;
}>(({ label, value, rows = 3, ...props }, ref) => (
  <div className="relative">
    <textarea
      ref={ref}
      value={value}
      rows={rows}
      {...props}
      placeholder=" "
      className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 resize-none disabled:opacity-70 disabled:bg-gray-200"
    />
    <label className={`absolute top-4 left-4 transition-all duration-200 text-gray-500 pointer-events-none ${(value) ? 'text-xs -translate-y-4 bg-white px-1' : ''}`}>
      {label}
    </label>
  </div>
));
MaterialTextarea.displayName = "MaterialTextarea";

const AddressManagementPageContent = ({ fromCheckout }: { fromCheckout: boolean }) => {
  const router = useRouter();

  const [profileData, setProfileData] = useState<UserWithProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [isFetchingAddressFor, setIsFetchingAddressFor] = useState<string | null>(null);

  const addressTypes = [
    { value: 'rumah', label: 'Rumah', icon: HomeIcon },
    { value: 'kantor', label: 'Kantor', icon: BuildingOfficeIcon },
    { value: 'lainnya', label: 'Lainnya', icon: OtherIcon },
  ];

  const getAddressIcon = (label: string) => {
    const type = addressTypes.find(t => label.toLowerCase().includes(t.value));
    return type?.icon || MapIcon;
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userProfile = await getUserWithProfile();
      if (!userProfile) { router.push('/login'); return; }
      setProfileData(userProfile);
      setAddresses(JSON.parse(JSON.stringify(userProfile.profile?.addresses || [])));
    } catch (error) { console.error('Error fetching profile:', error); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handlePositionChange = useCallback(async (id: string, lat: number, lng: number) => {
    if (isFetchingAddressFor) return;
    setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, latitude: lat, longitude: lng } : addr));
    setEditingAddress(prev => prev && prev.id === id ? { ...prev, latitude: lat, longitude: lng } : prev);
    setIsFetchingAddressFor(id);
    try {
      const { full_address, postal_code } = await fetchAddressFromCoords(lat, lng);
      setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, full_address, postal_code: postal_code || addr.postal_code } : addr));
      if (editingAddress?.id === id) { setEditingAddress(prev => prev ? { ...prev, full_address, postal_code: postal_code || prev.postal_code } : null); }
    } catch (error) { console.error('Error handling position change:', error); }
    finally { setIsFetchingAddressFor(null); }
  }, [isFetchingAddressFor, editingAddress]);


  const createNewAddress = () => {
    const newAddress: Address = { id: uuidv4(), label: 'Rumah', recipient_name: profileData?.profile?.full_name || '', recipient_phone: '', full_address: '', postal_code: '', latitude: null, longitude: null, is_primary: addresses.length === 0, courier_notes: '' };
    setEditingAddress(newAddress);
    setPrivacyAgreed(false);
    setIsDialogOpen(true);
  };

  const editAddress = (address: Address) => {
    setEditingAddress(JSON.parse(JSON.stringify(address)));
    setIsDialogOpen(true);
  };

  const setPrimaryAddress = async (id: string) => {
    const updatedAddresses = addresses.map(addr => ({ ...addr, is_primary: addr.id === id }));
    setAddresses(updatedAddresses);
    if (profileData?.user) { try { await updateUserProfile(profileData.user.id, { addresses: updatedAddresses }); } catch (error) { console.error('Error setting primary address:', error); setAddresses(addresses); } }
  };

  const deleteAddress = async (id: string) => {
    const remaining = addresses.filter(addr => addr.id !== id);
    if (remaining.length > 0 && !remaining.some(a => a.is_primary)) { remaining[0].is_primary = true; }
    setAddresses(remaining);
    setDeleteConfirmId(null);
    if (profileData?.user) { try { await updateUserProfile(profileData.user.id, { addresses: remaining }); } catch (error) { console.error('Error deleting address:', error); setAddresses(addresses); } }
  };

  const saveAddress = async () => {
    if (!editingAddress || !profileData?.user) return;
    setIsSaving(true);
    try {
      let updatedAddresses;
      const existingIndex = addresses.findIndex(addr => addr.id === editingAddress.id);
      if (existingIndex >= 0) { updatedAddresses = addresses.map(addr => addr.id === editingAddress.id ? editingAddress : addr); }
      else { updatedAddresses = [...addresses, editingAddress]; }
      if (editingAddress.is_primary) { updatedAddresses = updatedAddresses.map(addr => ({...addr, is_primary: addr.id === editingAddress.id})); }
      setAddresses(updatedAddresses);
      await updateUserProfile(profileData.user.id, { addresses: updatedAddresses });
      setIsDialogOpen(false);
      setEditingAddress(null);
    } catch (error) { console.error('Error saving address:', error); setAddresses(addresses); }
    finally { setIsSaving(false); }
  };

  if (loading) { return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>); }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => fromCheckout ? router.push('/checkout') : router.push('/profile')} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><ArrowLeftIcon className="w-6 h-6 text-gray-600" /></button>
          <div><h1 className="text-3xl font-bold text-gray-900">Pengaturan Alamat</h1><p className="text-gray-600 mt-1">Kelola alamat pengiriman Anda</p></div>
        </div>
        <div className="mb-6"><button onClick={createNewAddress} className="flex items-center gap-3 w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all group"><div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors"><PlusIcon className="w-6 h-6 text-red-600" /></div><div className="text-left"><h3 className="font-semibold text-gray-900">Tambah Alamat Baru</h3><p className="text-sm text-gray-600">Tambahkan alamat pengiriman baru</p></div></button></div>
        <div className="space-y-4">{addresses.map(address => { const IconComponent = getAddressIcon(address.label); return (<div key={address.id} className={`rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all ${ address.is_primary ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg shadow-blue-100/50 ring-1 ring-blue-200/50' : 'bg-white border-gray-200' }`}><div className="flex items-start justify-between"><div className="flex items-start gap-4 flex-1"><div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ address.is_primary ? 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md' : 'bg-gray-100' }`}><IconComponent className={`w-6 h-6 ${ address.is_primary ? 'text-blue-700' : 'text-gray-600' }`} /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-2"><h3 className={`font-semibold ${ address.is_primary ? 'text-blue-900' : 'text-gray-900' }`}>{address.label}</h3>{address.is_primary && (<span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200 shadow-sm"><StarSolidIcon className="w-3 h-3" />Alamat Utama</span>)}</div><div className="space-y-1 text-sm text-gray-600"><div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-gray-400" /><span>{address.recipient_name}</span></div><div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-gray-400" /><span>{address.recipient_phone}</span></div><div className="flex items-start gap-2"><MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{address.full_address}</span></div><div className="flex items-center gap-2 mt-2">{address.latitude && address.longitude ? (<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"><CheckIcon className="w-3 h-3" />Pinpoint Tersedia</span>) : (<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"><XMarkIcon className="w-3 h-3" />Tanpa Pinpoint</span>)}</div></div></div></div><div className="flex items-center gap-2 ml-4">{!address.is_primary && (<button onClick={() => setPrimaryAddress(address.id)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors" title="Jadikan alamat utama"><StarOutlineIcon className="w-5 h-5" /></button>)}<button onClick={() => editAddress(address)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit alamat"><PencilIcon className="w-5 h-5" /></button><button onClick={() => setDeleteConfirmId(address.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Hapus alamat"><TrashIcon className="w-5 h-5" /></button></div></div></div>);})}</div>
        {addresses.length === 0 && (<div className="text-center py-12"><div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><MapPinIcon className="w-12 h-12 text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada alamat</h3><p className="text-gray-600 mb-6">Tambahkan alamat pertama Anda untuk pengiriman</p><button onClick={createNewAddress} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">Tambah Alamat</button></div>)}
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-gray-50 rounded-3xl shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0"><Dialog.Title className="text-xl font-bold text-gray-900">{editingAddress && addresses.find(a => a.id === editingAddress.id) ? 'Edit Alamat' : 'Tambah Alamat Baru'}</Dialog.Title><Dialog.Close asChild><button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XMarkIcon className="w-5 h-5 text-gray-500" /></button></Dialog.Close></div>
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">
              {editingAddress && (<>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Jenis Alamat</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {addressTypes.map(type => { const IconComponent = type.icon; const isSelected = editingAddress.label.toLowerCase().includes(type.value); return (<button key={type.value} type="button" onClick={() => setEditingAddress({ ...editingAddress, label: type.label })} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${ isSelected ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300 text-gray-600' }`}><IconComponent className="w-6 h-6" /><span className="text-sm font-medium">{type.label}</span></button>); })}
                    </div>
                  </div>
                  <MaterialInput label="Label Kustom" name="label" value={editingAddress.label} onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MaterialInput label="Nama Penerima" name="recipient_name" value={editingAddress.recipient_name} onChange={(e) => setEditingAddress({ ...editingAddress, recipient_name: e.target.value })} icon={UserIcon} />
                    <MaterialInput label="Nomor Telepon" name="recipient_phone" type="tel" value={editingAddress.recipient_phone} onChange={(e) => setEditingAddress({ ...editingAddress, recipient_phone: e.target.value })} icon={PhoneIcon} />
                  </div>
                  <div className="relative">
                    <MaterialTextarea label="Alamat Lengkap" name="full_address" value={editingAddress.full_address} onChange={(e) => setEditingAddress({ ...editingAddress, full_address: e.target.value })} disabled={isFetchingAddressFor === editingAddress.id} />
                    {isFetchingAddressFor === editingAddress.id && (<div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center"><ArrowPathIcon className="w-6 h-6 text-gray-500 animate-spin" /></div>)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Lokasi Pinpoint (Sangat Direkomendasikan)</h3>
                    <div className="border border-gray-300 rounded-xl overflow-hidden shadow-inner"><MapPicker initialPosition={ editingAddress.latitude && editingAddress.longitude ? [editingAddress.latitude, editingAddress.longitude] : null } onPositionChange={(lat, lng) => handlePositionChange(editingAddress.id, lat, lng)} height="250px" /></div>
                  </div>
                  <MaterialTextarea label="Catatan untuk Kurir (Opsional)" name="courier_notes" value={editingAddress.courier_notes || ''} onChange={(e) => setEditingAddress({ ...editingAddress, courier_notes: e.target.value })} />
                  <div className="flex items-center gap-3 py-2"><input type="checkbox" id="isPrimary" checked={editingAddress.is_primary} onChange={(e) => setEditingAddress({ ...editingAddress, is_primary: e.target.checked })} className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500" /><label htmlFor="isPrimary" className="text-sm font-medium text-gray-900">Jadikan sebagai alamat utama</label></div>
                  {!addresses.find(a => a.id === editingAddress.id) && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="privacyAgreed" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1" />
                        <div className="flex-1">
                          <label htmlFor="privacyAgreed" className="text-sm text-gray-700 cursor-pointer"><span className="font-medium">Saya menyetujui</span> <Link href="/privacy-policy" target="_blank" className="text-red-600 hover:text-red-700 underline">kebijakan privasi</Link> pengaturan alamat di Progress Jogja</label>
                          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"><InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-blue-800">Dengan menyetujui, Anda mengizinkan kami menyimpan dan menggunakan informasi alamat Anda untuk keperluan pengiriman.</p></div>
                        </div>
                      </div>
                    </div>
                  )}
              </>)}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
              <Dialog.Close asChild><button className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors">Batal</button></Dialog.Close>
              <button onClick={saveAddress} disabled={isSaving || (!addresses.find(a => a.id === editingAddress?.id) && !privacyAgreed)} className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]">{isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}{isSaving ? 'Menyimpan...' : 'Simpan Alamat'}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><ExclamationTriangleIcon className="w-6 h-6 text-red-600" /></div><div><AlertDialog.Title className="text-lg font-bold text-gray-900">Hapus Alamat</AlertDialog.Title><AlertDialog.Description className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus alamat ini?</AlertDialog.Description></div></div>
            <div className="flex justify-end gap-3"><AlertDialog.Cancel asChild><button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors">Batal</button></AlertDialog.Cancel><AlertDialog.Action asChild><button onClick={() => deleteConfirmId && deleteAddress(deleteConfirmId)} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">Ya, Hapus</button></AlertDialog.Action></div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
};

const AddressPageLoading = () => (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>);

const AddressManagementPage = () => {
  return (
    <Suspense fallback={<AddressPageLoading />}>
      <AddressManagementPageWrapper />
    </Suspense>
  );
};

const AddressManagementPageWrapper = () => {
  const searchParams = useSearchParams();
  const fromCheckout = searchParams.get('from') === 'checkout';
  return <AddressManagementPageContent fromCheckout={fromCheckout} />;
};

export default AddressManagementPage;