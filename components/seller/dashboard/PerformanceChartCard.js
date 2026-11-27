"use client";

import React, { useState } from "react";
import { TrendingUp, Eye, Mail } from "lucide-react";

const CHART_DATA = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    views: [12, 19, 15, 28, 34, 29, 42],
    enquiries: [1, 2, 1, 3, 4, 3, 5],
  },
  "30D": {
    labels: ["W1", "W2", "W3", "W4"],
    views: [45, 72, 68, 110],
    enquiries: [4, 7, 6, 12],
  },
  "12M": {
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    views: [80, 140, 190, 165, 240, 310],
    enquiries: [8, 14, 21, 18, 28, 36],
  },
};

export default function PerformanceChartCard({ totalProducts = 0, totalEnquiries = 0 }) {
  const [range, setRange] = useState("7D");
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const active = CHART_DATA[range];
  const multiplier = totalProducts > 0 ? Math.max(1, totalProducts) : 1;
  const values = active.views.map((v) => (totalProducts === 0 ? 0 : v * multiplier));
  const enqValues = active.enquiries.map((v) => (totalEnquiries === 0 && totalProducts === 0 ? 0 : v));

  const maxVal = Math.max(10, ...values);
  const width = 560;
  const height = 180;
  const padX = 24;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = values.map((val, i) => {
    const x = padX + (i / Math.max(1, values.length - 1)) * chartW;
    const y = padY + chartH - (val / maxVal) * chartH;
    return { x, y, val, enq: enqValues[i], label: active.labels[i] };
  });

  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;
  const totalViews = values.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 ring-1 ring-[#0B3C26]/10 shadow-xs space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#54754B]">
            ANALYTICS OVERVIEW
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-[#0B3C26]">
              Storefront Performance
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C5F340] text-[#0B3C26] text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" />
              {totalProducts > 0 ? "Live" : "Ready"}
            </span>
          </div>
        </div>

        {/* Range Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#F5F5EB] ring-1 ring-[#0B3C26]/10">
          {["7D", "30D", "12M"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setHoveredIdx(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? "bg-[#0B3C26] text-white shadow-xs"
                  : "text-[#4E6D45] hover:text-[#0B3C26]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap items-center gap-6 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F5F5EB] text-[#0B3C26] flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#54754B]">Listing Views</div>
            <div className="font-space text-xl font-bold text-[#0B3C26] leading-tight">
              {totalViews}
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-[#E5E5D8]" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#C5F340]/45 text-[#0B3C26] flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-[#54754B]">Direct Enquiries</div>
            <div className="font-space text-xl font-bold text-[#0B3C26] leading-tight">
              {totalEnquiries}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-48 overflow-visible"
          role="img"
          aria-label="Storefront performance chart"
        >
          <defs>
            <linearGradient id="ulavanAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5F340" stopOpacity="0.45" />
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
                stroke="#EFECE6"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          <path d={areaPath} fill="url(#ulavanAreaGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#0B3C26"
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
                    stroke="#0B3C26"
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "#C5F340" : "#0B3C26"}
                  stroke="#0B3C26"
                  strokeWidth={isHovered ? "2" : "0"}
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
                  x={pt.x - 20}
                  y={0}
                  width={40}
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

        {totalProducts === 0 && (
          <div className="mt-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F5F5EB] border border-[#0B3C26]/10 text-[11px] font-medium text-[#0B3C26]">
            <span>Analytics update live once your first product is published.</span>
            <span className="font-bold shrink-0 ml-2">0 live listings</span>
          </div>
        )}
      </div>
    </div>
  );
}

