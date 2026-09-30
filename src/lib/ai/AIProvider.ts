import { ClientMarketingContext, GenerateVariantRequest, GeneratedVariantOutput, QualityCheckResult } from "./types";

export interface IAIProvider {
  readonly providerName: string;
  generateVariant(req: GenerateVariantRequest, context: ClientMarketingContext): Promise<GeneratedVariantOutput>;
  qualityCheck(caption: string, platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK", context: ClientMarketingContext): Promise<QualityCheckResult>;
}
