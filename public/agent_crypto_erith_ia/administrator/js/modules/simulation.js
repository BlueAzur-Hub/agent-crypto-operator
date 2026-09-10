import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const simulationModule = {
  id: "simulation",
  title: "Simulation",
  kicker: "SANDBOX",
  render() {
    return `<p class="module-lead">Espace isolé pour scénarios et essais futurs. Il ne modifie ni le marché réel, ni la mémoire canonique.</p>${contractRows([
      ["Statut", "Squelette uniquement."],
      ["Règle", "Toute simulation doit rester explicitement séparée de CURRENT et LIVE."],
    ])}`;
  },
  ...createStaticLifecycle("simulation"),
};
