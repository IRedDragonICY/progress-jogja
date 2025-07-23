'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import * as Form from '@radix-ui/react-form';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import {
  XMarkIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon,
  ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AlertMessage = ({ type, message }: { type: 'success' | 'error'; message: string; }) => {
  if (!message) return null;
  const isError = type === 'error';
  const Icon = isError ? ExclamationTriangleIcon : CheckCircleIcon;
  const baseClasses = 'border rounded-xl p-4 flex items-start gap-3';
  const colorClasses = isError ? 'bg-red-900/50 border-red-500/50 text-red-300' : 'bg-green-900/50 border-green-500/50 text-green-300';
  const iconColor = isError ? 'text-red-400' : 'text-green-400';
  return (<div className={`${baseClasses} ${colorClasses}`}><Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} /><div className="text-sm leading-relaxed">{message}</div></div>);
};

const LoadingSkeleton = () => (
  <div className="relative w-full max-w-md z-10">
    <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8">
      <div className="flex items-center justify-center space-x-2">
        <ArrowPathIcon className="w-5 h-5 text-red-400 animate-spin" />
        <span className="text-white">Memverifikasi sesi...</span>
      </div>
    </div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const redirectTo = searchParams.get('redirect_to') || '/';
        router.replace(redirectTo);
      } else {
        setIsCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    if (message) {
      setStatus({ type: error ? 'error' : 'success', message });
    }
  }, [searchParams]);

  const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      let errorMessage = 'Gagal masuk. Silakan periksa kredensial Anda.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau kata sandi salah.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email belum dikonfirmasi. Silakan periksa email Anda.';
      } else {
        errorMessage = error.message;
      }
      setStatus({ type: 'error', message: errorMessage });
      setIsSubmitting(false);
    }
  }, [email, password]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetStatus({ type: null, message: '' });
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) {
      setResetStatus({ type: 'error', message: `Kesalahan: ${error.message}` });
    } else {
      setResetStatus({ type: 'success', message: 'Email pengaturan ulang kata sandi terkirim!' });
      setTimeout(() => { setForgotPasswordOpen(false); setForgotEmail(''); setResetStatus({ type: null, message: '' }); }, 2000);
    }
    setIsSendingReset(false);
  }, [forgotEmail]);

  if (isCheckingSession) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative w-full max-w-md z-10">
      <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 space-y-8">
        <div className="text-center space-y-4">
          <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={96} height={96} className="w-24 h-auto mx-auto" priority />
          <div className="space-y-2"><h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">Selamat Datang Kembali</h1><p className="text-slate-400 text-sm">Masuk untuk mengakses dasbor Anda</p></div>
        </div>
        {status.type && <AlertMessage type={status.type} message={status.message} />}
        <Form.Root onSubmit={handleLogin} className="space-y-6">
          <Form.Field name="email" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Alamat Email</Form.Label><div className="relative"><EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70" placeholder="admin@example.com" /></Form.Control></div><Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Alamat email wajib diisi</Form.Message><Form.Message match="typeMismatch" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Harap masukkan alamat email yang valid</Form.Message></Form.Field>
          <Form.Field name="password" className="space-y-3"><Form.Label className="block text-sm font-semibold text-red-400">Kata Sandi</Form.Label><div className="relative"><LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70" placeholder="••••••••••••" /></Form.Control><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</button></div><Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1"><XMarkIcon className="w-4 h-4" />Kata sandi wajib diisi</Form.Message></Form.Field>
          <div className="flex justify-end"><button type="button" onClick={() => setForgotPasswordOpen(true)} className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium hover:underline">Lupa kata sandi?</button></div>
          <Form.Submit asChild><button type="submit" disabled={isSubmitting} className="w-full px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]">{isSubmitting ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Masuk...</span></>) : (<><ShieldCheckIcon className="w-5 h-5" /><span>Masuk</span></>)}</button></Form.Submit>
        </Form.Root>
        <Separator.Root className="bg-gray-700/50 h-px" />
        <div className="text-center text-sm text-gray-400"><p>Belum punya akun? <Link href="/register" className="font-medium text-red-400 hover:text-red-300 hover:underline">Daftar di sini</Link></p></div>
      </div>
      <Dialog.Root open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}><Dialog.Portal><Dialog.Overlay className="bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" /><Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/50 p-8 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"><div className="space-y-6"><div className="text-center space-y-3"><div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center"><EnvelopeIcon className="w-6 h-6 text-white" /></div><Dialog.Title className="text-2xl font-bold text-white">Atur Ulang Kata Sandi</Dialog.Title><Dialog.Description className="text-gray-400 text-sm">Masukkan email Anda untuk menerima tautan atur ulang.</Dialog.Description></div>{resetStatus.type && <AlertMessage type={resetStatus.type} message={resetStatus.message} />}<Form.Root onSubmit={handleForgotPassword} className="space-y-4"><Form.Field name="reset-email" className="space-y-2"><Form.Label className="block text-sm font-semibold text-blue-400">Alamat Email</Form.Label><div className="relative"><EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><Form.Control asChild><input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300" placeholder="Masukkan alamat email Anda" /></Form.Control></div><Form.Message match="valueMissing" className="text-red-400 text-sm">Alamat email wajib diisi</Form.Message><Form.Message match="typeMismatch" className="text-red-400 text-sm">Email tidak valid</Form.Message></Form.Field><div className="flex gap-3 pt-2"><Dialog.Close asChild><button type="button" className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200">Batal</button></Dialog.Close><Form.Submit asChild><button type="submit" disabled={isSendingReset} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSendingReset ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Mengirim...</>) : ('Kirim Tautan')}</button></Form.Submit></div></Form.Root></div><Dialog.Close asChild><button className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"><XMarkIcon className="w-5 h-5" /></button></Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
    </div>
  );
}