"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRightLeft,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  LogOut,
  HelpCircle,
  FileText,
  ShoppingBag,
  Phone,
  SlidersHorizontal,
  Save,
} from "lucide-react";

function SwitchRow({ icon: Icon, label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2.5 cursor-pointer group">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <span className="w-8 h-8 rounded-lg bg-[#F5F7EC] group-hover:bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0 transition-colors">
            <Icon className="w-3.5 h-3.5 stroke-[2]" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#0B3C26]">{label}</div>
          {description && (
            <div className="text-[11px] text-[#54754B] leading-snug">
              {description}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          checked ? "bg-[#2D8A3E]" : "bg-[#D5E0C5]"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

const CHANNEL_ITEMS = [
  { key: "inApp", label: "In-app", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "push", label: "Push", icon: Smartphone },
];

export function SettingsFooterBar({ onLogout }) {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2 text-[#4E6D45]">
        <Link
          href="/buyer/help"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F7EC] hover:bg-[#ECF9C4] text-[#0B3C26] font-semibold transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#2D8A3E]" />
          <span>Help &amp; FAQs</span>
        </Link>
        <Link
          href="/buyer/terms"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F7EC] hover:bg-[#ECF9C4] text-[#0B3C26] font-semibold transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-[#2D8A3E]" />
          <span>Terms &amp; Conditions</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FDF2F2] hover:bg-[#FDE2E2] border border-[#F8C8C2] font-bold text-[#C53030] transition-colors cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log out</span>
      </button>
    </div>
  );
}

export default function BuyerRoleAndChannelsCard({
  useAsBuyerToo = false,
  onToggleBuyerRole,
  notificationChannels = {},
  onToggleChannel,
  preferences = {},
  onPreferenceChange,
  onSavePreferences,
  isSavingPreferences = false,
  preferencesNotice = "",
  preferencesError = "",
}) {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 h-full flex flex-col justify-between min-w-0">
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <h2 className="text-sm font-extrabold text-[#0B3C26]">
              Preferences &amp; notifications
            </h2>
          </div>

          <Link
            href="/get-started"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F7EC] hover:bg-[#ECF9C4] border border-[#DDE7CE] text-[11px] font-bold text-[#0B3C26] transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3 text-[#2D8A3E]" />
            <span>Switch role</span>
          </Link>
        </div>

        <div className="divide-y divide-[#E7EEDB]">
          <SwitchRow
            icon={ShoppingBag}
            label="Use this account as a Buyer too"
            description="Browse and source produce with the same login"
            checked={Boolean(useAsBuyerToo)}
            onChange={onToggleBuyerRole}
          />

          <SwitchRow
            icon={Phone}
            label="Show phone number to verified buyers"
            description="Display contact number on product enquiries"
            checked={preferences?.showPhoneToBuyers !== false}
            onChange={(val) => onPreferenceChange?.("showPhoneToBuyers", val)}
          />
        </div>

        <div className="pt-2.5 border-t border-[#E7EEDB] space-y-2">
          <div className="text-[11px] font-bold text-[#3C5840]">
            Notification channels
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CHANNEL_ITEMS.map(({ key, label, icon: Icon }) => {
              const active = Boolean(notificationChannels?.[key]);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleChannel(key)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    active
                      ? "bg-[#ECF9C4] text-[#0B3C26] border-[#8DC63F]"
                      : "bg-[#FCFDF9] text-[#4E6D45] border-[#DDE7CE] hover:bg-[#F5F7EC]"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      active ? "text-[#2D8A3E]" : "text-[#54754B]"
                    }`}
                  />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {preferencesError && (
          <div className="flex items-start gap-2 text-xs text-[#B92C2C] font-semibold bg-[#FDF2F2] border border-[#F8C8C2] p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{preferencesError}</span>
          </div>
        )}

        {preferencesNotice && (
          <div className="flex items-start gap-2 text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] p-2.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2D8A3E]" />
            <span>{preferencesNotice}</span>
          </div>
        )}
      </div>

      {onSavePreferences && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onSavePreferences}
            disabled={isSavingPreferences}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingPreferences ? "Saving..." : "Save settings"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
