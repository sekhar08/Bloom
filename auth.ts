import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/db';

const publicPaths = new Set(['/signin']);

export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [Google, GitHub],
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
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
}));
