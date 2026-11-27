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
    <div className="bg-white border border-[#DDE7CE] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 min-w-0">
      {/* Detail Header */}
      <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2.5 pb-3 border-b border-[#E7EEDB]">
        <div>
          <h2 className="text-base font-bold text-[#0B3C26]">
            {enquiry.buyerName}
          </h2>
          <p className="text-xs text-[#4E6D45] mt-0.5">
            Buyer type: {enquiry.buyerType}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={enquiry.status} />
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-[#54754B] block text-[11px]">Product</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {enquiry.productName}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">Enquiry type</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {enquiry.enquiryType}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">Received</span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {enquiry.receivedDate}
          </span>
        </div>
      </div>

      {/* Buyer Message Card */}
      <div>
        <label className="block text-xs font-semibold text-[#3C5840] mb-1.5">
          Buyer message
        </label>
        <div className="bg-[#F5F7EC] border border-[#DDE7CE] rounded-xl p-3.5 text-xs text-[#0B3C26] leading-relaxed">
          {enquiry.message}
        </div>
      </div>

      {/* Quantity & Intended Use */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[#54754B] block text-[11px]">
            Quantity required (if given)
          </span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {enquiry.quantityRequired || "—"}
          </span>
        </div>
        <div>
          <span className="text-[#54754B] block text-[11px]">
            Intended use (if given)
          </span>
          <span className="font-bold text-[#0B3C26] mt-0.5 block">
            {enquiry.intendedUse || "—"}
          </span>
        </div>
      </div>

      {/* Buyer Contact Details Box */}
      <div>
        <span className="block text-xs font-semibold text-[#3C5840] mb-1.5">
          Buyer contact details
        </span>
        <div className="bg-[#F2FAE0] border border-[#C5E37A] rounded-xl p-3 text-xs text-[#0B3C26] leading-relaxed">
          What you can see here follows the platform&apos;s contact-visibility
          rules, which are still to be defined.
        </div>
      </div>

      {/* Response Section */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-semibold text-[#3C5840]">
          Your response
        </label>
        <textarea
          rows={4}
          placeholder="Write your reply to the Buyer"
          value={replyText}
          onChange={(e) => onReplyChange(e.target.value)}
          className="w-full p-3 bg-white border border-[#D2DFC0] rounded-xl text-xs text-[#0B3C26] placeholder:text-[#7A877E] focus:outline-none focus:border-[#2D8A3E] leading-relaxed"
        />

        {feedbackNotice && (
          <div className="text-xs text-[#0B3C26] font-semibold bg-[#ECF9C4] px-3 py-1.5 rounded-lg">
            {feedbackNotice}
          </div>
        )}

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-4 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
          >
            Save reply draft
          </button>
          <button
            type="button"
            onClick={onSendResponse}
            className="px-4 py-2 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-2xs text-center cursor-pointer"
          >
            Send response
          </button>
        </div>
      </div>
    </div>
  );
}
