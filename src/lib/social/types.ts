import { PlatformType, ConnectionStatus } from "@/types";

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
