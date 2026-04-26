import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for Vercel deployments
  debug: true, // Enable debug logging in Vercel function logs
  pages: {
    error: "/auth-error",
  },
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID ?? "",
      clientSecret: process.env.LINE_CHANNEL_SECRET ?? "",
      // LINE 已改用 ES256 簽 id_token，next-auth 預設 HS256 會配置失敗
      client: { id_token_signed_response_alg: "ES256" },
    }),
  ],
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
