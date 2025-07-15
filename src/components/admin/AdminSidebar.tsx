'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ArchiveBoxIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type AdminTab = 'home' | 'products' | 'profile' | 'transactions';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isActive?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
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
  {
    id: 'home',
    label: 'Dashboard',
    icon: HomeIcon,
  },
  {
    id: 'products',
    label: 'Products & Inventory',
    icon: CubeIcon,
    children: [
      {
        id: 'products-overview',
        label: 'Overview',
        icon: ChartBarIcon,
      },
      {
        id: 'products-manage',
        label: 'Manage Products',
        icon: ArchiveBoxIcon,
      },
      {
        id: 'products-add',
        label: 'Add Product',
        icon: PlusIcon,
      },
      {
        id: 'products-categories',
        label: 'Categories',
        icon: TagIcon,
      },
      {
        id: 'products-drafts',
        label: 'Drafts',
        icon: DocumentDuplicateIcon,
        badge: 3,
      },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: CreditCardIcon,
    children: [
      {
        id: 'transactions-overview',
        label: 'Overview',
        icon: ChartBarIcon,
      },
      {
        id: 'transactions-pending',
        label: 'Pending',
        icon: ClockIcon,
        badge: 5,
      },
      {
        id: 'transactions-completed',
        label: 'Completed',
        icon: CheckCircleIcon,
      },
      {
        id: 'transactions-failed',
        label: 'Failed',
        icon: XCircleIcon,
      },
      {
        id: 'transactions-revenue',
        label: 'Revenue',
        icon: BanknotesIcon,
      },
    ],
  },
  {
    id: 'profile',
    label: 'Organization',
    icon: BuildingStorefrontIcon,
    children: [
      {
        id: 'profile-overview',
        label: 'Profile',
        icon: UserIcon,
      },
      {
        id: 'profile-settings',
        label: 'Settings',
        icon: Cog6ToothIcon,
      },
    ],
  },
];

export function AdminSidebar({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  userProfile,
  stats,
}: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Auto-expand menu based on active tab
  React.useEffect(() => {
    if (activeTab === 'products' && !expandedItems.includes('products')) {
      setExpandedItems(prev => [...prev, 'products']);
    } else if (activeTab === 'transactions' && !expandedItems.includes('transactions')) {
      setExpandedItems(prev => [...prev, 'transactions']);
    } else if (activeTab === 'profile' && !expandedItems.includes('profile')) {
      setExpandedItems(prev => [...prev, 'profile']);
    }
  }, [activeTab, expandedItems]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    // Map submenu items to their parent tab
    const tabMapping: { [key: string]: AdminTab } = {
      'home': 'home',
      'products': 'products',
      'products-overview': 'products',
      'products-manage': 'products',
      'products-add': 'products',
      'products-categories': 'products',
      'products-drafts': 'products',
      'transactions': 'transactions',
      'transactions-overview': 'transactions',
      'transactions-pending': 'transactions',
      'transactions-completed': 'transactions',
      'transactions-failed': 'transactions',
      'transactions-revenue': 'transactions',
      'profile': 'profile',
      'profile-overview': 'profile',
      'profile-settings': 'profile',
    };
    
    const targetTab = tabMapping[item.id] || 'home';
    onTabChange(targetTab);
    
    // If item has children, also toggle expanded state
    if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    
    // Check if this item or its parent should be active
    const isActive = activeTab === item.id || 
      (item.id.startsWith('products-') && activeTab === 'products') ||
      (item.id.startsWith('transactions-') && activeTab === 'transactions') ||
      (item.id.startsWith('profile-') && activeTab === 'profile');
    
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="mb-1">
        <motion.div
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
            transition-all duration-200 group
            ${level === 0 ? 'mx-2' : 'mx-6'}
            ${isActive 
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }
            ${isHovered && !isActive ? 'bg-slate-700/30' : ''}
          `}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Icon */}
          <item.icon className={`
            w-5 h-5 transition-all duration-200
            ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
            ${level > 0 ? 'w-4 h-4' : ''}
          `} />

          {/* Label */}
          {!isCollapsed && (
            <span className={`
              flex-1 font-medium text-sm transition-colors duration-200
              ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
            `}>
              {item.label}
            </span>
          )}

          {/* Badge */}
          {!isCollapsed && item.badge && (
            <motion.span
              className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </motion.span>
          )}

          {/* Expand/Collapse Icon */}
          {!isCollapsed && item.children && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </motion.div>
          )}

          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
              layoutId="activeIndicator"
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            />
          )}
        </motion.div>

        {/* Submenu */}
        {!isCollapsed && item.children && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1">
                  {item.children.map(child => renderMenuItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleCollapse}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        className={`
          fixed left-0 top-0 h-full z-40 
          bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0' : 'w-72 translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-72'}
        `}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PJ</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Progress Jogja</h2>
                <p className="text-slate-400 text-xs">Admin Panel</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
          >
            {isCollapsed ? (
              <Bars3Icon className="w-5 h-5 text-slate-400" />
            ) : (
              <XMarkIcon className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* User Profile */}
        {!isCollapsed && userProfile && (
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{userProfile.name}</p>
                <p className="text-slate-400 text-xs truncate">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {!isCollapsed && stats && (
          <div className="p-4 border-b border-slate-700/50">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{stats.totalProducts}</div>
                <div className="text-slate-400 text-xs">Products</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{stats.totalTransactions}</div>
                <div className="text-slate-400 text-xs">Sales</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">{stats.pendingDrafts}</div>
                <div className="text-slate-400 text-xs">Drafts</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2">
            {MENU_CONFIG.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          {!isCollapsed && (
            <div className="text-center">
              <p className="text-slate-400 text-xs">
                © 2024 Progress Jogja
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
    </>
  );
} 