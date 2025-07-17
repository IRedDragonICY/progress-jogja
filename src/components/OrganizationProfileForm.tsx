import React, { useState, useEffect, memo, useMemo } from 'react';
import { OrganizationProfileData, AddressItem, ContactItem, SocialMediaLink, OrganizationMember, PartnershipItem, Achievement, InternationalEvent } from '@/types/supabase';
import { uploadPartnerLogo } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import * as Form from '@radix-ui/react-form';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Progress from '@radix-ui/react-progress';
import { PlusIcon, TrashIcon, MapPinIcon, GlobeAltIcon, PhoneIcon, UsersIcon, BuildingOfficeIcon, EyeIcon, Bars2Icon, PhotoIcon, BriefcaseIcon, AcademicCapIcon, TrophyIcon, CalendarIcon, FlagIcon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MaterialInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ElementType;
}> = ({ label, value, onChange, placeholder, type = 'text', required = false, icon: Icon }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFloating ? placeholder : ''}
          className={`
            w-full h-14 px-4 py-4 bg-gray-800/50 border-2 border-gray-700/50 rounded-xl
            text-white placeholder-gray-500 transition-all duration-200 ease-in-out
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
            hover:border-gray-600/70 hover:bg-gray-800/70
            ${Icon ? 'pl-12' : 'pl-4'}
          `}
          required={required}
        />
        <label
          className={`
            absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
            ${Icon ? 'left-12' : 'left-4'}
            ${isFloating 
              ? 'top-2 text-xs font-medium text-blue-400 bg-gray-800 px-2 rounded-md transform -translate-y-1' 
              : 'top-1/2 text-base text-gray-400 transform -translate-y-1/2'
            }
          `}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      </div>
    </div>
  );
};

const MaterialTextarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}> = ({ label, value, onChange, placeholder, rows = 4, required = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFloating ? placeholder : ''}
          rows={rows}
          className={`
            w-full px-4 py-4 bg-gray-800/50 border-2 border-gray-700/50 rounded-xl
            text-white placeholder-gray-500 transition-all duration-200 ease-in-out
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
            hover:border-gray-600/70 hover:bg-gray-800/70 resize-none
            ${isFloating ? 'pt-8' : 'pt-4'}
          `}
          required={required}
        />
        <label
          className={`
            absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
            ${isFloating 
              ? 'top-2 text-xs font-medium text-blue-400 bg-gray-800 px-2 rounded-md transform -translate-y-1' 
              : 'top-4 text-base text-gray-400'
            }
          `}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      </div>
    </div>
  );
};

const MaterialButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ElementType;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'secondary', icon: Icon, disabled = false }) => {
  const baseClasses = "flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-700/70 text-white hover:bg-gray-600/80 hover:text-gray-100 border border-gray-600/70 hover:border-gray-500/80 shadow-md hover:shadow-lg"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

const getInitialFormData = (data?: OrganizationProfileData | null): OrganizationProfileData => ({
  id: data?.id,
  slogan: data?.slogan || '',
  addresses: data?.addresses?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  phone_numbers: data?.phone_numbers?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  email: data?.email || '',
  social_media_links: data?.social_media_links?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  vision: data?.vision || '',
  mission: data?.mission || '',
  organizational_structure: data?.organizational_structure?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  partnerships: data?.partnerships?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  achievements: data?.achievements?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
  international_events: data?.international_events?.map(item => ({ ...item, id: item.id || uuidv4() })) || [],
});

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="space-y-8 p-8 bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 shadow-xl">
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-700/30">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">Kelola informasi {title.toLowerCase()}</p>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SortableItemWrapper: React.FC<{ id: string, children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : 'auto'
  };

  return (
    <div ref={setNodeRef} style={style}>
      {React.cloneElement(children as React.ReactElement, {
        dragHandle: <Tooltip.Root><Tooltip.Trigger asChild><button type="button" {...attributes} {...listeners} className="p-1.5 cursor-grab text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-md mt-2"><Bars2Icon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Geser untuk Mengurutkan<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>
      })}
    </div>
  );
};

const SortableSection = <T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (reorderedItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));
  const itemIds = useMemo(() => items.map(i => i.id), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((item, index) => (
            <SortableItemWrapper key={item.id} id={item.id}>
              {renderItem(item, index)}
            </SortableItemWrapper>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

type ItemUpdateHandler<T> = <K extends keyof T>(id: string, field: K, value: T[K]) => void;

const AddressItemForm = memo<{ item: AddressItem; index: number; onUpdate: ItemUpdateHandler<AddressItem>; onPositionChange: (id: string, lat: number, lng: number) => void; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, index, onUpdate, onPositionChange, onRemove, dragHandle }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
      {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-blue-400" />
            Alamat {index + 1}
          </h4>
          <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
        </div>
        <MaterialInput label="Alamat Lengkap" value={item.text} onChange={(value) => onUpdate(item.id, 'text', value)} placeholder="Masukkan alamat lengkap" icon={MapPinIcon} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MaterialInput label="Lintang (Latitude)" value={item.latitude?.toString() || ''} onChange={(value) => onUpdate(item.id, 'latitude', parseFloat(value) || null)} placeholder="cth., -7.7956" type="number" />
          <MaterialInput label="Bujur (Longitude)" value={item.longitude?.toString() || ''} onChange={(value) => onUpdate(item.id, 'longitude', parseFloat(value) || null)} placeholder="cth., 110.3695" type="number" />
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
          <h5 className="text-sm font-medium text-gray-300 mb-3">Pilih Lokasi di Peta</h5>
          <MapPicker initialPosition={item.latitude && item.longitude ? [item.latitude, item.longitude] : null} onPositionChange={(lat, lng) => onPositionChange(item.id, lat, lng)} />
        </div>
        <MaterialInput label="Catatan" value={item.notes || ''} onChange={(value) => onUpdate(item.id, 'notes', value)} placeholder="cth., Kantor Pusat, Gedung A Lantai 2" />
      </div>
  </div>
));
AddressItemForm.displayName = 'AddressItemForm';

const ContactItemForm = memo<{ item: ContactItem; onUpdate: ItemUpdateHandler<ContactItem>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <PhoneIcon className="w-5 h-5 text-green-400" /> Kontak Telepon </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MaterialInput label="Nomor Telepon" value={item.number} onChange={(value) => onUpdate(item.id, 'number', value)} placeholder="+62 123 4567 890" type="tel" icon={PhoneIcon} required />
                <MaterialInput label="Label" value={item.label || ''} onChange={(value) => onUpdate(item.id, 'label', value)} placeholder="cth., Kantor, Mobile, WhatsApp" />
            </div>
        </div>
    </div>
));
ContactItemForm.displayName = 'ContactItemForm';

const SocialMediaItemForm = memo<{ item: SocialMediaLink; onUpdate: ItemUpdateHandler<SocialMediaLink>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <GlobeAltIcon className="w-5 h-5 text-pink-400" /> Media Sosial </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MaterialInput label="Platform" value={item.platform} onChange={(value) => onUpdate(item.id, 'platform', value)} placeholder="cth., Instagram, Facebook, Twitter" icon={GlobeAltIcon} required />
                <MaterialInput label="URL" value={item.url} onChange={(value) => onUpdate(item.id, 'url', value)} placeholder="https://instagram.com/username" type="url" required />
            </div>
        </div>
    </div>
));
SocialMediaItemForm.displayName = 'SocialMediaItemForm';

const OrganizationMemberForm = memo<{ item: OrganizationMember; onUpdate: ItemUpdateHandler<OrganizationMember>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <UsersIcon className="w-5 h-5 text-orange-400" /> Anggota Organisasi </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MaterialInput label="Posisi" value={item.position} onChange={(value) => onUpdate(item.id, 'position', value)} placeholder="cth., Direktur, Ketua, Sekretaris" icon={BriefcaseIcon} required />
                <MaterialInput label="Nama Lengkap" value={item.name} onChange={(value) => onUpdate(item.id, 'name', value)} placeholder="Nama lengkap anggota" icon={UsersIcon} required />
            </div>
        </div>
    </div>
));
OrganizationMemberForm.displayName = 'OrganizationMemberForm';

const PartnershipItemForm = memo<{ item: PartnershipItem; onUpdate: ItemUpdateHandler<PartnershipItem>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const url = await uploadPartnerLogo(file);
      setUploadProgress(100);
      onUpdate(item.id, 'logo_url', url);
    } catch (error) {
      console.error("Logo upload failed", error);
      alert('Gagal mengunggah logo.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-24 h-24 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600/50 overflow-hidden relative group/logo">
                {item.logo_url ? <Image src={item.logo_url} alt={item.name} fill className="object-contain" /> : <PhotoIcon className="w-8 h-8 text-gray-400" />}
                <label htmlFor={`logo-upload-${item.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"> <PhotoIcon className="w-6 h-6 text-white" /> </label>
            </div>
            <input type="file" id={`logo-upload-${item.id}`} accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploading} />
            {isUploading && <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-gray-800 rounded-full w-full h-1"><Progress.Indicator className="bg-red-500 h-full transition-transform duration-300" style={{ transform: `translateX(-${100 - uploadProgress}%)` }} /></Progress.Root>}
        </div>
        <div className="flex-1 space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <BriefcaseIcon className="w-5 h-5 text-teal-400" /> Mitra </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <MaterialInput label="Nama Mitra" value={item.name} onChange={(value) => onUpdate(item.id, 'name', value)} placeholder="Nama institusi atau perusahaan" icon={BuildingOfficeIcon} required />
        </div>
    </div>
  );
});
PartnershipItemForm.displayName = 'PartnershipItemForm';

const AchievementItemForm = memo<{ item: Achievement; onUpdate: ItemUpdateHandler<Achievement>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const url = await uploadPartnerLogo(file);
      setUploadProgress(100);
      onUpdate(item.id, 'image_url', url);
    } catch (error) {
      console.error("Achievement image upload failed", error);
      alert('Gagal mengunggah gambar penghargaan.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-24 h-32 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600/50 overflow-hidden relative group/logo">
                {item.image_url ? <Image src={item.image_url} alt={item.title} fill className="object-cover" /> : <TrophyIcon className="w-8 h-8 text-gray-400" />}
                <label htmlFor={`achievement-upload-${item.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"> <PhotoIcon className="w-6 h-6 text-white" /> </label>
            </div>
            <input type="file" id={`achievement-upload-${item.id}`} accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
            {isUploading && <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-gray-800 rounded-full w-full h-1"><Progress.Indicator className="bg-yellow-500 h-full transition-transform duration-300" style={{ transform: `translateX(-${100 - uploadProgress}%)` }} /></Progress.Root>}
        </div>
        <div className="flex-1 space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <TrophyIcon className="w-5 h-5 text-yellow-400" /> Penghargaan </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MaterialInput label="Nama Penghargaan" value={item.title} onChange={(value) => onUpdate(item.id, 'title', value)} placeholder="Juara 1 Wirausaha Terbaik" icon={TrophyIcon} required />
              <MaterialInput label="Pemberi Penghargaan" value={item.issuer} onChange={(value) => onUpdate(item.id, 'issuer', value)} placeholder="Kementerian UMKM" icon={BuildingOfficeIcon} required />
            </div>
            <MaterialInput label="Tahun" value={item.year?.toString() || ''} onChange={(value) => onUpdate(item.id, 'year', parseInt(value) || new Date().getFullYear())} placeholder={new Date().getFullYear().toString()} type="number" icon={CalendarIcon} />
        </div>
    </div>
  );
});
AchievementItemForm.displayName = 'AchievementItemForm';

const InternationalEventItemForm = memo<{ item: InternationalEvent; onUpdate: ItemUpdateHandler<InternationalEvent>; onRemove: (id: string) => void, dragHandle?: React.ReactNode }>(({ item, onUpdate, onRemove, dragHandle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const url = await uploadPartnerLogo(file);
      setUploadProgress(100);
      onUpdate(item.id, 'image_url', url);
    } catch (error) {
      console.error("International event image upload failed", error);
      alert('Gagal mengunggah gambar event.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group flex items-start gap-4">
        {dragHandle && <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">{dragHandle}</div>}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-32 h-24 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600/50 overflow-hidden relative group/logo">
                {item.image_url ? <Image src={item.image_url} alt={item.country} fill className="object-cover" /> : <FlagIcon className="w-8 h-8 text-gray-400" />}
                <label htmlFor={`event-upload-${item.id}`} className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"> <PhotoIcon className="w-6 h-6 text-white" /> </label>
            </div>
            <input type="file" id={`event-upload-${item.id}`} accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
            {isUploading && <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-gray-800 rounded-full w-full h-1"><Progress.Indicator className="bg-red-500 h-full transition-transform duration-300" style={{ transform: `translateX(-${100 - uploadProgress}%)` }} /></Progress.Root>}
        </div>
        <div className="flex-1 space-y-4">
             <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2"> <GlobeAltIcon className="w-5 h-5 text-red-400" /> Event Internasional </h4>
                <button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MaterialInput label="Nama Negara" value={item.country} onChange={(value) => onUpdate(item.id, 'country', value)} placeholder="Singapura" icon={FlagIcon} required />
              <MaterialInput label="Emoji Bendera" value={item.country_code} onChange={(value) => onUpdate(item.id, 'country_code', value)} placeholder="🇸🇬" icon={GlobeAltIcon} />
            </div>
        </div>
    </div>
  );
});
InternationalEventItemForm.displayName = 'InternationalEventItemForm';

const OrganizationProfileForm: React.FC<{
  initialData: OrganizationProfileData | null;
  onSave: (data: OrganizationProfileData) => Promise<void>;
  isSaving: boolean;
  activeSection?: string;
}> = ({ initialData, onSave, isSaving, activeSection }) => {
  const [formData, setFormData] = useState<OrganizationProfileData>(() => getInitialFormData(initialData));

  useEffect(() => { setFormData(getInitialFormData(initialData)); }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const { educationPartners, industryPartners } = useMemo(() => {
    const educationPartners = formData.partnerships.filter(p => p.category === 'education_government');
    const industryPartners = formData.partnerships.filter(p => p.category === 'industry');
    return { educationPartners, industryPartners };
  }, [formData.partnerships]);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return <Section title="Informasi Umum" icon={BuildingOfficeIcon}> <MaterialInput label="Slogan Organisasi" value={formData.slogan || ''} onChange={(value) => setFormData(p => ({...p, slogan: value}))} placeholder="Masukkan slogan organisasi Anda" icon={BuildingOfficeIcon} /> <MaterialInput label="Email Organisasi" value={formData.email || ''} onChange={(value) => setFormData(p => ({...p, email: value}))} placeholder="contoh@organisasi.com" type="email" icon={GlobeAltIcon} /> </Section>;
      case 'addresses':
        return <Section title="Alamat" icon={MapPinIcon}> <SortableSection<AddressItem> items={formData.addresses} onReorder={(reordered) => setFormData(p => ({ ...p, addresses: reordered }))} renderItem={(item, index) => <AddressItemForm item={item} index={index} onUpdate={(id, field, value) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onPositionChange={(id, lat, lng) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, latitude: lat, longitude: lng } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, addresses: p.addresses.filter(i => i.id !== id) }))} /> } /> <MaterialButton onClick={() => setFormData(p => ({...p, addresses: [...p.addresses, {id: uuidv4(), text: '', latitude: null, longitude: null, notes: ''}] }))} icon={PlusIcon} variant="secondary"> Tambah Alamat Baru </MaterialButton> </Section>;
      case 'contacts':
        return <Section title="Nomor Kontak" icon={PhoneIcon}> <SortableSection<ContactItem> items={formData.phone_numbers} onReorder={(reordered) => setFormData(p => ({ ...p, phone_numbers: reordered }))} renderItem={(item) => <ContactItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, phone_numbers: p.phone_numbers.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({...p, phone_numbers: p.phone_numbers.filter(i => i.id !== id)}))} />} /> <MaterialButton onClick={() => setFormData(p => ({ ...p, phone_numbers: [...p.phone_numbers, {id: uuidv4(), number: '', label: ''}]}))} icon={PlusIcon} variant="secondary"> Tambah Nomor Telepon </MaterialButton> </Section>;
      case 'social':
        return <Section title="Media Sosial" icon={GlobeAltIcon}> <SortableSection<SocialMediaLink> items={formData.social_media_links} onReorder={(reordered) => setFormData(p => ({ ...p, social_media_links: reordered }))} renderItem={(item) => <SocialMediaItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, social_media_links: p.social_media_links.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({...p, social_media_links: p.social_media_links.filter(i => i.id !== id)}))} />} /> <MaterialButton onClick={() => setFormData(p => ({ ...p, social_media_links: [...p.social_media_links, {id: uuidv4(), platform: '', url: ''}]}))} icon={PlusIcon} variant="secondary"> Tambah Media Sosial </MaterialButton> </Section>;
      case 'structure':
        return <Section title="Struktur Organisasi" icon={UsersIcon}> <SortableSection<OrganizationMember> items={formData.organizational_structure} onReorder={(reordered) => setFormData(p => ({ ...p, organizational_structure: reordered }))} renderItem={(item) => <OrganizationMemberForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, organizational_structure: p.organizational_structure.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({...p, organizational_structure: p.organizational_structure.filter(i => i.id !== id)}))} />} /> <MaterialButton onClick={() => setFormData(p => ({ ...p, organizational_structure: [...p.organizational_structure, {id: uuidv4(), position: '', name: ''}]}))} icon={PlusIcon} variant="secondary"> Tambah Anggota </MaterialButton> </Section>;
      case 'vision':
        return <Section title="Visi & Misi" icon={EyeIcon}> <MaterialTextarea label="Visi Organisasi" value={formData.vision || ''} onChange={(value) => setFormData(p => ({...p, vision: value}))} placeholder="Jelaskan visi organisasi Anda untuk masa depan" rows={4} /> <MaterialTextarea label="Misi Organisasi" value={formData.mission || ''} onChange={(value) => setFormData(p => ({...p, mission: value}))} placeholder="Jelaskan misi dan tujuan organisasi Anda" rows={6} /> </Section>;
      case 'partnerships':
        return (
          <Section title="Kemitraan" icon={BriefcaseIcon}>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-gray-700/30 border border-gray-600/50"><AcademicCapIcon className="w-6 h-6 text-gray-300" /><h4 className="text-xl font-medium text-gray-200">Lembaga Pendidikan, Pemerintah, & Swasta</h4></div>
                <SortableSection<PartnershipItem> items={educationPartners} onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...reordered, ...industryPartners] }))} renderItem={(item) => <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />} />
                <MaterialButton onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'education_government', name: '', logo_url: null }] }))} icon={PlusIcon} variant="secondary"> Tambah Mitra Pendidikan/Pemerintah </MaterialButton>
              </div>
              <div className="border-t border-gray-700/50 my-8"></div>
              <div>
                <div className="flex items-center gap-3 mb-4 p-4 rounded-xl bg-gray-700/30 border border-gray-600/50"><BriefcaseIcon className="w-6 h-6 text-gray-300" /><h4 className="text-xl font-medium text-gray-200">Mitra Industri</h4></div>
                <SortableSection<PartnershipItem> items={industryPartners} onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...educationPartners, ...reordered] }))} renderItem={(item) => <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />} />
                <MaterialButton onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'industry', name: '', logo_url: null }] }))} icon={PlusIcon} variant="secondary"> Tambah Mitra Industri </MaterialButton>
              </div>
            </div>
          </Section>
        );
      case 'achievements':
        return <Section title="Penghargaan & Prestasi" icon={TrophyIcon}> <SortableSection<Achievement> items={formData.achievements} onReorder={(reordered) => setFormData(p => ({ ...p, achievements: reordered }))} renderItem={(item) => <AchievementItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({...p, achievements: p.achievements.map(i => i.id === id ? { ...i, [field]: value } : i)}))} onRemove={(id) => setFormData(p => ({...p, achievements: p.achievements.filter(i => i.id !== id)}))} />} /> <MaterialButton onClick={() => setFormData(p => ({...p, achievements: [...p.achievements, {id: uuidv4(), title: '', issuer: '', year: new Date().getFullYear(), image_url: null}]}))} icon={PlusIcon} variant="secondary"> Tambah Penghargaan </MaterialButton> </Section>;
      case 'events':
        return <Section title="Event Internasional" icon={GlobeAltIcon}> <SortableSection<InternationalEvent> items={formData.international_events} onReorder={(reordered) => setFormData(p => ({ ...p, international_events: reordered }))} renderItem={(item) => <InternationalEventItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({...p, international_events: p.international_events.map(i => i.id === id ? { ...i, [field]: value } : i)}))} onRemove={(id) => setFormData(p => ({...p, international_events: p.international_events.filter(i => i.id !== id)}))} />} /> <MaterialButton onClick={() => setFormData(p => ({...p, international_events: [...p.international_events, {id: uuidv4(), country: '', country_code: '', image_url: null}]}))} icon={PlusIcon} variant="secondary"> Tambah Event </MaterialButton> </Section>;
      default: return null;
    }
  };

  if (activeSection) {
    return (
      <Tooltip.Provider delayDuration={100}>
        <Form.Root onSubmit={handleSubmit} className="space-y-6">
          {renderSection(activeSection)}
          <div className="flex justify-end pt-8 border-t border-gray-700/30">
            <MaterialButton onClick={() => onSave(formData)} disabled={isSaving} variant="primary">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Menyimpan Perubahan...</span></>) : (<> <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> <span>Simpan Perubahan</span></>)}
            </MaterialButton>
          </div>
        </Form.Root>
      </Tooltip.Provider>
    );
  }

  return (
    <Tooltip.Provider delayDuration={100}>
      <Form.Root onSubmit={handleSubmit} className="space-y-8">
        {[ 'general', 'vision', 'addresses', 'contacts', 'social', 'structure', 'partnerships', 'achievements', 'events' ].map(sectionId => (
          <div key={sectionId}>{renderSection(sectionId)}</div>
        ))}
        <div className="flex justify-end pt-8 border-t border-gray-700/50">
          <Form.Submit asChild>
            <MaterialButton onClick={() => onSave(formData)} disabled={isSaving} variant="primary">
              {isSaving ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Menyimpan...</span></>) : 'Simpan Semua Perubahan'}
            </MaterialButton>
          </Form.Submit>
        </div>
      </Form.Root>
    </Tooltip.Provider>
  );
};

export default OrganizationProfileForm;