<script setup>
import { tx } from '../i18n';
import Portrait from './Portrait.vue';

defineProps({
  boss: { type: Object, required: true },
  areaName: { type: String, default: '' },
});
const emit = defineEmits(['focus']);
</script>

<template>
  <div class="boss" :class="{ final: boss.final }" role="button" tabindex="0" @click="emit('focus', boss)" @keydown.enter.space.prevent="emit('focus', boss)">
    <Portrait :img="boss.img" :name="boss.name" />
    <div>
      <div class="bn">{{ boss.name }}</div>
      <div class="qmeta">{{ areaName }}</div>
      <p>{{ tx(boss.lore) }}</p>
    </div>
  </div>
</template>
