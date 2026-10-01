"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Save,
  Send,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  Film,
  Hash,
  Globe,
  Plus,
  X,
  FileCheck,
  ShieldAlert,
  Info,
} from "lucide-react";

interface VariantData {
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "TWITTER";
  headline: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  onScreenText?: string;
  videoIdea?: string;
  platformNotes?: string;
  language: string;
  isEditedManually: boolean;
}

export default function NewContentStudioPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  // Client context & reference data
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [pillars, setPillars] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);

  // Master Brief Form State
  const [title, setTitle] = useState("");
  const [coreMessage, setCoreMessage] = useState("");
  const [contentType, setContentType] = useState("IMAGE");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedPillarId, setSelectedPillarId] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [productsServices, setProductsServices] = useState("");
  const [selectedMediaUrls, setSelectedMediaUrls] = useState<string[]>([]);

  // Generation Controls
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "FACEBOOK",
    "INSTAGRAM",
    "TIKTOK",
    "TWITTER",
  ]);
  const [masterLanguage, setMasterLanguage] = useState("English");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qualityResults, setQualityResults] = useState<Record<string, any>>({});
  const [generationError, setGenerationError] = useState("");

  // Platform Variants State
  const [activePlatformTab, setActivePlatformTab] = useState<"FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "TWITTER">("FACEBOOK");
  const [variants, setVariants] = useState<Record<string, VariantData>>({
    FACEBOOK: {
      platform: "FACEBOOK",
      headline: "",
      hook: "",
      caption: "",
      cta: "",
      hashtags: "",
      language: "English",
      isEditedManually: false,
    },
    INSTAGRAM: {
      platform: "INSTAGRAM",
      headline: "",
      hook: "",
      caption: "",
      cta: "",
      hashtags: "",
      language: "English",
      isEditedManually: false,
    },
    TIKTOK: {
      platform: "TIKTOK",
      headline: "",
      hook: "",
      caption: "",
      cta: "",
      hashtags: "",
      onScreenText: "",
      videoIdea: "",
      language: "English",
      isEditedManually: false,
    },
    TWITTER: {
      platform: "TWITTER",
      headline: "",
      hook: "",
      caption: "",
      cta: "",
      hashtags: "",
      language: "English",
      isEditedManually: false,
    },
  });

  // Media Picker Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [customMediaUrl, setCustomMediaUrl] = useState("");

  // Save / Submit Status
  const [isSaving, setIsSaving] = useState(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  // Load client context, strategy, campaigns, media
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingContext(true);
        const [resClient, resStrategy, resCampaigns, resMedia] = await Promise.all([
          fetch(`/api/clients/${clientId}/profile`),
          fetch(`/api/clients/${clientId}/strategy`),
          fetch(`/api/clients/${clientId}/campaigns`),
          fetch(`/api/clients/${clientId}/media`),
        ]);

        if (resClient.ok) {
          const cData = await resClient.json();
          setClientInfo(cData.client);
          if (cData.client?.brandProfile?.preferredLanguage) {
            setMasterLanguage(cData.client.brandProfile.preferredLanguage);
          }
          if (cData.client?.brandProfile?.preferredCta) {
            setCallToAction(cData.client.brandProfile.preferredCta);
          }
        }

        if (resStrategy.ok) {
          const sData = await resStrategy.json();
          setStrategy(sData.strategy);
          setPillars(sData.strategy?.pillars || []);
          if (sData.strategy?.targetAudience) {
            setTargetAudience(sData.strategy.targetAudience);
          }
          if (sData.strategy?.targetLocations) {
            setTargetLocation(sData.strategy.targetLocations);
          }
        }

        if (resCampaigns.ok) {
          const campData = await resCampaigns.json();
          setCampaigns(campData.campaigns || []);
        }

        if (resMedia.ok) {
          const mData = await resMedia.json();
          setMediaAssets(mData.media || []);
        }
      } catch (err) {
        console.error("Failed to load client context", err);
      } finally {
        setLoadingContext(false);
      }
    }
    loadData();
  }, [clientId]);

  // Platform selection toggle
  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((x) => x !== p));
        if (activePlatformTab === p) {
          const remaining = selectedPlatforms.filter((x) => x !== p);
          setActivePlatformTab(remaining[0] as any);
        }
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  // Trigger AI Variant Generation
  const handleGenerateAI = async () => {
    if (!title.trim() && !coreMessage.trim()) {
      setGenerationError("Please enter a Title or Core Message brief first.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");

    try {
      const selectedPillar = pillars.find((p) => p.id === selectedPillarId);

      const res = await fetch(`/api/clients/${clientId}/content/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: coreMessage || title,
          coreMessage,
          campaignId: selectedCampaignId || undefined,
          targetAudience,
          targetLocation,
          callToAction,
          productsServices,
          contentType,
          language: masterLanguage,
          selectedPlatforms,
          preserveManualEdits: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI generation failed");
      }

      // Update variants state, respecting manual edits
      setVariants((prev) => {
        const next = { ...prev };
        for (const [platform, generated] of Object.entries(data.variants as Record<string, any>)) {
          // If variant already edited manually, preserve it or prompt
          if (prev[platform]?.isEditedManually) {
            // Keep existing manual version, but record suggested replacement
            continue;
          }
          next[platform] = {
            platform: platform as any,
            headline: generated.headline || "",
            hook: generated.hook || "",
            caption: generated.caption || "",
            cta: generated.cta || "",
            hashtags: generated.hashtags || "",
            onScreenText: generated.onScreenText || "",
            videoIdea: generated.videoIdea || "",
            platformNotes: generated.platformNotes || "",
            language: generated.language || masterLanguage,
            isEditedManually: false,
          };
        }
        return next;
      });

      if (data.qualityResults) {
        setQualityResults(data.qualityResults);
      }
    } catch (err: any) {
      setGenerationError(err.message || "Failed to generate AI variants");
    } finally {
      setIsGenerating(false);
    }
  };

  // Update variant field manually
  const updateVariantField = (
    platform: string,
    field: keyof VariantData,
    value: string
  ) => {
    setVariants((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
        isEditedManually: true,
      },
    }));
  };

  // Save Master Content Item & Variants
  const handleSave = async (submitForApproval = false) => {
    if (!title.trim()) {
      alert("Please provide a Title for this content item.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMessage("");

    try {
      const selectedPillar = pillars.find((p) => p.id === selectedPillarId);
      const variantPayload = selectedPlatforms.map((p) => ({
        platform: p,
        headline: variants[p]?.headline,
        hook: variants[p]?.hook,
        caption: variants[p]?.caption || "",
        cta: variants[p]?.cta,
        hashtags: variants[p]?.hashtags,
        onScreenText: variants[p]?.onScreenText,
        videoIdea: variants[p]?.videoIdea,
        platformNotes: variants[p]?.platformNotes,
        mediaSelection: selectedMediaUrls,
        language: variants[p]?.language || masterLanguage,
        isEditedManually: variants[p]?.isEditedManually || false,
      }));

      let contentItemId = savedContentId;

      if (!contentItemId) {
        // Create new item
        const res = await fetch(`/api/clients/${clientId}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            coreMessage,
            internalBrief: coreMessage,
            objective: strategy?.marketingObjectives || "Promote brand services",
            contentType,
            campaignId: selectedCampaignId || null,
            contentPillarId: selectedPillarId || null,
            contentPillar: selectedPillar?.title || null,
            targetAudience,
            targetLocation,
            callToAction,
            productsServices,
            platforms: selectedPlatforms,
            mediaUrls: selectedMediaUrls,
            status: "DRAFT",
            variants: variantPayload,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create content item");
        contentItemId = data.item.id;
        setSavedContentId(contentItemId);
      } else {
        // Update existing item
        const res = await fetch(`/api/clients/${clientId}/content/${contentItemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            coreMessage,
            contentType,
            campaignId: selectedCampaignId || null,
            contentPillarId: selectedPillarId || null,
            contentPillar: selectedPillar?.title || null,
            targetAudience,
            targetLocation,
            callToAction,
            productsServices,
            platforms: selectedPlatforms,
            mediaUrls: selectedMediaUrls,
            variants: variantPayload,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update content item");
      }

      // If Submit for Approval requested
      if (submitForApproval && contentItemId) {
        const subRes = await fetch(
          `/api/clients/${clientId}/content/${contentItemId}/submit-approval`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              platformScope: "ALL",
              notes: `Submitted from AI Studio with ${selectedPlatforms.join(", ")} variants.`,
            }),
          }
        );
        const subData = await subRes.json();
        if (!subRes.ok) throw new Error(subData.error || "Failed to submit for approval");
        setSaveSuccessMessage("Content submitted for approval successfully!");
        setTimeout(() => {
          router.push(`/clients/${clientId}/content/${contentItemId}/review`);
        }, 1200);
        return;
      }

      setSaveSuccessMessage("Saved as draft successfully!");
      setTimeout(() => setSaveSuccessMessage(""), 3500);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const currentVariant = variants[activePlatformTab] || {
    platform: activePlatformTab,
    headline: "",
    hook: "",
    caption: "",
    cta: "",
    hashtags: "",
    language: masterLanguage,
    isEditedManually: false,
  };

  const currentQuality = qualityResults[activePlatformTab];

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
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-purple-600/20">
                <Sparkles className="h-3 w-3" />
                AI Content Studio
              </span>
              <span className="text-xs text-slate-400">
                {savedContentId ? "Draft Saved" : "New Master Item"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Create Master Content & Platform Variants
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {saveSuccessMessage && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" />
              {saveSuccessMessage}
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Brief & Client Context) + Right (Platform Variants & Previews) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Context + Master Brief (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Strategy Context Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Client Brand Context
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                AI Context Verified
              </span>
            </div>

            {loadingContext ? (
              <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-semibold text-slate-900">{clientInfo?.companyName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Industry:</span>
                  <span className="font-medium text-slate-800">{clientInfo?.industry}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Brand Tone:</span>
                  <span className="font-medium text-slate-800">
                    {clientInfo?.brandProfile?.brandTone || "Authoritative, Industrial"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Target Market:</span>
                  <span className="font-medium text-slate-800">
                    {clientInfo?.targetMarket?.geographicTarget || "Malaysia"} (
                    {clientInfo?.targetMarket?.customerType || "B2B"})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Master Brief Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              Master Content Brief
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Post Title / Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 5-Axis Precision CNC Milling Capability"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="">No Campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Content Pillar</label>
                <select
                  value={selectedPillarId}
                  onChange={(e) => setSelectedPillarId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="">Select Pillar</option>
                  {pillars.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Core Message / Internal Brief <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe the main idea, feature showcase, engineering highlight, or key client takeaway..."
                value={coreMessage}
                onChange={(e) => setCoreMessage(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden bg-white"
                >
                  <option value="IMAGE">Single Image</option>
                  <option value="CAROUSEL">Carousel Post</option>
                  <option value="VIDEO">Video</option>
                  <option value="REEL">Instagram Reel</option>
                  <option value="SHORT_VIDEO">TikTok Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Call to Action</label>
                <input
                  type="text"
                  placeholder="e.g. Request an Engineering Quote"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Target Audience & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  placeholder="e.g. Plant Managers, Engineers"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Location</label>
                <input
                  type="text"
                  placeholder="e.g. Selangor, Johor, Singapore"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Media Attachment Section */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Attached Client Media ({selectedMediaUrls.length})
                </label>
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Select from Library
                </button>
              </div>

              {selectedMediaUrls.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMediaUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={url}
                        alt="selected media"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMediaUrls(selectedMediaUrls.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white group-hover:flex"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => setIsMediaModalOpen(true)}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-4 text-center hover:bg-slate-50"
                >
                  <ImageIcon className="h-5 w-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-600">
                    Click to attach photos or video clips
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Generator Trigger + Variants Editor + Live Previews (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Generator Control Box */}
          <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Generation Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uses client-isolated strategy, brand tone, and content pillars.
                </p>
              </div>

              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={masterLanguage}
                  onChange={(e) => setMasterLanguage(e.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
                >
                  <option value="English">English</option>
                  <option value="Bahasa Malaysia">Bahasa Malaysia</option>
                  <option value="Chinese">Chinese (简体中文)</option>
                  <option value="English + Chinese">Bilingual (English + Chinese)</option>
                  <option value="English + BM">Bilingual (English + BM)</option>
                </select>
              </div>
            </div>

            {/* Target Platforms Checklist */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-slate-700">Target Platforms:</span>
              {["FACEBOOK", "INSTAGRAM", "TIKTOK", "TWITTER"].map((p) => {
                const checked = selectedPlatforms.includes(p);
                return (
                  <label
                    key={p}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePlatform(p)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="capitalize">{p === "TWITTER" ? "Twitter / 𝕏" : p.toLowerCase()}</span>
                  </label>
                );
              })}
            </div>

            {/* Generate Action Button */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
              <span className="text-[11px] text-slate-500">
                Protects any manual edits you have already customized.
              </span>

              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synthesizing Client Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate {selectedPlatforms.length} Platform Variants</span>
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{generationError}</span>
              </div>
            )}
          </div>

          {/* Platform Variants Switcher & Editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex gap-2">
                {selectedPlatforms.map((plt) => {
                  const isActive = activePlatformTab === plt;
                  const vData = variants[plt];
                  return (
                    <button
                      key={plt}
                      onClick={() => setActivePlatformTab(plt as any)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>{plt}</span>
                      {vData?.isEditedManually && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            isActive ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Manual
                        </span>
                      )}
                      {vData?.caption && !vData?.isEditedManually && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                            isActive ? "bg-purple-400 text-slate-950" : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Language Override for Current Platform */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Variant Lang:</span>
                <select
                  value={currentVariant.language || masterLanguage}
                  onChange={(e) =>
                    updateVariantField(activePlatformTab, "language", e.target.value)
                  }
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white"
                >
                  <option value="English">English</option>
                  <option value="Bahasa Malaysia">Bahasa Malaysia</option>
                  <option value="Chinese">Chinese</option>
                  <option value="English + Chinese">English + Chinese</option>
                </select>
              </div>
            </div>

            {/* Quality & Factuality Warnings (if any) */}
            {currentQuality && (
              <div
                className={`rounded-xl p-3 text-xs border ${
                  currentQuality.isFactuallySound
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                    : "bg-amber-50/70 border-amber-200 text-amber-800"
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {currentQuality.isFactuallySound ? (
                    <FileCheck className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                  )}
                  <span>
                    Quality Assessment: Score {currentQuality.score}/100 •{" "}
                    {currentQuality.isFactuallySound
                      ? "Factually Sound"
                      : "Factuality Check Warnings"}
                  </span>
                </div>
                {currentQuality.unverifiedClaims?.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 space-y-0.5 text-[11px]">
                    {currentQuality.unverifiedClaims.map((claim: string, i: number) => (
                      <li key={i}>{claim}</li>
                    ))}
                  </ul>
                )}
                {currentQuality.suggestions?.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-600 italic">
                    Tip: {currentQuality.suggestions[0]}
                  </p>
                )}
              </div>
            )}

            {/* Editor Fields for Selected Platform */}
            <div className="space-y-4">
              {/* Hook or Headline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {activePlatformTab === "TIKTOK"
                    ? "Video Hook (First 3 Seconds)"
                    : activePlatformTab === "INSTAGRAM"
                    ? "Opening Hook Line"
                    : "Headline"}
                </label>
                <input
                  type="text"
                  placeholder="Compelling opening that halts scrolling..."
                  value={currentVariant.hook || currentVariant.headline || ""}
                  onChange={(e) => {
                    updateVariantField(activePlatformTab, "hook", e.target.value);
                    updateVariantField(activePlatformTab, "headline", e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Main Caption Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {activePlatformTab} Caption & Body Copy
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {currentVariant.caption.length} characters
                  </span>
                </div>
                <textarea
                  rows={6}
                  placeholder={`Write or refine ${activePlatformTab} copy...`}
                  value={currentVariant.caption}
                  onChange={(e) =>
                    updateVariantField(activePlatformTab, "caption", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono leading-relaxed focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* TikTok Specific Fields */}
              {activePlatformTab === "TIKTOK" && (
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      On-Screen Text Overlay
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Costly Machining Mistakes to Avoid ⚠️"
                      value={currentVariant.onScreenText || ""}
                      onChange={(e) =>
                        updateVariantField(activePlatformTab, "onScreenText", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Visual Direction / Audio Concept
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Fast B-roll cuts of CNC coolant stream + trending beat"
                      value={currentVariant.videoIdea || ""}
                      onChange={(e) =>
                        updateVariantField(activePlatformTab, "videoIdea", e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Hashtags & CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Hash className="h-3 w-3 text-slate-400" /> Hashtags
                  </label>
                  <input
                    type="text"
                    placeholder="#MetalFabrication #EngineeringMY"
                    value={currentVariant.hashtags || ""}
                    onChange={(e) =>
                      updateVariantField(activePlatformTab, "hashtags", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Call to Action</label>
                  <input
                    type="text"
                    placeholder="e.g. WhatsApp us link in bio"
                    value={currentVariant.cta || ""}
                    onChange={(e) => updateVariantField(activePlatformTab, "cta", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* LIVE FEED PREVIEW BOX */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  Live Platform Preview ({activePlatformTab})
                </span>
                <span className="text-[11px] text-slate-400">Preview representation</span>
              </div>

              {/* Social Card Simulation */}
              {activePlatformTab === "TWITTER" ? (
                <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xs font-sans text-xs">
                  {/* Twitter Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                        ⚡
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900">{clientInfo?.companyName || "SPARK AI"}</span>
                          <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-blue-500 text-white text-[9px] font-bold">
                            ✓
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">@{(clientInfo?.companyName || "SparkQuant").toLowerCase().replace(/\s+/g, "")} · 2h</p>
                      </div>
                    </div>
                    <span className="text-slate-900 font-bold text-base leading-none">𝕏</span>
                  </div>

                  {/* Tweet Body */}
                  <div className="mt-3 space-y-2 text-slate-800 text-xs">
                    {currentVariant.hook && (
                      <p className="font-bold text-slate-950 text-sm leading-snug">{currentVariant.hook}</p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {currentVariant.caption || "Craft your tweet copy to see real-time X formatting..."}
                    </p>
                    {currentVariant.hashtags && (
                      <p className="text-blue-500 font-medium text-xs">{currentVariant.hashtags}</p>
                    )}
                  </div>

                  {/* Media Preview if attached */}
                  {selectedMediaUrls[0] && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 aspect-video">
                      <img src={selectedMediaUrls[0]} alt="tweet media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Twitter Engagement Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="hover:text-blue-500 cursor-pointer">💬 24</span>
                    <span className="hover:text-emerald-500 cursor-pointer">🔁 89</span>
                    <span className="hover:text-rose-500 cursor-pointer">❤️ 342</span>
                    <span className="hover:text-blue-500 cursor-pointer">📊 14.8K</span>
                    <span className="hover:text-blue-500 cursor-pointer">🔖 📤</span>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-xs">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 pb-3">
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {clientInfo?.companyName?.slice(0, 2).toUpperCase() || "CC"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {clientInfo?.companyName || "Client Brand"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {activePlatformTab === "INSTAGRAM"
                          ? "@" + (clientInfo?.companyName || "brand").toLowerCase().replace(/\s+/g, "")
                          : "Sponsored • Just now"}
                      </p>
                    </div>
                  </div>

                  {/* Media Preview */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-200 mb-3 flex items-center justify-center">
                    {selectedMediaUrls[0] ? (
                      <img
                        src={selectedMediaUrls[0]}
                        alt="preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500";
                        }}
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
                        <span className="text-xs">No media attached</span>
                      </div>
                    )}

                    {/* TikTok On-Screen Overlay simulation */}
                    {activePlatformTab === "TIKTOK" && currentVariant.onScreenText && (
                      <div className="absolute inset-x-4 top-1/3 rounded-lg bg-black/70 p-2 text-center text-xs font-bold text-yellow-300 backdrop-blur-2xs">
                        {currentVariant.onScreenText}
                      </div>
                    )}
                  </div>

                  {/* Simulated Copy */}
                  <div className="space-y-1.5 text-xs text-slate-800">
                    {currentVariant.hook && (
                      <p className="font-bold text-slate-900">{currentVariant.hook}</p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {currentVariant.caption || "Generate or enter copy to see simulated feed appearance..."}
                    </p>
                    {currentVariant.hashtags && (
                      <p className="text-blue-600 font-medium text-[11px]">{currentVariant.hashtags}</p>
                    )}
                    {currentVariant.cta && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {currentVariant.cta}
                        </span>
                        <span className="rounded-lg bg-blue-600 px-3 py-1 text-[10px] font-bold text-white">
                          Learn More
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA SELECTOR MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Media for Content</h3>
                <p className="text-xs text-slate-500">
                  Select from {clientInfo?.companyName || "client"}&apos;s isolated media assets.
                </p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Custom URL Option */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or paste external media image URL (https://...)"
                value={customMediaUrl}
                onChange={(e) => setCustomMediaUrl(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => {
                  if (customMediaUrl.trim()) {
                    setSelectedMediaUrls([...selectedMediaUrls, customMediaUrl.trim()]);
                    setCustomMediaUrl("");
                  }
                }}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Add URL
              </button>
            </div>

            {/* Media Grid */}
            {mediaAssets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {mediaAssets.map((asset) => {
                  const isSelected = selectedMediaUrls.includes(asset.fileUrl);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMediaUrls(
                            selectedMediaUrls.filter((u) => u !== asset.fileUrl)
                          );
                        } else {
                          setSelectedMediaUrls([...selectedMediaUrls, asset.fileUrl]);
                        }
                      }}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-600/30"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={asset.fileUrl}
                        alt={asset.fileName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300";
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-[10px] text-white truncate">
                        {asset.fileName}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500">
                No media assets found in client library. You can upload media in the Media Library or paste image URLs.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
              >
                Done ({selectedMediaUrls.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
