"use client";

import React from "react";
import { getSellerCategories } from "@/services/categoryStorage";
import SellerSelect from "../../ui/SellerSelect";

const QUALITY_GRADES = [
  "Select grade",
  "Grade A (Export / Premium)",
  "Grade B (Commercial / Standard)",
  "Grade C (Processing)",
];

export default function BasicInfoSection({
  productName,
  onProductNameChange,
  productCategory,
  onProductCategoryChange,
  productSubcategory,
  onProductSubcategoryChange,
  sellerCategories,
  unlockedCategories = [],
  onLockedCategoryClick,
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
  const activeCategoriesList =
    Array.isArray(sellerCategories) && sellerCategories.length > 0
      ? sellerCategories.filter((c) => c.status !== "Inactive")
      : getSellerCategories().filter((c) => c.status !== "Inactive");

  const classificationNames = activeCategoriesList.map((c) => c.code || c.name);
  const unlockedSet = new Set(unlockedCategories);
  const combinedCategories = Array.from(
    new Set([...classificationNames, ...unlockedCategories.filter(Boolean)])
  );

  const isSelectedCategoryUnlocked = Boolean(
    productCategory && unlockedSet.has(productCategory)
  );

  const matchedCatObj = activeCategoriesList.find(
    (c) => (c.code || c.name) === productCategory || c.name === productCategory
  );

  // Available subcategories strictly from the chosen active Seller Onboarding classification
  const availableSubcategories = isSelectedCategoryUnlocked
    ? matchedCatObj?.subcategories || []
    : [];

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...combinedCategories.map((cat) => ({
      value: cat,
      label: cat,
      locked: !unlockedSet.has(cat),
    })),
  ];

  const subcategoryOptions = isSelectedCategoryUnlocked
    ? [
        { value: "", label: "-- Select subcategory --" },
        ...availableSubcategories.map((sub) => ({ value: sub, label: sub })),
        { value: "Other", label: "Other / Custom" },
      ]
    : [
        {
          value: "",
          label: "-- Select active category first --",
        },
      ];

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          1. Basic information
        </h2>
        <span className="text-xs text-[#4E6D45] font-medium">Core Details</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product name */}
        <div className="sm:col-span-2 lg:col-span-1 min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
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
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        {/* Product category */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Product category{" "}
            <span className="text-[#C53030] text-[10px] font-normal">
              Mandatory
            </span>
          </label>
          <SellerSelect
            value={isSelectedCategoryUnlocked ? productCategory : ""}
            onChange={(val) => {
              onProductCategoryChange(val);
              if (onProductSubcategoryChange) {
                onProductSubcategoryChange("");
              }
            }}
            onLockedClick={(opt) => {
              if (onLockedCategoryClick) {
                onLockedCategoryClick(opt.value);
              }
            }}
            options={categoryOptions}
            placeholder="Select a category"
            ariaLabel="Product category"
          />
        </div>

        {/* Product subcategory */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Subcategory{" "}
            <span className="text-[#2D8A3E] text-[10px] font-semibold">
              Applicable
            </span>
          </label>
          <SellerSelect
            value={isSelectedCategoryUnlocked ? productSubcategory || "" : ""}
            onChange={(val) =>
              onProductSubcategoryChange && onProductSubcategoryChange(val)
            }
            options={subcategoryOptions}
            disabled={!isSelectedCategoryUnlocked}
            ariaLabel="Product subcategory"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product type */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Product type{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. Flour, spice, grain, pasta"
            value={productType}
            onChange={(e) => onProductTypeChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>

        {/* Variety */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Variety{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. variety or cultivar name"
            value={variety}
            onChange={(e) => onVarietyChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Quality grade */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Quality grade{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <SellerSelect
            value={qualityGrade}
            onChange={onQualityGradeChange}
            options={QUALITY_GRADES}
            ariaLabel="Quality grade"
          />
          <p className="text-[10px] text-[#54754B] mt-1">
            Grade list is configurable per category.
          </p>
        </div>

        {/* Size */}
        <div className="min-w-0">
          <label className="block text-xs font-semibold text-[#3C5840] mb-1">
            Size{" "}
            <span className="text-[#54754B] text-[10px] font-normal">
              Applicable
            </span>
          </label>
          <input
            type="text"
            placeholder="e.g. small / medium / large, or a size range"
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
          />
        </div>
      </div>

      {/* Product description */}
      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1">
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
          className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] leading-relaxed"
        />
        <p className="text-[10px] text-[#54754B] mt-1">
          You are responsible for accurate, complete, current and non-misleading
          information.
        </p>
      </div>
    </div>
  );
}
