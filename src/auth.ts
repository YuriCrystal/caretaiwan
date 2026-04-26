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
