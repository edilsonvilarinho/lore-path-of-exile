<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCampaign } from '../stores/campaign';
import { useAudio } from '../stores/audio';
import { setLocale, tx } from '../i18n';

const { t, locale } = useI18n();
const camp = useCampaign();
const audio = useAudio();
const nowPlaying = computed(() => camp.track(audio.current)?.title || '');
</script>

<template>
  <header class="topbar">
    <RouterLink class="tb-name" to="/act/1">{{ tx(camp.meta?.title) }}</RouterLink>
    <span class="tb-now" :title="nowPlaying">{{ nowPlaying }}</span>
    <button class="poe-btn tb-mus" :class="{ on: audio.on }" @click="audio.toggle()">
      {{ audio.on ? '♫' : '♪' }} {{ t(audio.on ? 'musicOn' : 'musicOff') }}
    </button>
    <input v-model.number="audio.volume" class="tb-vol" type="range" min="0" max="1" step="0.05" :aria-label="t('volume')">
    <button class="poe-btn tb-lang" @click="setLocale(locale === 'pt' ? 'en' : 'pt')">
      {{ locale === 'pt' ? 'PT-BR | en' : 'EN | pt-br' }}
    </button>
  </header>
</template>
