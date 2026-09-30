"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon, UploadCloud, Film, File, Plus } from "lucide-react";

export default function MediaLibraryShellPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [filter, setFilter] = useState("ALL");

  const sampleAssets = [
    {
      id: "1",
      name: "Fiber-Laser-12kW-Cutting-Head.jpg",
      type: "image",
      size: "2.4 MB",
      dimensions: "1920x1080",
      date: "Sep 28, 2026",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&h=350&fit=crop",
    },
    {
      id: "2",
      name: "Precision-CNC-Milling-5Axis.mp4",
      type: "video",
      size: "18.5 MB",
      dimensions: "1080x1920 (Reel)",
      date: "Sep 26, 2026",
      url: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&h=350&fit=crop",
    },
    {
      id: "3",
      name: "Client-Factory-Exterior-Signage.jpg",
      type: "image",
      size: "3.1 MB",
      dimensions: "2400x1600",
      date: "Sep 22, 2026",
      url: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=500&h=350&fit=crop",
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Media Assets</h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated cloud media repository for this client's graphics, video clips, and brochures.
          </p>
        </div>

        <button
          onClick={() => alert("Cloud storage upload integration scheduled for Phase 2")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs w-fit">
        {[
          { label: "All Media", value: "ALL" },
          { label: "Images", value: "image" },
          { label: "Videos", value: "video" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filter === tab.value
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sampleAssets
          .filter((a) => (filter === "ALL" ? true : a.type === filter))
          .map((asset) => (
            <div
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs uppercase">
                  {asset.type}
                </span>
              </div>
              <div className="p-4">
                <p className="truncate text-xs font-bold text-slate-800" title={asset.name}>
                  {asset.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{asset.size}</span>
                  <span>{asset.dimensions}</span>
                  <span>{asset.date}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
