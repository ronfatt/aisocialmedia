import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertClientAccess, requireUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const auth = await assertClientAccess(clientId);
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, brandName: true, logoUrl: true, industry: true },
    });

    const strategy = await db.clientStrategy.findUnique({
      where: { clientId },
      include: {
        pillars: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({
      client,
      strategy: strategy
        ? {
            ...strategy,
            preferredPlatforms: JSON.parse(strategy.preferredPlatforms || "[]"),
          }
        : null,
    });
  } catch (error) {
    console.error("GET /api/clients/[clientId]/strategy error:", error);
    return NextResponse.json({ error: "Failed to fetch strategy" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const auth = await assertClientAccess(clientId);
    if (!auth.allowed) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const user = await requireUser();
    const body = await req.json();

    const {
      brandPositioning,
      marketingObjectives,
      targetAudience,
      targetLocations,
      targetIndustries,
      mainProductsServices,
      keySellingPoints,
      preferredPlatforms = [],
      postingFrequency,
      languageStrategy,
      ctaStrategy,
      campaignPriorities,
      specialInstructions,
      pillars = [],
    } = body;

    await db.$transaction(async (tx) => {
      const savedStrategy = await tx.clientStrategy.upsert({
        where: { clientId },
        update: {
          brandPositioning,
          marketingObjectives,
          targetAudience,
          targetLocations,
          targetIndustries,
          mainProductsServices,
          keySellingPoints,
          preferredPlatforms: JSON.stringify(preferredPlatforms),
          postingFrequency,
          languageStrategy,
          ctaStrategy,
          campaignPriorities,
          specialInstructions,
        },
        create: {
          clientId,
          brandPositioning,
          marketingObjectives,
          targetAudience,
          targetLocations,
          targetIndustries,
          mainProductsServices,
          keySellingPoints,
          preferredPlatforms: JSON.stringify(preferredPlatforms),
          postingFrequency,
          languageStrategy,
          ctaStrategy,
          campaignPriorities,
          specialInstructions,
        },
      });

      // Update content pillars
      await tx.contentPillar.deleteMany({ where: { strategyId: savedStrategy.id } });
      if (Array.isArray(pillars)) {
        for (let i = 0; i < pillars.length; i++) {
          if (pillars[i].title) {
            await tx.contentPillar.create({
              data: {
                strategyId: savedStrategy.id,
                title: pillars[i].title,
                description: pillars[i].description || null,
                orderIndex: i + 1,
              },
            });
          }
        }
      }

      await tx.activityLog.create({
        data: {
          clientId,
          userId: user.id,
          action: "STRATEGY_UPDATED",
          description: `Marketing strategy and content pillars updated by ${user.name}.`,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Marketing strategy saved successfully." });
  } catch (error) {
    console.error("PUT /api/clients/[clientId]/strategy error:", error);
    return NextResponse.json({ error: "Failed to update strategy" }, { status: 500 });
  }
}
