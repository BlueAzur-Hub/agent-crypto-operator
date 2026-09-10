import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const marketModule = {
  id: "market",
  title: "Market",
  kicker: "DATA CORE",
  size: "wide",
  render() {
    return `<p class="module-lead">Couche d’entrée des données marché. Dans 39.0 elle reste volontairement non branchée : aucun fetch, WebSocket, cache ou timer n’est lancé par ce squelette.</p>${contractRows([
      ["Entrées", "Binance LIVE, CoinGecko Market Snapshot, historiques graphiques."],
      ["Sorties", "Snapshot marché canonique et événements de disponibilité."],
      ["Règle", "Market ne dépend jamais d’Atlas, NØX ou Aerith."],
    ])}<p class="module-note">Le moteur validé reste dans Classic 38.15.11 jusqu’au branchement contrôlé.</p>`;
  },
  ...createStaticLifecycle("market"),
};
