import { ClientMarketingContext } from "./types";

/**
 * Factuality Guard & Unsupported Claim Detector (Sections 7 & 38)
 * Checks generated text against verified client marketing context.
 * Flags unverified claims regarding certifications, superlatives, guarantees, or prices.
 */
export function detectUnsupportedClaims(
  text: string,
  context: ClientMarketingContext
): string[] {
  if (!text) return [];

  const flaggedClaims: string[] = [];

  // Assemble full corpus of approved client text
  const approvedCorpus = [
    context.clientName,
    context.brandName,
    context.industry,
    context.businessDescription,
    context.brandProfile.brandPositioning,
    context.brandProfile.companySlogan,
    ...context.services.flatMap((s) => [s.name, s.description, ...s.sellingPoints, s.priceInfo || ""]),
    ...context.marketingObjectives,
    ...context.activePillars.flatMap((p) => [p.title, p.description]),
  ]
    .join(" ")
    .toLowerCase();

  // Pattern checks for prohibited invented claims
  const checkPatterns = [
    {
      regex: /\b(no\.?\s*1|number\s*one|best in malaysia|market leader|leading provider)\b/i,
      label: "Market leadership / 'No. 1' claim",
    },
    {
      regex: /\b(iso\s*\d+|certified by|sirim|halal certified|ce certified)\b/i,
      label: "Unverified certification claim",
    },
    {
      regex: /\b(\d+\s*years?\s+(?:of\s+)?experience|established since\s+\d{4})\b/i,
      label: "Specific years of experience claim",
    },
    {
      regex: /\b(24-?hour(?:s)?\s+(?:turnaround|delivery|response|service)|same-?day delivery)\b/i,
      label: "24-hour / Same-day delivery guarantee",
    },
    {
      regex: /\b(lowest price|cheapest in town|guaranteed discount|\d+%\s*off)\b/i,
      label: "Price guarantee or unverified discount claim",
    },
    {
      regex: /\b(100%\s*satisfaction guaranteed|zero error guarantee)\b/i,
      label: "Absolute satisfaction or zero-error guarantee",
    },
  ];

  for (const pattern of checkPatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      const matchedPhrase = match[0];
      // Check if this phrase is actually supported in the client's approved context
      if (!approvedCorpus.includes(matchedPhrase.toLowerCase())) {
        flaggedClaims.push(
          `Potential unsupported claim: "${matchedPhrase}" (${pattern.label}). Verify that client records explicitly document this claim before approval.`
        );
      }
    }
  }

  return flaggedClaims;
}

/**
 * Quality check evaluation (Section 37)
 */
export function evaluateContentQuality(
  captionOrVariant: string | { caption: string; platform?: any; headline?: string; hook?: string },
  platformOrContext: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" | ClientMarketingContext,
  contextParam?: ClientMarketingContext
) {
  let caption = "";
  let platform: "FACEBOOK" | "INSTAGRAM" | "TIKTOK" = "FACEBOOK";
  let context: ClientMarketingContext;

  if (typeof captionOrVariant === "string") {
    caption = captionOrVariant;
    platform = (platformOrContext as any) || "FACEBOOK";
    context = contextParam!;
  } else {
    caption = captionOrVariant?.caption || "";
    platform = (captionOrVariant?.platform as any) || "FACEBOOK";
    context = platformOrContext as ClientMarketingContext;
  }

  const suggestions: string[] = [];
  const unsupported = detectUnsupportedClaims(caption, context);

  // Check for CTA
  const hasCta =
    /\b(call|whatsapp|contact|enquire|dm|comment|link|visit|send|quote|get in touch|book|shop)\b/i.test(caption);
  if (!hasCta) {
    suggestions.push("Consider adding a clear call-to-action (CTA) to prompt client engagement.");
  }

  // Avoided words check
  const avoidedWords = context?.brandProfile?.avoidedWords || [];
  for (const word of avoidedWords) {
    if (word && caption.toLowerCase().includes(word.toLowerCase())) {
      suggestions.push(`Brand tone advisory: The phrase "${word}" matches the client's avoided words list.`);
    }
  }

  // Platform length guidelines
  if (platform === "TIKTOK" && caption.length > 500) {
    suggestions.push("TikTok captions perform best when concise (under 250 characters). Consider shortening the caption.");
  }

  if (platform === "FACEBOOK" && caption.length < 50) {
    suggestions.push("Facebook audiences respond well to slightly more context. Consider elaborating on the customer problem.");
  }

  return {
    hasCta,
    brandToneMatch: suggestions.length === 0,
    languageMatch: true,
    isFactuallySound: unsupported.length === 0,
    potentialUnsupportedClaims: unsupported,
    unverifiedClaims: unsupported,
    suggestions,
    score: Math.max(10, 100 - unsupported.length * 20 - (hasCta ? 0 : 15)),
    overallScore: Math.max(10, 100 - unsupported.length * 20 - (hasCta ? 0 : 15)),
  };
}
