"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, User, Mail, Lock, KeyRound, Building2, CheckCircle2, ArrowRight } from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Platform Governance & Verification");
  const [inviteCode, setInviteCode] = useState("AGRI-ADMIN-2026");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all required administrator details.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (inviteCode.trim() !== "AGRI-ADMIN-2026") {
      setError("Invalid Department Invitation Passcode. Contact Root Security.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        const adminSession = {
          email,
          fullName,
          department,
          role: "Administrator",
          title: "Staff Admin",
          registeredAt: new Date().toISOString(),
        };
        sessionStorage.setItem("ulavan_admin_user", JSON.stringify(adminSession));
        localStorage.setItem("ulavan_admin_user", JSON.stringify(adminSession));
      }

      setIsLoading(false);
      router.push("/admin/login");
    }, 600);
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
          New Staff Onboarding &amp; Passcode Enrollment
        </p>
      </div>

      {/* Main Register Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#174B35] via-emerald-500 to-[#174B35]" />

        <div className="p-7 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#174B35]" />
              <span>Department Authorization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Register Admin Staff Account
            </h2>
            <p className="text-xs text-gray-500">
              Enter department authorization passcode to initialize staff permissions.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Staff Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. S. Senthil Nathan"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senthil@ulavansanthai.in"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Department Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="AGRI-ADMIN-2026"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Staff Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/admin/login" className="text-xs text-[#174B35] font-bold hover:underline">
                Already registered? Sign In here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
