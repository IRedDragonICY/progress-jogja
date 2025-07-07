'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import {
  signOut,
  getUserWithProfile,
  updateUserProfile,
  uploadAvatar,
  supabase,
} from '@/lib/supabase';
import { fetchAddressFromCoords } from '@/lib/location';
import type { UserWithProfile, Profile, Address } from '@/types/supabase';
import {
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  MapPinIcon,
  TrashIcon,
  CameraIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  StarIcon as StarSolidIcon,
  KeyIcon,
  HomeIcon,
  BriefcaseIcon,
  TagIcon,
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>,
});

const SectionCard = ({ icon: Icon, title, description, onClick, children }: { icon: React.ElementType, title: string, description: string, onClick?: () => void, children?: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`w-full p-6 bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700/50 text-left transition-all duration-300 hover:border-red-500/50 hover:bg-gray-800/50 group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
          <Icon className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      {onClick && <ChevronRightIcon className="w-6 h-6 text-gray-500 group-hover:text-red-400 transition-colors" />}
    </div>
    {children && <div className="mt-4">{children}</div>}
  </button>
);

const FormDialog = ({ open, onOpenChange, title, children }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, children: React.ReactNode }) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[90vh] max-h-[800px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <Dialog.Title className="text-2xl font-bold text-white p-6 border-b border-gray-700/50 flex-shrink-0">{title}</Dialog.Title>
        <div className="flex-grow overflow-y-auto">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const EditProfileSection = ({ profileData, onProfileUpdated }: { profileData: UserWithProfile, onProfileUpdated: (newProfile: Profile) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>(JSON.parse(JSON.stringify(profileData.profile || {})));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(profileData.profile || {})));
      setAvatarFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [isOpen, profileData.profile, previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let avatar_url = formData.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadAvatar(profileData.user.id, avatarFile);
      }
      const updatedProfile = await updateUserProfile(profileData.user.id, { full_name: formData.full_name, avatar_url });
      onProfileUpdated(updatedProfile);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar = previewUrl || formData.avatar_url;

  return (
    <>
      <SectionCard
        icon={PencilSquareIcon}
        title="Ubah Profil"
        description="Perbarui nama dan foto profil Anda."
        onClick={() => setIsOpen(true)}
      />
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Ubah Profil">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group w-32 h-32">
              <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                {currentAvatar ? <Image key={currentAvatar} src={currentAvatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-24 h-24 text-gray-500" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="w-10 h-10 text-white" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <p className="text-sm text-gray-400">Klik pada gambar untuk mengganti foto</p>
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-red-400 mb-2">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all">Batal</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
              {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormDialog>
    </>
  );
};

const AddressSection = ({ profileData, onProfileUpdated }: { profileData: UserWithProfile, onProfileUpdated: (newProfile: Profile) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if(isOpen) setAddresses(JSON.parse(JSON.stringify(profileData.profile?.addresses || [])));
  }, [isOpen, profileData.profile?.addresses]);

  const updateAddress = useCallback(<K extends keyof Address>(id: string, field: K, value: Address[K]) => {
    setAddresses(prev => prev.map(addr => addr.id === id ? { ...addr, [field]: value } : addr));
  }, []);

  const debouncedFetchAddress = useMemo(
    () => debounce(async (id: string, lat: number, lng: number) => {
      const { full_address, postal_code } = await fetchAddressFromCoords(lat, lng);
      updateAddress(id, 'full_address', full_address);
      if (postal_code) updateAddress(id, 'postal_code', postal_code);
    }, 800),
    [updateAddress]
  );

  const handlePositionChange = useCallback((id: string, lat: number, lng: number) => {
    updateAddress(id, 'latitude', lat);
    updateAddress(id, 'longitude', lng);
    debouncedFetchAddress(id, lat, lng);
  }, [updateAddress, debouncedFetchAddress]);

  const addAddress = () => setAddresses(prev => [...prev, {
      id: uuidv4(),
      label: 'Alamat Baru',
      recipient_name: profileData.profile?.full_name || '',
      recipient_phone: '',
      full_address: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      is_primary: prev.length === 0,
      courier_notes: '',
  }]);

  const removeAddress = (id: string) => setAddresses(prev => {
      const remaining = prev.filter(addr => addr.id !== id);
      if (remaining.length > 0 && !remaining.some(a => a.is_primary)) remaining[0].is_primary = true;
      return remaining;
  });

  const setPrimaryAddress = (id: string) => setAddresses(prev => prev.map(addr => ({ ...addr, is_primary: addr.id === id })));

  const saveAddresses = async () => {
    try {
      const updatedProfile = await updateUserProfile(profileData.user.id, { addresses });
      onProfileUpdated(updatedProfile);
      setIsOpen(false);
    } catch(err) { console.error(err); }
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('rumah')) return HomeIcon;
    if (l.includes('kantor') || l.includes('kerja')) return BriefcaseIcon;
    return TagIcon;
  }

  const inputBaseStyle = "w-full bg-gray-700/50 border border-gray-600 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50";


  return (
    <>
      <SectionCard icon={MapPinIcon} title="Daftar Alamat" description="Kelola alamat pengiriman Anda." onClick={() => setIsOpen(true)} />
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Daftar Alamat">
        <div className="p-6 space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700/50 space-y-4">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                     {React.createElement(getAddressIcon(addr.label), {className: "w-5 h-5 text-gray-400"})}
                    <input type="text" value={addr.label} onChange={(e) => updateAddress(addr.id, 'label', e.target.value)} className="bg-transparent text-lg font-semibold text-white focus:outline-none w-full" />
                  </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPrimaryAddress(addr.id)} className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${addr.is_primary ? 'bg-amber-500/80 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {addr.is_primary ? <StarSolidIcon className="w-3 h-3"/> : <StarOutlineIcon className="w-3 h-3"/>} Utama
                  </button>
                  <button onClick={() => removeAddress(addr.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 <input type="text" value={addr.recipient_name} onChange={e => updateAddress(addr.id, 'recipient_name', e.target.value)} placeholder="Nama Penerima" className={inputBaseStyle} />
                 <input type="tel" value={addr.recipient_phone} onChange={e => updateAddress(addr.id, 'recipient_phone', e.target.value)} placeholder="Telepon Penerima" className={inputBaseStyle} />
              </div>
              <textarea value={addr.full_address} onChange={e => updateAddress(addr.id, 'full_address', e.target.value)} placeholder="Alamat Lengkap" rows={2} className={`${inputBaseStyle} resize-none`} />
              <MapPicker initialPosition={addr.latitude && addr.longitude ? [addr.latitude, addr.longitude] : null} onPositionChange={(lat, lng) => handlePositionChange(addr.id, lat, lng)} height="200px" />
            </div>
          ))}
          <button onClick={addAddress} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all">
            <PlusIcon className="w-5 h-5" /> Tambah Alamat
          </button>
        </div>
        <div className="flex justify-end gap-3 p-6 mt-auto border-t border-gray-700/50">
          <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl">Batal</button>
          <button onClick={saveAddresses} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl">Simpan Alamat</button>
        </div>
      </FormDialog>
    </>
  );
};

const ChangePasswordSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password.length < 6) { setError('Kata sandi minimal 6 karakter.'); return; }
    if (password !== confirmPassword) { setError('Kata sandi tidak cocok.'); return; }

    setIsSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Kata sandi berhasil diperbarui!');
      setPassword(''); setConfirmPassword('');
      setTimeout(() => setIsOpen(false), 2000);
    }
  };

  const inputBaseStyle = "w-full bg-gray-800/60 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

  return (
     <>
      <SectionCard icon={KeyIcon} title="Ubah Kata Sandi" description="Perbarui keamanan akun Anda secara berkala." onClick={() => setIsOpen(true)} />
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Ubah Kata Sandi">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-400 mb-2">Kata Sandi Baru</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputBaseStyle} placeholder="••••••••" />
          </div>
           <div>
            <label className="block text-sm font-medium text-red-400 mb-2">Konfirmasi Kata Sandi Baru</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputBaseStyle} placeholder="••••••••" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}
           <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl">Batal</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2">
                {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormDialog>
     </>
  );
};

const DeleteAccountSection = () => {
    const handleDelete = () => {
        alert("Fungsi ini membutuhkan implementasi backend (Supabase Edge Function) yang aman untuk menghapus data pengguna terkait. Untuk saat ini, fungsi ini belum aktif.");
    };
    return(
        <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
                 <button className="w-full p-6 bg-red-900/40 backdrop-blur-md rounded-3xl border border-red-700/50 text-left transition-all duration-300 hover:border-red-500/50 hover:bg-red-900/70 group">
                    <div className="flex items-center gap-5">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-900/80 rounded-2xl flex items-center justify-center border border-red-800">
                           <TrashIcon className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                        <h3 className="text-lg font-bold text-red-300">Hapus Akun</h3>
                        <p className="text-sm text-red-400/80">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
                        </div>
                    </div>
                 </button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
                <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900/95 border border-red-700/50 rounded-3xl p-8 z-50">
                     <AlertDialog.Title className="text-2xl font-bold text-red-300 flex items-center gap-3"><ExclamationTriangleIcon className="w-7 h-7"/>Konfirmasi Hapus Akun</AlertDialog.Title>
                     <AlertDialog.Description className="text-gray-400 my-4">Apakah Anda yakin? Semua data Anda, termasuk profil dan alamat, akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.</AlertDialog.Description>
                     <div className="flex justify-end gap-3">
                        <AlertDialog.Cancel asChild><button className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold">Batal</button></AlertDialog.Cancel>
                        <AlertDialog.Action asChild><button onClick={handleDelete} className="px-5 py-2 bg-red-700 hover:bg-red-800 rounded-xl font-semibold text-white">Ya, Hapus Akun Saya</button></AlertDialog.Action>
                     </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
};

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getUserWithProfile();
        if (!data?.user) {
          router.replace('/login');
          return;
        }
        // Type assertion to handle the null profile case
        setProfileData(data as UserWithProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    void fetchProfile();
  }, [router]);

  const handleProfileUpdated = useCallback((newProfile: Profile) => {
    setProfileData(prev => prev ? ({ ...prev, profile: newProfile }) : null);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!profileData?.user) {
    return null;
  }

  const { user, profile } = profileData;

  // Handle case where profile might be null
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-white mb-4">Profile not found</p>
          <button 
            onClick={() => router.replace('/login')} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row items-center gap-6 p-6 mb-8 bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700/50">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                {profile.avatar_url ? (
                    <Image key={profile.avatar_url} src={profile.avatar_url} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                    <UserCircleIcon className="w-20 h-20 text-white" />
                )}
            </div>
            <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-white">{profile.full_name || 'Pengguna Baru'}</h1>
                <p className="text-slate-400">{user.email}</p>
                 <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${profile.role === 'admin' ? 'bg-emerald-900/70 text-emerald-300' : 'bg-blue-900/70 text-blue-300'}`}>
                    {profile.role === 'admin' ? 'Administrator' : 'Pengguna'}
                </span>
            </div>
            <div className="flex gap-2">
                 {profile.role === 'admin' && (
                    <button onClick={() => router.push('/admin')} className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all border border-slate-600/50 text-slate-300 hover:text-white">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={handleLogout} className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all border border-slate-600/50 text-slate-300 hover:text-white">
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                </button>
            </div>
        </header>

        <main className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-400 px-4">Pengaturan Akun</h2>
            <EditProfileSection profileData={profileData} onProfileUpdated={handleProfileUpdated} />
            <AddressSection profileData={profileData} onProfileUpdated={handleProfileUpdated} />

            <h2 className="text-lg font-semibold text-gray-400 px-4 pt-4">Keamanan</h2>
            <ChangePasswordSection />
            <DeleteAccountSection />
        </main>
         <div className="text-center mt-8">
             <Link href="/" className="text-sm text-red-400 hover:text-red-300 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}