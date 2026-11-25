"use client";

import React from "react";
import {
  CATEGORIES_LIST,
  CATEGORY_SUBCATEGORIES_MAP,
  QUALITY_GRADES,
} from "@/data/sellerPortalData";
import SellerSelect from "../../ui/SellerSelect";

export default function BasicInfoSection({
  productName,
  onProductNameChange,
  productCategory,
  onProductCategoryChange,
  productSubcategory,
  onProductSubcategoryChange,
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
  // Available subcategories based on chosen category
  const availableSubcategories =
    (productCategory && CATEGORY_SUBCATEGORIES_MAP[productCategory]) || [];

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...CATEGORIES_LIST.map((cat) => ({ value: cat, label: cat })),
  ];

  const subcategoryOptions = [
    {
      value: "",
      label: productCategory ? "-- Select subcategory --" : "-- Select category first --",
    },
    ...availableSubcategories.map((sub) => ({ value: sub, label: sub })),
    { value: "Other", label: "Other / Custom" },
  ];

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          1. Basic information
        </h2>
        <span className="text-xs text-[#526458] font-medium">Core Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product name */}
        <div className="sm:col-span-2 lg:col-span-1 min-w-0">
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
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>

        {/* Product category */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Product category{" "}
            <span className="text-[#C53030] text-[10px] font-normal">
              Mandatory
            </span>
          </label>
          <SellerSelect
            value={productCategory}
            onChange={(val) => {
              onProductCategoryChange(val);
              if (onProductSubcategoryChange) {
                onProductSubcategoryChange("");
              }
            }}
            options={categoryOptions}
            placeholder="Select a category"
            ariaLabel="Product category"
          />
          <p className="text-[10px] text-[#7A877E] mt-1">
            Loaded from database / admin portal.
          </p>
        </div>

        {/* Product subcategory */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Subcategory{" "}
            <span className="text-[#24583B] text-[10px] font-medium">
              Applicable
            </span>
          </label>
          <SellerSelect
            value={productSubcategory || ""}
            onChange={(val) =>
              onProductSubcategoryChange && onProductSubcategoryChange(val)
            }
            options={subcategoryOptions}
            disabled={!productCategory}
            ariaLabel="Product subcategory"
          />
          <p className="text-[10px] text-[#7A877E] mt-1">
            Commodity / crop classification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product type */}
        <div className="min-w-0">
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
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>

        {/* Variety */}
        <div className="min-w-0">
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
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quality grade */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#38453D] mb-1">
            Quality grade{" "}
            <span className="text-[#7A877E] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <SellerSelect
            value={qualityGrade}
            onChange={onQualityGradeChange}
            options={QUALITY_GRADES}
            ariaLabel="Quality grade"
          />
          <p className="text-[10px] text-[#7A877E] mt-1">
            Grade list is configurable per category.
          </p>
        </div>

        {/* Size */}
        <div className="min-w-0">
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
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
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
