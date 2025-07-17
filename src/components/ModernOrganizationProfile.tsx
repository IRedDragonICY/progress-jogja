import React, { useState, useEffect } from 'react';
import { OrganizationProfileData } from '@/types/supabase';
import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  EyeIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  TrophyIcon, 
  FlagIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import OrganizationProfileForm from './OrganizationProfileForm';

interface ModernOrganizationProfileProps {
  initialData: OrganizationProfileData | null;
  onSave: (data: OrganizationProfileData) => Promise<void>;
  isSaving: boolean;
}

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  count?: number;
}

const ModernOrganizationProfile: React.FC<ModernOrganizationProfileProps> = ({
  initialData,
  onSave,
  isSaving
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: ProfileSection[] = [
    {
      id: 'general',
      title: 'Informasi Umum',
      description: 'Kelola informasi dasar organisasi',
      icon: BuildingOfficeIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30'
    },
    {
      id: 'addresses',
      title: 'Alamat',
      description: 'Kelola alamat dan lokasi',
      icon: MapPinIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
      count: initialData?.addresses?.length || 0
    },
    {
      id: 'contacts',
      title: 'Kontak',
      description: 'Nomor telepon dan email',
      icon: PhoneIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
      count: initialData?.phone_numbers?.length || 0
    },
    {
      id: 'social',
      title: 'Media Sosial',
      description: 'Kelola akun media sosial',
      icon: GlobeAltIcon,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30',
      count: initialData?.social_media_links?.length || 0
    },
    {
      id: 'vision',
      title: 'Visi & Misi',
      description: 'Visi dan misi organisasi',
      icon: EyeIcon,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30'
    },
    {
      id: 'structure',
      title: 'Struktur Organisasi',
      description: 'Kelola anggota dan struktur',
      icon: UsersIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
      count: initialData?.organizational_structure?.length || 0
    },
    {
      id: 'partnerships',
      title: 'Kemitraan',
      description: 'Kelola mitra dan kerjasama',
      icon: BriefcaseIcon,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30',
      count: initialData?.partnerships?.length || 0
    },
    {
      id: 'achievements',
      title: 'Penghargaan',
      description: 'Kelola prestasi dan penghargaan',
      icon: TrophyIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30',
      count: initialData?.achievements?.length || 0
    },
    {
      id: 'events',
      title: 'Event Internasional',
      description: 'Kelola partisipasi event internasional',
      icon: FlagIcon,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
      count: initialData?.international_events?.length || 0
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const closeDialog = () => {
    setActiveSection(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-700/50 p-8 material-card">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Profil Organisasi
              </h1>
              <p className="text-gray-300 mt-1">
                Kelola informasi dan profil organisasi Anda
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">
                {initialData?.slogan || 'Belum ada slogan'}
              </p>
              <p className="text-xs text-blue-400">
                {initialData?.email || 'Email belum diatur'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            className={`${section.bgColor} rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/25 relative overflow-hidden group`}
            onClick={() => handleSectionClick(section.id)}
          >
            {/* Subtle background animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
              animate={{ x: [-100, 100] }}
              transition={{ 
                repeat: Infinity, 
                duration: 3, 
                ease: "linear",
                repeatType: "loop"
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.color.replace('text-', 'bg-').replace('-400', '-500/20')}`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.4 }
                  }}
                >
                  <section.icon className={`w-6 h-6 ${section.color}`} />
                </motion.div>
                {section.count !== undefined && (
                  <motion.div 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${section.color.replace('text-', 'bg-').replace('-400', '-500/20')} ${section.color}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (index * 0.1) + 0.3, type: "spring" }}
                  >
                    {section.count} item{section.count !== 1 ? 's' : ''}
                  </motion.div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {section.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {section.description}
              </p>
              
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-gray-200">
                <span>Kelola</span>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="w-4 h-4"
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dialog for each section */}
      <Dialog.Root open={activeSection !== null} onOpenChange={closeDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-6xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] overflow-hidden">
            
            {/* Dialog Header */}
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-white relative overflow-hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-32 h-32 bg-white/10 rounded-full blur-xl"
                  animate={{
                    x: [-50, 50, -50],
                    y: [-30, 30, -30],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute w-24 h-24 bg-white/5 rounded-full blur-xl right-10 top-5"
                  animate={{
                    x: [20, -20, 20],
                    y: [10, -10, 10],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  {activeSection && (
                    <>
                      <motion.div 
                        className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                          delay: 0.1
                        }}
                      >
                        {React.createElement(
                          sections.find(s => s.id === activeSection)?.icon || BuildingOfficeIcon,
                          { className: "w-5 h-5" }
                        )}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Dialog.Title asChild>
                          <h2 className="text-2xl font-bold">
                            {sections.find(s => s.id === activeSection)?.title}
                          </h2>
                        </Dialog.Title>
                        <Dialog.Description asChild>
                          <p className="text-blue-100 text-sm">
                            {sections.find(s => s.id === activeSection)?.description}
                          </p>
                        </Dialog.Description>
                      </motion.div>
                    </>
                  )}
                </div>
                <Dialog.Close asChild>
                  <motion.button 
                    className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                </Dialog.Close>
              </div>
            </motion.div>

            {/* Dialog Content */}
            <motion.div 
              className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {activeSection && (
                <OrganizationProfileForm
                  initialData={initialData}
                  onSave={onSave}
                  isSaving={isSaving}
                  activeSection={activeSection}
                />
              )}
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ModernOrganizationProfile; 