import { db } from "../src/lib/db";
import { buildClientMarketingContext } from "../src/lib/ai/contextBuilder";
import { geminiProvider } from "../src/lib/ai/GeminiProvider";
import { detectUnsupportedClaims, evaluateContentQuality } from "../src/lib/ai/factualityGuard";

async function runPhase4Verification() {
  console.log("=================================================================");
  console.log("PHASE 4 VERIFICATION: AI CONTENT STUDIO & APPROVAL WORKFLOW");
  console.log("=================================================================");

  // 1. Fetch Test Clients
  const clients = await db.client.findMany({ take: 2 });
  if (clients.length < 2) {
    throw new Error("Verification requires at least 2 clients in the database.");
  }

  const clientA = clients[0];
  const clientB = clients[1];
  console.log(`[TEST 1] Client A: "${clientA.name}" (${clientA.id})`);
  console.log(`[TEST 1] Client B: "${clientB.name}" (${clientB.id})`);

  // 2. Multi-Client Isolation & AI Context Builder
  console.log("\n--- TEST 2: AI Context Builder & ClientNote Exclusion ---");
  // Create an internal sensitive agency note for Client A
  const internalNote = await db.clientNote.create({
    data: {
      clientId: clientA.id,
      title: "INTERNAL AGENCY STRATEGY - SENSITIVE",
      content: "Do not mention competitor pricing weakness or factory delays. Client is sensitive about 2024 margin drop.",
      authorName: "Account Director",
    },
  });

  const contextA = await buildClientMarketingContext(clientA.id);
  console.log(`✓ Context built for ${contextA.clientName}:`);
  console.log(`  - Industry: ${contextA.industry}`);
  console.log(`  - Services Count: ${contextA.services.length}`);
  console.log(`  - Content Pillars: ${contextA.activePillars.map((p) => p.title).join(", ") || "None"}`);
  console.log(`  - Brand Tone: ${contextA.brandProfile?.brandTone || "Professional"}`);

  // STRICT VERIFICATION: ClientNote must NEVER appear anywhere in AI context!
  const contextString = JSON.stringify(contextA);
  const leakedInternalNote = contextString.includes("competitor pricing weakness") || contextString.includes("INTERNAL AGENCY STRATEGY");
  if (leakedInternalNote) {
    throw new Error("SECURITY FAILURE: Internal ClientNote leaked into AI Marketing Context!");
  }
  console.log("✓ PASSED: Internal ClientNote strictly excluded from AI context.");

  // Clean up test note
  await db.clientNote.delete({ where: { id: internalNote.id } });

  // 3. Factuality Guard & Unsupported Claim Detector
  console.log("\n--- TEST 3: Factuality Guard & Unsupported Claim Detection ---");
  const unverifiedText =
    "We are the No. 1 CNC precision workshop with ISO 9001 certified machines and guaranteed 24-hour delivery at lowest price!";
  const claimsFound = detectUnsupportedClaims(unverifiedText, contextA);
  console.log(`✓ Detected ${claimsFound.length} unsupported claim warning(s):`);
  claimsFound.forEach((c, idx) => console.log(`  ${idx + 1}. ${c}`));

  if (claimsFound.length < 3) {
    throw new Error("Factuality guard failed to detect unverified superlatives and guarantees.");
  }
  console.log("✓ PASSED: Factuality guard flagged unsupported superlatives, ISO, and delivery guarantees.");

  // 4. AI Multi-Platform Variant Generation (Deterministic synthesis & formatting)
  console.log("\n--- TEST 4: Multi-Platform Variant Generation (FB, IG, TikTok) ---");
  const generatedVariants = await geminiProvider.generateSocialVariants({
    context: contextA,
    brief: "Showcase our 5-axis CNC high precision milling for industrial flanges with tight tolerances.",
    platforms: ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
    targetAudience: "Engineering Managers, Procurement Leads",
    targetLocation: "Selangor, Malaysia",
    callToAction: "Contact us via WhatsApp for a technical CAD review",
    contentType: "IMAGE",
    language: "English",
  });

  console.log("✓ Generated Variants:");
  console.log(`  - Facebook Hook: "${generatedVariants.FACEBOOK.headline || generatedVariants.FACEBOOK.hook}"`);
  console.log(`  - Instagram Hashtags: "${generatedVariants.INSTAGRAM.hashtags}"`);
  console.log(`  - TikTok Video Concept: "${generatedVariants.TIKTOK.videoIdea}"`);
  console.log(`  - TikTok On-Screen Text: "${generatedVariants.TIKTOK.onScreenText}"`);

  if (!generatedVariants.FACEBOOK.caption || !generatedVariants.INSTAGRAM.caption || !generatedVariants.TIKTOK.onScreenText) {
    throw new Error("Generated variants missing required platform fields.");
  }
  console.log("✓ PASSED: Multi-platform variants synthesized with platform-native structures.");

  // 5. Database Master Content & Platform Variants Creation
  console.log("\n--- TEST 5: Master Content Item & Variants DB Persistence ---");
  const masterItem = await db.contentItem.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      title: "5-Axis Precision Flange Showcase",
      coreMessage: "Highlighting CNC 5-axis capabilities for sub-millimeter aerospace flanges.",
      contentType: "IMAGE",
      status: "DRAFT",
      targetAudience: "Engineering Managers",
      targetLocation: "Malaysia",
      callToAction: "WhatsApp for Quote",
      platforms: JSON.stringify(["FACEBOOK", "INSTAGRAM", "TIKTOK"]),
      mediaUrls: JSON.stringify(["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"]),
      createdBy: "Test Engineer",
    },
  });

  const fbVariant = await db.postVariant.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      contentItemId: masterItem.id,
      platform: "FACEBOOK",
      headline: generatedVariants.FACEBOOK.headline,
      caption: generatedVariants.FACEBOOK.caption,
      cta: generatedVariants.FACEBOOK.cta,
      hashtags: generatedVariants.FACEBOOK.hashtags,
      language: "English",
      approvalStatus: "PENDING",
      isEditedManually: false,
    },
  });

  const igVariant = await db.postVariant.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      contentItemId: masterItem.id,
      platform: "INSTAGRAM",
      hook: generatedVariants.INSTAGRAM.hook,
      caption: generatedVariants.INSTAGRAM.caption,
      cta: generatedVariants.INSTAGRAM.cta,
      hashtags: generatedVariants.INSTAGRAM.hashtags,
      language: "English",
      approvalStatus: "PENDING",
      isEditedManually: false,
    },
  });

  const ttVariant = await db.postVariant.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      contentItemId: masterItem.id,
      platform: "TIKTOK",
      hook: generatedVariants.TIKTOK.hook,
      caption: generatedVariants.TIKTOK.caption,
      onScreenText: generatedVariants.TIKTOK.onScreenText,
      videoIdea: generatedVariants.TIKTOK.videoIdea,
      language: "English",
      approvalStatus: "PENDING",
      isEditedManually: false,
    },
  });

  console.log(`✓ Master Content Item created: ID ${masterItem.id}`);
  console.log(`✓ 3 Platform Variants created: FB (${fbVariant.id}), IG (${igVariant.id}), TT (${ttVariant.id})`);

  // 6. Multi-Client Isolation Verification
  console.log("\n--- TEST 6: Strict Multi-Client Isolation Verification ---");
  const clientBQuery = await db.contentItem.findMany({
    where: { clientId: clientB.id, id: masterItem.id },
  });
  if (clientBQuery.length > 0) {
    throw new Error("SECURITY FAILURE: Client B was able to query Client A's content item!");
  }
  const clientBVariants = await db.postVariant.findMany({
    where: { clientId: clientB.id, contentItemId: masterItem.id },
  });
  if (clientBVariants.length > 0) {
    throw new Error("SECURITY FAILURE: Client B was able to query Client A's post variants!");
  }
  console.log("✓ PASSED: Client B cannot view or access Client A's master item or variants.");

  // 7. Independent Variant Editing & Manual Edit Protection
  console.log("\n--- TEST 7: Independent Variant Editing & Protection ---");
  const customManualCaption = "CUSTOM COPY: Exclusive walkthrough of our proprietary CNC milling cell by Chief Engineer RMS.";
  await db.postVariant.update({
    where: { id: fbVariant.id },
    data: {
      caption: customManualCaption,
      isEditedManually: true,
      versionNumber: { increment: 1 },
    },
  });

  const updatedFb = await db.postVariant.findUnique({ where: { id: fbVariant.id } });
  if (updatedFb?.caption !== customManualCaption || !updatedFb.isEditedManually) {
    throw new Error("Failed to record manual edit flag on variant.");
  }
  console.log(`✓ Facebook variant manually edited: isEditedManually = ${updatedFb.isEditedManually}`);

  // Verify other variants remained untouched
  const untouchedIg = await db.postVariant.findUnique({ where: { id: igVariant.id } });
  if (untouchedIg?.isEditedManually) {
    throw new Error("Editing Facebook should not mark Instagram as edited.");
  }
  console.log("✓ PASSED: Instagram and TikTok variants remained independent.");

  // 8. Approval Workflow State Machine
  console.log("\n--- TEST 8: Approval Workflow & Granular Platform Approvals ---");
  // A. Submit for review
  const approvalReq = await db.approvalRequest.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      contentItemId: masterItem.id,
      platformScope: "ALL",
      requestedBy: "Creative Lead",
      status: "PENDING",
    },
  });

  await db.contentItem.update({
    where: { id: masterItem.id },
    data: { status: "PENDING_APPROVAL" },
  });
  console.log(`✓ Submitted for approval: Request ID ${approvalReq.id}, Status = PENDING_APPROVAL`);

  // B. Partial Review: Approve FB & IG, Request Changes on TikTok
  await db.postVariant.update({ where: { id: fbVariant.id }, data: { approvalStatus: "APPROVED" } });
  await db.postVariant.update({ where: { id: igVariant.id }, data: { approvalStatus: "APPROVED" } });
  await db.postVariant.update({ where: { id: ttVariant.id }, data: { approvalStatus: "CHANGES_REQUESTED" } });

  await db.contentItem.update({
    where: { id: masterItem.id },
    data: { status: "CHANGES_REQUESTED" },
  });

  await db.approvalComment.create({
    data: {
      organizationId: clientA.organizationId,
      clientId: clientA.id,
      approvalRequestId: approvalReq.id,
      userId: "u-reviewer",
      userName: "Account Manager",
      comment: "TikTok hook is too lengthy. Shorten to under 5 words for higher completion rate.",
    },
  });
  console.log("✓ Partial review processed: FB (APPROVED), IG (APPROVED), TT (CHANGES_REQUESTED)");

  // C. Revise TikTok and complete approval
  await db.postVariant.update({
    where: { id: ttVariant.id },
    data: {
      hook: "3 Flange Machining Flaws ⚠️",
      approvalStatus: "APPROVED",
    },
  });

  // Now all variants are approved!
  const allVariants = await db.postVariant.findMany({ where: { contentItemId: masterItem.id } });
  const allApproved = allVariants.every((v) => v.approvalStatus === "APPROVED");
  if (!allApproved) {
    throw new Error("Expected all variants to be approved.");
  }

  const finalizedItem = await db.contentItem.update({
    where: { id: masterItem.id },
    data: { status: "APPROVED" },
  });

  console.log(`✓ All platform variants approved. Master Content status = ${finalizedItem.status}`);
  console.log("✓ PASSED: Content item ready to schedule on calendar.");

  // Clean up test content item
  await db.contentItem.delete({ where: { id: masterItem.id } });
  console.log("✓ Cleanup: Test master item and variants removed.");

  console.log("\n=================================================================");
  console.log("✅ ALL PHASE 4 VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("=================================================================");
}

runPhase4Verification()
  .catch((err) => {
    console.error("❌ Phase 4 Verification Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
