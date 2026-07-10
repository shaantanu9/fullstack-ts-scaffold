'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { uploadImage } from '@/lib/imagekit';
import { handleApiError } from '@/lib/api';

// Read-only account page with an ImageKit avatar-upload demo. The uploaded image
// is shown for the session only — persisting it would need a `/users/me` write
// endpoint (user PATCH is admin-gated), noted as a "with more time" item.
export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadImage(file);
      setAvatarUrl(result.url);
    } catch (err) {
      setError(handleApiError(err) || (err instanceof Error ? err.message : 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="outline" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Avatar (ImageKit upload demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-2xl text-gray-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {avatarUrl ? (
                <img src={avatarUrl} alt="Uploaded avatar" className="h-full w-full object-cover" />
              ) : (
                <span>
                  {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                data-testid="avatar-input"
              />
              <Button size="sm" isLoading={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? 'Uploading…' : 'Upload image'}
              </Button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {avatarUrl && (
                <p className="mt-2 break-all text-xs text-gray-500">Stored at: {avatarUrl}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-gray-900">{user?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-gray-900">{user?.role ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">User ID</dt>
              <dd className="break-all font-mono text-xs text-gray-900">{user?.id ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
