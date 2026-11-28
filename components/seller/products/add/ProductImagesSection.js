"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw } from "lucide-react";

export default function ProductImagesSection({
  images = [],
  onAddImages,
  onReplaceImage,
  onSetPrimary,
  onDeleteImage,
}) {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replacingId, setReplacingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const processFiles = (fileList) => {
    setErrorMessage("");
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not a supported format. Please upload JPG, PNG, or WebP.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        setErrorMessage(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newImgs = validFiles.map((file, idx) => ({
      id: `img_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      url: URL.createObjectURL(file),
      isPrimary: false,
    }));

    if (onAddImages) {
      onAddImages(newImgs);
    }
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const triggerReplace = (id) => {
    setReplacingId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
      replaceInputRef.current.click();
    }
  };

  const handleReplaceChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`"${file.name}" exceeds 5MB.`);
      return;
    }

    const updated = {
      id: replacingId,
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      url: URL.createObjectURL(file),
    };

    if (onReplaceImage) {
      onReplaceImage(replacingId, updated);
    }
    setReplacingId(null);
  };

  return (
    <div className="space-y-3 pt-3.5 border-t border-[#E7EEDB] min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-extrabold text-[#0B3C26]">
            Product images <span className="text-[#C53030]">*</span>
          </h3>
          <p className="text-[11px] text-[#54754B]">
            Upload multiple photos and pick the primary image shown to buyers.
          </p>
        </div>
        <span className="text-[10px] text-[#2D8A3E] bg-[#ECF9C4] border border-[#C5E37A] px-2.5 py-0.5 rounded-full font-bold">
          {images.length > 0 ? `${images.length} selected` : "Multiple allowed"}
        </span>
      </div>

      {/* Hidden File Input for Multiple Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden File Input for Image Replacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleReplaceChange}
        className="hidden"
      />

      {/* Interactive Drag & Drop Upload Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all cursor-pointer select-none ${
          isDragging
            ? "border-[#2D8A3E] bg-[#ECF9C4]"
            : "border-[#D2DFC0] bg-[#F5F7EC] hover:border-[#2D8A3E] hover:bg-[#ECF9C4]/50"
        }`}
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DDE7CE] flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-[#2D8A3E]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0B3C26]">
              Drag &amp; drop images here or{" "}
              <span className="text-[#2D8A3E] underline underline-offset-2">browse files</span>
            </div>
            <div className="text-[10px] text-[#54754B]">
              Multiple JPG, PNG or WebP · max 5MB per image
            </div>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-white border border-[#D2DFC0] text-[11px] font-bold text-[#0B3C26] shrink-0">
          + Add images
        </span>
      </div>

      {/* Error Message if Any */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-red-500 hover:text-red-800 text-xs font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {images.map((img) => (
              <div
                key={img.id}
                className={`border rounded-xl p-2 space-y-1.5 transition-all ${
                  img.isPrimary
                    ? "border-[#8DC63F] bg-[#F2FAE0] ring-1 ring-[#8DC63F]"
                    : "border-[#DDE7CE] bg-[#F5F7EC]"
                }`}
              >
                {/* Thumbnail Display */}
                <div className="h-20 bg-[#ECF9C4] rounded-lg overflow-hidden flex items-center justify-center relative">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.name || "Product preview"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#2D8A3E]" />
                  )}
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#C5F340] text-[#0B3C26] text-[10px] font-extrabold shadow-xs">
                      Primary
                    </span>
                  )}
                </div>

                {/* Name / Info */}
                {img.name && (
                  <p className="text-[11px] text-[#0B3C26] font-semibold truncate" title={img.name}>
                    {img.name}
                  </p>
                )}

                {/* Primary Radio */}
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#3C5840] text-[11px]">
                    <input
                      type="radio"
                      name="primary_image"
                      checked={Boolean(img.isPrimary)}
                      onChange={() => onSetPrimary?.(img.id)}
                      className="text-[#2D8A3E] focus:ring-0 cursor-pointer accent-[#2D8A3E]"
                    />
                    <span className={img.isPrimary ? "font-bold text-[#2D8A3E]" : ""}>
                      {img.isPrimary ? "Primary image" : "Set as primary"}
                    </span>
                  </label>
                </div>

                {/* Replace & Delete Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DDE7CE] text-[11px]">
                  <button
                    type="button"
                    onClick={() => triggerReplace(img.id)}
                    className="inline-flex items-center gap-1 text-[#2D8A3E] font-semibold hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteImage?.(img.id)}
                    className="inline-flex items-center gap-1 text-[#944444] hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
