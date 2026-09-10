import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const marketMemoryModule = {
  id: "market-memory",
  title: "Market Memory",
  kicker: "MEMORY INTELLIGENCE",
  size: "wide",
  render() {
    return `<p class="module-lead">Restaure l’objectif historique du Memory Intelligence : mémoriser le marché, pas compter les lancements d’Atlas.</p>${contractRows([
      ["Unité", "Une observation marché canonique distincte."],
      ["Horizons", "3 / 5 / 10 observations marché."],
      ["Mesures", "Persistance, secteurs récurrents, anomalies volume/capitalisation, mouvements isolés, comparaison collecteurs."],
      ["Interdit", "Un relevé Market Memory ne déclenche jamais Atlas."],
    ])}<p class="module-note">Atlas peut rester MANUEL pendant que Market Memory continue d’accumuler des observations.</p>`;
  },
  ...createStaticLifecycle("market-memory"),
};
