"use client";

import React from "react";
import { useSessionUser } from "@/services/sessionAuth";
import { getDynamicSellerProfile } from "@/services/sellerApi";

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
  const sessionUser = useSessionUser();
  const profile = getDynamicSellerProfile(sessionUser);
  const locationParts = [
    profile.address,
    profile.city,
    profile.state,
    profile.pinCode,
  ].filter(Boolean);
  const locationText =
    locationParts.length > 0
      ? locationParts.join(", ")
      : "Location captured from your Seller onboarding profile";
  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          3. Origin and location
        </h2>
        <span className="text-xs text-[#4E6D45] font-medium">
          Fields adapt by product type
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Place of origin */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Place of origin{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="Area where the produce was grown"
            value={placeOfOrigin}
            onChange={(e) => onPlaceOfOriginChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
          <p className="text-[10px] text-[#54754B] mt-1">
            For agricultural produce.
          </p>
        </div>

        {/* Production location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Production location{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="Where the product is produced"
            value={productionLocation}
            onChange={(e) => onProductionLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Processing location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Processing location
          </label>
          <input
            type="text"
            placeholder="Where the product is processed"
            value={processingLocation}
            onChange={(e) => onProcessingLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        {/* Manufacturing location */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Manufacturing location
          </label>
          <input
            type="text"
            placeholder="Where the product is manufactured"
            value={manufacturingLocation}
            onChange={(e) => onManufacturingLocationChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      {/* Seller / business location */}
      <div className="min-w-0">
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Seller / business location
        </label>
        <div className="w-full px-3 py-2 bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl text-xs text-[#4E6D45] break-words">
          {locationText}
        </div>
      </div>
    </div>
  );
}
