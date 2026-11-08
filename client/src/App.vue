<script setup>
import { useI18n } from 'vue-i18n';
import TopBar from './components/TopBar.vue';
import AreaTooltip from './components/AreaTooltip.vue';
import { useCampaign } from './stores/campaign';
import { tx } from './i18n';

const { t } = useI18n();
const camp = useCampaign();
camp.load();
</script>

<template>
  <TopBar />
  <template v-if="camp.status === 'ready'">
    <RouterView />
    <footer class="note">{{ tx(camp.meta?.note) }}</footer>
  </template>
  <div v-else-if="camp.status === 'error'" class="frame boot err">{{ t('loadError') }}: {{ camp.error }}</div>
  <div v-else class="frame boot">{{ t('loading') }}</div>
  <AreaTooltip />
</template>
