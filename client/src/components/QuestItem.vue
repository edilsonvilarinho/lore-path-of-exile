<script setup>
import { ref } from 'vue';
import { tx } from '../i18n';

const props = defineProps({
  quest: { type: Object, required: true },
  areaName: { type: String, default: '' },
  open: { type: Boolean, default: false },
});
const emit = defineEmits(['focus-area']);
const expanded = ref(props.open);

function toggle() {
  expanded.value = !expanded.value;
  if (props.quest.area) emit('focus-area', props.quest.area);
}
</script>

<template>
  <div class="q" :class="{ open: expanded }" role="button" tabindex="0" :aria-expanded="expanded" @click="toggle" @keydown.enter.space.prevent="toggle">
    <div class="qn" :class="quest.req ? 'q-main' : 'q-side'">{{ quest.name }}</div>
    <div class="qmeta">{{ areaName }}<template v-if="quest.boss"> · <span class="unique">{{ quest.boss }}</span></template></div>
    <div class="qs">{{ tx(quest.sum) }}</div>
  </div>
</template>
