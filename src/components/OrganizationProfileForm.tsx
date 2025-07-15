import React, { useState, useEffect, memo, useMemo } from 'react';
import { OrganizationProfileData, AddressItem, ContactItem, SocialMediaLink, OrganizationMember, PartnershipItem, Achievement, InternationalEvent } from '@/types/supabase';
import { uploadPartnerLogo } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import * as Form from '@radix-ui/react-form';
import * as Label from '@radix-ui/react-label';
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

// Material Design Input Component
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

// Material Design Textarea Component
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

// Material Design Card Component for list items
const MaterialCard: React.FC<{
  children: React.ReactNode;
  onDelete?: () => void;
  dragHandle?: React.ReactNode;
}> = ({ children, onDelete, dragHandle }) => (
  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 group">
    <div className="flex items-start gap-4">
      {dragHandle && (
        <div className="mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
          {dragHandle}
        </div>
      )}
      <div className="flex-1 space-y-4">
        {children}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 opacity-50 group-hover:opacity-100"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
);

// Material Design Button Component
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
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 bg-gray-700/40 rounded-lg border border-gray-600/50 relative p-4">
      <Tooltip.Root><Tooltip.Trigger asChild><button type="button" {...attributes} {...listeners} className="p-1.5 cursor-grab text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-md mt-2"><Bars2Icon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Geser untuk Mengurutkan<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>
      <div className="flex-grow">{children}</div>
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
        <div className="space-y-3">
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

const AddressItemForm = memo<{ item: AddressItem; index: number; onUpdate: ItemUpdateHandler<AddressItem>; onPositionChange: (id: string, lat: number, lng: number) => void; onRemove: (id: string) => void }>(({ item, index, onUpdate, onPositionChange, onRemove }) => (
  <MaterialCard onDelete={() => onRemove(item.id)}>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <MapPinIcon className="w-5 h-5 text-blue-400" />
        Alamat {index + 1}
      </h4>
      <div className="w-full h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
    </div>
    
    <MaterialInput
      label="Alamat Lengkap"
      value={item.text}
      onChange={(value) => onUpdate(item.id, 'text', value)}
      placeholder="Masukkan alamat lengkap"
      icon={MapPinIcon}
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialInput
        label="Lintang (Latitude)"
        value={item.latitude?.toString() || ''}
        onChange={(value) => onUpdate(item.id, 'latitude', parseFloat(value) || null)}
        placeholder="cth., -7.7956"
        type="number"
      />
      <MaterialInput
        label="Bujur (Longitude)"
        value={item.longitude?.toString() || ''}
        onChange={(value) => onUpdate(item.id, 'longitude', parseFloat(value) || null)}
        placeholder="cth., 110.3695"
        type="number"
      />
    </div>
    
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
      <h5 className="text-sm font-medium text-gray-300 mb-3">Pilih Lokasi di Peta</h5>
      <MapPicker 
        initialPosition={item.latitude && item.longitude ? [item.latitude, item.longitude] : null} 
        onPositionChange={(lat, lng) => onPositionChange(item.id, lat, lng)} 
      />
    </div>
    
    <MaterialInput
      label="Catatan"
      value={item.notes || ''}
      onChange={(value) => onUpdate(item.id, 'notes', value)}
      placeholder="cth., Kantor Pusat, Gedung A Lantai 2"
    />
  </MaterialCard>
));
AddressItemForm.displayName = 'AddressItemForm';

const ContactItemForm = memo<{ item: ContactItem; onUpdate: ItemUpdateHandler<ContactItem>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
  <MaterialCard onDelete={() => onRemove(item.id)}>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <PhoneIcon className="w-5 h-5 text-green-400" />
        Kontak Telepon
      </h4>
      <div className="w-full h-px bg-gradient-to-r from-green-500/50 to-transparent"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialInput
        label="Nomor Telepon"
        value={item.number}
        onChange={(value) => onUpdate(item.id, 'number', value)}
        placeholder="+62 123 4567 890"
        type="tel"
        icon={PhoneIcon}
        required
      />
      <MaterialInput
        label="Label"
        value={item.label || ''}
        onChange={(value) => onUpdate(item.id, 'label', value)}
        placeholder="cth., Kantor, Mobile, WhatsApp"
      />
    </div>
  </MaterialCard>
));
ContactItemForm.displayName = 'ContactItemForm';

const SocialMediaItemForm = memo<{ item: SocialMediaLink; onUpdate: ItemUpdateHandler<SocialMediaLink>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
  <MaterialCard onDelete={() => onRemove(item.id)}>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <GlobeAltIcon className="w-5 h-5 text-pink-400" />
        Media Sosial
      </h4>
      <div className="w-full h-px bg-gradient-to-r from-pink-500/50 to-transparent"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialInput
        label="Platform"
        value={item.platform}
        onChange={(value) => onUpdate(item.id, 'platform', value)}
        placeholder="cth., Instagram, Facebook, Twitter"
        icon={GlobeAltIcon}
        required
      />
      <MaterialInput
        label="URL"
        value={item.url}
        onChange={(value) => onUpdate(item.id, 'url', value)}
        placeholder="https://instagram.com/username"
        type="url"
        required
      />
    </div>
  </MaterialCard>
));
SocialMediaItemForm.displayName = 'SocialMediaItemForm';

const OrganizationMemberForm = memo<{ item: OrganizationMember; onUpdate: ItemUpdateHandler<OrganizationMember>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
  <MaterialCard onDelete={() => onRemove(item.id)}>
    <div className="mb-4">
      <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <UsersIcon className="w-5 h-5 text-orange-400" />
        Anggota Organisasi
      </h4>
      <div className="w-full h-px bg-gradient-to-r from-orange-500/50 to-transparent"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MaterialInput
        label="Posisi"
        value={item.position}
        onChange={(value) => onUpdate(item.id, 'position', value)}
        placeholder="cth., Direktur, Ketua, Sekretaris"
        icon={BriefcaseIcon}
        required
      />
      <MaterialInput
        label="Nama Lengkap"
        value={item.name}
        onChange={(value) => onUpdate(item.id, 'name', value)}
        placeholder="Nama lengkap anggota"
        icon={UsersIcon}
        required
      />
    </div>
  </MaterialCard>
));
OrganizationMemberForm.displayName = 'OrganizationMemberForm';

const PartnershipItemForm = memo<{ item: PartnershipItem; onUpdate: ItemUpdateHandler<PartnershipItem>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => {
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
    <div className="w-full flex items-start gap-4">
      <div className="flex-shrink-0 space-y-2">
        <div className="w-20 h-20 bg-gray-600/50 rounded-lg flex items-center justify-center border border-gray-500/50 overflow-hidden relative">
          {item.logo_url ? (
            <img 
              src={item.logo_url} 
              alt={item.name} 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <PhotoIcon className={`w-8 h-8 text-gray-400 ${item.logo_url ? 'hidden' : ''}`} />
        </div>
        <input type="file" id={`logo-upload-${item.id}`} accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={isUploading} />
        <label htmlFor={`logo-upload-${item.id}`} className="w-full text-xs text-center cursor-pointer secondary-button-sm flex items-center justify-center gap-1.5"><PhotoIcon className="w-3 h-3" /> Ganti Logo</label>
        {isUploading && <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-gray-800 rounded-full w-full h-1"><Progress.Indicator className="bg-red-500 h-full transition-transform duration-300" style={{ transform: `translateX(-${100 - uploadProgress}%)` }} /></Progress.Root>}
      </div>
      <div className="flex-grow space-y-3">
        <Form.Field name={`partner_name_${item.id}`}><Form.Label asChild><Label.Root className="input-label-sm">Nama Mitra</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.name} onChange={e => onUpdate(item.id, 'name', e.target.value)} className="input-field-sm" placeholder="Nama Institusi/Perusahaan" /></Form.Control></Form.Field>
      </div>
      <Tooltip.Root><Tooltip.Trigger asChild><button type="button" onClick={() => onRemove(item.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors mt-2"><TrashIcon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Hapus Mitra<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>
    </div>
  );
});
PartnershipItemForm.displayName = 'PartnershipItemForm';

const AchievementItemForm = memo<{ item: Achievement; onUpdate: ItemUpdateHandler<Achievement>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const url = await uploadPartnerLogo(file); // Reusing the same upload function
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
    <div className="w-full bg-gradient-to-br from-amber-500/5 to-yellow-600/5 rounded-2xl border border-amber-500/20 p-6 shadow-lg">
      <div className="flex items-start gap-6">
        {/* Achievement Image */}
        <div className="flex-shrink-0 space-y-3">
          <div className="w-24 h-32 bg-gradient-to-br from-amber-500/10 to-yellow-600/10 rounded-xl flex items-center justify-center border-2 border-amber-500/30 overflow-hidden relative group hover:border-amber-400/50 transition-colors">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex flex-col items-center justify-center text-amber-400/70 ${item.image_url ? 'hidden' : ''}`}>
              <TrophyIcon className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Sertifikat</span>
            </div>
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            id={`achievement-upload-${item.id}`} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            disabled={isUploading} 
          />
          <label 
            htmlFor={`achievement-upload-${item.id}`} 
            className="w-full text-xs text-center cursor-pointer bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 text-amber-300 hover:from-amber-500/30 hover:to-yellow-600/30 hover:border-amber-400/50 hover:text-amber-200 transition-all rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 font-medium"
          >
            <PhotoIcon className="w-3 h-3" /> 
            {item.image_url ? 'Ganti Gambar' : 'Unggah Gambar'}
          </label>
          {isUploading && (
            <div className="w-full">
              <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-amber-900/30 rounded-full w-full h-2">
                <Progress.Indicator 
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 h-full transition-transform duration-300" 
                  style={{ transform: `translateX(-${100 - uploadProgress}%)` }} 
                />
              </Progress.Root>
              <p className="text-xs text-amber-400/70 text-center mt-1">Mengunggah...</p>
            </div>
          )}
        </div>

        {/* Achievement Details */}
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-amber-400" />
              <h4 className="text-lg font-semibold text-amber-300">Penghargaan</h4>
            </div>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button" 
                  onClick={() => onRemove(item.id)} 
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-gray-700 z-[101]" sideOffset={5}>
                  Hapus Penghargaan
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Field name={`achievement_title_${item.id}`} className="space-y-2">
              <Form.Label asChild>
                <Label.Root className="text-sm font-medium text-amber-200 flex items-center gap-2">
                  <TrophyIcon className="w-4 h-4" />
                  Nama Penghargaan
                </Label.Root>
              </Form.Label>
              <Form.Control asChild>
                <input 
                  type="text" 
                  value={item.title} 
                  onChange={e => onUpdate(item.id, 'title', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-400/50 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                  placeholder="Contoh: Juara 1 Wirausaha Terbaik" 
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name={`achievement_issuer_${item.id}`} className="space-y-2">
              <Form.Label asChild>
                <Label.Root className="text-sm font-medium text-amber-200 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Pemberi Penghargaan
                </Label.Root>
              </Form.Label>
              <Form.Control asChild>
                <input 
                  type="text" 
                  value={item.issuer} 
                  onChange={e => onUpdate(item.id, 'issuer', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-400/50 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                  placeholder="Contoh: Kementerian UMKM" 
                />
              </Form.Control>
            </Form.Field>
          </div>

          <Form.Field name={`achievement_year_${item.id}`} className="space-y-2">
            <Form.Label asChild>
              <Label.Root className="text-sm font-medium text-amber-200 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Tahun Penghargaan
              </Label.Root>
            </Form.Label>
            <Form.Control asChild>
              <input 
                type="number" 
                min="1900" 
                max={new Date().getFullYear() + 5}
                value={item.year || ''} 
                onChange={e => onUpdate(item.id, 'year', parseInt(e.target.value) || new Date().getFullYear())} 
                className="w-full md:w-48 px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-xl text-amber-100 placeholder-amber-400/50 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all"
                placeholder={new Date().getFullYear().toString()}
              />
            </Form.Control>
          </Form.Field>
        </div>
      </div>
    </div>
  );
});
AchievementItemForm.displayName = 'AchievementItemForm';

const InternationalEventItemForm = memo<{ item: InternationalEvent; onUpdate: ItemUpdateHandler<InternationalEvent>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const url = await uploadPartnerLogo(file); // Reusing the same upload function
      setUploadProgress(100);
      onUpdate(item.id, 'image_url', url);
    } catch (error) {
      console.error("International event image upload failed", error);
      alert('Gagal mengunggah gambar event internasional.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-2xl border border-blue-500/20 p-6 shadow-lg">
      <div className="flex items-start gap-6">
        {/* Event Image */}
        <div className="flex-shrink-0 space-y-3">
          <div className="w-32 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-xl flex items-center justify-center border-2 border-blue-500/30 overflow-hidden relative group hover:border-blue-400/50 transition-colors">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.country} 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex flex-col items-center justify-center text-blue-400/70 ${item.image_url ? 'hidden' : ''}`}>
              <FlagIcon className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium">Event</span>
            </div>
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            id={`event-upload-${item.id}`} 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            disabled={isUploading} 
          />
          <label 
            htmlFor={`event-upload-${item.id}`} 
            className="w-full text-xs text-center cursor-pointer bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-500/30 hover:to-indigo-600/30 hover:border-blue-400/50 hover:text-blue-200 transition-all rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 font-medium"
          >
            <PhotoIcon className="w-3 h-3" /> 
            {item.image_url ? 'Ganti Gambar' : 'Unggah Gambar'}
          </label>
          {isUploading && (
            <div className="w-full">
              <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-blue-900/30 rounded-full w-full h-2">
                <Progress.Indicator 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-transform duration-300" 
                  style={{ transform: `translateX(-${100 - uploadProgress}%)` }} 
                />
              </Progress.Root>
              <p className="text-xs text-blue-400/70 text-center mt-1">Mengunggah...</p>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-semibold text-blue-300">Event Internasional</h4>
            </div>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  type="button" 
                  onClick={() => onRemove(item.id)} 
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl border border-gray-700 z-[101]" sideOffset={5}>
                  Hapus Event Internasional
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Field name={`event_country_${item.id}`} className="space-y-2">
              <Form.Label asChild>
                <Label.Root className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <FlagIcon className="w-4 h-4" />
                  Nama Negara
                </Label.Root>
              </Form.Label>
              <Form.Control asChild>
                <input 
                  type="text" 
                  value={item.country} 
                  onChange={e => onUpdate(item.id, 'country', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-xl text-blue-100 placeholder-blue-400/50 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                  placeholder="Contoh: Singapura" 
                />
              </Form.Control>
            </Form.Field>

            <Form.Field name={`event_country_code_${item.id}`} className="space-y-2">
              <Form.Label asChild>
                <Label.Root className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4" />
                  Emoji Bendera
                </Label.Root>
              </Form.Label>
              <Form.Control asChild>
                <input 
                  type="text" 
                  value={item.country_code} 
                  onChange={e => onUpdate(item.id, 'country_code', e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-xl text-blue-100 placeholder-blue-400/50 focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                  placeholder="🇸🇬" 
                  maxLength={4}
                />
              </Form.Control>
            </Form.Field>
          </div>

          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <p className="text-xs text-blue-300/80 flex items-center gap-2">
              <span className="text-lg">{item.country_code || '🌍'}</span>
              <span>Preview flag emoji untuk {item.country || 'negara'}</span>
            </p>
          </div>
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

  // Render individual sections based on activeSection
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'general':
        return (
          <Section title="Informasi Umum" icon={BuildingOfficeIcon}>
            <MaterialInput
              label="Slogan Organisasi"
              value={formData.slogan || ''}
              onChange={(value) => setFormData(p => ({...p, slogan: value}))}
              placeholder="Masukkan slogan organisasi Anda"
              icon={BuildingOfficeIcon}
            />
            <MaterialInput
              label="Email Organisasi"
              value={formData.email || ''}
              onChange={(value) => setFormData(p => ({...p, email: value}))}
              placeholder="contoh@organisasi.com"
              type="email"
              icon={GlobeAltIcon}
            />
          </Section>
        );

      case 'addresses':
        return (
          <Section title="Alamat" icon={MapPinIcon}>
            <div className="space-y-6">
              {formData.addresses.length > 0 ? (
                <SortableSection<AddressItem>
                    items={formData.addresses}
                    onReorder={(reordered) => setFormData(p => ({ ...p, addresses: reordered }))}
                    renderItem={(item, index) => (
                        <AddressItemForm
                            item={item}
                            index={index}
                            onUpdate={(id, field, value) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                            onPositionChange={(id, lat, lng) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, latitude: lat, longitude: lng } : i) }))}
                            onRemove={(id) => setFormData(p => ({ ...p, addresses: p.addresses.filter(i => i.id !== id) }))}
                        />
                    )}
                />
              ) : (
                <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-600/50">
                  <MapPinIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Alamat</h3>
                  <p className="text-gray-400 text-sm">Tambahkan alamat organisasi Anda</p>
                </div>
              )}
              <MaterialButton
                onClick={() => setFormData(p => ({...p, addresses: [...p.addresses, {id: uuidv4(), text: '', latitude: null, longitude: null, notes: ''}] }))}
                icon={PlusIcon}
                variant="secondary"
              >
                Tambah Alamat Baru
              </MaterialButton>
            </div>
          </Section>
        );

      case 'contacts':
        return (
          <Section title="Nomor Kontak" icon={PhoneIcon}>
            <div className="space-y-6">
              {formData.phone_numbers.length > 0 ? (
                <SortableSection<ContactItem>
                    items={formData.phone_numbers}
                    onReorder={(reordered) => setFormData(p => ({ ...p, phone_numbers: reordered }))}
                    renderItem={(item) => (
                        <ContactItemForm
                            item={item}
                            onUpdate={(id, field, value) => setFormData(p => ({ ...p, phone_numbers: p.phone_numbers.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                            onRemove={(id) => setFormData(p => ({...p, phone_numbers: p.phone_numbers.filter(i => i.id !== id)}))}
                        />
                    )}
                />
              ) : (
                <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-600/50">
                  <PhoneIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Kontak</h3>
                  <p className="text-gray-400 text-sm">Tambahkan nomor telepon organisasi Anda</p>
                </div>
              )}
              <MaterialButton
                onClick={() => setFormData(p => ({ ...p, phone_numbers: [...p.phone_numbers, {id: uuidv4(), number: '', label: ''}]}))}
                icon={PlusIcon}
                variant="secondary"
              >
                Tambah Nomor Telepon
              </MaterialButton>
            </div>
          </Section>
        );

      case 'social':
        return (
          <Section title="Media Sosial" icon={GlobeAltIcon}>
            <div className="space-y-6">
              {formData.social_media_links.length > 0 ? (
                <SortableSection<SocialMediaLink>
                    items={formData.social_media_links}
                    onReorder={(reordered) => setFormData(p => ({ ...p, social_media_links: reordered }))}
                    renderItem={(item) => (
                        <SocialMediaItemForm
                            item={item}
                            onUpdate={(id, field, value) => setFormData(p => ({ ...p, social_media_links: p.social_media_links.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                            onRemove={(id) => setFormData(p => ({...p, social_media_links: p.social_media_links.filter(i => i.id !== id)}))}
                        />
                    )}
                />
              ) : (
                <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-600/50">
                  <GlobeAltIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Media Sosial</h3>
                  <p className="text-gray-400 text-sm">Tambahkan akun media sosial organisasi Anda</p>
                </div>
              )}
              <MaterialButton
                onClick={() => setFormData(p => ({ ...p, social_media_links: [...p.social_media_links, {id: uuidv4(), platform: '', url: ''}]}))}
                icon={PlusIcon}
                variant="secondary"
              >
                Tambah Media Sosial
              </MaterialButton>
            </div>
          </Section>
        );

             case 'structure':
         return (
           <Section title="Struktur Organisasi" icon={UsersIcon}>
             <div className="space-y-6">
               {formData.organizational_structure.length > 0 ? (
                 <SortableSection<OrganizationMember>
                     items={formData.organizational_structure}
                     onReorder={(reordered) => setFormData(p => ({ ...p, organizational_structure: reordered }))}
                     renderItem={(item) => (
                         <OrganizationMemberForm
                             item={item}
                             onUpdate={(id, field, value) => setFormData(p => ({ ...p, organizational_structure: p.organizational_structure.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                             onRemove={(id) => setFormData(p => ({...p, organizational_structure: p.organizational_structure.filter(i => i.id !== id)}))}
                         />
                     )}
                 />
               ) : (
                 <div className="text-center py-12 bg-gray-800/20 rounded-xl border-2 border-dashed border-gray-600/50">
                   <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Anggota</h3>
                   <p className="text-gray-400 text-sm">Tambahkan anggota struktur organisasi Anda</p>
                 </div>
               )}
               <MaterialButton
                 onClick={() => setFormData(p => ({ ...p, organizational_structure: [...p.organizational_structure, {id: uuidv4(), position: '', name: ''}]}))}
                 icon={PlusIcon}
                 variant="secondary"
               >
                 Tambah Anggota
               </MaterialButton>
             </div>
           </Section>
         );

      case 'vision':
        return (
          <Section title="Visi & Misi" icon={EyeIcon}>
            <MaterialTextarea
              label="Visi Organisasi"
              value={formData.vision || ''}
              onChange={(value) => setFormData(p => ({...p, vision: value}))}
              placeholder="Jelaskan visi organisasi Anda untuk masa depan"
              rows={4}
            />
            <MaterialTextarea
              label="Misi Organisasi"
              value={formData.mission || ''}
              onChange={(value) => setFormData(p => ({...p, mission: value}))}
              placeholder="Jelaskan misi dan tujuan organisasi Anda"
              rows={6}
            />
          </Section>
        );



      case 'partnerships':
        return (
          <Section title="Kemitraan" icon={BriefcaseIcon}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4"><AcademicCapIcon className="w-5 h-5 text-gray-300" /><h4 className="text-lg font-medium text-gray-300">Lembaga Pendidikan, Pemerintah, & Swasta</h4></div>
                <SortableSection<PartnershipItem>
                    items={educationPartners}
                    onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...reordered, ...industryPartners] }))}
                    renderItem={(item) => (
                        <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />
                    )} />
                <button type="button" onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'education_government', name: '', logo_url: null }] }))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Mitra Pendidikan/Pemerintah</button>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4"><BriefcaseIcon className="w-5 h-5 text-gray-300" /><h4 className="text-lg font-medium text-gray-300">Mitra Industri</h4></div>
                <SortableSection<PartnershipItem>
                    items={industryPartners}
                    onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...educationPartners, ...reordered] }))}
                    renderItem={(item) => (
                        <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />
                    )} />
                <button type="button" onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'industry', name: '', logo_url: null }] }))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Mitra Industri</button>
              </div>
            </div>
          </Section>
        );

      case 'achievements':
        return (
          <Section title="Penghargaan & Prestasi" icon={TrophyIcon}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-xl border border-amber-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-amber-300">Kelola Penghargaan</h4>
                  <p className="text-amber-200/70 text-sm">Tambahkan dan kelola penghargaan yang telah diraih organisasi</p>
                </div>
              </div>
              
              {formData.achievements.length > 0 ? (
                <SortableSection<Achievement>
                  items={formData.achievements}
                  onReorder={(reordered) => setFormData(p => ({ ...p, achievements: reordered }))}
                  renderItem={(item) => (
                    <AchievementItemForm 
                      item={item} 
                      onUpdate={(id, field, value) => setFormData(p => ({ 
                        ...p, 
                        achievements: p.achievements.map(i => i.id === id ? { ...i, [field]: value } : i) 
                      }))} 
                      onRemove={(id) => setFormData(p => ({ 
                        ...p, 
                        achievements: p.achievements.filter(i => i.id !== id) 
                      }))} 
                    />
                  )}
                />
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 rounded-xl border-2 border-dashed border-amber-500/30">
                  <TrophyIcon className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-amber-300/80 mb-2">Belum Ada Penghargaan</h3>
                  <p className="text-amber-400/60 text-sm">Tambahkan penghargaan pertama organisasi Anda</p>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => setFormData(p => ({ 
                  ...p, 
                  achievements: [...p.achievements, { 
                    id: uuidv4(), 
                    title: '', 
                    issuer: '', 
                    year: new Date().getFullYear(), 
                    image_url: null 
                  }] 
                }))} 
                className="w-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-2 border-dashed border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-yellow-600/30 hover:border-amber-400/60 hover:text-amber-200 transition-all rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-4 h-4 text-white" />
                </div>
                Tambah Penghargaan Baru
              </button>
            </div>
          </Section>
        );

      case 'events':
        return (
          <Section title="Event Internasional" icon={GlobeAltIcon}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-xl border border-blue-500/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GlobeAltIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-300">Kelola Event Internasional</h4>
                  <p className="text-blue-200/70 text-sm">Tambahkan dan kelola event internasional yang diikuti organisasi</p>
                </div>
              </div>
              
              {formData.international_events.length > 0 ? (
                <SortableSection<InternationalEvent>
                  items={formData.international_events}
                  onReorder={(reordered) => setFormData(p => ({ ...p, international_events: reordered }))}
                  renderItem={(item) => (
                    <InternationalEventItemForm 
                      item={item} 
                      onUpdate={(id, field, value) => setFormData(p => ({ 
                        ...p, 
                        international_events: p.international_events.map(i => i.id === id ? { ...i, [field]: value } : i) 
                      }))} 
                      onRemove={(id) => setFormData(p => ({ 
                        ...p, 
                        international_events: p.international_events.filter(i => i.id !== id) 
                      }))} 
                    />
                  )}
                />
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-xl border-2 border-dashed border-blue-500/30">
                  <GlobeAltIcon className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-300/80 mb-2">Belum Ada Event Internasional</h3>
                  <p className="text-blue-400/60 text-sm">Tambahkan event internasional pertama organisasi Anda</p>
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => setFormData(p => ({ 
                  ...p, 
                  international_events: [...p.international_events, { 
                    id: uuidv4(), 
                    country: '', 
                    country_code: '',
                    image_url: null 
                  }] 
                }))} 
                className="w-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border-2 border-dashed border-blue-500/40 text-blue-300 hover:from-blue-500/30 hover:to-indigo-600/30 hover:border-blue-400/60 hover:text-blue-200 transition-all rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-4 h-4 text-white" />
                </div>
                Tambah Event Internasional Baru
              </button>
            </div>
          </Section>
        );

      default:
        return null;
    }
  };

  // If activeSection is provided, render only that section
  if (activeSection) {
    return (
      <Tooltip.Provider delayDuration={100}>
        <Form.Root onSubmit={handleSubmit} className="space-y-6">
          {renderSection(activeSection)}
          
          <div className="flex justify-end pt-8 border-t border-gray-700/30">
            <Form.Submit asChild>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 material-button ripple"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan Perubahan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>
            </Form.Submit>
          </div>
        </Form.Root>
      </Tooltip.Provider>
    );
  }

  // Original full form rendering (for backward compatibility)
  return (
    <Tooltip.Provider delayDuration={100}>
      <Form.Root onSubmit={handleSubmit} className="space-y-8">
        <Section title="Informasi Umum" icon={BuildingOfficeIcon}>
          <Form.Field name="slogan" className="space-y-2"><Form.Label asChild><Label.Root className="input-label">Slogan</Label.Root></Form.Label><Form.Control asChild><input type="text" name="slogan" value={formData.slogan || ''} onChange={(e) => setFormData(p => ({...p, slogan: e.target.value}))} className="input-field" placeholder="Slogan Perusahaan" /></Form.Control></Form.Field>
          <Form.Field name="email" className="space-y-2"><Form.Label asChild><Label.Root className="input-label">Email</Label.Root></Form.Label><Form.Control asChild><input type="email" name="email" value={formData.email || ''} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} className="input-field" placeholder="kontak@contoh.com" /></Form.Control></Form.Field>
        </Section>

        <Section title="Alamat" icon={MapPinIcon}>
            <SortableSection<AddressItem>
                items={formData.addresses}
                onReorder={(reordered) => setFormData(p => ({ ...p, addresses: reordered }))}
                renderItem={(item, index) => (
                    <AddressItemForm
                        item={item}
                        index={index}
                        onUpdate={(id, field, value) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                        onPositionChange={(id, lat, lng) => setFormData(p => ({ ...p, addresses: p.addresses.map(i => i.id === id ? { ...i, latitude: lat, longitude: lng } : i) }))}
                        onRemove={(id) => setFormData(p => ({ ...p, addresses: p.addresses.filter(i => i.id !== id) }))}
                    />
                )}
            />
          <button type="button" onClick={() => setFormData(p => ({...p, addresses: [...p.addresses, {id: uuidv4(), text: '', latitude: null, longitude: null, notes: ''}] }))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Alamat</button>
        </Section>

        <Section title="Nomor Kontak" icon={PhoneIcon}>
            <SortableSection<ContactItem>
                items={formData.phone_numbers}
                onReorder={(reordered) => setFormData(p => ({ ...p, phone_numbers: reordered }))}
                renderItem={(item) => (
                    <ContactItemForm
                        item={item}
                        onUpdate={(id, field, value) => setFormData(p => ({ ...p, phone_numbers: p.phone_numbers.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                        onRemove={(id) => setFormData(p => ({...p, phone_numbers: p.phone_numbers.filter(i => i.id !== id)}))}
                    />
                )}
            />
          <button type="button" onClick={() => setFormData(p => ({ ...p, phone_numbers: [...p.phone_numbers, {id: uuidv4(), number: '', label: ''}]}))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Nomor Telepon</button>
        </Section>

        <Section title="Media Sosial" icon={GlobeAltIcon}>
            <SortableSection<SocialMediaLink>
                items={formData.social_media_links}
                onReorder={(reordered) => setFormData(p => ({ ...p, social_media_links: reordered }))}
                renderItem={(item) => (
                    <SocialMediaItemForm
                        item={item}
                        onUpdate={(id, field, value) => setFormData(p => ({ ...p, social_media_links: p.social_media_links.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                        onRemove={(id) => setFormData(p => ({...p, social_media_links: p.social_media_links.filter(i => i.id !== id)}))}
                    />
                )}
            />
          <button type="button" onClick={() => setFormData(p => ({ ...p, social_media_links: [...p.social_media_links, {id: uuidv4(), platform: '', url: ''}]}))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Media Sosial</button>
        </Section>

        <Section title="Visi & Misi" icon={EyeIcon}>
          <Form.Field name="vision" className="space-y-2"><Form.Label asChild><Label.Root className="input-label">Visi</Label.Root></Form.Label><Form.Control asChild><textarea name="vision" rows={4} value={formData.vision || ''} onChange={(e) => setFormData(p => ({...p, vision: e.target.value}))} className="input-field resize-none" placeholder="Pernyataan Visi Perusahaan" /></Form.Control></Form.Field>
          <Form.Field name="mission" className="space-y-2"><Form.Label asChild><Label.Root className="input-label">Misi</Label.Root></Form.Label><Form.Control asChild><textarea name="mission" rows={6} value={formData.mission || ''} onChange={(e) => setFormData(p => ({...p, mission: e.target.value}))} className="input-field resize-none" placeholder="Pernyataan Misi Perusahaan" /></Form.Control></Form.Field>
        </Section>

        <Section title="Struktur Organisasi" icon={UsersIcon}>
            <SortableSection<OrganizationMember>
                items={formData.organizational_structure}
                onReorder={(reordered) => setFormData(p => ({ ...p, organizational_structure: reordered }))}
                renderItem={(item) => (
                    <OrganizationMemberForm
                        item={item}
                        onUpdate={(id, field, value) => setFormData(p => ({ ...p, organizational_structure: p.organizational_structure.map(i => i.id === id ? { ...i, [field]: value } : i) }))}
                        onRemove={(id) => setFormData(p => ({...p, organizational_structure: p.organizational_structure.filter(i => i.id !== id)}))}
                    />
                )}
            />
          <button type="button" onClick={() => setFormData(p => ({ ...p, organizational_structure: [...p.organizational_structure, {id: uuidv4(), position: '', name: ''}]}))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Anggota</button>
        </Section>

        <Section title="Kemitraan" icon={BriefcaseIcon}>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4"><AcademicCapIcon className="w-5 h-5 text-gray-300" /><h4 className="text-lg font-medium text-gray-300">Lembaga Pendidikan, Pemerintah, & Swasta</h4></div>
              <SortableSection<PartnershipItem>
                  items={educationPartners}
                  onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...reordered, ...industryPartners] }))}
                  renderItem={(item) => (
                      <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />
                  )} />
              <button type="button" onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'education_government', name: '', logo_url: null }] }))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Mitra Pendidikan/Pemerintah</button>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4"><BriefcaseIcon className="w-5 h-5 text-gray-300" /><h4 className="text-lg font-medium text-gray-300">Mitra Industri</h4></div>
              <SortableSection<PartnershipItem>
                  items={industryPartners}
                  onReorder={(reordered) => setFormData(p => ({ ...p, partnerships: [...educationPartners, ...reordered] }))}
                  renderItem={(item) => (
                      <PartnershipItemForm item={item} onUpdate={(id, field, value) => setFormData(p => ({ ...p, partnerships: p.partnerships.map(i => i.id === id ? { ...i, [field]: value } : i) }))} onRemove={(id) => setFormData(p => ({ ...p, partnerships: p.partnerships.filter(i => i.id !== id) }))} />
                  )} />
              <button type="button" onClick={() => setFormData(p => ({ ...p, partnerships: [...p.partnerships, { id: uuidv4(), category: 'industry', name: '', logo_url: null }] }))} className="secondary-button flex items-center gap-2 mt-4"><PlusIcon className="w-4 h-4" /> Tambah Mitra Industri</button>
            </div>
          </div>
        </Section>

        <Section title="Penghargaan & Prestasi" icon={TrophyIcon}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-600/10 rounded-xl border border-amber-500/20">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-amber-300">Kelola Penghargaan</h4>
                <p className="text-amber-200/70 text-sm">Tambahkan dan kelola penghargaan yang telah diraih organisasi</p>
              </div>
            </div>
            
            {formData.achievements.length > 0 ? (
              <SortableSection<Achievement>
                items={formData.achievements}
                onReorder={(reordered) => setFormData(p => ({ ...p, achievements: reordered }))}
                renderItem={(item) => (
                  <AchievementItemForm 
                    item={item} 
                    onUpdate={(id, field, value) => setFormData(p => ({ 
                      ...p, 
                      achievements: p.achievements.map(i => i.id === id ? { ...i, [field]: value } : i) 
                    }))} 
                    onRemove={(id) => setFormData(p => ({ 
                      ...p, 
                      achievements: p.achievements.filter(i => i.id !== id) 
                    }))} 
                  />
                )}
              />
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-amber-500/5 to-yellow-600/5 rounded-xl border-2 border-dashed border-amber-500/30">
                <TrophyIcon className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-amber-300/80 mb-2">Belum Ada Penghargaan</h3>
                <p className="text-amber-400/60 text-sm">Tambahkan penghargaan pertama organisasi Anda</p>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={() => setFormData(p => ({ 
                ...p, 
                achievements: [...p.achievements, { 
                  id: uuidv4(), 
                  title: '', 
                  issuer: '', 
                  year: new Date().getFullYear(), 
                  image_url: null 
                }] 
              }))} 
              className="w-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border-2 border-dashed border-amber-500/40 text-amber-300 hover:from-amber-500/30 hover:to-yellow-600/30 hover:border-amber-400/60 hover:text-amber-200 transition-all rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusIcon className="w-4 h-4 text-white" />
              </div>
              Tambah Penghargaan Baru
            </button>
          </div>
        </Section>

        <Section title="Event Internasional" icon={GlobeAltIcon}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 rounded-xl border border-blue-500/20">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-300">Kelola Event Internasional</h4>
                <p className="text-blue-200/70 text-sm">Tambahkan dan kelola event internasional yang diikuti organisasi</p>
              </div>
            </div>
            
            {formData.international_events.length > 0 ? (
              <SortableSection<InternationalEvent>
                items={formData.international_events}
                onReorder={(reordered) => setFormData(p => ({ ...p, international_events: reordered }))}
                renderItem={(item) => (
                  <InternationalEventItemForm 
                    item={item} 
                    onUpdate={(id, field, value) => setFormData(p => ({ 
                      ...p, 
                      international_events: p.international_events.map(i => i.id === id ? { ...i, [field]: value } : i) 
                    }))} 
                    onRemove={(id) => setFormData(p => ({ 
                      ...p, 
                      international_events: p.international_events.filter(i => i.id !== id) 
                    }))} 
                  />
                )}
              />
            ) : (
              <div className="text-center py-12 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-xl border-2 border-dashed border-blue-500/30">
                <GlobeAltIcon className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-300/80 mb-2">Belum Ada Event Internasional</h3>
                <p className="text-blue-400/60 text-sm">Tambahkan event internasional pertama organisasi Anda</p>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={() => setFormData(p => ({ 
                ...p, 
                international_events: [...p.international_events, { 
                  id: uuidv4(), 
                  country: '', 
                  country_code: '',
                  image_url: null 
                }] 
              }))} 
              className="w-full bg-gradient-to-r from-blue-500/20 to-indigo-600/20 border-2 border-dashed border-blue-500/40 text-blue-300 hover:from-blue-500/30 hover:to-indigo-600/30 hover:border-blue-400/60 hover:text-blue-200 transition-all rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusIcon className="w-4 h-4 text-white" />
              </div>
              Tambah Event Internasional Baru
            </button>
          </div>
        </Section>

        <div className="flex justify-end pt-4">
          <Form.Submit asChild>
            <button type="submit" disabled={isSaving} className="primary-button">
              {isSaving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Menyimpan...</>) : 'Simpan Profil'}
            </button>
          </Form.Submit>
        </div>
      </Form.Root>
    </Tooltip.Provider>
  );
};

export default OrganizationProfileForm;