<script setup>
import { onBeforeUnmount } from 'vue';
import { hideTip, showAreaTip } from '../composables/tooltip';

// Mapa de waypoints oficial do ato com nós clicáveis posicionados em % das coordenadas da imagem.
defineProps({
  act: { type: Object, required: true },
  selected: { type: String, default: null },
});
const emit = defineEmits(['select']);
const pct = (v, total) => `${(v / total) * 100}%`;

onBeforeUnmount(hideTip);
</script>

<template>
  <div class="actmap" :style="{ aspectRatio: `${act.w} / ${act.h}` }">
    <img class="am-img" :src="`/assets/maps/${act.map}`" alt="" draggable="false">
    <div class="am-vig"></div>
    <button
      v-for="n in act.nodes"
      :key="n.id"
      class="am-node"
      :class="{ town: n.town, wp: n.wp, unv: n.unverified, sel: n.id === selected }"
      :style="{ left: pct(n.x, act.w), top: pct(n.y, act.h) }"
      :aria-label="n.name"
      @mouseenter="showAreaTip(act, n, $event.currentTarget)"
      @focus="showAreaTip(act, n, $event.currentTarget)"
      @mouseleave="hideTip"
      @blur="hideTip"
      @click="emit('select', n)"
    ><i></i></button>
  </div>
</template>
