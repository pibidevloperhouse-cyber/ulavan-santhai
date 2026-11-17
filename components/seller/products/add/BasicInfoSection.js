"use client";

import React from "react";
import { CATEGORIES_LIST, QUALITY_GRADES } from "@/data/sellerPortalData";

export default function BasicInfoSection({
  productName,
  onProductNameChange,
  productCategory,
  onProductCategoryChange,
  productType,
  onProductTypeChange,
  variety,
  onVarietyChange,
  qualityGrade,
  onQualityGradeChange,
  size,
  onSizeChange,
  productDescription,
  onProductDescriptionChange,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          1. Basic information
        </h2>
        <span className="text-xs text-[#526458] font-medium">Core Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product name */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Product name{" "}
            <span className="text-[#C53030] text-[10px] font-normal">
              Mandatory
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. Millet flour"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>

        {/* Product category */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Product category{" "}
            <span className="text-[#C53030] text-[10px] font-normal">
              Mandatory
            </span>
          </label>
          <select
            value={productCategory}
            onChange={(e) => onProductCategoryChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
          >
            <option value="">Select a category</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#7A877E] mt-1">
            Loaded from the database so the Admin can add categories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product type */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Product type{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. Flour, spice, grain, pasta"
            value={productType}
            onChange={(e) => onProductTypeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>

        {/* Variety */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Variety{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. variety or cultivar name"
            value={variety}
            onChange={(e) => onVarietyChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quality grade */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Quality grade{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <select
            value={qualityGrade}
            onChange={(e) => onQualityGradeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
          >
            {QUALITY_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#7A877E] mt-1">
            Grade list is configurable per category.
          </p>
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Size{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. small / medium / large, or a size range"
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>
      </div>

      {/* Product description */}
      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1">
          Product description{" "}
          <span className="text-[#C53030] text-[10px] font-normal">
            Mandatory
          </span>
        </label>
        <textarea
          rows={3}
          placeholder="Describe the product clearly and accurately. Buyers read this before approaching you."
          value={productDescription}
          onChange={(e) => onProductDescriptionChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] leading-relaxed"
        />
        <p className="text-[10px] text-[#7A877E] mt-1">
          You are responsible for accurate, complete, current and non-misleading
          information.
        </p>
      </div>
    </div>
  );
}
