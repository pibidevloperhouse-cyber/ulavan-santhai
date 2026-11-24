"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, Filter, Download, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuditLogTab({ logs = [], onNotify }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const tags = [
    "All",
    "Product Approval",
    "Product Published",
    "Product Rejected",
    "Seller Status",
    "Buyer Status",
    "System Event",
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      selectedTag === "All" ||
      log.action?.toLowerCase().includes(selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  const handleExport = () => {
    if (onNotify) onNotify("Audit log exported to CSV successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by admin, action, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 focus:border-[#174B35]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#174B35]/20 cursor-pointer text-[#174B35]"
          >
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
                <span>Administrative Audit Trail</span>
                <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-[#729B59]/30">
                  {filteredLogs.length} Events
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Immutable records of all quality checks, status transitions &amp; administrative decisions
              </p>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-gray-700">No Audit Events Logged</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Any administrative approvals, rejections, or modifications you make across products, sellers, or buyers will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/80 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-6 pr-4 w-[20%]">Timestamp</th>
                  <th className="py-3.5 px-4 w-[18%]">Administrator</th>
                  <th className="py-3.5 px-4 w-[22%]">Action Type</th>
                  <th className="py-3.5 pr-6 pl-4 w-[40%]">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="font-semibold text-gray-900">{log.date}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{log.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-800">
                        <User className="w-3.5 h-3.5 text-[#174B35]" />
                        <span>{log.admin}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F0E3] text-[#174B35] border border-[#729B59]/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4">
                      <span className="text-gray-600 font-medium leading-relaxed">{log.details}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between px-6">
          <span>Central Platform Governance Log &bull; Permanent Verification History</span>
          <span className="font-bold text-[#174B35]">Active Platform Monitoring</span>
        </div>
      </div>
    </div>
  );
}
