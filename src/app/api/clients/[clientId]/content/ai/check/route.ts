import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { buildClientMarketingContext } from "@/lib/ai/contextBuilder";
import { evaluateContentQuality, detectUnsupportedClaims } from "@/lib/ai/factualityGuard";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    await requirePermission(clientId, "content:view");

    const body = await req.json();
    const { platform = "FACEBOOK", headline, hook, caption = "", cta, hashtags, campaignId } = body;

    const context = await buildClientMarketingContext(clientId, campaignId);

    const variantData = {
      platform,
      headline,
      hook,
      caption,
      cta,
      hashtags,
    };

    const quality = evaluateContentQuality(variantData, context);
    const unverifiedClaims = detectUnsupportedClaims(caption, context);

    return NextResponse.json({
      success: true,
      quality,
      unverifiedClaims,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("403") ? 403 : error.message?.startsWith("401") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Failed to check content quality" }, { status });
  }
}
