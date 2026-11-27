"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import HandshakeLoader from "@/components/ui/HandshakeLoader";

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

  return (
    <AuthLayout
      titleId="admin-login-title"
      pageClassName="admin-login-page"
      panelClassName="admin-login-panel"
      backdrop={
        <div className="admin-icons-rail" aria-hidden="true">
          {/* Gently Curved Connecting Line */}
          <svg
            className="admin-rail-line"
            viewBox="0 0 100 320"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="adminRailCurveGrad" x1="0" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F2FFE0" stopOpacity="0" />
                <stop offset="16%" stopColor="#F2FFE0" stopOpacity="0.62" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.78" />
                <stop offset="84%" stopColor="#F2FFE0" stopOpacity="0.62" />
                <stop offset="100%" stopColor="#F2FFE0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 16 0 Q 100 160 16 320"
              stroke="url(#adminRailCurveGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* 1. Seedling Icon */}
          <div className="admin-bg-icon admin-bg-icon-1">
            <svg viewBox="0 0 64 64" fill="none">
              {/* Soil mound */}
              <path
                d="M17.5 46.5C17.5 42.6 23.8 40.4 32 40.4C40.2 40.4 46.5 42.6 46.5 46.5C46.5 48.7 44.2 49.5 32 49.5C19.8 49.5 17.5 48.7 17.5 46.5Z"
                fill="#FFFFFF"
              />
              {/* Center stem */}
              <rect x="30" y="26.5" width="4" height="16" rx="2" fill="#FFFFFF" />
              {/* Left leaf */}
              <path
                d="M31 32.5C22.2 33 15.2 27.6 14.5 19.8C22.8 19.1 29.4 24.2 31 32.5Z"
                fill="#FFFFFF"
              />
              <path
                d="M19 23.2C23.5 25.4 27.2 28.4 29.8 31.4"
                stroke="#0F5D2D"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Right leaf */}
              <path
                d="M33 31.2C34.6 22.8 41.2 17.8 49.5 18.5C48.8 26.2 41.8 31.6 33 31.2Z"
                fill="#FFFFFF"
              />
              <path
                d="M45 21.8C40.5 24 36.8 27 34.2 30"
                stroke="#0F5D2D"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 2. Tractor Icon */}
          <div className="admin-bg-icon admin-bg-icon-2">
            <svg viewBox="0 0 64 64" fill="none">
              {/* Cab, Hood & Exhaust Stack */}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.5 18.5C17.5 17.1 18.6 16 20 16H31.2C32.6 16 33.7 17.1 33.7 18.5V25.6H38V21.2H40.6C41.1 21.2 41.5 21.4 41.8 21.8L42.8 23.2H40.6V25.6H45.2C46.9 25.6 48.2 26.9 48.2 28.6V35.2H45.8C43.7 32.9 39.9 32.9 37.8 35.2H31C28.8 31.8 24.2 31 20.6 33.1C19.3 33.8 18.2 34.7 17.4 35.8H15.8V31.2H17.5V18.5ZM21 19.6V27.4H30.2V19.6H21Z"
                fill="#FFFFFF"
              />
              {/* Rear Wheel */}
              <circle cx="22.8" cy="40.5" r="7" stroke="#FFFFFF" strokeWidth="3.4" />
              <circle cx="22.8" cy="40.5" r="2.6" fill="#FFFFFF" />
              {/* Front Wheel */}
              <circle cx="41.8" cy="41.8" r="5.6" stroke="#FFFFFF" strokeWidth="3.1" />
              <circle cx="41.8" cy="41.8" r="2.2" fill="#FFFFFF" />
            </svg>
          </div>

          {/* 3. Wheat Icon */}
          <div className="admin-bg-icon admin-bg-icon-3">
            <svg viewBox="0 0 64 64" fill="none">
              {/* Top center grain */}
              <path
                d="M32 11C35.2 14.3 35.8 18.4 32 22C28.2 18.4 28.8 14.3 32 11Z"
                fill="#FFFFFF"
              />
              {/* Left grains (top, mid, bottom) */}
              <path d="M21.8 17.8C26.4 18.5 29.6 22.1 29.6 26.5C25.2 26.2 21.8 22.6 21.8 17.8Z" fill="#FFFFFF" />
              <path d="M21.8 26.2C26.4 26.9 29.6 30.5 29.6 34.9C25.2 34.6 21.8 31 21.8 26.2Z" fill="#FFFFFF" />
              <path d="M21.8 34.6C26.4 35.3 29.6 38.9 29.6 43.3C25.2 43 21.8 39.4 21.8 34.6Z" fill="#FFFFFF" />
              {/* Right grains (top, mid, bottom) */}
              <path d="M42.2 17.8C37.6 18.5 34.4 22.1 34.4 26.5C38.8 26.2 42.2 22.6 42.2 17.8Z" fill="#FFFFFF" />
              <path d="M42.2 26.2C37.6 26.9 34.4 30.5 34.4 34.9C38.8 34.6 42.2 31 42.2 26.2Z" fill="#FFFFFF" />
              <path d="M42.2 34.6C37.6 35.3 34.4 38.9 34.4 43.3C38.8 43 42.2 39.4 42.2 34.6Z" fill="#FFFFFF" />
              {/* Stalk stem */}
              <rect x="30.4" y="21" width="3.2" height="30.5" rx="1.6" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      }
      overlay={isLoading ? <HandshakeLoader /> : null}
    >
      {/* Header matching standard Login style */}
      <div className="login-header mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e0f8cf] text-[#104b2e] text-xs sm:text-sm font-bold uppercase mb-3">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          <span>Admin Access Portal</span>
        </div>
        <h1
          id="admin-login-title"
          className="text-2xl sm:text-3xl font-extrabold text-[#104b32] tracking-tight"
        >
          Admin Sign In
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-xl bg-red-50/95 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold"
        >
          {error}
        </div>
      )}

      {/* Admin Login Form styled consistently with normal Login */}
      <form onSubmit={handleLogin} className="login-form space-y-4">
        {/* Admin Work Email */}
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5"
          >
            Admin Work Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="login-field-icon text-[#104b32]/75"
            />
            <input
              id="admin-email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ulavansanthai.in"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#d5ddeb] focus:outline-none focus:ring-2 focus:ring-[#174B35] focus:border-transparent text-gray-900 text-sm transition-all"
              required
            />
          </div>
        </div>

        {/* Access Key / Password */}
        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5"
          >
            Access Key / Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="login-field-icon text-[#104b32]/75"
            />
            <input
              id="admin-password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-[#d5ddeb] focus:outline-none focus:ring-2 focus:ring-[#174B35] focus:border-transparent text-gray-900 text-sm transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3.5 flex items-center text-[#174B35] hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-[#174B35] rounded-r-xl cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Keep Session Active */}
        <div className="flex items-center pt-1">
          <input
            id="admin-remember-me"
            name="admin-remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-[#174B35] focus:ring-[#174B35] border-gray-300 rounded cursor-pointer accent-[#174B35]"
          />
          <label
            htmlFor="admin-remember-me"
            className="ml-2 block text-xs sm:text-sm text-gray-900 font-semibold cursor-pointer"
          >
            Keep session active
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="login-submit w-full min-h-14 px-5 rounded-xl bg-[#104b30] hover:bg-[#0b3c26] active:bg-[#092f1f] text-white font-bold transition-colors shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Authenticate &amp; Sign In</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
