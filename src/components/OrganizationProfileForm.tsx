import React, { useState, useEffect, useCallback, memo } from 'react';
import { OrganizationProfileData, AddressItem, ContactItem, SocialMediaLink, OrganizationMember } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import * as Form from '@radix-ui/react-form';
import * as Label from '@radix-ui/react-label';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PlusIcon, TrashIcon, MapPinIcon, GlobeAltIcon, PhoneIcon, UsersIcon, BuildingOfficeIcon, EyeIcon as VisionIcon } from '@heroicons/react/24/outline';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">Memuat Peta...</div>
});

const getInitialFormData = (data?: OrganizationProfileData | null): OrganizationProfileData => ({
  id: data?.id,
  slogan: data?.slogan || '',
  addresses: data?.addresses || [],
  phone_numbers: data?.phone_numbers || [],
  email: data?.email || '',
  social_media_links: data?.social_media_links || [],
  vision: data?.vision || '',
  mission: data?.mission || '',
  organizational_structure: data?.organizational_structure || [],
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

const ArrayItemWrapper: React.FC<{ onRemove: () => void; children: React.ReactNode; removeTooltip: string }> = ({ onRemove, children, removeTooltip }) => (
  <div className="p-4 bg-gray-700/40 rounded-lg border border-gray-600/50 relative">
    {children}
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm shadow-lg border border-gray-700" sideOffset={5}>
          {removeTooltip}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>
);

type ItemUpdateHandler<T extends { id: string }> = <K extends keyof T>(id: string, field: K, value: T[K]) => void;

interface AddressItemFormProps {
  item: AddressItem;
  index: number;
  onUpdate: ItemUpdateHandler<AddressItem>;
  onPositionChange: (id: string, lat: number, lng: number) => void;
  onRemove: () => void;
}

const AddressItemForm = memo<AddressItemFormProps>(({ item, index, onUpdate, onPositionChange, onRemove }) => (
  <ArrayItemWrapper onRemove={onRemove} removeTooltip="Hapus Alamat">
    <div className="space-y-3">
      <Form.Field name={`address_text_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Baris Alamat {index + 1}</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.text} onChange={e => onUpdate(item.id, 'text', e.target.value)} className="input-field-sm" placeholder="Alamat Lengkap" />
        </Form.Control>
      </Form.Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Form.Field name={`address_lat_${item.id}`}>
          <Form.Label asChild><Label.Root className="input-label-sm">Lintang</Label.Root></Form.Label>
          <Form.Control asChild>
            <input type="number" step="any" value={item.latitude ?? ''} onChange={e => onUpdate(item.id, 'latitude', parseFloat(e.target.value) || null)} className="input-field-sm" placeholder="cth., -7.7956" />
          </Form.Control>
        </Form.Field>
        <Form.Field name={`address_lon_${item.id}`}>
          <Form.Label asChild><Label.Root className="input-label-sm">Bujur</Label.Root></Form.Label>
          <Form.Control asChild>
            <input type="number" step="any" value={item.longitude ?? ''} onChange={e => onUpdate(item.id, 'longitude', parseFloat(e.target.value) || null)} className="input-field-sm" placeholder="cth., 110.3695" />
          </Form.Control>
        </Form.Field>
      </div>
      <MapPicker
        initialPosition={item.latitude && item.longitude ? [item.latitude, item.longitude] : null}
        onPositionChange={(lat, lng) => onPositionChange(item.id, lat, lng)}
      />
      <Form.Field name={`address_notes_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Catatan (Opsional)</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.notes || ''} onChange={e => onUpdate(item.id, 'notes', e.target.value)} className="input-field-sm" placeholder="cth., Kantor Pusat, Kantor Cabang" />
        </Form.Control>
      </Form.Field>
    </div>
  </ArrayItemWrapper>
));
AddressItemForm.displayName = 'AddressItemForm';

interface ContactItemFormProps {
  item: ContactItem;
  index: number;
  onUpdate: ItemUpdateHandler<ContactItem>;
  onRemove: () => void;
}

const ContactItemForm = memo<ContactItemFormProps>(({ item, index, onUpdate, onRemove }) => (
  <ArrayItemWrapper onRemove={onRemove} removeTooltip='Hapus Nomor Telepon'>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Form.Field name={`phone_number_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Nomor Telepon {index + 1}</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="tel" value={item.number} onChange={e => onUpdate(item.id, 'number', e.target.value)} className="input-field-sm" placeholder="+62 123 4567 890" />
        </Form.Control>
      </Form.Field>
      <Form.Field name={`phone_label_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Label (Opsional)</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.label || ''} onChange={e => onUpdate(item.id, 'label', e.target.value)} className="input-field-sm" placeholder="cth., Kantor, WhatsApp" />
        </Form.Control>
      </Form.Field>
    </div>
  </ArrayItemWrapper>
));
ContactItemForm.displayName = 'ContactItemForm';

interface SocialMediaItemFormProps {
  item: SocialMediaLink;
  index: number;
  onUpdate: ItemUpdateHandler<SocialMediaLink>;
  onRemove: () => void;
}

const SocialMediaItemForm = memo<SocialMediaItemFormProps>(({ item, index, onUpdate, onRemove }) => (
  <ArrayItemWrapper onRemove={onRemove} removeTooltip='Hapus Tautan Sosial'>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Form.Field name={`social_platform_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Platform {index + 1}</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.platform} onChange={e => onUpdate(item.id, 'platform', e.target.value)} className="input-field-sm" placeholder="cth., Instagram, Situs Web" />
        </Form.Control>
      </Form.Field>
      <Form.Field name={`social_url_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">URL</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="url" value={item.url} onChange={e => onUpdate(item.id, 'url', e.target.value)} className="input-field-sm" placeholder="https://..." />
        </Form.Control>
      </Form.Field>
    </div>
  </ArrayItemWrapper>
));
SocialMediaItemForm.displayName = 'SocialMediaItemForm';

interface OrganizationMemberFormProps {
  item: OrganizationMember;
  index: number;
  onUpdate: ItemUpdateHandler<OrganizationMember>;
  onRemove: () => void;
}

const OrganizationMemberForm = memo<OrganizationMemberFormProps>(({ item, index, onUpdate, onRemove }) => (
  <ArrayItemWrapper onRemove={onRemove} removeTooltip='Hapus Anggota'>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Form.Field name={`org_position_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Posisi {index + 1}</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.position} onChange={e => onUpdate(item.id, 'position', e.target.value)} className="input-field-sm" placeholder="cth., Direktur" />
        </Form.Control>
      </Form.Field>
      <Form.Field name={`org_name_${item.id}`}>
        <Form.Label asChild><Label.Root className="input-label-sm">Nama</Label.Root></Form.Label>
        <Form.Control asChild>
          <input type="text" value={item.name} onChange={e => onUpdate(item.id, 'name', e.target.value)} className="input-field-sm" placeholder="Nama Lengkap" />
        </Form.Control>
      </Form.Field>
    </div>
  </ArrayItemWrapper>
));
OrganizationMemberForm.displayName = 'OrganizationMemberForm';

interface OrganizationProfileFormProps {
  initialData: OrganizationProfileData | null;
  onSave: (data: OrganizationProfileData) => Promise<void>;
  isSaving: boolean;
}

const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({ initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState<OrganizationProfileData>(() => getInitialFormData(initialData));

  useEffect(() => {
    setFormData(getInitialFormData(initialData));
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = useCallback(<TItem extends { id: string }, TField extends keyof TItem>(
    arrayName: keyof OrganizationProfileData,
    itemId: string,
    field: TField,
    value: TItem[TField]
  ) => {
    setFormData(prev => {
        const oldArray = prev[arrayName] as unknown as TItem[];
        const newArray = oldArray.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const addArrayItem = useCallback(<T extends { id: string }>(arrayName: keyof OrganizationProfileData, newItem: Omit<T, 'id'>) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as unknown as T[]), { ...newItem, id: uuidv4() } as T],
    }));
  }, []);

  const removeArrayItem = useCallback((arrayName: keyof OrganizationProfileData, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as unknown as Array<{id: string}>).filter(item => item.id !== itemId),
    }));
  }, []);

  const handleAddressPositionChange = useCallback((addressId: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === addressId ? { ...addr, latitude: lat, longitude: lng } : addr
      ),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Tooltip.Provider>
      <Form.Root onSubmit={handleSubmit} className="space-y-8">
        <Section title="Informasi Umum" icon={BuildingOfficeIcon}>
          <Form.Field name="slogan" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Slogan</Label.Root></Form.Label>
            <Form.Control asChild>
              <input type="text" name="slogan" value={formData.slogan || ''} onChange={handleChange} className="input-field" placeholder="Slogan Perusahaan" />
            </Form.Control>
          </Form.Field>
          <Form.Field name="email" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Email</Label.Root></Form.Label>
            <Form.Control asChild>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" placeholder="kontak@contoh.com" />
            </Form.Control>
          </Form.Field>
        </Section>

        <Section title="Alamat" icon={MapPinIcon}>
          {formData.addresses.map((addr, index) => (
            <AddressItemForm
              key={addr.id}
              item={addr}
              index={index}
              onUpdate={(id, field, value) => handleArrayChange('addresses', id, field, value)}
              onPositionChange={handleAddressPositionChange}
              onRemove={() => removeArrayItem('addresses', addr.id)}
            />
          ))}
          <button type="button" onClick={() => addArrayItem<AddressItem>('addresses', { text: '', latitude: null, longitude: null, notes: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Tambah Alamat
          </button>
        </Section>

        <Section title="Nomor Kontak" icon={PhoneIcon}>
          {formData.phone_numbers.map((phone, index) => (
            <ContactItemForm
              key={phone.id}
              item={phone}
              index={index}
              onUpdate={(id, field, value) => handleArrayChange('phone_numbers', id, field, value)}
              onRemove={() => removeArrayItem('phone_numbers', phone.id)}
            />
          ))}
          <button type="button" onClick={() => addArrayItem<ContactItem>('phone_numbers', { number: '', label: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Tambah Nomor Telepon
          </button>
        </Section>

        <Section title="Media Sosial" icon={GlobeAltIcon}>
          {formData.social_media_links.map((link, index) => (
            <SocialMediaItemForm
              key={link.id}
              item={link}
              index={index}
              onUpdate={(id, field, value) => handleArrayChange('social_media_links', id, field, value)}
              onRemove={() => removeArrayItem('social_media_links', link.id)}
            />
          ))}
          <button type="button" onClick={() => addArrayItem<SocialMediaLink>('social_media_links', { platform: '', url: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Tambah Media Sosial
          </button>
        </Section>

        <Section title="Visi & Misi" icon={VisionIcon}>
          <Form.Field name="vision" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Visi</Label.Root></Form.Label>
            <Form.Control asChild>
              <textarea name="vision" rows={4} value={formData.vision || ''} onChange={handleChange} className="input-field resize-none" placeholder="Pernyataan Visi Perusahaan" />
            </Form.Control>
          </Form.Field>
          <Form.Field name="mission" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Misi</Label.Root></Form.Label>
            <Form.Control asChild>
              <textarea name="mission" rows={6} value={formData.mission || ''} onChange={handleChange} className="input-field resize-none" placeholder="Pernyataan Misi Perusahaan" />
            </Form.Control>
          </Form.Field>
        </Section>

        <Section title="Struktur Organisasi" icon={UsersIcon}>
          {formData.organizational_structure.map((member, index) => (
            <OrganizationMemberForm
              key={member.id}
              item={member}
              index={index}
              onUpdate={(id, field, value) => handleArrayChange('organizational_structure', id, field, value)}
              onRemove={() => removeArrayItem('organizational_structure', member.id)}
            />
          ))}
          <button type="button" onClick={() => addArrayItem<OrganizationMember>('organizational_structure', { position: '', name: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Tambah Anggota
          </button>
        </Section>

        <div className="flex justify-end pt-4">
          <Form.Submit asChild>
            <button
              type="submit"
              disabled={isSaving}
              className="primary-button"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Profil'
              )}
            </button>
          </Form.Submit>
        </div>
      </Form.Root>
    </Tooltip.Provider>
  );
};

export default OrganizationProfileForm;