"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

export default function AdminToast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#132E20] text-white rounded-2xl shadow-xl border border-emerald-700/50 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-emerald-300 hover:text-white cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
