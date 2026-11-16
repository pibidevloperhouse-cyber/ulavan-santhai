"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function PaymentHistoryTable({
  history = [],
  onRetryPayment,
}) {
  return (
    <div
      id="payment-history"
      className="bg-white border border-[#EAE6DD] rounded-xl shadow-2xs overflow-hidden"
    >
      <div className="p-5 pb-3 border-b border-[#F0ECE4] flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#1F2922]">Payment history</h2>
        <span className="text-xs text-[#526458] font-medium">
          Invoices & Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-[11px] font-semibold text-[#66756B] uppercase tracking-wider">
              <th className="px-4 py-3.5">Date</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Payment Type</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Transaction ID</th>
              <th className="px-4 py-3.5">Subscription Details</th>
              <th className="px-4 py-3.5 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE6]">
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                  No payment records found yet.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF9F6]">
                  <td className="px-4 py-3.5 whitespace-nowrap text-[#1F2922]">
                    {item.date}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#1F2922]">
                    {item.amount}
                  </td>
                  <td className="px-4 py-3.5 text-[#3D4C42]">
                    {item.paymentType}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#58665E]">
                    {item.transactionId}
                  </td>
                  <td className="px-4 py-3.5 text-[#3D4C42]">
                    {item.subscriptionDetails}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {item.status === "Failed" ? (
                      <button
                        type="button"
                        onClick={() => onRetryPayment && onRetryPayment()}
                        className="text-xs font-semibold text-[#24583B] hover:underline cursor-pointer"
                      >
                        Retry payment
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#24583B] hover:underline cursor-pointer"
                      >
                        Download receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
