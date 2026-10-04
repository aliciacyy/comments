import LogoutButton from '@/components/logout-button';

export default function AdminActions({ current }: { current: 'generator' | 'media' }) {
  const isMedia = current === 'media';

  return (
    <div className="home-actions" style={{ alignItems: 'center', gap: 12 }}>
      <a className="admin-link" href={isMedia ? '/admin' : '/admin/media'}>
        {isMedia ? 'Link generator' : 'Media uploader'}
      </a>
      <LogoutButton />
    </div>
  );
}
