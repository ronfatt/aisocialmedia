"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Building2,
  Package,
  Target,
  Sparkles,
  Award,
  Share2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

export default function NewClientOnboardingPage() {
  const router = useRouter();
  const { refreshClients, switchClient } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State across all 6 steps
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: "",
    brandName: "",
    industry: "",
    locationCity: "",
    locationState: "",
    locationCountry: "Malaysia",
    businessDescription: "",
    website: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    serviceAreas: "Klang Valley, Selangor, Penang, Johor",

    // Step 2: Products / Services
    services: [
      {
        name: "",
        category: "",
        description: "",
        sellingPoints: "",
        targetCustomers: "",
        priceInfo: "",
      },
    ],

    // Step 3: Target Market
    geographicTarget: "",
    industryTarget: "",
    customerType: "B2B",
    languages: "English, Bahasa Melayu",
    ageRange: "30 - 60",
    buyerPersona: "",
    decisionMakers: "Purchasing Manager, Engineering Director, Business Owner",

    // Step 4: Brand Information
    brandPositioning: "",
    brandTone: "Authoritative, Industrial, Reliable, Solution-Focused",
    preferredLanguage: "English",
    secondaryLanguage: "Bahasa Melayu",
    visualStyle: "Clean, high-contrast industrial visuals with technical clarity",
    brandColours: "#0F172A, #2563EB",
    avoidedWords: "cheap, discount, low-cost",
    preferredCta: "Request an Engineering Quote",
    companySlogan: "",

    // Step 5: Marketing Objectives
    marketingObjectives: [
      "Generate qualified B2B WhatsApp inquiries",
      "Establish regional industry authority",
    ],

    // Step 6: Preferred Social Platforms
    preferredPlatforms: ["Facebook", "Instagram", "TikTok"],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 2 Services Helper
  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: "",
          category: "",
          description: "",
          sellingPoints: "",
          targetCustomers: "",
          priceInfo: "",
        },
      ],
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const removeService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  // Step 5 Objectives Helper
  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      marketingObjectives: [...prev.marketingObjectives, ""],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.marketingObjectives];
      updated[index] = value;
      return { ...prev, marketingObjectives: updated };
    });
  };

  const removeObjective = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      marketingObjectives: prev.marketingObjectives.filter((_, i) => i !== index),
    }));
  };

  // Step 6 Platform Toggle
  const togglePlatform = (platform: string) => {
    setFormData((prev) => {
      const exists = prev.preferredPlatforms.includes(platform);
      return {
        ...prev,
        preferredPlatforms: exists
          ? prev.preferredPlatforms.filter((p) => p !== platform)
          : [...prev.preferredPlatforms, platform],
      };
    });
  };

  // Validation
  const canProceed = () => {
    if (currentStep === 1) {
      return (
        formData.companyName.trim() !== "" &&
        formData.industry.trim() !== "" &&
        formData.locationCity.trim() !== "" &&
        formData.locationState.trim() !== ""
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        companyName: formData.companyName,
        brandName: formData.brandName || formData.companyName,
        industry: formData.industry,
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        locationCountry: formData.locationCountry,
        businessDescription: formData.businessDescription,
        website: formData.website,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address: formData.address,
        serviceAreas: formData.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
        services: formData.services
          .filter((s) => s.name.trim() !== "")
          .map((s) => ({
            name: s.name,
            category: s.category || formData.industry,
            description: s.description,
            sellingPoints: s.sellingPoints.split(",").map((p) => p.trim()).filter(Boolean),
            targetCustomers: s.targetCustomers.split(",").map((c) => c.trim()).filter(Boolean),
            priceInfo: s.priceInfo,
          })),
        targetMarket: {
          geographicTarget: formData.geographicTarget || `${formData.locationCity}, ${formData.locationState}`,
          industryTarget: formData.industryTarget || formData.industry,
          customerType: formData.customerType,
          languages: formData.languages.split(",").map((l) => l.trim()).filter(Boolean),
          ageRange: formData.ageRange,
          buyerPersona: formData.buyerPersona,
          decisionMakers: formData.decisionMakers.split(",").map((d) => d.trim()).filter(Boolean),
        },
        brandProfile: {
          brandPositioning: formData.brandPositioning,
          brandTone: formData.brandTone,
          preferredLanguage: formData.preferredLanguage,
          secondaryLanguage: formData.secondaryLanguage,
          visualStyle: formData.visualStyle,
          brandColours: formData.brandColours.split(",").map((c) => c.trim()).filter(Boolean),
          avoidedWords: formData.avoidedWords.split(",").map((w) => w.trim()).filter(Boolean),
          preferredCta: formData.preferredCta,
          companySlogan: formData.companySlogan,
        },
        marketingObjectives: formData.marketingObjectives.filter((o) => o.trim() !== ""),
        preferredPlatforms: formData.preferredPlatforms,
      };

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create client workspace");
      }

      const data = await res.json();
      await refreshClients();
      router.push(`/clients/${data.client.id}/overview`);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Company", icon: Building2 },
    { number: 2, title: "Services", icon: Package },
    { number: 3, title: "Target Market", icon: Target },
    { number: 4, title: "Brand Profile", icon: Sparkles },
    { number: 5, title: "Objectives", icon: Award },
    { number: 6, title: "Socials", icon: Share2 },
    { number: 7, title: "Review", icon: CheckCircle },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Clients</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Client Workspace
          </h1>
          <p className="text-sm text-slate-500">
            Step {currentStep} of 7 — Set up an isolated workspace for a new agency client.
          </p>
        </div>
      </div>

      {/* Step Wizard Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-7 gap-2">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const Icon = step.icon;

            return (
              <button
                key={step.number}
                type="button"
                disabled={step.number > currentStep}
                onClick={() => setCurrentStep(step.number)}
                className={`flex flex-col items-center rounded-xl p-2 text-center transition-all ${
                  isCurrent
                    ? "bg-blue-50 text-blue-700 ring-2 ring-blue-600/30"
                    : isCompleted
                    ? "text-emerald-700 hover:bg-slate-50 cursor-pointer"
                    : "text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="mt-1 text-[11px] font-semibold">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Company Information */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 1: Company Information</h2>
            <p className="text-xs text-slate-500">
              Primary business identity and contact credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. UXUI HOLDINGS"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Brand Name</label>
              <input
                type="text"
                placeholder="e.g. UXUI Fabrication Systems"
                value={formData.brandName}
                onChange={(e) => updateField("brandName", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Industrial / Metal Fabrication"
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Website</label>
              <input
                type="url"
                placeholder="https://clientwebsite.com"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Klang"
                value={formData.locationCity}
                onChange={(e) => updateField("locationCity", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Selangor"
                value={formData.locationState}
                onChange={(e) => updateField("locationState", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">WhatsApp Number</label>
              <input
                type="text"
                placeholder="+60 12-345 6789"
                value={formData.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Official Email</label>
              <input
                type="email"
                placeholder="contact@client.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Business Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of what the company produces or provides..."
              value={formData.businessDescription}
              onChange={(e) => updateField("businessDescription", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Service Areas (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Klang Valley, Penang, Johor, Singapore"
              value={formData.serviceAreas}
              onChange={(e) => updateField("serviceAreas", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Products / Services */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Products & Services</h2>
              <p className="text-xs text-slate-500">
                Register key services or products the client wants to promote.
              </p>
            </div>
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Service #{index + 1}</span>
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Laser Cutting"
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metal Fabrication"
                      value={service.category}
                      onChange={(e) => updateService(index, "category", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Selling Points (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High precision ±0.05mm, Fast 48h turnaround, Low scrap rate"
                    value={service.sellingPoints}
                    onChange={(e) => updateService(index, "sellingPoints", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">
                    Target Customers (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Factories, Automation companies, Engineering firms"
                    value={service.targetCustomers}
                    onChange={(e) => updateService(index, "targetCustomers", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Target Market */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 3: Target Market</h2>
            <p className="text-xs text-slate-500">
              Define the audience demographics and buyer persona.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Geographic Target</label>
              <input
                type="text"
                placeholder="e.g. Malaysia nationwide & Singapore export"
                value={formData.geographicTarget}
                onChange={(e) => updateField("geographicTarget", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Industry Target</label>
              <input
                type="text"
                placeholder="e.g. Automation, Machinery, Semiconductor"
                value={formData.industryTarget}
                onChange={(e) => updateField("industryTarget", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Type</label>
              <select
                value={formData.customerType}
                onChange={(e) => updateField("customerType", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              >
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="B2B2C">B2B2C (Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Languages</label>
              <input
                type="text"
                placeholder="e.g. English, Bahasa Melayu, Mandarin"
                value={formData.languages}
                onChange={(e) => updateField("languages", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Key Decision Makers (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Purchasing Manager, Engineering Manager, Maintenance Manager, Business Owner"
              value={formData.decisionMakers}
              onChange={(e) => updateField("decisionMakers", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Buyer Persona Summary</label>
            <textarea
              rows={3}
              placeholder="Describe the typical buyer pains, responsibilities, and motivations..."
              value={formData.buyerPersona}
              onChange={(e) => updateField("buyerPersona", e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* STEP 4: Brand Information */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 4: Brand Profile</h2>
            <p className="text-xs text-slate-500">
              Establish tone of voice, visual identity, and call-to-actions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Brand Positioning</label>
              <input
                type="text"
                placeholder="e.g. Premier precision fabrication partner in ASEAN"
                value={formData.brandPositioning}
                onChange={(e) => updateField("brandPositioning", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Brand Tone</label>
              <input
                type="text"
                placeholder="e.g. Authoritative, Precise, Professional"
                value={formData.brandTone}
                onChange={(e) => updateField("brandTone", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Preferred CTA</label>
              <input
                type="text"
                placeholder="e.g. Request an Engineering Quote"
                value={formData.preferredCta}
                onChange={(e) => updateField("preferredCta", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Company Slogan</label>
              <input
                type="text"
                placeholder="e.g. Engineered to Endure. Precision First."
                value={formData.companySlogan}
                onChange={(e) => updateField("companySlogan", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Brand Colours (Hex codes)
              </label>
              <input
                type="text"
                placeholder="#0F172A, #2563EB"
                value={formData.brandColours}
                onChange={(e) => updateField("brandColours", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Avoided Words</label>
              <input
                type="text"
                placeholder="cheap, discount, budget"
                value={formData.avoidedWords}
                onChange={(e) => updateField("avoidedWords", e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Marketing Objectives */}
      {currentStep === 5 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 5: Marketing Objectives</h2>
              <p className="text-xs text-slate-500">
                Specify what goals the agency is tasked with achieving.
              </p>
            </div>
            <button
              type="button"
              onClick={addObjective}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Objective</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.marketingObjectives.map((obj, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                  {index + 1}
                </span>
                <input
                  type="text"
                  placeholder="e.g. Generate WhatsApp engineering inquiries"
                  value={obj}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
                {formData.marketingObjectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="p-2 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 6: Preferred Social Platforms */}
      {currentStep === 6 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 6: Preferred Social Platforms</h2>
            <p className="text-xs text-slate-500">
              Select channels to provision in this client's isolated workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { id: "Facebook", name: "Facebook", desc: "Pages, Community Groups & Carousel Ads" },
              { id: "Instagram", name: "Instagram", desc: "Reels, Carousel Visuals & Stories" },
              { id: "TikTok", name: "TikTok", desc: "Short-form Factory & Technical Video" },
            ].map((p) => {
              const selected = formData.preferredPlatforms.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50/50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: Review & Confirm */}
      {currentStep === 7 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Step 7: Review & Finalize</h2>
            <p className="text-xs text-slate-500">
              Confirm client workspace details before initializing the database records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Company Identity
              </span>
              <p className="text-base font-bold text-slate-900">{formData.companyName}</p>
              <p className="text-slate-600">{formData.industry}</p>
              <p className="text-slate-500">
                {formData.locationCity}, {formData.locationState}, {formData.locationCountry}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Brand & Target
              </span>
              <p className="font-semibold text-slate-800">
                Tone: <span className="font-normal text-slate-600">{formData.brandTone}</span>
              </p>
              <p className="font-semibold text-slate-800">
                Type: <span className="font-normal text-slate-600">{formData.customerType}</span>
              </p>
              <p className="font-semibold text-slate-800">
                Platforms:{" "}
                <span className="font-normal text-slate-600">
                  {formData.preferredPlatforms.join(", ")}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Services to be Provisioned ({formData.services.filter((s) => s.name).length})
            </span>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-slate-700">
              {formData.services
                .filter((s) => s.name)
                .map((s, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{s.name}</span> ({s.category || "General"})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          disabled={currentStep === 1 || isSubmitting}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous Step</span>
        </button>

        {currentStep < 7 ? (
          <button
            type="button"
            disabled={!canProceed()}
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next Step</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Creating Client Workspace...</span>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Create Client Workspace</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
