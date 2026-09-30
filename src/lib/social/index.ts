import { BaseProvider } from "./BaseProvider";
import { PlatformType } from "@/types";

export class FacebookProvider extends BaseProvider {
  readonly platform: PlatformType = "FACEBOOK";
  readonly displayName: string = "Facebook Pages & Groups";
  readonly iconName: string = "facebook";
  readonly requiredScopes: string[] = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "pages_manage_metadata",
    "business_management",
  ];
}

export class InstagramProvider extends BaseProvider {
  readonly platform: PlatformType = "INSTAGRAM";
  readonly displayName: string = "Instagram Professional";
  readonly iconName: string = "instagram";
  readonly requiredScopes: string[] = [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_comments",
    "instagram_manage_insights",
  ];
}

export class TikTokProvider extends BaseProvider {
  readonly platform: PlatformType = "TIKTOK";
  readonly displayName: string = "TikTok for Business";
  readonly iconName: string = "video";
  readonly requiredScopes: string[] = [
    "user.info.basic",
    "video.list",
    "video.upload",
    "video.publish",
    "comment.list",
  ];
}

export const socialProviders = {
  FACEBOOK: new FacebookProvider(),
  INSTAGRAM: new InstagramProvider(),
  TIKTOK: new TikTokProvider(),
};
