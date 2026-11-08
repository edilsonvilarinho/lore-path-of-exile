<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { tip } from '../composables/tooltip';

const { t } = useI18n();
const box = ref(null);
const pos = ref({ left: '0px', top: '0px' });
const bosses = computed(() => (tip.node ? tip.act.bosses.filter((b) => b.area === tip.node.id) : []));

// Centraliza acima do nó; se não couber abaixo da topbar, abre embaixo.
watch(() => [tip.node, tip.x, tip.y], async () => {
  if (!tip.node) return;
  await nextTick();
  const r = box.value.getBoundingClientRect();
  pos.value = {
    left: `${Math.min(innerWidth - r.width - 8, Math.max(8, tip.x - r.width / 2))}px`,
    top: `${tip.y - r.height - 18 < 50 ? tip.y + 24 : tip.y - r.height - 18}px`,
  };
});
</script>

<template>
  <div v-if="tip.node" ref="box" class="poe-tip" :style="pos">
    <div class="tp-head" :class="{ town: tip.node.town }">{{ tip.node.name }}</div>
    <div class="tp-body">
      <div v-if="tip.node.town" class="tp-prop">{{ t('town') }}</div>
      <div v-if="tip.node.lvl" class="tp-prop">{{ t('level') }}: <b>{{ tip.node.lvl }}</b></div>
      <div v-if="tip.node.wp" class="tp-prop">{{ t('waypoint') }}</div>
      <template v-if="tip.node.also">
        <div class="tp-sep"></div>
        <div class="tp-desc">{{ t('also') }}: {{ tip.node.also }}</div>
      </template>
      <template v-if="bosses.length">
        <div class="tp-sep"></div>
        <div v-for="b in bosses" :key="b.name" class="tp-unique">{{ b.name }}</div>
      </template>
      <template v-if="tip.node.unverified">
        <div class="tp-sep"></div>
        <div class="tp-warn">⚠ {{ t('unverified') }}</div>
      </template>
    </div>
  </div>
</template>
