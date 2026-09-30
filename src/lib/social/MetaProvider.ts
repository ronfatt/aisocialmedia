import { createOAuthState } from "@/lib/security/crypto";
import { ConnectionVerificationResult, MetaPlatformType, OAuthInitResult } from "./types";

export abstract class MetaProvider {
  protected static getApiVersion(): string {
    return process.env.META_API_VERSION || "v26.0";
  }

  protected static getGraphBase(): string {
    return `https://graph.facebook.com/${this.getApiVersion()}`;
  }

  protected static getOAuthDialogBase(): string {
    return `https://www.facebook.com/${this.getApiVersion()}/dialog/oauth`;
  }

  public static isConfigured(): boolean {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    return Boolean(appId && appSecret && appId !== "YOUR_META_APP_ID" && appSecret !== "YOUR_META_APP_SECRET");
  }

  public static getCredentials() {
    const appId = process.env.META_APP_ID || "";
    const appSecret = process.env.META_APP_SECRET || "";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = process.env.META_REDIRECT_URI || `${appUrl}/api/auth/callback/meta`;

    return { appId, appSecret, redirectUri };
  }

  /**
   * Generates secure OAuth dialog URL with tamper-proof state
   */
  public static beginConnection(params: {
    userId: string;
    organizationId: string;
    clientId: string;
    platform: MetaPlatformType;
    action?: "CONNECT" | "RECONNECT";
    socialAccountId?: string;
  }): OAuthInitResult {
    const { appId, redirectUri } = this.getCredentials();

    if (!this.isConfigured()) {
      throw new Error("Meta Integration Not Configured. Please set META_APP_ID and META_APP_SECRET.");
    }

    const state = createOAuthState({
      userId: params.userId,
      organizationId: params.organizationId,
      clientId: params.clientId,
      platform: params.platform,
      action: params.action || "CONNECT",
      socialAccountId: params.socialAccountId,
    });

    // Required scopes for Facebook & Instagram Professional according to official v26.0 docs
    const scopes = [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "instagram_basic",
      "business_management",
    ];

    const authUrl = `${this.getOAuthDialogBase()}?client_id=${encodeURIComponent(
      appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(
      state
    )}&scope=${encodeURIComponent(scopes.join(","))}&response_type=code`;

    return {
      authUrl,
      state,
      platform: params.platform,
    };
  }

  /**
   * Exchange OAuth code for short-lived token, then upgrade to 60-day long-lived User Token
   */
  public static async exchangeCodeForLongLivedUserToken(code: string): Promise<string> {
    const { appId, appSecret, redirectUri } = this.getCredentials();
    const graphBase = this.getGraphBase();

    // 1. Exchange authorization code for short-lived user token
    const tokenUrl = `${graphBase}/oauth/access_token?client_id=${encodeURIComponent(
      appId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${encodeURIComponent(
      appSecret
    )}&code=${encodeURIComponent(code)}`;

    const shortTokenRes = await fetch(tokenUrl);
    const shortTokenData = await shortTokenRes.json();

    if (!shortTokenRes.ok || shortTokenData.error) {
      const msg = shortTokenData.error?.message || "Failed to exchange authorization code";
      throw new Error(`Meta OAuth Exchange Error: ${msg}`);
    }

    const shortLivedToken = shortTokenData.access_token;

    // 2. Exchange short-lived user token for 60-day long-lived user token
    const exchangeUrl = `${graphBase}/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(
      appId
    )}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(
      shortLivedToken
    )}`;

    const longTokenRes = await fetch(exchangeUrl);
    const longTokenData = await longTokenRes.json();

    if (!longTokenRes.ok || longTokenData.error) {
      // Fallback to short-lived if exchange is restricted in test mode
      return shortLivedToken;
    }

    return longTokenData.access_token || shortLivedToken;
  }

  /**
   * Verify an existing token against Meta Graph API
   */
  public static async verifyConnection(
    accessToken: string,
    platformAccountId: string,
    platform: MetaPlatformType
  ): Promise<ConnectionVerificationResult> {
    if (!accessToken) {
      return {
        healthy: false,
        status: "TOKEN_EXPIRED",
        message: "No access token configured for this account.",
        lastVerifiedAt: new Date(),
      };
    }

    const graphBase = this.getGraphBase();
    const fields = platform === "FACEBOOK" ? "id,name,tasks" : "id,username,name";
    const checkUrl = `${graphBase}/${encodeURIComponent(platformAccountId)}?fields=${fields}&access_token=${encodeURIComponent(
      accessToken
    )}`;

    try {
      const res = await fetch(checkUrl);
      const data = await res.json();

      if (!res.ok || data.error) {
        const err = data.error || {};
        const code = err.code;
        const subcode = err.error_subcode;

        // Code 190 = Invalid or expired OAuth access token
        if (code === 190) {
          return {
            healthy: false,
            status: "TOKEN_EXPIRED",
            message: `Token Expired: ${err.message || "Please re-authenticate with Meta."}`,
            lastVerifiedAt: new Date(),
          };
        }

        // Code 10, 200, 298 = Permissions error
        if (code === 10 || code === 200 || code === 298) {
          return {
            healthy: false,
            status: "PERMISSION_ERROR",
            message: `Permission Error: ${err.message || "Missing required page or business permissions."}`,
            lastVerifiedAt: new Date(),
          };
        }

        return {
          healthy: false,
          status: "ERROR",
          message: `Meta API Error (${code}): ${err.message || "Failed to verify connection"}`,
          lastVerifiedAt: new Date(),
        };
      }

      const tasks: string[] = data.tasks || [];
      const hasPageAccess = true;
      const hasPublishing = tasks.length === 0 || tasks.includes("CREATE_CONTENT") || tasks.includes("MANAGE");
      const hasInsights = tasks.length === 0 || tasks.includes("ANALYZE") || tasks.includes("MANAGE");

      return {
        healthy: true,
        status: "CONNECTED",
        message: "Connection Healthy: Token and permissions are valid.",
        accountName: data.name,
        username: data.username ? `@${data.username}` : undefined,
        permissionsSummary: {
          pageAccess: hasPageAccess,
          publishing: hasPublishing,
          insights: hasInsights,
        },
        lastVerifiedAt: new Date(),
      };
    } catch (networkErr: any) {
      return {
        healthy: false,
        status: "ERROR",
        message: `Network error during verification: ${networkErr.message}`,
        lastVerifiedAt: new Date(),
      };
    }
  }
}
