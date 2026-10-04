import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from './admin-auth';
export async function mediaIsAuthenticated() {
  return isValidAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
}
export function cloudinaryConfig() {
  return {cloudName:process.env.CLOUDINARY_CLOUD_NAME, apiKey:process.env.CLOUDINARY_API_KEY, secret:process.env.CLOUDINARY_API_SECRET, folder:process.env.CLOUDINARY_FOLDER, folderMode:process.env.CLOUDINARY_FOLDER_MODE||'dynamic'};
}
export function signParams(params:Record<string,string>,secret:string) {
  return createHash('sha256').update(Object.keys(params).sort().map(key=>`${key}=${params[key]}`).join('&')+secret).digest('hex');
}
