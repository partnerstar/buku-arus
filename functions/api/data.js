// Cloudflare Pages Function: /api/data
//
// Cara kerja: setiap "PIN/kode akun" yang dipakai user di aplikasi di-hash
// (SHA-256) dan dipakai sebagai key terpisah di KV. Jadi PIN itu SEKALIGUS
// jadi nama akun dan kuncinya — tidak perlu di-set di mana pun oleh kamu
// sebagai developer. Siapa pun yang tahu (atau membuat) PIN tertentu akan
// selalu mendarat di ruang data yang sama; PIN yang beda = akun yang beda
// dan datanya sama sekali tidak nyambung satu sama lain.
//
// Yang perlu kamu siapkan di Cloudflare hanyalah KV namespace-nya (lihat
// README), TIDAK perlu environment variable APP_PIN sama sekali.

async function hashPin(pin) {
  const enc = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getPin(request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.replace('Bearer ', '').trim();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const pin = getPin(request);
  if (!pin || pin.length < 4) {
    return new Response('PIN tidak valid (minimal 4 karakter)', { status: 400 });
  }
  const key = 'account:' + await hashPin(pin);
  const stored = await env.BUKU_ARUS_KV.get(key);
  return new Response(stored || 'null', {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const pin = getPin(request);
  if (!pin || pin.length < 4) {
    return new Response('PIN tidak valid (minimal 4 karakter)', { status: 400 });
  }
  const key = 'account:' + await hashPin(pin);
  const body = await request.text();
  await env.BUKU_ARUS_KV.put(key, body);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
