import { put, get, del } from '@vercel/blob';
import crypto from 'node:crypto';

const PATH = id => `letters/${id}.json`;
const ID_RE = /^[a-f0-9]{32}$/;
const FONTS = new Set(['dancing', 'vibes', 'sacramento', 'apple']);
const badName = s => /[<>\x00-\x1f]/.test(s);

async function readRecord(id) {
  const res = await get(PATH(id), { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200) return null;
  return JSON.parse(await new Response(res.stream).text());
}

async function writeRecord(id, record) {
  await put(PATH(id), JSON.stringify(record), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const id = String(req.query.id || '');
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'bad id' });
      const rec = await readRecord(id);
      if (!rec) return res.status(404).json({ error: 'not found' });
      return res.status(200).json(rec);
    }

    if (req.method === 'DELETE') {
      const id = String(req.query.id || '');
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'bad id' });
      await del(PATH(id));
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (body.action === 'create') {
        const html = String(body.html || '');
        const footer = String(body.footer || '').slice(0, 300);
        const name = String(body.name || '').trim().slice(0, 120);
        if (!html || html.length > 900000) return res.status(400).json({ error: 'letter empty or too large' });
        if (!name || badName(name)) return res.status(400).json({ error: 'name required' });
        const id = crypto.randomBytes(16).toString('hex');
        await writeRecord(id, {
          v: 1,
          name,
          html,
          footer,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        return res.status(200).json({ id });
      }

      if (body.action === 'sign') {
        const id = String(body.id || '');
        if (!ID_RE.test(id)) return res.status(400).json({ error: 'bad id' });
        const typedName = String(body.typedName || '').trim().slice(0, 120);
        const signatureText = String(body.signatureText || body.typedName || '').trim().slice(0, 120);
        const signatureFont = String(body.signatureFont || '');
        if (!typedName || badName(typedName)) return res.status(400).json({ error: 'typed name required' });
        if (!signatureText || badName(signatureText)) return res.status(400).json({ error: 'bad signature' });
        if (!FONTS.has(signatureFont)) return res.status(400).json({ error: 'bad signature font' });
        const rec = await readRecord(id);
        if (!rec) return res.status(404).json({ error: 'not found' });
        if (rec.status === 'signed') return res.status(409).json({ error: 'already signed' });
        rec.status = 'signed';
        rec.signedAt = new Date().toISOString();
        rec.typedName = typedName;
        rec.signatureText = signatureText;
        rec.signatureFont = signatureFont;
        await writeRecord(id, rec);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'unknown action' });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
