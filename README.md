# Nexus Models — Vercel + Supabase / Cloudinary example

## What this project contains
- Next.js frontend (`pages/index.js`) based on your HTML UI.
- Serverless API routes:
  - `/api/upload-supabase` — server uploads files to Supabase Storage (recommended).
  - `/api/upload-cloudinary` — server uploads files to Cloudinary (alternate).
- Use `localStorage` fallback for data as in original UI.

## Environment variables (set these in Vercel Dashboard or locally)
### Supabase (recommended)
- `SUPABASE_URL` — your Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase **service_role** key (keep secret).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (optional for client usage).

### Cloudinary (alternate)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## How to deploy to Vercel
1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import repository.
3. In Vercel project settings > Environment Variables, add the env vars above.
4. Deploy.

## Supabase setup
1. Create a bucket named `assets` in Supabase Storage.
2. Optionally make it public or adjust policies:
   - If private, the API returns signed URLs via Supabase `createSignedUrl`.
   - If public, `getPublicUrl('assets/public/<filename>')` will work.

## API usage (client side)
Client converts file to base64 and posts JSON:
POST `/api/upload-supabase`
Body:
```json
{ "fileName": "my-image.jpg", "fileType": "image/jpeg", "data": "data:image/jpeg;base64,..." }
