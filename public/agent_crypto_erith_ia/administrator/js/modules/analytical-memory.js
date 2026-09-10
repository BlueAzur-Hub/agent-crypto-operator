import { contractRows, createStaticLifecycle } from "./module-utils.js";

export const analyticalMemoryModule = {
  id: "analytical-memory",
  title: "Analytical Memory",
  kicker: "CURRENT ARCHIVE",
  render() {
    return `<p class="module-lead">Mémoire réservée aux analyses réellement fermées. Elle ne remplace jamais Market Memory.</p>${contractRows([
      ["Unité", "Un CURRENT complet Atlas 4/4 → NØX → Aerith."],
      ["Conserve", "Fingerprint, rapports, conclusion, contradictions et état transactionnel."],
      ["Usage", "Comparer ce que le système avait conclu lors de cycles antérieurs."],
    ])}`;
  },
  ...createStaticLifecycle("analytical-memory"),
};
