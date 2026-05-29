import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    error: "/auth-error",
  },
  providers: [
    LineProvider({
      clientId: process.env.LINE_CHANNEL_ID ?? "",
      clientSecret: process.env.LINE_CHANNEL_SECRET ?? "",
      authorization: {
        params: {
          // 只要 profile + openid (Channel 通常沒開 email 權限,加 email 會 400)
          // 不設 prompt — 讓 LINE 預設行為決定是否觸發 app handoff
          scope: "profile openid",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.lineUserId = profile.sub;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.lineUserId && session.user) {
        (session.user as { lineUserId?: string }).lineUserId =
          token.lineUserId as string;
      }
      return session;
    },
  },
});
