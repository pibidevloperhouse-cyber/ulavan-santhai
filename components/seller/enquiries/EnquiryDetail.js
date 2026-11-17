"use client";

import React from "react";
import StatusBadge from "../ui/StatusBadge";

export default function EnquiryDetail({
  enquiry,
  replyText,
  onReplyChange,
  feedbackNotice,
  onSaveDraft,
  onSendResponse,
}) {
  if (!enquiry) return null;

  return (
    <div className="bg-white border border-[#EAE6DD] rounded-xl p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Detail Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0ECE4]">
        <div>
          <h2 className="text-base font-bold text-[#1F2922]">
            {enquiry.buyerName}
          </h2>
          <p className="text-xs text-[#6B7870] mt-0.5">
            Buyer type: {enquiry.buyerType}
          </p>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-[#78857C] block text-[11px]">Product</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {enquiry.productName}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">Enquiry type</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {enquiry.enquiryType}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">Received</span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {enquiry.receivedDate}
          </span>
        </div>
      </div>

      {/* Buyer Message Card */}
      <div>
        <label className="block text-xs font-semibold text-[#38453D] mb-1.5">
          Buyer message
        </label>
        <div className="bg-[#FAF7F0] border border-[#E9E2D4] rounded-lg p-3.5 text-xs text-[#28352D] leading-relaxed">
          {enquiry.message}
        </div>
      </div>

      {/* Quantity & Intended Use */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[#78857C] block text-[11px]">
            Quantity required (if given)
          </span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {enquiry.quantityRequired || "—"}
          </span>
        </div>
        <div>
          <span className="text-[#78857C] block text-[11px]">
            Intended use (if given)
          </span>
          <span className="font-bold text-[#1F2922] mt-0.5 block">
            {enquiry.intendedUse || "—"}
          </span>
        </div>
      </div>

      {/* Buyer Contact Details Box */}
      <div>
        <span className="block text-xs font-semibold text-[#38453D] mb-1.5">
          Buyer contact details
        </span>
        <div className="bg-[#EFF8F2] border border-[#CDE5D4] rounded-lg p-3 text-xs text-[#22573A] leading-relaxed">
          What you can see here follows the platform&apos;s contact-visibility
          rules, which are still to be defined.
        </div>
      </div>

      {/* Response Section */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-semibold text-[#38453D]">
          Your response
        </label>
        <textarea
          rows={4}
          placeholder="Write your reply to the Buyer"
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          className="w-full p-3 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] placeholder:text-[#9BA59E] focus:outline-none focus:border-[#24583B] leading-relaxed"
        />

        {feedbackNotice && (
          <div className="text-xs text-[#24583B] font-medium bg-[#EBF6EE] px-3 py-1.5 rounded-md">
            {feedbackNotice}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F3] text-[#38463D] border border-[#D5CEC0] text-xs font-semibold rounded-lg transition-colors"
          >
            Save reply draft
          </button>
          <button
            type="button"
            onClick={onSendResponse}
            className="px-4 py-2 bg-[#24583B] hover:bg-[#1A432C] text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          >
            Send response
          </button>
        </div>
      </div>
    </div>
  );
}
