import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const BASE_SCOPES = [
  "openid",
  "email",
  "profile",
].join(" ");

const INTEGRATION_SCOPES = [
  BASE_SCOPES,
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/tasks",
].join(" ");

interface ExtendedToken {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes?: string;
  provider?: "google" | "google-integration";
  error?: string;
  picture?: string;
  name?: string;
  email?: string;
}

function getGoogleClient(provider: ExtendedToken["provider"]) {
  const isIntegration = provider === "google-integration";
  return {
    clientId: isIntegration
      ? process.env.AUTH_GOOGLE_INTEGRATION_ID ?? process.env.AUTH_GOOGLE_ID ?? ""
      : process.env.AUTH_GOOGLE_ID ?? "",
    clientSecret: isIntegration
      ? process.env.AUTH_GOOGLE_INTEGRATION_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? ""
      : process.env.AUTH_GOOGLE_SECRET ?? "",
  };
}

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    if (!token.refreshToken) throw new Error("missing refresh token");
    const client = getGoogleClient(token.provider);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: client.clientId,
        client_secret: client.clientSecret,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "refresh failed");
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (e) {
    return { ...token, error: "RefreshError" };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      id: "google",
      name: "Google",
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: BASE_SCOPES,
        },
      },
    }),
    Google({
      id: "google-integration",
      name: "Google Calendar / Tasks",
      clientId:
        process.env.AUTH_GOOGLE_INTEGRATION_ID ?? process.env.AUTH_GOOGLE_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_INTEGRATION_SECRET ?? process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: INTEGRATION_SCOPES,
          access_type: "offline",
          prompt: "consent",
          include_granted_scopes: "true",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      const t = token as unknown as ExtendedToken;
      if (account && profile) {
        t.accessToken = account.access_token;
        t.refreshToken = account.refresh_token;
        t.expiresAt = account.expires_at;
        t.scopes = account.scope;
        t.provider = account.provider as ExtendedToken["provider"];
        t.email = profile.email as string | undefined;
        t.name = profile.name as string | undefined;
        t.picture = (profile as { picture?: string }).picture;
      } else if (t.expiresAt && Date.now() / 1000 > t.expiresAt - 60) {
        return (await refreshAccessToken(t)) as typeof token;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as unknown as ExtendedToken;
      const scopedSession = session as unknown as {
        accessToken?: string;
        error?: string;
        scopes?: string;
        hasIntegrationAccess?: boolean;
      };
      // attach extra fields onto session (typed loosely)
      scopedSession.accessToken = t.accessToken;
      scopedSession.error = t.error;
      scopedSession.scopes = t.scopes;
      scopedSession.hasIntegrationAccess =
        !!t.scopes &&
        t.scopes.includes("https://www.googleapis.com/auth/calendar.events") &&
        t.scopes.includes("https://www.googleapis.com/auth/tasks");
      if (session.user) {
        session.user.name = t.name ?? session.user.name ?? null;
        session.user.email = t.email ?? session.user.email ?? null;
        session.user.image = t.picture ?? session.user.image ?? null;
      }
      return session;
    },
  },
});
