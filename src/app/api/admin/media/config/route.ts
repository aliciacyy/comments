import { cloudinaryConfig, mediaIsAuthenticated } from '@/lib/cloudinary';
export async function GET(){
  if(!await mediaIsAuthenticated())return Response.json({error:'Please sign in.'},{status:401});
  const c=cloudinaryConfig();
  return Response.json({ready:!!(c.cloudName&&c.apiKey&&c.secret&&c.folder),folder:c.folder||''},{headers:{'Cache-Control':'no-store'}});
}
