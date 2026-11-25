"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ulavansanthai.in");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please enter your admin email and access key.");
      return;
    }

    setIsLoading(true);

    try {
      // Send credentials directly to Express backend via /api/v1/admin/login
      const res = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || data.success === false) {
        setIsLoading(false);
        setError(
          data?.message ||
          data?.error ||
          "Authentication failed. Please verify your administrator credentials."
        );
        return;
      }

      // Store authentic admin data returned by backend
      if (typeof window !== "undefined") {
        const adminSession = data.user || data.data || {
          email: cleanEmail,
          role: "Administrator",
          title: "Super Admin Control",
          lastLogin: new Date().toISOString(),
        };
        const token = data.token || data.accessToken || "";

        sessionStorage.setItem("ulavan_admin_user", JSON.stringify(adminSession));
        if (token) {
          sessionStorage.setItem("ulavan_admin_token", token);
        }

        if (rememberMe) {
          localStorage.setItem("ulavan_admin_user", JSON.stringify(adminSession));
          if (token) {
            localStorage.setItem("ulavan_admin_token", token);
          }
        }
      }

      setIsLoading(false);
      router.push("/admin");
    } catch (err) {
      console.error("Admin login network error:", err);
      setIsLoading(false);
      setError("Unable to connect to the backend server. Please verify the backend service is running.");
    }
  };

  const handleQuickDemoFill = () => {
    setEmail("admin@ulavansanthai.in");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#102B1E] via-[#174B35] to-[#0A1F15] flex flex-col justify-center items-center p-4 selection:bg-[#E8F0E3] selection:text-[#174B35]">
      {/* Top Brand Logo */}
      <div className="mb-6 text-center space-y-2">
        <Link href="/" className="inline-block">
          <div className="bg-white/95 px-5 py-2.5 rounded-2xl shadow-lg border border-white/20 inline-flex items-center gap-2">
            <Image
              src="/images/ulavan-mart-animated.gif"
              alt="Ulavan Santhai"
              width={719}
              height={234}
              unoptimized
              priority
              className="w-36 h-auto object-contain"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#174B35] bg-[#E8F0E3] px-2 py-0.5 rounded-md border border-[#729B59]/40">
              Admin
            </span>
          </div>
        </Link>
        <p className="text-xs text-emerald-100/80 font-medium">
          Central Governance &amp; Producer Verification Desk
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

        <div className="p-7 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#174B35]" />
              <span>Restricted Access Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Sign In to Admin Workspace
            </h2>
            <p className="text-xs text-gray-500">
              Enter authorized administrator credentials to manage direct agricultural trade.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ulavansanthai.in"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                  Access Key / Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-[10px] font-bold text-[#174B35] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Demo Fill</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#174B35] focus:ring-[#174B35] cursor-pointer"
                />
                <span className="text-gray-600 font-medium">Keep session active</span>
              </label>

              <Link href="/admin/register" className="text-[#174B35] font-bold hover:underline">
                Register New Staff
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate &amp; Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-4 bg-gray-50/80 border-t border-gray-100 text-center text-[11px] text-gray-500">
          Ulavan Santhai &bull; Direct Farm-to-Buyer Administrative Console
        </div>
      </div>
    </div>
  );
}
