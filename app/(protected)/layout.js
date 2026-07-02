import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function ProtectedLayout({ children }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  // requireLogin() equivalent - middleware also covers this, but we
  // double-check here since this layout can't rely solely on middleware
  // if it's ever rendered directly.
  if (!session) {
    redirect('/login');
  }

  const user = {
    user_id: session.user_id,
    full_name: session.full_name,
    username: session.username,
    role: session.role,
  };

  return <AppShell user={user}>{children}</AppShell>;
}
