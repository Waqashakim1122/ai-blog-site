import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import Author from "@/models/Author";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "author";
    } & DefaultSession["user"];
  }
  interface User {
    role?: "admin" | "author";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectToDatabase();
        const author = await Author.findOne({ email: email.toLowerCase() }).select(
          "+passwordHash"
        );
        if (!author) return null;

        const valid = await bcrypt.compare(password, author.passwordHash);
        if (!valid) return null;

        return {
          id: author._id.toString(),
          name: author.name,
          email: author.email,
          image: author.avatar || undefined,
          role: author.role as "admin" | "author",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as typeof token & { id?: string; role?: "admin" | "author" };
      if (user) {
        t.id = user.id;
        t.role = user.role;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as typeof token & { id?: string; role?: "admin" | "author" };
      if (session.user) {
        session.user.id = t.id as string;
        session.user.role = t.role as "admin" | "author";
      }
      return session;
    },
  },
});
