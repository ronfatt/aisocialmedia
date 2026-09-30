"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Image as ImageIcon,
  UploadCloud,
  Film,
  File,
  Plus,
  X,
  Tag,
  Building2,
  FolderOpen,
} from "lucide-react";

export default function MediaLibraryPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [filter, setFilter] = useState("ALL");
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const [formData, setFormData] = useState({
    fileName: "",
    fileUrl: "",
    fileType: "image/jpeg",
    fileSize: 2000000,
    category: "Images",
    tags: "",
  });

  const fetchMedia = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/media`);
      if (res.ok) {
        const json = await res.json();
        setMediaList(json.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [clientId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileName.trim() || !formData.fileUrl.trim()) {
      setModalError("File name and URL are required");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const payload = {
        fileName: formData.fileName,
        fileUrl: formData.fileUrl,
        fileType: formData.fileType,
        fileSize: Number(formData.fileSize),
        category: formData.category,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/clients/${clientId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload media");
      }

      setFormData({
        fileName: "",
        fileUrl: "",
        fileType: "image/jpeg",
        fileSize: 2000000,
        category: "Images",
        tags: "",
      });
      setIsModalOpen(false);
      await fetchMedia();
    } catch (err: any) {
      setModalError(err.message || "Failed to register asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (filter === "ALL") return true;
    return m.category === filter;
  });

  const categories = [
    { label: "All Media", value: "ALL" },
    { label: "Images", value: "Images" },
    { label: "Videos", value: "Videos" },
    { label: "Brand Assets", value: "Brand Assets" },
    { label: "Documents", value: "Documents" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Media Library</h1>
          <p className="mt-1 text-xs text-slate-500">
            Isolated cloud media repository for this client&apos;s graphics, video clips, and documents.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {categories.map((cat) => {
          const count =
            cat.value === "ALL"
              ? mediaList.length
              : mediaList.filter((m) => m.category === cat.value).length;

          return (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === cat.value
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  filter === cat.value ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMedia.map((asset) => (
            <div
              key={asset.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                {asset.fileType.startsWith("image") ? (
                  <img
                    src={asset.fileUrl}
                    alt={asset.fileName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : asset.fileType.startsWith("video") ? (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Film className="h-10 w-10 text-slate-400" />
                    <span className="text-[11px] font-semibold">Video Asset</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <File className="h-10 w-10 text-slate-400" />
                    <span className="text-[11px] font-semibold">Document Asset</span>
                  </div>
                )}

                <span className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs uppercase">
                  {asset.category}
                </span>
              </div>

              <div className="p-4">
                <p className="truncate text-xs font-bold text-slate-800" title={asset.fileName}>
                  {asset.fileName}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {asset.tags?.map((t: string) => (
                    <span
                      key={t}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                  <span>{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                  <span>Uploaded by {asset.uploadedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FolderOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No media yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Upload the first media asset or brand graphic for this client workspace.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
          >
            Upload Media
          </button>
        </div>
      )}

      {/* UPLOAD MEDIA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Media Asset</h3>
                <p className="text-xs text-slate-500">
                  Register a media asset into this client workspace.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpload} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Factory-12kW-Laser-Cutting.jpg"
                  value={formData.fileName}
                  onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  File URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="Images">Images</option>
                    <option value="Videos">Videos</option>
                    <option value="Brand Assets">Brand Assets</option>
                    <option value="Documents">Documents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">File Type</label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="image/jpeg">JPEG Image</option>
                    <option value="image/png">PNG Image</option>
                    <option value="video/mp4">MP4 Video</option>
                    <option value="application/pdf">PDF Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Laser, CNC, Showcase"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
                  {isSubmitting ? "Uploading..." : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
