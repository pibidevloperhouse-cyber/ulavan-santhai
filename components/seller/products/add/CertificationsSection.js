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
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#1F2922]">
            7. Certifications
          </h2>
          <span className="text-[#7A877E] text-[10px]">Applicable</span>
        </div>
        <span className="text-xs text-[#526458] font-medium">
          Compliance &amp; Documents
        </span>
      </div>

      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="border border-[#E7E2D7] rounded-xl p-3.5 sm:p-4 bg-[#FCFBF8] space-y-3.5 min-w-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-[#38453D] mb-1">
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
              <label className="block text-xs font-semibold text-[#38453D] mb-1">
                Certification number
              </label>
              <input
                type="text"
                placeholder="Certificate / licence number"
                value={cert.number}
                onChange={(e) =>
                  onUpdateCertification(cert.id, "number", e.target.value)
                }
                className="w-full min-w-0 px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#38453D] mb-1">
                Issuing authority
              </label>
              <input
                type="text"
                placeholder="Name of the issuing body"
                value={cert.authority}
                onChange={(e) =>
                  onUpdateCertification(cert.id, "authority", e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#38453D] mb-1">
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
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
                />
                <span className="hidden sm:inline text-[#8A958E] text-xs">·</span>
                <input
                  type="date"
                  aria-label="Valid until"
                  value={cert.validUntil}
                  onChange={(e) =>
                    onUpdateCertification(cert.id, "validUntil", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
                />
              </div>
            </div>
          </div>

          {/* Certificate Document Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
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
              <div className="flex flex-wrap items-center gap-3 p-3 bg-[#EAF5EC] border border-[#BEE3C8] rounded-lg min-w-0">
                <CheckCircle2 className="w-5 h-5 text-[#1D7446] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-bold text-[#1D7446] truncate"
                    title={cert.documentName}
                  >
                    {cert.documentName || "Certificate Document Attached"}
                  </p>
                  {cert.documentSize && (
                    <p className="text-[10px] text-[#526458]">
                      {cert.documentSize}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[cert.id]?.click()}
                    className="inline-flex items-center gap-1 font-semibold text-[#24583B] hover:underline cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change</span>
                  </button>
                  <span className="text-[#BEE3C8]">|</span>
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
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5] hover:border-[#24583B] transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#24583B]" />
                  <span>Upload document</span>
                </button>
                <span className="text-[10px] text-[#7A877E]">
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

          <div className="pt-2 border-t border-[#EAE5DB] flex justify-end">
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
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5] cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add another certification
      </button>
    </div>
  );
}
