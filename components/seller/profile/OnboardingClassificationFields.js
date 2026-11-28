"use client";

import React from "react";
import {
  FPO_STRUCTURE_OPTIONS,
  ORGANIC_CERT_STATUS_OPTIONS,
} from "@/hooks/useSellerProfileState";
import SellerSelect from "../ui/SellerSelect";

function YesNoPillGroup({ label, value, onChange }) {
  return (
    <div>
      <span className="block text-[11px] font-semibold text-[#3C5840] mb-1">
        {label}
      </span>
      <div className="inline-flex p-0.5 rounded-xl bg-white border border-[#D2DFC0] gap-0.5">
        {["Yes", "No"].map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                active
                  ? "bg-[#0B3C26] text-[#C5F340]"
                  : "text-[#4E6D45] hover:text-[#0B3C26] hover:bg-[#F5F7EC]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "w-full min-w-0 px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs font-medium text-[#0B3C26] placeholder:text-[#7A8C7D] focus:outline-none focus:border-[#2D8A3E] focus:ring-2 focus:ring-[#C5F340]/50 transition-all";

const STANDARD_TYPES = [
  "Farmer",
  "Agricultural Producer",
  "Organic Producer",
  "Raw-Material Provider",
  "Ingredient Producer",
  "Manufacturer",
  "Value-Added Manufacturer",
  "Other",
];

/**
 * Renders onboarding-captured classification blocks for all active seller classifications.
 */
export default function OnboardingClassificationFields({
  profile,
  activeTypes = [],
  onFieldChange,
}) {
  const hasType = (type) => activeTypes.includes(type);
  const customTypes = activeTypes.filter((t) => !STANDARD_TYPES.includes(t));

  if (activeTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {/* 1. Farmer */}
      {(hasType("Farmer") || Boolean(profile.farmerFarmName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Direct Farmer &amp; Cultivator
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
              Farm name
            </label>
            <input
              type="text"
              value={profile.farmerFarmName}
              onChange={(e) => onFieldChange("farmerFarmName", e.target.value)}
              placeholder="e.g. Sri Murugan Thottam"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      )}

      {/* 2. Agricultural Producer (FPO / Society) */}
      {(hasType("Agricultural Producer") || Boolean(profile.fpoName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            FPO &amp; Agricultural Cooperative
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                FPO / Society legal name
              </label>
              <input
                type="text"
                value={profile.fpoName}
                onChange={(e) => onFieldChange("fpoName", e.target.value)}
                placeholder="e.g. Kongu Uzhavar Producer Co Ltd"
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Organization structure
              </label>
              <SellerSelect
                value={profile.fpoStructure}
                onChange={(val) => onFieldChange("fpoStructure", val)}
                options={FPO_STRUCTURE_OPTIONS}
                ariaLabel="Organization structure"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <YesNoPillGroup
              label="Registered under CIN / Society Reg?"
              value={profile.fpoIsRegistered}
              onChange={(val) => {
                onFieldChange("fpoIsRegistered", val);
                if (val === "No") onFieldChange("fpoRegNumber", "");
              }}
            />
            {profile.fpoIsRegistered === "Yes" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  Registration no (CIN / Society Reg)
                </label>
                <input
                  type="text"
                  value={profile.fpoRegNumber}
                  onChange={(e) =>
                    onFieldChange("fpoRegNumber", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. U01409TZ2021PTC028491"
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Organic Producer */}
      {(hasType("Organic Producer") || Boolean(profile.organicFarmName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Organic Certified Producer
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Organic farm / brand name
              </label>
              <input
                type="text"
                value={profile.organicFarmName}
                onChange={(e) => onFieldChange("organicFarmName", e.target.value)}
                placeholder="e.g. Pristine Nature Organic Farm"
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Certification status
              </label>
              <SellerSelect
                value={profile.organicCertStatus}
                onChange={(val) => onFieldChange("organicCertStatus", val)}
                options={ORGANIC_CERT_STATUS_OPTIONS}
                ariaLabel="Certification status"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <YesNoPillGroup
              label="Do you have an organic license number?"
              value={profile.organicHasLicense}
              onChange={(val) => {
                onFieldChange("organicHasLicense", val);
                if (val === "No") onFieldChange("organicScopeNumber", "");
              }}
            />
            {profile.organicHasLicense === "Yes" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  Certificate scope / license no
                </label>
                <input
                  type="text"
                  value={profile.organicScopeNumber}
                  onChange={(e) =>
                    onFieldChange("organicScopeNumber", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. NPOP/NAB/0017/ORG-2024"
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Raw-Material Provider */}
      {(hasType("Raw-Material Provider") || Boolean(profile.rawProviderName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Bulk Raw-Material Provider
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
              Business / provider name
            </label>
            <input
              type="text"
              value={profile.rawProviderName}
              onChange={(e) => onFieldChange("rawProviderName", e.target.value)}
              placeholder="e.g. Cauvery Raw Agri Commodities"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      )}

      {/* 5. Ingredient Producer */}
      {(hasType("Ingredient Producer") || Boolean(profile.ingProducerName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Agri-Ingredient Producer
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Enterprise name
              </label>
              <input
                type="text"
                value={profile.ingProducerName}
                onChange={(e) => onFieldChange("ingProducerName", e.target.value)}
                placeholder="e.g. Kongu Traditional Chekku Oils"
                className={INPUT_CLASS}
              />
            </div>
            <YesNoPillGroup
              label="Do you have FSSAI food license?"
              value={profile.ingHasFssai}
              onChange={(val) => {
                onFieldChange("ingHasFssai", val);
                if (val === "No") onFieldChange("ingFssaiNumber", "");
              }}
            />
          </div>
          {profile.ingHasFssai === "Yes" && (
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                FSSAI food license (14 digits)
              </label>
              <input
                type="text"
                maxLength={14}
                value={profile.ingFssaiNumber}
                onChange={(e) => onFieldChange("ingFssaiNumber", e.target.value)}
                placeholder="e.g. 10020042000789"
                className={INPUT_CLASS}
              />
            </div>
          )}
        </div>
      )}

      {/* 6. Manufacturer */}
      {(hasType("Manufacturer") || Boolean(profile.mfgSellerName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Industrial Agro-Manufacturer
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
              Company name
            </label>
            <input
              type="text"
              value={profile.mfgSellerName}
              onChange={(e) => onFieldChange("mfgSellerName", e.target.value)}
              placeholder="e.g. Salem Agro Refineries Ltd"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <YesNoPillGroup
              label="Do you have FSSAI food license?"
              value={profile.mfgHasFssai}
              onChange={(val) => {
                onFieldChange("mfgHasFssai", val);
                if (val === "No") onFieldChange("mfgFssaiNumber", "");
              }}
            />
            {profile.mfgHasFssai === "Yes" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  FSSAI food license (14 digits)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={profile.mfgFssaiNumber}
                  onChange={(e) => onFieldChange("mfgFssaiNumber", e.target.value)}
                  placeholder="e.g. 10020042000789"
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <YesNoPillGroup
              label="Are you GST registered?"
              value={profile.mfgIsGst}
              onChange={(val) => {
                onFieldChange("mfgIsGst", val);
                if (val === "No") onFieldChange("mfgGstin", "");
              }}
            />
            {profile.mfgIsGst === "Yes" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  GSTIN (15 digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={profile.mfgGstin}
                  onChange={(e) =>
                    onFieldChange("mfgGstin", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Value-Added Manufacturer */}
      {(hasType("Value-Added Manufacturer") || Boolean(profile.vaBrandName)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            Value-Added Food Products
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Brand / enterprise name
              </label>
              <input
                type="text"
                value={profile.vaBrandName}
                onChange={(e) => onFieldChange("vaBrandName", e.target.value)}
                placeholder="e.g. Madurai Traditional Pickles & Snacks"
                className={INPUT_CLASS}
              />
            </div>
            <YesNoPillGroup
              label="Do you have FSSAI food license?"
              value={profile.vaHasFssai}
              onChange={(val) => {
                onFieldChange("vaHasFssai", val);
                if (val === "No") onFieldChange("vaFssaiNumber", "");
              }}
            />
          </div>
          {profile.vaHasFssai === "Yes" && (
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                FSSAI license (14 digits)
              </label>
              <input
                type="text"
                maxLength={14}
                value={profile.vaFssaiNumber}
                onChange={(e) => onFieldChange("vaFssaiNumber", e.target.value)}
                placeholder="e.g. 10020042000999"
                className={INPUT_CLASS}
              />
            </div>
          )}
        </div>
      )}

      {/* 8. Other or Custom Admin Category */}
      {(hasType("Other") ||
        customTypes.length > 0 ||
        Boolean(profile.otherSellerName) ||
        Boolean(profile.otherGstin)) && (
        <div className="p-3.5 rounded-xl bg-[#F8FAF2] border border-[#DDE7CE] space-y-2.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#2D8A3E]">
            {customTypes.length > 0
              ? `${customTypes.join(", ")} Enterprise`
              : "Specialized Farm Enterprise"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Enterprise name
              </label>
              <input
                type="text"
                value={profile.otherSellerName}
                onChange={(e) => onFieldChange("otherSellerName", e.target.value)}
                placeholder="e.g. Thanjavur Coconut Saplings Nursery"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                Primary enterprise activity
              </label>
              <input
                type="text"
                value={profile.otherActivity}
                onChange={(e) => onFieldChange("otherActivity", e.target.value)}
                placeholder="e.g. Grafted Fruit Saplings, Apiculture, Mushrooms"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <YesNoPillGroup
              label="Are you GST registered?"
              value={profile.otherIsGst}
              onChange={(val) => {
                onFieldChange("otherIsGst", val);
                if (val === "No") onFieldChange("otherGstin", "");
              }}
            />
            {profile.otherIsGst === "Yes" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#3C5840] mb-1">
                  GSTIN (15 digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={profile.otherGstin}
                  onChange={(e) =>
                    onFieldChange("otherGstin", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className={INPUT_CLASS}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
