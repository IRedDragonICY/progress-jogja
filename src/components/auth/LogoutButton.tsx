'use client';

import React from 'react';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

interface LogoutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function LogoutButton({ children, className }: LogoutButtonProps) {
  return (
    <form action="/auth/logout" method="post" className="w-full">
      <button
        type="submit"
        className={className || "flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 outline-none cursor-pointer transition-colors"}
      >
        <ArrowLeftOnRectangleIcon className="w-4 h-4" />
        {children}
      </button>
    </form>
  );
}