"use client";

import React from "react";

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
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          4. MOQ and availability
        </h2>
        <span className="text-xs text-[#526458] font-medium">Supply & Minimums</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* MOQ */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            MOQ (minimum order quantity){" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Quantity"
              value={moqQty}
              onChange={(e) => onMoqQtyChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
            <select
              value={moqUnit}
              onChange={(e) => onMoqUnitChange(e.target.value)}
              className="px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
              <option value="tonne">tonne</option>
              <option value="bag (25kg)">bag (25kg)</option>
              <option value="bag (50kg)">bag (50kg)</option>
            </select>
          </div>
        </div>

        {/* MOQ varies by */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            MOQ varies by (optional)
          </label>
          <select
            value={moqVariesBy}
            onChange={(e) => onMoqVariesByChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
          >
            <option value="Not specified">Not specified</option>
            <option value="Packaging size">Packaging size</option>
            <option value="Delivery location">Delivery location</option>
            <option value="Seasonality">Seasonality</option>
          </select>
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Availability{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>
        <select
          value={availability}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
        >
          <option value="Available">Available</option>
          <option value="Limited availability">Limited availability</option>
          <option value="Out of stock">Out of stock</option>
        </select>
        <p className="text-[10px] text-[#7A877E] mt-1">
          Status list is configurable.
        </p>
      </div>
    </div>
  );
}
