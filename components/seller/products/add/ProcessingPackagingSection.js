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
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          5. Processing, manufacturing and packaging
        </h2>
        <span className="text-xs text-[#526458] font-medium">Handling & Packing</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Processing details{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="How the product was processed or transformed"
          value={processingDetails}
          onChange={(e) => onProcessingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Manufacturing details{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <textarea
          rows={2}
          placeholder="How the product was manufactured"
          value={manufacturingDetails}
          onChange={(e) => onManufacturingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Packaging details{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <input
          type="text"
          placeholder="e.g. pack sizes and packaging type"
          value={packagingDetails}
          onChange={(e) => onPackagingDetailsChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
        />
      </div>
    </div>
  );
}
