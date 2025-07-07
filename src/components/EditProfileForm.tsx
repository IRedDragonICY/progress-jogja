'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { uploadAvatar, updateUserProfile } from '@/lib/supabase';
import { fetchAddressFromCoords } from '@/lib/location';
import type { UserWithProfile, Profile, Address } from '@/types/supabase';
import { UserCircleIcon, CameraIcon, ExclamationTriangleIcon, PlusIcon, TrashIcon, StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

interface EditProfileFormProps {
  initialProfile: UserWithProfile;
  onSave: (updatedProfile: Profile) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<{
  address: Address;
  onUpdate: <K extends keyof Address>(id: string, field: K, value: Address[K]) => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}> = ({ address, onUpdate, onRemove, onSetPrimary }) => {
  const debouncedFetchAddress = useCallback(
    debounce(async (lat: number, lng: number) => {
      const { full_address, postal_code } = await fetchAddressFromCoords(lat, lng);
      onUpdate(address.id, 'full_address', full_address);
      if (postal_code) {
        onUpdate(address.id, 'postal_code', postal_code);
      }
    }, 800),
    [address.id, onUpdate]
  );

  const handleMapPositionChange = (lat: number, lng: number) => {
    onUpdate(address.id, 'latitude', lat);
    onUpdate(address.id, 'longitude', lng);
    debouncedFetchAddress(lat, lng);
  };

  return (
    <div className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/50 space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          value={address.label}
          onChange={(e) => onUpdate(address.id, 'label', e.target.value)}
          placeholder="Label Alamat (cth: Rumah, Kantor)"
          className="bg-transparent text-lg font-semibold text-white focus:outline-none w-full"
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onSetPrimary(address.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-colors ${
              address.is_primary
                ? 'bg-amber-500/80 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {address.is_primary ? <StarSolidIcon className="w-4 h-4" /> : <StarOutlineIcon className="w-4 h-4" />}
            Utama
          </button>
          <button type="button" onClick={() => onRemove(address.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" value={address.recipient_name} onChange={(e) => onUpdate(address.id, 'recipient_name', e.target.value)} placeholder="Nama Penerima" className="input-field-sm" />
        <input type="tel" value={address.recipient_phone} onChange={(e) => onUpdate(address.id, 'recipient_phone', e.target.value)} placeholder="Nomor Telepon Penerima" className="input-field-sm" />
      </div>
      <textarea value={address.full_address} onChange={(e) => onUpdate(address.id, 'full_address', e.target.value)} placeholder="Alamat Lengkap" rows={3} className="input-field-sm w-full resize-none" />
      <input type="text" value={address.postal_code} onChange={(e) => onUpdate(address.id, 'postal_code', e.target.value)} placeholder="Kode Pos" className="input-field-sm" />
      <MapPicker
        initialPosition={address.latitude && address.longitude ? [address.latitude, address.longitude] : null}
        onPositionChange={handleMapPositionChange}
      />
      <input type="text" value={address.courier_notes || ''} onChange={(e) => onUpdate(address.id, 'courier_notes', e.target.value)} placeholder="Catatan untuk kurir (opsional)" className="input-field-sm" />
    </div>
  );
};

export default function EditProfileForm({ initialProfile, onSave, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState<Profile>(JSON.parse(JSON.stringify(initialProfile.profile || { addresses: [] })));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateAddress = <K extends keyof Address>(id: string, field: K, value: Address[K]) => {
    setFormData(prev => ({
      ...prev,
      addresses: (prev.addresses || []).map(addr => addr.id === id ? { ...addr, [field]: value } : addr),
    }));
  };

  const handleAddAddress = () => {
    const addresses = formData.addresses || [];
    const newAddress: Address = {
      id: uuidv4(),
      label: 'Alamat Baru',
      recipient_name: formData.full_name || '',
      recipient_phone: '',
      full_address: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      is_primary: addresses.length === 0,
      courier_notes: '',
    };
    setFormData(prev => ({ ...prev, addresses: [...addresses, newAddress] }));
  };

  const handleRemoveAddress = (id: string) => {
    setFormData(prev => {
      const remaining = (prev.addresses || []).filter(addr => addr.id !== id);
      if (remaining.length > 0 && !remaining.some(a => a.is_primary)) {
        remaining[0].is_primary = true;
      }
      return { ...prev, addresses: remaining };
    });
  };

  const handleSetPrimaryAddress = (id: string) => {
    setFormData(prev => ({
      ...prev,
      addresses: (prev.addresses || []).map(addr => ({ ...addr, is_primary: addr.id === id })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      let avatar_url = formData.avatar_url;
      if (avatarFile) {
        avatar_url = await uploadAvatar(initialProfile.user.id, avatarFile);
      }

      const finalUpdates: Partial<Omit<Profile, 'id' | 'role'>> = {
        full_name: formData.full_name,
        avatar_url: avatar_url,
        addresses: formData.addresses,
      };

      const updatedProfile = await updateUserProfile(initialProfile.user.id, finalUpdates);
      onSave(updatedProfile);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar = previewUrl || formData.avatar_url;

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl p-8 space-y-8">
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-red-400 border-b border-gray-700 pb-2">Informasi Pribadi</h2>
        <div className="flex flex-col items-center gap-6">
          <div className="relative group w-32 h-32">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg overflow-hidden">
              {currentAvatar ? <Image key={currentAvatar} src={currentAvatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-24 h-24 text-white" />}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"><CameraIcon className="w-10 h-10 text-white" /></button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
          </div>
          <div className="w-full">
            <label htmlFor="fullName" className="block text-sm font-medium text-red-400 mb-2">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
              className="input-field w-full"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-red-400 border-b border-gray-700 pb-2">Daftar Alamat</h2>
        <div className="space-y-4">
          {(formData.addresses || []).map(addr => (
            <AddressForm key={addr.id} address={addr} onUpdate={handleUpdateAddress} onRemove={handleRemoveAddress} onSetPrimary={handleSetPrimaryAddress} />
          ))}
        </div>
        <button type="button" onClick={handleAddAddress} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
          <PlusIcon className="w-5 h-5" /> Tambah Alamat Baru
        </button>
      </section>

      {error && <div className="bg-red-900/50 border border-red-500/50 text-red-300 rounded-xl p-3 flex items-start gap-2 text-sm"><ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{error}</span></div>}

      <div className="border-t border-gray-700/50 pt-6 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50">Batal</button>
        <button type="submit" disabled={isSaving} className="w-full sm:w-auto flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
          {isSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Menyimpan...</span></> : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}