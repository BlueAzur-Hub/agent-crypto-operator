import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const systemModule = {
  id: "system",
  title: "System",
  kicker: "LOCAL STACK",
  render() {
    return `<p class="module-lead">État du poste, Bridge, Ollama, IndexedDB et rôle producteur/lecture. Aucun probe réseau n’est actif dans le squelette.</p>${contractRows([
      ["Référence", "Classic 38.15.11 : Control Center V2.3.2R5 · Bridge V1.9.5 · gpt-oss:20b-32k."],
      ["Règle", "System observe l’infrastructure ; il ne relance pas un cycle analytique."],
    ])}`;
  },
  ...createStaticLifecycle("system"),
};
