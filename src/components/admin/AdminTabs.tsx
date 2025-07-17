import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  CreditCardIcon, // New Icon
} from '@heroicons/react/24/outline';

export type AdminTab = 'home' | 'products' | 'profile' | 'transactions';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

const TABS_CONFIG = [
  { value: 'home' as AdminTab, label: 'Dashboard', icon: HomeIcon },
  { value: 'products' as AdminTab, label: 'Products & Types', icon: CubeIcon },
  { value: 'transactions' as AdminTab, label: 'Transactions', icon: CreditCardIcon },
  { value: 'profile' as AdminTab, label: 'Profile', icon: BuildingStorefrontIcon },
];