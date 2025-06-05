// components/OrganizationProfileForm.tsx
import React, { useState, useEffect } from 'react';
import { OrganizationProfileData, AddressItem, ContactItem, SocialMediaLink, OrganizationMember } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';
import * as Form from '@radix-ui/react-form';
import * as Label from '@radix-ui/react-label';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PlusIcon, TrashIcon, MapPinIcon, GlobeAltIcon, PhoneIcon, UsersIcon, BuildingOfficeIcon, EyeIcon as VisionIcon } from '@heroicons/react/24/outline';

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
});

interface OrganizationProfileFormProps {
  initialData: OrganizationProfileData | null;
  onSave: (data: OrganizationProfileData) => Promise<void>;
  isSaving: boolean;
}

const getInitialFormData = (data?: OrganizationProfileData | null): OrganizationProfileData => {
  return {
    id: data?.id,
    slogan: data?.slogan || '',
    addresses: data?.addresses || [],
    phone_numbers: data?.phone_numbers || [],
    email: data?.email || '',
    social_media_links: data?.social_media_links || [],
    vision: data?.vision || '',
    mission: data?.mission || '',
    organizational_structure: data?.organizational_structure || [],
  };
};

const OrganizationProfileForm: React.FC<OrganizationProfileFormProps> = ({ initialData, onSave, isSaving }) => {
  const [formData, setFormData] = useState<OrganizationProfileData>(() => getInitialFormData(initialData));

  useEffect(() => {
    setFormData(getInitialFormData(initialData));
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = <T extends { id: string }>(
    arrayName: keyof OrganizationProfileData,
    itemId: string,
    field: keyof T,
    value: unknown
  ) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as unknown as T[]).map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = <T extends { id: string }>(arrayName: keyof OrganizationProfileData, newItem: Omit<T, 'id'>) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as unknown as T[]), { ...newItem, id: uuidv4() } as T],
    }));
  };

  const removeArrayItem = (arrayName: keyof OrganizationProfileData, itemId: string) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: (prev[arrayName] as Array<{id: string}>).filter(item => item.id !== itemId),
    }));
  };

  const handleAddressPositionChange = (addressId: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === addressId ? { ...addr, latitude: lat, longitude: lng } : addr
      ),
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

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


  return (
    <Tooltip.Provider>
      <Form.Root onSubmit={handleSubmit} className="space-y-8">
        <Section title="General Information" icon={BuildingOfficeIcon}>
          <Form.Field name="slogan" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Slogan</Label.Root></Form.Label>
            <Form.Control asChild>
              <input type="text" name="slogan" value={formData.slogan || ''} onChange={handleChange} className="input-field" placeholder="Company Slogan" />
            </Form.Control>
          </Form.Field>
          <Form.Field name="email" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Email</Label.Root></Form.Label>
            <Form.Control asChild>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field" placeholder="contact@example.com" />
            </Form.Control>
          </Form.Field>
        </Section>

        <Section title="Addresses" icon={MapPinIcon}>
          {formData.addresses.map((addr, index) => (
            <ArrayItemWrapper key={addr.id} onRemove={() => removeArrayItem('addresses', addr.id)} removeTooltip="Remove Address">
              <div className="space-y-3">
                <Form.Field name={`address_text_${addr.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Address Line {index + 1}</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={addr.text} onChange={e => handleArrayChange<AddressItem>('addresses', addr.id, 'text', e.target.value)} className="input-field-sm" placeholder="Full Address" />
                  </Form.Control>
                </Form.Field>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Form.Field name={`address_lat_${addr.id}`}>
                        <Form.Label asChild><Label.Root className="input-label-sm">Latitude</Label.Root></Form.Label>
                        <Form.Control asChild>
                        <input type="number" step="any" value={addr.latitude ?? ''} onChange={e => handleArrayChange<AddressItem>('addresses', addr.id, 'latitude', parseFloat(e.target.value))} className="input-field-sm" placeholder="e.g., -7.7956" />
                        </Form.Control>
                    </Form.Field>
                    <Form.Field name={`address_lon_${addr.id}`}>
                        <Form.Label asChild><Label.Root className="input-label-sm">Longitude</Label.Root></Form.Label>
                        <Form.Control asChild>
                        <input type="number" step="any" value={addr.longitude ?? ''} onChange={e => handleArrayChange<AddressItem>('addresses', addr.id, 'longitude', parseFloat(e.target.value))} className="input-field-sm" placeholder="e.g., 110.3695" />
                        </Form.Control>
                    </Form.Field>
                </div>
                <MapPicker
                  initialPosition={addr.latitude && addr.longitude ? [addr.latitude, addr.longitude] : null}
                  onPositionChange={(lat, lng) => handleAddressPositionChange(addr.id, lat, lng)}
                />
                <Form.Field name={`address_notes_${addr.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Notes (Optional)</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={addr.notes || ''} onChange={e => handleArrayChange<AddressItem>('addresses', addr.id, 'notes', e.target.value)} className="input-field-sm" placeholder="e.g., Main Office, Branch Office" />
                  </Form.Control>
                </Form.Field>
              </div>
            </ArrayItemWrapper>
          ))}
          <button type="button" onClick={() => addArrayItem<AddressItem>('addresses', { text: '', latitude: null, longitude: null, notes: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Address
          </button>
        </Section>

        <Section title="Contact Numbers" icon={PhoneIcon}>
          {formData.phone_numbers.map((phone, index) => (
            <ArrayItemWrapper key={phone.id} onRemove={() => removeArrayItem('phone_numbers', phone.id)} removeTooltip='Remove Phone Number'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Field name={`phone_number_${phone.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Phone Number {index + 1}</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="tel" value={phone.number} onChange={e => handleArrayChange<ContactItem>('phone_numbers', phone.id, 'number', e.target.value)} className="input-field-sm" placeholder="+62 123 4567 890" />
                  </Form.Control>
                </Form.Field>
                <Form.Field name={`phone_label_${phone.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Label (Optional)</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={phone.label || ''} onChange={e => handleArrayChange<ContactItem>('phone_numbers', phone.id, 'label', e.target.value)} className="input-field-sm" placeholder="e.g., Office, WhatsApp" />
                  </Form.Control>
                </Form.Field>
              </div>
            </ArrayItemWrapper>
          ))}
          <button type="button" onClick={() => addArrayItem<ContactItem>('phone_numbers', { number: '', label: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Phone Number
          </button>
        </Section>

        <Section title="Social Media" icon={GlobeAltIcon}>
          {formData.social_media_links.map((link, index) => (
            <ArrayItemWrapper key={link.id} onRemove={() => removeArrayItem('social_media_links', link.id)} removeTooltip='Remove Social Link'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Field name={`social_platform_${link.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Platform {index + 1}</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={link.platform} onChange={e => handleArrayChange<SocialMediaLink>('social_media_links', link.id, 'platform', e.target.value)} className="input-field-sm" placeholder="e.g., Instagram, Website" />
                  </Form.Control>
                </Form.Field>
                <Form.Field name={`social_url_${link.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">URL</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="url" value={link.url} onChange={e => handleArrayChange<SocialMediaLink>('social_media_links', link.id, 'url', e.target.value)} className="input-field-sm" placeholder="https://..." />
                  </Form.Control>
                </Form.Field>
              </div>
            </ArrayItemWrapper>
          ))}
          <button type="button" onClick={() => addArrayItem<SocialMediaLink>('social_media_links', { platform: '', url: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Social Media
          </button>
        </Section>

        <Section title="Vision & Mission" icon={VisionIcon}>
          <Form.Field name="vision" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Vision</Label.Root></Form.Label>
            <Form.Control asChild>
              <textarea name="vision" rows={4} value={formData.vision || ''} onChange={handleChange} className="input-field resize-none" placeholder="Company Vision Statement" />
            </Form.Control>
          </Form.Field>
          <Form.Field name="mission" className="space-y-2">
            <Form.Label asChild><Label.Root className="block text-sm font-medium text-gray-300">Mission</Label.Root></Form.Label>
            <Form.Control asChild>
              <textarea name="mission" rows={6} value={formData.mission || ''} onChange={handleChange} className="input-field resize-none" placeholder="Company Mission Statement(s)" />
            </Form.Control>
          </Form.Field>
        </Section>

        <Section title="Organizational Structure" icon={UsersIcon}>
          {formData.organizational_structure.map((member, index) => (
             <ArrayItemWrapper key={member.id} onRemove={() => removeArrayItem('organizational_structure', member.id)} removeTooltip='Remove Member'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Field name={`org_position_${member.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Position {index + 1}</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={member.position} onChange={e => handleArrayChange<OrganizationMember>('organizational_structure', member.id, 'position', e.target.value)} className="input-field-sm" placeholder="e.g., Direktur" />
                  </Form.Control>
                </Form.Field>
                <Form.Field name={`org_name_${member.id}`}>
                  <Form.Label asChild><Label.Root className="input-label-sm">Name</Label.Root></Form.Label>
                  <Form.Control asChild>
                    <input type="text" value={member.name} onChange={e => handleArrayChange<OrganizationMember>('organizational_structure', member.id, 'name', e.target.value)} className="input-field-sm" placeholder="Full Name" />
                  </Form.Control>
                </Form.Field>
              </div>
            </ArrayItemWrapper>
          ))}
          <button type="button" onClick={() => addArrayItem<OrganizationMember>('organizational_structure', { position: '', name: '' })} className="secondary-button flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add Member
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
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </Form.Submit>
        </div>
      </Form.Root>
      <style jsx>{`

      `}</style>
    </Tooltip.Provider>
  );
};

export default OrganizationProfileForm;