"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Package, Mail } from "lucide-react";

export default function DashboardMetricCards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: "Account Status",
      href: "/seller/profile",
      icon: ShieldCheck,
      isStatus: true,
      value: metrics.accountStatus?.status || "Active",
      subtext: metrics.accountStatus?.subtext || "Verified seller account",
      iconClass: "bg-[#ECF9C4] text-[#0B3C26]",
    },
    {
      title: "Subscription",
      href: "/seller/subscription",
      icon: CreditCard,
      isStatus: true,
      value: metrics.subscription?.status || "Active",
      subtext: metrics.subscription?.subtext || "₹365 / year · Active",
      iconClass: "bg-[#E2F4B0] text-[#0B3C26]",
    },
    {
      title: "Total Products",
      href: "/seller/products",
      icon: Package,
      isStatus: false,
      value: metrics.totalProducts?.count ?? 0,
      subtext: metrics.totalProducts?.subtext || "0 published live",
      iconClass: "bg-[#ECF9C4] text-[#0B3C26]",
    },
    {
      title: "Buyer Enquiries",
      href: "/seller/enquiries",
      icon: Mail,
      isStatus: false,
      value: metrics.buyerEnquiries?.count ?? 0,
      subtext: metrics.buyerEnquiries?.subtext || "0 awaiting response",
      iconClass: "bg-[#E2F4B0] text-[#0B3C26]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="min-w-0 bg-white rounded-2xl p-4 sm:p-5 border border-[#DDE7CE] hover:border-[#8DC63F] shadow-xs flex flex-col justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#4E6D45] truncate">
                {card.title}
              </span>
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${card.iconClass}`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-3 mb-1.5 min-w-0">
              {card.isStatus ? (
                <div className="inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#65B72E] shrink-0" />
                  <span className="text-xl sm:text-2xl font-extrabold text-[#0B3C26] capitalize truncate">
                    {card.value}
                  </span>
                </div>
              ) : (
                <div className="font-space text-3xl font-bold tracking-tight text-[#0B3C26] leading-none">
                  {card.value}
                </div>
              )}
            </div>

            <div className="text-[11px] font-medium text-[#5B6860] truncate">
              {card.subtext}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
