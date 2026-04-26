import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

// LINE 實際上用 HS256 簽 id_token（用 channel secret 做 HMAC），保留 next-auth 預設值
const linePatched = LineProvider({
  clientId: process.env.LINE_CHANNEL_ID ?? "",
  clientSecret: process.env.LINE_CHANNEL_SECRET ?? "",
});

// Capture last logged error for diagnostic exposure
const lastErrors: { time: string; code: string; message: string; cause?: unknown }[] = [];
export function getRecentAuthErrors() {
  return lastErrors.slice(-10);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: true,
  secret: process.env.AUTH_SECRET, // explicit (v5 reads AUTH_SECRET by default but be explicit)
  pages: {
    error: "/auth-error",
  },
  logger: {
    error(error: Error & { code?: string; cause?: unknown }) {
      lastErrors.push({
        time: new Date().toISOString(),
        code: error?.name ?? error?.code ?? "Error",
        message: error?.message ?? String(error),
        cause:
          typeof error?.cause === "object"
            ? JSON.stringify(error.cause).slice(0, 500)
            : String(error?.cause ?? ""),
      });
      if (lastErrors.length > 50) lastErrors.shift();
      console.error("[NextAuth Error]", error);
    },
    warn(code: string) {
      console.warn("[NextAuth Warn]", code);
    },
    debug(code: string, metadata?: unknown) {
      console.log("[NextAuth Debug]", code, metadata);
    },
  },
  providers: [linePatched],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        // LINE profile has sub (LINE userId), name, picture
        token.lineUserId = profile.sub;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.lineUserId && session.user) {
        // Surface LINE userId on session for client
        (session.user as { lineUserId?: string }).lineUserId =
          token.lineUserId as string;
      }
      return session;
    },
  },
});
