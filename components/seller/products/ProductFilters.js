"use client";

import React from "react";
import { Search } from "lucide-react";
import { CATEGORIES_LIST } from "@/data/sellerPortalData";

export default function ProductFilters({
  searchName,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  availabilityFilter,
  onAvailabilityChange,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search by product name */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Search by product name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Millet flour"
              value={searchName}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-[#FAF8F5] border border-[#DCD6C9] rounded-lg text-xs text-[#1F2922] placeholder:text-[#9EA8A1] focus:outline-none focus:border-[#24583B] focus:bg-white"
            />
            <Search className="w-4 h-4 text-[#8D9A91] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DCD6C9] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] focus:bg-white cursor-pointer"
          >
            <option value="All categories">All categories</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Listing status */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Listing status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DCD6C9] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] focus:bg-white cursor-pointer"
          >
            <option value="All statuses">All statuses</option>
            <option value="Published">Published</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Availability
          </label>
          <select
            value={availabilityFilter}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DCD6C9] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] focus:bg-white cursor-pointer"
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Limited availability">Limited availability</option>
            <option value="Out of stock">Out of stock</option>
          </select>
        </div>
      </div>
    </div>
  );
}
