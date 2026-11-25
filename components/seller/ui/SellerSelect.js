"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Lock } from "lucide-react";

/**
 * Custom viewport-constrained select dropdown for the Seller Portal.
 * Renders an inline listbox strictly constrained to its trigger width so
 * options never overflow past mobile cards or viewport edges.
 */
export default function SellerSelect({
  value = "",
  onChange,
  onLockedClick,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  triggerClassName = "",
  ariaLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (opt) => {
    if (disabled) return;
    setIsOpen(false);
    if (opt.locked) {
      if (onLockedClick) {
        onLockedClick(opt);
      }
      return;
    }
    if (onChange) {
      onChange(opt.value);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-w-0 flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs text-left border transition-colors ${
          disabled
            ? "bg-gray-100 text-[#7A877E] border-[#D8D2C4] cursor-not-allowed"
            : isOpen
            ? "bg-white border-[#24583B] text-[#1F2922] ring-1 ring-[#24583B]/20 cursor-pointer"
            : "bg-white border-[#D8D2C4] text-[#1F2922] hover:border-[#24583B]/60 cursor-pointer"
        } ${triggerClassName}`}
      >
        <span
          className={`truncate block flex-1 min-w-0 ${
            !selectedOption && !value ? "text-[#7A877E]" : ""
          }`}
        >
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#526458] shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#24583B]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 z-50 w-full max-w-full bg-white border border-[#D8D2C4] rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-98 duration-100"
        >
          {normalizedOptions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-[#7A877E]">
              No options available
            </li>
          ) : (
            normalizedOptions.map((opt) => {
              const isLocked = Boolean(opt.locked);
              const isSelected = !isLocked && opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer whitespace-normal break-words ${
                      isLocked
                        ? "text-[#7A877E] hover:bg-[#FAF8F5]"
                        : isSelected
                        ? "bg-[#E8F0E3] text-[#174B35] font-semibold"
                        : "text-[#1F2922] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <span className="flex-1 min-w-0">{opt.label}</span>
                    {isLocked ? (
                      <Lock
                        className="w-3.5 h-3.5 text-[#8A948D] shrink-0"
                        aria-hidden="true"
                      />
                    ) : isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#174B35] shrink-0" />
                    ) : null}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
