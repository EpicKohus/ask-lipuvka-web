import { head, put } from '@vercel/blob';

const FILE = 'stats/visits.json';

async function getCount() {
  try {
    const blob = await head(FILE);
    const res = await fetch(blob.url, { cache: 'no-store' });
    const data = await res.json();
    return data.count || 0;
  } catch {
    return 0;
  }
}

async function saveCount(count) {
  await put(FILE, JSON.stringify({ count }), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const count = await getCount();
    return res.status(200).json({ count });
  }

  if (req.method === 'POST') {
    const current = await getCount();
    const next = current + 1;
    await saveCount(next);
    return res.status(200).json({ count: next });
  }

  return res.status(405).end();
}