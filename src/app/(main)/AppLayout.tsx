'use client';

import { useState } from 'react';
import Topbar from '@/components/tampilan/Topbar';
import CartSidebar from '@/components/layout/CartSidebar';
import WishlistSidebar from '@/components/layout/WishlistSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar
        onCartToggle={() => setIsCartOpen(true)}
        onWishlistToggle={() => setIsWishlistOpen(true)}
      />

      <main>
        {children}
      </main>

      <CartSidebar
        isOpen={isCartOpen}
        onCloseAction={() => setIsCartOpen(false)}
      />

      <WishlistSidebar
        isOpen={isWishlistOpen}
        onCloseAction={() => setIsWishlistOpen(false)}
      />
    </div>
  );
}