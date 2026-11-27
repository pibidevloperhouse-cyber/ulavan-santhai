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
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EEDB]">
        <h2 className="text-sm font-extrabold text-[#0B3C26]">
          6. Specifications and other attributes
        </h2>
        <span className="text-xs text-[#4E6D45] font-medium">Custom Parameters</span>
      </div>

      {/* Specifications */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-[#3C5840]">
          Specifications{" "}
          <span className="text-[#54754B] text-[10px] font-normal">
            Applicable
          </span>
        </label>

        {specifications.map((spec) => (
          <div
            key={spec.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-0 bg-[#F5F7EC] sm:bg-transparent rounded-xl border sm:border-0 border-[#DDE7CE]"
          >
            <input
              type="text"
              placeholder="Specification name"
              value={spec.name}
              onChange={(e) =>
                onUpdateSpecification(spec.id, "name", e.target.value)
              }
              className="flex-1 w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
            />
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) =>
                  onUpdateSpecification(spec.id, "value", e.target.value)
                }
                className="flex-1 w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
              />
              <button
                type="button"
                onClick={() => onRemoveSpecification(spec.id)}
                className="p-2 text-[#54754B] hover:text-[#C53030] rounded-md shrink-0 cursor-pointer"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D2DFC0] bg-[#F5F7EC] text-xs font-bold text-[#0B3C26] hover:bg-[#ECF9C4] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add specification
        </button>
      </div>

      {/* Other Attributes */}
      <div className="space-y-3 pt-4 border-t border-[#E7EEDB]">
        <label className="block text-xs font-semibold text-[#3C5840]">
          Other attributes{" "}
          <span className="text-[#2D8A3E] text-[10px] font-semibold">
            Configurable
          </span>
        </label>

        {otherAttributes.map((attr) => (
          <div
            key={attr.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:p-0 bg-[#F5F7EC] sm:bg-transparent rounded-xl border sm:border-0 border-[#DDE7CE]"
          >
            <input
              type="text"
              placeholder="Attribute name"
              value={attr.name}
              onChange={(e) =>
                onUpdateOtherAttribute(attr.id, "name", e.target.value)
              }
              className="flex-1 w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
            />
            <div className="flex items-center gap-2 w-full sm:flex-1">
              <input
                type="text"
                placeholder="Value"
                value={attr.value}
                onChange={(e) =>
                  onUpdateOtherAttribute(attr.id, "value", e.target.value)
                }
                className="flex-1 w-full px-3 py-2 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] focus:outline-none focus:border-[#2D8A3E]"
              />
              <button
                type="button"
                onClick={() => onRemoveOtherAttribute(attr.id)}
                className="p-2 text-[#54754B] hover:text-[#C53030] rounded-md shrink-0 cursor-pointer"
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
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D2DFC0] bg-[#F5F7EC] text-xs font-bold text-[#0B3C26] hover:bg-[#ECF9C4] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add attribute
        </button>

        <p className="text-[10px] text-[#54754B]">
          New attributes added later by the Admin appear here without
          redevelopment.
        </p>
      </div>
    </div>
  );
}
