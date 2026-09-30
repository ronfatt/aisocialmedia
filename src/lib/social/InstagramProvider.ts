import { MetaProvider } from "./MetaProvider";
import { DiscoveredAccount } from "./types";

export class InstagramProvider extends MetaProvider {
  /**
   * Discover Instagram Professional Accounts linked to the user's Facebook Pages
   */
  public static async discoverInstagramAccounts(userAccessToken: string): Promise<DiscoveredAccount[]> {
    const graphBase = this.getGraphBase();
    // In current Meta Graph API (v26.0), Instagram Professional Accounts are discovered via their linked Facebook Pages
    const url = `${graphBase}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
      userAccessToken
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || "Failed to retrieve connected Instagram accounts from Meta API";
      throw new Error(`Meta Discovery Error: ${msg}`);
    }

    const pages = data.data || [];
    const accounts: DiscoveredAccount[] = [];

    for (const page of pages) {
      const ig = page.instagram_business_account;
      if (ig && ig.id) {
        accounts.push({
          id: ig.id,
          parentAccountId: page.id,
          name: ig.name || ig.username,
          username: `@${ig.username}`,
          profilePictureUrl: ig.profile_picture_url,
          category: "Instagram Professional",
          accountType: "BUSINESS",
          platform: "INSTAGRAM",
          permissions: ["instagram_basic", "instagram_manage_insights"],
          accessToken: page.access_token, // Page access token authorizes API calls on behalf of the linked IG business account
        });
      }
    }

    return accounts;
  }
}
