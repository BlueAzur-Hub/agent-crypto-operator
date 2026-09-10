(() => {
  "use strict";
  const metaTruth406025 = name => document.querySelector(`meta[name="${name}"]`)?.content?.trim() || "";
  const ADMIN_BUILD = metaTruth406025("administrator-build") || "UNKNOWN";
  const ADMIN_RELEASE = metaTruth406025("administrator-release") || "UNKNOWN";
  const ENGINE_BUILD = metaTruth406025("atlas-engine-build") || "UNKNOWN";
  const STORAGE_PREFIX = "erith_admin_portal_39_2_9";

  const WORKSPACE_RUNTIME_CONTRACT_40227 = Object.freeze({
    build: "40.2.27",
    checkpoint_only: true,
    x_semantics: "mask_presentation_only",
    reset_windows_semantics: "restore_native_presentation_only",
    minimized_semantics: "presentation_reduced_engine_state_unchanged",
    collapsed_semantics: "section_collapsed_engine_state_unchanged",
    views_own_business_engines: false,
    workspace_profile_owns_analytical_context: false,
    graph_context_v7_is_analytical_authority: true,
    oracle_visibility_dependency_allowed: false,
    targeted_render_optimization_added: false,
    render_gate_added: false,
    engine_stop_added: false,
    dom_removal_added: false,
    storage_retirement_added: false,
    evidence_basis: Object.freeze(["40.2.25 runtime visibility", "40.2.26 reduced/collapsed attribution"])
  });
  globalThis.ErithWorkspaceRuntimeContract40227 = WORKSPACE_RUNTIME_CONTRACT_40227;

  const STORAGE_LINEAGE_DECISION_CONTRACT_40228 = Object.freeze({
    build: "40.2.28",
    operator_triggered_only: true,
    read_only: true,
    automatic_boot_scan: false,
    automatic_cleanup: false,
    deletion_enabled: false,
    migration_enabled: false,
    retirement_gate: "CLOSED",
    decision_states: Object.freeze(["ACTIVE", "ACTIVE_LEGACY", "MIGRATED", "REVIEW_REQUIRED", "RETIRABLE_PROVEN"]),
    no_exact_reference_is_not_retirement_proof: true,
    retirable_proven_requires_positive_non_ownership_proof: true,
    current_business_reference_ledger: true,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false,
    performance_optimization_added: false,
    window_manager_modified: false,
    runtime_checkpoint_40_2_27_preserved: true
  });
  globalThis.ErithStorageLineageDecisionContract40228 = STORAGE_LINEAGE_DECISION_CONTRACT_40228;

  const STORAGE_OWNERSHIP_PROOF_CONTRACT_40229 = Object.freeze({
    build: "40.2.29",
    operator_triggered_only: true,
    read_only: true,
    automatic_boot_scan: false,
    automatic_cleanup: false,
    deletion_enabled: false,
    migration_enabled: false,
    retirement_gate: "CLOSED",
    positive_owner_proof_only: true,
    unresolved_absence_is_not_non_ownership_proof: true,
    retirable_proven_predeclared: 0,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false,
    performance_optimization_added: false,
    window_manager_modified: false,
    parent_decision_40_2_28_preserved: true
  });
  globalThis.ErithStorageOwnershipProofContract40229 = STORAGE_OWNERSHIP_PROOF_CONTRACT_40229;


  const VISUAL_CONTINUITY_CONTRACT_40230 = Object.freeze({
    build: "40.2.30",
    visual_only: true,
    existing_repository_assets_only: true,
    technical_portrait_complete_foreground_preserved: true,
    technical_portrait_letterbox_backdrop_fill: true,
    intelligence_family_emblem_added: true,
    asset_used_for_intelligence_family: "./assets/visual/admin-analytical-memory.png",
    image_generation_added: false,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false,
    oracle_model_modified: false,
    evidence_semantics_changed: false,
    window_manager_modified: false,
    market_flow_modified: false
  });
  globalThis.ErithVisualContinuityContract40230 = VISUAL_CONTINUITY_CONTRACT_40230;

  function applyVisualContinuity40230() {
    const intelligence = document.querySelector(".atlas-layout-family-intelligence");
    if (intelligence) {
      intelligence.classList.add("admin-family-emblem-host-r3", "atlas-visual-continuity-40230");
      if (!intelligence.querySelector('.admin-family-emblem-r3[data-for="intelligence-40230"]')) {
        const img = document.createElement("img");
        img.className = "admin-family-emblem-r3";
        img.dataset.for = "intelligence-40230";
        img.src = "./assets/visual/admin-analytical-memory.png";
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        img.loading = "lazy";
        img.decoding = "async";
        intelligence.appendChild(img);
      }
    }
    const detail = document.getElementById("detailPanel");
    if (detail) detail.classList.add("atlas-tech-letterbox-fill-40230");
    return Boolean(intelligence && detail);
  }

  function bindVisualContinuity40230() {
    if (document.documentElement.dataset.visualContinuity40230 === "1") return;
    document.documentElement.dataset.visualContinuity40230 = "1";
    applyVisualContinuity40230();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindVisualContinuity40230, { once: true });
  else bindVisualContinuity40230();

  globalThis.ErithVisualContinuity40230 = Object.freeze({
    build: "40.2.30",
    apply: applyVisualContinuity40230,
    visual_only: true,
    existing_repository_assets_only: true,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false
  });

  const ORACLE_V2_EVALUATION_CONTRACT_40231 = Object.freeze({
    build: "40.2.31",
    operator_triggered_only: true,
    read_only: true,
    same_t0_required: true,
    prospective_shadow_only: true,
    horizons: Object.freeze(["1m", "5m", "15m"]),
    comparison_models: Object.freeze(["oracle_v2_shadow", "oracle_v1", "ensemble", "best_naive"]),
    minimum_cases_per_horizon_for_data_ready: 100,
    coherent_advantage_rule: "V2 >= V1 and V2 >= best naive on all 3 horizons, with >0 edge on at least one horizon",
    source_health_stratification: true,
    regime_stratification: true,
    automatic_promotion: false,
    model_weights_changed: false,
    oracle_v1_changed: false,
    shadow_snapshot_changed: false,
    evidence_capture_changed: false,
    outcome_resolution_changed: false,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false,
    window_manager_modified: false
  });
  globalThis.ErithOracleV2EvaluationContract40231 = ORACLE_V2_EVALUATION_CONTRACT_40231;

  const ORACLE_VERDICT_HIERARCHY_CONTRACT_40232A = Object.freeze({
    build: "40.2.32A",
    visual_only: true,
    verdict_priority_only: true,
    existing_oracle_values_only: true,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    storage_write_added: false,
    network_request_added: false,
    timer_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleVerdictHierarchyContract40232A = ORACLE_VERDICT_HIERARCHY_CONTRACT_40232A;

  const ORACLE_TIME_FIELD_CONTRACT_40232B = Object.freeze({
    build: "40.2.32B",
    visual_only: true,
    historical_now_scenario_emphasis: true,
    canvas_data_unchanged: true,
    forecast_math_changed: false,
    oracle_model_modified: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleTimeFieldContract40232B = ORACLE_TIME_FIELD_CONTRACT_40232B;

  const ORACLE_INFORMATION_HIERARCHY_CONTRACT_40232C = Object.freeze({
    build: "40.2.32C",
    visual_only: true,
    same_dom_content: true,
    operator_context_lab_levels: true,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleInformationHierarchyContract40232C = ORACLE_INFORMATION_HIERARCHY_CONTRACT_40232C;

  const ORACLE_RUNTIME_STETHOSCOPE_CONTRACT_40232D = Object.freeze({
    build: "40.2.32D",
    passive_read_only: true,
    existing_state_only: true,
    timer_added: false,
    network_request_added: false,
    websocket_added: false,
    engine_start_added: false,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    storage_write_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleRuntimeStethoscopeContract40232D = ORACLE_RUNTIME_STETHOSCOPE_CONTRACT_40232D;

  const ORACLE_OPERATOR_VISUAL_STACK_CONTRACT_40232 = Object.freeze({
    build: "40.2.32",
    cumulative: true,
    contains: Object.freeze(["40.2.32A", "40.2.32B", "40.2.32C", "40.2.32D"]),
    code_only: true,
    image_generation_added: false,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleOperatorVisualStackContract40232 = ORACLE_OPERATOR_VISUAL_STACK_CONTRACT_40232;

  const ORACLE_OPERATOR_CONSOLE_FINAL_CONTRACT_40233 = Object.freeze({
    build: "40.2.33",
    final_lock: true,
    fit_overflow_contrast_only: true,
    inherits_cumulative_40_2_32: true,
    code_only: true,
    image_generation_added: false,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    network_request_added: false,
    timer_added: false,
    storage_write_added: false,
    window_manager_modified: false,
  });
  globalThis.ErithOracleOperatorConsoleFinalContract40233 = ORACLE_OPERATOR_CONSOLE_FINAL_CONTRACT_40233;

  const NEWS_TO_MARKET_CAUSAL_ROLE_CONTRACT_40234 = Object.freeze({
    build: "40.2.34",
    code_only: true,
    deterministic_local: true,
    existing_news_archive_only: true,
    existing_market_state_only: true,
    role_classes: Object.freeze(["CATALYSEUR", "AMPLIFICATEUR", "FLUX", "RÉACTION", "CONCOMITANCE"]),
    semantic_conflict_exposed: true,
    causal_claim_allowed: false,
    external_ai_required: false,
    new_network_request_added: false,
    timer_added: false,
    websocket_added: false,
    storage_write_added: false,
    automatic_action_added: false,
    news_collector_modified: false,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    window_manager_modified: false,
  });
  globalThis.ErithNewsToMarketCausalRoleContract40234 = NEWS_TO_MARKET_CAUSAL_ROLE_CONTRACT_40234;


  const NEWS_TO_MARKET_OPERATOR_INTELLIGENCE_CONTRACT_40235 = Object.freeze({
    build: "40.2.35",
    code_only: true,
    deterministic_local: true,
    explanatory_layer_added: true,
    fact_extraction_from_loaded_news_only: true,
    mechanism_chain_explanatory_not_predictive: true,
    initial_catalyst_requires_positive_evidence: true,
    technical_trigger_separate_from_external_catalyst: true,
    demand_context_requires_explicit_text_match: true,
    causal_claim_allowed: false,
    external_ai_required: false,
    new_network_request_added: false,
    timer_added: false,
    websocket_added: false,
    storage_write_added: false,
    oracle_model_modified: false,
    evidence_capture_changed: false,
    window_manager_modified: false,
  });
  globalThis.ErithNewsToMarketOperatorIntelligenceContract40235 = NEWS_TO_MARKET_OPERATOR_INTELLIGENCE_CONTRACT_40235;



  const EVENT_REACTION_TIMELINE_CONTRACT_40236 = Object.freeze({
    build: "40.2.36", code_only: true, local_chart_cache_only: true, fetch_added: false,
    event_timestamp_anchor: true, windows_minutes: Object.freeze([-15,0,15,60,240]),
    causality_inferred: false, timeline_missing_data_is_explicit: true,
    timer_added: false, websocket_added: false, storage_write_added: false,
    oracle_model_modified: false, evidence_capture_changed: false, window_manager_modified: false,
  });
  globalThis.ErithEventReactionTimelineContract40236 = EVENT_REACTION_TIMELINE_CONTRACT_40236;



  const ROLE_EVIDENCE_QUALITY_CONTRACT_40237 = Object.freeze({
    build:"40.2.37", code_only:true, role_quality_not_causal_probability:true,
    transparent_components:true, source_independence_not_invented:true,
    timeline_coverage_component:true, causal_probability_calculated:false,
    new_network_request_added:false, timer_added:false, websocket_added:false, storage_write_added:false,
    oracle_model_modified:false, evidence_capture_changed:false, window_manager_modified:false,
  });
  globalThis.ErithRoleEvidenceQualityContract40237 = ROLE_EVIDENCE_QUALITY_CONTRACT_40237;



  const CROSS_LAYER_MARKET_EXPLANATION_CONTRACT_40238 = Object.freeze({
    build:"40.2.38", code_only:true, independent_layers_preserved:true,
    news_market_oracle_atlas_compared_not_fused:true, descriptive_convergence_only:true,
    oracle_model_modified:false, atlas_model_modified:false, causal_claim_allowed:false,
    new_network_request_added:false, timer_added:false, websocket_added:false, storage_write_added:false,
    evidence_capture_changed:false, window_manager_modified:false,
  });
  globalThis.ErithCrossLayerMarketExplanationContract40238 = CROSS_LAYER_MARKET_EXPLANATION_CONTRACT_40238;



  const ORACLE_NEWS_CONTEXT_INTEGRATION_CONTRACT_40239 = Object.freeze({
    build:"40.2.39", code_only:true, compact_summary_only:true, source_of_truth:"news-sentinel",
    timeline_quality_cross_layer_reused:true, oracle_forecast_math_changed:false,
    oracle_v2_changed:false, evidence_capture_changed:false, causal_claim_allowed:false,
    new_network_request_added:false, timer_added:false, websocket_added:false, storage_write_added:false, window_manager_modified:false,
  });
  globalThis.ErithOracleNewsContextIntegrationContract40239 = ORACLE_NEWS_CONTEXT_INTEGRATION_CONTRACT_40239;



  const NEWS_TO_MARKET_FINAL_LOCK_CONTRACT_40240 = Object.freeze({
    build:"40.2.40", final_lock:true, cumulative_from:"40.2.35-40.2.39",
    css_fit_overflow_responsive_only:true, new_intelligence_added:false, code_only:true,
    image_generation_added:false, oracle_model_modified:false, oracle_v2_changed:false,
    atlas_model_modified:false, evidence_capture_changed:false, causal_claim_allowed:false,
    new_network_request_added:false, timer_added:false, websocket_added:false, storage_write_added:false, window_manager_modified:false,
  });
  globalThis.ErithNewsToMarketFinalLockContract40240 = NEWS_TO_MARKET_FINAL_LOCK_CONTRACT_40240;


  const ORACLE_RESTORE_NEWS_PLACEMENT_CONTRACT_40241 = Object.freeze({
    build:"40.2.58", code_only:true, corrective_layout:true,
    oracle_news_context_unmounted:true, oracle_operator_outer_frame_removed:true,
    oracle_bull_bear_metrics_restored_to_primary_readout:true,
    news_report_moved_to_dedicated_news_accordion:true,
    existing_inline_svg_geometry_reused:true, image_asset_added:false, image_generation_added:false,
    news_intelligence_changed:false, oracle_model_modified:false, oracle_v2_changed:false,
    atlas_model_modified:false, evidence_capture_changed:false, window_manager_modified:false,
    new_network_request_added:false, timer_added:false, websocket_added:false, storage_write_added:false
  });
  globalThis.ErithOracleRestoreNewsPlacementContract40241 = ORACLE_RESTORE_NEWS_PLACEMENT_CONTRACT_40241;


  const byId = id => document.getElementById(id);
  const q = selector => document.querySelector(selector);

  function siblingRange(start, endExclusive) {
    if (!(start instanceof HTMLElement)) return [];
    const result = [];
    let node = start;
    while (node && node !== endExclusive) {
      if (node instanceof HTMLElement) result.push(node);
      node = node.nextElementSibling;
    }
    return result;
  }

  function groupFrom(startSelector, endSelector) {
    const start = q(startSelector);
    const end = endSelector ? q(endSelector) : null;
    return siblingRange(start, end);
  }

  // 40.3.02 — family ownership is semantic AND top-level.
  // Nested analytical widgets inside Atlas/Oracle are never allowed to become
  // movable siblings of another Administrator family.
  function familyEntriesByTopLevelLayout(headerSelector, layoutNames = []) {
    const shell = q("main.shell");
    const header = q(headerSelector);
    const allowed = new Set(layoutNames.map(name => String(name || "").trim()).filter(Boolean));
    const members = shell
      ? [...shell.children].filter(node => node instanceof HTMLElement && allowed.has(String(node.dataset.layoutFamily || "")))
      : [];
    return [header, ...members]
      .filter((node, index, list) => node instanceof HTMLElement && node.parentElement === shell && list.indexOf(node) === index)
      .map(node => entry(node));
  }

  // 40.3.20 — restore the canonical lower Administrator hierarchy.
  // The 03 owner remains explicit: header + Situation/Questionnaire/Briefing/Plan.
  // The 04 owner is again a real opening header: 04 -> Storage -> Simulation ->
  // Tests/Commands -> Backend -> Safety -> Physical Security -> Missions.
  const ADMIN_OPERATION_KEYS_40308 = new Set([
    "situation", "questionnaire", "briefing", "planning"
  ]);
  const ADMIN_SYSTEM_KEYS_40308 = new Set([
    "simulation", "commandes", "backend", "safety", "physical-security"
  ]);

  function preparationEntries40308() {
    const shell = q("main.shell");
    const header = q(".atlas-layout-family-operations");
    if (!shell || !(header instanceof HTMLElement)) return [];
    return [...shell.children]
      .filter(node => node instanceof HTMLElement && (
        node === header
        || (node instanceof HTMLDetailsElement && ADMIN_OPERATION_KEYS_40308.has(String(node.dataset.collapseKey || "")))
      ))
      .map(node => entry(node));
  }

  function systemEntriesCanonical40320() {
    const shell = q("main.shell");
    const header = q(".atlas-layout-family-system");
    const storage = byId("atlasStorageHealth40198");
    if (!shell || !(header instanceof HTMLElement)) return [];
    const details = [...ADMIN_SYSTEM_KEYS_40308]
      .map(key => shell.querySelector(`:scope > details[data-collapse-key="${key}"]`))
      .filter(node => node instanceof HTMLDetailsElement);
    return [header, storage, ...details]
      .filter((node, index, list) => node instanceof HTMLElement && node.parentElement === shell && list.indexOf(node) === index)
      .map(node => entry(node));
  }

  // 40.4.4 — Grey Plate Forensic is a real member of family 04.
  // 40.3.93 introduced the forensic panel after the canonical 40.3.20 family
  // membership list had already been frozen, so Reduce/Hide/Detach could leave
  // the probe visible outside its 04 owner. Keep the historical 40.3.20 helper
  // untouched and route the current definition through this explicit owner.
  function systemEntriesCanonical40404() {
    const shell = q("main.shell");
    const header = q(".atlas-layout-family-system");
    const storage = byId("atlasStorageHealth40198");
    const greyForensic = byId("atlasGreyPlateForensic40393");
    if (!shell || !(header instanceof HTMLElement)) return [];
    const details = [...ADMIN_SYSTEM_KEYS_40308]
      .map(key => shell.querySelector(`:scope > details[data-collapse-key="${key}"]`))
      .filter(node => node instanceof HTMLDetailsElement);
    return [header, storage, greyForensic, ...details]
      .filter((node, index, list) => node instanceof HTMLElement && node.parentElement === shell && list.indexOf(node) === index)
      .map(node => entry(node));
  }

  const ADMIN_MISSION_KEYS_40302 = new Set([
    "fonds-erith", "association-erith", "aerith-enfance", "aerith-animaux", "aerith-terre-vivante"
  ]);

  function missionEntries40302() {
    const shell = q("main.shell");
    if (!shell) return [];
    const intro = byId("missions-vie");
    const members = [...shell.children].filter(node =>
      node instanceof HTMLDetailsElement && ADMIN_MISSION_KEYS_40302.has(String(node.dataset.collapseKey || ""))
    );
    return [intro, ...members]
      .filter((node, index, list) => node instanceof HTMLElement && node.parentElement === shell && list.indexOf(node) === index)
      .map(node => entry(node));
  }

  // 40.4.5 — Presentation extraction only. missionEntries40302 remains the
  // canonical Window Manager owner for Missions de vie; no membership rewrite.
  const PROJECTS_PRESENTATION_EXTRACTION_40405 = Object.freeze({
    build: "40.4.5",
    owner: "missionEntries40302",
    intro: "missions-vie",
    keys: Object.freeze(["fonds-erith", "association-erith", "aerith-enfance", "aerith-animaux", "aerith-terre-vivante"]),
    audience_is_independent: true,
    sources_are_independent: true
  });

  // 40.4.6 — Oracle presentation-only debt settlement.
  // Engine, Evidence, Source Health and Window Manager ownership stay unchanged.
  const ORACLE_UI_CONTINUITY_40406 = Object.freeze({
    build: "40.4.6",
    suite: "oracle-analysis-suite",
    collapsed_summary: "bias + confidence + horizon + bull/bear bars",
    accordion_members: Object.freeze(["oracle-models-calibration", "oracle-sources-runtime", "oracle-evidence-explorer"]),
    one_heavy_subsection_open_at_once: true,
    engine_changed: false,
    window_manager_changed: false
  });

  function entry(node, domain = "all") {
    return node instanceof HTMLElement ? { node, domain } : null;
  }

  function currentDomain() {
    return String(document.documentElement.dataset.atlasMarketDomain || "crypto").toLowerCase() === "metals"
      ? "metals"
      : "crypto";
  }

  function portalHost(kind, domain = currentDomain()) {
    const metals = domain === "metals";
    if (kind === "target" || kind === "flow") {
      return metals
        ? (q("#atlasMetalsMarketArea .atlas-metals-market-ribbons") || byId("atlasMetalsMarketArea"))
        : byId("market-workspace");
    }
    if (kind === "market") {
      return metals
        ? (q("#atlasMetalsMarketArea .atlas-metals-market-grid") || byId("atlasMetalsMarketArea"))
        : byId("marketWorkspaceGrid");
    }
    return null;
  }

  function nativeDefinitions() {
    return [
      {
        id: "aether-watch",
        title: "Aether · Attention Watch",
        tone: "cyan",
        directFixed: true,
        geometryPolicy: { minWidth: 720, minHeight: 405, keepFullyVisible: true },
        preferredFloatGeometry: () => {
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const width = Math.max(720, Math.min(1450, vw - 32, (vh * 1.7777777778) - 352));
          const height = Math.max(405, Math.min(vh - 24, width * 9 / 16));
          const fittedWidth = Math.min(width, height * 16 / 9);
          const fittedHeight = fittedWidth * 9 / 16;
          return {
            x: Math.max(12, Math.round((vw - fittedWidth) / 2)),
            y: Math.max(12, Math.round((vh * .5 + 99) - fittedHeight / 2)),
            width: Math.round(fittedWidth),
            height: Math.round(fittedHeight)
          };
        },
        resolveEntries: () => [entry(byId("atlasAetherStatusPanel4084"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0],
        resolveControlHosts: nodes => [nodes[0]?.querySelector(".atlas-aether-panel-head-4084")].filter(Boolean),
        placeholderPolicy: "preserve"
      },
      {
        id: "graphique",
        title: "Graphique + Lecture technique · Crypto",
        tone: "cyan",
        directFixed: true,
        resolveEntries: () => [entry(byId("analyste"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "oracle-graph",
        title: "Oracle V1 · Scénario court",
        tone: "violet",
        directFixed: true,
        geometryPolicy: { minWidth: 520, minHeight: 360, keepFullyVisible: true },
        preferredFloatGeometry: () => {
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const rect = byId("atlasOracleV0")?.getBoundingClientRect?.();
          const width = Math.min(980, Math.max(620, Math.round(vw * 0.62)));
          const height = Math.min(680, Math.max(420, Math.round(rect?.height || vh * 0.68)));
          return { x: Math.max(12, Math.round((vw - width) / 2)), y: Math.max(72, Math.round((vh - height) / 2)), width, height };
        },
        resolveEntries: () => [entry(byId("atlasOracleV0"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0],
        resolveControlHosts: () => [byId("atlasOracleV0")].filter(Boolean)
      },
      {
        id: "target-top",
        title: "Target Top 5",
        tone: "gold",
        directFixed: true,
        resolveEntries: () => [entry(q("#market-workspace .top5-ribbon"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "market-flow",
        title: "Market Flow",
        tone: "cyan",
        directFixed: true,
        // 40.1.26: Target Top owns the external move pattern; Market Flow only
        // adapts its native ticker-strip height while detached. No custom x/y path.
        geometryPolicy: { minHeight: 54, maxHeight: 54 },
        resolveEntries: () => [entry(q("#market-workspace .market-flow-ribbon"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "market",
        title: "Market Snapshot · Crypto",
        tone: "gold",
        resolveEntries: () => [
          entry(byId("marketSnapshotPanel"), "crypto"),
          entry(byId("atlasMetalsMarketSnapshot"), "metals"),
          entry(byId("atlasMetalsMarketRegistry"), "metals")
        ].filter(Boolean),
        resolveAnchor: nodes => byId("marketSnapshotPanel") || nodes[0],
        resolveControlHosts: (nodes, entries) => entries
          .filter(item => item.node.id === "marketSnapshotPanel" || item.node.id === "atlasMetalsMarketSnapshot")
          .map(item => item.node)
      },
      {
        id: "math-core",
        title: "Atlas Math Core · Crypto",
        tone: "gold",
        directFixed: true,
        preferredFloatGeometry: () => {
          const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
          const rect = byId("math")?.getBoundingClientRect?.();
          const width = Math.min(760, Math.max(520, Math.round(vw * 0.42)));
          const height = Math.min(Math.max(360, Math.round(rect?.height || 460)), Math.max(360, vh - 96), 640);
          return { x: Math.max(12, vw - width - 18), y: Math.max(72, Math.min(118, Math.round(vh * 0.11))), width, height };
        },
        resolveEntries: () => [entry(byId("math"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0],
        resolveControlHosts: () => {
          const host = byId("math")?.querySelector?.(".atlas-math-dock-actions");
          return host ? [host] : [byId("math")].filter(Boolean);
        }
      },
      {
        id: "analyse-decision",
        placeholderPolicy: "compact-family",
        title: "Analyse & décision",
        tone: "cyan",
        resolveEntries: () => familyEntriesByTopLevelLayout(".atlas-layout-family-analysis", ["analysis"]),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-analysis")) || nodes[0],
        // 40.3.01/40.3.02 — docked Reduce keeps the native 01 header + Oracle summary; ownership is now top-level atomic.
        resolveCompactNodes: () => [q(".atlas-layout-family-analysis"), byId("oracle-analysis-suite")].filter(Boolean),
        resolveCompactCollapsedDetails: () => [byId("oracle-analysis-suite")].filter(Boolean)
      },
      {
        id: "intelligence-memoire-creation",
        placeholderPolicy: "compact-family",
        title: "Intelligence, mémoire & création",
        tone: "violet",
        resolveEntries: () => familyEntriesByTopLevelLayout(".atlas-layout-family-intelligence", ["intelligence", "creation"]),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-intelligence")) || nodes[0],
        // 40.3.01/40.3.02 — docked Reduce keeps the native 02 header + Atlas CURRENT summary; ownership is now top-level atomic.
        resolveCompactNodes: () => [q(".atlas-layout-family-intelligence"), byId("atlas-local-ai-collapse")].filter(Boolean),
        resolveCompactCollapsedDetails: () => [byId("atlas-local-ai-collapse")].filter(Boolean)
      },
      {
        id: "preparation-operations",
        placeholderPolicy: "compact-family",
        title: "Préparation & opérations",
        tone: "gold",
        // 40.3.08 — explicit 03 membership: header + Situation/Questionnaire/Briefing/Planning only.
        // No System/Experiment node can be absorbed by semantic proximity or DOM adjacency.
        resolveEntries: () => preparationEntries40308(),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-operations")) || nodes[0],
        // 40.3.01/40.3.02 — docked Reduce keeps the real family header, never a generic minibar.
        resolveCompactNodes: () => [q(".atlas-layout-family-operations")].filter(Boolean)
      },
      {
        id: "experimentation-systeme",
        placeholderPolicy: "compact-family",
        title: "Expérimentation & système",
        tone: "orange",
        // 40.3.20 — canonical docked order: 04 header -> Storage -> Simulation ->
        // Commands -> Backend -> Safety -> Physical Security. The header opens
        // the family it names; an explicit detach may move the real nodes.
        resolveEntries: () => systemEntriesCanonical40404(),
        resolveAnchor: nodes => nodes.find(node => node.classList.contains("atlas-layout-family-system")) || nodes[0],
        resolveCompactNodes: () => [q(".atlas-layout-family-system")].filter(Boolean)
      },
      {
        id: "missions-de-vie",
        placeholderPolicy: "compact-family",
        title: "Missions de vie",
        tone: "gold",
        resolveEntries: () => missionEntries40302(),
        resolveAnchor: nodes => byId("missions-vie") || nodes[0]
      },
      {
        id: "mesure-audience",
        title: "Mesure d’audience",
        tone: "silver",
        resolveEntries: () => [entry(byId("mesure-audience"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      },
      {
        id: "sources",
        title: "Sources",
        tone: "green",
        resolveEntries: () => [entry(byId("liveSourcesCollapse"))].filter(Boolean),
        resolveAnchor: nodes => nodes[0]
      }
    ];
  }

  function installOracleGraphWindowChrome404156() {
    if (document.getElementById("atlasOracleGraphWindowChrome404156")) return true;
    const style = document.createElement("style");
    style.id = "atlasOracleGraphWindowChrome404156";
    style.textContent = `
      #atlasOracleV0.admin-native-anchor{--native-accent:#b890ff}
      #atlasOracleV0.admin-native-anchor>.admin-native-controls{top:6px!important;right:8px!important;z-index:80!important;opacity:.84}
      #atlasOracleV0.admin-native-anchor>.atlas-oracle-head{padding-right:176px}
      #atlasOracleV0.admin-native-direct-floating>.admin-native-controls{opacity:1!important}
      @media(max-width:900px){
        #atlasOracleV0.admin-native-anchor>.atlas-oracle-head{padding-right:142px}
        #atlasOracleV0.admin-native-anchor>.admin-native-controls .admin-native-control{width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important}
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  globalThis.ErithOracleGraphWindow404156 = Object.freeze({
    build: "40.4.156",
    window_id: "oracle-graph",
    owner: "existing Administrator Window Manager",
    direct_fixed: true,
    movable: true,
    resizable: true,
    persisted_by_existing_window_manager: true,
    oracle_engine_changed: false,
    forecast_math_changed: false,
    canvas_data_changed: false,
    timer_added: false,
    observer_added: false,
    fetch_added: false
  });

  function installGlobalVersionIdentity() {
    document.documentElement.dataset.administratorBuild = ADMIN_BUILD;
    document.documentElement.dataset.agentCryptoBuild = ADMIN_BUILD;
    document.body.dataset.administratorRelease = ADMIN_RELEASE;
    document.title = `Agent-Crypto @erith.IA — Build ${ADMIN_BUILD} · Administrator`;

    const versionControl = byId("atlasVersionControl");
    const versionText = byId("atlasVersionControlText");
    if (versionControl) {
      versionControl.setAttribute("aria-label", `Version Agent-Crypto installée : Build ${ADMIN_BUILD}. Cliquer pour vérifier GitHub.`);
      versionControl.dataset.adminGlobalVersion = ADMIN_BUILD;
    }
    if (versionText) versionText.textContent = `Build ${ADMIN_BUILD} · Administrator`;

    const hiddenRelease = byId("atlasV2ReleaseBadge");
    if (hiddenRelease) hiddenRelease.textContent = `Agent-Crypto @erith.IA · Build ${ADMIN_BUILD} · Administrator`;

    const statusStack = q(".hero .status-stack");
    let engineBadge = byId("administratorEngineBadge");
    if (!engineBadge && statusStack) {
      engineBadge = document.createElement("span");
      engineBadge.id = "administratorEngineBadge";
      engineBadge.className = "pill admin-engine-badge";
      statusStack.insertBefore(engineBadge, byId("liveStatus") || statusStack.lastElementChild);
    }
    if (engineBadge) {
      engineBadge.textContent = `ENGINE · Market Core ${ENGINE_BUILD}`;
      engineBadge.title = `Moteur métier hérité de la Classic ${ENGINE_BUILD}`;
    }

    // COMPACT HOME LOCK · inherited from validated 39.9.0R2
    // The extra Administrator Mirror identity line was useful during validation,
    // but it changes the home header height. Final UI keeps the existing header
    // geometry and version indicators only.
    byId("administratorMirrorIdentity")?.remove();

    const footer = byId("footerRelease");
    if (footer) footer.textContent = `Agent-Crypto @erith.IA · Administrator ${ADMIN_BUILD} · Market Core ${ENGINE_BUILD} · Web Classic · manifeste`;
  }

  function updateLayoutButton(button, free) {
    button.setAttribute("aria-pressed", String(free));
    button.textContent = free ? "FENÊTRES LIBRES" : "FENÊTRES VERROUILLÉES";
    button.title = free
      ? "Déplacement des fenêtres opérationnelles activé"
      : "Déplacement verrouillé · réduction/restauration reste disponible";
  }

  function installAdminBar(manager) {
    q(".admin-mirror-bar")?.remove();
    const bar = document.createElement("aside");
    bar.className = "admin-mirror-bar admin-mirror-bar-39-2-8";
    bar.setAttribute("aria-label", "Administrator Portal Windows controls");

    const brand = document.createElement("span");
    brand.className = "admin-mirror-brand";
    brand.innerHTML = `AGENT-CRYPTO <b>${ADMIN_BUILD}</b> · ADMINISTRATOR`;

    const layout = document.createElement("button");
    layout.type = "button";
    updateLayoutButton(layout, manager.isFree());
    layout.addEventListener("click", () => updateLayoutButton(layout, manager.setFree(!manager.isFree())));

    const deck = document.createElement("button");
    deck.type = "button";
    deck.className = "admin-window-deck-toggle";
    deck.innerHTML = `WINDOWS <b>${manager.count}</b>`;
    deck.title = "Ouvrir le gestionnaire des fenêtres opérationnelles";
    deck.addEventListener("click", () => manager.toggleDeck());

    const profiles = document.createElement("button");
    profiles.type = "button";
    profiles.id = "adminWorkspaceProfilesToggle";
    profiles.textContent = "PROFILS";
    profiles.title = "Sauvegarder ou charger une composition de bureau";
    profiles.addEventListener("click", () => toggleWorkspaceProfilesPanel(manager));

    const cascade = document.createElement("button");
    cascade.type = "button";
    cascade.textContent = "CASCADE";
    cascade.title = "Ranger les fenêtres détachées";
    cascade.addEventListener("click", () => manager.cascade());

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "RESET FENÊTRES";
    reset.title = "Raccrocher et restaurer la disposition native";
    reset.addEventListener("click", () => manager.reset());

    const classic = document.createElement("a");
    classic.id = "atlasClassicVersionTruth406025";
    classic.href = "../web/index.html";
    classic.textContent = "CLASSIC · manifeste";
    classic.title = `Ouvrir la Web Classique · Engine ${ENGINE_BUILD}`;
    classic.dataset.versionTruth = "pending";

    bar.append(brand, layout, deck, profiles, cascade, reset, classic);
    document.body.appendChild(bar);
    installWorkspaceProfilesPanel(manager);
  }

  const WORKSPACE_PROFILE_SCHEMA = "agent_crypto_workspace_profile_v1";
  const WORKSPACE_PROFILE_DB = "agent_crypto_workspace_profiles_v1";
  const WORKSPACE_PROFILE_STORE = "profiles";

  const WORKSPACE_PROFILE_BUILTIN_LIVECHECK = "builtin:livecheck";

  function workspaceProfileBuiltins(manager) {
    const current = manager.snapshot();
    const keep = new Set(["graphique", "math-core"]);
    const windows = {};
    Object.entries(current?.windows || {}).forEach(([id, state]) => {
      windows[id] = {
        floating: false,
        minimized: false,
        hidden: !keep.has(id),
        maximized: false,
        geometry: null
      };
    });
    return [{
      schema: WORKSPACE_PROFILE_SCHEMA,
      id: WORKSPACE_PROFILE_BUILTIN_LIVECHECK,
      label: "LiveCheck · Graphique + Lecture + Math dessus",
      builtin: true,
      created_at: null,
      updated_at: null,
      math_dock: "top",
      window_state: { schema: "erith.admin.workspace.window-state.v1", windows },
      analytical_context_owned: false,
      graph_context_v7_owned: false
    }];
  }

  function workspaceProfileBuiltin(manager, id) {
    return workspaceProfileBuiltins(manager).find(profile => profile.id === String(id || "")) || null;
  }

  function workspaceProfileOpenDb() {
    return new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) {
        reject(new Error("IndexedDB indisponible"));
        return;
      }
      const request = indexedDB.open(WORKSPACE_PROFILE_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(WORKSPACE_PROFILE_STORE)) {
          const store = db.createObjectStore(WORKSPACE_PROFILE_STORE, { keyPath: "id" });
          store.createIndex("label", "label", { unique: false });
          store.createIndex("updated_at", "updated_at", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Ouverture IndexedDB impossible"));
      request.onblocked = () => reject(new Error("IndexedDB bloqué"));
    });
  }

  async function workspaceProfileDb(action, mode = "readonly") {
    const db = await workspaceProfileOpenDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(WORKSPACE_PROFILE_STORE, mode);
        const store = tx.objectStore(WORKSPACE_PROFILE_STORE);
        let request;
        let requestResult;
        try { request = action(store); }
        catch (error) { reject(error); return; }
        if (request) {
          request.onsuccess = () => {
            requestResult = request.result;
            if (mode === "readonly") resolve(requestResult);
          };
          request.onerror = () => reject(request.error || tx.error || new Error("IndexedDB profile request failed"));
        }
        tx.oncomplete = () => {
          if (mode !== "readonly") resolve(request ? requestResult : true);
          else if (!request) resolve(true);
        };
        tx.onerror = () => reject(tx.error || new Error("IndexedDB profile transaction failed"));
        tx.onabort = () => reject(tx.error || new Error("IndexedDB profile transaction aborted"));
      });
    } finally {
      try { db.close(); } catch {}
    }
  }

  const workspaceProfileListCustom = async () => {
    const rows = await workspaceProfileDb(store => store.getAll());
    return (Array.isArray(rows) ? rows : [])
      .filter(row => row?.schema === WORKSPACE_PROFILE_SCHEMA && row?.builtin !== true)
      .sort((a, b) => String(a.label || "").localeCompare(String(b.label || ""), "fr", { sensitivity: "base" }));
  };

  const workspaceProfileGetCustom = id => workspaceProfileDb(store => store.get(String(id || "")));
  const workspaceProfilePutCustom = profile => workspaceProfileDb(store => store.put(profile), "readwrite");
  const workspaceProfileDeleteCustom = id => workspaceProfileDb(store => store.delete(String(id || "")), "readwrite");

  async function workspaceProfileResolve(manager, id) {
    const value = String(id || "");
    if (value.startsWith("builtin:")) return workspaceProfileBuiltin(manager, value);
    return value ? workspaceProfileGetCustom(value) : null;
  }

  function workspaceProfileId() {
    if (globalThis.crypto?.randomUUID) return `custom:${crypto.randomUUID()}`;
    return `custom:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function workspaceProfileCurrentMathDock() {
    const value = String(byId("math")?.dataset?.mathDock || "side").toLowerCase();
    return ["top", "side", "rail"].includes(value) ? value : "side";
  }

  function workspaceProfileCapture(manager, label, existing = null) {
    const cleanLabel = String(label || "").replace(/\s+/g, " ").trim().slice(0, 64);
    if (!cleanLabel) throw new Error("Nom de profil requis");
    const now = new Date().toISOString();
    return {
      schema: WORKSPACE_PROFILE_SCHEMA,
      id: existing?.id || workspaceProfileId(),
      label: cleanLabel,
      builtin: false,
      created_at: existing?.created_at || now,
      updated_at: now,
      math_dock: workspaceProfileCurrentMathDock(),
      window_state: manager.snapshot(),
      analytical_context_owned: false,
      graph_context_v7_owned: false
    };
  }

  function workspaceProfileApplyMathDock(profile) {
    const value = String(profile?.math_dock || "").toLowerCase();
    if (!["top", "side", "rail"].includes(value)) return false;
    if (typeof globalThis.atlasV2ApplyMathDock === "function") {
      globalThis.atlasV2ApplyMathDock(value, { persist: false });
      return true;
    }
    const button = document.querySelector(`[data-math-position="${value}"]`);
    if (button instanceof HTMLElement) { button.click(); return true; }
    return false;
  }

  function workspaceProfileApply(manager, profile) {
    if (!profile || profile.schema !== WORKSPACE_PROFILE_SCHEMA) throw new Error("Profil de bureau invalide");
    workspaceProfileApplyMathDock(profile);
    manager.applySnapshot(profile.window_state, { persist: false });
    document.dispatchEvent(new CustomEvent("erith:workspace-profile-loaded", {
      detail: { id: profile.id, label: profile.label, builtin: profile.builtin === true }
    }));
    return profile;
  }


  // 40.2.24 — Workspace Profiles Transfer Lock.
  // Portable files contain presentation state only. No Graph Context V7,
  // market data, Oracle Evidence, credentials or business-memory payload.
  const WORKSPACE_PROFILE_EXPORT_SCHEMA = "agent_crypto_workspace_profile_export_v1";
  const WORKSPACE_PROFILE_BUNDLE_SCHEMA = "agent_crypto_workspace_profile_bundle_v1";

  function workspaceProfilePortableWindowState(raw) {
    const source = raw?.windows && typeof raw.windows === "object" ? raw.windows : {};
    const windows = {};
    Object.entries(source).forEach(([rawId, rawState]) => {
      const id = String(rawId || "").trim();
      if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(id) || !rawState || typeof rawState !== "object") return;
      const geometry = rawState.geometry && typeof rawState.geometry === "object" ? rawState.geometry : null;
      const safeNumber = value => Number.isFinite(Number(value)) ? Number(value) : null;
      const cleanGeometry = geometry ? {
        x: safeNumber(geometry.x), y: safeNumber(geometry.y),
        width: safeNumber(geometry.width), height: safeNumber(geometry.height)
      } : null;
      windows[id] = {
        floating: rawState.floating === true,
        minimized: rawState.minimized === true,
        hidden: rawState.hidden === true,
        maximized: rawState.maximized === true,
        geometry: cleanGeometry && Object.values(cleanGeometry).every(Number.isFinite) ? cleanGeometry : null
      };
    });
    return { schema: "erith.admin.workspace.window-state.v1", windows };
  }

  function workspaceProfilePortable(profile) {
    if (!profile || profile.schema !== WORKSPACE_PROFILE_SCHEMA) throw new Error("Profil de bureau invalide");
    const label = String(profile.label || "").replace(/\s+/g, " ").trim().slice(0, 64);
    if (!label) throw new Error("Nom de profil invalide");
    const mathDock = String(profile.math_dock || "side").toLowerCase();
    return {
      schema: WORKSPACE_PROFILE_SCHEMA,
      source_profile_id: String(profile.source_profile_id || profile.id || "").slice(0, 160),
      label,
      math_dock: ["top", "side", "rail"].includes(mathDock) ? mathDock : "side",
      window_state: workspaceProfilePortableWindowState(profile.window_state),
      analytical_context_owned: false,
      graph_context_v7_owned: false
    };
  }

  function workspaceProfileDownload(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function workspaceProfileFilename(label, suffix = "profile") {
    const slug = String(label || "workspace")
      .normalize?.("NFD")?.replace(/[\u0300-\u036f]/g, "") || String(label || "workspace");
    return `agent_crypto_${suffix}_${slug.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "workspace"}.json`;
  }

  async function workspaceProfileExportSelected(manager, id) {
    const profile = await workspaceProfileResolve(manager, id);
    if (!profile) throw new Error("Profil introuvable");
    const portable = workspaceProfilePortable(profile);
    const payload = {
      schema: WORKSPACE_PROFILE_EXPORT_SCHEMA,
      build: ADMIN_BUILD,
      exported_at: new Date().toISOString(),
      contains_analytical_context: false,
      contains_graph_context_v7: false,
      contains_market_data: false,
      profile: portable
    };
    workspaceProfileDownload(workspaceProfileFilename(portable.label), payload);
    return payload;
  }

  async function workspaceProfileImportPortable(raw) {
    const envelope = raw && typeof raw === "object" ? raw : {};
    if (envelope.schema !== WORKSPACE_PROFILE_EXPORT_SCHEMA || !envelope.profile) throw new Error("Fichier profil non reconnu");
    const portable = workspaceProfilePortable({ ...envelope.profile, schema: WORKSPACE_PROFILE_SCHEMA });
    const sourceId = String(envelope.profile?.source_profile_id || "").slice(0, 160);
    const custom = await workspaceProfileListCustom().catch(() => []);
    const existing = custom.find(row => sourceId && String(row?.source_profile_id || "") === sourceId) || null;
    const now = new Date().toISOString();
    const imported = {
      ...portable,
      id: existing?.id || workspaceProfileId(),
      builtin: false,
      source_profile_id: sourceId || existing?.source_profile_id || "",
      imported_from_build: String(envelope.build || "unknown").slice(0, 64),
      created_at: existing?.created_at || now,
      updated_at: now
    };
    await workspaceProfilePutCustom(imported);
    return imported;
  }


  // 40.2.24 — Portable Profile Library Lock.
  // A bundle is merely a collection of the same validated portable layouts.
  async function workspaceProfileExportLibrary() {
    const custom = await workspaceProfileListCustom();
    const profiles = custom.map(workspaceProfilePortable);
    const payload = {
      schema: WORKSPACE_PROFILE_BUNDLE_SCHEMA,
      build: ADMIN_BUILD,
      exported_at: new Date().toISOString(),
      contains_analytical_context: false,
      contains_graph_context_v7: false,
      contains_market_data: false,
      count: profiles.length,
      profiles
    };
    workspaceProfileDownload(`agent_crypto_workspace_profiles_${String(ADMIN_BUILD).replaceAll(".", "_")}.json`, payload);
    return payload;
  }

  async function workspaceProfileImportLibrary(raw) {
    const envelope = raw && typeof raw === "object" ? raw : {};
    if (envelope.schema !== WORKSPACE_PROFILE_BUNDLE_SCHEMA || !Array.isArray(envelope.profiles)) throw new Error("Bibliothèque de profils non reconnue");
    let imported = 0;
    let updated = 0;
    const knownSources = new Set((await workspaceProfileListCustom().catch(() => []))
      .map(item => String(item?.source_profile_id || "")).filter(Boolean));
    const rows = envelope.profiles.slice(0, 100);
    for (const row of rows) {
      const single = {
        schema: WORKSPACE_PROFILE_EXPORT_SCHEMA,
        build: envelope.build,
        exported_at: envelope.exported_at,
        profile: row
      };
      const sourceId = String(row?.source_profile_id || "");
      const existed = Boolean(sourceId && knownSources.has(sourceId));
      await workspaceProfileImportPortable(single);
      if (sourceId) knownSources.add(sourceId);
      if (existed) updated += 1; else imported += 1;
    }
    return { imported, updated, total: imported + updated };
  }

  function installWorkspaceProfilesStyles() {
    if (byId("adminWorkspaceProfilesStyles")) return;
    const style = document.createElement("style");
    style.id = "adminWorkspaceProfilesStyles";
    style.textContent = `
      .admin-workspace-profiles-panel{position:fixed;left:12px;bottom:54px;z-index:2147482800;width:min(440px,calc(100vw - 24px));padding:10px;border:1px solid rgba(98,236,255,.28);border-radius:12px;background:linear-gradient(145deg,rgba(3,13,23,.97),rgba(8,21,32,.95));box-shadow:0 18px 48px rgba(0,0,0,.46),inset 0 0 0 1px rgba(255,255,255,.025);color:#eaf8fb;font:800 10px/1.25 system-ui,sans-serif}
      .admin-workspace-profiles-panel[hidden]{display:none!important}
      .admin-workspace-profiles-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
      .admin-workspace-profiles-head strong{font-size:11px;letter-spacing:.08em;color:#bdf7ff}
      .admin-workspace-profiles-panel button,.admin-workspace-profiles-panel select,.admin-workspace-profiles-panel input{min-height:29px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:rgba(255,255,255,.055);color:#eaf8fb;font:850 10px/1.1 system-ui,sans-serif}
      .admin-workspace-profiles-panel button{padding:5px 8px;cursor:pointer}
      .admin-workspace-profiles-panel button:hover{border-color:rgba(98,236,255,.42);background:rgba(98,236,255,.08)}
      .admin-workspace-profiles-panel button:disabled{opacity:.38;cursor:not-allowed}
      .admin-workspace-profiles-panel select,.admin-workspace-profiles-panel input{width:100%;padding:5px 8px}
      .admin-workspace-profiles-grid{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;margin-bottom:6px}
      .admin-workspace-profiles-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
      .admin-workspace-profiles-status{margin-top:7px;padding:6px 7px;border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#93aab7;background:rgba(255,255,255,.025)}
      .admin-workspace-profiles-status[data-state="ok"]{border-color:rgba(71,223,145,.28);color:#bff7d8}
      .admin-workspace-profiles-status[data-state="fail"]{border-color:rgba(255,92,117,.32);color:#ffc3cc}
      @media(max-width:700px){.admin-workspace-profiles-panel{left:8px;bottom:48px;width:calc(100vw - 16px)}}
    `;
    document.head.appendChild(style);
  }

  function workspaceProfilesSetStatus(panel, text, state = "") {
    const node = panel?.querySelector?.("[data-workspace-profile-status]");
    if (!node) return;
    node.textContent = String(text || "");
    if (state) node.dataset.state = state; else delete node.dataset.state;
  }

  async function workspaceProfilesRefresh(panel, selectedId = "", manager = globalThis.ErithAdministratorWindows) {
    const select = panel?.querySelector?.("[data-workspace-profile-select]");
    if (!(select instanceof HTMLSelectElement)) return [];
    let custom = [];
    let storageError = null;
    try { custom = await workspaceProfileListCustom(); }
    catch (error) { storageError = error; }
    const builtins = manager ? workspaceProfileBuiltins(manager) : [];
    select.innerHTML = "";

    if (builtins.length) {
      const group = document.createElement("optgroup");
      group.label = "Prédéfinis";
      builtins.forEach(profile => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.label;
        group.appendChild(option);
      });
      select.appendChild(group);
    }

    const customGroup = document.createElement("optgroup");
    customGroup.label = "Mes profils";
    if (!custom.length) {
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Aucun profil personnalisé";
      customGroup.appendChild(empty);
    } else {
      custom.forEach(profile => {
        const option = document.createElement("option");
        option.value = profile.id;
        option.textContent = profile.label;
        customGroup.appendChild(option);
      });
    }
    select.appendChild(customGroup);

    if (selectedId && [...select.options].some(option => option.value === selectedId)) select.value = selectedId;
    else if (builtins.length) select.value = builtins[0].id;

    const deletable = select.value.startsWith("custom:");
    panel.querySelectorAll("[data-workspace-profile-custom-only]").forEach(button => { button.disabled = !deletable; });
    if (storageError) workspaceProfilesSetStatus(panel, `Profils personnalisés indisponibles : ${storageError?.message || storageError} · LiveCheck reste disponible.`, "fail");
    return [...builtins, ...custom];
  }

  function installWorkspaceProfilesPanel(manager) {
    installWorkspaceProfilesStyles();
    byId("adminWorkspaceProfilesPanel")?.remove();
    const panel = document.createElement("aside");
    panel.id = "adminWorkspaceProfilesPanel";
    panel.className = "admin-workspace-profiles-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Profils de bureau Administrator");
    panel.innerHTML = `
      <div class="admin-workspace-profiles-head"><strong>PROFILS DE BUREAU</strong><button type="button" data-workspace-profile-close aria-label="Fermer">×</button></div>
      <div class="admin-workspace-profiles-grid"><select data-workspace-profile-select aria-label="Profil sauvegardé"></select><button type="button" data-workspace-profile-load>CHARGER</button></div>
      <div class="admin-workspace-profiles-grid"><input data-workspace-profile-name maxlength="64" placeholder="Nom du profil actuel" aria-label="Nom du profil"><button type="button" data-workspace-profile-save>SAUVER ACTUEL</button></div>
      <div class="admin-workspace-profiles-actions">
        <button type="button" data-workspace-profile-rename data-workspace-profile-custom-only disabled>RENOMMER</button>
        <button type="button" data-workspace-profile-delete data-workspace-profile-custom-only disabled>SUPPRIMER</button>
        <button type="button" data-workspace-profile-export>EXPORTER JSON</button>
        <button type="button" data-workspace-profile-import>IMPORTER JSON</button>
        <button type="button" data-workspace-profile-export-all>EXPORTER TOUS</button>
        <button type="button" data-workspace-profile-import-all>IMPORTER TOUS</button>
        <input type="file" accept="application/json,.json" data-workspace-profile-import-file hidden>
        <input type="file" accept="application/json,.json" data-workspace-profile-import-all-file hidden>
      </div>
      <div class="admin-workspace-profiles-status" data-workspace-profile-status>LiveCheck prédéfini + profils IndexedDB · export/import visuel uniquement · V7 inchangé.</div>
    `;
    document.body.appendChild(panel);

    const select = panel.querySelector("[data-workspace-profile-select]");
    const name = panel.querySelector("[data-workspace-profile-name]");
    panel.querySelector("[data-workspace-profile-close]")?.addEventListener("click", () => { panel.hidden = true; });
    select?.addEventListener("change", async () => {
      const id = String(select.value || "");
      const profile = id ? await workspaceProfileResolve(manager, id).catch(() => null) : null;
      if (profile && name) name.value = profile.label || "";
      const enabled = id.startsWith("custom:");
      panel.querySelectorAll("[data-workspace-profile-custom-only]").forEach(button => { button.disabled = !enabled; });
    });

    panel.querySelector("[data-workspace-profile-load]")?.addEventListener("click", async () => {
      const id = String(select?.value || "");
      if (!id) { workspaceProfilesSetStatus(panel, "Choisis un profil à charger.", "fail"); return; }
      try {
        const profile = await workspaceProfileResolve(manager, id);
        if (!profile) throw new Error("Profil introuvable");
        workspaceProfileApply(manager, profile);
        workspaceProfilesSetStatus(panel, `Chargé : ${profile.label} · contexte V7 conservé.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Chargement impossible : ${error?.message || error}`, "fail");
      }
    });

    panel.querySelector("[data-workspace-profile-save]")?.addEventListener("click", async () => {
      try {
        const profile = workspaceProfileCapture(manager, name?.value || "");
        await workspaceProfilePutCustom(profile);
        await workspaceProfilesRefresh(panel, profile.id, manager);
        if (name) name.value = profile.label;
        workspaceProfilesSetStatus(panel, `Sauvegardé : ${profile.label} · IndexedDB.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Sauvegarde impossible : ${error?.message || error}`, "fail");
      }
    });

    panel.querySelector("[data-workspace-profile-rename]")?.addEventListener("click", async () => {
      const id = String(select?.value || "");
      if (!id.startsWith("custom:")) return;
      try {
        const current = await workspaceProfileGetCustom(id);
        if (!current) throw new Error("Profil introuvable");
        const renamed = workspaceProfileCapture(manager, name?.value || current.label, current);
        // Rename changes only the label; the saved layout stays the saved layout.
        renamed.window_state = current.window_state;
        renamed.math_dock = current.math_dock;
        renamed.source_profile_id = current.source_profile_id || "";
        renamed.imported_from_build = current.imported_from_build || "";
        await workspaceProfilePutCustom(renamed);
        await workspaceProfilesRefresh(panel, id, manager);
        workspaceProfilesSetStatus(panel, `Renommé : ${renamed.label}.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Renommage impossible : ${error?.message || error}`, "fail");
      }
    });

    panel.querySelector("[data-workspace-profile-delete]")?.addEventListener("click", async () => {
      const id = String(select?.value || "");
      if (!id.startsWith("custom:")) return;
      const profile = await workspaceProfileGetCustom(id).catch(() => null);
      const label = profile?.label || "ce profil";
      if (!globalThis.confirm?.(`Supprimer ${label} ?`)) return;
      try {
        await workspaceProfileDeleteCustom(id);
        await workspaceProfilesRefresh(panel, "", manager);
        if (name) name.value = "";
        workspaceProfilesSetStatus(panel, `Supprimé : ${label}.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Suppression impossible : ${error?.message || error}`, "fail");
      }
    });


    panel.querySelector("[data-workspace-profile-export]")?.addEventListener("click", async () => {
      const id = String(select?.value || "");
      if (!id) { workspaceProfilesSetStatus(panel, "Choisis un profil à exporter.", "fail"); return; }
      try {
        const payload = await workspaceProfileExportSelected(manager, id);
        workspaceProfilesSetStatus(panel, `Exporté : ${payload.profile.label} · disposition uniquement.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Export impossible : ${error?.message || error}`, "fail");
      }
    });

    const importFile = panel.querySelector("[data-workspace-profile-import-file]");
    panel.querySelector("[data-workspace-profile-import]")?.addEventListener("click", () => importFile?.click());
    importFile?.addEventListener("change", async () => {
      const file = importFile.files?.[0];
      importFile.value = "";
      if (!file) return;
      try {
        const raw = JSON.parse(await file.text());
        const imported = await workspaceProfileImportPortable(raw);
        await workspaceProfilesRefresh(panel, imported.id, manager);
        if (name) name.value = imported.label;
        workspaceProfilesSetStatus(panel, `Importé : ${imported.label} · prêt à charger.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Import refusé : ${error?.message || error}`, "fail");
      }
    });


    panel.querySelector("[data-workspace-profile-export-all]")?.addEventListener("click", async () => {
      try {
        const payload = await workspaceProfileExportLibrary();
        workspaceProfilesSetStatus(panel, `Bibliothèque exportée : ${payload.count} profil(s).`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Export bibliothèque impossible : ${error?.message || error}`, "fail");
      }
    });

    const importAllFile = panel.querySelector("[data-workspace-profile-import-all-file]");
    panel.querySelector("[data-workspace-profile-import-all]")?.addEventListener("click", () => importAllFile?.click());
    importAllFile?.addEventListener("change", async () => {
      const file = importAllFile.files?.[0];
      importAllFile.value = "";
      if (!file) return;
      try {
        const result = await workspaceProfileImportLibrary(JSON.parse(await file.text()));
        await workspaceProfilesRefresh(panel, "", manager);
        workspaceProfilesSetStatus(panel, `Bibliothèque importée : ${result.imported} nouveau(x) · ${result.updated} mis à jour.`, "ok");
      } catch (error) {
        workspaceProfilesSetStatus(panel, `Import bibliothèque refusé : ${error?.message || error}`, "fail");
      }
    });

    // Deferred by design: opening the profile panel performs the first IndexedDB
    // listing. Hidden profile UI adds no IndexedDB work to Administrator boot.
    if (select instanceof HTMLSelectElement) {
      const option = document.createElement("option");
      option.value = WORKSPACE_PROFILE_BUILTIN_LIVECHECK;
      option.textContent = "LiveCheck · Graphique + Lecture + Math dessus";
      select.appendChild(option);
    }

    globalThis.ErithAdministratorWorkspaceProfiles = Object.freeze({
      schema: WORKSPACE_PROFILE_SCHEMA,
      builtins: () => workspaceProfileBuiltins(manager),
      list: workspaceProfileListCustom,
      get: id => workspaceProfileResolve(manager, id),
      capture: label => workspaceProfileCapture(manager, label),
      save: async label => { const profile = workspaceProfileCapture(manager, label); await workspaceProfilePutCustom(profile); return profile; },
      load: async id => { const profile = await workspaceProfileResolve(manager, id); if (!profile) throw new Error("Profil introuvable"); return workspaceProfileApply(manager, profile); },
      exportSelected: id => workspaceProfileExportSelected(manager, id),
      importPortable: workspaceProfileImportPortable,
      exportLibrary: workspaceProfileExportLibrary,
      importLibrary: workspaceProfileImportLibrary,
      remove: workspaceProfileDeleteCustom
    });
  }

  function toggleWorkspaceProfilesPanel(manager) {
    let panel = byId("adminWorkspaceProfilesPanel");
    if (!panel) { installWorkspaceProfilesPanel(manager); panel = byId("adminWorkspaceProfilesPanel"); }
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) workspaceProfilesRefresh(panel, panel.querySelector("[data-workspace-profile-select]")?.value || "", manager).catch(error => workspaceProfilesSetStatus(panel, String(error?.message || error), "fail"));
  }

  function syncDomainWindows(manager) {
    const domain = currentDomain();
    manager.setDomain(domain);
    const metals = domain === "metals";
    manager.renameWindow("graphique", metals ? "Graphique + Lecture Métaux" : "Graphique + Lecture technique");
    manager.renameWindow("market", metals ? "Market Métaux" : "Market Snapshot");
    manager.renameWindow("math-core", metals ? "Math Core Métaux" : "Atlas Math Core");
  }

  function installDomainObserver(manager) {
    let last = "";
    const sync = () => {
      const next = currentDomain();
      if (next === last) return;
      last = next;
      window.requestAnimationFrame(() => syncDomainWindows(manager));
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-atlas-market-domain"] });
    window.addEventListener("pageshow", sync);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") sync(); });
    sync();
  }

  const RIBBON_R2_MIGRATION_KEY = `${STORAGE_PREFIX}:ribbon-window-menu-r2-migrated`;

  function migrateRibbonWindowStateR2() {
    try {
      if (localStorage.getItem(RIBBON_R2_MIGRATION_KEY) === "1") return;
      // R1 used a separate translation store. Earlier experiments could also
      // have left native-window geometry behind. Clear ONLY these two ribbons
      // once so R2 starts in the canonical docked position; all other windows
      // keep their operator layout. Subsequent R2 moves persist normally.
      localStorage.removeItem("erith_admin_native_ribbon_positions_v1");
      localStorage.removeItem(`${STORAGE_PREFIX}:window:target-top`);
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(RIBBON_R2_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_FLOW_40125_MIGRATION_KEY = `${STORAGE_PREFIX}:market-flow-target-top-parity-40125-migrated`;

  function migrateMarketFlowWindowState40125() {
    try {
      if (localStorage.getItem(MARKET_FLOW_40125_MIGRATION_KEY) === "1") return;
      // 40.1.25: Market Flow now uses the exact same directFixed detach/move
      // path as Target Top. Clear only its stale 40.1.24 geometry once.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(MARKET_FLOW_40125_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_FLOW_40126_MIGRATION_KEY = `${STORAGE_PREFIX}:market-flow-floating-viewport-40126-migrated`;

  function migrateMarketFlowWindowState40126() {
    try {
      if (localStorage.getItem(MARKET_FLOW_40126_MIGRATION_KEY) === "1") return;
      // 40.1.26 changes the detached internal contract: discard only the prior
      // Market Flow floating geometry so the first detach is measured cleanly.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market-flow`);
      localStorage.setItem(MARKET_FLOW_40126_MIGRATION_KEY, "1");
    } catch {}
  }

  const MARKET_BODY_PORTAL_40127_MIGRATION_KEY = `${STORAGE_PREFIX}:market-body-portal-40127-migrated`;

  function migrateMarketWindowState40127() {
    try {
      if (localStorage.getItem(MARKET_BODY_PORTAL_40127_MIGRATION_KEY) === "1") return;
      // 40.1.27: old Market floating state was measured while its shell lived
      // inside marketWorkspaceGrid. Clear only this window once so the new
      // body-level floating shell starts from a clean docked measurement.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:market`);
      localStorage.setItem(MARKET_BODY_PORTAL_40127_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-body-portal-40128-migrated`;
  const GLOBAL_SHELL_WINDOW_IDS_40128 = Object.freeze([
    "market",
    "analyse-decision",
    "intelligence-memoire-creation",
    "preparation-operations",
    "experimentation-systeme",
    "missions-de-vie",
    "mesure-audience",
    "sources"
  ]);

  function migrateGlobalShellWindowState40128() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY) === "1") return;
      // 40.1.28 changes the DEFAULT shell portal for every non-directFixed
      // Administrator window. Clear only those shell-window geometries once so
      // their first body-level detach is measured from the native dock.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_PORTAL_40128_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-layout-placeholder-40129-migrated`;

  function migrateGlobalShellWindowState40129() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY) === "1") return;
      // 40.1.29 replaces zero-size hidden placeholders with layout-preserving
      // spacers. Clear only shell-window geometry once so the first detach is
      // measured from the current native dock.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_LAYOUT_40129_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-union-placeholder-40130-migrated`;

  function migrateGlobalShellWindowState40130() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY) === "1") return;
      // 40.1.30 fixes the CSS/JS placeholder contradiction and measures multi-node
      // families from the union of their visible members. Purge only shell-window
      // geometry once so no stale anchor-only dimensions survive.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_GEOMETRY_40130_MIGRATION_KEY, "1");
    } catch {}
  }

  const DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY = `${STORAGE_PREFIX}:direct-fixed-inline-important-40131-migrated`;

  function migrateDirectFixedWindowState40131() {
    try {
      if (localStorage.getItem(DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY) === "1") return;
      // 40.1.31 fixes legacy !important dock rules overriding the directFixed
      // Window Manager geometry. Only the two affected directFixed windows can
      // contain stale jump coordinates from prior tests.
      ["graphique", "math-core"].forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(DIRECT_FIXED_GEOMETRY_40131_MIGRATION_KEY, "1");
    } catch {}
  }

  const GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY = `${STORAGE_PREFIX}:global-shell-natural-autofit-40132-migrated`;

  function migrateGlobalShellAutoFit40132() {
    try {
      if (localStorage.getItem(GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY) === "1") return;
      // 40.1.32 changes only shell sizing. Clear the eight shell-window geometries
      // once so their first detach is measured from live content + floating chrome.
      // directFixed Graphique / Target Top / Market Flow / Math Core are excluded.
      GLOBAL_SHELL_WINDOW_IDS_40128.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(GLOBAL_SHELL_AUTOFIT_40132_MIGRATION_KEY, "1");
    } catch {}
  }

  // 40.3.03 — topology-aware one-time migration.
  // 40.3.00–40.3.02 changed semantic ownership for the four Administrator
  // families and Missions de vie while intentionally keeping the historical
  // Window Manager storage namespace. Old minimized/hidden/floating state can
  // therefore be semantically stale even though the DOM is correct. Clear ONLY
  // these five family-window records once, before manager.init(). Every other
  // operator window state is preserved. Future 40.3.03 family changes persist
  // normally because this migration is marker-gated.
  const FAMILY_TOPOLOGY_40303_MIGRATION_KEY = `${STORAGE_PREFIX}:family-topology-40303-migrated`;
  const FAMILY_TOPOLOGY_40303_WINDOW_IDS = Object.freeze([
    "analyse-decision",
    "intelligence-memoire-creation",
    "preparation-operations",
    "experimentation-systeme",
    "missions-de-vie"
  ]);

  function migrateFamilyTopologyWindowState40303() {
    try {
      if (localStorage.getItem(FAMILY_TOPOLOGY_40303_MIGRATION_KEY) === "1") return false;
      FAMILY_TOPOLOGY_40303_WINDOW_IDS.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(FAMILY_TOPOLOGY_40303_MIGRATION_KEY, "1");
      return true;
    } catch {
      return false;
    }
  }

  globalThis.ErithFamilyTopologyStateMigration40303 = Object.freeze({
    build: ADMIN_BUILD,
    key: FAMILY_TOPOLOGY_40303_MIGRATION_KEY,
    window_ids: FAMILY_TOPOLOGY_40303_WINDOW_IDS,
    one_time: true,
    before_window_manager_init: true,
    scoped_family_state_only: true,
    unrelated_window_state_preserved: true,
    namespace_changed: false
  });

  const FAMILY_ROLE_RETURN_40322_MIGRATION_KEY = `${STORAGE_PREFIX}:family-role-return-40322-migrated`;

  function migrateFamilyRoleReturnWindowState40322() {
    try {
      if (localStorage.getItem(FAMILY_ROLE_RETURN_40322_MIGRATION_KEY) === "1") return false;
      // 40.3.22 — recover only the five large Administrator families from stale
      // pre-rewrite hidden/minimized/floating geometry.  Graphique, Math Core,
      // Target Top, Market Flow, Market, Audience and Sources stay untouched.
      FAMILY_TOPOLOGY_40303_WINDOW_IDS.forEach(id => {
        localStorage.removeItem(`${STORAGE_PREFIX}:window:${id}`);
      });
      localStorage.setItem(FAMILY_ROLE_RETURN_40322_MIGRATION_KEY, "1");
      return true;
    } catch {
      return false;
    }
  }

  globalThis.ErithFamilyRoleReturnMigration40322 = Object.freeze({
    build: "40.3.22",
    parent_build: "40.3.21",
    key: FAMILY_ROLE_RETURN_40322_MIGRATION_KEY,
    window_ids: FAMILY_TOPOLOGY_40303_WINDOW_IDS,
    one_time: true,
    before_window_manager_init: true,
    clears_only_large_family_presentation_state: true,
    direct_fixed_state_preserved: true,
    market_state_preserved: true,
    audience_sources_state_preserved: true,
    v7_state_preserved: true,
    bridge_state_preserved: true
  });

  const GRAPH_R6_MIGRATION_KEY = `${STORAGE_PREFIX}:graph-fullwidth-r6-migrated`;

  function migrateGraphWindowStateR6() {
    try {
      if (localStorage.getItem(GRAPH_R6_MIGRATION_KEY) === "1") return;
      // R5 could inherit an old detached/floating geometry for the Graphique
      // workspace. Reset ONLY this window once so the canonical full-width
      // dock can be measured from its real parent. Future operator moves stay
      // persistent normally after this one-time migration.
      localStorage.removeItem(`${STORAGE_PREFIX}:window:graphique`);
      localStorage.setItem(GRAPH_R6_MIGRATION_KEY, "1");
    } catch {}
  }

  function installMathCoreInlineWindowControls40148() {
    const math = byId("math");
    const head = math?.querySelector?.(".atlas-math-dock-head");
    const dockActions = math?.querySelector?.(".atlas-math-dock-actions");
    const controls = dockActions?.querySelector?.(".admin-native-controls")
      || math?.querySelector?.(":scope > .admin-native-controls")
      || math?.querySelector?.(".admin-native-controls");
    if (!(head instanceof HTMLElement) || !(dockActions instanceof HTMLElement) || !(controls instanceof HTMLElement)) return false;

    const firstDockButton = dockActions.querySelector("[data-math-position]");
    if (!(firstDockButton instanceof HTMLElement)) return false;

    // 40.1.48 — the complete Window Manager strip belongs to the Math Core
    // header itself.  The action row is a single nowrap line; it is never
    // hidden off-canvas by justify-content:flex-end/overflow scrolling.
    controls.classList.add("atlas-math-inline-window-controls-40148");
    controls.style.setProperty("position", "static", "important");
    controls.style.setProperty("inset", "auto", "important");
    controls.style.setProperty("left", "auto", "important");
    controls.style.setProperty("right", "auto", "important");
    controls.style.setProperty("top", "auto", "important");
    controls.style.setProperty("bottom", "auto", "important");
    controls.style.setProperty("transform", "none", "important");
    controls.style.setProperty("display", "inline-flex", "important");
    controls.style.setProperty("flex-direction", "row", "important");
    controls.style.setProperty("flex-wrap", "nowrap", "important");
    controls.style.setProperty("align-items", "center", "important");
    controls.style.setProperty("justify-content", "flex-start", "important");
    controls.style.setProperty("gap", "4px", "important");
    controls.style.setProperty("margin", "0", "important");
    controls.style.setProperty("padding", "0", "important");
    controls.style.setProperty("min-height", "0", "important");
    controls.style.setProperty("background", "transparent", "important");
    controls.style.setProperty("box-shadow", "none", "important");
    controls.style.setProperty("backdrop-filter", "none", "important");
    controls.style.setProperty("opacity", "1", "important");
    controls.style.setProperty("pointer-events", "auto", "important");
    controls.style.setProperty("z-index", "3", "important");
    controls.style.setProperty("flex", "0 0 auto", "important");

    controls.querySelectorAll("button").forEach(button => {
      button.style.setProperty("position", "static", "important");
      button.style.setProperty("margin", "0", "important");
      button.style.setProperty("transform", "none", "important");
      button.style.setProperty("width", "27px", "important");
      button.style.setProperty("min-width", "27px", "important");
      button.style.setProperty("height", "27px", "important");
      button.style.setProperty("min-height", "27px", "important");
      button.style.setProperty("padding", "0", "important");
      button.style.setProperty("opacity", "1", "important");
    });

    const maximize = controls.querySelector(".admin-native-maximize");
    if (maximize) maximize.textContent = "↗";

    // One complete action line: [⠿] [−] [□] [↗] [×] | [Dessus] [Latéral] [Réduire]
    head.classList.add("atlas-math-head-inline-controls-40148");
    dockActions.classList.add("atlas-math-actions-inline-40148");
    dockActions.style.setProperty("display", "flex", "important");
    dockActions.style.setProperty("width", "100%", "important");
    dockActions.style.setProperty("max-width", "100%", "important");
    dockActions.style.setProperty("align-items", "center", "important");
    dockActions.style.setProperty("justify-content", "flex-end", "important");
    dockActions.style.setProperty("flex-wrap", "nowrap", "important");
    dockActions.style.setProperty("white-space", "nowrap", "important");
    dockActions.style.setProperty("gap", "5px", "important");
    dockActions.style.setProperty("overflow", "visible", "important");
    dockActions.style.setProperty("min-width", "0", "important");

    if (controls.parentElement !== dockActions || controls.nextElementSibling !== firstDockButton) {
      dockActions.insertBefore(controls, firstDockButton);
    }

    let separator = dockActions.querySelector(".atlas-math-inline-window-separator-40148");
    if (!separator) {
      separator = document.createElement("span");
      separator.className = "atlas-math-inline-window-separator-40148";
      separator.textContent = "|";
      separator.setAttribute("aria-hidden", "true");
      separator.style.cssText = "display:inline-flex;align-items:center;justify-content:center;color:rgba(255,226,161,.58);font-weight:900;line-height:1;padding:0 1px;flex:0 0 auto;";
    }
    dockActions.insertBefore(separator, firstDockButton);

    dockActions.querySelectorAll("[data-math-position]").forEach(button => {
      button.style.setProperty("flex", "0 0 auto", "important");
      button.style.setProperty("white-space", "nowrap", "important");
    });

    dockActions.dataset.mathInlineWindowControls = "40148";
    return true;
  }

  function presentationRole40312() {
    const role = String(document.body?.dataset?.atlasRole || document.documentElement?.dataset?.atlasRole || "").trim();
    if (["public", "operator", "administrator"].includes(role)) return role;
    try {
      const owner = sessionStorage.getItem("agent_crypto_local_access_session_v1") === "owner";
      const queryIntermediate = new URL(window.location.href).searchParams.get("view") === "intermediate";
      if (queryIntermediate) return "operator";
      const storedMode = localStorage.getItem("agent_crypto_erith_ia_v2_interface_mode") || "essential";
      return owner && storedMode === "advanced" ? "administrator" : storedMode === "intermediate" ? "operator" : "public";
    } catch {
      return "public";
    }
  }

  let activeWindowPresentationRole40314 = "";

  // 40.4.39 — CANONICAL OWNER: primary Atlas family visibility in Administrator.
  // The behavior was introduced in 40.4.36 after a persisted compact family state
  // could hide family 02 after role restoration.  The fix is now promoted from a
  // build-number patch name to one permanent responsibility owner. Inner Atlas
  // disclosures and true-lazy bodies retain their independent lifecycle owners.
  const ADMIN_ATLAS_PRIMARY_FAMILY = "intelligence-memoire-creation";

  function ensureAdministratorAtlasVisible(manager, reason = "role-transition") {
    if (!manager || presentationRole40312() !== "administrator") return false;
    // 40.4.139 — visible does not mean forced expanded. Family 02 keeps the
    // canonical compact/minimized boot state while remaining unhidden.
    const family = q(".atlas-layout-family-intelligence");
    const atlas = byId("atlas-local-ai-collapse");
    for (const node of [family, atlas]) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.hidden) node.hidden = false;
      if (node.getAttribute("aria-hidden") === "true") node.setAttribute("aria-hidden", "false");
    }

    document.documentElement.dataset.adminAtlasVisibility = atlas ? "visible" : "missing";
    document.documentElement.dataset.adminAtlasVisibilityReason = reason;
    return Boolean(atlas);
  }

  function syncWindowPresentationRole40314(manager, role = presentationRole40312()) {
    if (!manager) return role;
    const nextRole = ["public", "operator", "administrator"].includes(role) ? role : presentationRole40312();
    if (activeWindowPresentationRole40314 === nextRole) return nextRole;

    if (nextRole === "administrator") {
      manager.restorePersistedPresentation?.();
      ensureAdministratorAtlasVisible(manager, "role-transition");
    } else manager.neutralizePresentation?.();

    activeWindowPresentationRole40314 = nextRole;
    document.documentElement.dataset.adminWindowPresentationRole40314 = nextRole;
    return nextRole;
  }


  /* ============================================================
     40.3.53 — ATLAS MEMORY PRESENTATION RESIDENCY LOCK

     Scope: Atlas internal Presentation Plane only.
     - Market Memory: compact shell while closed; detailed grids/actions on demand.
     - Analytical Memory: compact shell while closed; CURRENT details on demand.
     - Decision Board: HOT operator summary remains resident; deep cards/news details on demand.
     - Data/analytical memory, Market Core, Window Manager, Oracle and Graphique are unchanged.
     - No timer, observer, scheduler, CSS paint-skipping gate or runtime reparenting is introduced.
     ============================================================ */

  const ATLAS_MARKET_MEMORY_BODY_TEMPLATE_40353 = `
    <div class="atlas-memory-ledger-35" id="atlasMemoryLedger35" aria-label="Séparation mémoire marché et CURRENT">
      <article><span>Snapshots canoniques</span><b id="atlasMemoryMarketCount35">0</b><small>États marché distincts après regroupement des relevés de plusieurs collecteurs.</small></article>
      <article><span>CURRENT analytiques</span><b id="atlasMemoryCurrentCount35">0</b><small>Un cycle fermé Atlas 4/4 → NØX → Aerith = une unité analytique.</small></article>
      <article><span>Collecteurs</span><b id="atlasMemoryCollectorCount35">0</b><small>Origines mémoire connues ; une trace ne prouve jamais qu’une machine est en ligne.</small></article>
      <article><span>Base 3 / 5 / 10</span><b id="atlasMemoryBasis35">MARKET MEMORY</b><small id="atlasMemoryBasisDetail35">Les horizons utilisent uniquement les observations marché ; les CURRENT restent séparés.</small></article>
    </div>
    <div class="atlas-memory-horizon-grid" aria-label="Tendances mémoire multi-horizon">
      <article><span>3 relevés</span><b id="atlasMemoryTrend3">—</b><small id="atlasMemoryTrend3Detail">Collecte insuffisante.</small></article>
      <article><span>5 relevés</span><b id="atlasMemoryTrend5">—</b><small id="atlasMemoryTrend5Detail">Collecte insuffisante.</small></article>
      <article><span>10 relevés</span><b id="atlasMemoryTrend10">—</b><small id="atlasMemoryTrend10Detail">Collecte insuffisante.</small></article>
    </div>
    <div class="atlas-memory-intelligence-grid">
      <article><span>Persistance du mouvement</span><b id="atlasMemoryPersistence">—</b><small id="atlasMemoryPersistenceDetail">BTC / ETH / SOL.</small></article>
      <article><span>Confirmation collecteurs</span><b id="atlasMemoryCollectors">—</b><small id="atlasMemoryCollectorsDetail">Comparaison des dernières observations disponibles.</small></article>
      <article><span>Local ↔ GitHub</span><b id="atlasMemoryDivergence">—</b><small id="atlasMemoryDivergenceDetail">Écart de prix entre mémoires lorsque comparable.</small></article>
      <article><span>Secteurs persistants</span><b id="atlasMemorySectors">—</b><small id="atlasMemorySectorsDetail">Catégories répétées dans la mémoire.</small></article>
      <article><span>Anomalie volume / capitalisation</span><b id="atlasMemoryAnomaly">—</b><small id="atlasMemoryAnomalyDetail">Lecture descriptive du dernier snapshot.</small></article>
      <article><span>Pump isolé</span><b id="atlasMemoryPump">—</b><small id="atlasMemoryPumpDetail">Mouvement fort sans continuité suffisante.</small></article>
      <article class="atlas-memory-ledger-34"><span>Capture mémoire CURRENT</span><b id="atlasMemoryCurrentLedger34">En attente</b><small id="atlasMemoryCurrentLedger34Detail">Les CURRENT terminés sont distingués des simples observations marché.</small><em class="pill warn" id="atlasMemoryCurrentLedger34Badge">En attente d’un CURRENT</em></article>
      <article class="atlas-memory-confidence"><span>Confiance de continuité des données</span><b id="atlasMemoryConfidence">—</b><small id="atlasMemoryConfidenceDetail">Ne mesure pas la probabilité d’une hausse ou d’une baisse.</small></article>
    </div>
    <div class="atlas-memory-intelligence-actions">
      <button type="button" id="btnAtlasMemoryRefresh">Actualiser la lecture mémoire</button>
      <button type="button" id="btnAtlasMemoryReconcile34">Diagnostic · Réconcilier CURRENT</button>
      <button type="button" id="btnAtlasMemoryExport">Exporter Market Memory .md</button>
    </div>
    <p id="atlasMemoryIntelligenceStatus">La lecture démarre dès que plusieurs observations marché distinctes sont présentes ; elle ne lance jamais Atlas.</p>`;

  const ATLAS_ANALYTICAL_MEMORY_BODY_TEMPLATE_40353 = `
    <div class="atlas-memory-ledger-35" aria-label="Analytical Memory séparée">
      <article><span>Unités analytiques</span><b id="atlasAnalyticalMemoryCount394">0</b><small>CURRENT distincts réellement conservés dans la mémoire locale.</small></article>
      <article><span>CURRENT vérifiés</span><b id="atlasAnalyticalMemoryVerified394">0</b><small>Unités reconnues par la couche CURRENT canonique ; aucune observation marché convertie.</small></article>
      <article><span>Journal fermé</span><b id="atlasAnalyticalMemoryJournal394">0</b><small>Entrées Atlas 4/4 + NØX + Aerith réellement journalisées.</small></article>
      <article><span>Journal sans payload</span><b id="atlasAnalyticalMemoryJournalOnly394">0</b><small>Anciennes preuves visibles mais jamais transformées artificiellement en mémoire détaillée.</small></article>
    </div>
    <div class="atlas-memory-intelligence-grid">
      <article><span>Dernier CURRENT</span><b id="atlasAnalyticalMemoryLatest394">—</b><small id="atlasAnalyticalMemoryLatestDetail394">Aucune unité analytique détaillée disponible.</small></article>
      <article><span>Chaîne analytique</span><b id="atlasAnalyticalMemoryChain394">Atlas → NØX → Aerith</b><small>Une seule unité après fermeture complète ; le LIVE ultérieur ne réécrit pas cette analyse.</small></article>
      <article><span>Contexte marché lié</span><b id="atlasAnalyticalMemoryMarket394">—</b><small id="atlasAnalyticalMemoryMarketDetail394">Le payload figé du CURRENT reste distinct du Market Memory évolutif.</small></article>
      <article><span>Rôle</span><b>Relecture rétrospective</b><small>Comparer ce que le système avait conclu. Aucun signal, ordre ou déclenchement Atlas.</small></article>
    </div>
    <div class="atlas-memory-intelligence-actions">
      <button type="button" id="btnAtlasAnalyticalMemoryRefresh394">Actualiser Analytical Memory</button>
      <button type="button" id="btnAtlasAnalyticalMemoryExport394">Exporter Analytical Memory .md</button>
    </div>
    <p id="atlasAnalyticalMemoryStatus394">Analytical Memory ne lance jamais Atlas et ne participe jamais aux horizons Market Memory 3 / 5 / 10.</p>`;

  const ATLAS_DECISION_BOARD_DEEP_TEMPLATE_40353 = `
    <div class="decision-board-grid" id="decisionBoardGrid">
      <article class="decision-card"><b>Mouvements à vérifier</b><span>Livecheck requis.</span></article>
      <article class="decision-card"><b>Repères à comparer</b><span>BTC / ETH / SOL après données live.</span></article>
      <article class="decision-card"><b>Anomalies</b><span>Aucune lecture sans source réelle.</span></article>
      <article class="decision-card"><b>Lecture secteurs</b><span>En attente de mémoire Atlas.</span></article>
      <article class="decision-card"><b>Mémoire comparable</b><span>Snapshots Ryzen / Book / GitHub après collecte.</span></article>
      <article class="decision-card decision-card-wide"><b>Décision froide</b><span>Observer, comparer et valider humainement.</span></article>
    </div>
    <div class="decision-news-bridge" id="decisionNewsBridge">
      <div><span>Contexte News Sentinel</span><b id="decisionNewsState">Chargement de l’archive mondiale</b></div>
      <div><span>Impact / preuve</span><b id="decisionNewsImpact">En attente</b></div>
      <div><span>Décision événementielle</span><b id="decisionNewsAction">Collecte à vérifier</b></div>
      <div><span>Rôle News → marché</span><b id="decisionNewsRole40234">Rôle causal non qualifié</b></div>
      <div><span>Lecture croisée</span><b id="decisionNewsExplanation40238">Convergence non évaluée</b></div>
    </div>`;

  function atlasCollapseState40353(root) {
    const state = root?.querySelector?.(":scope > summary .atlas-collapse-state");
    if (!state) return;
    state.textContent = root.open ? (state.dataset.openLabel || "Replier") : (state.dataset.closedLabel || "Déplier");
  }

  function atlasMarketMemoryRelease40353() {
    const mount = document.getElementById("atlasMemoryIntelligenceMount40353");
    if (!mount) return false;
    mount.innerHTML = '<p class="atlas-local-response-empty" data-atlas-memory-placeholder-40353="1">Market Memory conservée · ouvrir pour matérialiser les horizons, la continuité et les diagnostics.</p>';
    mount.dataset.atlasMemoryMounted40353 = "0";
    return true;
  }

  function atlasMarketMemoryMount40353() {
    const mount = document.getElementById("atlasMemoryIntelligenceMount40353");
    if (!mount) return false;
    if (mount.dataset.atlasMemoryMounted40353 !== "1") {
      mount.innerHTML = ATLAS_MARKET_MEMORY_BODY_TEMPLATE_40353;
      mount.dataset.atlasMemoryMounted40353 = "1";
    }
    const refresh = document.getElementById("btnAtlasMemoryRefresh");
    if (refresh && refresh.dataset.atlasDeferred40353 !== "1") {
      refresh.dataset.atlasDeferred40353 = "1";
      refresh.addEventListener("click", () => { try { globalThis.atlasMemoryIntelligenceRender?.(); } catch (_) {} });
    }
    const reconcile = document.getElementById("btnAtlasMemoryReconcile34");
    if (reconcile && reconcile.dataset.atlasDeferred40353 !== "1") {
      reconcile.dataset.atlasDeferred40353 = "1";
      reconcile.addEventListener("click", () => { try { globalThis.atlasMemoryCurrentReconcileManual34?.(); } catch (_) {} });
    }
    const exporter = document.getElementById("btnAtlasMemoryExport");
    if (exporter && exporter.dataset.atlasDeferred40353 !== "1") {
      exporter.dataset.atlasDeferred40353 = "1";
      exporter.addEventListener("click", () => { try { globalThis.atlasMemoryIntelligenceExport?.(); } catch (_) {} });
    }
    try { globalThis.atlasAutomation341UiPolish?.(); } catch (_) {}
    try { globalThis.atlasMemoryIntelligenceRender?.(); } catch (_) {}
    return true;
  }

  function atlasAnalyticalMemoryRelease40353() {
    const mount = document.getElementById("atlasAnalyticalMemoryMount40353");
    if (!mount) return false;
    mount.innerHTML = '<p class="atlas-local-response-empty" data-atlas-analytical-memory-placeholder-40353="1">Analytical Memory conservée · ouvrir pour matérialiser les CURRENT détaillés.</p>';
    mount.dataset.atlasAnalyticalMemoryMounted40353 = "0";
    return true;
  }

  function atlasAnalyticalMemoryMarkdown40353(data) {
    const safe = data || {};
    const latestAssets = Array.isArray(safe.latestAssets) ? safe.latestAssets : [];
    const wanted = new Set(["BTC", "ETH", "BNB", "XRP", "SOL"]);
    const marketLine = latestAssets.filter(asset => wanted.has(String(asset?.symbol || "").toUpperCase())).map(asset => {
      const symbol = String(asset?.symbol || "?").toUpperCase();
      const change = Number(asset?.change_24h_pct);
      return Number.isFinite(change) ? `${symbol} ${change >= 0 ? "+" : ""}${change.toFixed(2)} %` : `${symbol} —`;
    }).join(" · ") || "Payload marché lié indisponible dans cette unité.";
    return [
      "# Agent-Crypto — Analytical Memory", "",
      `- Build : ${ADMIN_BUILD}`,
      `- Généré : ${new Date().toISOString()}`,
      `- CURRENT détaillés : ${Number(safe.count || 0)}`,
      `- CURRENT vérifiés : ${Number(safe.verifiedCount || 0)}`,
      `- CURRENT fermés au journal : ${Number(safe.journalCount || 0)}`,
      `- Journal sans payload détaillé : ${Number(safe.journalOnlyCount || 0)}`,
      `- Collecteurs : ${Array.isArray(safe.collectors) ? safe.collectors.length : 0}`, "",
      "## Dernier CURRENT", "",
      `- Fingerprint : ${safe.latestFingerprint || "—"}`,
      `- Heure : ${safe.latestAt || "—"}`,
      `- Marché lié : ${marketLine}`, "",
      "## Contrat de séparation", "",
      "- Analytical Memory contient uniquement des CURRENT analytiques réellement fermés ou reconnus par la mémoire canonique.",
      "- Market Memory conserve séparément les observations marché et ses horizons 3 / 5 / 10.",
      "- Une entrée de journal sans payload détaillé reste une preuve historique partielle ; aucun paquet n’est inventé.",
      "- Analytical Memory ne déclenche jamais Atlas, NØX, Aerith, Bridge ou Ollama.",
      "- Aucun ordre financier, recommandation ou prévision n’est produit."
    ].join("\n");
  }

  function atlasAnalyticalMemoryExport40353() {
    const data = globalThis.atlasAnalyticalMemoryStats394?.() || {};
    const text = atlasAnalyticalMemoryMarkdown40353(data);
    const name = `agent_crypto_analytical_memory_${new Date().toISOString().slice(0, 10)}.md`;
    if (typeof globalThis.downloadTextFile === "function") globalThis.downloadTextFile(name, "text/markdown", text);
    return text;
  }

  function atlasAnalyticalMemoryMount40353() {
    const mount = document.getElementById("atlasAnalyticalMemoryMount40353");
    if (!mount) return false;
    if (mount.dataset.atlasAnalyticalMemoryMounted40353 !== "1") {
      mount.innerHTML = ATLAS_ANALYTICAL_MEMORY_BODY_TEMPLATE_40353;
      mount.dataset.atlasAnalyticalMemoryMounted40353 = "1";
    }
    const refresh = document.getElementById("btnAtlasAnalyticalMemoryRefresh394");
    if (refresh && refresh.dataset.atlasDeferred40353 !== "1") {
      refresh.dataset.atlasDeferred40353 = "1";
      refresh.addEventListener("click", () => { try { globalThis.atlasAnalyticalMemoryRender394?.(); } catch (_) {} });
    }
    const exporter = document.getElementById("btnAtlasAnalyticalMemoryExport394");
    if (exporter && exporter.dataset.atlasDeferred40353 !== "1") {
      exporter.dataset.atlasDeferred40353 = "1";
      exporter.addEventListener("click", atlasAnalyticalMemoryExport40353);
    }
    try { globalThis.atlasAnalyticalMemoryRender394?.(); } catch (_) {}
    return true;
  }

  function atlasDecisionBoardDeepRelease40353() {
    const mount = document.getElementById("atlasDecisionBoardDeepMount40353");
    if (!mount) return false;
    mount.innerHTML = '<p class="atlas-local-response-empty" data-atlas-decision-detail-placeholder-40353="1">Decision Board compact · ouvrir pour matérialiser les cartes et le contexte News.</p>';
    mount.dataset.atlasDecisionDetailMounted40353 = "0";
    return true;
  }

  function atlasDecisionBoardDeepMount40353() {
    const mount = document.getElementById("atlasDecisionBoardDeepMount40353");
    if (!mount) return false;
    if (mount.dataset.atlasDecisionDetailMounted40353 !== "1") {
      mount.innerHTML = ATLAS_DECISION_BOARD_DEEP_TEMPLATE_40353;
      mount.dataset.atlasDecisionDetailMounted40353 = "1";
    }
    try { globalThis.renderDecisionBoard?.(); } catch (_) {}
    try { globalThis.atlasDecisionBoardDualMemory3950?.render?.(); } catch (_) {}
    return true;
  }

  function atlasDecisionBoardCompactStatus40353() {
    const status = document.getElementById("decisionBoardStatus");
    const verdict = document.getElementById("decisionBoardVerdict");
    let summary = null;
    try { summary = globalThis.atlasOperatorSummaryRender35?.() || null; } catch (_) {}
    const marketCount = Number(summary?.split?.marketRecords?.length || 0);
    const currentCount = Number(summary?.split?.currentRecords?.length || 0);
    if (status) {
      status.textContent = summary?.currentOk
        ? `CURRENT · mémoire ${marketCount}`
        : summary?.direct === 5 && summary?.stable
          ? `Prêt · mémoire ${marketCount}`
          : `Détails à la demande · ${marketCount} mémoire`;
      status.className = `pill ${summary?.currentOk || (summary?.direct === 5 && summary?.stable) ? "ok" : "warn"}`;
    }
    if (verdict) {
      verdict.textContent = summary?.currentOk
        ? `Decision Board compact · CURRENT fermé · ${marketCount} observation(s) marché · ${currentCount} CURRENT analytique(s) · ouvrir les détails pour matérialiser les cartes.`
        : `Decision Board compact · détails à la demande · ${marketCount} observation(s) marché disponibles.`;
    }
    return summary;
  }

  function atlasDecisionBoardWrap40353() {
    const base = globalThis.renderDecisionBoard;
    if (typeof base !== "function" || base.__atlasMemoryResidency40353) return false;
    const wrapped = function renderDecisionBoard40353(...args) {
      const result = base.apply(this, args);
      const details = document.getElementById("atlasDecisionBoardDetails");
      if (!details?.open) atlasDecisionBoardCompactStatus40353();
      return result;
    };
    try { Object.defineProperty(wrapped, "__atlasMemoryResidency40353", { value: true }); } catch (_) {}
    globalThis.renderDecisionBoard = wrapped;
    atlasDecisionBoardCompactStatus40353();
    return true;
  }

  function initAtlasMemoryResidency40353() {
    atlasDecisionBoardWrap40353();
    const market = document.getElementById("atlasMemoryIntelligence");
    if (market && market.dataset.atlasResidencyBound40353 !== "1") {
      market.dataset.atlasResidencyBound40353 = "1";
      market.addEventListener("toggle", () => {
        atlasCollapseState40353(market);
        if (market.open) atlasMarketMemoryMount40353();
        else atlasMarketMemoryRelease40353();
      });
      atlasCollapseState40353(market);
      if (market.open) atlasMarketMemoryMount40353(); else atlasMarketMemoryRelease40353();
    }

    const analytical = document.getElementById("atlasAnalyticalMemory394");
    if (analytical && analytical.dataset.atlasResidencyBound40353 !== "1") {
      analytical.dataset.atlasResidencyBound40353 = "1";
      analytical.addEventListener("toggle", () => {
        atlasCollapseState40353(analytical);
        if (analytical.open) atlasAnalyticalMemoryMount40353();
        else atlasAnalyticalMemoryRelease40353();
      });
      atlasCollapseState40353(analytical);
      if (analytical.open) atlasAnalyticalMemoryMount40353(); else atlasAnalyticalMemoryRelease40353();
    }

    const decision = document.getElementById("atlasDecisionBoardDetails");
    if (decision && decision.dataset.atlasResidencyBound40353 !== "1") {
      decision.dataset.atlasResidencyBound40353 = "1";
      decision.addEventListener("toggle", () => {
        atlasCollapseState40353(decision);
        if (decision.open) atlasDecisionBoardDeepMount40353();
        else atlasDecisionBoardDeepRelease40353();
      });
      atlasCollapseState40353(decision);
      if (decision.open) atlasDecisionBoardDeepMount40353(); else atlasDecisionBoardDeepRelease40353();
    }

    globalThis.AtlasMemoryPresentationResidency40353 = Object.freeze({
      build: "40.3.53",
      parent: "40.3.52",
      scope: Object.freeze(["market_memory_presentation", "analytical_memory_presentation", "decision_board_deep_details"]),
      market_memory_closed_full_dom_resident: false,
      analytical_memory_closed_full_dom_resident: false,
      decision_board_hot_operator_summary_preserved: true,
      decision_board_deep_closed_full_dom_resident: false,
      atlas_report_residency_40351_preserved: true,
      atlas_internal_residency_40352_preserved: true,
      data_plane_changed: false,
      analytical_state_changed: false,
      market_core_changed: false,
      window_manager_changed: false,
      timer_added: false,
      observer_added: false,
      scheduler_added: false,
      content_visibility_added: false,
      reparenting_added: false
    });
    return true;
  }


  // 40.3.61 — ADMINISTRATOR PARCOURS DEFAULT COLLAPSE LOCK
  // Operator request: a hard reload must start the four main Administrator
  // families in their existing docked compact presentation instead of
  // restoring them fully expanded. This is presentation-only: the business
  // engines keep their existing lifecycle and Window Manager remains canonical.
  const ADMIN_DEFAULT_COLLAPSED_FAMILY_IDS_40361 = Object.freeze([
    "analyse-decision",
    "intelligence-memoire-creation",
    "preparation-operations",
    "experimentation-systeme"
  ]);

  function administratorHashFamily40361() {
    const raw = String(location.hash || "").replace(/^#/, "");
    if (!raw) return "";
    let decoded = raw;
    try { decoded = decodeURIComponent(raw); } catch {}
    const target = byId(decoded);
    if (!(target instanceof HTMLElement)) return "";

    const layout = String(
      target.dataset.layoutFamily
      || target.closest?.("[data-layout-family]")?.dataset?.layoutFamily
      || ""
    ).trim().toLowerCase();

    if (layout === "analysis" || target.closest?.(".atlas-layout-family-analysis")) return "analyse-decision";
    if (layout === "intelligence" || layout === "creation" || target.closest?.(".atlas-layout-family-intelligence")) return "intelligence-memoire-creation";
    if (layout === "operations" || target.closest?.(".atlas-layout-family-operations")) return "preparation-operations";
    if (layout === "system" || layout === "experiment" || target.closest?.(".atlas-layout-family-system")) return "experimentation-systeme";
    return "";
  }

  function stageAdministratorDefaultFamilyCollapse40361() {
    const directFamily = administratorHashFamily40361();
    const staged = [];
    const skipped = [];
    const failed = [];

    ADMIN_DEFAULT_COLLAPSED_FAMILY_IDS_40361.forEach(id => {
      const key = `${STORAGE_PREFIX}:window:${id}`;
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { saved = {}; }

      const directTarget = directFamily === id;
      const next = {
        ...saved,
        floating: false,
        minimized: !directTarget,
        hidden: false,
        maximized: false
      };

      const unchanged =
        saved.floating === next.floating
        && saved.minimized === next.minimized
        && saved.hidden === next.hidden
        && saved.maximized === next.maximized;

      if (unchanged) {
        skipped.push(id);
        return;
      }

      try {
        localStorage.setItem(key, JSON.stringify(next));
        staged.push(id);
      } catch {
        failed.push(id);
      }
    });

    document.documentElement.dataset.adminDefaultFamilyCollapse40361 = "1";
    document.documentElement.dataset.adminDefaultFamilyDirectHash40361 = directFamily || "none";

    globalThis.ErithAdministratorDefaultFamilyCollapse40361 = Object.freeze({
      build: "40.3.61",
      parent: "40.3.60",
      families: ADMIN_DEFAULT_COLLAPSED_FAMILY_IDS_40361,
      default_state: "docked compact / minimized",
      direct_hash_family_opens: true,
      persisted_previous_open_state_replayed_on_hard_reload: false,
      presentation_only: true,
      business_engines_stopped: false,
      window_manager_modified: false,
      market_core_modified: false,
      oracle_modified: false,
      atlas_current_modified: false,
      forge_iframe_modified: false,
      new_timer: false,
      new_observer: false,
      new_listener: false,
      new_scheduler: false,
      staged: Object.freeze(staged.slice()),
      unchanged: Object.freeze(skipped.slice()),
      failed: Object.freeze(failed.slice())
    });

    return { directFamily, staged, skipped, failed };
  }

  function boot() {
    installGlobalVersionIdentity();
    initAtlasMemoryResidency40353();

    migrateRibbonWindowStateR2();
    migrateMarketFlowWindowState40125();
    migrateMarketFlowWindowState40126();
    migrateMarketWindowState40127();
    migrateGlobalShellWindowState40128();
    migrateGlobalShellWindowState40129();
    migrateGlobalShellWindowState40130();
    migrateDirectFixedWindowState40131();
    migrateGlobalShellAutoFit40132();
    migrateGraphWindowStateR6();
    migrateFamilyTopologyWindowState40303();
    migrateFamilyRoleReturnWindowState40322();
    stageAdministratorDefaultFamilyCollapse40361();

    const factory = window.ErithAdminWindowManager;
    if (!factory?.create) {
      console.error(`Administrator ${ADMIN_BUILD}: operational window manager unavailable.`);
      return;
    }

    const manager = factory.create({
      storagePrefix: STORAGE_PREFIX,
      defaultFree: true,
      domain: currentDomain(),
      definitions: nativeDefinitions()
    });

    const bootRole40312 = presentationRole40312();
    let aetherNativeStateExists406040 = false;
    try { aetherNativeStateExists406040 = localStorage.getItem(`${STORAGE_PREFIX}:window:aether-watch`) !== null; } catch {}
    const state = manager.init({ restorePersistedPresentation: bootRole40312 === "administrator" });
    // 40.6.40 — the shell is pre-created by aether.js solely so the canonical
    // Window Manager can register it during this one normal init pass.
    // HTML hidden is then released; the manager becomes the only presentation owner.
    const aetherPanel406040 = byId("atlasAetherStatusPanel4084");
    const aetherWindow406040 = manager.getWindow("aether-watch");
    if (aetherPanel406040 && aetherWindow406040) {
      aetherPanel406040.hidden = false;
      if (!aetherNativeStateExists406040) {
        // Aether is already conceptually a portal. First registration therefore
        // starts as a hidden floating native window, preserving the old closed boot
        // while giving the first operator open the complete five-button menu.
        manager.float("aether-watch", true);
        manager.hide("aether-watch", true);
      }
    }
    // 40.3.14 — init already applied the correct presentation exactly once.
    // Do not immediately replay the same neutralize/restore transaction.
    activeWindowPresentationRole40314 = bootRole40312;
    document.documentElement.dataset.adminWindowPresentationRole40314 = bootRole40312;
    if (bootRole40312 === "administrator") ensureAdministratorAtlasVisible(manager, "administrator-boot");
    installOracleGraphWindowChrome404156();
    installMathCoreInlineWindowControls40148();

    // 40.1.48 — restore guard for compact bars.  Some stacked Administrator
    // surfaces can overlap a minimized bar visually; capture-phase recovery
    // guarantees that + Restaurer always reopens the intended window.
    document.addEventListener("pointerdown", event => {
      const restore = event.target?.closest?.(".admin-native-minibar-restore");
      const bar = restore?.closest?.("[data-admin-native-minibar]");
      const id = bar?.dataset?.adminNativeMinibar;
      if (!id) return;
      event.preventDefault();
      event.stopPropagation();
      manager.minimize(id, false);
    }, true);

    window.ErithAdministratorWindows = manager;

    // 40.4.93 — Market presentation follows the existing Window Manager.
    // No extra Market visibility control: normal/restored = rows present;
    // reduced/hidden = generated rows released. The manager remains unchanged.
    const syncMarketWindow40493 = reason => {
      try { globalThis.AgentCryptoMarketTablePresentation40493?.syncFromWindow?.(reason); } catch (error) {
        console.warn("[40.4.93] Market window presentation sync", error);
      }
    };
    syncMarketWindow40493("window-manager-init");
    const syncMarketAfterWindowControl40493 = event => {
      const control=event.target?.closest?.(".admin-native-minimize,.admin-native-hide,.admin-native-minibar-restore,.admin-window-deck-action");
      if(!control)return;
      queueMicrotask(()=>syncMarketWindow40493("native-window-control"));
    };
    document.addEventListener("click", syncMarketAfterWindowControl40493, true);
    document.addEventListener("pointerdown", event => {
      if(!event.target?.closest?.(".admin-native-minibar-restore"))return;
      queueMicrotask(()=>syncMarketWindow40493("native-window-restore"));
    }, true);
    document.addEventListener("erith:admin-window-reset", ()=>queueMicrotask(()=>syncMarketWindow40493("window-reset")));
    document.addEventListener("erith:admin-window-profile-applied", ()=>queueMicrotask(()=>syncMarketWindow40493("window-profile")));
    document.addEventListener("erith:admin-window-persisted-presentation-restored", ()=>queueMicrotask(()=>syncMarketWindow40493("window-restore")));
    window.addEventListener("atlas:v2mode", event => {
      const role = ["public", "operator", "administrator"].includes(event?.detail?.role)
        ? event.detail.role
        : presentationRole40312();
      syncWindowPresentationRole40314(manager, role);
    });
    globalThis.ErithWindowRoleIsolation40312 = Object.freeze({
      build: "40.3.12",
      basic_restores_admin_geometry: false,
      intermediate_restores_admin_geometry: false,
      administrator_restores_persisted_geometry: true,
      neutralization_persists: false,
      manager_api: "restorePersistedPresentation/neutralizePresentation"
    });
    globalThis.ErithWindowRoleTransition40314 = Object.freeze({
      build: "40.3.14",
      same_role_transition_is_noop: true,
      boot_replay_removed: true,
      one_window_manager_transaction_per_real_role_change: true,
      persisted_restore_single_pass: true,
      role_transition_forces_geometry_snapshot: false,
      hidden_window_deck_live_rebuild: false,
      inherited_role_isolation_40312: true
    });
    globalThis.ErithAdministratorAtlasVisibility = Object.freeze({
      build: "40.4.139",
      compact_boot_preserved: true,
      owner: "administrator-atlas-primary-family-visibility",
      introduced: "40.4.36",
      canonicalized: "40.4.39",
      family: ADMIN_ATLAS_PRIMARY_FAMILY,
      administrator_boot_visible: true,
      administrator_role_transition_visible: true,
      inner_disclosures_forced_open: false,
      lazy_hydration_changed: false,
      atlas_runtime_changed: false,
      market_core_changed: false,
      timer_added: false,
      observer_added: false,
      storage_owner_added: false,
      reconcile: reason => ensureAdministratorAtlasVisible(manager, reason || "manual-diagnostic")
    });
    globalThis.ErithSurfacePerformance40315 = Object.freeze({
      build: "40.3.15",
      header_surface: "100%",
      content_surface: "97%",
      transform_scale: false,
      global_zoom: false,
      drag_detach_auto_fit: false,
      floating_backdrop_blur: false,
      floating_repeating_background: false,
      parent_build: "40.3.14"
    });
    globalThis.ErithFamily04GreyForensic40404 = Object.freeze({
      build: "40.4.4",
      parent_build: "40.4.3",
      canonical_order: Object.freeze(["04", "storage", "grey-plate-forensic", "simulation", "commandes", "backend", "safety", "physical-security"]),
      grey_plate_forensic_owner: "04 · Expérimentation & système",
      compact_reduce_suppresses_grey_forensic: true,
      hide_and_detach_follow_family04: true,
      window_manager_core_file_changed: false,
      ownership_definition_owner: "js/app.js",
      system_presentation_fragment: "./views/system.html"
    });
    globalThis.ErithBridgePassivePerformance40317 = Object.freeze({
      build: "40.3.17",
      parent_build: "40.3.15",
      bridge_health_is_analysis_trigger: false,
      focus_pageshow_restart_analysis: false,
      pageshow_snapshot_schedule: false,
      one_supervision_timer: true,
      recent_health_focus_probe_suppression_ms: 30000,
      compact_family_placeholder_policy: true,
      preserved_full_placeholder_windows: ["market", "graphique", "target-top", "market-flow", "math-core"]
    });
    globalThis.ErithCanonicalSectionsAutofit40320 = Object.freeze({
      build: "40.3.20",
      parent_build: "40.3.19",
      family03_order: ["03", "situation", "questionnaire", "briefing", "planning"],
      family04_order: ["04", "storage", "simulation", "commandes", "backend", "safety", "physical-security"],
      missions_after_physical_security: true,
      family04_header_is_opening_boundary: true,
      trailing_family04_boundary_retired: true,
      native_first_detach_autofit_restored: true,
      native_first_detach_autofit_owner: "autoFitFloatingShell",
      legacy_stored_geometry_height_fallback_preserved: true,
      saved_workspace_reset: false,
      bridge_behavior_changed: false,
      atlas_pipeline_changed: false,
      oracle_behavior_changed: false,
      graph_context_v7_changed: false
    });
    installAdminBar(manager);
    installDomainObserver(manager);
    syncDomainWindows(manager);

    window.dispatchEvent(new CustomEvent("erith:administrator-mirror-ready", {
      detail: {
        build: ADMIN_BUILD,
        release: ADMIN_RELEASE,
        engine: ENGINE_BUILD,
        windows: state.count,
        layoutFree: state.free,
        domain: currentDomain()
      }
    }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  /* ============================================================
     40.3.55 — ATLAS MEMORY HEALTH DEFERRED RESIDENCY
     Presentation-only. Memory Health derives the same read-only truth,
     but its large card grid is resident only while the operator opens it.
     No timer, observer, scheduler, storage write, engine or WM change.
     ============================================================ */
  function initAtlasMemoryHealthDeferred40355() {
    const originalApi = globalThis.atlasMemoryHealth3980R2;
    const source = document.getElementById("atlasMemoryHealth3980");
    if (!originalApi || typeof originalApi.derive !== "function" || typeof originalApi.render !== "function" || !source) return false;
    if (source.dataset.atlasMemoryHealthDeferred40355 === "1") return true;

    const originalBodyTemplate = source.innerHTML;
    const details = document.createElement("details");
    details.id = "atlasMemoryHealth3980";
    details.className = `${source.className || "atlas-memory-intelligence"} atlas-collapse glass atlas-tone-intelligence atlas-memory-health-deferred-40355`;
    details.dataset.state = source.dataset.state || "waiting";
    details.dataset.atlasMemoryHealthDeferred40355 = "1";
    details.setAttribute("aria-labelledby", "atlasMemoryHealthCompactTitle40355");
    details.innerHTML = `
      <summary class="atlas-collapse-summary atlas-memory-health-summary-40355">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-collapse-copy">
          <span class="eyebrow">MEMORY HEALTH · 39.8.0R2 · READ ONLY</span>
          <span class="atlas-collapse-title" id="atlasMemoryHealthTitle3980R2">Structure · couverture · continuité</span>
          <span class="atlas-collapse-subtitle" id="atlasMemoryHealthCompactSubtitle40355">Diagnostic mémoire détaillé uniquement à l’ouverture.</span>
        </span>
        <span class="pill warn" id="atlasMemoryHealthCompactBadge40355">EN ATTENTE</span>
        <span class="atlas-collapse-state" data-open-label="Replier" data-closed-label="Déplier">Déplier</span>
      </summary>
      <div class="atlas-collapse-body" id="atlasMemoryHealthMount40355" data-atlas-memory-health-mounted-40355="0"></div>`;
    source.replaceWith(details);

    const mount = () => document.getElementById("atlasMemoryHealthMount40355");
    const stateNode = () => details.querySelector(":scope > summary > .atlas-collapse-state");
    const iconNode = () => details.querySelector(":scope > summary > .atlas-collapse-icon");
    const compact = (data = null) => {
      let truth = data;
      try { if (!truth) truth = originalApi.derive(); } catch (_) { truth = null; }
      const badge = document.getElementById("atlasMemoryHealthCompactBadge40355");
      const subtitle = document.getElementById("atlasMemoryHealthCompactSubtitle40355");
      const structure = truth?.verdicts?.structure?.label || truth?.status?.label || "EN ATTENTE";
      const coverage = truth?.verdicts?.coverage?.label || "—";
      const continuity = truth?.verdicts?.continuity?.label || "—";
      if (badge) {
        badge.textContent = String(structure).replace(/^STRUCTURE\s+/i, "");
        badge.className = `pill ${truth?.status?.code === "ok" ? "ok" : "warn"}`;
      }
      if (subtitle) subtitle.textContent = `Structure ${structure} · couverture ${coverage} · continuité ${continuity} · détails à la demande.`;
      details.dataset.state = truth?.status?.code || "waiting";
      return truth;
    };
    const bindMountedActions = () => {
      document.getElementById("btnMemoryHealthRefresh3980R2")?.addEventListener("click", () => wrappedApi.render());
      document.getElementById("btnMemoryHealthExport3980R2")?.addEventListener("click", () => {
        let body = "";
        try { body = originalApi.markdown(); } catch (_) { body = ""; }
        if (!body) return;
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        if (typeof globalThis.downloadTextFile === "function") {
          globalThis.downloadTextFile(`agent_crypto_memory_health_${stamp}.md`, "text/markdown;charset=utf-8", body);
        }
      });
    };
    const mountBody = () => {
      const host = mount();
      if (!host || host.dataset.atlasMemoryHealthMounted40355 === "1") return;
      host.innerHTML = originalBodyTemplate;
      host.dataset.atlasMemoryHealthMounted40355 = "1";
      try { originalApi.render(); } catch (_) {}
      bindMountedActions();
      compact();
    };
    const releaseBody = () => {
      const host = mount();
      if (!host) return;
      host.replaceChildren();
      host.dataset.atlasMemoryHealthMounted40355 = "0";
      compact();
    };
    const syncState = () => {
      const opened = details.open === true;
      const state = stateNode();
      const icon = iconNode();
      if (state) state.textContent = opened ? (state.dataset.openLabel || "Replier") : (state.dataset.closedLabel || "Déplier");
      if (icon) icon.textContent = opened ? "▼" : "▶";
      if (opened) mountBody(); else releaseBody();
    };

    const wrappedApi = Object.freeze({
      derive: (...args) => originalApi.derive(...args),
      markdown: (...args) => originalApi.markdown(...args),
      render: (...args) => {
        if (details.open) {
          mountBody();
          let data = null;
          try { data = originalApi.render(...args); } catch (_) {}
          compact(data || null);
          return data;
        }
        return compact();
      }
    });
    globalThis.atlasMemoryHealth3980R2 = wrappedApi;
    globalThis.atlasMemoryHealth3980 = wrappedApi;

    details.addEventListener("toggle", syncState);
    compact();
    syncState();

    globalThis.AtlasMemoryHealthDeferredResidency40355 = Object.freeze({
      build: "40.3.55",
      parent: "40.3.54",
      scope: "memory_health_presentation_only",
      closed_full_dom_resident: false,
      read_only_truth_preserved: true,
      derive_preserved: true,
      markdown_preserved: true,
      new_timer: false,
      new_observer: false,
      new_scheduler: false,
      storage_write_added: false,
      window_manager_modified: false,
      market_core_modified: false
    });
    return true;
  }

  function bootAtlasMemoryHealthDeferred40355() {
    if (initAtlasMemoryHealthDeferred40355()) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAtlasMemoryHealthDeferred40355, { once: true });
    }
  }
  // 40.4.87: Memory Health script itself is now demand-loaded after Atlas opens.
  // Re-run the existing presentation wrapper when that unchanged read-only owner arrives.
  window.addEventListener("erith:memory-health-runtime-loaded", initAtlasMemoryHealthDeferred40355, { once: true });
  queueMicrotask(bootAtlasMemoryHealthDeferred40355);

})();
