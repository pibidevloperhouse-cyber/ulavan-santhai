"use client";

import React, { useState } from "react";
import { FileText, Plus, Bell, Megaphone, CheckCircle2, Trash2, Edit2 } from "lucide-react";

export default function ContentTab({ onNotify }) {
  const [announcements, setAnnouncements] = useState([
    {
      id: "ANN-01",
      title: "Cauvery Delta Samba Harvest Arrivals Live on Ulavan Santhai",
      audience: "All Marketplace Members",
      date: "Nov 2026",
      status: "Active",
    },
    {
      id: "ANN-02",
      title: "Government NPOP Certification Support Available at Thanjavur Desk",
      audience: "Cultivators Only",
      date: "Nov 2026",
      status: "Active",
    },
  ]);

  const handleAdd = () => {
    if (onNotify) onNotify("New marketplace announcement broadcast form opened.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#174B35] shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-2">
              <span>Marketplace Content &amp; Announcements</span>
              <span className="text-xs font-bold text-[#174B35] bg-[#E8F0E3] px-2.5 py-0.5 rounded-full border border-[#729B59]/30">
                Direct Broadcasts
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Publish seasonal harvest alerts, regional mandi notices, and government quality updates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2.5 rounded-xl bg-[#174B35] hover:bg-[#103A29] text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {announcements.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E8F0E3] text-[#174B35] flex items-center justify-center shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span>Target: <strong className="text-gray-600">{item.audience}</strong></span>
                    <span>&bull;</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {item.status}
                </span>
                <button
                  type="button"
                  onClick={() => onNotify && onNotify(`Editing announcement "${item.title}".`)}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
