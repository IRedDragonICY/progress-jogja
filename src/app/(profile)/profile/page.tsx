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
  getOrders,
  createReview,
} from '@/lib/supabase';
import { fetchAddressFromCoords } from '@/lib/location';
import type { UserWithProfile, Profile, Address, Order, OrderItem, Review } from '@/types/supabase';
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
  ArchiveBoxIcon,
  XMarkIcon,
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
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[90vh] max-h-[800px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <Dialog.Title className="text-2xl font-bold text-white p-6 border-b border-gray-700/50 flex-shrink-0 flex justify-between items-center">{title}<Dialog.Close asChild><button className="p-2 rounded-full hover:bg-gray-700"><XMarkIcon className="w-6 h-6 text-gray-400" /></button></Dialog.Close></Dialog.Title>
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
  return (
    <Link href="/profile/address">
      <SectionCard icon={MapPinIcon} title="Address Management" description="Manage your shipping addresses." />
    </Link>
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

const OrderHistorySection = ({ userId }: { userId: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const userOrders = await getOrders(userId);
            setOrders(userOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen, fetchOrders]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewingItem || !selectedOrder || rating === 0) return;
        try {
            await createReview({
                user_id: userId,
                product_id: reviewingItem.product_id,
                order_id: selectedOrder.id,
                rating,
                comment,
            });
            setReviewingItem(null);
            setRating(0);
            setComment("");
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const statusStyles: { [key: string]: string } = {
            pending: 'bg-yellow-800/50 border-yellow-700/50 text-yellow-300',
            paid: 'bg-blue-800/50 border-blue-700/50 text-blue-300',
            processing: 'bg-purple-800/50 border-purple-700/50 text-purple-300',
            shipped: 'bg-cyan-800/50 border-cyan-700/50 text-cyan-300',
            completed: 'bg-green-800/50 border-green-700/50 text-green-300',
            cancelled: 'bg-red-800/50 border-red-700/50 text-red-300',
            failed: 'bg-red-900/50 border-red-800/50 text-red-400',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || 'bg-gray-700'}`}>{status}</span>;
    };

    const renderReviewModal = () => (
        <Dialog.Root open={!!reviewingItem} onOpenChange={() => setReviewingItem(null)}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/70 z-[60]" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl p-6 z-[60]">
                    <Dialog.Title className="text-xl font-bold text-white mb-4">Beri Ulasan untuk {reviewingItem?.name}</Dialog.Title>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-red-400 mb-2">Rating</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => setRating(star)}>
                                        <StarSolidIcon className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-red-400 mb-2">Komentar</label>
                            <textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} rows={4} className="input-field w-full" />
                        </div>
                        <div className="flex justify-end gap-3"><button type="button" onClick={() => setReviewingItem(null)} className="btn-secondary">Batal</button><button type="submit" className="btn-primary">Kirim Ulasan</button></div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );

    return (
        <>
            <SectionCard icon={ArchiveBoxIcon} title="Riwayat Pesanan" description="Lihat status dan detail pesanan Anda." onClick={() => setIsOpen(true)} />
            <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Riwayat Pesanan">
                {isLoading ? <div className="p-6 text-center">Memuat...</div> :
                    <div className="p-6 space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="font-semibold text-white">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="space-y-2">
                                    {order.order_items.map(item => (
                                        <div key={item.product_id} className="flex items-center justify-between text-sm">
                                            <p>{item.name} (x{item.quantity})</p>
                                            {order.status === 'completed' && <button onClick={() => { setSelectedOrder(order); setReviewingItem(item);}} className="text-xs text-red-400 hover:underline">Beri Ulasan</button>}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-right font-bold mt-2">Total: Rp {order.total_amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                }
            </FormDialog>
            {renderReviewModal()}
        </>
    );
};


export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const userProfile = await getUserWithProfile();
        setProfileData(userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileUpdated = (newProfile: Profile) => {
    setProfileData(prev => prev ? { ...prev, profile: newProfile } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Tidak dapat memuat profil</h2>
          <button onClick={() => router.push('/')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12 pt-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">
              Profil Saya
            </h1>
            <p className="text-gray-400 text-lg mt-2">Kelola akun dan pengaturan Anda</p>
          </div>
          <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-700">
              {profileData.profile?.avatar_url ? (
                <Image src={profileData.profile.avatar_url} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-20 h-20 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profileData.profile?.full_name || 'Nama belum diset'}</h2>
              <p className="text-gray-400">{profileData.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">Akun Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EditProfileSection profileData={profileData} onProfileUpdated={handleProfileUpdated} />
          <AddressSection profileData={profileData} onProfileUpdated={handleProfileUpdated} />
          <ChangePasswordSection />
          <OrderHistorySection userId={profileData.user.id} />
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Zona Berbahaya
          </h3>
          <DeleteAccountSection />
        </div>

        <div className="text-center">
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}