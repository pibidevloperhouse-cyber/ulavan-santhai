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
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#1F2922]">
            2. Product images
          </h2>
          <span className="text-[#C53030] text-[10px] font-semibold">
            Mandatory
          </span>
        </div>
        <span className="text-xs text-[#526458] font-medium">
          {images.length > 0 ? `${images.length} uploaded` : "Gallery"}
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
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? "border-[#24583B] bg-[#EAF5EC] scale-[1.005]"
            : "border-[#D2CDC0] bg-[#FAF8F5] hover:border-[#24583B] hover:bg-[#F5F2EB]"
        }`}
      >
        <UploadCloud className="w-8 h-8 text-[#24583B] mx-auto mb-2 transition-transform group-hover:scale-110" />
        <div className="text-xs font-semibold text-[#1F2922]">
          Drag images here or{" "}
          <span className="text-[#24583B] underline underline-offset-2">browse files</span>
        </div>
        <div className="text-[10px] text-[#7A877E] mt-1">
          Multiple images · JPG, PNG or WebP · max 5MB per image · size and
          format are validated on upload
        </div>
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
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-[#38453D]">
            Uploaded Images ({images.length})
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className={`border rounded-lg p-3 space-y-2.5 transition-all ${
                  img.isPrimary
                    ? "border-[#24583B] bg-[#F4F8F4] ring-1 ring-[#24583B]"
                    : "border-[#E4DFD5] bg-[#FCFAF7]"
                }`}
              >
                {/* Thumbnail Display */}
                <div className="h-28 bg-[#EAEFEA] rounded-md overflow-hidden flex items-center justify-center relative">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.name || "Product preview"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[#24583B]" />
                  )}
                  {img.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#24583B] text-white text-[10px] font-bold shadow-xs">
                      Primary
                    </span>
                  )}
                </div>

                {/* Name / Info */}
                {img.name && (
                  <p className="text-[11px] text-[#38453D] font-medium truncate" title={img.name}>
                    {img.name}
                  </p>
                )}

                {/* Primary Radio */}
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#38453D] text-[11px]">
                    <input
                      type="radio"
                      name="primary_image"
                      checked={Boolean(img.isPrimary)}
                      onChange={() => onSetPrimary?.(img.id)}
                      className="text-[#24583B] focus:ring-0 cursor-pointer accent-[#24583B]"
                    />
                    <span className={img.isPrimary ? "font-bold text-[#24583B]" : ""}>
                      {img.isPrimary ? "Primary image" : "Set as primary"}
                    </span>
                  </label>
                </div>

                {/* Replace & Delete Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EAE5DB] text-[11px]">
                  <button
                    type="button"
                    onClick={() => triggerReplace(img.id)}
                    className="inline-flex items-center gap-1 text-[#24583B] hover:underline cursor-pointer"
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

      <p className="text-[10px] text-[#7A877E]">
        Each uploaded image supports preview, replace, delete, and primary-image
        selection.
      </p>
    </div>
  );
}
