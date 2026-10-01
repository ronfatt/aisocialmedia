import { db } from "@/lib/db";
import { ClientMarketingContext } from "./types";

/**
 * Server-side AI Context Builder (Section 6)
 * Assembles authorized, confidential marketing context strictly for a specific client.
 * Enforces data classification: INTERNAL_ONLY notes (ClientNote) are NEVER included.
 */
export async function buildClientMarketingContext(
  clientId: string,
  campaignId?: string
): Promise<ClientMarketingContext> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
      services: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
      targetMarket: true,
      brandProfile: true,
      marketingObjectives: {
        where: { isCompleted: false },
        orderBy: { priority: "asc" },
      },
      strategy: {
        include: {
          pillars: {
            where: { isActive: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      referenceAssets: {
        where: { isAiApprovedSource: true },
      },
    },
  });

  if (!client) {
    throw new Error(`Client context error: Client '${clientId}' not found.`);
  }

  // Resolve optional Campaign context
  let campaignData;
  if (campaignId) {
    campaignData = await db.campaign.findFirst({
      where: { id: campaignId, clientId },
    });
  }

  const sourceContextIds: string[] = [];

  // Parse Services (AI_SAFE_CONTEXT)
  const services = (client.services || []).map((s) => {
    sourceContextIds.push(`service:${s.id}`);
    let sellingPoints: string[] = [];
    try {
      sellingPoints = JSON.parse(s.sellingPoints || "[]");
    } catch {
      sellingPoints = s.sellingPoints ? [s.sellingPoints] : [];
    }

    return {
      id: s.id,
      name: s.name,
      category: s.category || "General Service",
      description: s.description || "",
      sellingPoints,
      targetCustomer: s.targetCustomers || "",
      priceInfo: s.priceInfo || undefined,
    };
  });

  // Target Market
  const tm = client.targetMarket;
  let decisionMakers: string[] = [];
  try {
    decisionMakers = JSON.parse(tm?.decisionMakers || "[]");
  } catch {
    decisionMakers = tm?.decisionMakers ? [tm.decisionMakers] : [];
  }

  // Brand Profile
  const bp = client.brandProfile;
  let avoidedWords: string[] = [];
  try {
    avoidedWords = JSON.parse(bp?.avoidedWords || "[]");
  } catch {
    avoidedWords = [];
  }

  // Marketing Objectives
  const marketingObjectives = (client.marketingObjectives || []).map((mo) => {
    sourceContextIds.push(`objective:${mo.id}`);
    return mo.title;
  });

  // Active Content Pillars
  const activePillars = (client.strategy?.pillars || []).map((p) => {
    sourceContextIds.push(`pillar:${p.id}`);
    return {
      id: p.id,
      title: p.title,
      description: p.description || "",
    };
  });

  // Approved Reference Assets
  const approvedReferences = (client.referenceAssets || []).map((ra) => {
    sourceContextIds.push(`ref:${ra.id}`);
    return {
      id: ra.id,
      name: ra.name,
      type: ra.type,
      purpose: ra.purpose || undefined,
    };
  });

  return {
    clientId: client.id,
    clientName: client.name,
    brandName: client.brandName || client.name,
    industry: client.industry,
    locationCity: client.locationCity,
    locationState: client.locationState,
    locationCountry: client.locationCountry,
    businessDescription: client.profile?.businessDescription || `${client.name} is a company in ${client.industry}.`,
    website: client.profile?.website || (client.name.includes("SPARK") ? "https://sparkunioncapital.com" : undefined),
    services,
    targetMarket: {
      geographicTarget: tm?.geographicTarget || `${client.locationCity}, ${client.locationState}`,
      industryTarget: tm?.industryTarget || client.industry,
      customerType: tm?.customerType || "B2B",
      isB2B: (tm?.customerType || "B2B").toUpperCase().includes("B2B"),
      language: tm?.languages || "English",
      buyerPersona: tm?.buyerPersona || "Business decision maker",
      decisionMakers,
    },
    brandProfile: {
      brandPositioning: bp?.brandPositioning || client.strategy?.brandPositioning || "",
      brandTone: bp?.brandTone || "Professional, Reliable, Modern",
      preferredLanguage: bp?.preferredLanguage || "English",
      secondaryLanguage: bp?.secondaryLanguage || "Bahasa Malaysia",
      visualStyle: bp?.visualStyle || "Clean and modern industrial design",
      avoidedWords,
      preferredCta: bp?.preferredCta || "Get in Touch Today",
      companySlogan: bp?.companySlogan || "",
    },
    marketingObjectives,
    activePillars,
    campaign: campaignData
      ? {
          id: campaignData.id,
          name: campaignData.name,
          objective: campaignData.objective || undefined,
          keyMessage: campaignData.keyMessage || undefined,
          targetAudience: campaignData.targetAudience || undefined,
          cta: campaignData.cta || undefined,
        }
      : undefined,
    approvedReferences,
    sourceContextIds,
  };
}
