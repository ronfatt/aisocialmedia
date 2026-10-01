import { ClientMarketingContext, GenerateVariantRequest } from "./types";

export const PROMPT_VERSION = "content-v1";

/**
 * Reusable AI prompt construction engine (Section 33)
 */
export function buildPrompt(req: GenerateVariantRequest, context: ClientMarketingContext): {
  systemPrompt: string;
  userPrompt: string;
} {
  const language = req.language || context.brandProfile.preferredLanguage || "English";

  const systemPrompt = `You are an expert Social Media Copywriter and Strategist for marketing agencies.
You create authentic, high-converting social media content for B2B and B2C clients.

CRITICAL FACTUALITY RULES (STRICTLY ENFORCED):
1. NEVER invent unverified business facts, pricing, certifications, awards, years of experience, or delivery guarantees.
2. If specific details (e.g. turnaround time or exact price) are not explicitly given in the client context, use neutral phrasing such as "Contact us to discuss your requirements" or "Custom specifications available".
3. NEVER make unsupported superlative claims such as "No. 1 in Malaysia", "best in town", or "lowest price guaranteed" unless present in the client context.
4. Strictly respect the client's brand tone (${context.brandProfile.brandTone}) and avoid words in their avoided list: [${context.brandProfile.avoidedWords.join(", ")}].
5. Respond ONLY with valid, raw JSON without markdown code fences or backticks.`;

  const clientContextText = `
=== CLIENT KNOWLEDGE BASE ===
Company Name: ${context.clientName}
Brand Name: ${context.brandName}
Industry: ${context.industry}
Location: ${context.locationCity}, ${context.locationState}, ${context.locationCountry}
Business Overview: ${context.businessDescription}

Active Services / Products:
${context.services
  .map(
    (s) =>
      `- ${s.name} (${s.category}): ${s.description} | Target: ${s.targetCustomer} | Key Selling Points: ${s.sellingPoints.join("; ")}`
  )
  .join("\n")}

Target Audience & Market:
- Geographic Focus: ${context.targetMarket.geographicTarget}
- Industry Focus: ${context.targetMarket.industryTarget}
- Buyer Persona: ${context.targetMarket.buyerPersona}
- Decision Makers: ${context.targetMarket.decisionMakers.join(", ")}

Brand Profile:
- Positioning: ${context.brandProfile.brandPositioning}
- Brand Tone: ${context.brandProfile.brandTone}
- Preferred CTA: ${context.brandProfile.preferredCta}
- Company Slogan: ${context.brandProfile.companySlogan || "None"}

Current Marketing Objectives:
${context.marketingObjectives.map((o) => `- ${o}`).join("\n")}

${context.campaign ? `Active Campaign: ${context.campaign.name} (${context.campaign.objective || ""})` : ""}
`;

  const platformInstructions = {
    FACEBOOK: `
PLATFORM REQUIREMENTS (FACEBOOK):
- Format: Engaging Headline, context-rich Body Caption with customer problem & solution, clear Call to Action (CTA), and 2-4 strategic hashtags.
- Tone: Informative, community-minded, solution-oriented.
- Output JSON Keys: "headline", "caption", "cta", "hashtags"`,
    INSTAGRAM: `
PLATFORM REQUIREMENTS (INSTAGRAM):
- Format: High-impact Opening Hook (first 1-2 lines), punchy visual-first caption with clean line breaks, clear CTA, and 5-10 relevant hashtags.
- Tone: Inspiring, visually descriptive, direct.
- Output JSON Keys: "hook", "caption", "cta", "hashtags"`,
    TIKTOK: `
PLATFORM REQUIREMENTS (TIKTOK):
- Format: Attention-grabbing Video Hook (0-3s), On-screen Text suggestion, short video idea/visual angle, concise caption (under 150 chars), clear CTA, and 3-5 trending/niche hashtags.
- Tone: Fast-paced, punchy, conversational, trend-aware.
- Output JSON Keys: "hook", "onScreenText", "videoIdea", "caption", "cta", "hashtags"`,
    TWITTER: `
PLATFORM REQUIREMENTS (TWITTER / X):
- Format: Punchy First-Line Hook (under 280 characters or micro-thread), high-conviction institutional/quant tone, crisp bulleted points, cashtags if relevant, 2-3 focused hashtags (e.g. #Quant #Alpha #AI #DeFi), and verifiable on-chain hash reference or CTA.
- Tone: Ultra-sharp, mathematical, authoritative, no-BS, high-conviction cyber-financial.
- Output JSON Keys: "hook", "caption", "cta", "hashtags"`,
  }[req.platform];

  const languageInstructions = `
LANGUAGE REQUIREMENTS:
- Primary Output Language: ${language}
${
  language.includes("+")
    ? `- This is a BILINGUAL post. Provide copy clearly structured in both languages (e.g. English first, followed by the secondary language translation or natural bilingual flow).`
    : `- Write exclusively in ${language}. Do not mix languages unless standard local industry terminology.`
}`;

  const taskAction = req.action && req.action !== "GENERATE"
    ? `SPECIFIC ACTION: ${req.action} the current draft: "${req.currentCaption || ""}"`
    : `ACTION: Create a brand new ${req.platform} post variant.`;

  const userPrompt = `
${clientContextText}

=== MASTER CONTENT BRIEF ===
Title: ${req.title}
Core Idea: ${req.coreMessage}
Objective: ${req.objective || context.marketingObjectives[0] || "Generate enquiries"}
Content Pillar: ${req.contentPillar || "Product / Service"}
Target Audience: ${req.targetAudience || context.targetMarket.buyerPersona}
Target Location: ${req.targetLocation || context.targetMarket.geographicTarget}
Products / Services Featured: ${req.productsServices || context.services[0]?.name || "All services"}
Specified CTA: ${req.callToAction || context.brandProfile.preferredCta}
${req.internalBrief ? `Internal Brief Notes: ${req.internalBrief}` : ""}

${platformInstructions}

${languageInstructions}

${taskAction}

Provide the response strictly as a JSON object with the requested keys matching the platform specification.
`;

  return { systemPrompt, userPrompt };
}
