import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export default async function HomePage() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
