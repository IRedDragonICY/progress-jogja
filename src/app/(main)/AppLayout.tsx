'use client';

import { useState } from 'react';
import Topbar from '@/components/tampilan/Topbar';
import CartSidebar from '@/components/layout/CartSidebar';
import WishlistSidebar from '@/components/layout/WishlistSidebar';
import Footer from '@/components/tampilan/Footer';
import { AuthProvider } from '@/app/providers/AuthProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Topbar
          onCartToggle={() => setIsCartOpen(true)}
          onWishlistToggle={() => setIsWishlistOpen(true)}
        />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartSidebar
          isOpen={isCartOpen}
          onCloseAction={() => setIsCartOpen(false)}
        />
        <WishlistSidebar
          isOpen={isWishlistOpen}
          onCloseAction={() => setIsWishlistOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}