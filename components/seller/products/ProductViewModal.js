"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Image as ImageIcon, Pencil } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function ProductViewModal({ product, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl border border-[#DDE7CE] relative space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-lg text-[#54754B] hover:text-[#0B3C26] hover:bg-[#F5F7EC] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 sm:gap-3.5 pr-8">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0 border border-[#C5E37A]">
            <ImageIcon className="w-6 sm:w-7 h-6 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-[#0B3C26] truncate">
              {product.name}
            </h3>
            <p className="text-xs text-[#4E6D45] mt-0.5 truncate">{product.type}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
              <StatusBadge status={product.listingStatus} />
              <StatusBadge status={product.availability} />
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 p-3.5 sm:p-4 bg-[#F5F7EC] rounded-xl border border-[#DDE7CE] text-xs">
          <div>
            <span className="text-[11px] text-[#54754B] block">Category</span>
            <span className="font-semibold text-[#0B3C26] mt-0.5 block">
              {product.category}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#54754B] block">
              Place of Origin
            </span>
            <span className="font-semibold text-[#0B3C26] mt-0.5 block">
              {product.origin}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#54754B] block">
              Minimum Order Quantity (MOQ)
            </span>
            <span className="font-semibold text-[#0B3C26] mt-0.5 block">
              {product.moq}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#54754B] block">
              Listing Status
            </span>
            <span className="font-semibold text-[#0B3C26] mt-0.5 block">
              {product.listingStatus}
            </span>
          </div>
        </div>

        {/* Description & Transparency note */}
        <div className="text-xs text-[#3C5840] bg-[#F2F7E6] p-3 rounded-xl border border-[#DCE8C6] leading-relaxed">
          <span className="font-semibold text-[#0B3C26] block mb-0.5">
            Producer Listing Details:
          </span>
          Verified agricultural listing showcased on Ulavan Santhai. Subject to
          platform rules and administrator approval.
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2.5 pt-2 border-t border-[#E7EEDB]">
          <Link
            href={`/seller/products/add?edit=${product.id}`}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs text-center"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit this product
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#3C5840] border border-[#DDE7CE] text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
