    import { supabaseServer } from '../../lib/supabaseServer';

// Next.js API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb' // allow files up to ~12MB base64
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, fileType, data } = req.body || {};

  if (!fileName || !data || !fileType) {
    return res.status(400).json({ error: 'Missing fileName, fileType or data' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  try {
    // data is expected to be "data:<mime>;base64,<base64data>"
    const base64String = data.split(',')[1];
    const buffer = Buffer.from(base64String, 'base64');

    // create a safe path with timestamp
    const timestamp = Date.now();
    const key = `public/${timestamp}_${fileName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from('assets')
      .upload(key, buffer, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error', uploadError);
      return res.status(500).json({ error: uploadError.message || uploadError });
    }

    // If bucket is public, you can get public URL:
    const { data: publicData } = supabaseServer.storage
      .from('assets')
      .getPublicUrl(key);

    // If bucket is private, you may want to create a signed URL:
    // const { data: signed, error: signErr } = await supabaseServer.storage.from('assets').createSignedUrl(key, 60 * 60);
    // if (signErr) { ... }

    return res.status(200).json({
      url: publicData?.publicUrl || null,
      key
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
