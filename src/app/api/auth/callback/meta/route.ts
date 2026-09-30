import { NextRequest, NextResponse } from "next/server";
import { verifyOAuthState, encryptToken } from "@/lib/security/crypto";
import { MetaProvider } from "@/lib/social/MetaProvider";
import { FacebookProvider } from "@/lib/social/FacebookProvider";
import { InstagramProvider } from "@/lib/social/InstagramProvider";
import { requirePermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // 1. Handle user cancellation or denial from Meta dialog
  if (error) {
    const errorMsg = errorDescription || error || "Authorization was cancelled by user.";
    return NextResponse.redirect(
      new URL(`/clients?error=oauth_cancelled&message=${encodeURIComponent(errorMsg)}`, req.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/clients?error=missing_params&message=Authorization%20code%20or%20state%20missing.", req.url)
    );
  }

  // 2. Validate and unpack cryptographic state
  let statePayload;
  try {
    statePayload = verifyOAuthState(state);
  } catch (stateErr: any) {
    return NextResponse.redirect(
      new URL(`/clients?error=invalid_state&message=${encodeURIComponent(stateErr.message)}`, req.url)
    );
  }

  const { clientId, platform, userId, organizationId, action, socialAccountId } = statePayload;

  // 3. Verify server-side authorization for the authenticated user and target client
  try {
    await requirePermission(clientId, "social_accounts:manage");
  } catch (authErr: any) {
    return NextResponse.redirect(
      new URL(
        `/clients/${clientId}/social-accounts?error=forbidden&message=${encodeURIComponent(authErr.message)}`,
        req.url
      )
    );
  }

  // 4. Exchange code for long-lived user token
  let userAccessToken: string;
  try {
    userAccessToken = await MetaProvider.exchangeCodeForLongLivedUserToken(code);
  } catch (tokenErr: any) {
    return NextResponse.redirect(
      new URL(
        `/clients/${clientId}/social-accounts?error=token_exchange_failed&message=${encodeURIComponent(
          tokenErr.message
        )}`,
        req.url
      )
    );
  }

  // 5. Discover accounts available through this authorization
  let discoveredAccounts = [];
  try {
    if (platform === "FACEBOOK") {
      discoveredAccounts = await FacebookProvider.discoverPages(userAccessToken);
    } else {
      discoveredAccounts = await InstagramProvider.discoverInstagramAccounts(userAccessToken);
    }
  } catch (discErr: any) {
    return NextResponse.redirect(
      new URL(
        `/clients/${clientId}/social-accounts?error=discovery_failed&message=${encodeURIComponent(
          discErr.message
        )}`,
        req.url
      )
    );
  }

  if (discoveredAccounts.length === 0) {
    const emptyMsg =
      platform === "FACEBOOK"
        ? "No Facebook Pages found. Make sure your Meta account administers at least one Page."
        : "No Instagram Professional accounts found. Please ensure an Instagram Business or Creator account is linked to your Facebook Page.";
    return NextResponse.redirect(
      new URL(
        `/clients/${clientId}/social-accounts?error=no_accounts&platform=${platform}&message=${encodeURIComponent(
          emptyMsg
        )}`,
        req.url
      )
    );
  }

  // 6. Securely package discovery session (encrypt each account's token at rest)
  const secureAccounts = discoveredAccounts.map((acc) => ({
    ...acc,
    accessTokenEncrypted: encryptToken(acc.accessToken),
    accessToken: undefined, // strip raw token from session
  }));

  const sessionData = {
    userId,
    organizationId,
    clientId,
    platform,
    action,
    socialAccountId,
    accounts: secureAccounts,
    timestamp: Date.now(),
  };

  const encryptedSession = encryptToken(JSON.stringify(sessionData));

  // 7. Store encrypted session cookie and redirect to client social accounts page
  const response = NextResponse.redirect(
    new URL(
      `/clients/${clientId}/social-accounts?select_platform=${platform}&status=discovery_ready`,
      req.url
    )
  );

  response.cookies.set("scc_meta_discovery", encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes to select account
  });

  return response;
}
