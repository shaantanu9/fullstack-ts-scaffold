import api from './api';
import { ApiSuccessResponse } from '@/types/api';

interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl?: string;
}

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

/**
 * Upload a file straight to ImageKit's CDN using short-lived credentials minted
 * by our backend — the private key never reaches the browser.
 *
 * 1. GET /uploads/imagekit-auth  → { token, expire, signature, publicKey, urlEndpoint }
 * 2. POST the file + those params to ImageKit's public upload endpoint.
 *
 * Throws if the server has no ImageKit config (503) or ImageKit rejects the upload.
 */
export const uploadImage = async (file: File): Promise<ImageKitUploadResult> => {
  const { data } = await api.get<ApiSuccessResponse<ImageKitAuthParams>>('/uploads/imagekit-auth');
  const auth = data.data;

  const form = new FormData();
  form.append('file', file);
  form.append('fileName', file.name);
  form.append('token', auth.token);
  form.append('expire', String(auth.expire));
  form.append('signature', auth.signature);
  form.append('publicKey', auth.publicKey);
  form.append('useUniqueFileName', 'true');

  const res = await fetch(IMAGEKIT_UPLOAD_URL, { method: 'POST', body: form });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ImageKit upload failed (${res.status}): ${detail}`);
  }

  return (await res.json()) as ImageKitUploadResult;
};
