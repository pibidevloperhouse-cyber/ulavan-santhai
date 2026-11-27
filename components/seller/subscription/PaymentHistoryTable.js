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
      className="bg-white border border-[#DDE7CE] rounded-2xl shadow-2xs overflow-hidden min-w-0"
    >
      <div className="p-4 sm:p-5 pb-3 border-b border-[#E7EEDB] flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">Payment history</h2>
        <span className="text-xs text-[#4E6D45] font-medium">
          Invoices & Records
        </span>
      </div>

      {history.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-[#54754B]">
          No payment records found yet.
        </div>
      ) : (
        <>
          {/* Mobile Cards View (< 640px) */}
          <div className="block sm:hidden divide-y divide-[#EDF3DF]">
            {history.map((item) => (
              <div key={`m-${item.id}`} className="p-4 space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-[#0B3C26] text-sm">
                      {item.amount}
                    </div>
                    <div className="text-[11px] text-[#54754B]">
                      {item.date} · {item.paymentType}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-2.5 space-y-1 text-[11px]">
                  <div className="text-[#3C5840]">{item.subscriptionDetails}</div>
                  <div className="font-mono text-[#54754B] break-all">
                    TXN: {item.transactionId}
                  </div>
                </div>

                <div className="pt-0.5 flex justify-end">
                  {item.status === "Failed" ? (
                    <button
                      type="button"
                      onClick={() => onRetryPayment && onRetryPayment()}
                      className="text-xs font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                    >
                      Retry payment
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs font-bold text-[#2D8A3E] hover:underline cursor-pointer"
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
                <tr className="bg-[#F2F7E6] border-b border-[#DDE7CE] text-[11px] font-bold text-[#4E6D45] uppercase tracking-wider">
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Payment Type</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Transaction ID</th>
                  <th className="px-4 py-3.5">Subscription Details</th>
                  <th className="px-4 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF3DF]">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F7EC] transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#0B3C26]">
                      {item.date}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#0B3C26]">
                      {item.amount}
                    </td>
                    <td className="px-4 py-3.5 text-[#3C5840]">
                      {item.paymentType}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#54754B]">
                      {item.transactionId}
                    </td>
                    <td className="px-4 py-3.5 text-[#3C5840]">
                      {item.subscriptionDetails}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {item.status === "Failed" ? (
                        <button
                          type="button"
                          onClick={() => onRetryPayment && onRetryPayment()}
                          className="text-xs font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                        >
                          Retry payment
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-bold text-[#2D8A3E] hover:underline cursor-pointer"
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
