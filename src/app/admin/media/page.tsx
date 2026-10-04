import { cookies } from 'next/headers';
import AdminLogin from '@/components/admin-login';
import AdminActions from '@/components/admin-actions';
import MediaUploader from '@/components/media-uploader';
import { ADMIN_SESSION_COOKIE, authIsConfigured, isValidAdminSession } from '@/lib/admin-auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Media · Admin' };
export default async function MediaPage() {
  const authenticated = isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!authenticated) return <AdminLogin configured={authIsConfigured()} />;
  return <main className="home-shell">
    <AdminActions current="media" />
    <MediaUploader />
  </main>;
}
