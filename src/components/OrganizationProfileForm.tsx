import React, { useState, useEffect, memo, useMemo } from 'react';
import { OrganizationProfileData, AddressItem, ContactItem, SocialMediaLink, OrganizationMember, PartnershipItem } from '@/types/supabase';
import { uploadPartnerLogo } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import * as Form from '@radix-ui/react-form';
import * as Label from '@radix-ui/react-label';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Progress from '@radix-ui/react-progress';
import { PlusIcon, TrashIcon, MapPinIcon, GlobeAltIcon, PhoneIcon, UsersIcon, BuildingOfficeIcon, EyeIcon, Bars2Icon, PhotoIcon, BriefcaseIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
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
});

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="space-y-4 p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-6 h-6 text-red-400" />
      <h3 className="text-xl font-semibold text-red-400">{title}</h3>
    </div>
    {children}
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
  <div className="w-full space-y-3">
    <div className="flex justify-between items-center"><Label.Root className="input-label-sm !mb-0 text-base">Alamat {index + 1}</Label.Root><Tooltip.Root><Tooltip.Trigger asChild><button type="button" onClick={() => onRemove(item.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"><TrashIcon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Hapus Alamat<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></div>
    <Form.Field name={`address_text_${item.id}`}><Form.Control asChild><input type="text" value={item.text} onChange={e => onUpdate(item.id, 'text', e.target.value)} className="input-field-sm" placeholder="Alamat Lengkap" /></Form.Control></Form.Field>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Form.Field name={`address_lat_${item.id}`}><Form.Label asChild><Label.Root className="input-label-sm">Lintang</Label.Root></Form.Label><Form.Control asChild><input type="number" step="any" value={item.latitude ?? ''} onChange={e => onUpdate(item.id, 'latitude', parseFloat(e.target.value) || null)} className="input-field-sm" placeholder="cth., -7.7956" /></Form.Control></Form.Field><Form.Field name={`address_lon_${item.id}`}><Form.Label asChild><Label.Root className="input-label-sm">Bujur</Label.Root></Form.Label><Form.Control asChild><input type="number" step="any" value={item.longitude ?? ''} onChange={e => onUpdate(item.id, 'longitude', parseFloat(e.target.value) || null)} className="input-field-sm" placeholder="cth., 110.3695" /></Form.Control></Form.Field></div>
    <MapPicker initialPosition={item.latitude && item.longitude ? [item.latitude, item.longitude] : null} onPositionChange={(lat, lng) => onPositionChange(item.id, lat, lng)} /><Form.Field name={`address_notes_${item.id}`}><Form.Label asChild><Label.Root className="input-label-sm">Catatan (Opsional)</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.notes || ''} onChange={e => onUpdate(item.id, 'notes', e.target.value)} className="input-field-sm" placeholder="cth., Kantor Pusat" /></Form.Control></Form.Field>
  </div>
));
AddressItemForm.displayName = 'AddressItemForm';

const ContactItemForm = memo<{ item: ContactItem; onUpdate: ItemUpdateHandler<ContactItem>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
        <Form.Field name={`phone_number_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">Nomor Telepon</Label.Root></Form.Label><Form.Control asChild><input type="tel" value={item.number} onChange={e => onUpdate(item.id, 'number', e.target.value)} className="input-field-sm" placeholder="+62 123 4567 890" /></Form.Control></Form.Field>
        <div className="flex items-end gap-3"><Form.Field name={`phone_label_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">Label</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.label || ''} onChange={e => onUpdate(item.id, 'label', e.target.value)} className="input-field-sm" placeholder="cth., Kantor" /></Form.Control></Form.Field><Tooltip.Root><Tooltip.Trigger asChild><button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors mb-px"><TrashIcon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Hapus Nomor<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></div>
    </div>
));
ContactItemForm.displayName = 'ContactItemForm';

const SocialMediaItemForm = memo<{ item: SocialMediaLink; onUpdate: ItemUpdateHandler<SocialMediaLink>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
      <Form.Field name={`social_platform_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">Platform</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.platform} onChange={e => onUpdate(item.id, 'platform', e.target.value)} className="input-field-sm" placeholder="cth., Instagram" /></Form.Control></Form.Field>
       <div className="flex items-end gap-3"><Form.Field name={`social_url_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">URL</Label.Root></Form.Label><Form.Control asChild><input type="url" value={item.url} onChange={e => onUpdate(item.id, 'url', e.target.value)} className="input-field-sm" placeholder="https://..." /></Form.Control></Form.Field><Tooltip.Root><Tooltip.Trigger asChild><button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors mb-px"><TrashIcon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Hapus Tautan<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></div>
    </div>
));
SocialMediaItemForm.displayName = 'SocialMediaItemForm';

const OrganizationMemberForm = memo<{ item: OrganizationMember; onUpdate: ItemUpdateHandler<OrganizationMember>; onRemove: (id: string) => void }>(({ item, onUpdate, onRemove }) => (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
      <Form.Field name={`org_position_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">Posisi</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.position} onChange={e => onUpdate(item.id, 'position', e.target.value)} className="input-field-sm" placeholder="cth., Direktur" /></Form.Control></Form.Field>
       <div className="flex items-end gap-3"><Form.Field name={`org_name_${item.id}`} className="flex-grow"><Form.Label asChild><Label.Root className="input-label-sm">Nama</Label.Root></Form.Label><Form.Control asChild><input type="text" value={item.name} onChange={e => onUpdate(item.id, 'name', e.target.value)} className="input-field-sm" placeholder="Nama Lengkap" /></Form.Control></Form.Field><Tooltip.Root><Tooltip.Trigger asChild><button type="button" onClick={() => onRemove(item.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors mb-px"><TrashIcon className="w-5 h-5" /></button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700 z-[101]" sideOffset={5}>Hapus Anggota<Tooltip.Arrow className="fill-gray-900" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></div>
    </div>
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
          {item.logo_url ? <Image src={item.logo_url} alt={item.name} fill className="object-contain" /> : <PhotoIcon className="w-8 h-8 text-gray-400" />}
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


const OrganizationProfileForm: React.FC<{ initialData: OrganizationProfileData | null; onSave: (data: OrganizationProfileData) => Promise<void>; isSaving: boolean; }> = ({ initialData, onSave, isSaving }) => {
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