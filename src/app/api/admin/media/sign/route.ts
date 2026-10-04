import { cloudinaryConfig, mediaIsAuthenticated, signParams } from '@/lib/cloudinary';
export async function POST(request:Request){
  if(!await mediaIsAuthenticated())return Response.json({error:'Please sign in again.'},{status:401});
  const origin=request.headers.get('origin');
  // Next's internal URL may use localhost behind its HTTP server/proxy.
  // Match the browser's Origin to the actual request Host, retaining the protocol.
  const expectedOrigin = new URL(request.url);
  expectedOrigin.host = request.headers.get('host') || expectedOrigin.host;
  if(!origin||origin!==expectedOrigin.origin)return Response.json({error:'Invalid request origin.'},{status:403});
  const c=cloudinaryConfig();
  if(!c.cloudName||!c.apiKey||!c.secret||!c.folder)return Response.json({error:'Your Cloudinary connection has not been set up yet.'},{status:503});
  const params:Record<string,string>={timestamp:String(Math.floor(Date.now()/1000)),[c.folderMode==='fixed'?'folder':'asset_folder']:c.folder,public_id:crypto.randomUUID(),overwrite:'false'};
  return Response.json({params,signature:await signParams(params,c.secret),apiKey:c.apiKey,endpoint:`https://api.cloudinary.com/v1_1/${encodeURIComponent(c.cloudName)}/image/upload`},{headers:{'Cache-Control':'no-store'}});
}
