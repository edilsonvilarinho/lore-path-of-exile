// Junta data/campaign/act1..10.json + tracks.json em data/campaign.json e valida referências.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data', 'campaign');
const lore = JSON.parse(fs.readFileSync(path.join(root, 'data', 'lore.json'), 'utf8'));
const extraTracks = JSON.parse(fs.readFileSync(path.join(dir, 'tracks.json'), 'utf8'));
const portraits = JSON.parse(fs.readFileSync(path.join(root, 'data', 'portraits.json'), 'utf8'));

const acts = Array.from({ length: 10 }, (_, i) => JSON.parse(fs.readFileSync(path.join(dir, `act${i + 1}.json`), 'utf8')));
const trackIds = new Set([...lore.tracks, ...extraTracks].map((t) => t.id));
const errors = [];

// img: slugs de data/portraits.json -> nomes de arquivo em assets/portraits (com extensão) no payload.
const resolveImg = (label, e) => {
  if (!e.img) return;
  e.img = e.img.map((slug) => {
    const file = portraits[slug] && `${slug}${path.extname(portraits[slug]).toLowerCase()}`;
    if (!file || !fs.existsSync(path.join(root, 'assets', 'portraits', file))) errors.push(`${label}: retrato ${slug} (rode npm run fetch:portraits)`);
    return file;
  });
};

for (const a of acts) {
  const nodeIds = new Set(a.nodes.map((n) => n.id));
  if (!trackIds.has(a.track)) errors.push(`act ${a.n}: track ${a.track}`);
  if (!fs.existsSync(path.join(root, 'assets', 'maps', a.map))) errors.push(`act ${a.n}: map ${a.map}`);
  for (const n of a.nodes) {
    if (n.track && !trackIds.has(n.track)) errors.push(`act ${a.n} node ${n.id}: track ${n.track}`);
    if (n.x < 0 || n.x > a.w || n.y < 0 || n.y > a.h) errors.push(`act ${a.n} node ${n.id}: fora do mapa`);
  }
  for (const b of a.bosses) {
    if (b.track && !trackIds.has(b.track)) errors.push(`act ${a.n} boss ${b.name}: track ${b.track}`);
    if (!nodeIds.has(b.area)) errors.push(`act ${a.n} boss ${b.name}: área ${b.area} sem nó`);
    resolveImg(`act ${a.n} boss ${b.name}`, b);
  }
  for (const n of a.npcs) resolveImg(`act ${a.n} npc ${n.name}`, n);
  for (const q of a.quests) if (q.area && !nodeIds.has(q.area)) errors.push(`act ${a.n} quest ${q.name}: área ${q.area} sem nó`);
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
fs.writeFileSync(path.join(root, 'data', 'campaign.json'), JSON.stringify({ acts, tracks: extraTracks }));
console.log(`campaign.json: ${acts.length} atos, ${acts.reduce((s, a) => s + a.quests.length, 0)} missões, ${acts.reduce((s, a) => s + a.nodes.length, 0)} nós, ${extraTracks.length} faixas extras`);
