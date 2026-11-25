"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Package, Mail } from "lucide-react";

export default function DashboardMetricCards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: "Account status",
      href: "/seller/profile",
      icon: ShieldCheck,
      isStatus: true,
      value: metrics.accountStatus?.status || "Active",
      subtext: metrics.accountStatus?.subtext || "Verified account",
    },
    {
      title: "Subscription",
      href: "/seller/subscription",
      icon: CreditCard,
      isStatus: true,
      value: metrics.subscription?.status || "Active",
      subtext: metrics.subscription?.subtext || "₹365 / year",
    },
    {
      title: "Total products",
      href: "/seller/products",
      icon: Package,
      isStatus: false,
      value: metrics.totalProducts?.count ?? 0,
      subtext: metrics.totalProducts?.subtext || "0 published",
    },
    {
      title: "Buyer enquiries",
      href: "/seller/enquiries",
      icon: Mail,
      isStatus: false,
      value: metrics.buyerEnquiries?.count ?? 0,
      subtext: metrics.buyerEnquiries?.subtext || "0 awaiting reply",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="min-w-0 bg-white border border-[#E5E0D5] hover:border-[#9EB5A0] rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#5B6860] group-hover:text-[#174B35] transition-colors truncate">
                {card.title}
              </span>
              <Icon className="w-4 h-4 text-[#8C9890] group-hover:text-[#174B35] transition-colors shrink-0" />
            </div>

            <div className="my-2 sm:my-2.5 min-w-0">
              {card.isStatus ? (
                <div className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1D7446] shrink-0" />
                  <span className="text-base sm:text-lg font-bold text-[#111827] truncate">
                    {card.value}
                  </span>
                </div>
              ) : (
                <div className="font-space text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827] leading-none">
                  {card.value}
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#6B7280] leading-tight truncate">
              {card.subtext}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
