<script setup>
import { tx } from '../i18n';

defineProps({
  boss: { type: Object, required: true },
  areaName: { type: String, default: '' },
});
const emit = defineEmits(['focus']);
</script>

<template>
  <div class="boss" :class="{ final: boss.final }" role="button" tabindex="0" @click="emit('focus', boss)" @keydown.enter.space.prevent="emit('focus', boss)">
    <div class="sk">{{ boss.name[0] }}</div>
    <div>
      <div class="bn">{{ boss.name }}</div>
      <div class="qmeta">{{ areaName }}</div>
      <p>{{ tx(boss.lore) }}</p>
    </div>
  </div>
</template>
