'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SunIcon, MoonIcon, HomeIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));

    // Mouse movement for dynamic effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  return (
    <Tooltip.Provider>
      <div className={`min-h-screen transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-red-950 to-gray-800' 
          : 'bg-gradient-to-br from-red-50 via-white to-red-100'
      }`}>
        {/* Dynamic background effect */}
        <div
          className="fixed inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              ${isDarkMode ? 'rgba(139, 0, 0, 0.1)' : 'rgba(139, 0, 0, 0.05)'}, transparent 40%)`
          }}
        />

        {/* Theme toggle switch */}
        <div className="fixed top-6 right-6 z-50">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className={`p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-red-900/80 border border-red-800/50' 
                  : 'bg-red-100/80 border border-red-200/50'
              }`}>
                <Switch.Root
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-red-700' : 'bg-red-200'
                  }`}
                >
                  <Switch.Thumb className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 will-change-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </Switch.Root>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {isDarkMode ? (
                    <MoonIcon className="w-4 h-4 text-red-200 ml-0.5" />
                  ) : (
                    <SunIcon className="w-4 h-4 text-red-700 mr-0.5" />
                  )}
                </div>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className={`px-3 py-2 text-sm rounded-lg shadow-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white border border-gray-700' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
                sideOffset={5}
              >
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">
          {/* Animated 404 with extra top margin */}
          <div className="text-center mb-12 mt-16">
            <div className={`text-8xl md:text-9xl font-bold mb-8 transition-colors duration-500 ${
              isDarkMode ? 'text-red-400' : 'text-red-700'
            }`}>
              <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>4</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '100ms' }}>0</span>
              <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>4</span>
            </div>

            {/* Animated Progress Jogja Logo/Title with padding to prevent clipping */}
            <div className={`text-3xl md:text-4xl font-bold transition-colors duration-500 py-6 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`} style={{ minHeight: '80px' }}>
              <div className="inline-block animate-pulse">
                <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>P</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '100ms' }}>r</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>o</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '300ms' }}>g</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '400ms' }}>r</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '500ms' }}>e</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '600ms' }}>s</span>
                <span className="inline-block animate-bounce" style={{ animationDelay: '700ms' }}>s</span>
                <span className="inline-block mx-2"></span>
                <span className={`inline-block animate-bounce ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`} style={{ animationDelay: '800ms' }}>J</span>
                <span className={`inline-block animate-bounce ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`} style={{ animationDelay: '900ms' }}>o</span>
                <span className={`inline-block animate-bounce ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`} style={{ animationDelay: '1000ms' }}>g</span>
                <span className={`inline-block animate-bounce ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`} style={{ animationDelay: '1100ms' }}>j</span>
                <span className={`inline-block animate-bounce ${
                  isDarkMode ? 'text-red-400' : 'text-red-700'
                }`} style={{ animationDelay: '1200ms' }}>a</span>
              </div>
            </div>
          </div>

          {/* Material You Card */}
          <div className={`max-w-md w-full p-8 rounded-3xl shadow-2xl backdrop-blur-lg transition-all duration-500 transform hover:scale-105 ${
            isDarkMode 
              ? 'bg-red-950/30 border border-red-800/30' 
              : 'bg-white/80 border border-red-200/50'
          }`}>
            <div className="text-center">
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-500 ${
                isDarkMode ? 'bg-red-900/50' : 'bg-red-100'
              }`}>
                <ExclamationTriangleIcon
                  className={`w-8 h-8 transition-colors duration-500 ${
                    isDarkMode ? 'text-red-400' : 'text-red-700'
                  }`}
                />
              </div>

              {/* Title */}
              <h1 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Halaman Tidak Ditemukan
              </h1>

              {/* Description */}
              <p className={`text-base mb-8 leading-relaxed transition-colors duration-500 ${
                isDarkMode ? 'text-red-200' : 'text-gray-600'
              }`}>
                Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dipindahkan atau dihapus.
              </p>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Link href="/" className="block">
                      <button className={`w-full py-3 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 ${
                        isDarkMode 
                          ? 'bg-red-700 hover:bg-red-600 text-white shadow-lg hover:shadow-red-900/25' 
                          : 'bg-red-700 hover:bg-red-800 text-white shadow-lg hover:shadow-red-700/25'
                      }`}>
                        <HomeIcon className="w-5 h-5" />
                        Kembali ke Beranda
                      </button>
                    </Link>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className={`px-3 py-2 text-sm rounded-lg shadow-lg transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 text-white border border-gray-700' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                      sideOffset={5}
                    >
                      Go to homepage
                      <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => window.history.back()}
                      className={`w-full py-3 px-6 rounded-2xl font-medium border-2 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 ${
                        isDarkMode 
                          ? 'border-red-700 text-red-400 hover:bg-red-900/30' 
                          : 'border-red-700 text-red-700 hover:bg-red-50'
                      }`}
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      Halaman Sebelumnya
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className={`px-3 py-2 text-sm rounded-lg shadow-lg transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 text-white border border-gray-700' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                      sideOffset={5}
                    >
                      Go back to previous page
                      <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
            </div>
          </div>

          {/* Floating elements for decoration */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-ping ${
                  isDarkMode ? 'bg-red-400/30' : 'bg-red-600/20'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}