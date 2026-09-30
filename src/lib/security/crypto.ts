import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

function getEncryptionKey(): Buffer {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY || "scc_default_secure_dev_key_32_bytes_len_!";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a sensitive token string using AES-256-GCM
 * Output format: base64(iv:tag:ciphertext)
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64url");
}

/**
 * Decrypt a sensitive token ciphertext using AES-256-GCM
 */
export function decryptToken(ciphertextStr: string): string {
  if (!ciphertextStr) return "";
  const key = getEncryptionKey();
  
  // Clean potential URL encoding or whitespace
  const sanitized = decodeURIComponent(ciphertextStr).trim();
  let combined = Buffer.from(sanitized, "base64url");
  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    combined = Buffer.from(sanitized, "base64");
  }

  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid ciphertext: payload too short");
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encryptedText = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

export interface OAuthStatePayload {
  userId: string;
  organizationId: string;
  clientId: string;
  platform: "FACEBOOK" | "INSTAGRAM";
  action: "CONNECT" | "RECONNECT";
  socialAccountId?: string;
  createdAt: number;
  expiresAt: number;
  nonce: string;
}

/**
 * Create a tamper-proof encrypted OAuth state parameter with built-in expiry
 */
export function createOAuthState(payload: Omit<OAuthStatePayload, "createdAt" | "expiresAt" | "nonce">, ttlSeconds: number = 900): string {
  const now = Date.now();
  const fullPayload: OAuthStatePayload = {
    ...payload,
    createdAt: now,
    expiresAt: now + ttlSeconds * 1000,
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const jsonStr = JSON.stringify(fullPayload);
  return encryptToken(jsonStr);
}

/**
 * Decrypt and verify an OAuth state parameter
 * Enforces tamper-proofing and expiration window
 */
export function verifyOAuthState(stateString: string): OAuthStatePayload {
  if (!stateString || typeof stateString !== "string") {
    throw new Error("OAuth state is missing or invalid");
  }

  let decryptedJson: string;
  try {
    decryptedJson = decryptToken(stateString);
  } catch {
    throw new Error("OAuth state could not be verified or was tampered with");
  }

  let payload: OAuthStatePayload;
  try {
    payload = JSON.parse(decryptedJson);
  } catch {
    throw new Error("OAuth state format corrupted");
  }

  if (!payload.userId || !payload.clientId || !payload.organizationId || !payload.platform) {
    throw new Error("OAuth state missing required tenant bindings");
  }

  if (Date.now() > payload.expiresAt) {
    throw new Error("OAuth state has expired. Please initiate the connection again.");
  }

  return payload;
}
