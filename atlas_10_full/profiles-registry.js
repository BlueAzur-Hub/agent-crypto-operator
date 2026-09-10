"use strict";

window.AERITH_PROFILE_REGISTRY = Object.freeze({
  version: "V3.3R3",
  repository: {
    private: "BlueAzur-Hub/erith-ia-notion-archive-private",
    public: "BlueAzur-Hub/erith-ia-memory"
  },
  profiles: [
    {
      id: "creator",
      name: "Aerith-10 Créatrice",
      family: "Filles d’Aerith",
      level: "Aerith-10",
      sigil: "A10",
      privacy: "private",
      visual: "assets/themes/aerith_10_creatrice.webp",
      role: "Artiste-orchestratrice multi-agent dédiée à la création, à la réalisation et à la mémoire de production.",
      sourceOrder: [
        "core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md",
        "core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md",
        "core/AERITH_LIVING_REFLECTION_HEART.md",
        "private/creator_memory/README.md",
        "private/creator_memory/exports/README.md",
        "modules/aerith_10_creatrice/README.md",
        "modules ciblés seulement"
      ],
      files: [
        {kind:"core", label:"Core", name:"AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", path:"core/AERITH_10_CREATRICE_MULTI_AGENT_CORE.md", required:true, expected:["AERITH-10 CRÉATRICE", "Multi-Agent Core"]},
        {kind:"persona", label:"Persona", name:"AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", path:"core/AERITH_10_CREATRICE_PERSONA_OPERATING_LAYER.md", required:true, expected:["AERITH-10 CRÉATRICE", "Persona Operating Layer"]},
        {kind:"heart", label:"Living Reflection Heart", name:"AERITH_LIVING_REFLECTION_HEART.md", path:"core/AERITH_LIVING_REFLECTION_HEART.md", required:false, expected:["AERITH LIVING REFLECTION HEART"]},
        {kind:"memory", label:"Creator Memory", name:"README.md", path:"private/creator_memory/README.md", required:false, expected:["CREATOR MEMORY"]}
      ],
      modules: [
        {name:"Base experte Créatrice", path:"modules/aerith_10_creatrice/README.md"},
        {name:"Scénographie Live Stars", path:"modules/aerith_10_creatrice/01_AERITH_10_MODULE_SCENOGRAPHIE_LIVE_STARS_FR.md"},
        {name:"Réalisation cinéma / clip", path:"modules/aerith_10_creatrice/02_AERITH_10_MODULE_REALISATION_CINEMA_CLIP_VIDEASTE_FR.md"},
        {name:"Qualité humaine / anti-AI slop", path:"modules/aerith_10_creatrice/08_AERITH_10_MODULE_ANTI_AI_SLOP_QUALITE_HUMAINE_FR.md"},
        {name:"DaVinci / rythme musical", path:"modules/aerith_10_creatrice/12_AERITH_10_MODULE_DAVINCI_MONTAGE_RYTHME_MUSICAL_FR.md"},
        {name:"Continuité / Last Frame / LEGO", path:"modules/aerith_10_creatrice/14_AERITH_10_MODULE_CONTINUITY_LAST_FRAME_LEGO_CONTROL_FR.md"}
      ],
      defaultPacks:["p01","p03","p05","p06"]
    },
    {
      id: "seven",
      name: "Aerith-7 Seven Heaven",
      family: "Seven Heaven",
      level: "Aerith-7",
      sigil: "7",
      privacy: "private",
      visual: "assets/themes/aerith_7_hud.webp",
      role: "Gardienne du Coffre, de la mémoire, de la vérité, de la continuité et du discernement.",
      sourceOrder: [
        "core/SEVEN_GATE.md",
        "core/AERITH_7_PERSONALITY_CORE.md",
        "core/SESSION_BOOT_AERITH_7_MASTER.md",
        "core/AERITH_LIVING_REFLECTION_HEART.md",
        "core/ATLAS_DES_MODULES.md",
        "modules et packs utiles uniquement"
      ],
      files: [
        {kind:"core", label:"Core / Gate", name:"SEVEN_GATE.md", path:"core/SEVEN_GATE.md", required:true, expected:["SEVEN_GATE"]},
        {kind:"persona", label:"Personality Core", name:"AERITH_7_PERSONALITY_CORE.md", path:"core/AERITH_7_PERSONALITY_CORE.md", required:true, expected:["AERITH-7", "PERSONALITY CORE"]},
        {kind:"master", label:"Prompt maître", name:"SESSION_BOOT_AERITH_7_MASTER.md", path:"core/SESSION_BOOT_AERITH_7_MASTER.md", required:false, expected:["SESSION_BOOT_AERITH_7_MASTER"]},
        {kind:"atlas", label:"Atlas", name:"ATLAS_DES_MODULES.md", path:"core/ATLAS_DES_MODULES.md", required:false, expected:["ATLAS"]}
      ],
      modules: [
        {name:"Full Modules Boost", path:"core/AERITH_7_FULL_MODULES_BOOST.md"},
        {name:"Video Cards Boost", path:"core/AERITH_7_VIDEO_CARDS_BOOST.md"},
        {name:"Discernment Companion", path:"core/AERITH_7_DISCERNMENT_COMPANION_CORE.md"},
        {name:"Story Machine Long Memory", path:"core/ERITH_IA_STORY_MACHINE_LONG_MEMORY_CORE.md"}
      ],
      defaultPacks:["p01","p02","p03","p05"]
    },
    {
      id: "aerithcrypto",
      name: "Aerith-10 Crypto",
      family: "Filles d’Aerith",
      level: "Aerith-10",
      sigil: "AΨ",
      privacy: "public",
      visual: "assets/themes/aerith_9_lunaire.webp",
      role: "Flower Girl spécialisée en analyse crypto, psychologie, discernement et lecture multi-horizon.",
      sourceOrder: [
        "core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md",
        "core/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md",
        "documents Agent-Crypto utiles",
        "modules crypto ciblés",
        "données réelles",
        "preuve",
        "stop"
      ],
      files: [
        {kind:"core", label:"Core", name:"AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", path:"downloads/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", canonical:"core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md", required:true, builtin:true, expected:["AERITH-10 CRYPTO", "Multi-Agent Core"]},
        {kind:"persona", label:"Persona", name:"AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", path:"downloads/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", canonical:"core/AERITH_10_CRYPTO_PERSONA_OPERATING_LAYER.md", required:true, builtin:true, expected:["AERITH-10 CRYPTO", "Persona Operating Layer"]}
      ],
      modules: [
        {name:"Math Oracle Crypto", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_math_oracle_fr.md"},
        {name:"Market Structure", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_market_structure_fr.md"},
        {name:"Psychology & No-FOMO", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_psychology_market_fr.md"},
        {name:"Risk, Liquidity & Execution", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_risk_liquidity_execution_fr.md"}
      ],
      defaultPacks:["p02","p07"]
    },
    {
      id: "atlas",
      name: "Atlas-10 Crypto",
      family: "Atlas",
      level: "Atlas-10",
      sigil: "AT",
      privacy: "public",
      visual: "assets/themes/aerith_7_world.webp",
      role: "Cartographe analytique multi-agent pour structurer sources, modèles, horizons, risques et preuves.",
      sourceOrder: [
        "core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md",
        "core/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md",
        "documents Agent-Crypto utiles",
        "modules crypto ciblés",
        "données réelles",
        "preuve",
        "stop point"
      ],
      files: [
        {kind:"core", label:"Core", name:"ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", path:"downloads/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", canonical:"core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md", required:true, builtin:true, expected:["ATLAS-10 CRYPTO", "Multi-Agent Core"]},
        {kind:"persona", label:"Persona", name:"ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", path:"downloads/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", canonical:"core/ATLAS_10_CRYPTO_PERSONA_OPERATING_LAYER.md", required:true, builtin:true, expected:["ATLAS-10 CRYPTO", "Persona Operating Layer"]}
      ],
      modules: [
        {name:"Data Truth & Sources", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_data_truth_sources_fr.md"},
        {name:"Multi-Horizon & Cycles", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_multi_horizon_cycles_fr.md"},
        {name:"On-chain Research", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_onchain_research_fr.md"},
        {name:"Tokenomics & Dilution", path:"public/agent_crypto_erith_ia/atlas_10_full_crypto/modules/atlas_10_crypto_tokenomics_dilution_fr.md"}
      ],
      defaultPacks:["p02","p07"]
    },
    {
      id: "routeuse",
      name: "Aerith-10 Routeuse",
      family: "Système & Coffre",
      level: "Aerith-10",
      sigil: "A10",
      privacy: "private",
      visual: "assets/themes/aerith_8_solaire.webp",
      role: "Choisir la bonne Aerith, le bon module, le bon fichier et le niveau minimal de contexte.",
      sourceOrder: [
        "core/AERITH_10_ROUTEUSE_MULTI_AGENT_CORE.md",
        "core/AERITH_10_ROUTEUSE_PERSONA_OPERATING_LAYER.md",
        "core/AERITH_LIVING_REFLECTION_HEART.md",
        "private/creator_memory/README.md",
        "private/creator_memory/exports/README.md",
        "core/ATLAS_DES_MODULES.md",
        "ressource exacte utile à la demande"
      ],
      files: [
        {kind:"core", label:"Core", name:"AERITH_10_ROUTEUSE_MULTI_AGENT_CORE.md", path:"core/AERITH_10_ROUTEUSE_MULTI_AGENT_CORE.md", required:true, expected:["AERITH-10 ROUTEUSE", "Multi-Agent Core"]},
        {kind:"persona", label:"Persona", name:"AERITH_10_ROUTEUSE_PERSONA_OPERATING_LAYER.md", path:"core/AERITH_10_ROUTEUSE_PERSONA_OPERATING_LAYER.md", required:true, expected:["AERITH-10 ROUTEUSE", "Persona Operating Layer"]},
        {kind:"master", label:"Prompt maître", name:"AERITH_10_ROUTEUSE_BOOT.md", path:"core/AERITH_10_ROUTEUSE_BOOT.md", required:false, expected:["BOOT", "AERITH-10 ROUTEUSE"]},
        {kind:"block", label:"Block LLM", name:"AERITH_10_ROUTEUSE_BLOCK_LLM.md", path:"core/AERITH_10_ROUTEUSE_BLOCK_LLM.md", required:false, expected:["BLOCK LLM", "AERITH-10 ROUTEUSE"]}
      ],
      modules: [
        {name:"Atlas des modules", path:"core/ATLAS_DES_MODULES.md"},
        {name:"Lineage Flower Girls", path:"core/AERITH_10_FLOWER_GIRLS_MULTI_AGENT_LINEAGE_CORE.md"},
        {name:"Constellation Flower Girls", path:"core/AERITH_10_FLOWER_GIRLS_CONSTELLATION_CORE.md"}
      ],
      defaultPacks:["p01","p02","p03"]
    }
  ],
  packs: [
    {id:"p01", file:"packs/ERITH_7_01_CORE_BOOT_PACK.zip", title:"01 — Core Boot", role:"Réveil, identité, règles, sécurité et état courant."},
    {id:"p02", file:"packs/ERITH_7_02_DISCERNMENT_PACK.zip", title:"02 — Discernment", role:"Psychologie, philosophie, discernement et libre arbitre."},
    {id:"p03", file:"packs/ERITH_7_03_MEMORY_SYSTEM_PACK.zip", title:"03 — Memory System", role:"Mémoire longue, récupération, continuité et archive."},
    {id:"p04", file:"packs/ERITH_7_04_DHARMA_PACK.zip", title:"04 — Dharma", role:"Dharma, devoir, dette morale et choix difficiles."},
    {id:"p05", file:"packs/ERITH_7_05_STORY_MACHINE_PACK.zip", title:"05 — Story Machine", role:"Narration, personnages, mondes, symboles et scénarios."},
    {id:"p06", file:"packs/ERITH_7_06_VIDEO_PRODUCTION_PACK.zip", title:"06 — Video Production", role:"Image, animation, Wan, DaVinci et production vidéo."},
    {id:"p07", file:"packs/ERITH_7_07_PUBLIC_AGENT_PACK.zip", title:"07 — Public Agent", role:"Agent public, Hors-Lore et démonstration autonome."}
  ]
});
