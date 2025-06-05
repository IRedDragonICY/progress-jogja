import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import OrganizationProfileForm from '@/components/OrganizationProfileForm';
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
    <Tabs.Content value="profile" className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <BuildingStorefrontIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Organization Profile
            </h2>
            <p className="text-slate-400">Manage your business information and branding</p>
          </div>
        </div>
      </div>

      {organizationProfile === null && isDataLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50">
          <LoadingSpinner />
          <p className="text-slate-400 mt-4 font-medium">Loading profile...</p>
        </div>
      ) : (
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
          <div className="p-8">
            <OrganizationProfileForm
              initialData={organizationProfile}
              onSave={onProfileSave}
              isSaving={isProfileSaving}
            />
          </div>
        </div>
      )}
    </Tabs.Content>
  );
}