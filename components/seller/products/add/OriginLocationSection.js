"use client";

import React from "react";
import { DEFAULT_SELLER_PROFILE } from "@/data/sellerPortalData";

export default function OriginLocationSection({
  placeOfOrigin,
  onPlaceOfOriginChange,
  productionLocation,
  onProductionLocationChange,
  processingLocation,
  onProcessingLocationChange,
  manufacturingLocation,
  onManufacturingLocationChange,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          3. Origin and location
        </h2>
        <span className="text-xs text-[#526458] font-medium">
          Fields adapt by product type
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Place of origin */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Place of origin{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="Area where the produce was grown"
            value={placeOfOrigin}
            onChange={(e) => onPlaceOfOriginChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
          <p className="text-[10px] text-[#7A877E] mt-1">
            For agricultural produce.
          </p>
        </div>

        {/* Production location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Production location{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="Where the product is produced"
            value={productionLocation}
            onChange={(e) => onProductionLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Processing location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Processing location
          </label>
          <input
            type="text"
            placeholder="Where the product is processed"
            value={processingLocation}
            onChange={(e) => onProcessingLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>

        {/* Manufacturing location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Manufacturing location
          </label>
          <input
            type="text"
            placeholder="Where the product is manufactured"
            value={manufacturingLocation}
            onChange={(e) => onManufacturingLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>
      </div>

      {/* Seller / business location */}
      <div className="min-w-0">
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Seller / business location
        </label>
        <div className="w-full px-3 py-2 bg-[#F6F4EC] border border-[#E3DDCF] rounded-lg text-xs text-[#6B7870] break-words">
          {DEFAULT_SELLER_PROFILE.address}, {DEFAULT_SELLER_PROFILE.city},{" "}
          {DEFAULT_SELLER_PROFILE.state} — {DEFAULT_SELLER_PROFILE.pinCode}{" "}
          (Taken from your Seller profile)
        </div>
      </div>
    </div>
  );
}
