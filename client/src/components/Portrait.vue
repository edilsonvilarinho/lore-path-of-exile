<script setup>
// Retrato(s) da PoE Wiki em assets/portraits. 1 imagem = quadro inteiro; 2-4 = mosaico 2x2; sem img = inicial.
defineProps({
  img: { type: Array, default: () => [] },
  name: { type: String, required: true },
});
</script>

<template>
  <div class="sk" :class="{ multi: img.length > 1 }">
    <img v-for="f in img.slice(0, 4)" :key="f" :src="`/assets/portraits/${f}`" :alt="name" loading="lazy" />
    <template v-if="!img.length">{{ name[0] }}</template>
  </div>
</template>
