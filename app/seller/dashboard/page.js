"use client";

import React, { useState, useEffect, useMemo } from "react";
import SellerHeader from "@/components/seller/layout/SellerHeader";
import SubscriptionBanner from "@/components/seller/dashboard/SubscriptionBanner";
import DashboardMetricCards from "@/components/seller/dashboard/DashboardMetricCards";
import ProductStatusGrid from "@/components/seller/dashboard/ProductStatusGrid";
import RecentEnquiriesCard from "@/components/seller/dashboard/RecentEnquiriesCard";
import RecentNotificationsCard from "@/components/seller/dashboard/RecentNotificationsCard";
import { useSessionUser } from "@/services/sessionAuth";
import { getSellerProducts } from "@/services/productApi";
import {
  getDynamicSellerProfile,
  DASHBOARD_METRICS,
} from "@/data/sellerPortalData";

export default function SellerDashboardPage({ onMenuToggle }) {
  const sessionUser = useSessionUser();
  const profile = useMemo(
    () => getDynamicSellerProfile(sessionUser),
    [sessionUser]
  );
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await getSellerProducts();
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch {
        // Fallback smoothly to empty metrics when offline/unauthenticated
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const liveMetrics = useMemo(() => {
    const countsByStatus = new Map();
    for (const p of products) {
      const statusLabel = p.listingStatus || "Draft";
      countsByStatus.set(
        statusLabel,
        (countsByStatus.get(statusLabel) || 0) + 1
      );
    }

    const publishedCount = countsByStatus.get("Published") || 0;

    return {
      ...DASHBOARD_METRICS,
      accountStatus: {
        status: profile.accountStatus || "Active",
        subtext: "Verified seller account",
      },
      subscription: {
        status: profile.subscription?.status || "Active",
        subtext: `${profile.subscription?.price || "₹365 / year"} · Active`,
      },
      totalProducts: {
        count: products.length,
        subtext: `${publishedCount} published live`,
      },
      statusBreakdown: DASHBOARD_METRICS.statusBreakdown.map((item) => ({
        ...item,
        count: countsByStatus.get(item.label) || 0,
      })),
    };
  }, [products, profile]);

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-medium truncate">
            Welcome back, {profile.businessName || "Seller"}
          </p>
        </div>

        <SellerHeader
          onMenuToggle={onMenuToggle}
          avatarText={profile.avatarInitials || "S"}
          showAddProduct={true}
        />
      </div>

      {/* Slim Subscription Notice */}
      <SubscriptionBanner
        daysRemaining={profile.subscription?.daysRemaining || 365}
      />

      {/* 4 Clean KPI Cards */}
      <DashboardMetricCards metrics={liveMetrics} />

      {/* Workspace Grid: Right Alerts Rail appears above Listings on mobile, and beside Listings on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8 min-w-0">
          <ProductStatusGrid statusBreakdown={liveMetrics.statusBreakdown} />
        </div>

        {/* Notifications & Buyer Enquiries (Top-right on desktop, above status grid on mobile) */}
        <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 min-w-0">
          <RecentNotificationsCard notifications={liveMetrics.recentNotifications} />
          <RecentEnquiriesCard enquiries={liveMetrics.recentEnquiries} />
        </div>
      </div>
    </div>
  );
}
