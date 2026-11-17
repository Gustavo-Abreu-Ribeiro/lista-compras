// Read-only verification of public release assets, streamed without saving binaries.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const tag = process.argv[2] || 'v0.2.0';
const response = await fetch(`https://api.github.com/repos/Gustavo-Abreu-Ribeiro/lista-compras/releases/tags/${encodeURIComponent(tag)}`);
assert.equal(response.status, 200, 'Release must be public');
const release = await response.json();
assert(!release.draft && !release.prerelease);
const names = ['Lista-de-Compras-Windows-x64-setup.exe', 'Lista-de-Compras-Android-arm64.apk'];
const checksumAsset = release.assets.find(asset => asset.name === 'SHA256SUMS.txt');
assert(checksumAsset, 'Checksums are required');
const checksumResponse = await fetch(checksumAsset.browser_download_url);
assert.equal(checksumResponse.status, 200);
const checksums = Object.fromEntries((await checksumResponse.text()).trim().split(/\r?\n/).map(line => {
  const [hash, name] = line.trim().split(/\s+/); return [name, hash];
}));
for (const name of names) {
  const asset = release.assets.find(item => item.name === name);
  assert(asset && asset.state === 'uploaded', `${name} missing`);
  const download = await fetch(asset.browser_download_url);
  assert.equal(download.status, 200);
  const hash = createHash('sha256');
  let size = 0;
  for await (const bytes of download.body) {
    if (size === 0) assert.equal(Buffer.from(bytes).subarray(0, 2).toString(), name.endsWith('.exe') ? 'MZ' : 'PK');
    hash.update(bytes); size += bytes.length;
  }
  const digest = hash.digest('hex');
  assert.equal(size, asset.size);
  assert.equal(digest, checksums[name]);
  if (asset.digest) assert.equal(`sha256:${digest}`, asset.digest);
  console.log(`Verified ${name}: ${size} bytes, SHA-256 ${digest}`);
}
console.log(`Public release verified: ${release.html_url}`);
