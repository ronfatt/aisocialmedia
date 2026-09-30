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
    throw new Error(`[${this.displayName}] connect: NotImplemented. Integration will be enabled in the Social API phase.`);
  }

  async disconnect(clientId: string): Promise<boolean> {
    throw new Error(`[${this.displayName}] disconnect: NotImplemented`);
  }

  async refreshToken(clientId: string): Promise<boolean> {
    throw new Error(`[${this.displayName}] refreshToken: NotImplemented`);
  }

  async publishPost(clientId: string, payload: PostPublishPayload): Promise<ProviderPostResult> {
    throw new Error(`[${this.displayName}] publishPost: NotImplemented`);
  }

  async getPosts(clientId: string, limit: number = 10): Promise<any[]> {
    throw new Error(`[${this.displayName}] getPosts: NotImplemented`);
  }

  async getComments(clientId: string, postId: string): Promise<any[]> {
    throw new Error(`[${this.displayName}] getComments: NotImplemented`);
  }

  async getAnalytics(clientId: string, periodDays: number = 30): Promise<any> {
    throw new Error(`[${this.displayName}] getAnalytics: NotImplemented`);
  }
}
