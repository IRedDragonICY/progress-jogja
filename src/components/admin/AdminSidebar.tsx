'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ArchiveBoxIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  LinkIcon,
  UsersIcon,
  TrophyIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';

export type AdminTab = 'home' | 'products' | 'profile' | 'transactions';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: MenuItem[];
  onClick?: () => void;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChangeAction: (tab: AdminTab) => void;
  activeSubMenu?: string;
  onSubMenuChangeAction?: (subMenu: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userProfile?: {
    name: string;
    email: string;
    avatar?: string;
  };
  stats?: {
    totalProducts: number;
    totalTransactions: number;
    pendingDrafts: number;
  };
}

const MENU_CONFIG: MenuItem[] = [
  { id: 'home', label: 'Dasbor', icon: HomeIcon },
  { id: 'products', label: 'Produk & Inventaris', icon: CubeIcon, children: [
      { id: 'products-overview', label: 'Ringkasan', icon: ChartBarIcon },
      { id: 'products-manage', label: 'Kelola Produk', icon: ArchiveBoxIcon },
      { id: 'products-add', label: 'Tambah Produk', icon: PlusIcon },
      { id: 'products-categories', label: 'Kategori', icon: TagIcon },
      { id: 'products-drafts', label: 'Draf', icon: DocumentDuplicateIcon, badge: 3 },
  ]},
  { id: 'transactions', label: 'Transaksi', icon: CreditCardIcon, children: [
      { id: 'transactions-overview', label: 'Ringkasan', icon: ChartBarIcon },
      { id: 'transactions-pending', label: 'Tertunda', icon: ClockIcon, badge: 5 },
      { id: 'transactions-completed', label: 'Selesai', icon: CheckCircleIcon },
      { id: 'transactions-failed', label: 'Gagal', icon: XCircleIcon },
      { id: 'transactions-revenue', label: 'Pendapatan', icon: BanknotesIcon },
  ]},
  { id: 'profile', label: 'Profil Organisasi', icon: BuildingStorefrontIcon, children: [
      { id: 'profile-general', label: 'Informasi Umum', icon: InformationCircleIcon },
      { id: 'profile-address', label: 'Alamat', icon: MapPinIcon },
      { id: 'profile-contact', label: 'Kontak', icon: PhoneIcon },
      { id: 'profile-social', label: 'Media Sosial', icon: LinkIcon },
      { id: 'profile-vision', label: 'Visi & Misi', icon: EyeIcon },
      { id: 'profile-structure', label: 'Struktur Organisasi', icon: UsersIcon },
      { id: 'profile-partnerships', label: 'Kemitraan', icon: HandRaisedIcon },
      { id: 'profile-achievements', label: 'Penghargaan', icon: TrophyIcon },
      { id: 'profile-events', label: 'Event Internasional', icon: GlobeAltIcon },
      { id: 'profile-settings', label: 'Pengaturan', icon: Cog6ToothIcon },
  ]},
];

export function AdminSidebar({
  activeTab,
  onTabChangeAction,
  activeSubMenu,
  onSubMenuChangeAction,
  isCollapsed = false,
  onToggleCollapse,
  userProfile,
  stats,
}: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setExpandedItems(prevExpanded => {
      if (activeTab && !prevExpanded.includes(activeTab)) {
        return [...prevExpanded, activeTab];
      }
      return prevExpanded;
    });
  }, [activeTab]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    const tabMapping: { [key: string]: AdminTab } = {
      'home': 'home',
      'products': 'products', 'products-overview': 'products', 'products-manage': 'products', 'products-add': 'products', 'products-categories': 'products', 'products-drafts': 'products',
      'transactions': 'transactions', 'transactions-overview': 'transactions', 'transactions-pending': 'transactions', 'transactions-completed': 'transactions', 'transactions-failed': 'transactions', 'transactions-revenue': 'transactions',
      'profile': 'profile', 'profile-general': 'profile', 'profile-address': 'profile', 'profile-contact': 'profile', 'profile-social': 'profile', 'profile-vision': 'profile', 'profile-structure': 'profile', 'profile-partnerships': 'profile', 'profile-achievements': 'profile', 'profile-events': 'profile', 'profile-settings': 'profile',
    };

    const targetTab = tabMapping[item.id] || 'home';
    onTabChangeAction(targetTab);

    if (item.id.includes('-') && onSubMenuChangeAction) {
      onSubMenuChangeAction(item.id);
    }

    if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isActive = level === 0 ? activeTab === item.id : activeSubMenu === item.id;
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="mb-1">
        <motion.div
          className={`relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${level === 0 ? 'mx-2' : 'mx-6'} ${isActive ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'} ${isHovered && !isActive ? 'bg-slate-700/30' : ''}`}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} ${level > 0 ? 'w-4 h-4' : ''}`} />
          {!isCollapsed && (<span className={`flex-1 font-medium text-sm transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.label}</span>)}
          {!isCollapsed && item.badge && (<motion.span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>{item.badge > 99 ? '99+' : item.badge}</motion.span>)}
          {!isCollapsed && item.children && (<motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}><ChevronRightIcon className="w-4 h-4" /></motion.div>)}
          {isActive && (<motion.div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" layoutId="activeIndicator" transition={{ type: "spring", stiffness: 500, damping: 25 }} />)}
        </motion.div>
        {!isCollapsed && item.children && (<AnimatePresence>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><div className="mt-2 space-y-1">{item.children.map(child => renderMenuItem(child, level + 1))}</div></motion.div>)}</AnimatePresence>)}
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {!isCollapsed && (<motion.div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onToggleCollapse}/>)}
      </AnimatePresence>
      <motion.aside
        className={`fixed left-0 top-0 h-full z-40 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-72 translate-x-0'}`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            {!isCollapsed && (<div className="flex items-center gap-3"><div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">PJ</span></div><div><h2 className="text-white font-bold text-lg">Progress Jogja</h2><p className="text-slate-400 text-xs">Panel Admin</p></div></div>)}
            <button onClick={onToggleCollapse} className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors">{isCollapsed ? (<Bars3Icon className="w-5 h-5 text-slate-400" />) : (<XMarkIcon className="w-5 h-5 text-slate-400" />)}</button>
          </div>
          {!isCollapsed && userProfile && (
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white font-medium text-sm">{userProfile.name.charAt(0).toUpperCase()}</span></div><div className="flex-1 min-w-0"><p className="text-white font-medium text-sm truncate">{userProfile.name}</p><p className="text-slate-400 text-xs truncate">{userProfile.email}</p></div></div>
            </div>
          )}
          {!isCollapsed && stats && (
            <div className="p-4 border-b border-slate-700/50">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center"><div className="text-white font-bold text-lg">{stats.totalProducts}</div><div className="text-slate-400 text-xs">Produk</div></div>
                <div className="text-center"><div className="text-white font-bold text-lg">{stats.totalTransactions}</div><div className="text-slate-400 text-xs">Penjualan</div></div>
                <div className="text-center"><div className="text-white font-bold text-lg">{stats.pendingDrafts}</div><div className="text-slate-400 text-xs">Draf</div></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          <nav className="space-y-2">
            {MENU_CONFIG.map(item => renderMenuItem(item))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
          {!isCollapsed && (<div className="text-center"><p className="text-slate-400 text-xs">© 2024 Progress Jogja</p></div>)}
        </div>
      </motion.aside>
    </>
  );
}