import Nav from '@/components/Nav';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  const signOutAction = async () => {
    'use server';
    await signOut({ redirectTo: '/signin' });
  };

  return (
    <>
      <Nav
        userEmail={session.user.email}
        userName={session.user.name}
        signOutAction={signOutAction}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </>
  );
}
