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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE6DD] relative space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A877E] hover:text-[#1F2922] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-14 h-14 rounded-xl bg-[#EAF2EC] text-[#24583B] flex items-center justify-center shrink-0 border border-[#D1E0D3]">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1F2922]">
              {product.name}
            </h3>
            <p className="text-xs text-[#6B7870] mt-0.5">{product.type}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={product.listingStatus} />
              <StatusBadge status={product.availability} />
            </div>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-2 gap-3.5 p-4 bg-[#FAF8F5] rounded-xl border border-[#ECE6D8] text-xs">
          <div>
            <span className="text-[11px] text-[#7A877E] block">Category</span>
            <span className="font-semibold text-[#1F2922] mt-0.5 block">
              {product.category}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#7A877E] block">
              Place of Origin
            </span>
            <span className="font-semibold text-[#1F2922] mt-0.5 block">
              {product.origin}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#7A877E] block">
              Minimum Order Quantity (MOQ)
            </span>
            <span className="font-semibold text-[#1F2922] mt-0.5 block">
              {product.moq}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#7A877E] block">
              Listing Status
            </span>
            <span className="font-semibold text-[#1F2922] mt-0.5 block">
              {product.listingStatus}
            </span>
          </div>
        </div>

        {/* Description & Transparency note */}
        <div className="text-xs text-[#526056] bg-[#F7FAF8] p-3 rounded-lg border border-[#D8E6DB] leading-relaxed">
          <span className="font-semibold text-[#1F2922] block mb-0.5">
            Producer Listing Details:
          </span>
          Verified agricultural listing showcased on Ulavan Santhai. Subject to
          platform rules and administrator approval.
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE4]">
          <Link
            href={`/seller/products/add?edit=${product.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit this product
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
