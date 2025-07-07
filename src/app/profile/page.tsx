'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut, getUserWithProfile } from '@/lib/supabase';
import type { UserWithProfile, Profile } from '@/types/supabase';
import { ArrowLeftOnRectangleIcon, UserCircleIcon, ShieldCheckIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import EditProfileForm from '@/components/EditProfileForm';

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getUserWithProfile();
        if (!data?.user) {
          router.replace('/login');
          return;
        }
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleSaveProfile = (updatedProfile: Profile) => {
    if (profileData) {
      setProfileData({ ...profileData, profile: updatedProfile });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const { user, profile } = profileData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
            <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={96} height={96} className="w-24 h-auto mx-auto mb-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Profil' : 'Profil Pengguna'}
            </h1>
            <p className="text-slate-400 mt-2">
                {isEditing ? 'Perbarui informasi dan foto profil Anda.' : `Selamat datang, ${profile?.full_name || user.email}`}
            </p>
        </div>

        {isEditing ? (
            <EditProfileForm
                initialProfile={profileData}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
            />
        ) : (
            <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl p-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg overflow-hidden">
                        {profile?.avatar_url ? (
                            <Image
                                key={profile.avatar_url}
                                src={profile.avatar_url}
                                alt="Avatar Pengguna"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserCircleIcon className="w-20 h-20 text-white"/>
                        )}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Nama Belum Diatur'}</h2>
                        <p className="text-slate-400">{user.email}</p>
                        <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${profile?.role === 'admin' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'}`}>
                            {profile?.role === 'admin' ? 'Administrator' : 'Pengguna'}
                        </span>
                    </div>
                     <button
                        onClick={() => setIsEditing(true)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 border border-slate-600/50 text-slate-300 hover:text-white"
                    >
                        <PencilSquareIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="border-t border-gray-700/50"></div>

                <div className="space-y-4">
                     {profile?.role === 'admin' && (
                        <button
                            onClick={handleGoToAdmin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                            <ShieldCheckIcon className="w-5 h-5"/>
                            <span>Masuk ke Dasbor Admin</span>
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5"/>
                        <span>Keluar</span>
                    </button>
                </div>
            </div>
        )}
        <div className="text-center mt-6">
             <a href="/" className="text-sm text-red-400 hover:text-red-300 hover:underline">Kembali ke Beranda</a>
        </div>
      </div>
    </div>
  );
}