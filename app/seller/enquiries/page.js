"use client";

import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import EnquiryList from "@/components/seller/enquiries/EnquiryList";
import EnquiryDetail from "@/components/seller/enquiries/EnquiryDetail";

export default function BuyerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
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
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3C26]">
          Buyer enquiries
        </h1>
        <p className="text-xs sm:text-sm text-[#4E6D45] mt-1 font-medium">
          Enquiries and interest from buyers on your products
        </p>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap p-1 bg-[#EDF3DF] border border-[#DDE7CE] rounded-xl gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "ALL"
              ? "bg-[#C5F340] text-[#0B3C26] shadow-2xs"
              : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
          >
            All ({enquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("NEW")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "NEW"
              ? "bg-[#C5F340] text-[#0B3C26] shadow-2xs"
              : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
          >
            New ({newCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("REPLIED")}
            className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filterTab === "REPLIED"
              ? "bg-[#C5F340] text-[#0B3C26] shadow-2xs"
              : "text-[#4E6D45] hover:text-[#0B3C26]"
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
            className="w-full pl-3 pr-8 py-2 bg-white border border-[#DDE7CE] rounded-xl text-xs text-[#0B3C26] placeholder:text-[#7A877E] focus:outline-none focus:border-[#2D8A3E] shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#54754B] absolute right-2.5 top-2.5 pointer-events-none" />
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
