"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function CalendarShellPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        if (res.ok) {
          const json = await res.json();
          setPosts(json.client?.contentItems || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [clientId]);

  // Days of week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Publishing Calendar</h1>
          <p className="mt-1 text-xs text-slate-500">
            Editorial schedule and timed social releases for this client.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-800">September 2026</span>
            <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => alert("Scheduled post scheduler modal in Phase 2")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Interactive Calendar Shell Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
          {days.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid (4 rows x 7 days) */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
          {Array.from({ length: 28 }).map((_, i) => {
            const dayNum = i + 1;
            // Place sample scheduled items on specific days
            const dayPosts = posts.filter((p) => {
              if (!p.scheduledFor) return false;
              const d = new Date(p.scheduledFor).getDate();
              return d === dayNum || (dayNum === 15 && i === 14);
            });

            return (
              <div
                key={i}
                className="p-2.5 min-h-[110px] flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold ${
                      dayNum === 30
                        ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-bold text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>

                <div className="space-y-1.5 mt-2">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-blue-200 bg-blue-50/90 p-1.5 text-[10px] font-semibold text-blue-900 shadow-2xs truncate"
                      title={post.title}
                    >
                      <span className="font-bold text-blue-700">10:00 AM:</span> {post.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
