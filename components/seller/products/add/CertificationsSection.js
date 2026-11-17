"use client";

import React from "react";
import { Plus, FileText } from "lucide-react";

export default function CertificationsSection({
  certifications = [],
  onAddCertification,
  onRemoveCertification,
  onUpdateCertification,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE4]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#1F2922]">
            7. Certifications
          </h2>
          <span className="text-[#7A877E] text-[10px]">Applicable</span>
        </div>
        <span className="text-xs text-[#526458] font-medium">
          Compliance & Documents
        </span>
      </div>

      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="border border-[#E7E2D7] rounded-xl p-4 bg-[#FCFBF8] space-y-3.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#38453D] mb-1">
                Certification name
              </label>
              <select
                value={cert.name}
                onChange={(e) =>
                  onUpdateCertification(cert.id, "name", e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B] cursor-pointer"
              >
                <option value="">Select certification</option>
                <option value="FSSAI">FSSAI Food Safety</option>
                <option value="NPOP Organic">NPOP Certified Organic</option>
                <option value="Jaivik Bharat">Jaivik Bharat</option>
                <option value="ISO 22000">ISO 22000 Food Management</option>
                <option value="Other">Other Certificate</option>
              </select>
            </div>

            <div>
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
                className="w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
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
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={cert.validFrom}
                  onChange={(e) =>
                    onUpdateCertification(cert.id, "validFrom", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
                />
                <span className="text-[#8A958E] text-xs">·</span>
                <input
                  type="date"
                  value={cert.validUntil}
                  onChange={(e) =>
                    onUpdateCertification(cert.id, "validUntil", e.target.value)
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
                />
              </div>
            </div>
          </div>

          {/* Certificate document upload */}
          <div>
            <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
              Certificate document
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5]"
              >
                <FileText className="w-4 h-4 text-[#24583B]" />
                Upload document
              </button>
              <span className="text-[10px] text-[#7A877E]">
                PDF, JPG or PNG · reviewed by the Admin · not automatically
                verified
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAE5DB] flex justify-end">
            <button
              type="button"
              onClick={() => onRemoveCertification(cert.id)}
              className="text-xs font-semibold text-[#944444] hover:underline"
            >
              Remove certification
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddCertification}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5]"
      >
        <Plus className="w-3.5 h-3.5" />
        Add another certification
      </button>
    </div>
  );
}
