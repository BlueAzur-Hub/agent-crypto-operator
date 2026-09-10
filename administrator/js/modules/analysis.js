import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const analysisModule = {
  id: "analysis",
  title: "Atlas · NØX · Aerith",
  kicker: "ANALYSIS PIPELINE",
  size: "wide",
  render() {
    return `<p class="module-lead">Chaîne analytique CURRENT conservée comme unité séparée : Atlas 4/4 → NØX → Aerith → fermeture du CURRENT.</p>${contractRows([
      ["Entrée", "Snapshot canonique figé avec fingerprint."],
      ["Cycle", "Atlas 4/4 → NØX → Aerith."],
      ["Commande", "AUTO / MANUEL reste une propriété du pipeline analytique."],
      ["Sortie", "CURRENT fermé, vérifiable et immuable."],
    ])}<p class="module-note warn">Aucune exécution Ollama ou Bridge n’est déclenchée dans 39.0 skeleton.</p>`;
  },
  ...createStaticLifecycle("analysis"),
};
