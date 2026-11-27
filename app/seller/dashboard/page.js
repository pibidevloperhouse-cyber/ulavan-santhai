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
import { getSellerEnquiries } from "@/services/enquiryApi";
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
  const [enquiries, setEnquiries] = useState([]);
  const [loadedAt, setLoadedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      const sellerId = sessionUser?.id || sessionUser?.userId || profile?.id;
      const [productsResult, enquiriesResult] = await Promise.allSettled([
        getSellerProducts(),
        getSellerEnquiries(sellerId),
      ]);

      if (!isMounted) return;

      setLoadedAt(Date.now());

      if (
        productsResult.status === "fulfilled" &&
        productsResult.value?.success &&
        Array.isArray(productsResult.value.data)
      ) {
        setProducts(productsResult.value.data);
      }

      if (
        enquiriesResult.status === "fulfilled" &&
        enquiriesResult.value?.success &&
        Array.isArray(enquiriesResult.value.data)
      ) {
        setEnquiries(enquiriesResult.value.data);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [sessionUser, profile?.id]);

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
    const awaitingCount = enquiries.filter(
      (e) => !e.responseMessage && String(e.status || "").toLowerCase() !== "replied"
    ).length;

    const normalizedEnquiries = enquiries.slice(0, 5).map((e, idx) => ({
      id: e.id || `enq-${idx}`,
      buyerName: e.buyerName || "Verified Buyer",
      productName: e.productTitle || e.productName || "Produce Enquiry",
      message: e.message || "",
      status: e.status || "New",
      timeAgo: e.createdAt
        ? new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "",
    }));

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
        count: enquiries.length,
        subtext: `${awaitingCount} awaiting response`,
      },
      recentEnquiries: normalizedEnquiries,
      recentNotifications: [],
      statusBreakdown: PRODUCT_STATUS_KEYS.map((item) => ({
        ...item,
        count: countsByStatus.get(item.label) || 0,
      })),
    };
  }, [products, enquiries, profile]);

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3C26]">
            Dashboard
          </h1>
        </div>

        <SellerHeader
          onMenuToggle={onMenuToggle}
          avatarText={profile.avatarInitials || "S"}
          showAddProduct={false}
        />
      </div>

      {/* Storefront Summary Banner */}
      <SubscriptionBanner
        daysRemaining={profile.subscription?.daysRemaining || 365}
        sellerName={profile.businessName || "Seller"}
        totalProducts={products.length}
      />

      {/* 4 KPI Metric Cards with Real Icons */}
      <DashboardMetricCards metrics={liveMetrics} />

      {/* 12-Col Analytics & Activity Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8 space-y-5 min-w-0">
          <PerformanceChartCard
            products={products}
            enquiries={enquiries}
            anchorTimeMs={loadedAt}
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
