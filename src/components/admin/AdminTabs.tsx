import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export type AdminTab = 'home' | 'products' | 'profile';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

const TABS_CONFIG = [
  { value: 'home' as AdminTab, label: 'Dashboard', icon: HomeIcon },
  { value: 'products' as AdminTab, label: 'Products & Types', icon: CubeIcon },
  { value: 'profile' as AdminTab, label: 'Profile', icon: BuildingStorefrontIcon },
];

export function AdminTabs({ activeTab, onTabChange, children }: AdminTabsProps) {
  return (
    <Tabs.Root value={activeTab} onValueChange={(value) => onTabChange(value as AdminTab)}>
      <Tabs.List className="flex gap-1 mb-8 bg-slate-800/60 backdrop-blur-lg p-1.5 rounded-2xl border border-slate-700/50 shadow-xl">
        {TABS_CONFIG.map(tab => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className="group relative flex-1 px-6 py-3.5 rounded-xl font-medium transition-all duration-300 text-slate-400 hover:text-white hover:bg-slate-700/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/25 flex items-center justify-center gap-2.5"
          >
            <tab.icon className="w-4 h-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
            <span className="font-semibold text-sm">{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 overflow-hidden">
        {children}
      </div>
    </Tabs.Root>
  );
}