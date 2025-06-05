import React, { useState, useEffect } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forgot Password Modal States
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
        setError(`Login failed: ${error.message}`);
      } else if (data.user) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.replace('/admin');
        }, 1000);
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Unexpected login error:', authError);
      setError(`An unexpected error occurred: ${authError.message}`);
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
        setResetError(`Error: ${error.message}`);
      } else {
        setResetSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => {
          setForgotPasswordOpen(false);
          setForgotEmail('');
          setResetSuccess('');
        }, 2000);
      }
    } catch (error) {
      const authError = error as AuthError;
      setResetError(`Unexpected error: ${authError.message}`);
    } finally {
      setIsSendingReset(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 animate-gradient-x">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-700 border-t-red-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheckIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Verifying Authentication</h1>
            <p className="text-slate-400">Please wait while we check your session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-animated relative overflow-hidden">
      {/* Dynamic Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent animate-pulse"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-bounce-slow"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-slate-400 text-sm">
                Sign in to access your admin dashboard
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
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

          {/* Login Form */}
          <Form.Root onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <Form.Field name="email" className="space-y-3">
              <Form.Label className="block text-sm font-semibold text-red-400">
                Email Address
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
                Email address is required
              </Form.Message>
              <Form.Message match="typeMismatch" className="text-red-400 text-sm flex items-center gap-1">
                <XMarkIcon className="w-4 h-4" />
                Please enter a valid email address
              </Form.Message>
            </Form.Field>

            {/* Password Field */}
            <Form.Field name="password" className="space-y-3">
              <Form.Label className="block text-sm font-semibold text-red-400">
                Password
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
                Password is required
              </Form.Message>
            </Form.Field>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <Form.Submit asChild>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </Form.Submit>
          </Form.Root>

          <Separator.Root className="bg-gray-700/50 h-px" />

          {/* Footer */}
          <div className="text-center text-sm text-gray-400">
            <p>Protected by enterprise-grade security</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog.Root open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50" />
          <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl shadow-black/50 p-8 duration-300">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <Dialog.Title className="text-2xl font-bold text-white">
                  Reset Password
                </Dialog.Title>
                <Dialog.Description className="text-gray-400 text-sm">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Dialog.Description>
              </div>

              {/* Error/Success Messages for Reset */}
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

              {/* Reset Form */}
              <Form.Root onSubmit={handleForgotPassword} className="space-y-4">
                <Form.Field name="reset-email" className="space-y-2">
                  <Form.Label className="block text-sm font-semibold text-blue-400">
                    Email Address
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
                        placeholder="Enter your email address"
                      />
                    </Form.Control>
                  </div>
                  <Form.Message match="valueMissing" className="text-red-400 text-sm">
                    Email address is required
                  </Form.Message>
                  <Form.Message match="typeMismatch" className="text-red-400 text-sm">
                    Please enter a valid email address
                  </Form.Message>
                </Form.Field>

                <div className="flex gap-3 pt-2">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                    >
                      Cancel
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
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
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
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(1deg);
          }
          66% {
            transform: translateY(10px) rotate(-1deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(15px) rotate(-1deg);
          }
          66% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        .bg-gradient-animated {
          background: linear-gradient(-45deg,
          #0f172a, #1e293b, #374151, #111827,
          #1f2937, #0f172a, #312e81, #1e1b4b);
          background-size: 400% 400%;
          animation: gradient-x 15s ease infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}