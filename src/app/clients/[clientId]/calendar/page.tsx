"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Layers,
  Filter,
} from "lucide-react";

export default function CalendarPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK">("MONTH");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [scheduledItems, setScheduledItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScheduledPosts() {
      try {
        const res = await fetch(`/api/clients/${clientId}/content`);
        if (res.ok) {
          const json = await res.json();
          // Filter to items that have scheduledFor or status SCHEDULED
          const items = (json.items || []).filter(
            (i: any) => i.status === "SCHEDULED" || i.scheduledFor
          );
          setScheduledItems(items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadScheduledPosts();
  }, [clientId]);

  const filteredPosts = scheduledItems.filter((p) => {
    if (platformFilter === "ALL") return true;
    try {
      const platforms = JSON.parse(p.platforms || "[]");
      return platforms.includes(platformFilter);
    } catch {
      return p.platforms?.includes(platformFilter);
    }
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Publishing Calendar</h1>
          <p className="mt-1 text-xs text-slate-500">
            Editorial schedule and timed social releases for this client workspace.
          </p>
        </div>

        {/* View Switcher and Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs">
            {["ALL", "FACEBOOK", "INSTAGRAM", "TIKTOK"].map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  platformFilter === plat
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {plat === "ALL" ? "All" : plat[0] + plat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Month / Week Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setViewMode("MONTH")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                viewMode === "MONTH" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("WEEK")}
              className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                viewMode === "WEEK" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Month View */}
        {viewMode === "MONTH" && (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
              {daysOfWeek.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[480px]">
              {Array.from({ length: 28 }).map((_, i) => {
                const dayNum = i + 1;
                // Match scheduled items to day number
                const dayPosts = filteredPosts.filter((post) => {
                  if (!post.scheduledFor) return false;
                  return new Date(post.scheduledFor).getDate() === dayNum;
                });

                return (
                  <div
                    key={i}
                    className="p-2 min-h-[96px] sm:min-h-[110px] flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          dayNum === 30
                            ? "flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[11px]"
                            : "text-slate-600"
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="space-y-1.5 mt-1 overflow-hidden">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-lg border border-blue-200 bg-blue-50/90 p-1.5 text-[10px] font-semibold text-blue-900 shadow-2xs truncate"
                          title={post.title}
                        >
                          <span className="font-bold text-blue-700">Scheduled:</span> {post.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === "WEEK" && (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
              {daysOfWeek.map((day, idx) => (
                <div key={day}>
                  <span>{day}</span>
                  <span className="block text-[11px] text-slate-400 font-normal">
                    Sep {25 + idx}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[360px] p-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const dayNum = 25 + i;
                const dayPosts = filteredPosts.filter((post) => {
                  if (!post.scheduledFor) return false;
                  return new Date(post.scheduledFor).getDate() === dayNum;
                });

                return (
                  <div key={i} className="p-2 space-y-2">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-900 space-y-1"
                      >
                        <p className="font-bold text-[11px] text-blue-800 line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-[10px] text-blue-600">
                          {new Date(post.scheduledFor).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                    {dayPosts.length === 0 && (
                      <div className="text-center text-[10px] text-slate-400 py-8">No posts</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State when no scheduled items at all */}
      {scheduledItems.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
          <CalendarIcon className="h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No scheduled content yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Posts scheduled in the Content Pipeline will automatically appear on this calendar.
          </p>
        </div>
      )}
    </div>
  );
}
