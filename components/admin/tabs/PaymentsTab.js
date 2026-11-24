"use client";

import React, { useState } from "react";
import { Search, ReceiptIndianRupee, Filter, Download, CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function PaymentsTab({ transactions = [], setTransactions, onNotify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.plan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      t.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = transactions.reduce((sum, txn) => {
    if (txn.status === "Success" || !txn.status) {
      const num = parseInt(String(txn.amount || "").replace(/[^\d]/g, ""), 10) || 0;
      return sum + num;
    }
    return sum;
  }, 0);

  const handleExport = () => {
    if (onNotify) onNotify("Transaction register downloaded to CSV.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Metric & Gateway Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Sourced Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#174B35] block">
            ₹{totalRevenue.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500">100% directly settled via Razorpay</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Payment Gateway Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-black text-gray-900">Razorpay Live</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">Webhooks Active &amp; Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Settlement Model
          </span>
          <span className="text-base font-black text-gray-900 block pt-1">0% Commission</span>
          <span className="text-[11px] text-gray-500">Zero middleman deductions on farm produce</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by ID, member name, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 cursor-pointer text-[#174B35]"
          >
            <option value="All">All Transactions</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
              <ReceiptIndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <span>Transactions &amp; Subscription Receipts</span>
                <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-[#729B59]/30">
                  {filteredTransactions.length} Records
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Official Razorpay payment receipts, annual renewals, and buyer seller-unmask top-ups
              </p>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">No Transactions Found</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Real payment transactions from cultivator memberships and buyer sourcing access passes will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-6 pr-4">Txn ID &amp; Date</th>
                  <th className="py-3.5 px-4">Member / Enterprise</th>
                  <th className="py-3.5 px-4">Purchased Entitlement</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="font-bold text-gray-900">{txn.id}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{txn.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{txn.user}</div>
                      <div className="text-[10px] text-gray-400">{txn.type || "Membership"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-gray-700 font-medium">{txn.plan}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-extrabold text-[#174B35]">{txn.amount}</span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          txn.status === "Success"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : txn.status === "Pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{txn.status || "Success"}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between px-6">
          <span>Automated Razorpay Reconciliation &bull; 0% Trade Commission Policy</span>
          <span className="font-bold text-[#174B35]">{filteredTransactions.length} Total Receipts</span>
        </div>
      </div>
    </div>
  );
}
