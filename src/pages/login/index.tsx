import React, { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, sendPasswordResetEmail, auth } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailFocused, setResetEmailFocused] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const session = result.session;
      document.cookie = `supabase-auth-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      await router.push("/admin");
    } catch (caughtError: unknown) {
      console.error("Login error:", caughtError);
      let messageToShow = "An unexpected error occurred. Please try again.";
      if (caughtError instanceof AuthError) {
        switch (caughtError.message) {
          case "Invalid login credentials":
            messageToShow = "Invalid email or password.";
            break;
          case "Email not confirmed":
            messageToShow = "Please confirm your email address before logging in.";
            break;
          case "Invalid email":
            messageToShow = "Invalid email address.";
            break;
          case "User is disabled":
            messageToShow = "This account has been disabled.";
            break;
          case "Rate limit exceeded":
            messageToShow = "Too many failed attempts. Please try again later.";
            break;
          default:
            messageToShow = caughtError.message || "Failed to login. Please check your credentials.";
        }
      } else if (caughtError instanceof Error) {
         messageToShow = caughtError.message || "Failed to login. Please check your credentials.";
      }
      setError(messageToShow);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setSuccess("");
      }, 3000);
    } catch (caughtError: unknown) {
      console.error("Reset password error:", caughtError);
      let messageToShow = "An unexpected error occurred. Please try again.";
      if (caughtError instanceof AuthError) {
        switch (caughtError.message) {
          case "Email not found":
            messageToShow = "No user found with this email address.";
            break;
          case "Invalid email":
            messageToShow = "Invalid email address.";
            break;
          case "Rate limit exceeded":
            messageToShow = "Too many reset attempts. Please try again later.";
            break;
          default:
            messageToShow = caughtError.message || "Failed to send reset email. Please try again.";
        }
      } else if (caughtError instanceof Error) {
         messageToShow = caughtError.message || "Failed to send reset email. Please try again.";
      }
      setError(messageToShow);
    } finally {
      setResetLoading(false);
    }
  };

  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail(email);
    setError("");
    setSuccess("");
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-600/5 to-violet-600/5 rounded-full blur-3xl animate-spin slow-spin"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="grid-pattern"></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/30 p-8 w-full max-w-md transform transition-all duration-300 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Reset Password
              </h2>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:rotate-90 transform"
                disabled={resetLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl transform transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-300 text-sm font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl transform transition-all duration-300 animate-shake backdrop-blur-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-300 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              {/* Reset Email Field */}
              <div className="relative group">
                <div className="relative">
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onFocus={() => setResetEmailFocused(true)}
                    onBlur={() => setResetEmailFocused(false)}
                    className="peer w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl focus:border-blue-500 focus:bg-gray-800/70 transition-all duration-300 outline-none placeholder-transparent text-white backdrop-blur-sm hover:border-gray-500/60"
                    placeholder="Email"
                    required
                    disabled={resetLoading}
                    autoComplete="email"
                  />
                  <label
                    htmlFor="reset-email"
                    className={`absolute left-4 transition-all duration-300 pointer-events-none
                      ${(resetEmailFocused || resetEmail)
                        ? '-top-2 text-xs bg-gray-900 px-2 text-blue-400 font-medium'
                        : 'top-4 text-gray-400'
                      }
                    `}
                  >
                    Email Address
                  </label>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 transform scale-x-0 peer-focus:scale-x-100 transition-transform duration-300 rounded-full"></div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                type="submit"
                disabled={resetLoading || !resetEmail}
                className="group relative w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 overflow-hidden backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="relative flex items-center justify-center">
                  {resetLoading ? (
                    <>
                      <div className="relative">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <span className="loading-dots">Sending Reset Email</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Email</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-700/30 p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] hover:border-gray-600/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4 shadow-lg transform transition-transform duration-300 hover:rotate-12 hover:shadow-blue-500/25">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to your admin account</p>
          </div>

          {/* Error Message */}
          {error && !showForgotPassword && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl transform transition-all duration-300 animate-shake backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-300 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="relative group">
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="peer w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl focus:border-blue-500 focus:bg-gray-800/70 transition-all duration-300 outline-none placeholder-transparent text-white backdrop-blur-sm hover:border-gray-500/60"
                  placeholder="Email"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 transition-all duration-300 pointer-events-none
                    ${(emailFocused || email)
                      ? '-top-2 text-xs bg-gray-900 px-2 text-blue-400 font-medium'
                      : 'top-4 text-gray-400'
                    }
                    peer-autofill:-top-2 peer-autofill:text-xs peer-autofill:bg-gray-900 peer-autofill:px-2 peer-autofill:text-blue-400 peer-autofill:font-medium
                  `}
                >
                  Email Address
                </label>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 transform scale-x-0 peer-focus:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="peer w-full px-4 py-4 pr-12 bg-gray-800/50 border border-gray-600/50 rounded-2xl focus:border-blue-500 focus:bg-gray-800/70 transition-all duration-300 outline-none placeholder-transparent text-white backdrop-blur-sm hover:border-gray-500/60"
                  placeholder="Password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-4 transition-all duration-300 pointer-events-none
                    ${(passwordFocused || password)
                      ? '-top-2 text-xs bg-gray-900 px-2 text-blue-400 font-medium'
                      : 'top-4 text-gray-400'
                    }
                    peer-autofill:-top-2 peer-autofill:text-xs peer-autofill:bg-gray-900 peer-autofill:px-2 peer-autofill:text-blue-400 peer-autofill:font-medium
                  `}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-300 transition-colors duration-200 hover:scale-110 transform"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M20.5 20.5l-12-12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 transform scale-x-0 peer-focus:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openForgotPassword}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 overflow-hidden backdrop-blur-sm"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <div className="relative flex items-center justify-center">
                {loading ? (
                  <>
                    <div className="relative">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span className="loading-dots">Signing In</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm flex items-center justify-center">
              <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure admin access powered by Supabase
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -z-10 top-4 left-4 w-8 h-8 bg-blue-500/20 rounded-full blur-sm animate-bounce delay-300"></div>
        <div className="absolute -z-10 bottom-4 right-4 w-6 h-6 bg-violet-500/20 rounded-full blur-sm animate-bounce delay-700"></div>
        <div className="absolute -z-10 top-1/2 -left-8 w-4 h-4 bg-emerald-500/20 rounded-full blur-sm animate-bounce delay-1000"></div>
      </div>

      <style jsx>{`

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(20px, 20px);
          }
        }

        @keyframes dots {
          0%, 20% {
            content: '';
          }
          40% {
            content: '.';
          }
          60% {
            content: '..';
          }
          80%, 100% {
            content: '...';
          }
        }

        /* Custom scrollbar for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Material You inspired ripple effect */
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

      `}</style>
    </div>
  );
}



