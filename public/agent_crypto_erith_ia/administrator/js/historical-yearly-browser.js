"use strict";
/* Seven Heaven: a separate annual archive reader, NEVER an exchange request. */
(() => {
  const ROOT = new URL("../data/historical_archive_prototype/calendar_year_hourly_shards/", location.href);
  // One validated engine: standalone yearly page and inline Coffre use the same code.
  const prefix = document.getElementById("vault-year-coin") ? "vault-year-" : "";
  const $ = (id) => document.getElementById(prefix + id);
  const coin = $("coin"), year = $("year"), month = $("month"), read = $("read");
  const status = $("status"), source = $("source"), scope = $("scope");
  const tbody = $("rows"), canvas = $("curve");
  const ctx = canvas.getContext("2d");
  const INDEX_SCHEMA = "aerith.public.ohlcv.calendar-year-hourly-shard-index.v1";
  const SHARD_SCHEMA = "aerith.public.ohlcv.calendar-year-hourly-shard.v1";
  const safeFile = /^[a-z0-9-]+-\d{4}-span\d+(?:-[a-f0-9]{64})?\.json\.gz$/;
  let index, active, requestId = 0;

  function report(message, failed = false) {
    status.textContent = message;
    status.className = failed ? "bad" : "muted";
  }
  function choice(select, value, label) {
    const option = document.createElement("option");
    option.value = value; option.textContent = label;
    select.appendChild(option);
  }
  function entry() {
    return index && index.assets.find((asset) => asset.id === coin.value);
  }
  function selection() {
    const selected = entry();
    return selected && selected.shards.find((shard) => shard.file === year.value);
  }
  function iso(ms) {
    return new Date(ms).toISOString().replace("T", " ").replace(".000Z", " UTC");
  }
  function displayNumber(n) {
    return Number(n).toLocaleString("fr-FR", {maximumFractionDigits: 12});
  }
  function emptyGraph(label) {
    ctx.fillStyle = "#0b1a29";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#b7d4e5";
    ctx.font = "16px system-ui";
    ctx.fillText(label, 24, 40);
  }
  function draw(rows) {
    const width = canvas.width, height = canvas.height;
    emptyGraph("");
    if (!rows.length) return;
    const target = 225, every = Math.max(1, Math.ceil(rows.length / target));
    const bars = [];
    for (let i = 0; i < rows.length; i += every) {
      const section = rows.slice(i, i + every);
      const bar = {t: section[0][0], o: section[0][1],
        h: Math.max(...section.map((r) => r[2])),
        l: Math.min(...section.map((r) => r[3])),
        c: section[section.length - 1][4]};
      bars.push(bar);
    }
    const lowest = Math.min(...bars.map((b) => b.l));
    const highest = Math.max(...bars.map((b) => b.h));
    const margin = Math.max((highest - lowest) * 0.06, lowest * 0.0001, 1e-14);
    const floor = Math.max(0, lowest - margin), ceiling = highest + margin;
    const left = 94, right = width - 24, top = 19, bottom = height - 38;
    const y = (p) => bottom - (p - floor) / (ceiling - floor) * (bottom - top);
    ctx.font = "12px system-ui";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const price = floor + (ceiling - floor) * i / 4;
      const yy = y(price);
      ctx.strokeStyle = "#284458";
      ctx.beginPath();ctx.moveTo(left, yy);ctx.lineTo(right, yy);ctx.stroke();
      ctx.fillStyle = "#b4d0e6";
      ctx.fillText(Number(price).toPrecision(5), left - 9, yy + 4);
    }
    const span = (right - left) / bars.length;
    const candleWidth = Math.max(1, Math.min(6, span * 0.65));
    bars.forEach((bar, i) => {
      const x = left + (i + 0.5) * span;
      const up = bar.c >= bar.o;
      ctx.strokeStyle = ctx.fillStyle = up ? "#71d7ae" : "#f2a196";
      ctx.beginPath();ctx.moveTo(x, y(bar.l));ctx.lineTo(x, y(bar.h));ctx.stroke();
      const topBody = Math.min(y(bar.o), y(bar.c));
      ctx.fillRect(x - candleWidth / 2, topBody, candleWidth,
        Math.max(1.5, Math.abs(y(bar.o) - y(bar.c))));
    });
    ctx.textAlign = "center";ctx.fillStyle = "#b4d0e6";
    for (let i = 0; i <= 4; i++) {
      const b = bars[Math.min(bars.length - 1, Math.floor(i * (bars.length - 1) / 4))];
      ctx.fillText(new Date(b.t).toISOString().slice(0, 10),
                   left + (right - left) * i / 4, height - 11);
    }
  }
  function redraw() {
    if (!active) return;
    const key = month.value;
    const points = key === "all" ? active.series :
      active.series.filter((row) => new Date(row[0]).toISOString().slice(0, 7) === key);
    draw(points);
    tbody.replaceChildren();
    for (const row of points.slice(-40).reverse()) {
      const tr = document.createElement("tr");
      [iso(row[0]), displayNumber(row[1]), displayNumber(row[2]),
       displayNumber(row[3]), displayNumber(row[4]),
       displayNumber(row[5]), displayNumber(row[7])].forEach((s) => {
        const td = document.createElement("td");td.textContent = s;tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    scope.textContent = points.length.toLocaleString("fr-FR") +
      " bougies horaires vérifiées affichées · chandeliers agrégés pour la lisibilité ; " +
      "aucun prix interpolé ni conversion USDT → USD.";
  }
  function populateYears() {
    year.replaceChildren();month.replaceChildren();
    active = null;emptyGraph("Sélectionnez l'année archivée.");
    const asset = entry();
    if (!asset || !asset.shards.length) {
      choice(year, "", "Aucune année");read.disabled = true;return;
    }
    asset.shards.slice().sort((a,b) => a.first_open_ms - b.first_open_ms)
      .forEach((shard) => choice(year, shard.file,
         shard.year + " · " + shard.first_month + " → " + shard.last_month +
         " · " + shard.hourly_count.toLocaleString("fr-FR") + " heures"));
    read.disabled = false;
    report("Sélectionnez un bloc annuel ou lancez la lecture.");
  }
  async function fileSha(buffer) {
    const bytes = await crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(bytes)).map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  function validate(data, asset, meta) {
    if (data.schema !== SHARD_SCHEMA || data.asset_id !== asset.id ||
        data.quote !== "USDT" || data.year !== meta.year ||
        data.first_trade_date_known !== false || !Array.isArray(data.series) ||
        data.series.length !== meta.hourly_count ||
        data.native_1m_count !== data.series.length * 60 ||
        !Array.isArray(data.source_months) ||
        data.source_months.length !== meta.source_months.length) {
      throw Error("Schéma, identité, nombre de bougies ou preuve source incohérents.");
    }
    for (let i = 0; i < data.source_months.length; i++) {
      const x = data.source_months[i], y = meta.source_months[i];
      if (x.month !== y.month || x.source_zip_sha256 !== y.source_zip_sha256) {
        throw Error("Signature du mois d'origine incohérente.");
      }
    }
    let prev = null;
    for (const row of data.series) {
      if (!Array.isArray(row) || row.length !== 8 || !row.every(Number.isFinite) ||
          row[0] % 3600000 !== 0 || (prev !== null && row[0] !== prev + 3600000) ||
          row[3] <= 0 || row[3] > Math.min(row[1], row[4]) ||
          Math.max(row[1], row[4]) > row[2] || row[5] < 0 || row[6] < 0 ||
          row[7] < 0) {
        throw Error("Bougies OHLC horaires incohérentes ou discontinues.");
      }
      prev = row[0];
    }
    if (data.series[0][0] !== meta.first_open_ms ||
        data.series[data.series.length - 1][0] !== meta.last_open_ms) {
      throw Error("Bornes du bloc annuel incohérentes.");
    }
  }
  async function loadYear() {
    const asset = entry(), meta = selection();
    if (!asset || !meta) return;
    const token = ++requestId;
    read.disabled = true;
    report("Chargement et contrôle SHA-256 du bloc annuel · " + asset.symbol + "…");
    try {
      if (!safeFile.test(meta.file) || !meta.file.startsWith(asset.id + "-")) {
        throw Error("Nom d'archive annuel non autorisé.");
      }
      if (!crypto.subtle || typeof DecompressionStream === "undefined") {
        throw Error("Ce navigateur ne prend pas en charge la décompression gzip sécurisée.");
      }
      const response = await fetch(new URL(meta.file, ROOT), {cache:"no-store"});
      if (!response.ok) throw Error("Fichier annuel indisponible : HTTP " + response.status);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength !== meta.bytes || await fileSha(bytes) !== meta.sha256) {
        throw Error("Fichier annuel incomplet ou SHA-256 incorrect.");
      }
      const unzip = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const data = await new Response(unzip).json();
      validate(data, asset, meta);
      if (token !== requestId) return;
      active = data;
      month.replaceChildren();
      choice(month, "all", "Bloc complet");
      for (const m of data.source_months) choice(month, m.month, m.month);
      report("Vérifié · " + asset.symbol + " · " + meta.year + " · " +
             meta.hourly_count.toLocaleString("fr-FR") + " heures · SHA-256 conforme");
      source.textContent = "Binance Spot USDT · " + data.source_months.length +
        " mois natifs validés · " + data.native_1m_count.toLocaleString("fr-FR") +
        " bougies 1m source · UTC · ce bloc ne prouve pas la première cotation historique.";
      redraw();
    } catch (e) {
      if (token !== requestId) return;
      active = null;
      report("Bloc non chargé : " + (e && e.message ? e.message : "Erreur de vérification"), true);
      emptyGraph("Aucune bougie non vérifiée n'est affichée.");
    } finally {
      if (token === requestId) read.disabled = false;
    }
  }
  coin.addEventListener("change", () => {++requestId;populateYears();loadYear();});
  year.addEventListener("change", () => {++requestId;month.replaceChildren();loadYear();});
  month.addEventListener("change", redraw);
  read.addEventListener("click", loadYear);
  if (prefix) document.addEventListener("seven-vault-select", (event) => {
    if (!index || !index.assets.some(a => a.id === event.detail?.id)) {
      return; // Other archived assets have no materialized annual block yet.
    }
    coin.value = event.detail.id;
    populateYears();
    void loadYear();
  });
  emptyGraph("Chargement du registre annuel…");
  (async () => {
    try {
      const response = await fetch(new URL("index.json", ROOT), {cache:"no-store"});
      if (!response.ok) throw Error("Index annuel pas encore publié : HTTP " + response.status);
      index = await response.json();
      if (index.schema !== INDEX_SCHEMA || index.quote !== "USDT" ||
          !Array.isArray(index.assets) ||
          index.materialized_assets !== index.assets.length) {
        throw Error("Index annuel non conforme.");
      }
      coin.replaceChildren();
      index.assets.slice().sort((a, b) => a.rank - b.rank).forEach((a) =>
        choice(coin, a.id, "#" + a.rank + " · " + a.name + " (" + a.symbol + ")"));
      if (!index.assets.length) throw Error("Les premiers blocs annuels sont en construction.");
      populateYears();
      await loadYear();
    } catch (e) {
      report("Le registre pluriannuel est en cours de publication : " +
             (e && e.message ? e.message : "inaccessible") + " · Réessayez plus tard.", true);
      read.disabled = true;
    }
  })();
})();