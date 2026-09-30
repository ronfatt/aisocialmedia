import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { buildClientMarketingContext } from "@/lib/ai/contextBuilder";
import { geminiProvider } from "@/lib/ai/GeminiProvider";
import { evaluateContentQuality } from "@/lib/ai/factualityGuard";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { user } = await requirePermission(clientId, "content:create");

    const body = await req.json();
    const {
      contentItemId,
      campaignId,
      brief,
      coreMessage,
      objective,
      targetAudience,
      targetLocation,
      callToAction,
      productsServices,
      contentType = "IMAGE",
      language = "English",
      platformOverrides,
      selectedPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
      preserveManualEdits = true,
      forceOverwrite = false,
    } = body;

    const effectiveBrief = brief || coreMessage;
    if (!effectiveBrief || effectiveBrief.trim() === "") {
      return NextResponse.json({ error: "Content brief or core message is required for AI generation" }, { status: 400 });
    }

    // 1. Build Isolated Client Marketing Context (omits ClientNote)
    const context = await buildClientMarketingContext(clientId, campaignId);

    // 2. Generate Social Media Platform Variants
    const generatedVariants = await geminiProvider.generateSocialVariants({
      context,
      brief: effectiveBrief,
      platforms: selectedPlatforms,
      targetAudience,
      targetLocation,
      callToAction,
      productsServices,
      contentType,
      language,
      platformOverrides,
    });

    // 3. Evaluate Quality & Factuality
    const qualityResults: Record<string, any> = {};
    for (const [platform, variant] of Object.entries(generatedVariants)) {
      qualityResults[platform] = evaluateContentQuality(variant, context);
    }

    // 4. If contentItemId is passed, persist variants and log AI execution
    const persistedVariants = [];
    if (contentItemId) {
      const existingItem = await db.contentItem.findUnique({
        where: { id: contentItemId },
        include: { variants: true },
      });

      if (existingItem && existingItem.clientId === clientId) {
        for (const [platform, v] of Object.entries(generatedVariants)) {
          const existingVariant = existingItem.variants.find((item) => item.platform === platform);

          // If manual edits exist and forceOverwrite is not true, we preserve manual edits or respect flag
          if (existingVariant && existingVariant.isEditedManually && preserveManualEdits && !forceOverwrite) {
            // Keep existing variant, attach quality analysis of new draft in response
            persistedVariants.push({
              ...existingVariant,
              generationStatus: "PRESERVED_MANUAL_EDIT",
              suggestedReplacement: v,
            });
            continue;
          }

          if (existingVariant) {
            const updated = await db.postVariant.update({
              where: { id: existingVariant.id },
              data: {
                headline: v.headline || null,
                hook: v.hook || null,
                caption: v.caption,
                cta: v.cta || null,
                hashtags: v.hashtags || null,
                onScreenText: v.onScreenText || null,
                videoIdea: v.videoIdea || null,
                platformNotes: v.platformNotes || null,
                language: v.language || language,
                generationStatus: "GENERATED",
                isEditedManually: false,
                versionNumber: { increment: 1 },
              },
            });
            persistedVariants.push(updated);
          } else {
            const created = await db.postVariant.create({
              data: {
                organizationId: user.organizationId,
                clientId,
                contentItemId,
                platform,
                headline: v.headline || null,
                hook: v.hook || null,
                caption: v.caption,
                cta: v.cta || null,
                hashtags: v.hashtags || null,
                onScreenText: v.onScreenText || null,
                videoIdea: v.videoIdea || null,
                platformNotes: v.platformNotes || null,
                language: v.language || language,
                generationStatus: "GENERATED",
                approvalStatus: "PENDING",
                isEditedManually: false,
              },
            });
            persistedVariants.push(created);
          }
        }

        // Record AI generation log
        await db.aiGenerationLog.create({
          data: {
            organizationId: user.organizationId,
            clientId,
            contentItemId,
            provider: "GEMINI",
            model: "gemini-2.5-flash",
            action: "GENERATE_ALL",
            promptVersion: "content-v1",
            sourceContextIds: JSON.stringify({
              servicesCount: context.services.length,
              pillarsCount: context.activePillars.length,
              brandTone: context.brandProfile?.brandTone,
            }),
            createdBy: user.name,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      variants: generatedVariants,
      qualityResults,
      persistedVariants: persistedVariants.length > 0 ? persistedVariants : undefined,
      contextSummary: {
        companyName: context.clientName,
        industry: context.industry,
        brandTone: context.brandProfile?.brandTone,
        servicesCount: context.services.length,
        pillarsCount: context.activePillars.length,
      },
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to generate AI variants" }, { status });
  }
}
