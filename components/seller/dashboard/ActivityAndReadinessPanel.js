"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Check,
  Circle,
  Sparkles,
  MessageSquarePlus,
  ArrowUpRight,
} from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function ActivityAndReadinessPanel({
  enquiries = [],
  notifications = [],
  hasProducts = false,
}) {
  const [activeTab, setActiveTab] = useState("enquiries");

  const checklist = [
    { label: "Account verified", done: true, href: "/seller/profile" },
    { label: "Annual seller pass active", done: true, href: "/seller/subscription" },
    { label: "Publish first crop listing", done: hasProducts, href: "/seller/products/add" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checklist.length) * 100);

  return (
    <div className="space-y-5 min-w-0">
      {/* Storefront Readiness Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 ring-1 ring-[#0B3C26]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#54754B]">
              ONBOARDING
            </div>
            <h2 className="text-base font-extrabold text-[#0B3C26] mt-0.5">
              Storefront Setup
            </h2>
          </div>
          <span className="font-space text-xs font-extrabold px-3 py-1 rounded-full bg-[#C5F340] text-[#0B3C26]">
            {pct}%
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-[#F5F5EB] overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#0B3C26] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#F5F5EB] hover:bg-[#ECECD9] border border-[#0B3C26]/10 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.done ? (
                  <span className="w-5 h-5 rounded-full bg-[#0B3C26] text-[#C5F340] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <Circle className="w-5 h-5 text-[#54754B] shrink-0" />
                )}
                <span
                  className={`text-xs font-bold truncate ${
                    item.done ? "text-[#4E6D45] line-through" : "text-[#0B3C26]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <span className="w-6 h-6 rounded-full bg-white text-[#0B3C26] flex items-center justify-center shrink-0 group-hover:bg-[#0B3C26] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Unified Tabbed Activity Feed: Enquiries & Notifications */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 ring-1 ring-[#0B3C26]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#F5F5EB] ring-1 ring-[#0B3C26]/10">
            <button
              type="button"
              onClick={() => setActiveTab("enquiries")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "enquiries"
                  ? "bg-[#0B3C26] text-white shadow-xs"
                  : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Enquiries</span>
              <span
                className={`font-space text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "enquiries"
                    ? "bg-[#C5F340] text-[#0B3C26]"
                    : "bg-white text-[#0B3C26]"
                }`}
              >
                {enquiries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "alerts"
                  ? "bg-[#0B3C26] text-white shadow-xs"
                  : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
              <span
                className={`font-space text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === "alerts"
                    ? "bg-[#C5F340] text-[#0B3C26]"
                    : "bg-white text-[#0B3C26]"
                }`}
              >
                {notifications.length}
              </span>
            </button>
          </div>

          <Link
            href={activeTab === "enquiries" ? "/seller/enquiries" : "/seller/notifications"}
            className="text-xs font-bold text-[#0B3C26] hover:underline shrink-0"
          >
            View all
          </Link>
        </div>

        {activeTab === "enquiries" ? (
          enquiries.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#F5F5EB] border border-[#0B3C26]/10 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#C5F340] text-[#0B3C26] flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div className="text-xs font-extrabold text-[#0B3C26]">No buyer enquiries yet</div>
              <p className="text-[11px] text-[#4E6D45] leading-relaxed">
                Publish a product listing so traders &amp; wholesalers can message you directly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5EB]">
              {enquiries.map((enq) => (
                <Link
                  key={enq.id}
                  href="/seller/enquiries"
                  className="py-2.5 block space-y-1 hover:bg-[#F5F5EB] -mx-1.5 px-1.5 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B3C26] truncate">
                      {enq.buyerName} · {enq.productName}
                    </span>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="text-[11px] text-[#4E6D45] line-clamp-2">{enq.message}</p>
                </Link>
              ))}
            </div>
          )
        ) : notifications.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#F5F5EB] border border-[#0B3C26]/10 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#C5F340] text-[#0B3C26] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs font-extrabold text-[#0B3C26]">All caught up</div>
            <p className="text-[11px] text-[#4E6D45] leading-relaxed">
              Listing reviews, approvals, and payment updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5EB]">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href="/seller/notifications"
                className="py-2.5 flex items-start justify-between gap-2 hover:bg-[#F5F5EB] -mx-1.5 px-1.5 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0B3C26] truncate">{notif.title}</div>
                  <p className="text-[11px] text-[#4E6D45] mt-0.5">{notif.message}</p>
                </div>
                <span className="text-[10px] text-[#54754B] shrink-0">{notif.time}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

