import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

// Patch LineProvider to override hardcoded HS256 with ES256 (LINE's actual spec)
const linePatched = LineProvider({
  clientId: process.env.LINE_CHANNEL_ID ?? "",
  clientSecret: process.env.LINE_CHANNEL_SECRET ?? "",
});
// Force-overwrite the client config (deep merge can't replace nested defaults reliably here)
(linePatched as { client?: Record<string, unknown> }).client = {
  id_token_signed_response_alg: "ES256",
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  debug: true,
  pages: {
    error: "/auth-error",
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
