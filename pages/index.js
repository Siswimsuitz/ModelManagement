import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [fileNameDisplay, setFileNameDisplay] = useState('Click to upload or drag and drop');
  const [uploading, setUploading] = useState(false);
  const [provider, setProvider] = useState('supabase'); // 'supabase' or 'cloudinary'
  const [message, setMessage] = useState('');
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    // load local data from localStorage if you want to show seeded assets
    const db = JSON.parse(localStorage.getItem('nexus_models_db_v1') || '{}');
    if (db?.assets) setAssets(db.assets);
  }, []);

  async function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileNameDisplay(f.name);
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadToApi(body, url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setMessage('Please pick a file first');
      return;
    }
    setUploading(true);
    setMessage('');

    try {
      const dataUrl = await fileToDataURL(file);
      if (provider === 'supabase') {
        const body = {
          fileName: file.name,
          fileType: file.type,
          data: dataUrl
        };
        const json = await uploadToApi(body, '/api/upload-supabase');
        if (json?.url) {
          setMessage('Uploaded to Supabase: ' + json.url);
          // Optionally add to local state
          setAssets(prev => [{ id: json.key, url: json.url, title: file.name }, ...prev]);
        } else {
          setMessage('Uploaded to Supabase, but no public URL returned.');
        }
      } else {
        // cloudinary
        const body = { fileName: file.name, data: dataUrl };
        const json = await uploadToApi(body, '/api/upload-cloudinary');
        if (json?.url) {
          setMessage('Uploaded to Cloudinary: ' + json.url);
          setAssets(prev => [{ id: json.url, url: json.url, title: file.name }, ...prev]);
        } else {
          setMessage('Cloudinary upload failed.');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Nexus Models — Upload</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
      </Head>

      <main className="min-h-screen bg-slate-950 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold">Nexus Models — Upload</h1>
            <div>
              <label className="mr-2 text-sm">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded px-3 py-2 bg-stone-900">
                <option value="supabase">Supabase</option>
                <option value="cloudinary">Cloudinary</option>
              </select>
            </div>
          </header>

          <form onSubmit={handleUpload} className="bg-stone-900 p-6 rounded-xl">
            <div className="mb-4">
              <label className="block text-xs uppercase text-stone-400">Asset Label</label>
              <input type="text" id="asset-title" name="title" placeholder="e.g. Vogue Editorial" className="w-full rounded px-4 py-2 bg-stone-800" />
            </div>

            <div className="mb-4 relative">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="rounded-2xl border border-dashed p-8 text-center">
                <p className="text-sm">{fileNameDisplay}</p>
                <p className="text-xs text-stone-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={uploading} className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2">
                {uploading ? 'Uploading...' : 'Upload Files'}
              </button>
              <div className="text-sm text-stone-300">{message}</div>
            </div>
          </form>

          <section className="mt-8">
            <h2 className="text-xl mb-4">Uploaded (preview)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assets.map(a => (
                <div key={a.id} className="rounded overflow-hidden bg-stone-800">
                  <img src={a.url} alt={a.title} className="w-full h-40 object-cover" />
                  <div className="p-2 text-xs text-stone-300">{a.title}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
