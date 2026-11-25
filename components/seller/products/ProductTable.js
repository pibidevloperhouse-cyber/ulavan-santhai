"use client";

import React from "react";
import Link from "next/link";
import { Eye, Pencil, Power, Trash2, Image as ImageIcon, Plus, Package } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";

export default function ProductTable({
  products = [],
  totalCount = 0,
  onViewProduct,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E5E0D5] rounded-xl shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EAF2EC] text-[#1B4D36] flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-[#111827]">
                No products added yet
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Start showcasing your crops and agriculture-derived
                products to reach bulk buyers across the state.
              </p>
              <div className="pt-2">
                <Link
                  href="/seller/products/add"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4D36] hover:bg-[#133A28] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add your first product
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (Visible on screens < 640px) */}
            <div className="block sm:hidden divide-y divide-[#F0EDE6]">
              {products.map((p) => (
                <div key={`m-${p.id}`} className="p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#EAEFEA] border border-[#D1E0D3] flex items-center justify-center text-[#1B4D36] shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-[#111827] truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#4B5563] truncate">
                          {p.type || p.category}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={p.listingStatus} />
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EDE8DE]">
                    <div>
                      <span className="text-[10px] text-[#7A877E] block">Category</span>
                      <span className="font-medium text-[#1F2922] truncate block">
                        {p.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A877E] block">Place of Origin</span>
                      <span className="font-medium text-[#1F2922] truncate block">
                        {p.origin}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A877E] block">MOQ</span>
                      <span className="font-medium text-[#1F2922] truncate block">
                        {p.moq}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#7A877E] block">Availability</span>
                      <div className="mt-0.5">
                        <StatusBadge status={p.availability} />
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onViewProduct && onViewProduct(p)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#D8D2C4] bg-white text-[11px] font-semibold text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <Link
                      href={`/seller/products/add?edit=${p.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-[#D8D2C4] bg-white text-[11px] font-semibold text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => onToggleStatus && onToggleStatus(p.id)}
                      title={p.listingStatus === "Published" ? "Deactivate product" : "Publish product"}
                      className="p-1.5 rounded-lg border border-[#D8D2C4] bg-white text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete && onDelete(p.id)}
                      title="Delete product"
                      className="p-1.5 rounded-lg border border-[#D8D2C4] bg-white text-[#944444] hover:text-[#B91C1C] hover:border-[#F87171] active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (Visible on screens >= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E4DA] text-xs font-bold text-[#374151] uppercase tracking-wider">
                    <th className="px-4 py-3.5">Image</th>
                    <th className="px-4 py-3.5">Product Name / Type</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Place of Origin</th>
                    <th className="px-4 py-3.5">MOQ</th>
                    <th className="px-4 py-3.5">Availability</th>
                    <th className="px-4 py-3.5">Listing Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE6]">
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FAF9F6] transition-colors"
                    >
                      {/* Image Thumbnail */}
                      <td className="px-4 py-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#EAEFEA] border border-[#D1E0D3] flex items-center justify-center text-[#1B4D36]">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      </td>

                      {/* Product Name / Type */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm text-[#111827]">{p.name}</div>
                        <div className="text-xs text-[#4B5563] mt-0.5">
                          {p.type}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-xs text-[#374151] font-medium">{p.category}</td>

                      {/* Place of Origin */}
                      <td className="px-4 py-3.5 text-xs text-[#374151] font-medium">{p.origin}</td>

                      {/* MOQ */}
                      <td className="px-4 py-3.5 text-xs text-[#374151] font-medium whitespace-nowrap">
                        {p.moq}
                      </td>

                      {/* Availability */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={p.availability} />
                      </td>

                      {/* Listing Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={p.listingStatus} />
                      </td>

                      {/* Row Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* View Product (Eye) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onViewProduct) onViewProduct(p);
                            }}
                            title="View product details"
                            aria-label={`View details of ${p.name}`}
                            className="p-1.5 rounded-md border border-[#D8D2C4] bg-white text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 pointer-events-none" />
                          </button>

                          {/* Edit Product (Pencil) */}
                          <Link
                            href={`/seller/products/add?edit=${p.id}`}
                            title="Edit product"
                            aria-label={`Edit ${p.name}`}
                            className="p-1.5 rounded-md border border-[#D8D2C4] bg-white text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5 pointer-events-none" />
                          </Link>

                          {/* Toggle Status (Power) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onToggleStatus) onToggleStatus(p.id);
                            }}
                            title="Activate / Deactivate product"
                            aria-label={`Toggle active state of ${p.name}`}
                            className="p-1.5 rounded-md border border-[#D8D2C4] bg-white text-[#4A574E] hover:text-[#1B4D36] hover:border-[#1B4D36] active:scale-95 transition-all cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5 pointer-events-none" />
                          </button>

                          {/* Delete Product (Trash) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onDelete) onDelete(p.id);
                            }}
                            title="Delete product listing"
                            aria-label={`Delete ${p.name}`}
                            className="p-1.5 rounded-md border border-[#D8D2C4] bg-white text-[#944444] hover:text-[#B91C1C] hover:border-[#F87171] active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Table Footer with Pagination */}
        {products.length > 0 && (
          <div className="px-3.5 sm:px-4 py-3 bg-[#FAF8F5] border-t border-[#E8E4DA] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#4B5563]">
            <div className="text-center sm:text-left">
              Showing 1–{products.length} of {totalCount || products.length}{" "}
              products
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-md border border-[#D6CFC1] bg-white text-[#374151] hover:bg-gray-50 font-medium cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-md border border-[#D6CFC1] bg-white text-[#374151] hover:bg-gray-50 font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] sm:text-xs text-[#6B7280] leading-relaxed">
        Row actions: View product · Edit product · Activate / Deactivate · Delete.
        Admin reviews listings and approves or publishes them to buyers.
      </p>
    </div>
  );
}
