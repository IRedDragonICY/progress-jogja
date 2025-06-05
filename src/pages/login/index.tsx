import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import * as Form from '@radix-ui/react-form';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import {
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface AuthError {
  message: string;
}

const LogoPatternBackground = () => {
  const logos = Array(20).fill(0);
  const rows = Array(10).fill(0);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.03]">
      <div className="absolute top-0 left-0 flex h-full w-full flex-col items-start justify-start gap-8">
        {rows.map((_, rowIndex) => {
          const isLeftScroll = rowIndex % 2 === 0;
          const animationClass = isLeftScroll ? 'animate-scroll-left' : 'animate-scroll-right';
          const animationDuration = isLeftScroll ? '180s' : '190s';

          return (
            <div key={rowIndex} className="relative flex w-full flex-nowrap">
              <div
                className={`flex flex-shrink-0 flex-nowrap items-center justify-around gap-8 ${animationClass}`}
                style={{ animationDuration }}
              >
                {logos.map((_, logoIndex) => (
                  <Image key={`a-${logoIndex}`} src="/progressjogja-logo.webp" alt="Progress Jogja Background Logo" height={40} width={170} className="h-10 w-auto max-w-none flex-shrink-0" />
                ))}
              </div>
              <div
                className={`flex flex-shrink-0 flex-nowrap items-center justify-around gap-8 ${animationClass}`}
                style={{ animationDuration }}
              >
                {logos.map((_, logoIndex) => (
                  <Image key={`b-${logoIndex}`} src="/progressjogja-logo.webp" alt="Progress Jogja Background Logo" height={40} width={170} className="h-10 w-auto max-w-none flex-shrink-0" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          router.replace('/admin').catch(console.error);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error('Error checking auth session:', e);
        setLoading(false);
      }
    };

    checkAuth().catch(console.error);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
           router.replace('/admin').catch(console.error);
        } else {
           setLoading(false);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        setError(`Gagal masuk: ${error.message}`);
      } else if (data.user) {
        setSuccess('Berhasil masuk! Mengalihkan...');
        setTimeout(() => {
          router.replace('/admin');
        }, 1000);
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Unexpected login error:', authError);
      setError(`Terjadi kesalahan yang tidak terduga: ${authError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    setResetError('');
    setResetSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setResetError(`Kesalahan: ${error.message}`);
      } else {
        setResetSuccess('Email pengaturan ulang kata sandi telah terkirim! Periksa kotak masuk Anda.');
        setTimeout(() => {
          setForgotPasswordOpen(false);
          setForgotEmail('');
          setResetSuccess('');
        }, 2000);
      }
    } catch (error) {
      const authError = error as AuthError;
      setResetError(`Kesalahan tak terduga: ${authError.message}`);
    } finally {
      setIsSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
             <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={80} height={80} className="animate-pulse" priority />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Memverifikasi Autentikasi</h1>
            <p className="text-slate-400">Harap tunggu, kami sedang memeriksa sesi Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 relative overflow-hidden">
      <LogoPatternBackground />
      <div className="relative w-full max-w-md z-10">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 space-y-8">
          <div className="text-center space-y-4">
            <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={96} height={96} className="w-24 h-auto mx-auto mb-4" priority />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                Selamat Datang Kembali
              </h1>
              <p className="text-slate-400 text-sm">
                Masuk untuk mengakses dasbor admin Anda
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-red-300 text-sm leading-relaxed">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-green-300 text-sm leading-relaxed">{success}</div>
            </div>
          )}

          <Form.Root onSubmit={handleLogin} className="space-y-6">
            <Form.Field name="email" className="space-y-3">
              <Form.Label className="block text-sm font-semibold text-red-400">
                Alamat Email
              </Form.Label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Form.Control asChild>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                    placeholder="admin@example.com"
                  />
                </Form.Control>
              </div>
              <Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Alamat email wajib diisi
              </Form.Message>
              <Form.Message match="typeMismatch" className="text-red-400 text-sm flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Harap masukkan alamat email yang valid
              </Form.Message>
            </Form.Field>

            <Form.Field name="password" className="space-y-3">
              <Form.Label className="block text-sm font-semibold text-red-400">
                Kata Sandi
              </Form.Label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Form.Control asChild>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-800/60 border border-gray-600/50 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-300 hover:border-gray-500/70"
                    placeholder="••••••••••••"
                  />
                </Form.Control>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <Form.Message match="valueMissing" className="text-red-400 text-sm flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Kata sandi wajib diisi
              </Form.Message>
            </Form.Field>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
              >
                Lupa kata sandi Anda?
              </button>
            </div>

            <Form.Submit asChild>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Masuk...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </Form.Submit>
          </Form.Root>

          <Separator.Root className="bg-gray-700/50 h-px" />

          <div className="text-center text-sm text-gray-400">
            <p>Dilindungi oleh keamanan tingkat perusahaan</p>
          </div>
        </div>
      </div>

      <Dialog.Root open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/50 p-8 duration-300">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <Dialog.Title className="text-2xl font-bold text-white">
                  Atur Ulang Kata Sandi
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 text-sm">
                  Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </Dialog.Description>
              </div>

              {resetError && (
                <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-red-300 text-sm leading-relaxed">{resetError}</div>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-green-900/50 border border-green-500/50 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-green-300 text-sm leading-relaxed">{resetSuccess}</div>
                </div>
              )}

              <Form.Root onSubmit={handleForgotPassword} className="space-y-4">
                <Form.Field name="reset-email" className="space-y-2">
                  <Form.Label className="block text-sm font-semibold text-blue-400">
                    Alamat Email
                  </Form.Label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Form.Control asChild>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="w-full bg-gray-800/60 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                        placeholder="Masukkan alamat email Anda"
                      />
                    </Form.Control>
                  </div>
                  <Form.Message match="valueMissing" className="text-red-400 text-sm">
                    Alamat email wajib diisi
                  </Form.Message>
                  <Form.Message match="typeMismatch" className="text-red-400 text-sm">
                    Harap masukkan alamat email yang valid
                  </Form.Message>
                </Form.Field>

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Batal
                    </button>
                  </Dialog.Close>
                  <Form.Submit asChild>
                    <button
                      type="submit"
                      disabled={isSendingReset}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSendingReset ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        'Kirim Tautan Reset'
                      )}
                    </button>
                  </Form.Submit>
                </div>
              </Form.Root>
            </div>

            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <style jsx global>{`
        @keyframes scroll-left {
          from { transform: translateX(0%); }
          to { transform: translateX(-100%); }
        }

        @keyframes scroll-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
        
        .animate-scroll-left {
          animation-name: scroll-left;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .animate-scroll-right {
          animation-name: scroll-right;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}