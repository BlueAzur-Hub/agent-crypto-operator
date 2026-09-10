import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const observabilityModule = {
  id: "observability",
  title: "Observability",
  kicker: "DIAGNOSTICS",
  render() {
    return `<p class="module-lead">Journal technique des états, événements et coûts de rendu. Son but est de détecter les cascades avant qu’elles ne saturent Firefox.</p>${contractRows([
      ["Observe", "Lifecycle modules, événements, erreurs, latence, rendu."],
      ["Interdit", "Aucun effet métier sur Market, Atlas ou les mémoires."],
    ])}`;
  },
  ...createStaticLifecycle("observability"),
};
