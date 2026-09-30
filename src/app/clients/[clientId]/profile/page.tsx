"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Building2,
  Package,
  Target,
  Sparkles,
  Award,
  Users,
  StickyNote,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { setIsDirty } = useWorkspace();

  const [activeTab, setActiveTab] = useState<string>("A");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State covering Sections A through G
  const [client, setClient] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    businessDescription: "",
    website: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Malaysia",
    serviceAreas: [],
  });
  const [services, setServices] = useState<any[]>([]);
  const [targetMarket, setTargetMarket] = useState<any>({
    geographicTarget: "",
    industryTarget: "",
    customerType: "B2B",
    languages: [],
    ageRange: "",
    buyerPersona: "",
    decisionMakers: [],
  });
  const [brandProfile, setBrandProfile] = useState<any>({
    brandPositioning: "",
    brandTone: "",
    preferredLanguage: "English",
    secondaryLanguage: "",
    visualStyle: "",
    brandColours: [],
    avoidedWords: [],
    preferredCta: "",
    companySlogan: "",
  });
  const [marketingObjectives, setMarketingObjectives] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/clients/${clientId}/profile`);
        if (res.ok) {
          const data = await res.json();
          setClient(data.client);
          if (data.profile) setProfile(data.profile);
          if (data.services) setServices(data.services);
          if (data.targetMarket) setTargetMarket(data.targetMarket);
          if (data.brandProfile) setBrandProfile(data.brandProfile);
          if (data.marketingObjectives) setMarketingObjectives(data.marketingObjectives);
          if (data.competitors) setCompetitors(data.competitors);
          if (data.notes) setNotes(data.notes);
        }
      } catch (err) {
        console.error("Failed to load client profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [clientId]);

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          services,
          targetMarket,
          brandProfile,
          marketingObjectives,
          competitors,
          notes,
        }),
      });

      if (res.ok) {
        setIsDirty(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />;
  }

  const tabs = [
    { id: "A", label: "A. Business Profile", icon: Building2 },
    { id: "B", label: "B. Business Services", icon: Package },
    { id: "C", label: "C. Target Market", icon: Target },
    { id: "D", label: "D. Brand Profile", icon: Sparkles },
    { id: "E", label: "E. Objectives", icon: Award },
    { id: "F", label: "F. Competitors", icon: Users },
    { id: "G", label: "G. Client Notes", icon: StickyNote },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Save CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Client Profile: {client?.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Master profile specifications, brand guidelines, target audience, and agency internal notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
              Changes Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {/* SECTION A: BUSINESS PROFILE */}
        {activeTab === "A" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Section A: Business Profile
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                <input
                  type="text"
                  value={client?.name || ""}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Brand Name</label>
                <input
                  type="text"
                  value={client?.brandName || ""}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Website</label>
                <input
                  type="url"
                  value={profile.website || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, website: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, email: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, phone: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">WhatsApp Lead Line</label>
                <input
                  type="text"
                  value={profile.whatsapp || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, whatsapp: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Business Description
              </label>
              <textarea
                rows={3}
                value={profile.businessDescription || ""}
                onChange={(e) => {
                  markDirty();
                  setProfile({ ...profile, businessDescription: e.target.value });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Physical Address</label>
                <input
                  type="text"
                  value={profile.address || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, address: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={profile.city || client?.locationCity || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, city: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">State / Region</label>
                <input
                  type="text"
                  value={profile.state || client?.locationState || ""}
                  onChange={(e) => {
                    markDirty();
                    setProfile({ ...profile, state: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: BUSINESS SERVICES */}
        {activeTab === "B" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Section B: Business Services</h2>
                <p className="text-xs text-slate-500">
                  Multiple services or products with selling points and target customers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setServices([
                    ...services,
                    {
                      name: "New Service",
                      category: "General",
                      description: "",
                      sellingPoints: [],
                      targetCustomers: [],
                      priceInfo: "",
                      isActive: true,
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    service.isActive ? "border-slate-200 bg-slate-50/50" : "border-slate-200 bg-slate-100/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Service #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].isActive = !updated[idx].isActive;
                          setServices(updated);
                        }}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold cursor-pointer ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {service.isActive ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete service "${service.name || 'Service'}"?`)) {
                          markDirty();
                          setServices(services.filter((_, i) => i !== idx));
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].name = e.target.value;
                          setServices(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Category
                      </label>
                      <input
                        type="text"
                        value={service.category}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].category = e.target.value;
                          setServices(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={service.description}
                      onChange={(e) => {
                        markDirty();
                        const updated = [...services];
                        updated[idx].description = e.target.value;
                        setServices(updated);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Selling Points (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(service.sellingPoints)
                            ? service.sellingPoints.join(", ")
                            : service.sellingPoints
                        }
                        onChange={(e) => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].sellingPoints = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setServices(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Target Customers (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={
                          Array.isArray(service.targetCustomers)
                            ? service.targetCustomers.join(", ")
                            : service.targetCustomers
                        }
                        onChange={(e) => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].targetCustomers = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          setServices(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Price Information
                      </label>
                      <input
                        type="text"
                        value={service.priceInfo || ""}
                        placeholder="e.g. Quotation per drawing"
                        onChange={(e) => {
                          markDirty();
                          const updated = [...services];
                          updated[idx].priceInfo = e.target.value;
                          setServices(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION C: TARGET MARKET */}
        {activeTab === "C" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Section C: Target Market & Buyer Persona
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Geographic Target
                </label>
                <input
                  type="text"
                  value={targetMarket.geographicTarget || ""}
                  onChange={(e) => {
                    markDirty();
                    setTargetMarket({ ...targetMarket, geographicTarget: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Industry Target
                </label>
                <input
                  type="text"
                  value={targetMarket.industryTarget || ""}
                  onChange={(e) => {
                    markDirty();
                    setTargetMarket({ ...targetMarket, industryTarget: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Customer Type</label>
                <select
                  value={targetMarket.customerType || "B2B"}
                  onChange={(e) => {
                    markDirty();
                    setTargetMarket({ ...targetMarket, customerType: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="B2B2C">B2B2C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Languages (comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(targetMarket.languages)
                      ? targetMarket.languages.join(", ")
                      : targetMarket.languages || ""
                  }
                  onChange={(e) => {
                    markDirty();
                    setTargetMarket({
                      ...targetMarket,
                      languages: e.target.value.split(",").map((l) => l.trim()).filter(Boolean),
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Key Decision Makers (comma-separated)
              </label>
              <input
                type="text"
                value={
                  Array.isArray(targetMarket.decisionMakers)
                    ? targetMarket.decisionMakers.join(", ")
                    : targetMarket.decisionMakers || ""
                }
                onChange={(e) => {
                  markDirty();
                  setTargetMarket({
                    ...targetMarket,
                    decisionMakers: e.target.value.split(",").map((d) => d.trim()).filter(Boolean),
                  });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Buyer Persona</label>
              <textarea
                rows={3}
                value={targetMarket.buyerPersona || ""}
                onChange={(e) => {
                  markDirty();
                  setTargetMarket({ ...targetMarket, buyerPersona: e.target.value });
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* SECTION D: BRAND PROFILE */}
        {activeTab === "D" && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Section D: Brand Profile & Identity
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Brand Positioning
                </label>
                <input
                  type="text"
                  value={brandProfile.brandPositioning || ""}
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({ ...brandProfile, brandPositioning: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Brand Tone</label>
                <input
                  type="text"
                  value={brandProfile.brandTone || ""}
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({ ...brandProfile, brandTone: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={brandProfile.preferredCta || ""}
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({ ...brandProfile, preferredCta: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Company Slogan</label>
                <input
                  type="text"
                  value={brandProfile.companySlogan || ""}
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({ ...brandProfile, companySlogan: e.target.value });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Brand Colours (Hex codes, comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(brandProfile.brandColours)
                      ? brandProfile.brandColours.join(", ")
                      : brandProfile.brandColours || ""
                  }
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({
                      ...brandProfile,
                      brandColours: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Avoided Words (comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(brandProfile.avoidedWords)
                      ? brandProfile.avoidedWords.join(", ")
                      : brandProfile.avoidedWords || ""
                  }
                  onChange={(e) => {
                    markDirty();
                    setBrandProfile({
                      ...brandProfile,
                      avoidedWords: e.target.value.split(",").map((w) => w.trim()).filter(Boolean),
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION E: MARKETING OBJECTIVES */}
        {activeTab === "E" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Section E: Marketing Objectives
                </h2>
                <p className="text-xs text-slate-500">
                  Current business objectives assigned to the social media campaigns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setMarketingObjectives([
                    ...marketingObjectives,
                    { title: "", priority: marketingObjectives.length + 1, isCompleted: false },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Objective</span>
              </button>
            </div>

            <div className="space-y-3">
              {marketingObjectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={obj.title}
                    onChange={(e) => {
                      markDirty();
                      const updated = [...marketingObjectives];
                      updated[idx].title = e.target.value;
                      setMarketingObjectives(updated);
                    }}
                    placeholder="e.g. Generate 20 WhatsApp leads/month"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      markDirty();
                      setMarketingObjectives(marketingObjectives.filter((_, i) => i !== idx));
                    }}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION F: COMPETITOR INFORMATION */}
        {activeTab === "F" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Section F: Competitor Information
                </h2>
                <p className="text-xs text-slate-500">
                  Data structure and tracking for market competitors (Scraping disabled in Phase 1).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setCompetitors([
                    ...competitors,
                    {
                      name: "Competitor",
                      website: "",
                      facebookUrl: "",
                      instagramUrl: "",
                      tiktokUrl: "",
                      notes: "",
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Competitor</span>
              </button>
            </div>

            <div className="space-y-4">
              {competitors.map((comp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Competitor #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        setCompetitors(competitors.filter((_, i) => i !== idx));
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Competitor Name
                      </label>
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...competitors];
                          updated[idx].name = e.target.value;
                          setCompetitors(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Website
                      </label>
                      <input
                        type="url"
                        value={comp.website}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...competitors];
                          updated[idx].website = e.target.value;
                          setCompetitors(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Facebook URL
                      </label>
                      <input
                        type="text"
                        value={comp.facebookUrl}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...competitors];
                          updated[idx].facebookUrl = e.target.value;
                          setCompetitors(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Instagram URL
                      </label>
                      <input
                        type="text"
                        value={comp.instagramUrl}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...competitors];
                          updated[idx].instagramUrl = e.target.value;
                          setCompetitors(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        TikTok URL
                      </label>
                      <input
                        type="text"
                        value={comp.tiktokUrl}
                        onChange={(e) => {
                          markDirty();
                          const updated = [...competitors];
                          updated[idx].tiktokUrl = e.target.value;
                          setCompetitors(updated);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Notes</label>
                    <textarea
                      rows={2}
                      value={comp.notes}
                      onChange={(e) => {
                        markDirty();
                        const updated = [...competitors];
                        updated[idx].notes = e.target.value;
                        setCompetitors(updated);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION G: CLIENT NOTES */}
        {activeTab === "G" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Section G: Internal Notes</h2>
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20 ring-inset">
                    Confidential Agency Internal
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Critical client nuances, approvals protocol, or sensitivities. Never visible to
                  the public.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setNotes([
                    ...notes,
                    {
                      title: "New Agency Note",
                      content: "",
                      isPinned: false,
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            <div className="space-y-4">
              {notes.map((note, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => {
                        markDirty();
                        const updated = [...notes];
                        updated[idx].title = e.target.value;
                        setNotes(updated);
                      }}
                      placeholder="Note Title"
                      className="font-bold text-xs text-slate-900 bg-transparent border-b border-slate-300 pb-1 focus:outline-hidden focus:border-blue-600 w-1/2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        markDirty();
                        setNotes(notes.filter((_, i) => i !== idx));
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={note.content}
                    onChange={(e) => {
                      markDirty();
                      const updated = [...notes];
                      updated[idx].content = e.target.value;
                      setNotes(updated);
                    }}
                    placeholder="Enter internal agency observations, approval rules, or special campaign instructions..."
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
