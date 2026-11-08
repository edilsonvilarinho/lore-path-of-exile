<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import QuestItem from './QuestItem.vue';
import BossItem from './BossItem.vue';
import Portrait from './Portrait.vue';
import { tx } from '../i18n';

const props = defineProps({
  act: { type: Object, required: true },
  selected: { type: String, default: null },
  tab: { type: String, required: true },
});
const emit = defineEmits(['update:tab', 'focus-area', 'focus-boss']);
const { t } = useI18n();

const TABS = [['story', 'story'], ['quests', 'quests'], ['bosses', 'bosses'], ['area', 'here']];
const areaName = (id) => props.act.nodes.find((n) => n.id === id)?.name || id || '';
const mainQuests = computed(() => props.act.quests.filter((q) => q.req));
const sideQuests = computed(() => props.act.quests.filter((q) => !q.req));
const node = computed(() => props.act.nodes.find((n) => n.id === props.selected));
const nodeQuests = computed(() => (node.value ? props.act.quests.filter((q) => q.area === node.value.id) : []));
const nodeBosses = computed(() => (node.value ? props.act.bosses.filter((b) => b.area === node.value.id) : []));
const nodeMeta = computed(() => {
  const n = node.value;
  return [n.town && t('town'), n.lvl && `${t('level')} ${n.lvl}`, n.wp && t('waypoint')].filter(Boolean).join(' · ');
});
</script>

<template>
  <aside class="frame side">
    <div class="tabs">
      <button v-for="[key, label] in TABS" :key="key" class="poe-btn" :aria-selected="key === tab" @click="emit('update:tab', key)">
        {{ t(label) }}
      </button>
    </div>
    <div class="pane">
      <template v-if="tab === 'story'">
        <h3>{{ tx(act.title) }}</h3>
        <div class="sep"></div>
        <p>{{ tx(act.story) }}</p>
        <h4>{{ t('npcs') }}: {{ act.town }}</h4>
        <div class="npcl">
          <div v-for="npc in act.npcs" :key="npc.name" class="npc">
            <Portrait :img="npc.img" :name="npc.name" />
            <div><b>{{ npc.name }}</b><span>{{ tx(npc.role) }}</span></div>
          </div>
        </div>
      </template>

      <template v-else-if="tab === 'quests'">
        <h4>{{ t('main') }}</h4>
        <QuestItem v-for="(q, i) in mainQuests" :key="`m${i}`" :quest="q" :area-name="areaName(q.area)" @focus-area="emit('focus-area', $event)" />
        <h4>{{ t('side') }}</h4>
        <QuestItem v-for="(q, i) in sideQuests" :key="`s${i}`" :quest="q" :area-name="areaName(q.area)" @focus-area="emit('focus-area', $event)" />
      </template>

      <template v-else-if="tab === 'bosses'">
        <BossItem v-for="(b, i) in act.bosses" :key="i" :boss="b" :area-name="areaName(b.area)" @focus="emit('focus-boss', $event)" />
      </template>

      <template v-else>
        <p v-if="!node" class="hint">{{ t('select') }}</p>
        <template v-else>
          <h3 :class="{ 'town-name': node.town }">{{ node.name }}</h3>
          <div class="qmeta">{{ nodeMeta }}</div>
          <p v-if="node.also" class="qmeta">{{ t('also') }}: {{ node.also }}</p>
          <div v-if="node.unverified" class="warn">⚠ {{ t('unverified') }}</div>
          <div class="sep"></div>
          <template v-if="nodeBosses.length">
            <h4>{{ t('bosses') }}</h4>
            <BossItem v-for="(b, i) in nodeBosses" :key="`${node.id}b${i}`" :boss="b" :area-name="node.name" @focus="emit('focus-boss', $event)" />
          </template>
          <template v-if="nodeQuests.length">
            <h4>{{ t('quests') }}</h4>
            <QuestItem v-for="(q, i) in nodeQuests" :key="`${node.id}q${i}`" :quest="q" :area-name="node.name" open @focus-area="emit('focus-area', $event)" />
          </template>
          <p v-if="!nodeBosses.length && !nodeQuests.length" class="hint">{{ t('nothing') }}</p>
        </template>
      </template>
    </div>
  </aside>
</template>
