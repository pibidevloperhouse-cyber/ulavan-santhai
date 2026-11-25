"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import EnquiryList from "@/components/seller/enquiries/EnquiryList";
import EnquiryDetail from "@/components/seller/enquiries/EnquiryDetail";
import { INITIAL_ENQUIRIES } from "@/data/sellerPortalData";

export default function BuyerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [selectedId, setSelectedId] = useState("enq-1");
  const [filterTab, setFilterTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState("");

  const selectedEnquiry = useMemo(() => {
    return enquiries.find((e) => e.id === selectedId) || enquiries[0];
  }, [enquiries, selectedId]);

  const filteredList = useMemo(() => {
    return enquiries.filter((e) => {
      if (filterTab === "NEW" && e.status !== "New") return false;
      if (filterTab === "REPLIED" && e.status !== "Replied") return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          e.buyerName.toLowerCase().includes(query) ||
          e.productName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [enquiries, filterTab, searchQuery]);

  const handleSendResponse = () => {
    if (!replyText.trim()) return;
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === selectedId ? { ...e, status: "Replied" } : e
      )
    );
    setReplyText("");
    setFeedbackNotice("Response sent successfully.");
    setTimeout(() => setFeedbackNotice(""), 3500);
  };

  const handleSaveDraft = () => {
    if (!replyText.trim()) return;
    setFeedbackNotice("Draft saved successfully.");
    setTimeout(() => setFeedbackNotice(""), 3000);
  };

  const newCount = enquiries.filter((e) => e.status === "New").length;
  const repliedCount = enquiries.filter((e) => e.status === "Replied").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2922]">
          Buyer enquiries
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-medium">
          Enquiries and interest from buyers on your products
        </p>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap p-1 bg-[#EBE7DD] rounded-lg gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === "ALL"
                ? "bg-[#24583B] text-white shadow-xs"
                : "text-[#4B5A50] hover:text-[#1F2922]"
            }`}
          >
            All ({enquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("NEW")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === "NEW"
                ? "bg-[#24583B] text-white shadow-xs"
                : "text-[#4B5A50] hover:text-[#1F2922]"
            }`}
          >
            New ({newCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("REPLIED")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === "REPLIED"
                ? "bg-[#24583B] text-white shadow-xs"
                : "text-[#4B5A50] hover:text-[#1F2922]"
            }`}
          >
            Replied ({repliedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by Buyer or product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-white border border-[#D8D2C4] rounded-lg text-xs text-[#1F2922] placeholder:text-[#9BA59E] focus:outline-none focus:border-[#24583B] shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#8E9B92] absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Split Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-5 min-w-0">
          <EnquiryList
            enquiries={filteredList}
            selectedId={selectedId}
            onSelectEnquiry={setSelectedId}
          />
        </div>

        <div className="lg:col-span-7 min-w-0">
          <EnquiryDetail
            enquiry={selectedEnquiry}
            replyText={replyText}
            onReplyChange={setReplyText}
            feedbackNotice={feedbackNotice}
            onSaveDraft={handleSaveDraft}
            onSendResponse={handleSendResponse}
          />
        </div>
      </div>

      {/* Explanatory Footnote */}
      <p className="text-xs text-[#6B7280] leading-relaxed">
        Communicate directly with interested buyers, answer enquiries, and share
        custom bulk pricing quotes.
      </p>
    </div>
  );
}
