import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

// Dados estáticos da campanha (atos, nós, missões, chefes) + títulos das faixas. Carregados uma vez.
export const useCampaign = defineStore('campaign', () => {
  const status = ref('idle');
  const error = ref('');
  const meta = shallowRef(null);
  const acts = shallowRef([]);
  const tracks = shallowRef(new Map());

  async function load() {
    if (status.value === 'loading' || status.value === 'ready') return;
    status.value = 'loading';
    try {
      const res = await fetch('/api/campaign');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      meta.value = data.meta;
      acts.value = data.acts;
      tracks.value = new Map(data.tracks.map((t) => [t.id, t]));
      status.value = 'ready';
    } catch (e) {
      error.value = e.message;
      status.value = 'error';
    }
  }

  const act = (n) => acts.value.find((a) => a.n === n);
  const track = (id) => tracks.value.get(id);

  return { status, error, meta, acts, load, act, track };
});
