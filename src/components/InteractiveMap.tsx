'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface Address {
  id: string;
  text: string;
  latitude: number;
  longitude: number;
  notes: string;
}

interface InteractiveMapProps {
  locations: Address[];
}

// Dynamic import of the actual map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-red-500/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white">Memuat peta...</p>
      </div>
    </div>
  ),
});

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-red-500/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return <DynamicMap locations={locations} />;
};

export default InteractiveMap; 