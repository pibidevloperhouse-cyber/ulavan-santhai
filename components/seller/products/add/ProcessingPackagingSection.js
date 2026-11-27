"use client";

import React from "react";

export default function ProcessingPackagingSection({
  processingDetails,
  onProcessingDetailsChange,
  manufacturingDetails,
  onManufacturingDetailsChange,
  packagingDetails,
  onPackagingDetailsChange,
}) {
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          5. Processing, manufacturing and packaging
        </h2>
        <span className="text-xs text-[#4E6D45] font-medium">Handling & Packing</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Processing details{" "}
          <span className="text-[#54754B] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="How the product was processed or transformed"
          value={processingDetails}
          onChange={(e) => onProcessingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Manufacturing details{" "}
          <span className="text-[#54754B] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="How the product was manufactured"
          value={manufacturingDetails}
          onChange={(e) => onManufacturingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Packaging details{" "}
          <span className="text-[#54754B] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. pack sizes and packaging type"
          value={packagingDetails}
          onChange={(e) => onPackagingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
        />
      </div>
    </div>
  );
}
