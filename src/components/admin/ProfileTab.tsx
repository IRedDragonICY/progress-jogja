import React from 'react';
import OrganizationProfileForm from '@/components/OrganizationProfileForm';
import type { OrganizationProfileData } from "@/types/supabase";

interface ProfileTabProps {
  organizationProfile: OrganizationProfileData | null;
  onProfileSave: (data: OrganizationProfileData) => Promise<void>;
  isProfileSaving: boolean;
  isDataLoading: boolean;
  activeSubMenu?: string;
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
);

const subMenuToSectionMap: { [key: string]: string } = {
  'profile-general': 'general',
  'profile-address': 'addresses',
  'profile-contact': 'contacts',
  'profile-social': 'social',
  'profile-vision': 'vision',
  'profile-structure': 'structure',
  'profile-partnerships': 'partnerships',
  'profile-achievements': 'achievements',
  'profile-events': 'events',
  'profile-settings': 'general',
};

export function ProfileTab({
  organizationProfile,
  onProfileSave,
  isProfileSaving,
  isDataLoading,
  activeSubMenu
}: ProfileTabProps) {

  const getActiveSectionKey = () => {
    if (activeSubMenu && subMenuToSectionMap[activeSubMenu]) {
      return subMenuToSectionMap[activeSubMenu];
    }
    return 'general';
  };

  const activeSectionKey = getActiveSectionKey();

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-4 text-slate-400 font-medium">Memuat profil organisasi...</p>
      </div>
    );
  }

  return (
    <div className="p-0">
      <OrganizationProfileForm
        initialData={organizationProfile}
        onSave={onProfileSave}
        isSaving={isProfileSaving}
        activeSection={activeSectionKey}
      />
    </div>
  );
}