import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 2 database with full multi-tenant structure and roles...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.contentPillar.deleteMany();
  await prisma.clientStrategy.deleteMany();
  await prisma.clientNote.deleteMany();
  await prisma.clientCompetitor.deleteMany();
  await prisma.clientMarketingObjective.deleteMany();
  await prisma.clientBrandProfile.deleteMany();
  await prisma.clientTargetMarket.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.clientMember.deleteMany();
  await prisma.client.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization (Agency)
  const org = await prisma.organization.create({
    data: {
      name: "Apex Digital Media Agency",
      slug: "apex-digital",
      logoUrl: "/logos/apex-logo.svg",
    },
  });

  // 2. Create Agency Users across all required roles
  const usersData = [
    {
      email: "sarah.chen@apexmedia.io",
      name: "Sarah Chen",
      role: "OWNER",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "marcus.wong@apexmedia.io",
      name: "Marcus Wong",
      role: "ACCOUNT_MANAGER",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "aisha.rahman@apexmedia.io",
      name: "Aisha Rahman",
      role: "ACCOUNT_MANAGER",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "david.tan@apexmedia.io",
      name: "David Tan",
      role: "CONTENT_CREATOR",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "elena.gomez@apexmedia.io",
      name: "Elena Gomez",
      role: "APPROVER",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "kevin.lee@apexmedia.io",
      name: "Kevin Lee",
      role: "SALES",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face",
    },
    {
      email: "rachel.adams@apexmedia.io",
      name: "Rachel Adams",
      role: "VIEWER",
      passwordHash: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face",
    },
  ];

  const createdUsers: Record<string, any> = {};
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash: u.passwordHash,
        avatarUrl: u.avatarUrl,
      },
    });
    createdUsers[u.email] = user;

    // Create OrganizationMember link
    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: u.role,
      },
    });
  }

  // 3. Client 1: UXUI HOLDINGS
  const clientUxui = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "UXUI HOLDINGS",
      brandName: "UXUI Fabrication Systems",
      slug: "uxui-holdings",
      industry: "Industrial / Metal Fabrication",
      locationCity: "Klang",
      locationState: "Selangor",
      locationCountry: "Malaysia",
      status: "ACTIVE",
      accountManagerId: createdUsers["marcus.wong@apexmedia.io"].id,
      accountManagerName: "Marcus Wong",
      logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=160&h=160&fit=crop",
    },
  });

  // Client 1 Members (Owner Sarah, AM Marcus, Creator David, Approver Elena, Sales Kevin, Viewer Rachel)
  await prisma.clientMember.createMany({
    data: [
      { clientId: clientUxui.id, userId: createdUsers["sarah.chen@apexmedia.io"].id, role: "OWNER" },
      { clientId: clientUxui.id, userId: createdUsers["marcus.wong@apexmedia.io"].id, role: "ACCOUNT_MANAGER" },
      { clientId: clientUxui.id, userId: createdUsers["david.tan@apexmedia.io"].id, role: "CONTENT_CREATOR" },
      { clientId: clientUxui.id, userId: createdUsers["elena.gomez@apexmedia.io"].id, role: "APPROVER" },
      { clientId: clientUxui.id, userId: createdUsers["kevin.lee@apexmedia.io"].id, role: "SALES" },
      { clientId: clientUxui.id, userId: createdUsers["rachel.adams@apexmedia.io"].id, role: "VIEWER" },
      // Notice: Aisha Rahman (AM B) is strictly NOT in UXUI Holdings
    ],
  });

  // Client 1 Profile
  await prisma.clientProfile.create({
    data: {
      clientId: clientUxui.id,
      businessDescription: "Premier heavy precision metal fabrication, CNC fiber laser cutting, and structural engineering fabrication serving ASEAN manufacturing plants.",
      website: "https://uxuiholdings.example.com",
      phone: "+60 3-3344 8899",
      whatsapp: "+60 12-889 7766",
      email: "contact@uxuiholdings.example.com",
      address: "Lot 482, Kawasan Perindustrian Bandar Sultan Suleiman",
      city: "Klang",
      state: "Selangor",
      country: "Malaysia",
      serviceAreas: JSON.stringify(["Klang Valley", "Penang Industrial Zone", "Johor Pasir Gudang", "Singapore Jurong"]),
    },
  });

  // Client 1 Services
  await prisma.clientService.createMany({
    data: [
      {
        clientId: clientUxui.id,
        name: "Fiber Laser Cutting",
        category: "Metal Fabrication",
        description: "High-precision 12kW fiber laser cutting handling stainless steel up to 30mm and mild steel up to 40mm thickness with zero burr tolerances.",
        sellingPoints: JSON.stringify(["High precision ±0.05mm", "Fast turnaround within 48h", "Automated nest optimization for lowest scrap rate"]),
        targetCustomers: JSON.stringify(["Automation machine builders", "Semiconductor tooling makers", "Construction engineering"]),
        priceInfo: "Starting from RM 250 / hr cut time or per drawing quotation",
        isActive: true,
      },
      {
        clientId: clientUxui.id,
        name: "5-Axis CNC Machining",
        category: "Precision Engineering",
        description: "Complex structural component milling with continuous 5-axis simultaneous machining for aerospace, marine, and oil & gas manifolds.",
        sellingPoints: JSON.stringify(["Aerospace grade tolerances", "Full CMM inspection reports provided", "High batch repeatability"]),
        targetCustomers: JSON.stringify(["Oil & Gas contractors", "Marine equipment suppliers"]),
        priceInfo: "Custom quotation based on 3D CAD/STEP files",
        isActive: true,
      },
      {
        clientId: clientUxui.id,
        name: "Custom Heavy Metal Fabrication & Welding",
        category: "Structural Fabrication",
        description: "Certified AWS/ASME standard structural steel frames, skid structures, and high-pressure vessel housings.",
        sellingPoints: JSON.stringify(["AWS D1.1 certified welders", "In-house ultrasonic and dye penetrant testing", "Epoxy blast primer coating"]),
        targetCustomers: JSON.stringify(["EPC contractors", "Chemical plants", "Palm oil refinery builders"]),
        priceInfo: "Tender & Project quotation basis",
        isActive: true,
      },
    ],
  });

  // Client 1 Target Market
  await prisma.clientTargetMarket.create({
    data: {
      clientId: clientUxui.id,
      geographicTarget: "Malaysia nationwide (Selangor, Penang, Johor) & Singapore export",
      industryTarget: "Heavy Machinery, Automation, Oil & Gas, Commercial HVAC",
      customerType: "B2B",
      languages: JSON.stringify(["English", "Bahasa Melayu", "Mandarin"]),
      ageRange: "32 - 58",
      buyerPersona: "Technical engineering managers, lead procurement executives, and factory managing directors seeking reliable ASEAN subcontracting partners.",
      decisionMakers: JSON.stringify(["Purchasing Manager", "Engineering Manager", "Maintenance Manager", "Managing Director / Business Owner"]),
    },
  });

  // Client 1 Brand Profile
  await prisma.clientBrandProfile.create({
    data: {
      clientId: clientUxui.id,
      brandPositioning: "The unshakeable backbone of Southeast Asia's high-precision industrial fabrication.",
      brandTone: "Authoritative, Industrial, Precise, Pragmatic, Solution-Oriented",
      preferredLanguage: "English",
      secondaryLanguage: "Bahasa Melayu",
      visualStyle: "High-contrast industrial aesthetics, deep metallic blues, machinery macro photography, and CAD wireframe highlights.",
      brandColours: JSON.stringify(["#0F172A", "#1E3A8A", "#F97316", "#64748B"]),
      avoidedWords: JSON.stringify(["cheap", "discount", "budget cuts", "cheap labour", "hacks"]),
      preferredCta: "Request an Engineering Drawing Review & Fast Quote",
      companySlogan: "Engineered to Endure. Precision Without Compromise.",
    },
  });

  // Client 1 Marketing Objectives
  await prisma.clientMarketingObjective.createMany({
    data: [
      { clientId: clientUxui.id, title: "Generate qualified B2B WhatsApp engineering inquiries", priority: 1, isCompleted: false },
      { clientId: clientUxui.id, title: "Establish authority in fiber laser cutting tolerances across Klang Valley", priority: 2, isCompleted: false },
      { clientId: clientUxui.id, title: "Promote new 12kW high-capacity laser cutter acquisition", priority: 3, isCompleted: false },
      { clientId: clientUxui.id, title: "Acquire RFQs from electronics & automation firms in Penang", priority: 4, isCompleted: false },
    ],
  });

  // Client 1 Competitors
  await prisma.clientCompetitor.createMany({
    data: [
      {
        clientId: clientUxui.id,
        name: "MegaSteel Precision Sdn Bhd",
        website: "https://megasteel.example.com",
        facebookUrl: "https://facebook.com/megasteelmy",
        instagramUrl: "",
        tiktokUrl: "",
        notes: "Aggressive price competitor in mild steel bending. Weak video content and slow quoting process.",
      },
      {
        clientId: clientUxui.id,
        name: "Apex MetalTech Engineering",
        website: "https://apexmetaltech.example.com",
        facebookUrl: "https://facebook.com/apexmetaltech",
        instagramUrl: "https://instagram.com/apexmetaltech",
        tiktokUrl: "",
        notes: "Strong brand presence on LinkedIn and FB. Highlighting fast turnaround.",
      },
    ],
  });

  // Client 1 Notes
  await prisma.clientNote.createMany({
    data: [
      {
        clientId: clientUxui.id,
        title: "Client Approval Protocol",
        content: "All technical video clips showing customer proprietary parts must have client NDA approval before scheduling. Mr. Tan requires 24h review time on WhatsApp.",
        isPinned: true,
      },
      {
        clientId: clientUxui.id,
        title: "Content Tone Guidelines",
        content: "Avoid using flashy TikTok dance trends. Focus purely on technical competence, machine sounds (ASMR sparks/cutting), and engineering problem solving.",
        isPinned: false,
      },
    ],
  });

  // Client 1 Strategy
  const strategyUxui = await prisma.clientStrategy.create({
    data: {
      clientId: clientUxui.id,
      brandPositioning: "ASEAN's dependable precision subcontracting partner for mission-critical metal parts.",
      marketingObjectives: "Generate 15+ verified engineering drawing quotation inquiries per month via WhatsApp and website form.",
      targetAudience: "B2B factory owners, engineering leads, project engineers, and procurement managers in Klang, Penang, and Johor.",
      targetLocations: "Malaysia (Selangor, Penang, Johor) & Singapore export",
      targetIndustries: "Semiconductor machines, Food packaging automation, Heavy transport, Structural engineering",
      mainProductsServices: "12kW Fiber Laser Cutting, 5-Axis CNC Machining, Certified Structural Welding",
      keySellingPoints: "48-hour turnarounds, ±0.05mm tolerances, AWS D1.1 certified welding, full ISO 9001 compliance",
      preferredPlatforms: JSON.stringify(["Facebook", "TikTok", "Instagram"]),
      postingFrequency: "4 posts / week (2 Facebook carousel/case studies, 2 TikTok technical showcases)",
      languageStrategy: "Primary: English (60%), Secondary: Bahasa Melayu (30%), Chinese (10% for local SME owners)",
      ctaStrategy: "Direct WhatsApp link with prefilled drawing submission message template",
      campaignPriorities: "Q4 12kW Laser Cutting capacity push; Showcase automated sheet-loading efficiency",
      specialInstructions: "Always highlight local stock availability of 304/316 stainless steel plates to assure clients against global freight delays.",
    },
  });

  // Content Pillars
  await prisma.contentPillar.createMany({
    data: [
      { strategyId: strategyUxui.id, title: "Laser Cutting Capability", description: "Close-up cut precision, thickness capabilities, edge smoothness", orderIndex: 1, isActive: true },
      { strategyId: strategyUxui.id, title: "CNC Machining & Tooling", description: "Complex geometry milling and dimensional inspection verification", orderIndex: 2, isActive: true },
      { strategyId: strategyUxui.id, title: "Factory Capability & Safety", description: "Overhead crane capacities, welding bays, ISO quality checks", orderIndex: 3, isActive: true },
      { strategyId: strategyUxui.id, title: "Completed Case Studies", description: "Before-and-after fabrication showcases, client structural frameworks", orderIndex: 4, isActive: true },
      { strategyId: strategyUxui.id, title: "Engineering Education", description: "Guide on sheet metal tolerances, welding defects, material selection", orderIndex: 5, isActive: true },
      { strategyId: strategyUxui.id, title: "Customer Problem / Solution", description: "Solving tight lead times and complex fabrication headaches", orderIndex: 6, isActive: true },
    ],
  });

  // Social Accounts (Integration Pending)
  await prisma.socialAccount.createMany({
    data: [
      {
        clientId: clientUxui.id,
        platform: "FACEBOOK",
        displayName: "UXUI Holdings Malaysia",
        connectionStatus: "PENDING_INTEGRATION",
      },
      {
        clientId: clientUxui.id,
        platform: "INSTAGRAM",
        displayName: "uxui_fabrication",
        connectionStatus: "PENDING_INTEGRATION",
      },
      {
        clientId: clientUxui.id,
        platform: "TIKTOK",
        displayName: "uxui_engineering",
        connectionStatus: "PENDING_INTEGRATION",
      },
    ],
  });

  // Content Items
  await prisma.contentItem.createMany({
    data: [
      {
        clientId: clientUxui.id,
        title: "Cutting 25mm Stainless Steel with 12kW Fiber Laser",
        description: "Watch the clean edge on this 25mm Grade 316 stainless flange. Zero slag, zero dross. Ready for immediate welding without secondary grinding.",
        contentPillar: "Laser Cutting Capability",
        status: "SCHEDULED",
        scheduledFor: new Date(Date.now() + 86400000 * 2),
        platforms: JSON.stringify(["FACEBOOK", "TIKTOK"]),
        createdBy: "David Tan",
        internalNotes: "Verified with welding dept: no slag left.",
      },
      {
        clientId: clientUxui.id,
        title: "How to Avoid Warping in Heavy Sheet Metal Bending",
        description: "Engineering tip: When working with high-tensile steel, springback calculation is crucial. Here is how our CNC press brake automatically compensates.",
        contentPillar: "Engineering Education",
        status: "PENDING_APPROVAL",
        platforms: JSON.stringify(["FACEBOOK", "INSTAGRAM"]),
        createdBy: "David Tan",
      },
      {
        clientId: clientUxui.id,
        title: "Factory Walkthrough: Behind our 30,000 sqft Klang Facility",
        description: "From raw steel plate intake to final CMM inspection, take a quick 45-second tour behind Malaysia's premier precision fabrication plant.",
        contentPillar: "Factory Capability & Safety",
        status: "DRAFT",
        platforms: JSON.stringify(["TIKTOK", "INSTAGRAM"]),
        createdBy: "David Tan",
      },
      {
        clientId: clientUxui.id,
        title: "Completed Project: Skid Base for Marine Generator",
        description: "Delivered on time for a Singapore offshore contractor. Full magnetic particle inspection passed on all critical welds.",
        contentPillar: "Completed Case Studies",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 3),
        platforms: JSON.stringify(["FACEBOOK"]),
        createdBy: "Marcus Wong",
      },
    ],
  });

  // Media Assets for UXUI Holdings
  await prisma.mediaAsset.createMany({
    data: [
      {
        clientId: clientUxui.id,
        fileName: "Laser-Head-Sparks-Macro.jpg",
        fileUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&fit=crop",
        fileType: "image/jpeg",
        fileSize: 2450000,
        category: "Images",
        tags: JSON.stringify(["Laser", "Cutting", "Precision"]),
        uploadedBy: "David Tan",
      },
      {
        clientId: clientUxui.id,
        fileName: "5-Axis-Machining-Impeller.mp4",
        fileUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&fit=crop",
        fileType: "video/mp4",
        fileSize: 18400000,
        category: "Videos",
        tags: JSON.stringify(["CNC", "Machining", "5Axis"]),
        uploadedBy: "David Tan",
      },
      {
        clientId: clientUxui.id,
        fileName: "UXUI-Primary-Logo-Vector.pdf",
        fileUrl: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&fit=crop",
        fileType: "application/pdf",
        fileSize: 520000,
        category: "Brand Assets",
        tags: JSON.stringify(["Logo", "Brand Guide"]),
        uploadedBy: "Marcus Wong",
      },
    ],
  });

  // 4. Client 2: ABC FOOD MACHINERY
  const clientAbc = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "ABC FOOD MACHINERY",
      brandName: "ABC Automation & Packaging",
      slug: "abc-food-machinery",
      industry: "Food Machinery",
      locationCity: "Shah Alam",
      locationState: "Selangor",
      locationCountry: "Malaysia",
      status: "ACTIVE",
      accountManagerId: createdUsers["marcus.wong@apexmedia.io"].id,
      accountManagerName: "Marcus Wong",
      logoUrl: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=160&h=160&fit=crop",
    },
  });

  await prisma.clientMember.createMany({
    data: [
      { clientId: clientAbc.id, userId: createdUsers["sarah.chen@apexmedia.io"].id, role: "OWNER" },
      { clientId: clientAbc.id, userId: createdUsers["marcus.wong@apexmedia.io"].id, role: "ACCOUNT_MANAGER" },
      { clientId: clientAbc.id, userId: createdUsers["david.tan@apexmedia.io"].id, role: "CONTENT_CREATOR" },
    ],
  });

  await prisma.clientProfile.create({
    data: {
      clientId: clientAbc.id,
      businessDescription: "Designers and turnkey system integrators of hygienic food processing machinery, stainless retort sterilizers, and automated sauce bottling lines.",
      website: "https://abcfoodmachinery.example.com",
      phone: "+60 3-5511 2233",
      whatsapp: "+60 19-332 1100",
      email: "sales@abcfoodmachinery.example.com",
      city: "Shah Alam",
      state: "Selangor",
      country: "Malaysia",
      serviceAreas: JSON.stringify(["West Malaysia", "Sabah & Sarawak", "Indonesia", "Thailand"]),
    },
  });

  await prisma.socialAccount.createMany({
    data: [
      { clientId: clientAbc.id, platform: "FACEBOOK", displayName: "ABC Food Machinery Asia", connectionStatus: "PENDING_INTEGRATION" },
      { clientId: clientAbc.id, platform: "INSTAGRAM", displayName: "abcfoodmachinery", connectionStatus: "PENDING_INTEGRATION" },
      { clientId: clientAbc.id, platform: "TIKTOK", displayName: "", connectionStatus: "PENDING_INTEGRATION" },
    ],
  });

  // 5. Client 3: XYZ ENGINEERING (Assigned ONLY to Aisha Rahman)
  const clientXyz = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "XYZ ENGINEERING",
      brandName: "XYZ Precision Tooling",
      slug: "xyz-engineering",
      industry: "Precision Tooling & Dies",
      locationCity: "Bayan Lepas",
      locationState: "Penang",
      locationCountry: "Malaysia",
      status: "ACTIVE",
      accountManagerId: createdUsers["aisha.rahman@apexmedia.io"].id,
      accountManagerName: "Aisha Rahman",
      logoUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=160&h=160&fit=crop",
    },
  });

  await prisma.clientMember.createMany({
    data: [
      { clientId: clientXyz.id, userId: createdUsers["sarah.chen@apexmedia.io"].id, role: "OWNER" },
      { clientId: clientXyz.id, userId: createdUsers["aisha.rahman@apexmedia.io"].id, role: "ACCOUNT_MANAGER" },
      // Notice: Marcus Wong, David Tan, etc. are NOT in XYZ Engineering!
    ],
  });

  await prisma.clientProfile.create({
    data: {
      clientId: clientXyz.id,
      businessDescription: "Sub-micron precision carbide tooling, progressive stamping dies, and wire-cut EDM services for semiconductor lead frames.",
      website: "https://xyzengineering.example.com",
      phone: "+60 4-644 1122",
      whatsapp: "+60 17-440 9988",
      email: "info@xyzengineering.example.com",
      city: "Bayan Lepas",
      state: "Penang",
      country: "Malaysia",
      serviceAreas: JSON.stringify(["Penang", "Kedah", "Singapore", "Japan"]),
    },
  });

  await prisma.socialAccount.createMany({
    data: [
      { clientId: clientXyz.id, platform: "FACEBOOK", displayName: "", connectionStatus: "PENDING_INTEGRATION" },
      { clientId: clientXyz.id, platform: "INSTAGRAM", displayName: "", connectionStatus: "PENDING_INTEGRATION" },
      { clientId: clientXyz.id, platform: "TIKTOK", displayName: "", connectionStatus: "PENDING_INTEGRATION" },
    ],
  });

  // Client 3 Media (to test isolation: must not appear under Client 1 or 2!)
  await prisma.mediaAsset.create({
    data: {
      clientId: clientXyz.id,
      fileName: "XYZ-Semiconductor-Carbide-Die.png",
      fileUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&fit=crop",
      fileType: "image/png",
      fileSize: 1200000,
      category: "Images",
      tags: JSON.stringify(["Carbide", "Die", "XYZ"]),
      uploadedBy: "Aisha Rahman",
    },
  });

  // 6. Additional Clients to test filtering
  await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "KLUANG HERITAGE ROASTERY",
      brandName: "Kluang Roasters",
      slug: "kluang-heritage-roastery",
      industry: "F&B / Specialty Coffee",
      locationCity: "Kluang",
      locationState: "Johor",
      locationCountry: "Malaysia",
      status: "ONBOARDING",
      accountManagerId: createdUsers["marcus.wong@apexmedia.io"].id,
      accountManagerName: "Marcus Wong",
      logoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=160&h=160&fit=crop",
    },
  });

  await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "NEXUS GREEN ENERGY",
      brandName: "Nexus Solar Solutions",
      slug: "nexus-green-energy",
      industry: "Renewable Energy / Solar EPC",
      locationCity: "Petaling Jaya",
      locationState: "Selangor",
      locationCountry: "Malaysia",
      status: "PAUSED",
      accountManagerId: createdUsers["sarah.chen@apexmedia.io"].id,
      accountManagerName: "Sarah Chen",
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=160&h=160&fit=crop",
    },
  });

  // Initial Activity Logs with full organizationId and entity metadata
  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: org.id,
        clientId: clientUxui.id,
        userId: createdUsers["sarah.chen@apexmedia.io"].id,
        action: "CLIENT_CREATED",
        entityType: "CLIENT",
        entityId: clientUxui.id,
        description: "UXUI Holdings workspace initialized with multi-tenant isolation.",
      },
      {
        organizationId: org.id,
        clientId: clientUxui.id,
        userId: createdUsers["marcus.wong@apexmedia.io"].id,
        action: "PROFILE_UPDATED",
        entityType: "PROFILE",
        entityId: clientUxui.id,
        description: "Master business profile & 3 core fabrication services updated.",
      },
      {
        organizationId: org.id,
        clientId: clientUxui.id,
        userId: createdUsers["david.tan@apexmedia.io"].id,
        action: "CONTENT_CREATED",
        entityType: "CONTENT",
        description: "Scheduled 'Cutting 25mm Stainless Steel with 12kW Fiber Laser' for Facebook & TikTok.",
      },
    ],
  });

  console.log("Database seeded successfully with all 7 roles and multi-client records!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
