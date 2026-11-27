"use client";

import React from "react";
import { UploadCloud } from "lucide-react";
import { getSellerCategories } from "@/services/categoryStorage";
import SellerSelect from "../ui/SellerSelect";

export default function SellerProfileForm({
  profile,
  onFieldChange,
  onToggleCategory,
  onSave,
  saveNotice,
}) {
  const activeSellerClassifications = getSellerCategories()
    .filter((c) => c.status === "Active")
    .map((c) => c.code || c.name);
  const sellerTypeOptions = activeSellerClassifications;

  return (
    <form
      onSubmit={onSave}
      className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">Seller profile</h2>
        <span className="text-xs text-[#4E6D45] font-medium">
          Captured at onboarding
        </span>
      </div>

      {/* Business Name & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Seller / business name
          </label>
          <input
            type="text"
            value={profile.businessName}
            onChange={(e) => onFieldChange("businessName", e.target.value)}
            placeholder="Name of your farm, business or organisation"
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Seller type
          </label>
          <SellerSelect
            value={profile.sellerType}
            onChange={(val) => onFieldChange("sellerType", val)}
            options={sellerTypeOptions}
            ariaLabel="Seller type"
          />
          <p className="text-[10px] text-[#54754B] mt-1">
            A classification only, not a separate role.
          </p>
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Contact email
          </label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => onFieldChange("email", e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Contact phone
          </label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            placeholder="Mobile number"
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      {/* Business details */}
      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Business details
        </label>
        <textarea
          rows={3}
          value={profile.businessDetails}
          onChange={(e) => onFieldChange("businessDetails", e.target.value)}
          placeholder="About your farm or business"
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] leading-relaxed"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
          Address
        </label>
        <input
          type="text"
          value={profile.address}
          onChange={(e) => onFieldChange("address", e.target.value)}
          placeholder="Street, village or area"
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
        />
      </div>

      {/* City / State / PIN code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            City / district
          </label>
          <input
            type="text"
            value={profile.city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            State
          </label>
          <input
            type="text"
            value={profile.state}
            onChange={(e) => onFieldChange("state", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            PIN code
          </label>
          <input
            type="text"
            value={profile.pinCode}
            onChange={(e) => onFieldChange("pinCode", e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      {/* Products offered (categories) checkboxes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#3C5840]">
          Products offered (categories)
        </label>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {activeSellerClassifications.map((cat) => {
            const checked = profile.categories.includes(cat);
            return (
              <label
                key={cat}
                className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#3C5840]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCategory(cat)}
                  className="w-4 h-4 rounded accent-[#2D8A3E] text-[#2D8A3E] focus:ring-0"
                />
                <span>{cat}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Registration / licence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Registration / licence type
          </label>
          <input
            type="text"
            value={profile.licenseType}
            onChange={(e) => onFieldChange("licenseType", e.target.value)}
            placeholder="e.g. FSSAI licence, business registration"
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Registration / licence number
          </label>
          <input
            type="text"
            value={profile.licenseNumber}
            onChange={(e) => onFieldChange("licenseNumber", e.target.value)}
            placeholder="Where applicable"
            className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      {/* Business certifications */}
      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1.5">
          Business certifications
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-[#D2DFC0] bg-[#F5F7EC] text-xs font-bold text-[#0B3C26] hover:bg-[#ECF9C4] transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#2D8A3E]" />
            Upload certificate
          </button>
          <span className="text-[10px] text-[#54754B]">
            Reviewed by the Admin · not automatically verified
          </span>
        </div>
      </div>

      {saveNotice && (
        <div className="text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] border border-[#C5E37A] p-2.5 rounded-xl">
          {saveNotice}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          className="px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs cursor-pointer text-center"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
