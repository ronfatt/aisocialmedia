"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
  Bot,
  Power,
  PowerOff,
} from "lucide-react";

export default function ClientStrategyPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { setIsDirty } = useWorkspace();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [client, setClient] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    brandPositioning: "",
    marketingObjectives: "",
    targetAudience: "",
    targetLocations: "",
    targetIndustries: "",
    mainProductsServices: "",
    keySellingPoints: "",
    preferredPlatforms: ["Facebook", "Instagram"],
    postingFrequency: "",
    languageStrategy: "",
    ctaStrategy: "",
    campaignPriorities: "",
    specialInstructions: "",
    pillars: [],
  });

  useEffect(() => {
    async function loadStrategy() {
      try {
        const res = await fetch(`/api/clients/${clientId}/strategy`);
        if (res.ok) {
          const json = await res.json();
          setClient(json.client);
          if (json.strategy) {
            setFormData({
              brandPositioning: json.strategy.brandPositioning || "",
              marketingObjectives: json.strategy.marketingObjectives || "",
              targetAudience: json.strategy.targetAudience || "",
              targetLocations: json.strategy.targetLocations || "",
              targetIndustries: json.strategy.targetIndustries || "",
              mainProductsServices: json.strategy.mainProductsServices || "",
              keySellingPoints: json.strategy.keySellingPoints || "",
              preferredPlatforms: json.strategy.preferredPlatforms || ["Facebook", "Instagram"],
              postingFrequency: json.strategy.postingFrequency || "",
              languageStrategy: json.strategy.languageStrategy || "",
              ctaStrategy: json.strategy.ctaStrategy || "",
              campaignPriorities: json.strategy.campaignPriorities || "",
              specialInstructions: json.strategy.specialInstructions || "",
              pillars: (json.strategy.pillars || []).map((p: any) => ({
                ...p,
                isActive: p.isActive ?? true,
              })),
            });
          }
        }
      } catch (e) {
        console.error("Failed to load strategy", e);
      } finally {
        setLoading(false);
      }
    }
    loadStrategy();
  }, [clientId]);

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const updateField = (field: string, value: any) => {
    markDirty();
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Content Pillar management: Add, Edit, Reorder, Enable/Disable, Delete
  const addPillar = () => {
    markDirty();
    setFormData((prev: any) => ({
      ...prev,
      pillars: [
        ...prev.pillars,
        {
          title: `Content Pillar ${prev.pillars.length + 1}`,
          description: "",
          isActive: true,
          orderIndex: prev.pillars.length + 1,
        },
      ],
    }));
  };

  const updatePillar = (index: number, field: string, val: any) => {
    markDirty();
    setFormData((prev: any) => {
      const updated = [...prev.pillars];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, pillars: updated };
    });
  };

  const togglePillarActive = (index: number) => {
    markDirty();
    setFormData((prev: any) => {
      const updated = [...prev.pillars];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      return { ...prev, pillars: updated };
    });
  };

  const movePillar = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === formData.pillars.length - 1) return;

    markDirty();
    setFormData((prev: any) => {
      const updated = [...prev.pillars];
      const targetIndex = direction === "UP" ? index - 1 : index + 1;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, pillars: updated };
    });
  };

  const removePillar = (index: number) => {
    markDirty();
    setFormData((prev: any) => ({
      ...prev,
      pillars: prev.pillars.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/strategy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save strategy failed", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Save CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Marketing Strategy
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 ring-inset">
              <Sparkles className="h-3 w-3" />
              Strategy Brain Foundation
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Marketing Strategy specifications and content pillars for <strong>{client?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              Strategy Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Strategy..." : "Save Strategy"}</span>
          </button>
        </div>
      </div>

      {/* AI STRATEGY ASSISTANT FUTURE PLACEHOLDER (Section 13 requirement) */}
      <div className="flex items-center justify-between rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/40 p-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">AI Strategy Assistant</h3>
            <p className="text-xs text-indigo-700">Coming in a future phase</p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-semibold text-indigo-700">
          Planned for Phase 3
        </span>
      </div>

      {/* Main Strategy Form Fields */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Strategy Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Foundations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Strategic Foundation
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Brand Positioning
              </label>
              <textarea
                rows={2}
                value={formData.brandPositioning}
                onChange={(e) => updateField("brandPositioning", e.target.value)}
                placeholder="How this client stands out from competitors..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Marketing Objectives
              </label>
              <textarea
                rows={2}
                value={formData.marketingObjectives}
                onChange={(e) => updateField("marketingObjectives", e.target.value)}
                placeholder="Specific commercial goals (e.g. Generate 20 WhatsApp RFQs/month)..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateField("targetAudience", e.target.value)}
                  placeholder="e.g. Factory Owners, Engineering Directors"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Target Locations
                </label>
                <input
                  type="text"
                  value={formData.targetLocations}
                  onChange={(e) => updateField("targetLocations", e.target.value)}
                  placeholder="e.g. Klang Valley, Penang, Singapore"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Target Industries
                </label>
                <input
                  type="text"
                  value={formData.targetIndustries}
                  onChange={(e) => updateField("targetIndustries", e.target.value)}
                  placeholder="e.g. Metal Fabrication, Oil & Gas, Automation"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Posting Frequency
                </label>
                <input
                  type="text"
                  value={formData.postingFrequency}
                  onChange={(e) => updateField("postingFrequency", e.target.value)}
                  placeholder="e.g. 4 posts / week (2 FB, 2 TikTok)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Value Proposition & Operations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Value Proposition & Communication Strategy
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Main Products / Services
              </label>
              <textarea
                rows={2}
                value={formData.mainProductsServices}
                onChange={(e) => updateField("mainProductsServices", e.target.value)}
                placeholder="Core offerings to highlight repeatedly across campaigns..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Key Selling Points
              </label>
              <textarea
                rows={2}
                value={formData.keySellingPoints}
                onChange={(e) => updateField("keySellingPoints", e.target.value)}
                placeholder="Speed, tolerances, certifications, local inventory..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Language Strategy
                </label>
                <input
                  type="text"
                  value={formData.languageStrategy}
                  onChange={(e) => updateField("languageStrategy", e.target.value)}
                  placeholder="e.g. English (60%), BM (30%), Chinese (10%)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">CTA Strategy</label>
                <input
                  type="text"
                  value={formData.ctaStrategy}
                  onChange={(e) => updateField("ctaStrategy", e.target.value)}
                  placeholder="e.g. WhatsApp direct drawing upload template"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Campaign Priorities
              </label>
              <input
                type="text"
                value={formData.campaignPriorities}
                onChange={(e) => updateField("campaignPriorities", e.target.value)}
                placeholder="e.g. Q4 Laser cutting capacity push"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Special Instructions
              </label>
              <textarea
                rows={2}
                value={formData.specialInstructions}
                onChange={(e) => updateField("specialInstructions", e.target.value)}
                placeholder="Things to always mention, client sensitivities, or specific guidelines..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Content Pillars (Add, Edit, Reorder, Enable/Disable, Delete) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">Content Pillars</h2>
                </div>
                <button
                  type="button"
                  onClick={addPillar}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Pillar</span>
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Support: Add, Edit, Reorder, Enable/Disable, Delete.
              </p>

              <div className="mt-4 space-y-3">
                {formData.pillars.map((pillar: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-3 space-y-2 transition-all ${
                      pillar.isActive
                        ? "border-indigo-100 bg-indigo-50/30"
                        : "border-slate-200 bg-slate-100/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white shrink-0">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => updatePillar(index, "title", e.target.value)}
                          placeholder="Pillar Title"
                          className="font-bold text-xs text-slate-800 bg-transparent border-b border-indigo-200 focus:outline-hidden focus:border-indigo-600 w-full"
                        />
                      </div>

                      {/* Controls: Reorder Up/Down, Enable/Disable, Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => movePillar(index, "UP")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formData.pillars.length - 1}
                          onClick={() => movePillar(index, "DOWN")}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePillarActive(index)}
                          className={`p-1 rounded-md cursor-pointer ${
                            pillar.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-200"
                          }`}
                          title={pillar.isActive ? "Disable Pillar" : "Enable Pillar"}
                        >
                          {pillar.isActive ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removePillar(index)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete Pillar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={pillar.description || ""}
                      onChange={(e) => updatePillar(index, "description", e.target.value)}
                      placeholder="Brief topic angle or purpose..."
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 focus:outline-hidden"
                    />
                  </div>
                ))}

                {formData.pillars.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No content pillars configured.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
