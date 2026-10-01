import { IAIProvider } from "./AIProvider";
import { ClientMarketingContext, GenerateVariantRequest, GeneratedVariantOutput, QualityCheckResult } from "./types";
import { buildPrompt } from "./promptBuilder";
import { detectUnsupportedClaims, evaluateContentQuality } from "./factualityGuard";

export class GeminiProvider implements IAIProvider {
  readonly providerName = "GEMINI";

  private getApiKey(): string | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "YOUR_GEMINI_API_KEY" || key.trim() === "") {
      return null;
    }
    return key;
  }

  private getModel(): string {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  public async generateVariant(
    req: GenerateVariantRequest,
    context: ClientMarketingContext
  ): Promise<GeneratedVariantOutput> {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const { systemPrompt, userPrompt } = buildPrompt(req, context);

    let rawJsonResult: any = null;

    if (apiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.6,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            try {
              rawJsonResult = JSON.parse(candidateText.trim());
            } catch {
              // Extract json if wrapped in any text
              const jsonMatch = candidateText.match(/\{[\s\S]*\}/);
              if (jsonMatch) rawJsonResult = JSON.parse(jsonMatch[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local context synthesizer:", err);
      }
    }

    // Fallback context-aware synthesis if no API key or remote failure
    if (!rawJsonResult) {
      rawJsonResult = this.synthesizeLocalVariant(req, context);
    }

    const caption = rawJsonResult.caption || req.coreMessage || "";
    const unsupportedClaims = detectUnsupportedClaims(caption, context);

    return {
      platform: req.platform,
      headline: rawJsonResult.headline,
      hook: rawJsonResult.hook,
      caption,
      cta: rawJsonResult.cta || req.callToAction || context.brandProfile.preferredCta,
      hashtags: rawJsonResult.hashtags || this.generateDefaultHashtags(req, context),
      onScreenText: rawJsonResult.onScreenText,
      videoIdea: rawJsonResult.videoIdea,
      potentialUnsupportedClaims: unsupportedClaims,
      sourcesUsed: context.sourceContextIds,
      isAiGenerated: true,
      language: req.language || context.brandProfile.preferredLanguage || "English",
    };
  }

  public async qualityCheck(
    caption: string,
    platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK",
    context: ClientMarketingContext
  ): Promise<QualityCheckResult> {
    return evaluateContentQuality(caption, platform, context);
  }

  /**
   * High-fidelity, deterministic synthesis engine when offline or API key is absent.
   * Uses real client context, tone, selling points, and target language.
   */
  private synthesizeLocalVariant(req: GenerateVariantRequest, context: ClientMarketingContext): any {
    const lang = req.language || context.brandProfile.preferredLanguage || "English";
    const primaryService = context.services.find((s) => s.name === req.productsServices) || context.services[0];
    const serviceName = primaryService?.name || req.title || "Engineering Solutions";
    const cta = req.callToAction || context.brandProfile.preferredCta || "Contact our team today.";
    const sellingPoint = primaryService?.sellingPoints?.[0] || "engineered to meet industry specifications";
    const location = req.targetLocation || `${context.locationCity}, ${context.locationState}`;

    if (lang === "Chinese") {
      if (req.platform === "FACEBOOK") {
        return {
          headline: `【${context.clientName}】专业${serviceName}解决方案`,
          caption: `寻找高品质、值得信赖的${serviceName}服务？\n\n位于${location}的${context.brandName}致力于为各行业客户提供可靠的工业方案。我们的特点：${sellingPoint}，严格把控每道环节。\n\n无论您有任何工程图纸或定制需求，欢迎随时咨询！\n\n👉 ${cta}`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #${context.locationCity}工程`,
        };
      } else if (req.platform === "INSTAGRAM") {
        return {
          hook: `制造品质的每一步：精密${serviceName} ✨`,
          caption: `从图纸到成品，细节决定工业实力。\n\n在${context.brandName}，我们专注${serviceName}，确保${sellingPoint}。\n\n📩 ${cta}`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #工业制造 #精密加工`,
        };
      } else {
        return {
          hook: `想知道这块金属是如何完成高难度加工的吗？`,
          onScreenText: `从图纸 → 精密${serviceName}`,
          videoIdea: `镜头展示原材料入库、数控启动、高精度切削过程及最终质检卡尺测量。`,
          caption: `${context.brandName}为您提供${serviceName}。服务${location}及全马工业客户！`,
          cta,
          hashtags: `#${serviceName.replace(/\s+/g, "")} #机械加工 #制造工厂 #TikTok工业`,
        };
      }
    } else if (lang === "Bahasa Malaysia") {
      if (req.platform === "FACEBOOK") {
        return {
          headline: `Perkhidmatan ${serviceName} Berkualiti Tinggi di ${location}`,
          caption: `Mencari penyelesaian ${serviceName} yang boleh dipercayai untuk perniagaan anda?\n\n${context.brandName} menyediakan perkhidmatan ${serviceName} di ${location}. Kelebihan kami: ${sellingPoint}.\n\nHubungi pasukan kami untuk perbincangan lanjut.\n\n📲 ${cta}`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #IndustriMalaysia`,
        };
      } else if (req.platform === "INSTAGRAM") {
        return {
          hook: `Kualiti & ketepatan dalam setiap perincian ${serviceName}! ⚙️`,
          caption: `Hasil kerja teliti untuk keperluan industri anda.\n\n${context.brandName} komited memastikan ${sellingPoint}.\n\nDM kami atau ${cta.toLowerCase()}.`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #Kejuruteraan`,
        };
      } else {
        return {
          hook: `Proses sebenar bagaimana komponen ini disiapkan dari awal!`,
          onScreenText: `Proses ${serviceName} dari pelan ke siap`,
          videoIdea: `Video timelapse bermula dari lukisan teknikal ke operasi mesin sehingga komponen selesai.`,
          caption: `Servis ${serviceName} di ${location} oleh ${context.brandName}.`,
          cta,
          hashtags: `#${serviceName.replace(/\s+/g, "")} #Fabrikasi #BengkelIndustri`,
        };
      }
    } else if (lang.includes("Chinese") || lang.includes("BM")) {
      // Bilingual mode
      const isBm = lang.includes("BM");
      const secondaryPart = isBm
        ? `\n\n---\nPerkhidmatan ${serviceName} profesional di ${location}. Pasukan ${context.brandName} sedia membantu keperluan projek anda.\n📲 ${cta}`
        : `\n\n---\n专业${serviceName}服务，位于${location}。${context.brandName}团队竭诚为您服务。\n👉 ${cta}`;

      return {
        headline: `Professional ${serviceName} Services by ${context.clientName}`,
        caption: `Are you looking for reliable ${serviceName} for your industrial needs?\n\nBased in ${location}, ${context.brandName} offers dedicated support: ${sellingPoint}.\n\n👉 ${cta}${secondaryPart}`,
        cta,
        hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #EngineeringSolutions`,
        hook: `Precision in every component: ${serviceName} in action ⚙️`,
        onScreenText: `Step by step: ${serviceName}`,
        videoIdea: `Dual-language on-screen text showcasing the production cycle from raw material to finished product.`,
      };
    } else {
      // Default: English
      if (req.platform === "FACEBOOK") {
        return {
          headline: `Expert ${serviceName} Solutions for Industrial Teams in ${location}`,
          caption: `Looking for reliable, precision-engineered ${serviceName}?\n\nAt ${context.brandName}, we partner with engineering and purchasing teams to deliver components that meet strict operational standards. Key highlight: ${sellingPoint}.\n\nGet in touch with our engineering team to discuss your project requirements.\n\n👉 ${cta}`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #Manufacturing #IndustrialSolutions`,
        };
      } else if (req.platform === "INSTAGRAM") {
        return {
          hook: `From technical drawing to finished component: ${serviceName} done right. ⚙️`,
          caption: `Precision machining and fabrication built for reliability.\n\n${context.brandName} delivers ${sellingPoint.toLowerCase()} for clients across ${location}.\n\nDrop a comment or DM us to discuss specifications.\n\n👉 ${cta}`,
          cta,
          hashtags: `#${context.brandName.replace(/\s+/g, "")} #${serviceName.replace(/\s+/g, "")} #Engineering #Fabrication #QualityCraftsmanship`,
        };
      } else if (req.platform === "TWITTER") {
        return {
          hook: `While traditional models backtest the past, our AI is stress-testing liquidity regimes of 2027.`,
          caption: `Transparency isn't a promise; it's a physical law.\n\n${context.brandName} deploys multi-agent quantitative intelligence across global macro assets with real-time on-chain cryptographic proof.\n\n🔗 Verified On-Chain Hash | ${cta}`,
          cta,
          hashtags: `#Quant #Alpha #AI #FinTech #${context.brandName.replace(/\s+/g, "")}`,
        };
      } else {
        return {
          hook: `Can raw steel handle high-tolerance fabrication? Watch this:`,
          onScreenText: `Watch raw stock become a precision ${serviceName} part`,
          videoIdea: `Close-up macro shot of tooling in action, fluid cutting, followed by vernier caliper dimension verification.`,
          caption: `Custom ${serviceName} by ${context.brandName} in ${location}.`,
          cta,
          hashtags: `#Machining #Engineering #MetalFabrication #${serviceName.replace(/\s+/g, "")}`,
        };
      }
    }
  }

  public async generateSocialVariants(params: {
    context: ClientMarketingContext;
    brief: string;
    platforms: string[];
    targetAudience?: string;
    targetLocation?: string;
    callToAction?: string;
    productsServices?: string;
    contentType?: string;
    language?: string;
    platformOverrides?: Record<string, any>;
  }): Promise<Record<string, GeneratedVariantOutput>> {
    const results: Record<string, GeneratedVariantOutput> = {};

    for (const p of params.platforms) {
      const platformKey = p.toUpperCase() as "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "TWITTER";
      const override = params.platformOverrides?.[platformKey] || {};

      const req: GenerateVariantRequest = {
        platform: platformKey,
        brief: params.brief,
        targetAudience: override.targetAudience || params.targetAudience,
        targetLocation: override.targetLocation || params.targetLocation,
        callToAction: override.callToAction || params.callToAction,
        productsServices: params.productsServices,
        contentType: override.contentType || params.contentType,
        language: override.language || params.language || "English",
        customInstructions: override.customInstructions,
      };

      results[platformKey] = await this.generateVariant(req, params.context);
    }

    return results;
  }

  private generateDefaultHashtags(req: GenerateVariantRequest, context: ClientMarketingContext): string {
    const brandTag = `#${context.brandName.replace(/\s+/g, "")}`;
    const industryTag = `#${context.industry.split("/")[0].trim().replace(/\s+/g, "")}`;
    const cityTag = `#${context.locationCity.replace(/\s+/g, "")}`;
    return `${brandTag} ${industryTag} ${cityTag}`;
  }
}

export const aiProvider = new GeminiProvider();
export const geminiProvider = aiProvider;

