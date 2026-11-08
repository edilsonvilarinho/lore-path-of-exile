<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ActMap from '../components/ActMap.vue';
import SidePanel from '../components/SidePanel.vue';
import { useCampaign } from '../stores/campaign';
import { useAudio } from '../stores/audio';
import { tx } from '../i18n';
import { roman } from '../util';

// Painel do Mundo: tela de waypoints do jogo (Parte I/II, atos I–X) + painel lateral do ato/área.
const PARTS = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]];

const route = useRoute();
const router = useRouter();
const camp = useCampaign();
const audio = useAudio();
const { t } = useI18n();

const n = computed(() => Number(route.params.n));
const act = computed(() => camp.act(n.value));
// A área selecionada vive na URL (?area=) para permitir link direto; ids inválidos são ignorados.
const selected = computed(() => {
  const id = route.query.area;
  return act.value?.nodes.some((x) => x.id === id) ? id : null;
});
const tab = ref(selected.value ? 'area' : 'story');

const go = (i) => {
  if (i >= 1 && i <= camp.acts.length && i !== n.value) router.push({ name: 'act', params: { n: i } });
};
const selectArea = (id) => router.replace({ query: { area: id } });

function onNode(node) {
  selectArea(node.id);
  tab.value = 'area';
  audio.play(node.track || act.value.track);
}

function onBoss(boss) {
  selectArea(boss.area);
  if (boss.track) audio.play(boss.track);
}

watch(n, () => {
  if (selected.value) tab.value = 'area';
  else if (tab.value === 'area') tab.value = 'story';
  const node = act.value.nodes.find((x) => x.id === selected.value);
  audio.play(node?.track || act.value.track);
}, { immediate: true });

watchEffect(() => {
  if (act.value) document.title = `${t('act')} ${roman(act.value.n)} · ${tx(act.value.title)} — ${tx(camp.meta?.title)}`;
});

function onKey(e) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight') go(n.value + 1);
  else if (e.key === 'ArrowLeft') go(n.value - 1);
}
onMounted(() => addEventListener('keydown', onKey));
onBeforeUnmount(() => removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="act" class="page">
    <div class="worldhead">
      <h1>Wraeclast</h1>
      <div class="parts">
        <template v-for="(part, pi) in PARTS" :key="pi">
          <span class="lbl">{{ t('part').toUpperCase() }} {{ roman(pi + 1) }}</span>
          <div class="tabs acts">
            <button
              v-for="i in part"
              :key="i"
              class="poe-btn"
              :aria-selected="i === n"
              :title="`${t('act')} ${i}: ${tx(camp.act(i)?.title)}`"
              @click="go(i)"
            >{{ roman(i) }}</button>
          </div>
        </template>
      </div>
    </div>

    <section class="frame mapwrap">
      <div class="maptitle">
        <h2>{{ t('act') }} {{ roman(act.n) }} · {{ tx(act.title) }}</h2>
        <span class="lvl">{{ t('level') }} {{ act.levels }} · {{ act.town }}</span>
      </div>
      <ActMap :key="act.n" :act="act" :selected="selected" @select="onNode" />
      <div class="legend">
        <span><i class="lg-wp"></i>{{ t('waypoint') }}</span>
        <span><i class="lg-nowp"></i>{{ t('noWaypoint') }}</span>
        <span><i class="lg-town"></i>{{ t('town') }}</span>
        <span class="lg-unv">? {{ t('toConfirm') }}</span>
      </div>
    </section>

    <SidePanel v-model:tab="tab" :act="act" :selected="selected" @focus-area="selectArea" @focus-boss="onBoss" />
  </div>
</template>
