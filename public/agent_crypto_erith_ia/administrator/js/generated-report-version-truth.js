/* Agent-Crypto Administrator — generated report build labels.
   Release history belongs to Git. This file has one stable name and reads the
   current build from the canonical boot/version authority. */
(() => {
  "use strict";

  const OWNER = "generated-report-version-truth";
  const TARGETS = Object.freeze([
    "atlasMemoryIntelligenceMarkdown",
    "buildLearningJournalMarkdown",
    "buildMemoryReportMarkdown",
    "buildAutomaticLearningJournalMarkdown",
    "buildWakePlanText",
    "buildCollectionPlanMarkdown"
  ]);
  const STALE_RELEASE_RE = /Build\s+\d+\.\d+\.\d+\s*·\s*Administrator/g;
  const originals = new Map();

  const currentBuild = () => String(
    globalThis.ErithVersionTruth?.build ||
    globalThis.AgentCryptoBootTruth?.build ||
    document.querySelector('meta[name="administrator-build"]')?.content ||
    "UNKNOWN"
  ).trim();

  const label = () => /^\d+\.\d+\.\d+$/.test(currentBuild())
    ? `Build ${currentBuild()} · Administrator`
    : "Build UNKNOWN · Administrator";

  const normalize = value => typeof value === "string"
    ? value.replace(STALE_RELEASE_RE, label())
    : value;

  function wrap(name) {
    const current = globalThis[name];
    if (typeof current !== "function") return false;
    if (current.__agentCryptoGeneratedReportVersionTruth === true) return true;
    const original = current;
    const wrapped = function(...args) { return normalize(original.apply(this, args)); };
    Object.defineProperty(wrapped, "__agentCryptoGeneratedReportVersionTruth", { value: true });
    Object.defineProperty(wrapped, "__agentCryptoGeneratedReportOriginal", { value: original });
    originals.set(name, original);
    globalThis[name] = wrapped;
    return true;
  }

  function syncVisibleGeneratedJournal() {
    const node = document.getElementById("simLearningOutput");
    if (!node || typeof node.textContent !== "string") return false;
    const current = node.textContent;
    const next = normalize(current);
    if (next !== current) node.textContent = next;
    return next !== current;
  }

  function install() {
    let wrapped = 0;
    for (const name of TARGETS) if (wrap(name)) wrapped += 1;
    const visibleJournalCorrected = syncVisibleGeneratedJournal();
    document.documentElement.dataset.generatedReportVersionTruth = wrapped === TARGETS.length ? "active" : "partial";
    return Object.freeze({ owner: OWNER, build: currentBuild(), label: label(), wrapped, expected: TARGETS.length, visible_journal_corrected: visibleJournalCorrected });
  }

  const onReady = () => { try { install(); } catch (_) {} };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady, { once: true });
  else queueMicrotask(onReady);
  window.addEventListener("erith:system-hydrated", onReady, { once: true, passive: true });

  globalThis.AgentCryptoGeneratedReportVersionTruth = Object.freeze({
    owner: OWNER,
    build: currentBuild,
    label,
    targets: TARGETS,
    install,
    normalize,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
