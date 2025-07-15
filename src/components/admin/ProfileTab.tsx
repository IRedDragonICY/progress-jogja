import React from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import ModernOrganizationProfile from '@/components/ModernOrganizationProfile';
import type { OrganizationProfileData } from "@/types/supabase";

interface ProfileTabProps {
  organizationProfile: OrganizationProfileData | null;
  onProfileSave: (data: OrganizationProfileData) => Promise<void>;
  isProfileSaving: boolean;
  isDataLoading: boolean;
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
);

export function ProfileTab({
  organizationProfile,
  onProfileSave,
  isProfileSaving,
  isDataLoading
}: ProfileTabProps) {
  return (
    <div className="p-0">
      {organizationProfile === null && isDataLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 m-8">
          <LoadingSpinner />
          <p className="text-slate-400 mt-4 font-medium">Loading profile...</p>
        </div>
      ) : (
        <ModernOrganizationProfile
          initialData={organizationProfile}
          onSave={onProfileSave}
          isSaving={isProfileSaving}
        />
      )}
    </div>
  );
}