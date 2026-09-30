import { PlatformType } from "@/types";
import {
  ISocialProvider,
  ProviderAuthResult,
  PostPublishPayload,
  ProviderPostResult,
} from "./types";

export abstract class BaseProvider implements ISocialProvider {
  abstract readonly platform: PlatformType;
  abstract readonly displayName: string;
  abstract readonly iconName: string;
  abstract readonly requiredScopes: string[];

  async connect(clientId: string, redirectUri?: string): Promise<ProviderAuthResult> {
    // In Phase 1: Real OAuth is pending integration
    return {
      success: false,
      message: `OAuth integration for ${this.displayName} is pending. Real API credentials will be configured in Phase 2.`,
      connectionStatus: "PENDING_INTEGRATION",
    };
  }

  async disconnect(clientId: string): Promise<boolean> {
    return true;
  }

  async refreshToken(clientId: string): Promise<boolean> {
    throw new Error(`[${this.displayName}] refreshToken: Integration Pending`);
  }

  async publishPost(clientId: string, payload: PostPublishPayload): Promise<ProviderPostResult> {
    return {
      success: false,
      errorMessage: `[${this.displayName}] publishPost: Integration Pending. Scheduled for Phase 2.`,
    };
  }

  async getPosts(clientId: string, limit: number = 10): Promise<any[]> {
    return [];
  }

  async getComments(clientId: string, postId: string): Promise<any[]> {
    return [];
  }

  async getAnalytics(clientId: string, periodDays: number = 30): Promise<any> {
    return {
      periodDays,
      status: "Integration Pending",
      metrics: null,
    };
  }
}
