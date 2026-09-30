import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with multi-tenant data...");

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
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Apex Digital Media Agency",
      slug: "apex-digital",
      logoUrl: "/logos/apex-logo.svg",
    },
  });

  // 2. Create Users with different roles & assignments
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "sarah.chen@apexmedia.io",
      name: "Sarah Chen",
      role: "ADMIN",
      passwordHash: "mock_hash_admin",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
    },
  });

  const accountManagerA = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "marcus.wong@apexmedia.io",
      name: "Marcus Wong",
      role: "ACCOUNT_MANAGER",
      passwordHash: "mock_hash_marcus",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
    },
  });

  const accountManagerB = await prisma.user.create({
    data: {
      organizationId: org.id,
      email: "aisha.rahman@apexmedia.io",
      name: "Aisha Rahman",
      role: "ACCOUNT_MANAGER",
      passwordHash: "mock_hash_aisha",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
    },
  });

  // 3. Client 1: UXUI HOLDINGS (Industrial / Metal Fabrication)
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
      accountManagerId: accountManagerA.id,
      accountManagerName: accountManagerA.name,
      logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=160&h=160&fit=crop",
    },
  });

  // Client 1 Members
  await prisma.clientMember.createMany({
    data: [
      { clientId: clientUxui.id, userId: adminUser.id, role: "ADMIN" },
      { clientId: clientUxui.id, userId: accountManagerA.id, role: "ACCOUNT_MANAGER" },
    ],
  });

  // Client 1 Profile (Section A)
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

  // Client 1 Services (Section B)
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

  // Client 1 Target Market (Section C)
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

  // Client 1 Brand Profile (Section D)
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

  // Client 1 Marketing Objectives (Section E)
  await prisma.clientMarketingObjective.createMany({
    data: [
      { clientId: clientUxui.id, title: "Generate qualified B2B WhatsApp engineering inquiries", priority: 1, isCompleted: false },
      { clientId: clientUxui.id, title: "Establish authority in fiber laser cutting tolerances across Klang Valley", priority: 2, isCompleted: false },
      { clientId: clientUxui.id, title: "Promote new 12kW high-capacity laser cutter acquisition", priority: 3, isCompleted: false },
      { clientId: clientUxui.id, title: "Acquire RFQs from electronics & automation firms in Penang", priority: 4, isCompleted: false },
    ],
  });

  // Client 1 Competitors (Section F)
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

  // Client 1 Notes (Section G)
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

  // Client 1 Strategy (Section 5)
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

  // Client 1 Content Pillars
  await prisma.contentPillar.createMany({
    data: [
      { strategyId: strategyUxui.id, title: "Laser Cutting Capability", description: "Close-up cut precision, thickness capabilities, edge smoothness", orderIndex: 1 },
      { strategyId: strategyUxui.id, title: "CNC Machining & Tooling", description: "Complex geometry milling and dimensional inspection verification", orderIndex: 2 },
      { strategyId: strategyUxui.id, title: "Factory Capability & Safety", description: "Overhead crane capacities, welding bays, ISO quality checks", orderIndex: 3 },
      { strategyId: strategyUxui.id, title: "Completed Case Studies", description: "Before-and-after fabrication showcases, client structural frameworks", orderIndex: 4 },
      { strategyId: strategyUxui.id, title: "Engineering Education", description: "Guide on sheet metal tolerances, welding defects, material selection", orderIndex: 5 },
      { strategyId: strategyUxui.id, title: "Customer Problem / Solution", description: "Solving tight lead times and complex fabrication headaches", orderIndex: 6 },
    ],
  });

  // Client 1 Social Accounts (Section 6)
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

  // Client 1 Content Items
  await prisma.contentItem.createMany({
    data: [
      {
        clientId: clientUxui.id,
        title: "Cutting 25mm Stainless Steel with 12kW Fiber Laser",
        bodyText: "Watch the clean edge on this 25mm Grade 316 stainless flange. Zero slag, zero dross. Ready for immediate welding without secondary grinding.",
        status: "SCHEDULED",
        scheduledFor: new Date(Date.now() + 86400000 * 2), // 2 days from now
        platforms: JSON.stringify(["FACEBOOK", "TIKTOK"]),
      },
      {
        clientId: clientUxui.id,
        title: "How to Avoid Warping in Heavy Sheet Metal Bending",
        bodyText: "Engineering tip: When working with high-tensile steel, springback calculation is crucial. Here is how our CNC press brake automatically compensates.",
        status: "PENDING_APPROVAL",
        platforms: JSON.stringify(["FACEBOOK", "INSTAGRAM"]),
      },
      {
        clientId: clientUxui.id,
        title: "Factory Walkthrough: Behind our 30,000 sqft Klang Facility",
        bodyText: "From raw steel plate intake to final CMM inspection, take a quick 45-second tour behind Malaysia's premier precision fabrication plant.",
        status: "DRAFT",
        platforms: JSON.stringify(["TIKTOK", "INSTAGRAM"]),
      },
      {
        clientId: clientUxui.id,
        title: "Completed Project: Skid Base for Marine Generator",
        bodyText: "Delivered on time for a Singapore offshore contractor. Full magnetic particle inspection passed on all critical welds.",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 3),
        platforms: JSON.stringify(["FACEBOOK"]),
      },
    ],
  });

  // 4. Client 2: ABC FOOD MACHINERY (Food Machinery)
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
      accountManagerId: accountManagerA.id,
      accountManagerName: accountManagerA.name,
      logoUrl: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=160&h=160&fit=crop",
    },
  });

  await prisma.clientMember.createMany({
    data: [
      { clientId: clientAbc.id, userId: adminUser.id, role: "ADMIN" },
      { clientId: clientAbc.id, userId: accountManagerA.id, role: "ACCOUNT_MANAGER" },
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
      address: "Section 16, Industrial Estate",
      city: "Shah Alam",
      state: "Selangor",
      country: "Malaysia",
      serviceAreas: JSON.stringify(["West Malaysia", "Sabah & Sarawak", "Indonesia", "Thailand"]),
    },
  });

  await prisma.clientService.createMany({
    data: [
      {
        clientId: clientAbc.id,
        name: "Sanitary Liquid Filling & Capping Lines",
        category: "Food Packaging",
        description: "Hygienic 316L CIP-cleanable rotary piston filling lines for chili pastes, sauces, and edible oils up to 120 bottles per minute.",
        sellingPoints: JSON.stringify(["CIP clean-in-place ready", "High speed 120 bpm", "±0.5% fill accuracy"]),
        targetCustomers: JSON.stringify(["Condiment factories", "Beverage producers", "Cosmetics manufacturers"]),
        priceInfo: "Turnkey lines starting from RM 180,000",
        isActive: true,
      },
      {
        clientId: clientAbc.id,
        name: "Industrial Retort Sterilization Autoclaves",
        category: "Food Thermal Processing",
        description: "DOSH-certified steam and water spray sterilizers for retort pouch ready-to-eat meals with F0 automated sterilization logging.",
        sellingPoints: JSON.stringify(["DOSH certified pressure vessel", "F0 lethal thermal value auto-calculation", "Energy saving heat recovery"]),
        targetCustomers: JSON.stringify(["Ready-to-eat food brands", "Canned food manufacturers", "Central kitchens"]),
        priceInfo: "Available in 500L, 1000L, and 2500L capacities",
        isActive: true,
      },
    ],
  });

  await prisma.clientTargetMarket.create({
    data: {
      clientId: clientAbc.id,
      geographicTarget: "Malaysia, Indonesia, Thailand, Philippines",
      industryTarget: "Food & Beverage Manufacturing, Commercial Bakeries, Central Kitchens",
      customerType: "B2B",
      languages: JSON.stringify(["English", "Bahasa Melayu"]),
      ageRange: "30 - 65",
      buyerPersona: "Plant managers, QA/QC directors, food technology heads, and F&B SME owners upgrading from manual filling to automated production lines.",
      decisionMakers: JSON.stringify(["Managing Director", "Plant General Manager", "Head of Maintenance", "Head of Food Safety & QA"]),
    },
  });

  await prisma.clientBrandProfile.create({
    data: {
      clientId: clientAbc.id,
      brandPositioning: "Southeast Asia's reliable partner in hygienic food automation & retort technology.",
      brandTone: "Trustworthy, Clean, Engineering-led, Consultative, Food-safety obsessed",
      preferredLanguage: "English",
      secondaryLanguage: "Bahasa Melayu",
      visualStyle: "Ultra-clean stainless steel machinery, bright sterile food plant environments, graphic flow diagrams of automation lines.",
      brandColours: JSON.stringify(["#0284C7", "#0F172A", "#10B981"]),
      avoidedWords: JSON.stringify(["cheap", "untested", "experimental"]),
      preferredCta: "Schedule a Live Demo at our Shah Alam Experience Centre",
      companySlogan: "Safe Food. Smarter Automation.",
    },
  });

  await prisma.clientMarketingObjective.createMany({
    data: [
      { clientId: clientAbc.id, title: "Promote new automated retort pouch line for ready-to-eat SMEs", priority: 1, isCompleted: false },
      { clientId: clientAbc.id, title: "Collect 20+ inquiries monthly for high-speed liquid filling equipment", priority: 2, isCompleted: false },
    ],
  });

  const strategyAbc = await prisma.clientStrategy.create({
    data: {
      clientId: clientAbc.id,
      brandPositioning: "Turnkey food machinery engineering with guaranteed DOSH & GMP compliance.",
      marketingObjectives: "Generate 20 qualified commercial leads per month from regional food manufacturers.",
      targetAudience: "F&B factory owners and production engineers across ASEAN.",
      targetLocations: "Malaysia, Singapore, Indonesia",
      targetIndustries: "F&B, Sauces, Ready-to-eat meals, Dairy packaging",
      mainProductsServices: "Sanitary Filling Lines, Retort Autoclaves, Conveyor Accumulation Systems",
      keySellingPoints: "DOSH Certified, CIP Clean-in-Place, Local Service & Spare Parts in Shah Alam",
      preferredPlatforms: JSON.stringify(["Facebook", "Instagram"]),
      postingFrequency: "3 posts / week",
      languageStrategy: "Bilingual English & Bahasa Melayu",
      ctaStrategy: "Direct booking for Shah Alam showroom trial",
      campaignPriorities: "RTE Ready-To-Eat pouch packaging showcase",
      specialInstructions: "Highlight hygienic weld cleanliness and CIP test demos.",
    },
  });

  await prisma.contentPillar.createMany({
    data: [
      { strategyId: strategyAbc.id, title: "Machinery in Action (Speed & Flow)", description: "High-speed bottling lines running at 100+ bpm", orderIndex: 1 },
      { strategyId: strategyAbc.id, title: "DOSH & Food Safety Compliance", description: "Hygiene standards, 316L metallurgy, CIP sanitization", orderIndex: 2 },
      { strategyId: strategyAbc.id, title: "Customer Success & ROI", description: "How an SME saved 8 workers and boosted capacity 400%", orderIndex: 3 },
      { strategyId: strategyAbc.id, title: "Maintenance & Spare Parts Assurance", description: "Local Shah Alam engineering support team", orderIndex: 4 },
    ],
  });

  // Client 2 Social Accounts: Facebook Connected, Instagram Connected, TikTok Not Connected
  await prisma.socialAccount.createMany({
    data: [
      {
        clientId: clientAbc.id,
        platform: "FACEBOOK",
        displayName: "ABC Food Machinery Asia",
        connectionStatus: "CONNECTED",
      },
      {
        clientId: clientAbc.id,
        platform: "INSTAGRAM",
        displayName: "abcfoodmachinery",
        connectionStatus: "CONNECTED",
      },
      {
        clientId: clientAbc.id,
        platform: "TIKTOK",
        displayName: "",
        connectionStatus: "PENDING_INTEGRATION",
      },
    ],
  });

  // 5. Client 3: XYZ ENGINEERING (Assigned ONLY to Aisha Rahman - to test client isolation)
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
      accountManagerId: accountManagerB.id,
      accountManagerName: accountManagerB.name,
      logoUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=160&h=160&fit=crop",
    },
  });

  await prisma.clientMember.createMany({
    data: [
      { clientId: clientXyz.id, userId: adminUser.id, role: "ADMIN" },
      { clientId: clientXyz.id, userId: accountManagerB.id, role: "ACCOUNT_MANAGER" },
      // Notice: Marcus Wong (Account Manager A) is NOT in this client membership!
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
      address: "Bayan Lepas Free Industrial Zone Phase 3",
      city: "Bayan Lepas",
      state: "Penang",
      country: "Malaysia",
      serviceAreas: JSON.stringify(["Penang", "Kedah", "Singapore", "Japan"]),
    },
  });

  await prisma.socialAccount.createMany({
    data: [
      {
        clientId: clientXyz.id,
        platform: "FACEBOOK",
        displayName: "",
        connectionStatus: "PENDING_INTEGRATION",
      },
      {
        clientId: clientXyz.id,
        platform: "INSTAGRAM",
        displayName: "",
        connectionStatus: "PENDING_INTEGRATION",
      },
      {
        clientId: clientXyz.id,
        platform: "TIKTOK",
        displayName: "",
        connectionStatus: "PENDING_INTEGRATION",
      },
    ],
  });

  // 6. Additional Clients to test filtering and large client base
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
      accountManagerId: accountManagerA.id,
      accountManagerName: accountManagerA.name,
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
      accountManagerId: adminUser.id,
      accountManagerName: adminUser.name,
      logoUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=160&h=160&fit=crop",
    },
  });

  // Create initial activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        clientId: clientUxui.id,
        userId: accountManagerA.id,
        action: "CLIENT_WORKSPACE_INITIALIZED",
        description: "UXUI Holdings workspace initialized with 6 content pillars and 3 core engineering services.",
      },
      {
        clientId: clientUxui.id,
        userId: accountManagerA.id,
        action: "CONTENT_SCHEDULED",
        description: "Scheduled 'Cutting 25mm Stainless Steel with 12kW Fiber Laser' for Facebook & TikTok.",
      },
      {
        clientId: clientAbc.id,
        userId: accountManagerA.id,
        action: "SOCIAL_ACCOUNT_CONNECTED",
        description: "Facebook Page 'ABC Food Machinery Asia' connected successfully.",
      },
    ],
  });

  console.log("Database seeded successfully with multi-tenant structure!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
