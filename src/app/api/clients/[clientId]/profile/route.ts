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

    const [client, profile, services, targetMarket, brandProfile, marketingObjectives, competitors, notes] =
      await Promise.all([
        db.client.findUnique({ where: { id: clientId } }),
        db.clientProfile.findUnique({ where: { clientId } }),
        db.clientService.findMany({ where: { clientId }, orderBy: { createdAt: "asc" } }),
        db.clientTargetMarket.findUnique({ where: { clientId } }),
        db.clientBrandProfile.findUnique({ where: { clientId } }),
        db.clientMarketingObjective.findMany({ where: { clientId }, orderBy: { priority: "asc" } }),
        db.clientCompetitor.findMany({ where: { clientId }, orderBy: { createdAt: "asc" } }),
        db.clientNote.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
      ]);

    return NextResponse.json({
      client,
      profile,
      services: services.map((s) => ({
        ...s,
        sellingPoints: JSON.parse(s.sellingPoints || "[]"),
        targetCustomers: JSON.parse(s.targetCustomers || "[]"),
      })),
      targetMarket: targetMarket
        ? {
            ...targetMarket,
            languages: JSON.parse(targetMarket.languages || "[]"),
            decisionMakers: JSON.parse(targetMarket.decisionMakers || "[]"),
          }
        : null,
      brandProfile: brandProfile
        ? {
            ...brandProfile,
            brandColours: JSON.parse(brandProfile.brandColours || "[]"),
            avoidedWords: JSON.parse(brandProfile.avoidedWords || "[]"),
          }
        : null,
      marketingObjectives,
      competitors,
      notes,
    });
  } catch (error) {
    console.error("GET /api/clients/[clientId]/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch client profile" }, { status: 500 });
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
      profile,
      services,
      targetMarket,
      brandProfile,
      marketingObjectives,
      competitors,
      notes,
    } = body;

    await db.$transaction(async (tx) => {
      // 1. Update Profile (Section A)
      if (profile) {
        await tx.clientProfile.upsert({
          where: { clientId },
          update: {
            businessDescription: profile.businessDescription,
            website: profile.website,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            email: profile.email,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            serviceAreas: JSON.stringify(profile.serviceAreas || []),
          },
          create: {
            clientId,
            businessDescription: profile.businessDescription,
            website: profile.website,
            phone: profile.phone,
            whatsapp: profile.whatsapp,
            email: profile.email,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            serviceAreas: JSON.stringify(profile.serviceAreas || []),
          },
        });
      }

      // 2. Update Services (Section B)
      if (Array.isArray(services)) {
        await tx.clientService.deleteMany({ where: { clientId } });
        for (const s of services) {
          if (s.name) {
            await tx.clientService.create({
              data: {
                clientId,
                name: s.name,
                category: s.category || "General",
                description: s.description || "",
                sellingPoints: JSON.stringify(s.sellingPoints || []),
                targetCustomers: JSON.stringify(s.targetCustomers || []),
                priceInfo: s.priceInfo || null,
                isActive: s.isActive ?? true,
              },
            });
          }
        }
      }

      // 3. Update Target Market (Section C)
      if (targetMarket) {
        await tx.clientTargetMarket.upsert({
          where: { clientId },
          update: {
            geographicTarget: targetMarket.geographicTarget || "",
            industryTarget: targetMarket.industryTarget || "",
            customerType: targetMarket.customerType || "B2B",
            languages: JSON.stringify(targetMarket.languages || []),
            ageRange: targetMarket.ageRange || "",
            buyerPersona: targetMarket.buyerPersona || "",
            decisionMakers: JSON.stringify(targetMarket.decisionMakers || []),
          },
          create: {
            clientId,
            geographicTarget: targetMarket.geographicTarget || "",
            industryTarget: targetMarket.industryTarget || "",
            customerType: targetMarket.customerType || "B2B",
            languages: JSON.stringify(targetMarket.languages || []),
            ageRange: targetMarket.ageRange || "",
            buyerPersona: targetMarket.buyerPersona || "",
            decisionMakers: JSON.stringify(targetMarket.decisionMakers || []),
          },
        });
      }

      // 4. Update Brand Profile (Section D)
      if (brandProfile) {
        await tx.clientBrandProfile.upsert({
          where: { clientId },
          update: {
            brandPositioning: brandProfile.brandPositioning,
            brandTone: brandProfile.brandTone,
            preferredLanguage: brandProfile.preferredLanguage || "English",
            secondaryLanguage: brandProfile.secondaryLanguage,
            visualStyle: brandProfile.visualStyle,
            brandColours: JSON.stringify(brandProfile.brandColours || []),
            avoidedWords: JSON.stringify(brandProfile.avoidedWords || []),
            preferredCta: brandProfile.preferredCta,
            companySlogan: brandProfile.companySlogan,
          },
          create: {
            clientId,
            brandPositioning: brandProfile.brandPositioning,
            brandTone: brandProfile.brandTone,
            preferredLanguage: brandProfile.preferredLanguage || "English",
            secondaryLanguage: brandProfile.secondaryLanguage,
            visualStyle: brandProfile.visualStyle,
            brandColours: JSON.stringify(brandProfile.brandColours || []),
            avoidedWords: JSON.stringify(brandProfile.avoidedWords || []),
            preferredCta: brandProfile.preferredCta,
            companySlogan: brandProfile.companySlogan,
          },
        });
      }

      // 5. Update Marketing Objectives (Section E)
      if (Array.isArray(marketingObjectives)) {
        await tx.clientMarketingObjective.deleteMany({ where: { clientId } });
        for (let i = 0; i < marketingObjectives.length; i++) {
          const item = marketingObjectives[i];
          if (item.title) {
            await tx.clientMarketingObjective.create({
              data: {
                clientId,
                title: item.title,
                description: item.description || null,
                priority: i + 1,
                isCompleted: item.isCompleted ?? false,
              },
            });
          }
        }
      }

      // 6. Update Competitors (Section F)
      if (Array.isArray(competitors)) {
        await tx.clientCompetitor.deleteMany({ where: { clientId } });
        for (const c of competitors) {
          if (c.name) {
            await tx.clientCompetitor.create({
              data: {
                clientId,
                name: c.name,
                website: c.website || "",
                facebookUrl: c.facebookUrl || "",
                instagramUrl: c.instagramUrl || "",
                tiktokUrl: c.tiktokUrl || "",
                notes: c.notes || "",
              },
            });
          }
        }
      }

      // 7. Update Notes (Section G)
      if (Array.isArray(notes)) {
        await tx.clientNote.deleteMany({ where: { clientId } });
        for (const n of notes) {
          if (n.title && n.content) {
            await tx.clientNote.create({
              data: {
                clientId,
                title: n.title,
                content: n.content,
                authorName: n.authorName || user.name,
                isPinned: n.isPinned ?? false,
              },
            });
          }
        }
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          clientId,
          userId: user.id,
          action: "PROFILE_UPDATED",
          description: `Client profile sections updated by ${user.name}.`,
        },
      });
    });

    return NextResponse.json({ success: true, message: "Profile successfully saved." });
  } catch (error) {
    console.error("PUT /api/clients/[clientId]/profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
