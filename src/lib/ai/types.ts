export interface ClientMarketingContext {
  clientId: string;
  clientName: string;
  brandName: string;
  industry: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  businessDescription: string;
  website?: string;
  services: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    sellingPoints: string[];
    targetCustomer: string;
    priceInfo?: string;
  }>;
  targetMarket: {
    geographicTarget: string;
    industryTarget: string;
    customerType: string;
    isB2B: boolean;
    language: string;
    buyerPersona: string;
    decisionMakers: string[];
  };
  brandProfile: {
    brandPositioning: string;
    brandTone: string;
    preferredLanguage: string;
    secondaryLanguage: string;
    visualStyle: string;
    avoidedWords: string[];
    preferredCta: string;
    companySlogan: string;
  };
  marketingObjectives: string[];
  activePillars: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  campaign?: {
    id: string;
    name: string;
    objective?: string;
    keyMessage?: string;
    targetAudience?: string;
    cta?: string;
  };
  approvedReferences: Array<{
    id: string;
    name: string;
    type: string;
    purpose?: string;
  }>;
  sourceContextIds: string[];
}

export type SupportedLanguage =
  | "English"
  | "Bahasa Malaysia"
  | "Chinese"
  | "English + Chinese"
  | "English + BM";

export interface GenerateVariantRequest {
  clientId?: string;
  contentItemId?: string;
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "TWITTER";
  title?: string;
  coreMessage?: string;
  brief?: string;
  objective?: string;
  contentPillar?: string;
  contentPillarId?: string;
  campaignId?: string;
  contentType?: string;
  targetAudience?: string;
  targetLocation?: string;
  callToAction?: string;
  productsServices?: string;
  internalBrief?: string;
  language?: SupportedLanguage | string;
  attachedMediaUrls?: string[];
  customInstructions?: string;
  action?:
    | "GENERATE"
    | "REWRITE"
    | "EXPAND"
    | "SHORTEN"
    | "MORE_PROFESSIONAL"
    | "MORE_CASUAL"
    | "IMPROVE_HOOK"
    | "TRANSLATE";
  currentCaption?: string;
}

export interface GeneratedVariantOutput {
  platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "TWITTER";
  headline?: string;
  hook?: string;
  caption: string;
  cta?: string;
  hashtags?: string;
  onScreenText?: string;
  videoIdea?: string;
  platformNotes?: string;
  potentialUnsupportedClaims: string[];
  sourcesUsed: string[];
  isAiGenerated: boolean;
  language: string;
}

export interface QualityCheckResult {
  hasCta: boolean;
  brandToneMatch: boolean;
  languageMatch: boolean;
  potentialUnsupportedClaims: string[];
  suggestions: string[];
  overallScore: number;
}
