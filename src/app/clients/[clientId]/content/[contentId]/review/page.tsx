"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Clock,
  Send,
  Layers,
  Sparkles,
  ExternalLink,
  History,
  FileCheck,
  Check,
  RefreshCw,
} from "lucide-react";

export default function ContentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const contentId = params.contentId as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [activePlatformTab, setActivePlatformTab] = useState<string>("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const fetchContentDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/content/${contentId}`);
      if (res.ok) {
        const json = await res.json();
        setItem(json.item);
        if (json.item.variants && json.item.variants.length > 0) {
          setActivePlatformTab("ALL");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentDetails();
  }, [clientId, contentId]);

  const handleReviewAction = async (
    action: "APPROVE" | "REQUEST_CHANGES" | "REJECT",
    platformScope: string = "ALL"
  ) => {
    if (action === "REQUEST_CHANGES" && !reviewComment.trim()) {
      alert("Please provide revision feedback or comment explaining what changes are required.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/clients/${clientId}/content/${contentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          platformScope,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review action failed");

      setReviewComment("");
      setFeedbackMessage(`Action "${action}" processed successfully.`);
      setTimeout(() => setFeedbackMessage(""), 4000);
      await fetchContentDetails();
    } catch (err: any) {
      alert(err.message || "Failed to process review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-48 rounded-2xl bg-slate-200" />
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Content item not found.</p>
        <Link
          href={`/clients/${clientId}/content`}
          className="text-blue-600 underline text-xs mt-2 inline-block"
        >
          Return to Content Pipeline
        </Link>
      </div>
    );
  }

  const mediaUrls: string[] = (() => {
    try {
      return JSON.parse(item.mediaUrls || "[]");
    } catch {
      return [];
    }
  })();

  const allApproved =
    item.variants?.length > 0 &&
    item.variants.every((v: any) => v.approvalStatus === "APPROVED");

  const latestApprovalRequest = item.approvalRequests?.[0];

  const getVariantStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "CHANGES_REQUESTED":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${clientId}/content`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {item.client?.companyName} • Review Queue
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : item.status === "CHANGES_REQUESTED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              {item.title}
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {feedbackMessage && (
            <span className="text-xs font-semibold text-emerald-600 mr-2 flex items-center gap-1">
              <Check className="h-4 w-4" /> {feedbackMessage}
            </span>
          )}

          <button
            type="button"
            onClick={() => handleReviewAction("REQUEST_CHANGES", "ALL")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Request Changes</span>
          </button>

          <button
            type="button"
            onClick={() => handleReviewAction("APPROVE", "ALL")}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Approve All Variants</span>
          </button>
        </div>
      </div>

      {/* Ready To Schedule Banner if All Variants Approved */}
      {allApproved && (
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                All Platform Variants Approved!
              </h3>
              <p className="text-xs text-emerald-800">
                This content item is verified and ready to be scheduled on the client&apos;s editorial calendar.
              </p>
            </div>
          </div>
          <Link
            href={`/clients/${clientId}/calendar`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors shrink-0"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule on Calendar</span>
          </Link>
        </div>
      )}

      {/* Grid: Master Brief Overview + Platform Variants Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Master Content Brief & Media (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              Master Item Context
            </h2>

            <div className="space-y-2.5 text-xs text-slate-700">
              {item.campaign && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Campaign:</span>
                  <span className="font-semibold text-slate-900">{item.campaign.name}</span>
                </div>
              )}

              {item.contentPillar && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Content Pillar:</span>
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {item.contentPillar}
                  </span>
                </div>
              )}

              {item.coreMessage && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Core Brief:</span>
                  <p className="rounded-xl bg-slate-50 p-2.5 text-slate-800 border border-slate-100 leading-relaxed">
                    {item.coreMessage}
                  </p>
                </div>
              )}

              {item.targetAudience && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Audience:</span>
                  <span>{item.targetAudience}</span>
                </div>
              )}

              {item.callToAction && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Call To Action:</span>
                  <span className="font-medium text-slate-900">{item.callToAction}</span>
                </div>
              )}
            </div>

            {/* Media Gallery */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Attached Media Assets ({mediaUrls.length})
              </span>
              {mediaUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {mediaUrls.map((url, i) => (
                    <div
                      key={i}
                      className="group relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={url}
                        alt="asset"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300";
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No media assets attached.</p>
              )}
            </div>

            {/* Version History Quick Peek */}
            {item.versions && item.versions.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <History className="h-3.5 w-3.5 text-slate-400" />
                  Version History ({item.versions.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {item.versions.map((ver: any) => (
                    <div
                      key={ver.id}
                      className="rounded-lg bg-slate-50 p-2 text-[11px] border border-slate-100 flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-800">
                        v{ver.versionNumber}: {ver.changeSummary || "Update"}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Variants Side-by-Side / Review Tabs (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Variant Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setActivePlatformTab("ALL")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                  activePlatformTab === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 bg-slate-50"
                }`}
              >
                All Variants ({item.variants?.length || 0})
              </button>
              {item.variants?.map((v: any) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActivePlatformTab(v.platform)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold cursor-pointer transition-all ${
                    activePlatformTab === v.platform
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 bg-slate-50"
                  }`}
                >
                  <span>{v.platform}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                      v.approvalStatus === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : v.approvalStatus === "CHANGES_REQUESTED"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {v.approvalStatus}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Variants List / Detailed Cards */}
          <div className="space-y-5">
            {item.variants
              ?.filter((v: any) => activePlatformTab === "ALL" || v.platform === activePlatformTab)
              .map((variant: any) => (
                <div
                  key={variant.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4"
                >
                  {/* Variant Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                        {variant.platform}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getVariantStatusBadge(
                          variant.approvalStatus
                        )}`}
                      >
                        {variant.approvalStatus.replace("_", " ")}
                      </span>
                      {variant.isEditedManually && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-600/20">
                          Manually Edited
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Lang: {variant.language || "English"}
                      </span>
                    </div>

                    {/* Independent Platform Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReviewAction("REQUEST_CHANGES", variant.platform)}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                      >
                        Request Change ({variant.platform})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewAction("APPROVE", variant.platform)}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        Approve ({variant.platform})
                      </button>
                    </div>
                  </div>

                  {/* Headline & Body Copy */}
                  <div className="space-y-2 text-xs">
                    {variant.headline && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Headline / Hook:</span>
                        <p className="font-bold text-slate-900 text-sm">{variant.headline}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 text-[11px] block">Caption / Copy:</span>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-800 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 font-mono text-xs">
                        {variant.caption || "No caption generated."}
                      </p>
                    </div>

                    {/* TikTok Overlay & Direction */}
                    {variant.platform === "TIKTOK" && (
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                            On-Screen Text
                          </span>
                          <p className="text-xs font-semibold text-slate-900">
                            {variant.onScreenText || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                            Video Concept / Audio Idea
                          </span>
                          <p className="text-xs text-slate-700">{variant.videoIdea || "N/A"}</p>
                        </div>
                      </div>
                    )}

                    {/* Hashtags & CTA */}
                    <div className="flex flex-wrap items-center justify-between pt-2 gap-2 text-xs">
                      {variant.hashtags && (
                        <div className="text-blue-600 font-medium">{variant.hashtags}</div>
                      )}
                      {variant.cta && (
                        <div className="text-slate-600">
                          CTA: <span className="font-semibold text-slate-900">{variant.cta}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Feedback & Comments Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-slate-600" />
              Review Feedback & Change Requests
            </h3>

            <textarea
              rows={3}
              placeholder="Enter feedback or requested modifications for the creative team..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-blue-500 focus:outline-hidden"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Comments are saved to version audit trail.
              </span>
              <button
                type="button"
                onClick={() => handleReviewAction("REQUEST_CHANGES", activePlatformTab)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Revision Notes</span>
              </button>
            </div>

            {/* Existing Comments Log */}
            {latestApprovalRequest?.comments?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Recent Review Notes</span>
                {latestApprovalRequest.comments.map((c: any) => (
                  <div key={c.id} className="rounded-xl bg-slate-50 p-2.5 text-xs border border-slate-100">
                    <div className="flex justify-between items-center mb-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-800">{c.userName}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
