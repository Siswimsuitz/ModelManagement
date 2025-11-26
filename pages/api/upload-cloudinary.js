import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb' // allow files up to ~12MB base64
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fileName, data } = req.body || {};
  if (!fileName || !data) return res.status(400).json({ error: 'Missing fileName or data' });

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
  }

  try {
    // data is data:<mime>;base64,<b64>
    const result = await cloudinary.v2.uploader.upload(data, {
      public_id: `nexus_models/${Date.now()}_${fileName}`,
      folder: 'nexus_models',
      resource_type: 'image',
      overwrite: false
    });

    return res.status(200).json({ url: result.secure_url, raw: result });
  } catch (err) {
    console.error('Cloudinary upload error', err);
    return res.status(500).json({ error: err.message || err });
  }
}
