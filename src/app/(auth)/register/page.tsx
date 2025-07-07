'use client';

import React, { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import * as Form from '@radix-ui/react-form';
import {
  XMarkIcon, UserIcon, EnvelopeIcon, LockClosedIcon,
  ExclamationTriangleIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

const MemoizedLogo = memo(function MemoizedLogo({ src, alt, height, width, className }: { src: string; alt: string; height: number; width: number; className?: string; }) {
  return <Image src={src} alt={alt} height={height} width={width} className={className} />;
});

const AlertMessage = ({ type, message }: { type: 'idle' | 'success' | 'error'; message: string; }) => {
  if (!message) return null;
  const isError = type === 'error';
  const Icon = isError ? ExclamationTriangleIcon : CheckCircleIcon;
  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 ${isError ? 'bg-red-900/50 border-red-500/50 text-red-300' : 'bg-green-900/50 border-green-500/50 text-green-300'}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isError ? 'text-red-400' : 'text-green-400'}`} />
      <div className="text-sm leading-relaxed">{message}</div>
    </div>
  );
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const handleRegister = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) { setStatus({ type: 'error', message: 'Kata sandi tidak cocok.' }); return; }
    setIsSubmitting(true); setStatus({ type: 'idle', message: '' });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password: password, options: { data: { full_name: fullName.trim() } }
      });
      if (error) { setStatus({ type: 'error', message: `Gagal mendaftar: ${error.message}` });
      } else if (data.user?.identities?.length === 0) {
        setStatus({ type: 'error', message: 'Gagal mendaftar: Pengguna dengan email ini sudah ada.' });
      } else if (data.user) {
        setStatus({ type: 'success', message: 'Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.' });
        setFullName(''); setEmail(''); setPassword(''); setConfirmPassword('');
      }
    } catch (err) { setStatus({ type: 'error', message: `Terjadi kesalahan: ${(err as Error).message}` });
    } finally { setIsSubmitting(false); }
  }, [email, password, fullName, confirmPassword]);

  return (
    <div className="relative w-full max-w-md z-10">
      <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 space-y-6">
        <div className="text-center space-y-4">
          <MemoizedLogo src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={96} height={96} className="w-24 h-auto mx-auto" />
          <div className="space-y-2"><h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">Buat Akun Baru</h1><p className="text-slate-400 text-sm">Bergabunglah bersama kami</p></div>
        </div>
        <AlertMessage type={status.type} message={status.message} />
        <Form.Root onSubmit={handleRegister} className="space-y-6">
          <Form.Field name="fullName" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Nama Lengkap</Form.Label><div className="relative"><UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300" placeholder="Nama Anda" /></Form.Control></div><Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Nama lengkap wajib diisi</Form.Message></Form.Field>
          <Form.Field name="email" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Alamat Email</Form.Label><div className="relative"><EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300" placeholder="anda@example.com" /></Form.Control></div><Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Alamat email wajib diisi</Form.Message><Form.Message match="typeMismatch" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Email tidak valid</Form.Message></Form.Field>
          <Form.Field name="password" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Kata Sandi</Form.Label><div className="relative"><LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300" placeholder="••••••••••••" /></Form.Control></div><Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Kata sandi wajib diisi</Form.Message><Form.Message match="tooShort" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Kata sandi minimal 6 karakter</Form.Message></Form.Field>
          <Form.Field name="confirmPassword" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Konfirmasi Kata Sandi</Form.Label><div className="relative"><LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300" placeholder="••••••••••••" /></Form.Control></div><Form.Message match={(value) => value !== password} className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Kata sandi tidak cocok</Form.Message></Form.Field>
          <Form.Submit asChild><button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]">{isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Mendaftar...</span></>) : "Daftar"}</button></Form.Submit>
        </Form.Root>
        <div className="text-center text-sm text-gray-400"><p>Sudah punya akun? <Link href="/login" className="font-medium text-red-400 hover:text-red-300 hover:underline">Masuk di sini</Link></p></div>
      </div>
    </div>
  );
}