"use client";

import React, { useState, useEffect, useMemo } from "react";
import SellerHeader from "@/components/seller/layout/SellerHeader";
import SubscriptionBanner from "@/components/seller/dashboard/SubscriptionBanner";
import DashboardMetricCards from "@/components/seller/dashboard/DashboardMetricCards";
import PerformanceChartCard from "@/components/seller/dashboard/PerformanceChartCard";
import ProductStatusGrid from "@/components/seller/dashboard/ProductStatusGrid";
import ActivityAndReadinessPanel from "@/components/seller/dashboard/ActivityAndReadinessPanel";
import { useSessionUser } from "@/services/sessionAuth";
import { getSellerProducts } from "@/services/productApi";
import { getDynamicSellerProfile } from "@/services/sellerApi";

const PRODUCT_STATUS_KEYS = [
  { label: "Draft", statusKey: "Draft" },
  { label: "Submitted", statusKey: "Submitted" },
  { label: "Under Review", statusKey: "Under Review" },
  { label: "Approved", statusKey: "Approved" },
  { label: "Published", statusKey: "Published" },
  { label: "Rejected", statusKey: "Rejected" },
  { label: "Inactive", statusKey: "Inactive" },
  { label: "Expired / Unavailable", statusKey: "Expired" },
];

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
      buyerEnquiries: {
        count: 0,
        subtext: "0 awaiting response",
      },
      recentEnquiries: [],
      recentNotifications: [],
      statusBreakdown: PRODUCT_STATUS_KEYS.map((item) => ({
        ...item,
        count: countsByStatus.get(item.label) || 0,
      })),
    };
  }, [products, profile]);

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Clean Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3C26]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#54754B] mt-0.5 font-medium truncate">
            Storefront overview &amp; performance
          </p>
        </div>

        <SellerHeader
          onMenuToggle={onMenuToggle}
          avatarText={profile.avatarInitials || "S"}
          showAddProduct={false}
        />
      </div>

      {/* Storefront Hero Banner with Circular Plan Ring */}
      <SubscriptionBanner
        daysRemaining={profile.subscription?.daysRemaining || 365}
        sellerName={profile.businessName || "Seller"}
        sellerType={profile.sellerType || "Farmer"}
        totalProducts={products.length}
      />

      {/* 4 Clean Bento KPI Cards */}
      <DashboardMetricCards metrics={liveMetrics} />

      {/* 12-Col Bento Analytics & Activity Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5 min-w-0">
          <PerformanceChartCard
            totalProducts={products.length}
            totalEnquiries={liveMetrics.buyerEnquiries.count}
          />
          <ProductStatusGrid statusBreakdown={liveMetrics.statusBreakdown} />
        </div>

        <div className="lg:col-span-4 min-w-0">
          <ActivityAndReadinessPanel
            enquiries={liveMetrics.recentEnquiries}
            notifications={liveMetrics.recentNotifications}
            hasProducts={products.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
