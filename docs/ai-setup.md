# Google Gemini AI Integration & Setup Guide

This document describes how to configure Google Gemini AI for the client-specific **AI Content Studio** in the Social Command Center platform.

---

## 1. Overview & Architecture

The AI Content Studio uses a server-side abstraction layer:
```
UI (Client Component)
       ↓
Content API (/api/clients/[clientId]/content/ai/...)
       ↓
Context Builder (buildClientMarketingContext)
       ↓
Factuality Guard & Prompt Engine (buildPrompt)
       ↓
GeminiProvider (Google Gemini API)
```

**Key Safety Principles:**
1. **Confidential Client Isolation**: Prompts are strictly constructed on the server using only the authorized client's verified data.
2. **Zero Inventions**: The prompt engine enforces factuality rules forbidding the model from inventing pricing, certifications, years of experience, or delivery guarantees.
3. **No Secret Exposure**: The `GEMINI_API_KEY` is never transmitted to the browser.
4. **Draft Resiliency**: If the Gemini API experiences network timeouts, rate limits, or is unconfigured, the system automatically falls back to deterministic context synthesis so drafts are never lost.

---

## 2. Environment Variables Configuration

Add the following variables to your `.env` file:

```env
# Google Gemini API Key (Obtain from https://aistudio.google.com/)
GEMINI_API_KEY="your_gemini_api_key_here"

# Model Configuration (Default is gemini-2.5-flash for optimal speed and cost)
GEMINI_MODEL="gemini-2.5-flash"
```

### Supported Models:
- `gemini-2.5-flash` (Recommended): Fast response times, high quality for copywriting, low token cost.
- `gemini-1.5-pro`: Deep multimodal reasoning for complex multi-page document synthesis.

---

## 3. Rate Limits & Quotas

- **Free Tier (Google AI Studio)**:
  - 15 RPM (Requests Per Minute)
  - 1 Million TPM (Tokens Per Minute)
  - 1,500 RPD (Requests Per Day)
- **Production (Pay-as-you-go / Google Cloud Vertex AI)**:
  - Set up budget alerts in the Google Cloud Console.
  - The system automatically records token usage in `ai_generation_logs` (`inputTokens`, `outputTokens`) for internal agency auditing.

---

## 4. Unsupported Claim Detection

The AI engine includes an automated rule-based post-processor ([`src/lib/ai/factualityGuard.ts`](file:///Users/rms/Desktop/Ai%20Project/Ai%20Social%20Media/src/lib/ai/factualityGuard.ts)) that scans output copy for high-risk claims such as:
- *"No. 1 in Malaysia"* or *"Market leader"*
- *"ISO 9001 certified"* (unless explicitly in client records)
- *"24-hour delivery guarantee"*
- *"Lowest price guaranteed"*

Any claim not substantiated by client data is flagged in the UI for mandatory reviewer scrutiny before approval.
