import { createHmac, randomUUID } from 'crypto';
import { appConfig } from '../config/app.config';

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

// Default token validity: 30 minutes (ImageKit allows up to 1 hour).
const TOKEN_TTL_SECONDS = 30 * 60;

// Uploads are optional. When any ImageKit credential is missing the auth
// endpoint returns 503 rather than minting an unusable token.
export const isImageKitConfigured = (): boolean =>
  Boolean(
    appConfig.imagekit.privateKey && appConfig.imagekit.publicKey && appConfig.imagekit.urlEndpoint,
  );

// ImageKit expects an HMAC-SHA1 (NOT SHA-256) of `${token}${expire}` signed
// with the private key, returned as lowercase hex.
export const signUploadToken = (privateKey: string, token: string, expire: number): string =>
  createHmac('sha1', privateKey).update(`${token}${expire}`).digest('hex');

// Mint the params the browser needs to upload directly to ImageKit without
// ever seeing the private key. The client POSTs these (plus the file) to
// https://upload.imagekit.io/api/v1/files/upload.
export const createImageKitAuthParams = (): ImageKitAuthParams => {
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const signature = signUploadToken(appConfig.imagekit.privateKey, token, expire);

  return {
    token,
    expire,
    signature,
    publicKey: appConfig.imagekit.publicKey,
    urlEndpoint: appConfig.imagekit.urlEndpoint,
  };
};
