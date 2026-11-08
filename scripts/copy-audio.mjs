// Copia só as faixas mapeadas em data/lore.json (+ data/campaign/tracks.json) para server/public/audio/<id>.mp3
// Uso: node scripts/copy-audio.mjs <pasta-raiz-dos-mp3>  (contém "Path of Exile (Original Game Soundtrack)/" e "Extended Soundtrack/")
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mp3Root = process.argv[2];
if (!mp3Root) {
  console.error('uso: node scripts/copy-audio.mjs <pasta-raiz-dos-mp3>');
  process.exit(1);
}
const out = path.join(root, 'server', 'public', 'audio');
const lore = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lore.json'), 'utf8'));
const campaignTracks = path.join(root, 'data', 'campaign', 'tracks.json');
if (fs.existsSync(campaignTracks)) lore.tracks.push(...JSON.parse(fs.readFileSync(campaignTracks, 'utf8')));

fs.mkdirSync(out, { recursive: true });
const norm = (s) => s.replace(/[’‘]/g, "'");
let total = 0, missing = [];

for (const t of lore.tracks) {
  const dir = path.join(mp3Root, path.dirname(t.src));
  const want = norm(path.basename(t.src));
  const hit = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => norm(f) === want);
  if (!hit) { missing.push(t.src); continue; }
  const dest = path.join(out, `${t.id}.mp3`);
  fs.copyFileSync(path.join(dir, hit), dest);
  total += fs.statSync(dest).size;
}

console.log(`copiadas: ${lore.tracks.length - missing.length}/${lore.tracks.length}, ${(total / 1048576).toFixed(1)} MB`);
if (missing.length) { console.error('NÃO ENCONTRADAS:\n' + missing.join('\n')); process.exit(1); }
