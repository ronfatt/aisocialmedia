"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Building2,
} from "lucide-react";

export default function ContentPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [activeTab, setActiveTab] = useState("ALL");
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentPillar: "",
    campaign: "",
    platforms: ["FACEBOOK"],
    internalNotes: "",
    status: "DRAFT",
    scheduledFor: "",
  });

  // Delete confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const fetchContentAndPillars = async () => {
    try {
      const [resContent, resStrategy] = await Promise.all([
        fetch(`/api/clients/${clientId}/content`),
        fetch(`/api/clients/${clientId}/strategy`),
      ]);

      if (resContent.ok) {
        const json = await resContent.json();
        setContentItems(json.items || []);
      }

      if (resStrategy.ok) {
        const stratJson = await resStrategy.json();
        setPillars(stratJson.strategy?.pillars || []);
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

  const togglePlatform = (p: string) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(p);
      return {
        ...prev,
        platforms: exists ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
      };
    });
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

      // Reset form & close
      setFormData({
        title: "",
        description: "",
        contentPillar: "",
        campaign: "",
        platforms: ["FACEBOOK"],
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
    if (activeTab === "ALL") return true;
    return item.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "SCHEDULED":
        return "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      case "PENDING_APPROVAL":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-500/20";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Pipeline</h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated content drafts, review queue, and scheduled social posts for this client.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Content</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {[
          { label: "All Content", value: "ALL" },
          { label: "Draft", value: "DRAFT" },
          { label: "Pending Approval", value: "PENDING_APPROVAL" },
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
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  activeTab === tab.value ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">Channels:</span>
                    {platforms.map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                    {item.internalNotes && (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md italic">
                        Note: {item.internalNotes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.scheduledFor && (
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-700">Scheduled Date</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(item.scheduledFor).toLocaleDateString()}
                      </p>
                    </div>
                  )}

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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No content yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Create the first content item for this client workspace.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700"
          >
            + Create Post
          </button>
        </div>
      )}

      {/* CREATE CONTENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Content Item</h3>
                <p className="text-xs text-slate-500">Draft or schedule a new social post.</p>
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
                  placeholder="Enter social post copy or caption (AI generation disabled in Phase 2)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Content Pillar
                  </label>
                  <select
                    value={formData.contentPillar}
                    onChange={(e) => setFormData({ ...formData, contentPillar: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="">Select Pillar (Optional)</option>
                    {pillars.map((pillar) => (
                      <option key={pillar.id} value={pillar.title}>
                        {pillar.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              {formData.status === "SCHEDULED" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Publishing Channels
                </label>
                <div className="flex gap-4">
                  {["FACEBOOK", "INSTAGRAM", "TIKTOK"].map((p) => {
                    const checked = formData.platforms.includes(p);
                    return (
                      <label key={p} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePlatform(p)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize">{p.toLowerCase()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Internal Notes</label>
                <input
                  type="text"
                  placeholder="Notes for approvers or client nuances..."
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
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
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
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
                  Are you sure you want to permanently delete &quot;{itemToDelete.title}&quot;? This action
                  cannot be undone.
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
