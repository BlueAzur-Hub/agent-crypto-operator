import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const decisionBoardModule = {
  id: "decision-board",
  title: "Decision Board",
  kicker: "COLD READING",
  size: "wide",
  render() {
    return `<p class="module-lead">Point de lecture croisée. Il peut consulter Market Memory et Analytical Memory sans fusionner leurs unités.</p>${contractRows([
      ["Lit", "Snapshot courant, Market Memory 3/5/10, CURRENT antérieurs, contradictions."],
      ["Produit", "État descriptif de travail uniquement."],
      ["Interdit", "Aucun ordre financier, aucune fabrication de données manquantes, aucune assimilation observation = CURRENT."],
    ])}`;
  },
  ...createStaticLifecycle("decision-board"),
};
