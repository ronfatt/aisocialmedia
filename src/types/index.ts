export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "ACCOUNT_MANAGER"
  | "CONTENT_CREATOR"
  | "APPROVER"
  | "SALES"
  | "VIEWER";

export type ClientStatus = "ACTIVE" | "ONBOARDING" | "PAUSED" | "ARCHIVED";

export type PlatformType = "FACEBOOK" | "INSTAGRAM" | "TIKTOK";

export type ConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "PENDING_INTEGRATION"
  | "EXPIRED";

export type ContentStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "ARCHIVED";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  organizationId: string;
  assignedClientIds?: string[];
}

export interface ClientListItem {
  id: string;
  name: string;
  brandName?: string | null;
  slug: string;
  logoUrl?: string | null;
  industry: string;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  status: ClientStatus;
  accountManagerName?: string | null;
  accountManagerId?: string | null;
  facebookStatus: ConnectionStatus;
  instagramStatus: ConnectionStatus;
  tiktokStatus: ConnectionStatus;
  scheduledPostsCount: number;
  pendingApprovalsCount: number;
  lastActivityDate?: string | null;
  createdAt: string;
}

export interface ClientProfileData {
  businessDescription: string;
  website: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  serviceAreas: string[];
}

export interface ClientServiceItem {
  id?: string;
  name: string;
  category: string;
  description: string;
  sellingPoints: string[];
  targetCustomers: string[];
  priceInfo?: string;
  isActive: boolean;
}

export interface ClientTargetMarketData {
  geographicTarget: string;
  industryTarget: string;
  customerType: string;
  languages: string[];
  ageRange?: string;
  buyerPersona?: string;
  decisionMakers: string[];
}

export interface ClientBrandProfileData {
  brandPositioning?: string;
  brandTone?: string;
  preferredLanguage: string;
  secondaryLanguage?: string;
  visualStyle?: string;
  brandColours: string[];
  avoidedWords: string[];
  preferredCta?: string;
  companySlogan?: string;
}

export interface ClientMarketingObjectiveItem {
  id?: string;
  title: string;
  description?: string;
  priority: number;
  isCompleted: boolean;
}

export interface ClientCompetitorItem {
  id?: string;
  name: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  notes?: string;
}

export interface ClientNoteItem {
  id?: string;
  title: string;
  content: string;
  authorName?: string;
  isPinned: boolean;
  createdAt?: string;
}

export interface ContentPillarItem {
  id?: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface ClientStrategyData {
  brandPositioning?: string;
  marketingObjectives?: string;
  targetAudience?: string;
  targetLocations?: string;
  targetIndustries?: string;
  mainProductsServices?: string;
  keySellingPoints?: string;
  preferredPlatforms: string[];
  postingFrequency?: string;
  languageStrategy?: string;
  ctaStrategy?: string;
  campaignPriorities?: string;
  specialInstructions?: string;
  pillars: ContentPillarItem[];
}
