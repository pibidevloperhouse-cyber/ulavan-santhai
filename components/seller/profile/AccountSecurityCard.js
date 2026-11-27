"use client";

import React, { useState } from "react";
import StatusBadge from "../ui/StatusBadge";

export default function AccountSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordNotice("New passwords do not match.");
      return;
    }
    setPasswordNotice("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordNotice(""), 3500);
  };

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">Account settings</h2>
        <span className="text-xs text-[#4E6D45] font-medium">Security</span>
      </div>

      {/* Change password */}
      <form onSubmit={handleUpdatePassword} className="space-y-3">
        <div className="text-xs font-bold text-[#0B3C26]">Change password</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#4E6D45] mb-1">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#4E6D45] mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#4E6D45] mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
            />
          </div>
        </div>

        {passwordNotice && (
          <div className="text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] p-2.5 rounded-xl">
            {passwordNotice}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0B3C26] hover:bg-[#174B35] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            Update password
          </button>
        </div>
      </form>

      {/* Verification */}
      <div className="pt-4 border-t border-[#E7EEDB] space-y-2">
        <div className="text-xs font-bold text-[#0B3C26]">Verification</div>
        <div className="flex flex-wrap items-center gap-5 text-xs text-[#3C5840]">
          <div className="flex items-center gap-2">
            <span>Email</span>
            <StatusBadge status="Verified" />
          </div>

          <div className="flex items-center gap-2">
            <span>Mobile</span>
            <StatusBadge status="Pending" />
            <button
              type="button"
              className="ml-1 text-xs font-bold text-[#2D8A3E] hover:underline cursor-pointer"
            >
              Verify mobile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
