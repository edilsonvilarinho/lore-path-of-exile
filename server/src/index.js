// API + estáticos do app: dados de data/*.json, mapas oficiais, trilha sonora (Range via serve-static) e build do Vue.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const audioDir = process.env.AUDIO_DIR || path.join(root, 'server/public/audio');
const publicDir = process.env.PUBLIC_DIR || path.join(root, 'client/dist');

const lore = readJson('data/lore.json');
const campaign = readJson('data/campaign.json');
// lore.tracks e campaign.tracks se sobrepõem (ex.: templar-courts); o id é a chave.
const tracks = [...new Map([...lore.tracks, ...campaign.tracks].map((t) => [t.id, { id: t.id, title: t.title }])).values()];
const campaignPayload = { meta: lore.meta, acts: campaign.acts, tracks };

if (!fs.existsSync(audioDir)) console.warn(`[audio] diretório ausente: ${audioDir} (músicas responderão 404)`);

const app = express();
app.disable('x-powered-by');

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/campaign', (req, res) => res.json(campaignPayload));
app.get('/api/lore', (req, res) => res.json(lore));
app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));

app.use('/assets/maps', express.static(path.join(root, 'assets/maps'), { maxAge: '7d', fallthrough: false }));
app.use('/assets/portraits', express.static(path.join(root, 'assets/portraits'), { maxAge: '7d', fallthrough: false }));
app.use('/audio', express.static(audioDir, { maxAge: '30d', fallthrough: false }));

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir, { index: false, maxAge: '1y', immutable: true }));
  // SPA: qualquer GET de página que não casou acima devolve o index.html (sem cache, para pegar novos builds).
  app.use((req, res, next) => (req.method === 'GET' && req.accepts('html') ? res.sendFile(path.join(publicDir, 'index.html'), { maxAge: 0 }) : next()));
}

// fallthrough:false faz o serve-static emitir 404 como erro; responde sem logar stack de 4xx.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  if (res.headersSent) return next(err);
  res.status(status).end();
});

const port = +process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`http://${host}:${port}`));
