"use client";

import React, { useState } from "react";
import { Settings, Shield, Bell, Lock, Database, Check } from "lucide-react";

export default function SettingsTab({ onNotify }) {
  const [settings, setSettings] = useState({
    platformName: "Ulavan Santhai Direct Agricultural Marketplace",
    supportEmail: "support@ulavansanthai.in",
    supportPhone: "+91 94433 00000",
    operatingState: "Tamil Nadu",
    maintenanceMode: false,
    requirePattaVerification: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (onNotify) onNotify("Platform governance settings updated successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900">
              Platform Governance &amp; Security Settings
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Control platform verification policies, regional boundaries, and administrative access
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Platform Trading Title
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Regional Operating State
            </label>
            <input
              type="text"
              value={settings.operatingState}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Helpdesk Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Farmer Helpline Phone
            </label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requirePatta"
              checked={settings.requirePattaVerification}
              onChange={(e) => setSettings({ ...settings, requirePattaVerification: e.target.checked })}
              className="rounded text-[#174B35] focus:ring-[#174B35] cursor-pointer"
            />
            <label htmlFor="requirePatta" className="text-xs font-bold text-gray-700 cursor-pointer">
              Enforce mandatory Patta / Chitta document review before cultivator activation
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
