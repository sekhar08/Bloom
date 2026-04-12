import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

const publicPaths = new Set(['/signin']);

// Hardcoded test account — development only, not for production
const TEST_USER = {
  email: 'testuser@gmail.com',
  password: 'testuser123',
  name: 'Test User',
};

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          credentials?.email !== TEST_USER.email ||
          credentials?.password !== TEST_USER.password
        ) {
          return null;
        }

        const db = getDb();

        // Look up existing test user
        const [existing] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, TEST_USER.email))
          .limit(1);

        if (existing) return existing;

        // Seed test user on first sign-in
        const [created] = await db
          .insert(schema.users)
          .values({
            email: TEST_USER.email,
            name: TEST_USER.name,
            emailVerified: new Date(),
          })
          .returning();

        return created;
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isSignedIn = Boolean(auth?.user);
      const isPublicPath = publicPaths.has(pathname);

      if (isPublicPath && isSignedIn) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (isPublicPath) {
        return true;
      }

      if (!isSignedIn) {
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      return true;
    },
    // Forward user.id into the JWT for Credentials sessions
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // user is set for database (OAuth) sessions; token is set for JWT (Credentials) sessions
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? (token?.id as string) ?? (token?.sub as string) ?? '';
      }
      return session;
    },
  },
}));
