// Runs only in CI. Signing material is decoded to the runner's temporary directory.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, RUNNER_TEMP } = process.env;
if (![ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, RUNNER_TEMP].every(Boolean)) throw new Error('Android signing secrets are required');
if (/[\r\n\\]/.test(ANDROID_KEYSTORE_PASSWORD + ANDROID_KEY_ALIAS)) throw new Error('Unsupported signing property character');
const path = join(RUNNER_TEMP, 'android-release.p12');
writeFileSync(path, Buffer.from(ANDROID_KEYSTORE_BASE64, 'base64'), { mode: 0o600 });
writeFileSync('src-tauri/gen/android/app/keystore.properties', `storeFile=${path}\nstoreType=PKCS12\nstorePassword=${ANDROID_KEYSTORE_PASSWORD}\nkeyPassword=${ANDROID_KEYSTORE_PASSWORD}\nkeyAlias=${ANDROID_KEY_ALIAS}\n`, { mode: 0o600 });
console.log('Preserved Android signing key configured.');
