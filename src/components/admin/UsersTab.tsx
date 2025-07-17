import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Select from '@radix-ui/react-select';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  XMarkIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import type { Profile, UserWithProfile } from '@/types/supabase';
import EditProfileForm from '@/components/EditProfileForm';
import type { User } from '@supabase/supabase-js';

interface UsersTabProps {
  users: Profile[];
  currentUserProfile: UserWithProfile | null;
  onUpdateUser: (userId: string, updates: Partial<Profile>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  isProcessing: boolean;
  isDataLoading: boolean;
}

const RoleBadge = ({ role }: { role: 'admin' | 'user' | null | undefined }) => {
  const displayRole = role || 'user';
  const isAdmin = displayRole === 'admin';

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
      isAdmin
        ? 'bg-red-500/10 text-red-400 border-red-500/30'
        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    }`}>
      {isAdmin ? <ShieldCheckIcon className="w-3.5 h-3.5 mr-1.5" /> : <UserCircleIcon className="w-3.5 h-3.5 mr-1.5" />}
      {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
    </span>
  );
};

const PaginationControls = ({
  currentPage, totalPages, totalItems, onPageChange, itemsPerPage, onItemsPerPageChange, startIndex, endIndex,
}: {
  currentPage: number; totalPages: number; totalItems: number; onPageChange: (page: number) => void;
  itemsPerPage: number; onItemsPerPageChange: (itemsPerPage: number) => void;
  startIndex: number; endIndex: number;
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">Menampilkan {startIndex} - {endIndex} dari {totalItems} pengguna</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Tampilkan:</span>
          <Select.Root value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 text-white border border-slate-600/50 rounded-lg hover:bg-slate-700/70 transition-all duration-200 min-w-[80px]">
              <Select.Value />
              <Select.Icon><ChevronDownIcon className="w-4 h-4" /></Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <Select.Viewport className="p-1">
                  {[10, 20, 50].map(val => (
                     <Select.Item key={val} value={String(val)} className="px-3 py-2 text-sm text-white hover:bg-slate-700 rounded-lg cursor-pointer outline-none data-[highlighted]:bg-slate-700">
                      <Select.ItemText>{val}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon className="w-5 h-5" /></button>
          {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => onPageChange(i + 1)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === i + 1 ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>{i + 1}</button>))}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRightIcon className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export function UsersTab({ users, currentUserProfile, onUpdateUser, onDeleteUser, isDataLoading }: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowercasedTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.full_name?.toLowerCase().includes(lowercasedTerm) ||
      user.email?.toLowerCase().includes(lowercasedTerm) ||
      user.id.toLowerCase().includes(lowercasedTerm)
    );
  }, [users, searchTerm]);

  const { paginatedUsers, totalPages, startIndex, endIndex } = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = Math.min(startIdx + itemsPerPage, filteredUsers.length);
    return {
      paginatedUsers: filteredUsers.slice(startIdx, endIdx),
      totalPages: Math.ceil(filteredUsers.length / itemsPerPage),
      startIndex: filteredUsers.length > 0 ? startIdx + 1 : 0,
      endIndex: endIdx
    };
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
  };

  const handleSaveUser = async (updates: Partial<Profile>) => {
    if (!editingUser) return;
    await onUpdateUser(editingUser.id, updates);
    setEditingUser(null);
  };

  const handleDeleteConfirmation = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    await onDeleteUser(deleteUserId);
    setDeleteUserId(null);
  };

  const editingUserWithProfile: UserWithProfile | null = editingUser ? {
      user: { id: editingUser.id } as User,
      profile: editingUser,
  } : null;

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">Manajemen Pengguna</h2>
          <p className="text-slate-400">Kelola akun dan peran pengguna</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert('Fitur ini belum diimplementasikan.')} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 border border-red-400/20"><UserPlusIcon className="w-5 h-5" />Tambah Pengguna</button>
        </div>
      </div>
      <div className="mb-8"><div className="relative"><MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari pengguna berdasarkan nama atau email..." className="w-full pl-16 pr-6 py-4 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-white rounded-2xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 placeholder-slate-400 text-lg" /></div></div>
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/60 backdrop-blur-sm">
              <tr>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Pengguna</th>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Peran</th>
                <th className="px-8 py-6 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Diperbarui</th>
                <th className="px-8 py-6 text-right text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/50">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="group hover:bg-slate-700/20 transition-all duration-200">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full bg-slate-700 flex-shrink-0">
                        {user.avatar_url ? (<Image src={user.avatar_url} alt={user.full_name || 'Avatar'} fill className="object-cover rounded-full" />) : (<div className="w-full h-full flex items-center justify-center rounded-full bg-red-500/20"><UserCircleIcon className="w-8 h-8 text-red-400" /></div>)}
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-red-300 transition-colors">{user.full_name || 'Tanpa Nama'}</p>
                        <p className="text-slate-400 text-sm mt-1">{user.email || 'Email tidak tersedia'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><RoleBadge role={user.role} /></td>
                  <td className="px-8 py-6 text-slate-400 text-sm">{new Date(user.updated_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditUser(user)} className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 border-slate-500/30 transition-all duration-200 flex items-center gap-1.5"><PencilIcon className="w-3.5 h-3.5" />Sunting</button>
                      <button onClick={() => handleDeleteConfirmation(user.id)} disabled={user.id === currentUserProfile?.user.id} className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"><TrashIcon className="w-3.5 h-3.5" />Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!paginatedUsers.length && !isDataLoading && (<tr><td colSpan={4} className="px-8 py-16 text-center"><div className="flex flex-col items-center"><div className="w-20 h-20 bg-slate-700/50 rounded-3xl flex items-center justify-center mb-6"><UsersIcon className="w-10 h-10 text-slate-500" /></div><h3 className="text-xl font-semibold text-slate-300 mb-2">Tidak ada pengguna ditemukan</h3><p className="text-slate-500 mb-6">{searchTerm ? 'Coba kata kunci lain atau bersihkan pencarian.' : 'Tidak ada pengguna dalam sistem.'}</p></div></td></tr>)}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 0 && (<div className="px-8 py-6 border-t border-slate-700/50"><PaginationControls currentPage={currentPage} totalPages={totalPages} totalItems={filteredUsers.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} startIndex={startIndex} endIndex={endIndex} /></div>)}
      </div>

      <Dialog.Root open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[90vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl z-50 flex flex-col">
            <Dialog.Title className="text-2xl font-bold text-white p-6 border-b border-slate-700/50 shrink-0">Sunting Profil Pengguna</Dialog.Title>
            <div className="flex-grow overflow-y-auto">
              {editingUserWithProfile && (
                <EditProfileForm
                  initialProfile={editingUserWithProfile}
                  onSave={handleSaveUser}
                  onCancel={() => setEditingUser(null)}
                  theme="dark"
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800/95 backdrop-blur-xl rounded-3xl p-8 z-50 border border-slate-700/50 shadow-2xl">
            <AlertDialog.Title className="text-2xl font-bold text-white mb-3">Hapus Pengguna</AlertDialog.Title>
            <AlertDialog.Description className="text-slate-400 mb-6 text-lg">Apakah Anda yakin? Profil pengguna ini akan dihapus. Pengguna masih perlu dihapus dari Auth di dasbor Supabase secara manual.</AlertDialog.Description>
            <div className="flex gap-3 justify-end">
              <AlertDialog.Cancel asChild><button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200">Batal</button></AlertDialog.Cancel>
              <AlertDialog.Action asChild><button onClick={confirmDeleteUser} className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-medium rounded-xl transition-all duration-200">Ya, Hapus Profil</button></AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}