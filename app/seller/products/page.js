"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import ProductFilters from "@/components/seller/products/ProductFilters";
import ProductTable from "@/components/seller/products/ProductTable";
import ProductViewModal from "@/components/seller/products/ProductViewModal";
import {
  getSellerProducts,
  toggleProductStatus,
  deleteSellerProduct,
} from "@/services/productApi";

export default function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [selectedProductForView, setSelectedProductForView] = useState(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSellerProducts();
      if (res.success && Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const res = await getSellerProducts();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic filter processing
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (
        searchName &&
        !item.name?.toLowerCase().includes(searchName.toLowerCase()) &&
        !item.type?.toLowerCase().includes(searchName.toLowerCase())
      ) {
        return false;
      }
      if (
        categoryFilter !== "All categories" &&
        item.category !== categoryFilter
      ) {
        return false;
      }
      if (
        statusFilter !== "All statuses" &&
        item.listingStatus !== statusFilter
      ) {
        return false;
      }
      if (
        availabilityFilter !== "All" &&
        item.availability !== availabilityFilter
      ) {
        return false;
      }
      return true;
    });
  }, [products, searchName, categoryFilter, statusFilter, availabilityFilter]);

  const handleToggleStatus = async (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const nextStatus =
      target.listingStatus === "Published" ? "INACTIVE" : "PUBLISHED";

    const res = await toggleProductStatus(id, nextStatus);
    if (res.success) {
      loadProducts();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product listing?")) {
      const res = await deleteSellerProduct(id);
      if (res.success) {
        loadProducts();
      }
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3C26]">
            My products
          </h1>
          <p className="text-xs sm:text-sm text-[#4E6D45] mt-1 font-medium">
            Create, edit and manage your agricultural product listings
          </p>
        </div>

        <Link
          href="/seller/products/add"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C5F340] hover:bg-[#d3fc59] text-[#0B3C26] text-xs font-extrabold rounded-xl transition-colors shadow-xs w-full sm:w-auto text-center cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add product
        </Link>
      </div>

      {/* Filter Controls */}
      <ProductFilters
        searchName={searchName}
        onSearchChange={setSearchName}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        availabilityFilter={availabilityFilter}
        onAvailabilityChange={setAvailabilityFilter}
      />

      {/* Products Data Table */}
      <ProductTable
        products={filteredProducts}
        totalCount={products.length}
        onViewProduct={setSelectedProductForView}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />

      {/* Quick View Modal */}
      {selectedProductForView && (
        <ProductViewModal
          product={selectedProductForView}
          onClose={() => setSelectedProductForView(null)}
        />
      )}
    </div>
  );
}
