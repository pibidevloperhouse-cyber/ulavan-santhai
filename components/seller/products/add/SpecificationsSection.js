"use client";

import React from "react";
import { Plus, X } from "lucide-react";

export default function SpecificationsSection({
  specifications = [],
  onAddSpecification,
  onRemoveSpecification,
  onUpdateSpecification,
  otherAttributes = [],
  onAddOtherAttribute,
  onRemoveOtherAttribute,
  onUpdateOtherAttribute,
}) {
  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0ECE4]">
        <h2 className="text-sm font-bold text-[#1F2922]">
          6. Specifications and other attributes
        </h2>
        <span className="text-xs text-[#526458] font-medium">Custom Parameters</span>
      </div>

      {/* Specifications */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#38453D]">
          Specifications{" "}
          <span className="text-[#7A877E] text-[10px] font-normal">
            Applicable
          </span>
        </label>

        {specifications.map((spec) => (
          <div
            key={spec.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-0 bg-[#FAF9F6] sm:bg-transparent rounded-lg border sm:border-0 border-[#EAE5DB]"
          >
            <input
              type="text"
              placeholder="Specification name"
              value={spec.name}
              onChange={(e) =>
                onUpdateSpecification(spec.id, "name", e.target.value)
              }
              className="flex-1 w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) =>
                  onUpdateSpecification(spec.id, "value", e.target.value)
                }
                className="flex-1 w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
              />
              <button
                type="button"
                onClick={() => onRemoveSpecification(spec.id)}
                className="p-2 text-[#7A877E] hover:text-[#C53030] rounded-md shrink-0 cursor-pointer"
                aria-label="Remove specification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddSpecification}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add specification
        </button>
      </div>

      {/* Other Attributes */}
      <div className="space-y-3 pt-4 border-t border-[#F0ECE4]">
        <label className="block text-xs font-semibold text-[#38453D]">
          Other attributes{" "}
          <span className="text-[#24583B] text-[10px] font-semibold">
            Configurable
          </span>
        </label>

        {otherAttributes.map((attr) => (
          <div
            key={attr.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-0 bg-[#FAF9F6] sm:bg-transparent rounded-lg border sm:border-0 border-[#EAE5DB]"
          >
            <input
              type="text"
              placeholder="Attribute name"
              value={attr.name}
              onChange={(e) =>
                onUpdateOtherAttribute(attr.id, "name", e.target.value)
              }
              className="flex-1 w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
            />
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                placeholder="Value"
                value={attr.value}
                onChange={(e) =>
                  onUpdateOtherAttribute(attr.id, "value", e.target.value)
                }
                className="flex-1 w-full px-3 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] focus:outline-none focus:border-[#24583B]"
              />
              <button
                type="button"
                onClick={() => onRemoveOtherAttribute(attr.id)}
                className="p-2 text-[#7A877E] hover:text-[#C53030] rounded-md shrink-0 cursor-pointer"
                aria-label="Remove attribute"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddOtherAttribute}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D2C4] bg-white text-xs font-semibold text-[#38453D] hover:bg-[#FAF8F5]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add attribute
        </button>

        <p className="text-[10px] text-[#7A877E]">
          New attributes added later by the Admin appear here without
          redevelopment.
        </p>
      </div>
    </div>
  );
}
