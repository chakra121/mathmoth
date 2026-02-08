import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://mathmoth-api.vercel.app"
    : "http://localhost:8000";

const handler = NextAuth({
  providers: [
    // ✅ Credentials (Admin + Student)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const user = await res.json();

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          slug: user.slug,
        };
      },
    }),

    // ✅ Google OAuth (Students only)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        const res = await fetch(`${BACKEND_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
          }),
        });

        if (!res.ok) {
          // 🔥 prevents JSON parse crash
          console.error("Backend Google auth failed");
          throw new Error("Backend Google auth failed");
        }

        const dbUser = await res.json();

        token.id = dbUser.id;
        token.role = dbUser.role;
        token.slug = dbUser.slug;
      }

      if (user && !token.role) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.slug = (user as { slug?: string }).slug;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.slug = token.slug as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // allow relative callbackUrls like /dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // allow same-origin absolute URLs
      if (new URL(url).origin === baseUrl) return url;

      // fallback
      return baseUrl;
    },
  },

  pages: {
    signIn: "/",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
