"use client";

import React, { useState, useMemo } from "react";

function parseItemDate(item) {
  const rawDate =
    item?.raw?.createdAt ||
    item?.createdAt ||
    item?.raw?.updatedAt ||
    item?.updatedAt;
  if (!rawDate) return null;
  const dt = new Date(rawDate);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function buildSellerSeries(products = [], enquiries = [], range = "7D", anchorTimeMs = null) {
  if (!anchorTimeMs) {
    const fallbackLabels =
      range === "30D"
        ? ["Wk 1", "Wk 2", "Wk 3", "Wk 4"]
        : range === "12M"
          ? ["M1", "M2", "M3", "M4", "M5", "M6"]
          : ["D1", "D2", "D3", "D4", "D5", "D6", "Today"];
    return fallbackLabels.map((label) => ({
      label,
      start: 0,
      end: 0,
      listings: 0,
      enquiries: 0,
    }));
  }

  const now = new Date(anchorTimeMs);
  const buckets = [];

  if (range === "7D") {
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - offset);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      buckets.push({
        label: offset === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" }),
        start: d.getTime(),
        end: next.getTime(),
        listings: 0,
        enquiries: 0,
      });
    }
  } else if (range === "30D") {
    for (let w = 3; w >= 0; w--) {
      const endD = new Date(now);
      endD.setHours(23, 59, 59, 999);
      endD.setDate(endD.getDate() - w * 7);
      const startD = new Date(endD);
      startD.setHours(0, 0, 0, 0);
      startD.setDate(startD.getDate() - 6);
      buckets.push({
        label: w === 0 ? "This Wk" : `${w * 7}d ago`,
        start: startD.getTime(),
        end: endD.getTime() + 1,
        listings: 0,
        enquiries: 0,
      });
    }
  } else {
    for (let m = 5; m >= 0; m--) {
      const startD = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const endD = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
      buckets.push({
        label: startD.toLocaleDateString("en-IN", { month: "short" }),
        start: startD.getTime(),
        end: endD.getTime(),
        listings: 0,
        enquiries: 0,
      });
    }
  }

  for (const p of products) {
    const dt = parseItemDate(p);
    const ts = dt ? dt.getTime() : buckets[buckets.length - 1].start;
    const match = buckets.find((b) => ts >= b.start && ts < b.end);
    if (match) {
      match.listings += 1;
    } else if (ts < buckets[0].start) {
      buckets[0].listings += 1;
    } else {
      buckets[buckets.length - 1].listings += 1;
    }
  }

  for (const e of enquiries) {
    const dt = parseItemDate(e);
    const ts = dt ? dt.getTime() : buckets[buckets.length - 1].start;
    const match = buckets.find((b) => ts >= b.start && ts < b.end);
    if (match) {
      match.enquiries += 1;
    } else if (ts >= buckets[buckets.length - 1].start) {
      buckets[buckets.length - 1].enquiries += 1;
    }
  }

  return buckets;
}

export default function PerformanceChartCard({
  products = [],
  enquiries = [],
  anchorTimeMs = null,
}) {
  const [range, setRange] = useState("7D");
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const buckets = useMemo(
    () => buildSellerSeries(products, enquiries, range, anchorTimeMs),
    [products, enquiries, range, anchorTimeMs]
  );

  const totalListings = products.length;
  const publishedCount = products.filter((p) => p.listingStatus === "Published").length;
  const totalEnquiries = enquiries.length;

  const activityValues = buckets.map((b) => b.listings + b.enquiries);
  const maxVal = Math.max(4, ...activityValues);

  const width = 560;
  const height = 185;
  const padX = 28;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = buckets.map((b, i) => {
    const total = b.listings + b.enquiries;
    const x = padX + (i / Math.max(1, buckets.length - 1)) * chartW;
    const y = padY + chartH - (total / maxVal) * chartH;
    return { x, y, val: total, ...b };
  });

  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DDE7CE] shadow-xs space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0B3C26]">
          Storefront Activity
        </h2>

        {/* Range Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F2F7E6] border border-[#DCE8C6]">
          {["7D", "30D", "12M"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                range === r
                  ? "bg-[#C5F340] text-[#0B3C26] shadow-2xs"
                  : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Real Seller Totals Matching the Seller Page */}
      <div className="flex flex-wrap items-center gap-6 pb-1">
        <div>
          <div className="text-[11px] font-semibold text-[#54754B]">Total Listings</div>
          <div className="font-space text-xl font-bold text-[#0B3C26] leading-tight mt-0.5">
            {totalListings}
          </div>
        </div>

        <div className="h-8 w-px bg-[#E3EAD6]" />

        <div>
          <div className="text-[11px] font-semibold text-[#54754B]">Published Live</div>
          <div className="font-space text-xl font-bold text-[#0B3C26] leading-tight mt-0.5">
            {publishedCount}
          </div>
        </div>

        <div className="h-8 w-px bg-[#E3EAD6]" />

        <div>
          <div className="text-[11px] font-semibold text-[#54754B]">Buyer Enquiries</div>
          <div className="font-space text-xl font-bold text-[#0B3C26] leading-tight mt-0.5">
            {totalEnquiries}
          </div>
        </div>
      </div>

      {/* Light-Green Theme SVG Chart Canvas */}
      <div className="relative w-full">
        {hoveredPoint && (
          <div className="mb-2 inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#F1F9D8] border border-[#C5E37A] text-xs font-semibold text-[#0B3C26]">
            <span>{hoveredPoint.label}:</span>
            <span>{hoveredPoint.listings} listing{hoveredPoint.listings === 1 ? "" : "s"}</span>
            <span className="text-[#54754B]">&middot;</span>
            <span>{hoveredPoint.enquiries} enquir{hoveredPoint.enquiries === 1 ? "y" : "ies"}</span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible"
          role="img"
          aria-label="Storefront activity chart"
        >
          <defs>
            <linearGradient id="ulavanLightGreenArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9CE23B" stopOpacity="0.48" />
              <stop offset="65%" stopColor="#C5F340" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#C5F340" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => {
            const y = padY + chartH * t;
            return (
              <line
                key={idx}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="#EAEFE0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="url(#ulavanLightGreenArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#2D8A3E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={pt.label}>
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padY}
                    x2={pt.x}
                    y2={height - padY}
                    stroke="#5CB834"
                    strokeOpacity="0.45"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#C5F340" : "#2D8A3E"}
                  stroke="#0B3C26"
                  strokeWidth={isHovered ? "2" : "1.2"}
                  className="transition-all duration-150 cursor-pointer"
                />
                <text
                  x={pt.x}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-[#54754B] text-[11px] font-semibold"
                >
                  {pt.label}
                </text>
                <rect
                  x={pt.x - 24}
                  y={0}
                  width={48}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
