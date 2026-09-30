"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Share2,
  Trash2,
  X,
  Layers,
  AlertTriangle,
  Sparkles,
  Copy,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Check,
} from "lucide-react";

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState("ALL");
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Quick Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentPillar: "",
    campaign: "",
    platforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
    internalNotes: "",
    status: "DRAFT",
    scheduledFor: "",
  });

  // Action states
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [duplicateSuccessId, setDuplicateSuccessId] = useState<string | null>(null);

  const fetchContentAndPillars = async () => {
    try {
      setLoading(true);
      const [resContent, resStrategy, resCampaigns] = await Promise.all([
        fetch(`/api/clients/${clientId}/content`),
        fetch(`/api/clients/${clientId}/strategy`),
        fetch(`/api/clients/${clientId}/campaigns`),
      ]);

      if (resContent.ok) {
        const json = await resContent.json();
        setContentItems(json.items || []);
      }

      if (resStrategy.ok) {
        const stratJson = await resStrategy.json();
        setPillars(stratJson.strategy?.pillars || []);
      }

      if (resCampaigns.ok) {
        const campJson = await resCampaigns.json();
        setCampaigns(campJson.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentAndPillars();
  }, [clientId]);

  const handleDuplicate = async (contentId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}/content/${contentId}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        setDuplicateSuccessId(contentId);
        setTimeout(() => setDuplicateSuccessId(null), 2500);
        await fetchContentAndPillars();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const res = await fetch(`/api/clients/${clientId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create content item");
      }

      setFormData({
        title: "",
        description: "",
        contentPillar: "",
        campaign: "",
        platforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
        internalNotes: "",
        status: "DRAFT",
        scheduledFor: "",
      });
      setIsModalOpen(false);
      await fetchContentAndPillars();
    } catch (err: any) {
      setModalError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/clients/${clientId}/content/${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItemToDelete(null);
        await fetchContentAndPillars();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredItems = contentItems.filter((item) => {
    if (activeTab !== "ALL" && item.status !== activeTab) return false;
    if (selectedPillar !== "ALL" && item.contentPillar !== selectedPillar) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCore = item.coreMessage?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCore) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "SCHEDULED":
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "APPROVED":
        return "bg-teal-50 text-teal-700 ring-teal-600/20";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "CHANGES_REQUESTED":
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Pipeline</h1>
          <p className="mt-1 text-xs text-slate-500">
            Master content items, platform-specific AI variants, and approval workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Quick Post</span>
          </button>

          <Link
            href={`/clients/${clientId}/content/new`}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open AI Content Studio</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
          {[
            { label: "All", value: "ALL" },
            { label: "Draft", value: "DRAFT" },
            { label: "Pending Approval", value: "PENDING_APPROVAL" },
            { label: "Changes Requested", value: "CHANGES_REQUESTED" },
            { label: "Approved", value: "APPROVED" },
            { label: "Scheduled", value: "SCHEDULED" },
            { label: "Published", value: "PUBLISHED" },
          ].map((tab) => {
            const count =
              tab.value === "ALL"
                ? contentItems.length
                : contentItems.filter((i) => i.status === tab.value).length;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.value
                    ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.value
                      ? "bg-purple-100 text-purple-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Pillar Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs focus:border-purple-500 focus:outline-hidden w-40 sm:w-52"
            />
          </div>

          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Pillars</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.title}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Items List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            let platforms: string[] = [];
            try {
              platforms = JSON.parse(item.platforms || "[]");
            } catch {
              platforms = [item.platforms];
            }

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-slate-300 md:flex-row md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status.replace("_", " ")}
                    </span>

                    {item.campaign && (
                      <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                        {item.campaign.name}
                      </span>
                    )}

                    {item.contentPillar && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                        <Layers className="h-3 w-3" />
                        {item.contentPillar}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      By {item.createdBy} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  {(item.coreMessage || item.description) && (
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                      {item.coreMessage || item.description}
                    </p>
                  )}

                  {/* Platform Variants Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Platform Variants:</span>
                    {item.variants && item.variants.length > 0 ? (
                      item.variants.map((v: any) => (
                        <span
                          key={v.id}
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                            v.approvalStatus === "APPROVED"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : v.approvalStatus === "CHANGES_REQUESTED"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              v.approvalStatus === "APPROVED"
                                ? "bg-emerald-500"
                                : v.approvalStatus === "CHANGES_REQUESTED"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {v.platform}
                          {v.isEditedManually && " (Edited)"}
                        </span>
                      ))
                    ) : (
                      platforms.map((p) => (
                        <span
                          key={p}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                        >
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/clients/${clientId}/content/${item.id}/review`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>Review & Approvals</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDuplicate(item.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Duplicate Master Item & Variants"
                  >
                    {duplicateSuccessId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Content Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No content items found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Launch the AI Content Studio to craft your first multi-platform social campaign.
          </p>
          <div className="mt-4 flex gap-2">
            <Link
              href={`/clients/${clientId}/content/new`}
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-purple-700"
            >
              Open AI Content Studio
            </Link>
          </div>
        </div>
      )}

      {/* QUICK POST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Quick Content Item</h3>
                <p className="text-xs text-slate-500">Create a quick post or draft.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateContent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5-Axis CNC Precision Flange Showcase"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Caption / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter social post copy or caption..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Save Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Content Item</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Are you sure you want to permanently delete &quot;{itemToDelete.title}&quot;? This
                  will remove all associated platform variants.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 cursor-pointer"
              >
                Delete Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
