// Run locally: node scripts/release/provision.mjs <directory-with-node-forge-and-libsodium-wrappers>
// Private signing material stays outside the checkout and in encrypted Actions secrets.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { api } from './github.mjs';
const require = createRequire(join(resolve(process.argv[2]), 'package.json'));
const forge = require('node-forge');
const sodium = require('libsodium-wrappers');
await sodium.ready;
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(line => /^\w+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1).trim().replace(/^(["'])(.*)\1$/, '$2')]; }));
const url = env.VITE_SUPABASE_URL;
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
process.env.VITE_SUPABASE_URL = url || '';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = publicKey || '';
await import('./check-config.mjs');
const backup = join(process.env.USERPROFILE, '.codex', 'private', 'lista-compras');
mkdirSync(backup, { recursive: true });
const keyFile = join(backup, 'android-release.p12');
const metadataFile = join(backup, 'android-release.json');
const known = (await api('/actions/secrets')).secrets.map(secret => secret.name);
if (!existsSync(keyFile)) {
  if (known.includes('ANDROID_KEYSTORE_BASE64')) throw new Error('Existing remote signing key must be preserved; refusing to replace it');
  const keys = forge.pki.rsa.generateKeyPair(3072);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01' + randomBytes(15).toString('hex');
  cert.validity.notBefore = new Date(Date.now() - 86400000);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setUTCFullYear(cert.validity.notAfter.getUTCFullYear() + 30);
  const identity = [{ name: 'commonName', value: 'Lista de Compras Release' }];
  cert.setSubject(identity); cert.setIssuer(identity);
  cert.setExtensions([{ name: 'basicConstraints', cA: false }, { name: 'keyUsage', digitalSignature: true }]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const password = randomBytes(32).toString('hex');
  const alias = 'lista-compras-release';
  const p12 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, { algorithm: '3des', friendlyName: alias });
  writeFileSync(keyFile, Buffer.from(forge.asn1.toDer(p12).getBytes(), 'binary'), { mode: 0o600, flag: 'wx' });
  writeFileSync(metadataFile, JSON.stringify({ password, alias, certificateSha256: forge.md.sha256.create().update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()).digest().toHex() }, null, 2), { mode: 0o600, flag: 'wx' });
}
const metadata = JSON.parse(readFileSync(metadataFile));
const encryption = await api('/actions/secrets/public-key');
for (const [name, value] of Object.entries({
  VITE_SUPABASE_URL: url,
  VITE_SUPABASE_PUBLISHABLE_KEY: publicKey,
  ANDROID_KEYSTORE_BASE64: readFileSync(keyFile).toString('base64'),
  ANDROID_KEYSTORE_PASSWORD: metadata.password,
  ANDROID_KEY_ALIAS: metadata.alias,
})) {
  const encrypted = sodium.crypto_box_seal(sodium.from_string(value), sodium.from_base64(encryption.key, sodium.base64_variants.ORIGINAL));
  await api(`/actions/secrets/${name}`, 'PUT', { encrypted_value: sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL), key_id: encryption.key_id });
  console.log(`Configured encrypted Actions secret: ${name}`);
}
console.log(`Signing backup preserved outside Git: ${backup}`);
console.log(`Public certificate SHA-256: ${metadata.certificateSha256}`);
