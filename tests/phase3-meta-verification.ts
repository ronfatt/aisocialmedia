import fs from "fs";
import path from "path";

// Load .env for test runner process
if (fs.existsSync(path.resolve(process.cwd(), ".env"))) {
  process.loadEnvFile?.(path.resolve(process.cwd(), ".env"));
}

import { db } from "../src/lib/db";
import { encryptToken, createOAuthState } from "../src/lib/security/crypto";

const BASE_URL = "http://localhost:3000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function runPhase3Tests() {
  console.log("==================================================================");
  console.log("   PHASE 3 META INTEGRATION VERIFICATION SUITE                    ");
  console.log("==================================================================\n");

  const adminHeaders = { Cookie: "scc_active_user=sarah.chen@apexmedia.io" };
  const amUserBHeaders = { Cookie: "scc_active_user=aisha.rahman@apexmedia.io" }; // Scoped to XYZ
  const viewerHeaders = { Cookie: "scc_active_user=rachel.adams@apexmedia.io" }; // Viewer

  // Resolve Client A (UXUI) and Client B (XYZ)
  const clientsRes = await request("/api/clients", { headers: adminHeaders });
  const uxui = clientsRes.data.clients?.find((c: any) => c.name === "UXUI HOLDINGS");
  const xyz = clientsRes.data.clients?.find((c: any) => c.name === "XYZ ENGINEERING");

  if (!uxui || !xyz) {
    throw new Error("Seed clients UXUI and XYZ not found!");
  }

  const clientAId = uxui.id;
  const clientBId = xyz.id;

  // -------------------------------------------------------------
  // TEST 1: Authorized Admin connects Facebook Page to Client A
  // -------------------------------------------------------------
  console.log("[TEST 1] Authorized Admin connects Facebook Page to Client A (UXUI):");
  const mockPageId = "fb_page_test_10928374";
  const mockPageName = "UXUI Metal Fabricators Official";
  const mockPageToken = "EAABmock_token_for_testing_purposes_only_valid_123456";

  // Create discovery session cookie simulating completion of Meta authorization
  const discoverySession = {
    userId: "cmunl5y1z0002eygl8ig0t7b9", // Sarah Chen
    organizationId: "org-apex",
    clientId: clientAId,
    platform: "FACEBOOK",
    action: "CONNECT",
    accounts: [
      {
        id: mockPageId,
        name: mockPageName,
        category: "Industrial Equipment",
        profilePictureUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=80",
        accountType: "PAGE",
        platform: "FACEBOOK",
        tasks: ["MANAGE", "CREATE_CONTENT"],
        accessTokenEncrypted: encryptToken(mockPageToken),
      },
    ],
    timestamp: Date.now(),
  };

  const discoveryCookie = `scc_meta_discovery=${encryptToken(JSON.stringify(discoverySession))}; scc_active_user=sarah.chen@apexmedia.io`;

  const selectRes = await request(`/api/clients/${clientAId}/social-accounts/meta/select`, {
    method: "POST",
    headers: { Cookie: discoveryCookie },
    body: JSON.stringify({
      selectedAccountId: mockPageId,
      platform: "FACEBOOK",
    }),
  });

  console.log(`         • Connect Selected Page: HTTP ${selectRes.status}`);
  if (selectRes.status !== 200) {
    throw new Error(`TEST 1 FAILED: Could not connect page: ${JSON.stringify(selectRes.data)}`);
  }

  // Verify social accounts in Client A
  const clientASocial = await request(`/api/clients/${clientAId}/social-accounts`, { headers: adminHeaders });
  const connectedFb = clientASocial.data.accounts?.find((a: any) => a.platform === "FACEBOOK");
  console.log(`         • Client A FB Status: ${connectedFb?.connectionStatus} | Page: "${connectedFb?.displayName}"`);
  if (connectedFb?.connectionStatus !== "CONNECTED" || connectedFb?.displayName !== mockPageName) {
    throw new Error("TEST 1 FAILED: Connected Facebook Page not reflected in Client A!");
  }
  console.log("         ✓ TEST 1 PASSED: Facebook Page connected and stored strictly under Client A.\n");

  // -------------------------------------------------------------
  // TEST 2: User without client access tries OAuth initiation
  // -------------------------------------------------------------
  console.log("[TEST 2] Unauthorized User (Aisha) tries OAuth initiation on Client A:");
  const unauthorizedInit = await request(
    `/api/clients/${clientAId}/social-accounts/meta/connect?platform=FACEBOOK`,
    { headers: amUserBHeaders }
  );
  console.log(`         • Unauthorized OAuth Init: HTTP ${unauthorizedInit.status} (Expected: 403)`);
  if (unauthorizedInit.status !== 403) {
    throw new Error(`TEST 2 FAILED: Unauthorized user was not rejected with 403! Status: ${unauthorizedInit.status}`);
  }
  console.log("         ✓ TEST 2 PASSED: Cross-client OAuth initiation properly rejected.\n");

  // -------------------------------------------------------------
  // TEST 3: OAuth callback contains invalid / tampered state
  // -------------------------------------------------------------
  console.log("[TEST 3] OAuth callback with invalid / tampered state:");
  const invalidStateRes = await request(
    "/api/auth/callback/meta?code=mock_oauth_code_123&state=tampered_corrupted_state_payload",
    { headers: adminHeaders }
  );
  const locationInvalid = invalidStateRes.headers.get("location") || "";
  console.log(`         • Response Status: HTTP ${invalidStateRes.status} | Redirect: ${locationInvalid}`);
  if (!locationInvalid.includes("error=invalid_state")) {
    throw new Error("TEST 3 FAILED: Tampered state was not caught by callback!");
  }
  console.log("         ✓ TEST 3 PASSED: Tampered state rejected safely.\n");

  // -------------------------------------------------------------
  // TEST 4: OAuth state expired
  // -------------------------------------------------------------
  console.log("[TEST 4] OAuth state expired (TTL exceeded):");
  // Create expired state
  const expiredState = createOAuthState(
    {
      userId: "cmunl5y1z0002eygl8ig0t7b9",
      organizationId: "org-apex",
      clientId: clientAId,
      platform: "FACEBOOK",
      action: "CONNECT",
    },
    -10 // Expired 10 seconds ago
  );

  const expiredStateRes = await request(
    `/api/auth/callback/meta?code=mock_oauth_code_123&state=${encodeURIComponent(expiredState)}`,
    { headers: adminHeaders }
  );
  const locationExpired = expiredStateRes.headers.get("location") || "";
  console.log(`         • Response Status: HTTP ${expiredStateRes.status} | Redirect: ${locationExpired}`);
  if (!locationExpired.includes("error=invalid_state") || !locationExpired.includes("expired")) {
    throw new Error("TEST 4 FAILED: Expired state was not caught by callback!");
  }
  console.log("         ✓ TEST 4 PASSED: Expired state rejected safely.\n");

  // -------------------------------------------------------------
  // TEST 5: Duplicate social account attempted on another client
  // -------------------------------------------------------------
  console.log("[TEST 5] Duplicate account prevention: Trying to connect Page A to Client B (XYZ):");
  const duplicateSession = {
    userId: "cmunl5y1z0002eygl8ig0t7b9",
    organizationId: "org-apex",
    clientId: clientBId, // Attempting on Client B
    platform: "FACEBOOK",
    action: "CONNECT",
    accounts: [
      {
        id: mockPageId, // SAME PAGE ID ALREADY CONNECTED TO CLIENT A!
        name: mockPageName,
        accountType: "PAGE",
        platform: "FACEBOOK",
        accessTokenEncrypted: encryptToken(mockPageToken),
      },
    ],
    timestamp: Date.now(),
  };

  const dupCookie = `scc_meta_discovery=${encryptToken(JSON.stringify(duplicateSession))}; scc_active_user=sarah.chen@apexmedia.io`;

  const duplicateAttempt = await request(`/api/clients/${clientBId}/social-accounts/meta/select`, {
    method: "POST",
    headers: { Cookie: dupCookie },
    body: JSON.stringify({
      selectedAccountId: mockPageId,
      platform: "FACEBOOK",
    }),
  });

  console.log(`         • Duplicate Connection Attempt: HTTP ${duplicateAttempt.status} (Expected: 409)`);
  console.log(`         • Error Payload: "${duplicateAttempt.data.error}"`);
  if (duplicateAttempt.status !== 409 || !duplicateAttempt.data.error.includes("already connected to another client")) {
    throw new Error(`TEST 5 FAILED: Duplicate account was not blocked with 409! Response: ${JSON.stringify(duplicateAttempt.data)}`);
  }
  console.log("         ✓ TEST 5 PASSED: Duplicate social account blocked from cross-client reassignment.\n");

  // -------------------------------------------------------------
  // TEST 6: Viewer clicks connect
  // -------------------------------------------------------------
  console.log("[TEST 6] Viewer role attempting to initiate connection:");
  const viewerAttempt = await request(
    `/api/clients/${clientAId}/social-accounts/meta/connect?platform=FACEBOOK`,
    { headers: viewerHeaders }
  );
  console.log(`         • Viewer OAuth Init: HTTP ${viewerAttempt.status} (Expected: 403)`);
  if (viewerAttempt.status !== 403) {
    console.log("DEBUG viewerAttempt.data:", viewerAttempt.data);
    throw new Error(`TEST 6 FAILED: Viewer was not blocked from initiating connection! HTTP ${viewerAttempt.status}`);
  }
  console.log("         ✓ TEST 6 PASSED: Viewer role denied management permission.\n");

  // -------------------------------------------------------------
  // TEST 7: Disconnect account
  // -------------------------------------------------------------
  console.log("[TEST 7] Disconnect account flow:");
  const accountToDisconnect = connectedFb.id;
  const disconnectRes = await request(
    `/api/clients/${clientAId}/social-accounts/${accountToDisconnect}/disconnect`,
    {
      method: "POST",
      headers: adminHeaders,
    }
  );
  console.log(`         • Disconnect Response: HTTP ${disconnectRes.status}`);
  if (disconnectRes.status !== 200) {
    throw new Error(`TEST 7 FAILED: Disconnect endpoint returned HTTP ${disconnectRes.status}`);
  }

  // Verify in database: status must be DISCONNECTED and accessTokenEncrypted must be null
  const dbAccount = await db.socialAccount.findUnique({ where: { id: accountToDisconnect } });
  console.log(`         • DB Status: ${dbAccount?.connectionStatus} | Token Cleared: ${dbAccount?.accessTokenEncrypted === null}`);
  if (dbAccount?.connectionStatus !== "DISCONNECTED" || dbAccount?.accessTokenEncrypted !== null) {
    throw new Error("TEST 7 FAILED: Account credentials were not cleared or status was not DISCONNECTED!");
  }
  console.log("         ✓ TEST 7 PASSED: Disconnect flow marked account DISCONNECTED and purged stored tokens.\n");

  // -------------------------------------------------------------
  // TEST 8: Token privacy: No raw tokens returned in frontend API
  // -------------------------------------------------------------
  console.log("[TEST 8] Frontend API Token Privacy Check:");
  // Re-connect Facebook for privacy payload inspection
  await request(`/api/clients/${clientAId}/social-accounts/meta/select`, {
    method: "POST",
    headers: { Cookie: discoveryCookie },
    body: JSON.stringify({
      selectedAccountId: mockPageId,
      platform: "FACEBOOK",
    }),
  });

  const apiRes = await request(`/api/clients/${clientAId}/social-accounts`, { headers: adminHeaders });
  const rawJson = JSON.stringify(apiRes.data);

  const containsTokenKeyword =
    rawJson.includes(mockPageToken) ||
    rawJson.includes("accessTokenEncrypted") ||
    rawJson.includes("refreshTokenEncrypted") ||
    rawJson.includes("EAABmock");

  console.log(`         • Raw Token Exposed in Frontend Response: ${containsTokenKeyword} (Expected: false)`);
  if (containsTokenKeyword) {
    throw new Error("TEST 8 CRITICAL SECURITY BREACH: Raw or encrypted token leaked in API response!");
  }
  console.log("         ✓ TEST 8 PASSED: Zero token exposure to client-side code.\n");

  // -------------------------------------------------------------
  // TEST 9: Client Isolation Check (Client B must never see Client A accounts)
  // -------------------------------------------------------------
  console.log("[TEST 9] Client Isolation Check (Client B vs Client A accounts):");
  const clientBSocial = await request(`/api/clients/${clientBId}/social-accounts`, { headers: adminHeaders });
  const clientBHasClientAPage = clientBSocial.data.accounts?.some(
    (a: any) => a.platformAccountId === mockPageId || a.displayName === mockPageName
  );
  console.log(`         • Client B Contains Client A Page: ${clientBHasClientAPage} (Expected: false)`);
  if (clientBHasClientAPage) {
    throw new Error("TEST 9 FAILED: Client A's connected page leaked into Client B!");
  }
  console.log("         ✓ TEST 9 PASSED: Complete client isolation confirmed across social accounts.\n");

  console.log("==================================================================");
  console.log("   ALL 9 META INTEGRATION TESTS PASSED PERFECTLY (100%)           ");
  console.log("==================================================================");
}

runPhase3Tests().catch((err) => {
  console.error("Phase 3 Verification Failed:", err);
  process.exit(1);
});
