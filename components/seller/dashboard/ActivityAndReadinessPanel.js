"use client";

import React, { useState } from "react";
import Link from "next/link";
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
      {/* Storefront Setup Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDE7CE] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-[#0B3C26]">
            Storefront Setup
          </h2>
          <span className="text-xs font-bold text-[#3C6A2E]">
            {doneCount} of {checklist.length} done
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-[#EDF3DF] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#174B35] to-[#6EC434] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#F5F7EC] hover:bg-[#ECF6D2] border border-[#DDE7CE] transition-colors"
            >
              <span className="text-xs font-semibold text-[#0B3C26] truncate">
                {item.label}
              </span>
              <span
                className={`text-[11px] font-bold shrink-0 ${
                  item.done ? "text-[#2D8A3E]" : "text-[#54754B]"
                }`}
              >
                {item.done ? "Done" : "Pending"}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Unified Tabbed Activity Feed: Enquiries & Alerts */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDE7CE] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#E7EEDB]">
          <div className="flex items-center gap-5 -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab("enquiries")}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "enquiries"
                  ? "text-[#0B3C26] border-[#6EC434]"
                  : "text-[#54754B] border-transparent hover:text-[#0B3C26]"
              }`}
            >
              Enquiries ({enquiries.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "alerts"
                  ? "text-[#0B3C26] border-[#6EC434]"
                  : "text-[#54754B] border-transparent hover:text-[#0B3C26]"
              }`}
            >
              Alerts ({notifications.length})
            </button>
          </div>

          <Link
            href={activeTab === "enquiries" ? "/seller/enquiries" : "/seller/notifications"}
            className="pb-2.5 text-xs font-bold text-[#174B35] hover:underline shrink-0"
          >
            View all
          </Link>
        </div>

        {activeTab === "enquiries" ? (
          enquiries.length === 0 ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7EC] border border-[#DDE7CE] space-y-1">
              <div className="text-xs font-extrabold text-[#0B3C26]">No buyer enquiries yet</div>
              <p className="text-[11px] text-[#4E6D45] leading-relaxed">
                Publish a product listing so traders and wholesalers can message you directly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDF3DF]">
              {enquiries.map((enq) => (
                <Link
                  key={enq.id}
                  href="/seller/enquiries"
                  className="py-2.5 block space-y-1 hover:bg-[#F5F7EC] -mx-1.5 px-1.5 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B3C26] truncate">
                      {enq.buyerName} &middot; {enq.productName}
                    </span>
                    <StatusBadge status={enq.status} />
                  </div>
                  <p className="text-[11px] text-[#4E6D45] line-clamp-2">{enq.message}</p>
                </Link>
              ))}
            </div>
          )
        ) : notifications.length === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7EC] border border-[#DDE7CE] space-y-1">
            <div className="text-xs font-extrabold text-[#0B3C26]">No new alerts</div>
            <p className="text-[11px] text-[#4E6D45] leading-relaxed">
              Listing reviews, approvals, and payment updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EDF3DF]">
            {notifications.map((notif) => (
              <Link
                key={notif.id}
                href="/seller/notifications"
                className="py-2.5 flex items-start justify-between gap-2 hover:bg-[#F5F7EC] -mx-1.5 px-1.5 rounded-xl transition-colors"
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
