import { PlatformType, ConnectionStatus } from "@/types";

export type MetaPlatformType = "FACEBOOK" | "INSTAGRAM";

export interface DiscoveredAccount {
  id: string; // Facebook Page ID or Instagram Business Account ID
  parentAccountId?: string; // Linked Facebook Page ID for Instagram
  name: string;
  username?: string;
  profilePictureUrl?: string;
  category?: string;
  accountType: "PAGE" | "BUSINESS" | "CREATOR";
  platform: MetaPlatformType;
  tasks?: string[];
  permissions?: string[];
  accessToken: string; // Handled strictly server-side, encrypted on selection
}

export interface ConnectionVerificationResult {
  healthy: boolean;
  status: "CONNECTED" | "TOKEN_EXPIRED" | "PERMISSION_ERROR" | "REAUTH_REQUIRED" | "ERROR";
  message: string;
  accountName?: string;
  username?: string;
  permissionsSummary?: {
    pageAccess: boolean;
    publishing: boolean;
    insights: boolean;
  };
  lastVerifiedAt: Date;
}

export interface OAuthInitResult {
  authUrl: string;
  state: string;
  platform: MetaPlatformType;
}

export interface DiscoveredSessionData {
  userId: string;
  organizationId: string;
  clientId: string;
  platform: MetaPlatformType;
  accounts: DiscoveredAccount[];
  createdAt: number;
}

export interface ProviderAuthResult {
  success: boolean;
  message: string;
  connectionStatus: ConnectionStatus;
  authUrl?: string;
  accountId?: string;
  accountName?: string;
}

export interface PostPublishPayload {
  title: string;
  body: string;
  mediaUrls?: string[];
  scheduledTime?: Date;
}

export interface ProviderPostResult {
  success: boolean;
  platformPostId?: string;
  errorMessage?: string;
}

export interface ISocialProvider {
  readonly platform: PlatformType;
  readonly displayName: string;
  readonly iconName: string;
  readonly requiredScopes: string[];

  connect(clientId: string, redirectUri?: string): Promise<ProviderAuthResult>;
  disconnect(clientId: string): Promise<boolean>;
  refreshToken(clientId: string): Promise<boolean>;
  publishPost(clientId: string, payload: PostPublishPayload): Promise<ProviderPostResult>;
  getPosts(clientId: string, limit?: number): Promise<any[]>;
  getComments(clientId: string, postId: string): Promise<any[]>;
  getAnalytics(clientId: string, periodDays?: number): Promise<any>;
}
