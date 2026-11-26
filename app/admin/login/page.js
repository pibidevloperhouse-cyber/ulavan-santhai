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
          {/* 1. Seedling Icon */}
          <div className="admin-bg-icon admin-bg-icon-1">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="29.5" stroke="#DCEEC1" strokeOpacity="0.88" strokeWidth="1.75" />
              {/* Soil mound */}
              <path
                d="M20.5 45.2C20.5 42.4 25.5 40.6 32 40.6C38.5 40.6 43.5 42.4 43.5 45.2C43.5 46.8 41.5 47.6 32 47.6C22.5 47.6 20.5 46.8 20.5 45.2Z"
                fill="#ECFAD0"
              />
              {/* Center stem */}
              <rect x="30.6" y="28.5" width="2.8" height="13.5" rx="1.4" fill="#ECFAD0" />
              {/* Left leaf */}
              <path
                d="M31.3 32.5C24.2 32.8 18.2 28.4 17.5 21.8C24.2 21.2 29.8 25.4 31.3 32.5Z"
                fill="#ECFAD0"
              />
              <path
                d="M21.2 24.4C24.8 26.2 28 28.7 30.2 31.4"
                stroke="#145E30"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Right leaf */}
              <path
                d="M32.7 31.6C34.2 24.5 39.8 20.3 46.5 20.9C45.8 27.5 39.8 31.9 32.7 31.6Z"
                fill="#ECFAD0"
              />
              <path
                d="M42.8 23.6C39.2 25.4 36 27.9 33.8 30.6"
                stroke="#145E30"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 2. Tractor Icon */}
          <div className="admin-bg-icon admin-bg-icon-2">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="29.5" stroke="#DCEEC1" strokeOpacity="0.88" strokeWidth="1.75" />
              {/* Cab & Hood Body */}
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 20.5C20 19.4 20.9 18.5 22 18.5H31.2C32.3 18.5 33.2 19.4 33.2 20.5V27H37.2V23.2H39.4C39.8 23.2 40.2 23.4 40.4 23.8L41.2 24.8H39.2V27H43.5C44.9 27 46 28.1 46 29.5V35.2H43.5C41.8 33.4 39 33.4 37.3 35.2H30.8C29 32.5 25.2 31.9 22.1 33.6C21.1 34.1 20.2 34.8 19.6 35.6H18.5V31.5H20V20.5ZM23 21.8V28.4H30.2V21.8H23Z"
                fill="#ECFAD0"
              />
              {/* Rear Wheel */}
              <circle cx="24.2" cy="39.8" r="6.4" stroke="#ECFAD0" strokeWidth="2.8" />
              <circle cx="24.2" cy="39.8" r="2.2" fill="#ECFAD0" />
              {/* Front Wheel */}
              <circle cx="40.4" cy="40.6" r="5.4" stroke="#ECFAD0" strokeWidth="2.6" />
              <circle cx="40.4" cy="40.6" r="1.9" fill="#ECFAD0" />
            </svg>
          </div>

          {/* 3. Wheat Icon */}
          <div className="admin-bg-icon admin-bg-icon-3">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="29.5" stroke="#DCEEC1" strokeOpacity="0.88" strokeWidth="1.75" />
              {/* Top center grain */}
              <path
                d="M32 13.5C34.3 16 34.8 19.2 32 22C29.2 19.2 29.7 16 32 13.5Z"
                fill="#ECFAD0"
              />
              {/* Left grains (top, mid, bottom) */}
              <path d="M23.5 19.5C27.2 20.2 29.8 23.2 29.8 26.8C26.2 26.5 23.5 23.5 23.5 19.5Z" fill="#ECFAD0" />
              <path d="M23.5 27C27.2 27.7 29.8 30.7 29.8 34.3C26.2 34 23.5 31 23.5 27Z" fill="#ECFAD0" />
              <path d="M23.5 34.5C27.2 35.2 29.8 38.2 29.8 41.8C26.2 41.5 23.5 38.5 23.5 34.5Z" fill="#ECFAD0" />
              {/* Right grains (top, mid, bottom) */}
              <path d="M40.5 19.5C36.8 20.2 34.2 23.2 34.2 26.8C37.8 26.5 40.5 23.5 40.5 19.5Z" fill="#ECFAD0" />
              <path d="M40.5 27C36.8 27.7 34.2 30.7 34.2 34.3C37.8 34 40.5 31 40.5 27Z" fill="#ECFAD0" />
              <path d="M40.5 34.5C36.8 35.2 34.2 38.2 34.2 41.8C37.8 41.5 40.5 38.5 40.5 34.5Z" fill="#ECFAD0" />
              {/* Stalk stem */}
              <rect x="30.8" y="21.5" width="2.4" height="27.5" rx="1.2" fill="#ECFAD0" />
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
