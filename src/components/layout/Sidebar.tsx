'use client';
import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: ReactNode;
  badge?: number;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  title,
  icon,
  badge,
  children,
  footer,
  className = ''
}: SidebarProps) {
  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-lg shadow-2xl border-l border-gray-200/50 transform transition-all duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    } ${className}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {badge !== undefined && badge > 0 && (
              <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full font-medium">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-full transition-colors group"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white/30 backdrop-blur-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
