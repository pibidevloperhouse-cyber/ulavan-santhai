"use client";

import React, { useState } from "react";
import SellerHeader from "@/components/seller/layout/SellerHeader";
import SubscriptionBanner from "@/components/seller/dashboard/SubscriptionBanner";
import DashboardMetricCards from "@/components/seller/dashboard/DashboardMetricCards";
import ProductStatusGrid from "@/components/seller/dashboard/ProductStatusGrid";
import RecentEnquiriesCard from "@/components/seller/dashboard/RecentEnquiriesCard";
import RecentNotificationsCard from "@/components/seller/dashboard/RecentNotificationsCard";
import { useSessionUser } from "@/services/sessionAuth";
import {
  getDynamicSellerProfile,
  DASHBOARD_METRICS,
} from "@/data/sellerPortalData";

export default function SellerDashboardPage({ onMenuToggle }) {
  const sessionUser = useSessionUser();
  const profile = getDynamicSellerProfile(sessionUser);
  const [metrics] = useState(DASHBOARD_METRICS);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-medium">
            Welcome back, {profile.businessName || "Seller"}
          </p>
        </div>

        <SellerHeader
          onMenuToggle={onMenuToggle}
          avatarText={profile.avatarInitials || "S"}
          showAddProduct={true}
        />
      </div>

      {/* Subscription Status Banner */}
      <SubscriptionBanner daysRemaining={profile.subscription?.daysRemaining || 365} />

      {/* 4 Summary Metric Cards */}
      <DashboardMetricCards metrics={metrics} />

      {/* Product Listings by Status */}
      <ProductStatusGrid statusBreakdown={metrics.statusBreakdown} />

      {/* Bottom Grid: Recent Enquiries & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEnquiriesCard enquiries={metrics.recentEnquiries} />
        <RecentNotificationsCard notifications={metrics.recentNotifications} />
      </div>
    </div>
  );
}
