"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminSidebar, { ADMIN_NAV_ITEMS } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminToast from "@/components/admin/AdminToast";
import {
  INITIAL_ADMIN_SELLERS,
  INITIAL_ADMIN_BUYERS,
  INITIAL_ADMIN_PRODUCTS,
  INITIAL_ADMIN_TRANSACTIONS,
  INITIAL_ADMIN_AUDIT_LOGS,
  calculateAdminStats,
} from "@/data/adminPortalData";
import { getSellerCategories, getBuyerCategories } from "@/services/categoryStorage";

import DashboardTab from "@/components/admin/tabs/DashboardTab";
import SellersTab from "@/components/admin/tabs/SellersTab";
import BuyersTab from "@/components/admin/tabs/BuyersTab";
import ProductsTab from "@/components/admin/tabs/ProductsTab";
import CategoriesTab from "@/components/admin/tabs/CategoriesTab";
import SubscriptionsTab from "@/components/admin/tabs/SubscriptionsTab";
import PaymentsTab from "@/components/admin/tabs/PaymentsTab";
import ContentTab from "@/components/admin/tabs/ContentTab";
import ReportsTab from "@/components/admin/tabs/ReportsTab";
import AuditLogTab from "@/components/admin/tabs/AuditLogTab";
import SettingsTab from "@/components/admin/tabs/SettingsTab";

function AdminPortalContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Dynamic In-Memory Production State
  const [sellers, setSellers] = useState(INITIAL_ADMIN_SELLERS);
  const [buyers, setBuyers] = useState(INITIAL_ADMIN_BUYERS);
  const [products, setProducts] = useState(INITIAL_ADMIN_PRODUCTS);
  const [transactions, setTransactions] = useState(INITIAL_ADMIN_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_ADMIN_AUDIT_LOGS);
  const [categories, setCategories] = useState(() => [
    ...getSellerCategories(),
    ...getBuyerCategories(),
  ]);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  // Restore existing records from localStorage safely on client mount (filter out old dummy data)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProducts = localStorage.getItem("ulavan_admin_products");
        if (storedProducts) {
          const parsed = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(
              (p) =>
                !["PRD-1001", "PRD-1002", "PRD-1003", "PRD-1004"].includes(p?.id) &&
                p?.seller !== "Kongu Natural Organic Farmers Collective" &&
                p?.seller !== "Cauvery Delta Direct Paddy Cultivators"
            );
            setProducts(cleaned);
          }
        }
        const storedSellers = localStorage.getItem("ulavan_admin_sellers");
        if (storedSellers) {
          const parsed = JSON.parse(storedSellers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(
              (s) =>
                !["SEL-001", "SEL-002", "SEL-003", "SEL-004"].includes(s?.id) &&
                s?.businessName !== "Kongu Natural Organic Farmers Collective"
            );
            setSellers(cleaned);
          }
        }
        const storedBuyers = localStorage.getItem("ulavan_admin_buyers");
        if (storedBuyers) {
          const parsed = JSON.parse(storedBuyers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter(
              (b) =>
                !["BUY-001", "BUY-002", "BUY-003"].includes(b?.id) &&
                b?.name !== "Koyambedu Wholesale Agro Traders Association"
            );
            setBuyers(cleaned);
          }
        }
        const storedLogs = localStorage.getItem("ulavan_admin_audit_logs");
        if (storedLogs) {
          const parsed = JSON.parse(storedLogs);
          if (Array.isArray(parsed)) setAuditLogs(parsed);
        }
        const storedTxns = localStorage.getItem("ulavan_admin_transactions");
        if (storedTxns) {
          const parsed = JSON.parse(storedTxns);
          if (Array.isArray(parsed)) setTransactions(parsed);
        }
      } catch (err) {
        console.error("Error reading admin records from localStorage:", err);
      } finally {
        setIsLoadedFromStorage(true);
      }
    }
  }, []);

  // Sync to localStorage whenever products, sellers, buyers, transactions, or logs change
  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === "undefined") return;
    try {
      localStorage.setItem("ulavan_admin_products", JSON.stringify(products));
    } catch (e) {}
  }, [products, isLoadedFromStorage]);

  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === "undefined") return;
    try {
      localStorage.setItem("ulavan_admin_sellers", JSON.stringify(sellers));
    } catch (e) {}
  }, [sellers, isLoadedFromStorage]);

  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === "undefined") return;
    try {
      localStorage.setItem("ulavan_admin_buyers", JSON.stringify(buyers));
    } catch (e) {}
  }, [buyers, isLoadedFromStorage]);

  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === "undefined") return;
    try {
      localStorage.setItem("ulavan_admin_audit_logs", JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs, isLoadedFromStorage]);

  useEffect(() => {
    if (!isLoadedFromStorage || typeof window === "undefined") return;
    try {
      localStorage.setItem("ulavan_admin_transactions", JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions, isLoadedFromStorage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Central audit logging function invoked by child tab components
  const logAdminAction = (action, details) => {
    const newEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      admin: "SuperAdmin (S. Senthil)",
      action,
      details,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Dynamically computed metrics based on live state
  const stats = calculateAdminStats(sellers, buyers, products, categories, transactions);
  const currentNav = ADMIN_NAV_ITEMS.find((n) => n.id === activeTab) || ADMIN_NAV_ITEMS[0];
  const pendingCount =
    sellers.filter((s) => s.status === "Pending Review").length +
    products.filter((p) => p.status === "Under Review" || p.status === "Submitted").length;

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-gray-900 font-sans selection:bg-[#174B35] selection:text-white flex">
      {/* Toast Feedback */}
      <AdminToast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Desktop & Mobile Navigation Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Administrative Workplace Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        <AdminHeader
          activeTitle={currentNav.label}
          onMenuToggle={() => setIsMobileOpen(true)}
          pendingCount={pendingCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && (
            <DashboardTab
              stats={stats}
              onNavigateTab={setActiveTab}
              onNotify={showToast}
            />
          )}

          {activeTab === "sellers" && (
            <SellersTab
              sellers={sellers}
              setSellers={setSellers}
              onLogAction={logAdminAction}
              onNotify={showToast}
            />
          )}

          {activeTab === "buyers" && (
            <BuyersTab
              buyers={buyers}
              setBuyers={setBuyers}
              onLogAction={logAdminAction}
              onNotify={showToast}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab
              products={products}
              setProducts={setProducts}
              sellers={sellers}
              onLogAction={logAdminAction}
              onNotify={showToast}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              categories={categories}
              setCategories={setCategories}
              onNotify={showToast}
            />
          )}

          {activeTab === "subscriptions" && (
            <SubscriptionsTab onNotify={showToast} />
          )}

          {activeTab === "payments" && (
            <PaymentsTab
              transactions={transactions}
              setTransactions={setTransactions}
              onNotify={showToast}
            />
          )}

          {activeTab === "content" && (
            <ContentTab onNotify={showToast} />
          )}

          {activeTab === "reports" && (
            <ReportsTab stats={stats} onNotify={showToast} />
          )}

          {activeTab === "audit" && (
            <AuditLogTab
              logs={auditLogs}
              setAuditLogs={setAuditLogs}
              onNotify={showToast}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab onNotify={showToast} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#174B35] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPortalContent />
    </Suspense>
  );
}
