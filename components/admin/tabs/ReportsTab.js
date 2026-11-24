"use client";

import React from "react";
import { BarChart3, Download, TrendingUp, MapPin, Layers, Users, Calendar } from "lucide-react";

export default function ReportsTab({ onNotify }) {
  const handleExport = (reportType) => {
    if (onNotify) onNotify(`${reportType} exported to CSV.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span>Marketplace Analytics &amp; Reports</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Tamil Nadu regional trade metrics, harvest arrival analytics &amp; direct agricultural throughput
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleExport("Complete Annual Agri Trade Report")}
          className="px-4 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download All Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Active Trade Hubs</span>
            <MapPin className="w-4 h-4 text-[#174B35]" />
          </div>
          <div className="text-2xl font-black text-gray-900">38 Districts</div>
          <p className="text-xs text-gray-500">Top production: Coimbatore, Thanjavur, Madurai, Erode</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Direct Trade Commission</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#174B35]">0% Brokerage</div>
          <p className="text-xs text-gray-500">100% of payment goes directly to registered cultivators</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Subscription Model</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">₹365 / Year</div>
          <p className="text-xs text-gray-500">Nominal 1 rupee per day platform maintenance model</p>
        </div>
      </div>
    </div>
  );
}
