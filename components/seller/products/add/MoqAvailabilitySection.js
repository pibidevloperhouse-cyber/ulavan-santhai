"use client";

import React from "react";
import SellerSelect from "../../ui/SellerSelect";

export default function MoqAvailabilitySection({
  moqQty,
  onMoqQtyChange,
  moqUnit,
  onMoqUnitChange,
  moqVariesBy,
  onMoqVariesByChange,
  availability,
  onAvailabilityChange,
}) {
  const unitOptions = ["kg", "quintal", "tonne", "bag (25kg)", "bag (50kg)"];
  const variesByOptions = [
    "Not specified",
    "Packaging size",
    "Delivery location",
    "Seasonality",
  ];
  const availabilityOptions = [
    "Available",
    "Limited availability",
    "Out of stock",
  ];

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          4. MOQ and availability
        </h2>
        <span className="text-xs text-[#526458] font-medium">Supply & Minimums</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* MOQ */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            MOQ (minimum order quantity){" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              placeholder="Quantity"
              value={moqQty}
              onChange={(e) => onMoqQtyChange(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
            <div className="w-32 sm:w-36 shrink-0">
              <SellerSelect
                value={moqUnit}
                onChange={onMoqUnitChange}
                options={unitOptions}
                ariaLabel="MOQ unit"
              />
            </div>
          </div>
        </div>

        {/* MOQ varies by */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            MOQ varies by (optional)
          </label>
          <SellerSelect
            value={moqVariesBy}
            onChange={onMoqVariesByChange}
            options={variesByOptions}
            ariaLabel="MOQ varies by"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="min-w-0">
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Availability{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <SellerSelect
          value={availability}
          onChange={onAvailabilityChange}
          options={availabilityOptions}
          ariaLabel="Availability"
        />
        <p className="text-[10px] text-[#7A877E] mt-1">
          Status list is configurable.
        </p>
      </div>
    </div>
  );
}
