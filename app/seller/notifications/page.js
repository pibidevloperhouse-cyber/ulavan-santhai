"use client";

import React, { useState, useMemo } from "react";
import NotificationList from "@/components/seller/notifications/NotificationList";
import EventsCoveredCard from "@/components/seller/notifications/EventsCoveredCard";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "All") return true;
      if (activeTab === "Unread") return n.unread;
      if (activeTab === "Subscription and payments")
        return n.category === "Payments" || n.category === "Subscription";
      if (activeTab === "Buyer enquiries") return n.category === "Enquiries";
      if (activeTab === "Listings") return n.category === "Listings";
      if (activeTab === "Account") return n.category === "Account";
      return true;
    });
  }, [notifications, activeTab]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3C26]">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#4E6D45] mt-1 font-medium">
            In-app notifications about your account, listings, enquiries and payments
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="inline-flex items-center justify-center px-3.5 py-2 bg-white hover:bg-[#F5F7EC] text-[#0B3C26] border border-[#DDE7CE] text-xs font-semibold rounded-xl transition-colors shadow-2xs w-full sm:w-auto text-center cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {[
          { label: "All", key: "All" },
          { label: `Unread (${unreadCount})`, key: "Unread" },
          { label: "Subscription and payments", key: "Subscription and payments" },
          { label: "Buyer enquiries", key: "Buyer enquiries" },
          { label: "Listings", key: "Listings" },
          { label: "Account", key: "Account" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTab === tab.key
              ? "bg-[#C5F340] text-[#0B3C26] shadow-2xs"
              : "bg-[#EDF3DF] text-[#4E6D45] hover:text-[#0B3C26] hover:bg-[#E2ECCB]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split Layout: List & Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-8 min-w-0">
          <NotificationList
            notifications={filteredNotifications}
            onToggleRead={handleToggleRead}
          />
        </div>

        <div className="lg:col-span-4 min-w-0">
          <EventsCoveredCard />
        </div>
      </div>
    </div>
  );
}
