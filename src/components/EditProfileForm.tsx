'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import * as Select from '@radix-ui/react-select';
import { uploadAvatar } from '@/lib/supabase';
import { fetchAddressFromCoords } from '@/lib/location';
import type { UserWithProfile, Profile, Address } from '@/types/supabase';
import { UserCircleIcon, CameraIcon, ExclamationTriangleIcon, PlusIcon, TrashIcon, StarIcon as StarOutlineIcon, MapPinIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

interface MaterialInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  theme: 'light' | 'dark';
}

const MaterialInput: React.FC<MaterialInputProps> = ({ label, value, onChange, type = 'text', as = 'input', rows = 4, theme }) => {
  const InputComponent = as;
  const themeClasses = {
    light: {
      bg: 'bg-red-50',
      text: 'text-gray-900',
      border: 'border-red-200',
      focusBorder: 'focus:border-red-500',
      label: 'text-gray-600',
      focusLabel: 'peer-focus:text-red-600',
    },
    dark: {
      bg: 'bg-slate-700/50',
      text: 'text-white',
      border: 'border-slate-600',
      focusBorder: 'focus:border-blue-400',
      label: 'text-slate-400',
      focusLabel: 'peer-focus:text-blue-400',
    },
  };
  const currentTheme = themeClasses[theme];

  return (
    <div className="relative">
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        rows={rows}
        placeholder=" "
        className={`peer block w-full px-4 pt-6 pb-2 rounded-t-lg appearance-none focus:outline-none focus:ring-0 transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text} border-b-2 ${currentTheme.border} ${currentTheme.focusBorder}`}
      />
      <label
        className={`absolute text-md duration-150 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] left-4 ${currentTheme.label} ${currentTheme.focusLabel} peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4`}
      >
        {label}
      </label>
    </div>
  );
};


interface EditProfileFormProps {
  initialProfile: UserWithProfile;
  onSave: (updates: Partial<Profile>) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

const AddressForm: React.FC<{
  address: Address;
  onUpdate: <K extends keyof Address>(id: string, field: K, value: Address[K]) => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
  theme: 'light' | 'dark';
}> = ({ address, onUpdate, onRemove, onSetPrimary, theme }) => {
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
    <div className={`p-4 rounded-2xl space-y-4 border ${
      theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex justify-between items-start">
        <input
          type="text"
          value={address.label}
          onChange={(e) => onUpdate(address.id, 'label', e.target.value)}
          placeholder="Label Alamat (cth: Rumah)"
          className={`bg-transparent text-lg font-semibold focus:outline-none w-full ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        />
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onSetPrimary(address.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-colors ${
              address.is_primary
                ? 'bg-amber-500 text-white'
                : theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {address.is_primary ? <StarSolidIcon className="w-4 h-4" /> : <StarOutlineIcon className="w-4 h-4" />}
            Utama
          </button>
          <button type="button" onClick={() => onRemove(address.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MaterialInput label="Nama Penerima" value={address.recipient_name} onChange={(value) => onUpdate(address.id, 'recipient_name', value)} theme={theme}/>
        <MaterialInput label="Nomor Telepon" value={address.recipient_phone} onChange={(value) => onUpdate(address.id, 'recipient_phone', value)} theme={theme} type="tel"/>
      </div>
      <MaterialInput label="Alamat Lengkap" as="textarea" value={address.full_address} onChange={(value) => onUpdate(address.id, 'full_address', value)} theme={theme} rows={3}/>
      <MaterialInput label="Kode Pos" value={address.postal_code} onChange={(value) => onUpdate(address.id, 'postal_code', value)} theme={theme}/>
      <MapPicker
        initialPosition={address.latitude && address.longitude ? [address.latitude, address.longitude] : null}
        onPositionChange={handleMapPositionChange}
      />
      <MaterialInput label="Catatan untuk kurir (opsional)" value={address.courier_notes || ''} onChange={(value) => onUpdate(address.id, 'courier_notes', value)} theme={theme}/>
    </div>
  );
};

export default function EditProfileForm({ initialProfile, onSave, onCancel, theme = 'light' }: EditProfileFormProps) {
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

      const finalUpdates: Partial<Omit<Profile, 'id'>> = {
        full_name: formData.full_name,
        avatar_url: avatar_url,
        addresses: formData.addresses,
        role: formData.role,
      };

      onSave(finalUpdates);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Gagal menyimpan profil. Silakan coba lagi.');
      setIsSaving(false);
    }
  };

  const containerClasses = theme === 'light'
    ? 'p-8 space-y-8'
    : 'p-6 space-y-6';

  const sectionCardClasses = theme === 'light'
    ? 'bg-white rounded-2xl p-6 shadow-sm border border-gray-200'
    : 'bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50';

  const headingClasses = theme === 'dark' ? 'text-blue-300' : 'text-red-600';

  const accentGradient = theme === 'dark'
    ? 'bg-gradient-to-br from-blue-500 to-blue-700'
    : 'bg-gradient-to-br from-red-500 to-red-700';

  const currentAvatar = previewUrl || formData.avatar_url;

  return (
    <form onSubmit={handleSubmit} className={containerClasses}>
      <div className={sectionCardClasses}>
        <h2 className={`text-xl font-bold mb-6 ${headingClasses}`}>Informasi Pribadi</h2>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative group w-32 h-32">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg overflow-hidden ${accentGradient}`}>
                {currentAvatar ? <Image key={currentAvatar} src={currentAvatar} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" /> : <UserCircleIcon className="w-24 h-24 text-white" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"><CameraIcon className="w-10 h-10 text-white" /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="hidden" />
            </div>
          </div>
          <MaterialInput
            label="Nama Lengkap"
            value={formData.full_name || ''}
            onChange={(value) => setFormData(p => ({ ...p, full_name: value }))}
            theme={theme}
          />
           {theme === 'dark' && (
             <div className="relative">
                 <Select.Root
                    value={formData.role}
                    onValueChange={(value: 'user' | 'admin') => setFormData(p => ({ ...p, role: value }))}
                >
                    <Select.Trigger className={`peer block w-full px-4 pt-6 pb-2 rounded-t-lg appearance-none focus:outline-none focus:ring-0 transition-colors duration-200 bg-slate-700/50 text-white border-b-2 border-slate-600 focus:border-blue-400 flex items-center justify-between`}>
                        <Select.Value />
                        <Select.Icon><ChevronDownIcon className="w-5 h-5 text-slate-400"/></Select.Icon>
                    </Select.Trigger>
                     <label
                        className={`absolute text-md duration-150 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] left-4 text-blue-400`}
                      >
                        Peran Pengguna
                      </label>
                    <Select.Portal>
                        <Select.Content className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                            <Select.Viewport className="p-1">
                                <Select.Item value="user" className="relative flex items-center px-8 py-2 text-white rounded-lg cursor-pointer hover:bg-slate-700 focus:bg-slate-700 outline-none data-[highlighted]:bg-slate-700"><Select.ItemText>User</Select.ItemText></Select.Item>
                                <Select.Item value="admin" className="relative flex items-center px-8 py-2 text-white rounded-lg cursor-pointer hover:bg-slate-700 focus:bg-slate-700 outline-none data-[highlighted]:bg-slate-700"><Select.ItemText>Admin</Select.ItemText></Select.Item>
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
            </div>
           )}
        </div>
      </div>

      <div className={sectionCardClasses}>
        <h2 className={`text-xl font-bold mb-6 ${headingClasses}`}>Daftar Alamat</h2>
        <div className="space-y-4">
          {(formData.addresses || []).map(addr => (
            <AddressForm key={addr.id} address={addr} onUpdate={handleUpdateAddress} onRemove={handleRemoveAddress} onSetPrimary={handleSetPrimaryAddress} theme={theme} />
          ))}
        </div>
        <button type="button" onClick={handleAddAddress} className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }`}>
          <PlusIcon className="w-5 h-5" /> Tambah Alamat Baru
        </button>
      </div>

      {error && <div className="bg-red-900/50 border border-red-500/50 text-red-300 rounded-xl p-3 flex items-start gap-2 text-sm"><ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{error}</span></div>}

      <div className={`pt-6 flex flex-col sm:flex-row gap-3`}>
        <button type="button" onClick={onCancel} disabled={isSaving} className={`w-full sm:w-auto flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 ${
          theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}>Batal</button>
        <button type="submit" disabled={isSaving} className={`w-full sm:w-auto flex-1 px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${accentGradient}`}>
          {isSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Menyimpan...</span></> : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}