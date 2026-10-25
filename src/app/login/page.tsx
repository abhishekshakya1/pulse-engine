"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Lock,
  Eye,
  EyeOff, Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/authActions";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  const notifiedRef = React.useRef(false);
  const status = searchParams.get("status");

  useEffect(() => {
    if (status === "logged_out" && !notifiedRef.current) {
      notifiedRef.current = true;
      setLoggedOutNotice(true);
      toast.info("Signed Out", "You have been safely signed out of your account.");
    }
  }, [status, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (res.success) {
        setIsSuccess(true);
        toast.success("Welcome back!", "Signed in successfully. Launching your dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        const errMsg = res.error?.message || "Invalid email or password.";
        setError(errMsg);
        toast.error("Sign In Failed", errMsg);
        setLoading(false);
      }
    } catch (err: any) {
      const errMsg = "An unexpected error occurred during login.";
      setError(errMsg);
      toast.error("Error", errMsg);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">PulseEngine</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Sign in to access your telemetry streams and AI SRE Copilot.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-[#101216] border border-zinc-200 dark:border-[#1F232B] rounded-2xl p-6 sm:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none transition-colors">
        
        {/* Logged Out Banner */}
        {loggedOutNotice && !error && (
          <div className="mb-5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>You have been safely signed out. See you next time!</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>Authenticated successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-mono">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="email"
                required
                disabled={loading || isSuccess}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pulseengine.dev"
                className="w-full pl-9.5 pr-3 py-2 bg-zinc-50 dark:bg-[#090A0D] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="password"
                required
                disabled={loading || isSuccess}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9.5 pr-3 py-2 bg-zinc-50 dark:bg-[#090A0D] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSuccess}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-medium text-xs font-mono flex items-center justify-center gap-2 shadow-lg transition cursor-pointer disabled:opacity-60 ${
              isSuccess
                ? "bg-emerald-600 shadow-emerald-600/25"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25"
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Redirecting to Dashboard...</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-white dark:bg-[#101216] px-2 text-zinc-400">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <a
          href="/api/auth/google"
          className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#090A0D] hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-medium text-xs flex items-center justify-center gap-2.5 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.94H1.27v3.13C3.25 21.36 7.34 24 12 24z"/>
            <path fill="#FBBC05" d="M5.33 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.61H1.27C.46 8.23 0 10.06 0 12s.46 3.77 1.27 5.39l4.06-3.13z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.27 6.61l4.06 3.13c.94-2.84 3.57-4.99 6.67-4.99z"/>
          </svg>
          Sign in with Google
        </a>

        {/* Switch to Register */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          Don't have an organization yet?{" "}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-zinc-50 dark:bg-[#08090A] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="text-xs text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
