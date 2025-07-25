import React from 'react';
import AppLayout from './AppLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}