"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Package, Mail, ArrowUpRight, Check } from "lucide-react";

export default function DashboardMetricCards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: "Account Status",
      href: "/seller/profile",
      icon: ShieldCheck,
      isStatus: true,
      value: metrics.accountStatus?.status || "Active",
      subtext: metrics.accountStatus?.subtext || "Verified seller",
      iconBg: "bg-[#F5F5EB] text-[#0B3C26]",
    },
    {
      title: "Subscription",
      href: "/seller/subscription",
      icon: CreditCard,
      isStatus: true,
      value: metrics.subscription?.status || "Active",
      subtext: metrics.subscription?.subtext || "₹365 / year",
      iconBg: "bg-[#C5F340]/45 text-[#0B3C26]",
    },
    {
      title: "Total Products",
      href: "/seller/products",
      icon: Package,
      isStatus: false,
      value: metrics.totalProducts?.count ?? 0,
      subtext: metrics.totalProducts?.subtext || "0 published live",
      iconBg: "bg-[#F5F5EB] text-[#0B3C26]",
    },
    {
      title: "Buyer Enquiries",
      href: "/seller/enquiries",
      icon: Mail,
      isStatus: false,
      value: metrics.buyerEnquiries?.count ?? 0,
      subtext: metrics.buyerEnquiries?.subtext || "0 awaiting response",
      iconBg: "bg-[#C5F340]/45 text-[#0B3C26]",
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
            className="min-w-0 bg-white rounded-2xl p-4 sm:p-5 ring-1 ring-[#0B3C26]/10 hover:ring-[#0B3C26]/30 shadow-xs hover:shadow-md flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="w-7 h-7 rounded-full bg-[#F5F5EB] group-hover:bg-[#0B3C26] text-[#0B3C26] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="mt-4 mb-1.5 min-w-0">
              <div className="text-xs font-semibold text-[#54754B] truncate">
                {card.title}
              </div>

              {card.isStatus ? (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5F340]/45 border border-[#0B3C26]/10">
                  <Check className="w-3.5 h-3.5 text-[#0B3C26] stroke-[2.5]" />
                  <span className="text-sm sm:text-base font-extrabold text-[#0B3C26] capitalize truncate">
                    {card.value}
                  </span>
                </div>
              ) : (
                <div className="mt-1.5 font-space text-3xl font-bold tracking-tight text-[#0B3C26] leading-none">
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
