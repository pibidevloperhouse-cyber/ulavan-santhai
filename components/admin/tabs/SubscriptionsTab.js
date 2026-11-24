"use client";

import React, { useState } from "react";
import { CreditCard, Check, Sparkles, Shield, Users, Store, ArrowRight, Edit2 } from "lucide-react";

export default function SubscriptionsTab({ onNotify }) {
  const [plans, setPlans] = useState([
    {
      id: "plan-seller-annual",
      name: "Direct Cultivator Annual Plan",
      target: "Farmers, Collectives & FPOs",
      price: "₹365",
      period: "per year (₹1/day)",
      badge: "Most Popular",
      status: "Active",
      features: [
        "Direct farm-gate listing without commission",
        "Unlimited agricultural harvest lots",
        "Direct buyer inquiries & WhatsApp alerts",
        "Free land document & organic verification desk",
        "Access to daily mandi price trends",
      ],
    },
    {
      id: "plan-buyer-mandi",
      name: "Wholesale Mandi Buyer Access",
      target: "Agri Traders, Processors & Exporters",
      price: "₹365",
      period: "per year",
      badge: "Verified Sourcing",
      status: "Active",
      features: [
        "Direct farmer contact unmasking (10 cultivators included)",
        "Top-up quota: +10 sellers for ₹365",
        "Physical inspection certification check",
        "Real-time harvest lot notifications",
        "Zero brokerage guarantee on direct trade",
      ],
    },
  ]);

  const handleEditPlan = (planName) => {
    if (onNotify) onNotify(`Editing pricing rules for "${planName}".`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span>Subscriptions &amp; Membership Pricing</span>
              <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-[#729B59]/30">
                ₹365 Annual Model
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Transparent, nominal subscription pricing empowering Tamil Nadu cultivators with 0% trade commission
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs p-6 space-y-5 flex flex-col justify-between hover:border-[#174B35]/40 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/30">
                  {plan.badge}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  &bull; {plan.status}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-gray-900">{plan.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{plan.target}</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#174B35]">{plan.price}</span>
                <span className="text-xs text-gray-500 font-semibold">{plan.period}</span>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Included Entitlements
                </span>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Automated Razorpay Billing</span>
              <button
                type="button"
                onClick={() => handleEditPlan(plan.name)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjust Pricing</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
