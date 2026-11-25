"use client";

import React from "react";

export default function PaymentFlowSteps() {
  const steps = [
    { step: 1, title: "Select plan or service" },
    { step: 2, title: "Payment initiation" },
    { step: 3, title: "Payment gateway" },
    { step: 4, title: "Payment confirmation" },
    { step: 5, title: "Subscription activation" },
  ];

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">Payment flow</h2>
        <span className="text-xs text-[#526458] font-medium">Standard Process</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {steps.map((item) => (
          <div
            key={item.step}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FAF8F5] border border-[#EFECE5]"
          >
            <div className="w-6 h-6 rounded-full bg-[#24583B] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {item.step}
            </div>
            <span className="text-xs font-semibold text-[#1F2922] leading-tight">
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
