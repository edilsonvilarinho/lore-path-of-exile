import { shallowReactive } from 'vue';

// Estado do único tooltip estilo item na tela, ancorado no topo-centro do elemento.
export const tip = shallowReactive({ act: null, node: null, x: 0, y: 0 });

export function showAreaTip(act, node, el) {
  const r = el.getBoundingClientRect();
  Object.assign(tip, { act, node, x: r.left + r.width / 2, y: r.top });
}

export function hideTip() {
  tip.node = null;
}
