"use client";

import React from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

export default function ProductImagesSection({
  images = [],
  onSetPrimary,
  onDeleteImage,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#1F2922]">
            2. Product images
          </h2>
          <span className="text-[#C53030] text-[10px] font-semibold">
            Mandatory
          </span>
        </div>
        <span className="text-xs text-[#526458] font-medium">Gallery</span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-[#D2CDC0] bg-[#FAF8F5] rounded-xl p-6 text-center hover:border-[#24583B] transition-colors cursor-pointer">
        <UploadCloud className="w-8 h-8 text-[#24583B] mx-auto mb-2" />
        <div className="text-xs font-semibold text-[#1F2922]">
          Drag images here or{" "}
          <span className="text-[#24583B] underline">browse files</span>
        </div>
        <div className="text-[10px] text-[#7A877E] mt-1">
          Multiple images · JPG, PNG or WebP · max 5MB per image · size and
          format are validated on upload
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {images.map((img) => (
          <div
            key={img.id}
            className="border border-[#E4DFD5] rounded-lg p-3 bg-[#FCFAF7] space-y-2.5"
          >
            <div className="h-28 bg-[#EAEFEA] rounded-md flex items-center justify-center text-[#24583B]">
              <ImageIcon className="w-6 h-6" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#38453D] text-[11px]">
                <input
                  type="radio"
                  name="primary_image"
                  checked={img.isPrimary}
                  onChange={() => onSetPrimary(img.id)}
                  className="text-[#24583B] focus:ring-0"
                />
                {img.isPrimary ? "Primary image" : "Set as primary"}
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EAE5DB] text-[11px]">
              <button
                type="button"
                className="text-[#24583B] hover:underline"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onDeleteImage(img.id)}
                className="text-[#944444] hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#7A877E]">
        Each uploaded image supports preview, replace, delete and primary-image
        selection.
      </p>
    </div>
  );
}
