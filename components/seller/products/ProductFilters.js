"use client";

import React from "react";
import { Search } from "lucide-react";
import { getSellerCategories } from "@/services/categoryStorage";
import SellerSelect from "../ui/SellerSelect";

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
  const dynamicCategories = getSellerCategories()
    .filter((c) => c.status === "Active")
    .map((c) => c.code || c.name);
  const categoryOptions = ["All categories", ...dynamicCategories];
  const statusOptions = [
    "All statuses",
    "Published",
    "Under Review",
    "Approved",
    "Draft",
    "Inactive",
    "Rejected",
  ];
  const availabilityOptions = [
    "All",
    "Available",
    "Limited availability",
    "Out of stock",
  ];

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-3.5 sm:p-5 shadow-2xs min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Search by product name */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Search by product name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Millet flour"
              value={searchName}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full min-w-0 pl-3 pr-8 py-2 bg-[#FAF8F5] border border-[#DCD6C9] rounded-lg text-xs text-[#1F2922] placeholder:text-[#9EA8A1] focus:outline-none focus:border-[#24583B] focus:bg-white"
            />
            <Search className="w-4 h-4 text-[#8D9A91] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Category
          </label>
          <SellerSelect
            value={categoryFilter}
            onChange={onCategoryChange}
            options={categoryOptions}
            ariaLabel="Filter by category"
            triggerClassName="bg-[#FAF8F5] border-[#DCD6C9]"
          />
        </div>

        {/* Listing status */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Listing status
          </label>
          <SellerSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            ariaLabel="Filter by listing status"
            triggerClassName="bg-[#FAF8F5] border-[#DCD6C9]"
          />
        </div>

        {/* Availability */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
            Availability
          </label>
          <SellerSelect
            value={availabilityFilter}
            onChange={onAvailabilityChange}
            options={availabilityOptions}
            ariaLabel="Filter by availability"
            triggerClassName="bg-[#FAF8F5] border-[#DCD6C9]"
          />
        </div>
      </div>
    </div>
  );
}
