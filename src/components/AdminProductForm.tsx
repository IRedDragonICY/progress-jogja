// components/AdminProductForm.tsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ProductType, ProductFormData, FormStoreLink } from '@/types/supabase';
import { uploadProductImage } from '@/lib/supabase';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { debounce, isEqual } from 'lodash';
import * as Form from '@radix-ui/react-form';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Toast from '@radix-ui/react-toast';
import * as Progress from '@radix-ui/react-progress';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  LinkIcon,
  DocumentArrowUpIcon,
  RocketLaunchIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AdminProductFormProps {
  activeDraftId: string;
  initialDraftData: Partial<ProductFormData>;
  productTypes: ProductType[];
  onSave: (draftId: string, data: ProductFormData) => Promise<void>;
  onPublish: (draftId: string) => Promise<void>;
  onCancel: () => void;
  isExternallySaving: boolean;
}

const getInitialFormData = (draftData?: Partial<ProductFormData>): ProductFormData => {
  return {
    name: draftData?.name || '',
    description: draftData?.description || null,
    product_type_id: draftData?.product_type_id || null,
    image_urls: draftData?.image_urls || [],
    store_links: draftData?.store_links || [],
  };
};

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  activeDraftId,
  initialDraftData,
  productTypes,
  onSave,
  onPublish,
  onCancel,
  isExternallySaving,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(() => getInitialFormData(initialDraftData));
  const [formStoreLinks, setFormStoreLinks] = useState<FormStoreLink[]>(
    (initialDraftData?.store_links || []).map(link => ({ ...link, id: uuidv4() }))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isPublishing, setIsPublishing] = useState(false);

  const previousFormDataRef = useRef<ProductFormData>(getInitialFormData(initialDraftData));

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  useEffect(() => {
    const newInitialState = getInitialFormData(initialDraftData);
    setFormData(newInitialState);
    setFormStoreLinks((initialDraftData?.store_links || []).map(link => ({ ...link, id: uuidv4() })));
    previousFormDataRef.current = newInitialState;
    setAutoSaveStatus('idle');
  }, [activeDraftId, initialDraftData]);

  const autoSaveLogic = useCallback(async (currentData: ProductFormData) => {
    if (isExternallySaving || isPublishing) return;

    const dataToSave: ProductFormData = {
      ...currentData,
      store_links: formStoreLinks.map(({name, url}) => ({name, url})).filter(link => link.name && link.url)
    };

    const prevComparable = { ...previousFormDataRef.current, store_links: previousFormDataRef.current.store_links?.filter(link => link.name && link.url) || [] };


    if (isEqual(dataToSave, prevComparable)) {
      setAutoSaveStatus('idle');
      return;
    }

    setAutoSaveStatus('saving');
    try {
      await onSave(activeDraftId, dataToSave);
      previousFormDataRef.current = dataToSave; // update ref with what was actually saved
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error autosaving draft:', error);
      setAutoSaveStatus('error');
    }
  }, [onSave, activeDraftId, formStoreLinks, isExternallySaving, isPublishing]);

  const debouncedAutoSave = useMemo(() => {
    return debounce(autoSaveLogic, 1500);
  }, [autoSaveLogic]);

  useEffect(() => {
    debouncedAutoSave(formData);
    return () => debouncedAutoSave.cancel();
  }, [formData, formStoreLinks, debouncedAutoSave]); // Added formStoreLinks

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, product_type_id: value || null }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const files = Array.from(e.target.files);
      const totalFiles = files.length;
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductImage(files[i]);
        urls.push(url);
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      setFormData(p => {
        const newImageUrls = [...(p.image_urls || []), ...urls];
        debouncedAutoSave({ ...p, image_urls: newImageUrls }); // Trigger auto-save immediately after upload
        return { ...p, image_urls: newImageUrls };
      });
      showToast(`${urls.length} image(s) uploaded successfully!`);
    } catch(err) {
      console.error(err);
      showToast("Upload failed. Please try again.", 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = ''; // Reset file input
    }
  };

  const removeImage = (idx: number) => {
    setFormData(p => {
      const newImageUrls = (p.image_urls || []).filter((_, i) => i !== idx);
      debouncedAutoSave({ ...p, image_urls: newImageUrls }); // Trigger auto-save
      return { ...p, image_urls: newImageUrls };
    });
    showToast('Image removed');
  };

  const addStoreLink = () => setFormStoreLinks(p => [...p, { id: uuidv4(), name: '', url: '' }]);
  const updateStoreLink = (id: string, field: 'name' | 'url', val: string) => {
    setFormStoreLinks(p => p.map(l => l.id === id ? { ...l, [field]: val } : l));
  };
  const removeStoreLink = (id: string) => {
    setFormStoreLinks(p => p.filter(l => l.id !== id));
  };


  const handleManualSave = async () => {
    debouncedAutoSave.cancel();
    setAutoSaveStatus('saving');
    const dataToSave: ProductFormData = { ...formData, store_links: formStoreLinks.map(({name, url}) => ({name, url})).filter(link => link.name && link.url)};
    try {
      await onSave(activeDraftId, dataToSave);
      previousFormDataRef.current = dataToSave;
      setAutoSaveStatus('saved');
      showToast('Draft saved successfully!');
      setTimeout(() => setAutoSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error manually saving draft:', error);
      setAutoSaveStatus('error');
      showToast('Failed to save draft.', 'error');
    }
  };

  const handlePublishClick = () => {
    if (!formData.name?.trim()) {
      showToast('Product name is required to publish.', 'error');
      return;
    }
    setShowPublishDialog(true);
  };

  const confirmPublish = async () => {
    if (isPublishing || isExternallySaving) return;
    setIsPublishing(true);
    debouncedAutoSave.cancel();

    const dataToSave: ProductFormData = { ...formData, store_links: formStoreLinks.map(({name, url}) => ({name, url})).filter(link => link.name && link.url)};
    try {
      setAutoSaveStatus('saving');
      await onSave(activeDraftId, dataToSave); // Ensure latest data is saved
      previousFormDataRef.current = dataToSave;
      setAutoSaveStatus('saved');

      await onPublish(activeDraftId); // This will close the dialog on success (handled by parent)
      // No need to call showToast here as parent will handle it or onPublish success implies dialog closure.
    } catch (error) {
      console.error('Error during publish pre-save or publish:', error);
      setAutoSaveStatus('error');
      showToast('Failed to publish.', 'error');
    } finally {
      setIsPublishing(false);
      setShowPublishDialog(false); // Ensure dialog closes even on error from onPublish
    }
  };

  const effectiveStatus = isPublishing || isExternallySaving ? 'saving' : autoSaveStatus;

  const StatusIcon = () => {
    switch (effectiveStatus) {
      case 'saving':
        return <ClockIcon className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'saved':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="w-4 h-4 text-red-400" />;
      default: // idle
        return <div className="w-2 h-2 rounded-full bg-zinc-500" />;
    }
  };

  const statusText =
    effectiveStatus === 'saving' ? 'Saving...' :
    effectiveStatus === 'saved' ? 'All changes saved' :
    effectiveStatus === 'error' ? 'Save failed' :
    'Up to date';

  return (
    <Toast.Provider swipeDirection="right">
      <Tooltip.Provider>
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-t-3xl p-6 border-x border-t border-gray-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent mb-2">
                  Product Editor
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Draft ID:</span>
                  <code className="bg-gray-700 text-red-300 px-3 py-1 rounded-full text-xs font-mono">
                    ...{activeDraftId.slice(-8)}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <StatusIcon />
                <span className={`text-sm font-medium ${
                  effectiveStatus === 'saving' ? 'text-amber-300' :
                  effectiveStatus === 'saved' ? 'text-green-300' :
                  effectiveStatus === 'error' ? 'text-red-300' :
                  'text-gray-400'
                }`}>
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border-x border-gray-700/50 flex-grow overflow-y-auto">
            <Form.Root onSubmit={(e) => e.preventDefault()} className="p-8 space-y-8">
              <Form.Field name="name" className="space-y-2">
                <Form.Label asChild>
                  <Label.Root className="block text-sm font-medium text-red-400 mb-3">
                    Product Name *
                  </Label.Root>
                </Form.Label>
                <Form.Control asChild>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-lg"
                    placeholder="Enter product name"
                  />
                </Form.Control>
                <Form.Message match="valueMissing" className="text-red-400 text-sm mt-1">
                  Please enter a product name
                </Form.Message>
              </Form.Field>

              <Form.Field name="category" className="space-y-2">
                <Form.Label asChild>
                  <Label.Root className="block text-sm font-medium text-red-400 mb-3">
                    Product Category
                  </Label.Root>
                </Form.Label>
                <Select.Root value={formData.product_type_id || ''} onValueChange={handleSelectChange}>
                  <Select.Trigger className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-4 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 flex items-center justify-between">
                    <Select.Value placeholder="Choose a category" />
                    <Select.Icon>
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-[60] overflow-hidden">
                      <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-gray-800 text-gray-400 cursor-default">
                        <ChevronUpIcon className="w-4 h-4" />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="p-1">
                        {productTypes.map((type) => (
                          <Select.Item key={type.id} value={type.id} className="relative flex items-center px-8 py-2 text-white rounded-lg cursor-pointer hover:bg-gray-700 focus:bg-gray-700 outline-none data-[highlighted]:bg-gray-700">
                            <Select.ItemText>{type.name}</Select.ItemText>
                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                              <CheckCircleIcon className="w-4 h-4 text-red-400" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-gray-800 text-gray-400 cursor-default">
                        <ChevronDownIcon className="w-4 h-4" />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </Form.Field>

              <Form.Field name="description" className="space-y-2">
                <Form.Label asChild>
                  <Label.Root className="block text-sm font-medium text-red-400 mb-3">
                    Product Description
                  </Label.Root>
                </Form.Label>
                <Form.Control asChild>
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-2xl px-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 resize-none"
                    placeholder="Describe your product features, benefits, and specifications..."
                  />
                </Form.Control>
              </Form.Field>

              <div className="space-y-4">
                <Label.Root className="block text-sm font-medium text-red-400">
                  Product Images
                </Label.Root>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading || isExternallySaving || isPublishing}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                      isUploading || isExternallySaving || isPublishing
                        ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
                        : 'border-gray-600 bg-gray-700/30 hover:border-red-500 hover:bg-gray-700/50'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Progress.Root value={uploadProgress} className="relative overflow-hidden bg-gray-700 rounded-full w-32 h-2">
                          <Progress.Indicator
                            className="bg-red-500 h-full transition-transform duration-300"
                            style={{ transform: `translateX(-${100 - uploadProgress}%)` }}
                          />
                        </Progress.Root>
                        <span className="text-red-400 font-medium">Uploading {Math.round(uploadProgress)}%</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-400 font-medium">Click to upload images</span>
                        <span className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB each</span>
                      </div>
                    )}
                  </label>
                </div>
                {(formData.image_urls || []).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(formData.image_urls || []).map((url, index) => (
                      <div key={url + index} className="relative group">
                        <div className="aspect-square bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                          <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              disabled={isExternallySaving || isPublishing}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm z-[70]" sideOffset={5}>
                              Remove image
                              <Tooltip.Arrow className="fill-gray-800" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label.Root className="block text-sm font-medium text-red-400">
                    Store Links
                  </Label.Root>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        type="button"
                        onClick={addStoreLink}
                        disabled={isExternallySaving || isPublishing}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Store
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm z-[70]" sideOffset={5}>
                        Add a new store link
                        <Tooltip.Arrow className="fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
                <div className="space-y-3">
                  {formStoreLinks.map((link) => (
                    <div key={link.id} className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label.Root className="block text-xs text-gray-400 mb-2">Store Name</Label.Root>
                          <input
                            type="text"
                            placeholder="e.g., Amazon, Shopee"
                            value={link.name}
                            onChange={(e) => updateStoreLink(link.id, 'name', e.target.value)}
                            disabled={isExternallySaving || isPublishing}
                            className="w-full bg-gray-600/50 border border-gray-500 rounded-xl px-3 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <Label.Root className="block text-xs text-gray-400 mb-2">Product URL</Label.Root>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://store.com/product"
                              value={link.url}
                              onChange={(e) => updateStoreLink(link.id, 'url', e.target.value)}
                              disabled={isExternallySaving || isPublishing}
                              className="flex-1 bg-gray-600/50 border border-gray-500 rounded-xl px-3 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50"
                            />
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <button
                                  type="button"
                                  onClick={() => removeStoreLink(link.id)}
                                  disabled={isExternallySaving || isPublishing}
                                  className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </Tooltip.Trigger>
                              <Tooltip.Portal>
                                <Tooltip.Content className="bg-gray-800 text-white px-2 py-1 rounded text-sm z-[70]" sideOffset={5}>
                                  Remove store link
                                  <Tooltip.Arrow className="fill-gray-800" />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            </Tooltip.Root>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {formStoreLinks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No store links added yet</p>
                  </div>
                )}
              </div>
            </Form.Root>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-sm border-x border-b border-gray-700/50 px-8 py-6 rounded-b-3xl shadow-xl shrink-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isExternallySaving || isPublishing}
                className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isExternallySaving || isPublishing || autoSaveStatus === 'saving'}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {autoSaveStatus === 'saving' && !isPublishing && !isExternallySaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    Save Draft
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePublishClick}
                disabled={isExternallySaving || isPublishing || autoSaveStatus === 'saving' || !formData.name?.trim()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="w-4 h-4" />
                    Publish Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <AlertDialog.Root open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 rounded-xl p-6 w-full max-w-md z-[70] border border-gray-700 shadow-2xl">
              <AlertDialog.Title className="text-lg font-semibold text-white mb-2">
                Publish Product
              </AlertDialog.Title>
              <AlertDialog.Description className="text-gray-400 mb-6">
                Are you sure you want to publish &quot;{formData.name || 'this product'}&quot;? This will make it visible to all users.
              </AlertDialog.Description>
              <div className="flex gap-3 justify-end">
                <AlertDialog.Cancel asChild>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Cancel
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={confirmPublish}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors"
                  >
                    Yes, Publish
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <Toast.Root
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-2xl border z-[80] transition-all duration-300 ${
            toastType === 'success' 
              ? 'bg-emerald-900 border-emerald-700 text-emerald-100' 
              : 'bg-red-900 border-red-700 text-red-100'
          } data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out`}
          open={toastOpen}
          onOpenChange={setToastOpen}
        >
          <Toast.Title className="font-medium mb-1">
            {toastType === 'success' ? 'Success' : 'Error'}
          </Toast.Title>
          <Toast.Description className="text-sm opacity-90">
            {toastMessage}
          </Toast.Description>
          <Toast.Close className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-[90] outline-none" />
      </Tooltip.Provider>
    </Toast.Provider>
  );
};

export default AdminProductForm;