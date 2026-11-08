// Baixa os retratos de data/portraits.json (slug -> arquivo da PoE Wiki) para assets/portraits/<slug>.<ext>.
// Sem api.php (fica atrás do Anubis); thumb.php e /images respondem direto.
// Tenta o thumb de WIDTH px via thumb.php (/images/thumb/ só serve thumbs já gerados); se o original
// for mais estreito o MediaWiki recusa e baixa o original (URL com hash MD5 do nome).
// Uso: node scripts/fetch-portraits.mjs [--force]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets', 'portraits');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data', 'portraits.json'), 'utf8'));
const force = process.argv.includes('--force');
const WIDTH = 200;
const SITE = 'https://www.poewiki.net';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const urls = (file) => {
  const name = file.replace(/ /g, '_');
  const h = crypto.createHash('md5').update(name).digest('hex');
  const enc = encodeURIComponent(name);
  return [`${SITE}/thumb.php?f=${enc}&w=${WIDTH}`, `${SITE}/images/${h[0]}/${h.slice(0, 2)}/${enc}`];
};

fs.mkdirSync(out, { recursive: true });
const failed = [];
let total = 0, fetched = 0;

for (const [slug, file] of Object.entries(manifest)) {
  const dest = path.join(out, `${slug}${path.extname(file).toLowerCase()}`);
  if (!force && fs.existsSync(dest)) { total += fs.statSync(dest).size; continue; }
  let buf = null;
  for (const url of urls(file)) {
    const res = await fetch(url, { headers: { 'User-Agent': 'lore-path-of-exile portrait fetcher' } });
    await sleep(2500);
    if (res.ok && res.headers.get('content-type')?.startsWith('image/')) { buf = Buffer.from(await res.arrayBuffer()); break; }
  }
  if (!buf) { failed.push(`${slug}: ${file}`); continue; }
  fs.writeFileSync(dest, buf);
  total += buf.length;
  fetched++;
  console.log(`${slug} ${(buf.length / 1024).toFixed(0)} KB`);
}

console.log(`baixados: ${fetched}, total em disco: ${(total / 1048576).toFixed(1)} MB`);
if (failed.length) { console.error('FALHARAM:\n' + failed.join('\n')); process.exit(1); }
