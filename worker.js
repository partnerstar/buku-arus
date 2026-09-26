// Worker utama: melayani file statis (index.html, dst) DAN endpoint /api/data
// untuk sinkron cloud. Menggantikan folder functions/ (Pages Functions) yang
// tidak lagi otomatis terdeteksi pada tipe project ini.
//
// Setiap "PIN/kode akun" yang dipakai user di aplikasi di-hash (SHA-256) dan
// dipakai sebagai key terpisah di KV. PIN = sekaligus nama akun & kuncinya.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/data') {
      return handleData(request, env);
    }

    // Selain /api/data, layani sebagai file statis biasa (index.html, dll).
    return env.ASSETS.fetch(request);
  }
};

async function hashPin(pin) {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getPin(request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.replace('Bearer ', '').trim();
}

async function handleData(request, env) {
  const pin = getPin(request);
  if (!pin || pin.length < 4) {
    return new Response('PIN tidak valid (minimal 4 karakter)', { status: 400 });
  }
  const key = 'account:' + await hashPin(pin);

  if (request.method === 'GET') {
    const stored = await env.BUKU_ARUS_KV.get(key);
    return new Response(stored || 'null', {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    const body = await request.text();
    await env.BUKU_ARUS_KV.put(key, body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
