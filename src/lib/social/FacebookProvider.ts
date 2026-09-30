import { MetaProvider } from "./MetaProvider";
import { DiscoveredAccount } from "./types";

export class FacebookProvider extends MetaProvider {
  /**
   * Discover Facebook Pages that the authenticated user manages
   */
  public static async discoverPages(userAccessToken: string): Promise<DiscoveredAccount[]> {
    const graphBase = this.getGraphBase();
    const url = `${graphBase}/me/accounts?fields=id,name,category,access_token,tasks,picture{url}&access_token=${encodeURIComponent(
      userAccessToken
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || "Failed to retrieve Facebook Pages from Meta API";
      throw new Error(`Meta Discovery Error: ${msg}`);
    }

    const pages = data.data || [];
    return pages.map((page: any): DiscoveredAccount => {
      return {
        id: page.id,
        name: page.name,
        category: page.category || "Business Page",
        profilePictureUrl: page.picture?.data?.url,
        accountType: "PAGE",
        platform: "FACEBOOK",
        tasks: page.tasks || [],
        accessToken: page.access_token, // Permanent Page Access Token
      };
    });
  }
}
