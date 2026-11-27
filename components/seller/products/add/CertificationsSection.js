"use client";

import React, { useRef, useState } from "react";
import { Plus, FileText, CheckCircle2, Trash2, Upload } from "lucide-react";
import SellerSelect from "../../ui/SellerSelect";

export default function CertificationsSection({
  certifications = [],
  onAddCertification,
  onRemoveCertification,
  onUpdateCertification,
}) {
  const fileInputRefs = useRef({});
  const [certErrors, setCertErrors] = useState({});

  const handleDocumentUpload = (certId, file) => {
    if (!file) return;

    // Clear previous error
    setCertErrors((prev) => ({ ...prev, [certId]: "" }));

    // Validation
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      setCertErrors((prev) => ({
        ...prev,
        [certId]: `"${file.name}" is not a valid format. Only PDF, JPG, or PNG are allowed.`,
      }));
      return;
    }

    if (file.size > maxSizeBytes) {
      setCertErrors((prev) => ({
        ...prev,
        [certId]: `"${file.name}" exceeds the 5MB size limit.`,
      }));
      return;
    }

    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    onUpdateCertification(certId, "documentUploaded", true);
    onUpdateCertification(certId, "documentName", file.name);
    onUpdateCertification(certId, "documentSize", fileSizeStr);
    onUpdateCertification(certId, "documentFile", file);
    onUpdateCertification(certId, "documentUrl", URL.createObjectURL(file));

    // Reset input
    if (fileInputRefs.current[certId]) {
      fileInputRefs.current[certId].value = "";
    }
  };

  const handleRemoveDocument = (certId) => {
    onUpdateCertification(certId, "documentUploaded", false);
    onUpdateCertification(certId, "documentName", "");
    onUpdateCertification(certId, "documentSize", "");
    onUpdateCertification(certId, "documentFile", null);
    onUpdateCertification(certId, "documentUrl", null);
    if (fileInputRefs.current[certId]) {
      fileInputRefs.current[certId].value = "";
    }
  };

  const certOptions = [
    { value: "", label: "Select certification" },
    { value: "FSSAI", label: "FSSAI Food Safety" },
    { value: "NPOP Organic", label: "NPOP Certified Organic" },
    { value: "Jaivik Bharat", label: "Jaivik Bharat" },
    { value: "ISO 22000", label: "ISO 22000 Food Management" },
    { value: "Other", label: "Other Certificate" },
  ];

  return (
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-extrabold text-[#0B3C26]">
            7. Certifications
          </h2>
          <span className="text-[#54754B] text-[10px]">Applicable</span>
        </div>
        <span className="text-xs text-[#4E6D45] font-medium">
          Compliance &amp; Documents
        </span>
      </div>

      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="border border-[#DDE7CE] rounded-2xl p-3.5 sm:p-4 bg-[#F5F7EC] space-y-3.5 min-w-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[#3C5840] mb-1">
                Certification name
              </label>
              <SellerSelect
                value={cert.name}
                onChange={(val) => onUpdateCertification(cert.id, "name", val)}
                options={certOptions}
                placeholder="Select certification"
                ariaLabel="Certification name"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[#3C5840] mb-1">
                Certification number
              </label>
              <input
                type="text"
                placeholder="Certificate / licence number"
                value={cert.number}
                onChange={(e) =>
                  onUpdateCertification(cert.id, "number", e.target.value)
                }
                className="w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3C5840] mb-1">
                Issuing authority
              </label>
              <input
                type="text"
                placeholder="Name of the issuing body"
                value={cert.authority}
                onChange={(e) =>
                  onUpdateCertification(cert.id, "authority", e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3C5840] mb-1">
                Validity (From · Until)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="date"
                  aria-label="Valid from"
                  value={cert.validFrom}
                  onChange={(e) =>
                    onUpdateCertification(cert.id, "validFrom", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
                />
                <span className="hidden sm:inline text-[#54754B] text-xs">·</span>
                <input
                  type="date"
                  aria-label="Valid until"
                  value={cert.validUntil}
                  onChange={(e) =>
                    onUpdateCertification(cert.id, "validUntil", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
                />
              </div>
            </div>
          </div>

          {/* Certificate Document Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-[#3C5840] mb-1.5">
              Certificate document
            </label>

            {/* Hidden File Input for Certificate Document */}
            <input
              ref={(el) => (fileInputRefs.current[cert.id] = el)}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) =>
                handleDocumentUpload(cert.id, e.target.files?.[0])
              }
              className="hidden"
            />

            {cert.documentName || cert.documentUploaded ? (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-[#ECF9C4] border border-[#C5E37A] rounded-xl min-w-0">
                <CheckCircle2 className="w-5 h-5 text-[#2D8A3E] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-bold text-[#0B3C26] truncate"
                    title={cert.documentName}
                  >
                    {cert.documentName || "Certificate Document Attached"}
                  </p>
                  {cert.documentSize && (
                    <p className="text-[10px] text-[#4E6D45]">
                      {cert.documentSize}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[cert.id]?.click()}
                    className="inline-flex items-center gap-1 font-bold text-[#2D8A3E] hover:underline cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                  <span className="text-[#C5E37A]">|</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(cert.id)}
                    className="inline-flex items-center gap-1 font-semibold text-[#944444] hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[cert.id]?.click()}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-[#D2DFC0] bg-white text-xs font-bold text-[#0B3C26] hover:bg-[#ECF9C4] hover:border-[#8DC63F] transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#2D8A3E]" />
                  <span>Upload document</span>
                </button>
                <span className="text-[10px] text-[#54754B]">
                  PDF, JPG or PNG · reviewed by the Admin · not automatically
                  verified
                </span>
              </div>
            )}

            {/* Error Message if Any */}
            {certErrors[cert.id] && (
              <p className="mt-1.5 text-[11px] font-semibold text-red-600">
                {certErrors[cert.id]}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-[#DDE7CE] flex justify-end">
            <button
              type="button"
              onClick={() => onRemoveCertification(cert.id)}
              className="text-xs font-semibold text-[#944444] hover:underline cursor-pointer"
            >
              Remove certification
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddCertification}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D2DFC0] bg-[#F5F7EC] text-xs font-bold text-[#0B3C26] hover:bg-[#ECF9C4] transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add another certification
      </button>
    </div>
  );
}
