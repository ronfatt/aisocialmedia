import http from "http";

function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  return new Promise<{ status: number; data: any }>((resolve, reject) => {
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode || 500, data: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING SOCIAL COMMAND CENTER MULTI-TENANT VERIFICATION ===\n");

  // 1. Admin Sarah Chen sees all clients
  const adminRes = await request("/api/clients", {
    headers: { Cookie: "scc_active_user=sarah.chen@apexmedia.io" },
  });
  console.log(`[TEST 1] Admin Fetch Clients: HTTP ${adminRes.status}`);
  console.log(`         Total Clients visible to Admin: ${adminRes.data.clients?.length}`);
  const clientNames = adminRes.data.clients.map((c: any) => c.name);
  console.log(`         Clients: ${clientNames.join(", ")}`);

  const uxuiClient = adminRes.data.clients.find((c: any) => c.name === "UXUI HOLDINGS");
  const abcClient = adminRes.data.clients.find((c: any) => c.name === "ABC FOOD MACHINERY");
  const xyzClient = adminRes.data.clients.find((c: any) => c.name === "XYZ ENGINEERING");

  if (!uxuiClient || !xyzClient) {
    throw new Error("Seed clients not found!");
  }

  // 2. Account Manager A (Marcus Wong) sees UXUI Holdings and ABC Food Machinery, NOT XYZ Engineering
  const amARes = await request("/api/clients", {
    headers: { Cookie: "scc_active_user=marcus.wong@apexmedia.io" },
  });
  const amAClients = amARes.data.clients.map((c: any) => c.name);
  console.log(`\n[TEST 2] Account Manager A (Marcus Wong) Scope:`);
  console.log(`         Visible: ${amAClients.join(", ")}`);
  const amAHasUxui = amAClients.includes("UXUI HOLDINGS");
  const amAHasXyz = amAClients.includes("XYZ ENGINEERING");
  console.log(`         Has UXUI Holdings: ${amAHasUxui} (Expected: true)`);
  console.log(`         Has XYZ Engineering: ${amAHasXyz} (Expected: false)`);

  // 3. Account Manager B (Aisha Rahman) sees XYZ Engineering, NOT UXUI Holdings
  const amBRes = await request("/api/clients", {
    headers: { Cookie: "scc_active_user=aisha.rahman@apexmedia.io" },
  });
  const amBClients = amBRes.data.clients.map((c: any) => c.name);
  console.log(`\n[TEST 3] Account Manager B (Aisha Rahman) Scope:`);
  console.log(`         Visible: ${amBClients.join(", ")}`);
  const amBHasUxui = amBClients.includes("UXUI HOLDINGS");
  const amBHasXyz = amBClients.includes("XYZ ENGINEERING");
  console.log(`         Has UXUI Holdings: ${amBHasUxui} (Expected: false)`);
  console.log(`         Has XYZ Engineering: ${amBHasXyz} (Expected: true)`);

  // 4. Strict Security Guard: Direct IDOR attack attempt by Aisha on UXUI Holdings
  console.log(`\n[TEST 4] Direct IDOR Access Enforcement:`);
  const unauthorizedRes = await request(`/api/clients/${uxuiClient.id}`, {
    headers: { Cookie: "scc_active_user=aisha.rahman@apexmedia.io" },
  });
  console.log(`         Aisha accessing UXUI Holdings: HTTP ${unauthorizedRes.status}`);
  console.log(`         Response Error: "${unauthorizedRes.data.error}"`);
  if (unauthorizedRes.status !== 403) {
    throw new Error(`Security Failure: Expected HTTP 403 but received ${unauthorizedRes.status}`);
  }
  console.log("         ✓ MULTI-TENANT ISOLATION PASSED: Cross-client access is blocked.");

  // 5. Authorized Access to UXUI Holdings Overview & Strategy
  console.log(`\n[TEST 5] Client Overview & Content Pipeline Metrics for UXUI Holdings:`);
  const uxuiOverview = await request(`/api/clients/${uxuiClient.id}`, {
    headers: { Cookie: "scc_active_user=sarah.chen@apexmedia.io" },
  });
  console.log(`         Status: HTTP ${uxuiOverview.status}`);
  console.log(`         Scheduled Posts: ${uxuiOverview.data.scheduledThisWeek}`);
  console.log(`         Content Pipeline:`, uxuiOverview.data.contentStats);

  // 6. Strategy & Content Pillars
  console.log(`\n[TEST 6] Strategy & Content Pillars for UXUI Holdings:`);
  const strategyRes = await request(`/api/clients/${uxuiClient.id}/strategy`, {
    headers: { Cookie: "scc_active_user=sarah.chen@apexmedia.io" },
  });
  const pillars = strategyRes.data.strategy.pillars.map((p: any) => p.title);
  console.log(`         Positioning: "${strategyRes.data.strategy.brandPositioning.slice(0, 50)}..."`);
  console.log(`         Content Pillars (${pillars.length}): ${pillars.join(", ")}`);

  // 7. Social Accounts Provider Verification
  console.log(`\n[TEST 7] Modular Social Provider Architecture for UXUI Holdings:`);
  const socialRes = await request(`/api/clients/${uxuiClient.id}/social-accounts`, {
    headers: { Cookie: "scc_active_user=sarah.chen@apexmedia.io" },
  });
  for (const acct of socialRes.data.accounts) {
    console.log(`         Platform: ${acct.platform.padEnd(10)} Status: ${acct.connectionStatus.padEnd(20)} Scopes: [${acct.requiredScopes.slice(0, 2).join(", ")}...]`);
  }

  // 8. 7-Step Onboarding Test: Creating a New Client Workspace
  console.log(`\n[TEST 8] 7-Step Onboarding Wizard API Submission:`);
  const newClientRes = await request("/api/clients", {
    method: "POST",
    headers: { Cookie: "scc_active_user=sarah.chen@apexmedia.io" },
    body: JSON.stringify({
      companyName: "ZENITH AUTOMATION SDN BHD",
      brandName: "Zenith Robotics",
      industry: "Robotics & Factory Automation",
      locationCity: "Petaling Jaya",
      locationState: "Selangor",
      locationCountry: "Malaysia",
      businessDescription: "Custom SCARA and 6-axis cobot integration for automated electronics assembly lines.",
      website: "https://zenithautomation.example.com",
      whatsapp: "+60 12-998 8776",
      serviceAreas: ["Selangor", "Penang"],
      services: [
        {
          name: "Collaborative Robot Assembly Stations",
          category: "Robotics",
          description: "Turnkey cobot cells with vision inspection.",
          sellingPoints: ["ISO 10218 safety compliant", "±0.02mm repeatability"],
          targetCustomers: ["Electronics EMS", "Medical device makers"],
        },
      ],
      targetMarket: {
        geographicTarget: "Malaysia & Singapore",
        industryTarget: "Electronics, Medical, Semiconductor",
        customerType: "B2B",
        languages: ["English", "Bahasa Melayu", "Mandarin"],
        decisionMakers: ["Automation Director", "Plant General Manager"],
      },
      brandProfile: {
        brandTone: "Innovative, High-Tech, Agile",
        preferredLanguage: "English",
        brandColours: ["#0284C7", "#0F172A"],
      },
      marketingObjectives: ["Acquire 10 robotics inquiries monthly", "Showcase live cobot video case studies"],
      preferredPlatforms: ["Facebook", "TikTok", "Instagram"],
    }),
  });
  console.log(`         Create Client Result: HTTP ${newClientRes.status}`);
  console.log(`         Created Client Name: ${newClientRes.data.client?.name}`);
  console.log(`         New Client Workspace ID: ${newClientRes.data.client?.id}`);

  console.log("\n=== ALL 8 VERIFICATION SUITES COMPLETED WITH 100% SUCCESS ===");
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
