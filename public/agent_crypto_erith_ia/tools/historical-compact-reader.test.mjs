import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {webcrypto} from "node:crypto";

const origin = "https://blueazur-hub.github.io";
const root = "/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/";
const directory = path.resolve("public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1");
const program = fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/historical-compact-reader.js", "utf8");

function setup({tamper = false} = {}) {
  let requested = [];
  const window = {};
  async function fetchMock(uri) {
    const u = new URL(uri);
    assert.equal(u.origin, origin);
    assert.ok(u.pathname.startsWith(root));
    const relative = u.pathname.slice(root.length);
    assert.ok(!relative.includes(".."), "Path traversal");
    assert.ok(relative === "index.json" || /^series\/[a-z0-9-]+_(24h|7d|30d)_[a-f0-9]{16}\.json\.gz$/.test(relative));
    requested.push(relative);
    const data = fs.readFileSync(path.join(directory, relative));
    const result = Buffer.from(data);
    if (tamper && relative.startsWith("series/")) result[12] ^= 1;
    return new Response(result, {status:200});
  }
  vm.runInNewContext(program, {
    window, document: {currentScript: {src:origin +
      "/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/historical-compact-reader.js"}},
    location:{origin}, URL, fetch:fetchMock, crypto:webcrypto, Blob, Response,
    DecompressionStream, TextDecoder, TextEncoder, Uint8Array
  }, {timeout:3000});
  return {window, requested};
}

test("no network reads without an explicit selection", () => {
  const t = setup();
  assert.deepEqual(t.requested, []);
  assert.equal(typeof t.window.SevenCompactArchiveReader.readSeries, "function");
});

test("one index plus one real verified BTC block, not 21 blocks", async () => {
  const t = setup();
  const r = await t.window.SevenCompactArchiveReader.readSeries({assetId:"bitcoin", period:"24h"});
  assert.equal(r.metadata.status, "VALIDATED_SNAPSHOT");
  assert.equal(r.metadata.pair, "BTCUSDT");
  assert.equal(r.metadata.quote, "USDT");
  assert.equal(r.metadata.graphConnected, false);
  assert.equal(r.metadata.isLive, false);
  assert.equal(r.candles.length, r.metadata.points);
  assert.deepEqual(t.requested.map(x=>x==="index.json"?"index":"block"), ["index","block"]);
  const catalog = await t.window.SevenCompactArchiveReader.listCoverage();
  assert.equal(catalog.coverage.length,21);
  assert.ok(catalog.total>=4585);
});

test("ETH 7j and ZEC 30j can be read as separate series", async () => {
  const t = setup();
  const e = await t.window.SevenCompactArchiveReader.readSeries({assetId:"ethereum",period:"7d"});
  const z = await t.window.SevenCompactArchiveReader.readSeries({assetId:"zcash",period:"30d"});
  assert.equal(e.metadata.interval,"1h");
  assert.equal(z.metadata.interval,"4h");
  assert.equal(t.requested.length,3,"One catalog and two requested blocks only");
});

test("unqualified assets are rejected without a fallback", async () => {
  const t=setup();
  await assert.rejects(t.window.SevenCompactArchiveReader.readSeries({assetId:"tether",period:"24h"}),/Aucune série/);
  assert.equal(t.requested.length,1);
});

test("a single modified gzip byte fails SHA validation", async () => {
  const t=setup({tamper:true});
  await assert.rejects(t.window.SevenCompactArchiveReader.readSeries({assetId:"bitcoin",period:"24h"}),/SHA-256/);
});
