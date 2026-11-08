// Gera as imagens do README em docs/media: capturas JPG e um GIF de apresentação (crossfade) por idioma.
// Requer o app rodando (npm run dev ou npm start), Google Chrome e ffmpeg no PATH.
// Uso: node scripts/capture-screens.mjs [baseUrl=http://localhost:5173]   (CHROME_PATH sobrescreve o executável)
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '');
const out = path.join(root, 'docs', 'media');
const chromePath = process.env.CHROME_PATH || {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] || 'google-chrome';
const W = 1440, H = 900, PORT = 9333;
const GIF = { width: 960, fps: 10, hold: 2.4, fade: 0.4 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Cada passo roda no estado deixado pelo anterior (SPA, sem recarregar). still = também vira JPG para o README.
const STEPS = [
  { name: 'world', still: true, run: '' },
  { name: 'tooltip', run: `finalBossNode().dispatchEvent(new MouseEvent('mouseenter'))` },
  { name: 'area', still: true, run: `(() => { const b = finalBossNode(); b.dispatchEvent(new MouseEvent('mouseleave')); b.click(); })()` },
  { name: 'quests', still: true, run: `(async () => { tab(1); await tick(); document.querySelector('.pane .q').click(); })()` },
  { name: 'bosses', run: `(async () => { act(3); await tick(); tab(2); })()` },
  { name: 'part2', run: `(async () => { act(6); await tick(); tab(0); })()` },
  { name: 'act10', run: `act(10)` },
];
// tick: o Vue/router atualizam o DOM de forma assíncrona; espera antes da próxima ação na mesma etapa.
const HELPERS = `
  window.tick = () => new Promise((r) => setTimeout(r, 120));
  window.act = (n) => document.querySelectorAll('.acts .poe-btn')[n - 1].click();
  window.tab = (i) => document.querySelectorAll('.side .tabs .poe-btn')[i].click();
  window.finalBossNode = () => [...document.querySelectorAll('.am-node')].find((b) => b.getAttribute('aria-label') === window.__finalArea);
  fetch('/api/campaign').then((r) => r.json()).then((d) => {
    const a = d.acts[0], boss = a.bosses.find((b) => b.final) || a.bosses[0];
    window.__finalArea = a.nodes.find((n) => n.id === boss.area).name;
  });`;

let ws, seq = 0;
const pending = new Map();
function cdp(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
        ws.onmessage = (e) => {
          const msg = JSON.parse(e.data), p = pending.get(msg.id);
          if (!p) return;
          pending.delete(msg.id);
          msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
        };
        return;
      }
    } catch {}
    await sleep(200);
  }
  throw new Error('Chrome DevTools não respondeu');
}

async function evaluate(expression) {
  const r = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

async function waitFor(expression, ms = 15000) {
  const t0 = Date.now();
  for (;;) {
    // Durante uma navegação o contexto de execução é destruído e o evaluate lança: tenta de novo.
    try { if (await evaluate(expression)) return; } catch {}
    if (Date.now() - t0 > ms) throw new Error(`timeout: ${expression}`);
    await sleep(100);
  }
}

// Fontes e imagens carregadas + 700 ms para o fade de entrada do mapa (.5s) terminar.
async function settle() {
  await waitFor(`document.fonts.status === 'loaded' && [...document.images].every((i) => i.complete) && !!window.__finalArea`);
  await sleep(700);
}

async function shot(file) {
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
}

async function load(lang) {
  await cdp('Page.navigate', { url: `${base}/act/1` });
  await waitFor(`location.href.startsWith('${base}') && document.readyState === 'complete'`);
  await evaluate(`localStorage.setItem('lang', '${lang}')`);
  await cdp('Page.navigate', { url: `${base}/act/1` });
  await waitFor(`!!document.querySelector('.am-node')`);
  await evaluate(HELPERS);
  await settle();
}

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

// xfade encadeado: cada entrada dura hold+fade, então a i-ésima transição começa em i*hold.
function buildGif(frames, file) {
  const { width, fps, hold, fade } = GIF;
  const inputs = frames.flatMap((f) => ['-loop', '1', '-framerate', String(fps), '-t', String(hold + fade), '-i', f]);
  const prep = frames.map((_, i) => `[${i}]scale=${width}:-2:flags=lanczos,format=yuv444p,settb=AVTB[s${i}]`);
  let prev = 's0';
  const chain = frames.slice(1).map((_, k) => {
    const i = k + 1, o = `x${i}`;
    const f = `[${prev}][s${i}]xfade=transition=fade:duration=${fade}:offset=${(i * hold).toFixed(2)}[${o}]`;
    prev = o;
    return f;
  });
  const palette = `[${prev}]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4[out]`;
  ffmpeg([...inputs, '-filter_complex', [...prep, ...chain, palette].join(';'), '-map', '[out]', '-loop', '0', file]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lore-capture-'));
const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(tmp, 'profile')}`,
  '--hide-scrollbars', '--mute-audio', `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' });

try {
  await connect();
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  fs.mkdirSync(out, { recursive: true });

  for (const lang of ['en', 'pt']) {
    await load(lang);
    const frames = [];
    for (const [i, step] of STEPS.entries()) {
      if (step.run) await evaluate(step.run);
      await sleep(250);
      await settle();
      const png = path.join(tmp, `${lang}-${String(i + 1).padStart(2, '0')}-${step.name}.png`);
      await shot(png);
      frames.push(png);
      if (step.still) ffmpeg(['-i', png, '-q:v', '3', path.join(out, `screen-${step.name}-${lang}.jpg`)]);
    }
    buildGif(frames, path.join(out, `demo-${lang}.gif`));
    console.log(`${lang}: ${frames.length} quadros`);
  }
} finally {
  ws?.close();
  chrome.kill();
}

for (const f of fs.readdirSync(out)) console.log(`${f}  ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`);
