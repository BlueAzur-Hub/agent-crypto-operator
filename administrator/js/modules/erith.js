import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const erithModule = {
  id: "erith",
  title: "@erith",
  kicker: "OPERATOR LAYER",
  render() {
    return `<p class="module-lead">Couche opératrice : dialogue, explication et accès aux productions Atlas/Aerith sans devenir une source de vérité marché.</p>${contractRows([
      ["Lit", "Données et rapports déjà produits."],
      ["Ne fait pas", "Réécrire CURRENT, inventer des prix ou déclencher silencieusement des traitements."],
    ])}`;
  },
  ...createStaticLifecycle("erith"),
};
