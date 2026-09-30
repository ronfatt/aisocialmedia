import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();

    // Multi-tenant isolation:
    // Admin/Owner sees all clients in their organization.
    // Other roles see ONLY clients assigned to them in ClientMember or accountManagerId.
    const whereClause: any = {};
    if (user.role !== "ADMIN" && user.role !== "OWNER") {
      whereClause.OR = [
        { accountManagerId: user.id },
        { members: { some: { userId: user.id } } },
      ];
    }

    const clients = await db.client.findMany({
      where: whereClause,
      include: {
        socialAccounts: true,
        contentItems: {
          select: {
            status: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = clients.map((c) => {
      const fb = c.socialAccounts.find((s) => s.platform === "FACEBOOK");
      const ig = c.socialAccounts.find((s) => s.platform === "INSTAGRAM");
      const tt = c.socialAccounts.find((s) => s.platform === "TIKTOK");

      const scheduledCount = c.contentItems.filter((i) => i.status === "SCHEDULED").length;
      const pendingCount = c.contentItems.filter((i) => i.status === "PENDING_APPROVAL").length;

      return {
        id: c.id,
        name: c.name,
        brandName: c.brandName,
        slug: c.slug,
        logoUrl: c.logoUrl,
        industry: c.industry,
        locationCity: c.locationCity,
        locationState: c.locationState,
        locationCountry: c.locationCountry,
        status: c.status,
        accountManagerName: c.accountManagerName || "Unassigned",
        accountManagerId: c.accountManagerId,
        facebookStatus: fb ? fb.connectionStatus : "PENDING_INTEGRATION",
        instagramStatus: ig ? ig.connectionStatus : "PENDING_INTEGRATION",
        tiktokStatus: tt ? tt.connectionStatus : "PENDING_INTEGRATION",
        scheduledPostsCount: scheduledCount,
        pendingApprovalsCount: pendingCount,
        lastActivityDate: c.activityLogs[0]?.createdAt.toISOString() || c.updatedAt.toISOString(),
        createdAt: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ clients: formatted, userRole: user.role });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const {
      companyName,
      brandName,
      industry,
      locationCity,
      locationState,
      locationCountry = "Malaysia",
      businessDescription,
      website,
      phone,
      whatsapp,
      email,
      address,
      serviceAreas = [],
      services = [],
      targetMarket = {},
      brandProfile = {},
      marketingObjectives = [],
      preferredPlatforms = ["Facebook", "Instagram"],
      accountManagerId,
    } = body;

    if (!companyName || !industry || !locationCity || !locationState) {
      return NextResponse.json(
        { error: "Company name, industry, city, and state are required." },
        { status: 400 }
      );
    }

    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    // Resolve an organization
    const org = await db.organization.findFirst();
    const orgId = org?.id || "org-apex";

    // Create client and all child records in atomic transaction
    const newClient = await db.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          organizationId: orgId,
          name: companyName,
          brandName: brandName || companyName,
          slug,
          industry,
          locationCity,
          locationState,
          locationCountry,
          status: "ONBOARDING",
          accountManagerId: accountManagerId || user.id,
          accountManagerName: user.name,
          logoUrl: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=160&h=160&fit=crop`,
        },
      });

      // Member association
      await tx.clientMember.create({
        data: {
          clientId: client.id,
          userId: user.id,
          role: user.role,
        },
      });

      // Profile (Section A)
      await tx.clientProfile.create({
        data: {
          clientId: client.id,
          businessDescription: businessDescription || "",
          website: website || "",
          phone: phone || "",
          whatsapp: whatsapp || "",
          email: email || "",
          address: address || "",
          city: locationCity,
          state: locationState,
          country: locationCountry,
          serviceAreas: JSON.stringify(serviceAreas),
        },
      });

      // Services (Section B)
      if (Array.isArray(services) && services.length > 0) {
        for (const s of services) {
          if (s.name) {
            await tx.clientService.create({
              data: {
                clientId: client.id,
                name: s.name,
                category: s.category || industry,
                description: s.description || "",
                sellingPoints: JSON.stringify(s.sellingPoints || []),
                targetCustomers: JSON.stringify(s.targetCustomers || []),
                priceInfo: s.priceInfo || null,
                isActive: true,
              },
            });
          }
        }
      }

      // Target Market (Section C)
      await tx.clientTargetMarket.create({
        data: {
          clientId: client.id,
          geographicTarget: targetMarket.geographicTarget || `${locationCity}, ${locationState}`,
          industryTarget: targetMarket.industryTarget || industry,
          customerType: targetMarket.customerType || "B2B",
          languages: JSON.stringify(targetMarket.languages || ["English", "Bahasa Melayu"]),
          ageRange: targetMarket.ageRange || "25 - 60",
          buyerPersona: targetMarket.buyerPersona || "",
          decisionMakers: JSON.stringify(targetMarket.decisionMakers || ["Business Owner", "Purchasing Manager"]),
        },
      });

      // Brand Profile (Section D)
      await tx.clientBrandProfile.create({
        data: {
          clientId: client.id,
          brandPositioning: brandProfile.brandPositioning || "",
          brandTone: brandProfile.brandTone || "Professional, Reliable, Modern",
          preferredLanguage: brandProfile.preferredLanguage || "English",
          secondaryLanguage: brandProfile.secondaryLanguage || "Bahasa Melayu",
          visualStyle: brandProfile.visualStyle || "Clean and modern industrial design",
          brandColours: JSON.stringify(brandProfile.brandColours || ["#0F172A", "#2563EB"]),
          avoidedWords: JSON.stringify(brandProfile.avoidedWords || ["cheap", "discount"]),
          preferredCta: brandProfile.preferredCta || "Get in Touch Today",
          companySlogan: brandProfile.companySlogan || "",
        },
      });

      // Marketing Objectives (Section E)
      if (Array.isArray(marketingObjectives) && marketingObjectives.length > 0) {
        for (let i = 0; i < marketingObjectives.length; i++) {
          await tx.clientMarketingObjective.create({
            data: {
              clientId: client.id,
              title: typeof marketingObjectives[i] === "string" ? marketingObjectives[i] : marketingObjectives[i].title,
              priority: i + 1,
            },
          });
        }
      }

      // Strategy & Content Pillars (Section 5)
      const strategy = await tx.clientStrategy.create({
        data: {
          clientId: client.id,
          brandPositioning: brandProfile.brandPositioning || "",
          marketingObjectives: marketingObjectives.join("; "),
          targetAudience: targetMarket.buyerPersona || "",
          targetLocations: targetMarket.geographicTarget || `${locationCity}, ${locationState}`,
          targetIndustries: targetMarket.industryTarget || industry,
          preferredPlatforms: JSON.stringify(preferredPlatforms),
          postingFrequency: "3 posts / week",
          languageStrategy: `Primary: ${brandProfile.preferredLanguage || "English"}`,
          ctaStrategy: brandProfile.preferredCta || "Contact Us",
        },
      });

      // Default Starter Content Pillars
      const defaultPillars = [
        { title: "Core Capabilities & Products", desc: "Showcasing key offerings and unique advantages" },
        { title: "Client Problem & Solution", desc: "Real-world problems solved for customers" },
        { title: "Behind the Scenes & Quality", desc: "Processes, standards, and team expertise" },
      ];

      for (let i = 0; i < defaultPillars.length; i++) {
        await tx.contentPillar.create({
          data: {
            strategyId: strategy.id,
            title: defaultPillars[i].title,
            description: defaultPillars[i].desc,
            orderIndex: i + 1,
          },
        });
      }

      // Social Account Stubs (Section 6)
      const platforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"];
      for (const p of platforms) {
        await tx.socialAccount.create({
          data: {
            clientId: client.id,
            platform: p,
            connectionStatus: "PENDING_INTEGRATION",
          },
        });
      }

      // Activity Log
      await tx.activityLog.create({
        data: {
          clientId: client.id,
          userId: user.id,
          action: "CLIENT_CREATED",
          description: `Client workspace for "${client.name}" was successfully created by ${user.name}.`,
        },
      });

      return client;
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return NextResponse.json({ error: "Failed to create client workspace" }, { status: 500 });
  }
}
