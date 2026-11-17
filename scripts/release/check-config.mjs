const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key || new URL(url).protocol !== 'https:') throw new Error('Supabase public build configuration missing');
if (!key.startsWith('sb_publishable_')) {
  let role;
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role; } catch { /* invalid key */ }
  if (role !== 'anon') throw new Error('Only publishable or anon Supabase keys can enter the app');
}
const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Supabase Auth configuration check failed (${response.status})`);
console.log('Public Supabase key type and Auth endpoint verified; no private credentials in frontend.');
