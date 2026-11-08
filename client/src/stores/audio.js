import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const VOLUME_KEY = 'volume';
const readVolume = () => {
  try {
    const v = parseFloat(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.45;
  } catch {
    return 0.45;
  }
};

// Trilha por área com crossfade. Só toca depois que o usuário liga a música (política de autoplay).
export const useAudio = defineStore('audio', () => {
  const el = new Audio();
  el.loop = true;
  const on = ref(false);
  const current = ref(null);
  const volume = ref(readVolume());
  // seq invalida trocas antigas: uma troca nova (ou desligar) aborta a anterior no meio do fade.
  let seq = 0;
  let timer = 0;

  function ramp(target, ms) {
    clearInterval(timer);
    const from = el.volume, t0 = performance.now();
    return new Promise((resolve) => {
      timer = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        el.volume = from + (target() - from) * k;
        if (k === 1) { clearInterval(timer); timer = 0; resolve(); }
      }, 30);
    });
  }

  async function swap() {
    const token = ++seq;
    if (!el.paused) await ramp(() => 0, 350);
    if (token !== seq) return;
    el.src = `/audio/${current.value}.mp3`;
    el.volume = 0;
    try {
      await el.play();
    } catch {
      if (token === seq) on.value = false;
      return;
    }
    if (token === seq) await ramp(() => volume.value, 800);
  }

  function play(id) {
    if (!id || id === current.value) return;
    current.value = id;
    if (on.value) swap();
  }

  function toggle() {
    on.value = !on.value;
    if (on.value && current.value) return swap();
    seq++;
    clearInterval(timer);
    timer = 0;
    el.pause();
  }

  watch(volume, (v) => {
    if (!timer) el.volume = v;
    try { localStorage.setItem(VOLUME_KEY, String(v)); } catch {}
  });

  return { on, current, volume, play, toggle };
});
