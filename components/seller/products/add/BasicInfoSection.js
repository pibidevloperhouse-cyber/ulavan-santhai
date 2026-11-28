"use client";

import React from "react";
import { getSellerCategories } from "@/services/categoryStorage";
import SellerSelect from "../../ui/SellerSelect";

export const PRODUCT_CATEGORIES = [
  "Agricultural Products",
  "Organic Products",
  "Agricultural Raw Materials",
  "Agriculture-Derived Ingredients",
  "Value-Added Products",
];

export const CATEGORY_TO_STORAGE_CODES = {
  "Agricultural Products": ["Farmer", "Agricultural Producer"],
  "Organic Products": ["Organic Producer"],
  "Agricultural Raw Materials": ["Raw-Material Provider"],
  "Agriculture-Derived Ingredients": ["Ingredient Producer"],
  "Value-Added Products": ["Value-Added Manufacturer", "Manufacturer"],
};

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
  productDescription,
  onProductDescriptionChange,
}) {
  const activeCategoriesList =
    Array.isArray(sellerCategories) && sellerCategories.length > 0
      ? sellerCategories.filter((c) => c.status !== "Inactive")
      : getSellerCategories().filter((c) => c.status !== "Inactive");

  const unlockedSet = new Set(unlockedCategories);
  const isSelectedCategoryUnlocked = Boolean(
    productCategory && unlockedSet.has(productCategory)
  );

  const mappedCodes = CATEGORY_TO_STORAGE_CODES[productCategory] || [];
  const availableSubcategories = isSelectedCategoryUnlocked
    ? Array.from(
        new Set(
          activeCategoriesList
            .filter(
              (c) =>
                mappedCodes.includes(c.code) ||
                mappedCodes.includes(c.name) ||
                c.name === productCategory ||
                c.code === productCategory
            )
            .flatMap((c) => c.subcategories || [])
        )
      )
    : [];

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...PRODUCT_CATEGORIES.map((cat) => ({
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
    <div className="space-y-3.5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
        <div>
          <h2 className="text-sm font-extrabold text-[#0B3C26]">
            Product information
          </h2>
          <p className="text-[11px] text-[#54754B]">
            Choose an unlocked category to see its product fields, or click a locked category to unlock it for ₹365.
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#C53030] bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full">
          * Required
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="min-w-0">
          <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
            Product category <span className="text-[#C53030]">*</span>
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

        <div className="min-w-0">
          <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
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

        <div className="min-w-0">
          <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
            Product name <span className="text-[#C53030]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Organic Foxtail Millet"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            className="w-full min-w-0 px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-[#3C5840] mb-1">
          Product description <span className="text-[#C53030]">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Describe the product clearly and accurately. Buyers read this before approaching you."
          value={productDescription}
          onChange={(e) => onProductDescriptionChange(e.target.value)}
          className="w-full px-3 py-2 bg-[#F8FAF3] focus:bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E] leading-relaxed transition-colors"
        />
      </div>
    </div>
  );
}
