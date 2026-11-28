"use client";

import React, { useRef, useState } from "react";
import {
  FileText,
  Eye,
  UploadCloud,
  CheckCircle2,
  X,
  RefreshCw,
  FileCheck2,
} from "lucide-react";
import { uploadDocument } from "@/services/onboardingApi";
import {
  SELLER_DOCUMENT_LABELS,
  getRequiredSellerDocumentTypes,
} from "@/hooks/useSellerProfileState";

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compact onboarding verification document viewer and uploader card.
 */
export default function SellerDocumentsSection({
  documents = {},
  sellerTypes = [],
  profile = {},
  onDocumentUploaded,
}) {
  const [uploadingType, setUploadingType] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileInputRef = useRef(null);
  const targetTypeRef = useRef("BUSINESS_CERTIFICATE");

  const requiredDocKeys = getRequiredSellerDocumentTypes(sellerTypes, profile);
  const existingDocKeys = Object.keys(documents || {});
  const slotKeys = Array.from(new Set([...requiredDocKeys, ...existingDocKeys]));

  if (slotKeys.length === 0) {
    return null;
  }

  const triggerFilePicker = (docType) => {
    targetTypeRef.current = docType;
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    const docType = targetTypeRef.current || "BUSINESS_CERTIFICATE";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "jpg", "jpeg", "png"].includes(ext)) {
      setUploadError("Only PDF, JPG, JPEG, and PNG files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File exceeds the 5 MB limit.");
      e.target.value = "";
      return;
    }

    setUploadingType(docType);
    setUploadError("");

    try {
      const result = await uploadDocument(file, docType);
      const previewUrl =
        result?.data?.url ||
        (typeof window !== "undefined" ? URL.createObjectURL(file) : "");

      const docPayload = {
        documentId: result?.documentId || `doc_${Date.now()}`,
        documentType: docType,
        fileName: file.name,
        fileSize: file.size,
        url: previewUrl,
        status: result?.success ? "Uploaded" : "Saved in session",
        uploadedAt: new Date().toISOString(),
      };

      onDocumentUploaded?.(docType, docPayload);

      if (!result?.success && result?.error) {
        setUploadError(
          `Saved "${file.name}" locally; server upload reported: ${result.error}`
        );
      }
    } catch (err) {
      setUploadError(err.message || "Unable to upload document.");
    } finally {
      setUploadingType("");
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 h-full flex flex-col min-w-0">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E7EEDB]">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#ECF9C4] text-[#0B3C26] flex items-center justify-center shrink-0">
            <FileCheck2 className="w-3.5 h-3.5 stroke-[2.2]" />
          </span>
          <h2 className="text-sm font-extrabold text-[#0B3C26]">
            Verification documents
          </h2>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-[#F5F7EC] border border-[#DDE7CE] text-[10px] font-bold text-[#0B3C26]">
          {existingDocKeys.length} uploaded
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileSelected}
        className="hidden"
      />

      {uploadError && (
        <div className="text-xs text-[#985F10] bg-[#FFF9EE] border border-[#FDE0B4] rounded-xl px-3 py-2 font-medium">
          {uploadError}
        </div>
      )}

      <div className="divide-y divide-[#E7EEDB] border border-[#DDE7CE] rounded-xl overflow-hidden bg-[#FCFDF9]">
        {slotKeys.map((docType) => {
          const meta = SELLER_DOCUMENT_LABELS[docType] || {
            title: docType.replace(/_/g, " "),
          };
          const doc = documents?.[docType] || null;
          const isUploading = uploadingType === docType;

          return (
            <div
              key={docType}
              className="p-3 flex items-center justify-between gap-2.5 bg-white"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    doc
                      ? "bg-[#0B3C26] text-[#C5F340]"
                      : "bg-[#ECF9C4] text-[#0B3C26]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0B3C26] truncate">
                    {meta.title}
                  </div>
                  {doc ? (
                    <div className="text-[11px] text-[#2D8A3E] font-medium flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                      {doc.fileSize ? (
                        <span className="text-[#54754B] shrink-0">
                          · {formatFileSize(doc.fileSize)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#54754B]">
                      {isUploading ? "Uploading..." : "Not uploaded"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {doc?.url && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F7EC] hover:bg-[#ECF9C4] border border-[#DDE7CE] text-[11px] font-bold text-[#0B3C26] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                )}
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => triggerFilePicker(docType)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5F7EC] border border-[#D2DFC0] text-[11px] font-bold text-[#0B3C26] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {doc ? (
                    <>
                      <RefreshCw className={`w-3 h-3 ${isUploading ? "animate-spin" : ""}`} />
                      Replace
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3 h-3 text-[#2D8A3E]" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-[#DDE7CE] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7EEDB] pb-2.5">
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#0B3C26] truncate">
                  {previewDoc.fileName || "Document preview"}
                </h4>
                <p className="text-[11px] text-[#4E6D45]">
                  {SELLER_DOCUMENT_LABELS[previewDoc.documentType]?.title ||
                    previewDoc.documentType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl text-[#4E6D45] hover:bg-[#F5F7EC] cursor-pointer"
                aria-label="Close document preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F5F7EC] rounded-xl p-3 flex items-center justify-center min-h-[240px]">
              {previewDoc.fileName?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.fileName}
                  className="w-full h-[55vh] rounded-lg border border-[#DDE7CE]"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDoc.url}
                  alt={previewDoc.fileName || "Verification Document"}
                  className="max-h-[55vh] max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
