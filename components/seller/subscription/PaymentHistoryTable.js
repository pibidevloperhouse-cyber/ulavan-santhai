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
      className="bg-white border border-[#EAE6DD] rounded-xl shadow-2xs overflow-hidden min-w-0"
    >
      <div className="p-4 sm:p-5 pb-3 border-b border-[#F0ECE4] flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#1F2922]">Payment history</h2>
        <span className="text-xs text-[#526458] font-medium">
          Invoices & Records
        </span>
      </div>

      {history.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-[#6B7280]">
          No payment records found yet.
        </div>
      ) : (
        <>
          {/* Mobile Cards View (< 640px) */}
          <div className="block sm:hidden divide-y divide-[#F0EDE6]">
            {history.map((item) => (
              <div key={`m-${item.id}`} className="p-4 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-[#1F2922] text-sm">
                      {item.amount}
                    </div>
                    <div className="text-[11px] text-[#58665E]">
                      {item.date} · {item.paymentType}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EDE8DE] rounded-lg p-2.5 space-y-1 text-[11px]">
                  <div className="text-[#3D4C42]">{item.subscriptionDetails}</div>
                  <div className="font-mono text-[#58665E] break-all">
                    TXN: {item.transactionId}
                  </div>
                </div>

                <div className="pt-0.5 flex justify-end">
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
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto">
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
                {history.map((item) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
