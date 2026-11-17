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
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">Account settings</h2>
        <span className="text-xs text-[#526458] font-medium">Security</span>
      </div>

      {/* Change password */}
      <form onSubmit={handleUpdatePassword} className="space-y-3">
        <div className="text-xs font-bold text-[#1F2922]">Change password</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] text-[#556059] mb-1">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#556059] mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#556059] mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
          </div>
        </div>

        {passwordNotice && (
          <div className="text-xs text-[#24583B] font-medium bg-[#EBF6EE] p-2.5 rounded-lg">
            {passwordNotice}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Update password
          </button>
        </div>
      </form>

      {/* Verification */}
      <div className="pt-4 border-t border-[#F0ECE4] space-y-2">
        <div className="text-xs font-bold text-[#1F2922]">Verification</div>
        <div className="flex flex-wrap items-center gap-5 text-xs text-[#38453D]">
          <div className="flex items-center gap-2">
            <span>Email</span>
            <StatusBadge status="Verified" />
          </div>

          <div className="flex items-center gap-2">
            <span>Mobile</span>
            <StatusBadge status="Pending" />
            <button
              type="button"
              className="ml-1 text-xs font-semibold text-[#24583B] hover:underline cursor-pointer"
            >
              Verify mobile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
