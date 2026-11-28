"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { changeAccountPassword } from "@/hooks/useSellerProfileState";

const INPUT_CLASS =
  "w-full min-w-0 pl-3 pr-9 py-2 bg-[#FCFDF9] border border-[#D2DFC0] rounded-xl text-xs font-medium text-[#0B3C26] placeholder:text-[#7A8C7D] focus:bg-white focus:outline-none focus:border-[#2D8A3E] focus:ring-2 focus:ring-[#C5F340]/50 transition-all";

export default function AccountSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordNotice("");

    if (!currentPassword.trim()) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await changeAccountPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordNotice(
          res.raw?.message || "Password updated successfully."
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(
          res.error ||
            "Unable to update password. Please verify your current password."
        );
      }
    } catch (err) {
      setPasswordError(err.message || "Unexpected error while updating password.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 h-full flex flex-col justify-between min-w-0">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <h2 className="text-sm font-extrabold text-[#0B3C26]">
              Change password
            </h2>
          </div>
          <span className="text-[11px] text-[#54754B] font-medium">
            Min. 8 chars
          </span>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label
              htmlFor="seller-current-password"
              className="block text-[11px] font-semibold text-[#3C5840] mb-1"
            >
              Current password
            </label>
            <div className="relative">
              <input
                id="seller-current-password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Enter current password"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#54754B] hover:text-[#0B3C26] hover:bg-[#F5F7EC] transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="seller-new-password"
                className="block text-[11px] font-semibold text-[#3C5840] mb-1"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="seller-new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Min. 8 characters"
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#54754B] hover:text-[#0B3C26] hover:bg-[#F5F7EC] transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="seller-confirm-password"
                className="block text-[11px] font-semibold text-[#3C5840] mb-1"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="seller-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Re-enter password"
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#54754B] hover:text-[#0B3C26] hover:bg-[#F5F7EC] transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-start gap-2 text-xs text-[#B92C2C] font-semibold bg-[#FDF2F2] border border-[#F8C8C2] p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordNotice && (
            <div className="flex items-start gap-2 text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2D8A3E]" />
              <span>{passwordNotice}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#0B3C26] hover:bg-[#174B35] text-white text-xs font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5F340]" />
              <span>{isUpdating ? "Updating..." : "Update password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
