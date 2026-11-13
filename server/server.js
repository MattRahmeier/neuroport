// Neuroport — ponte local entre o celular (web) e o mod CET dentro do jogo.
// Sem dependências: Node puro (http + fs).
//
// Fluxo:
//   celular --POST /api/cmd--> server --(inbox.txt)--> mod CET (lê a cada 250ms)
//   mod CET --(state.json)--> server --SSE /api/stream--> celular
//
// Uso:
//   node server.js                 -> usa a pasta do mod no jogo (Steam padrão)
//   node server.js --mock          -> simula o jogo (para testar a interface)
//   node server.js --bridge <dir>  -> pasta do mod em outro lugar
//   node server.js --port 7077
//   node server.js --gui           -> abre o painel do servidor (janela do Edge) ao iniciar

'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');

// ---------- argumentos ----------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const MOCK = flag('--mock');
const PORT = Number(opt('--port', process.env.NEUROPORT_PORT || 7077));
// Pasta do mod no jogo (ponte de arquivos). Ordem: --bridge / NEUROPORT_BRIDGE; o próprio
// servidor dentro da pasta do mod (pacote do Nexus: mods/neuroport/companion/server); Steam
// (todas as bibliotecas), GOG e Epic.
const MOD_SUBPATH = path.join('bin', 'x64', 'plugins', 'cyber_engine_tweaks', 'mods', 'neuroport');
function gameDirs() {
  const out = [];
  const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const pf = process.env.ProgramFiles || 'C:\\Program Files';
  const steamRoots = [path.join(pf86, 'Steam'), path.join(pf, 'Steam')];
  for (const root of steamRoots) {
    out.push(path.join(root, 'steamapps', 'common', 'Cyberpunk 2077'));
    // outras bibliotecas da Steam (D:\\SteamLibrary etc.)
    try {
      const vdf = fs.readFileSync(path.join(root, 'steamapps', 'libraryfolders.vdf'), 'utf8');
      for (const m of vdf.matchAll(/"path"\s+"([^"]+)"/g)) out.push(path.join(m[1].replace(/\\\\/g, '\\'), 'steamapps', 'common', 'Cyberpunk 2077'));
    } catch { /* sem Steam aqui */ }
  }
  out.push(path.join(pf86, 'GOG Galaxy', 'Games', 'Cyberpunk 2077'), path.join(pf, 'GOG Galaxy', 'Games', 'Cyberpunk 2077'),
    'C:\\GOG Games\\Cyberpunk 2077', path.join(pf, 'Epic Games', 'Cyberpunk2077'), path.join(pf, 'Epic Games', 'Cyberpunk 2077'));
  return out;
}
const isGame = (g) => fs.existsSync(path.join(g, 'archive', 'pc', 'content'));
// pasta do mod onde o próprio servidor está (pacote: mods/neuroport/companion/server)
function ownModDir() {
  const parts = path.resolve(__dirname).split(path.sep);
  const i = parts.map((p) => p.toLowerCase()).lastIndexOf('neuroport');
  if (i > 0 && parts[i - 1].toLowerCase() === 'mods' && fs.existsSync(path.join(parts.slice(0, i + 1).join(path.sep), 'init.lua'))) {
    return parts.slice(0, i + 1).join(path.sep);
  }
  return null;
}
// Mod Organizer 2: o pacote fica em <MO2>\mods\<nome>\bin\x64\...\neuroport e o jogo enxerga uma pasta
// virtual. Os arquivos que o mod cria (state.json etc.) vão para <MO2>\overwrite\bin\x64\...\neuroport,
// que o servidor (rodando fora do MO2) precisa ler.
function mo2Root(modDir) {
  if (!modDir) return null;
  const parts = modDir.split(path.sep);
  const n = MOD_SUBPATH.split(path.sep).length;
  const top = parts.slice(0, parts.length - n);              // <MO2>\mods\<nome>
  if (top.length < 3 || top[top.length - 2].toLowerCase() !== 'mods') return null;
  const root = top.slice(0, -2).join(path.sep);
  if (!fs.existsSync(path.join(root, 'overwrite')) && !fs.existsSync(path.join(root, 'ModOrganizer.ini'))) return null;
  return root;
}
// pasta do jogo configurada no MO2 (gamePath=@ByteArray(D:\\Games\\Cyberpunk 2077))
function mo2GamePath(root) {
  try {
    const ini = fs.readFileSync(path.join(root, 'ModOrganizer.ini'), 'utf8');
    const m = ini.match(/^gamePath\s*=\s*(?:@ByteArray\()?(.*?)\)?\s*$/m);
    if (m && m[1]) return m[1].replace(/\\\\/g, '\\').replace(/\//g, '\\');
  } catch { /* sem ini */ }
  return null;
}
const OWN_MOD = ownModDir();
const MO2 = mo2Root(OWN_MOD);
function findGameDir() {
  const fromMo2 = MO2 && mo2GamePath(MO2);
  if (fromMo2 && isGame(fromMo2)) return fromMo2;
  if (OWN_MOD && !MO2) {
    const up = path.resolve(OWN_MOD, '..', '..', '..', '..', '..', '..');
    if (isGame(up)) return up;
  }
  return gameDirs().find((g) => fs.existsSync(path.join(g, 'bin', 'x64', 'plugins', 'cyber_engine_tweaks'))) ||
    gameDirs().find(isGame) || gameDirs()[0];
}
// pasta do jogo (para o extrator de imagens ler os arquivos .archive)
const GAME_DIR = findGameDir();
// Pastas onde o mod pode estar gravando (ponte de arquivos). Em geral é uma só; com MO2 (ou com o
// servidor aberto pela pasta de staging do Vortex) o jogo grava em outro lugar. O servidor lê da
// pasta com o state.json mais recente e escreve o inbox.txt em todas.
function findBridges() {
  const forced = opt('--bridge', process.env.NEUROPORT_BRIDGE || '');
  if (forced) return [forced];
  const out = [];
  const add = (d) => { if (d && !out.some((x) => x.toLowerCase() === d.toLowerCase())) out.push(d); };
  add(OWN_MOD);
  if (MO2) add(path.join(MO2, 'overwrite', MOD_SUBPATH));
  const inGame = path.join(GAME_DIR, MOD_SUBPATH);
  if (!out.length || fs.existsSync(inGame)) add(inGame);
  return out;
}
const BRIDGES = findBridges();
const BRIDGE = BRIDGES[0];
// pasta que o jogo está usando agora: a do state.json mais novo
let activeBridge = BRIDGE;
function pickBridge() {
  let best = null, bestT = -1;
  for (const d of BRIDGES) {
    try { const t = fs.statSync(path.join(d, 'state.json')).mtimeMs; if (t > bestT) { bestT = t; best = d; } } catch { /* ainda não */ }
  }
  if (best && best !== activeBridge) {
    activeBridge = best;
    console.log('  Mod conectado pela pasta: ' + best);
  }
  return activeBridge;
}
const WEB_DIR = path.join(__dirname, '..', 'web');
const bridgeFile = (name) => path.join(activeBridge, name);
const STALE_MS = 4000; // sem atualização do mod por mais que isso => jogo "offline"

// ---------- log (também aparece no painel do servidor) ----------
const LOG = [];
const _log = console.log.bind(console);
console.log = (...a) => {
  const line = a.join(' ');
  _log(line);
  if (line.trim()) { LOG.push({ t: Date.now(), line }); if (LOG.length > 300) LOG.shift(); }
};
const startedAt = Date.now();

// ---------- código de pareamento ----------
// Fica salvo para o link no celular continuar valendo entre reinícios.
const TOKEN_FILE = path.join(__dirname, '.token');
let TOKEN = opt('--token', null);
if (!TOKEN) {
  try { TOKEN = fs.readFileSync(TOKEN_FILE, 'utf8').trim(); } catch { /* novo */ }
}
// Código de pareamento: 12 caracteres em base32 sem letras ambíguas (60 bits), mostrado como XXXX-XXXX-XXXX.
// Junto com o limite de tentativas abaixo, adivinhar o código pela rede não é viável.
const B32 = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
const normKey = (k) => String(k || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const fmtToken = (t) => (t || '').replace(/(.{4})(?=.)/g, '$1-');
function newToken() {
  const b = crypto.randomBytes(12);
  TOKEN = Array.from(b, (x) => B32[x % B32.length]).join('');
  try { fs.writeFileSync(TOKEN_FILE, TOKEN); } catch { /* ok */ }
}
TOKEN = normKey(TOKEN);
if (!TOKEN || flag('--new-token') || (!opt('--token', null) && TOKEN.length < 12)) newToken();   // códigos antigos (6 caracteres) são trocados

// ---------- estado compartilhado ----------
let gameState = null;      // último state.json válido
let worldState = null;     // último world.json válido
let worldMtime = 0;
let stateMtime = 0;        // mtime do arquivo (para detectar jogo fechado)
let lastBroadcast = '';
const clients = new Set(); // respostas SSE abertas
const clientInfo = new Map(); // res -> { ip, ua, since }

// Comandos pendentes (ainda não confirmados pelo mod)
let nextId = Date.now();
const pending = []; // {id, action, arg}

function snapshot() {
  const online = MOCK ? true : Date.now() - stateMtime < STALE_MS && !!gameState;
  const game = gameState ? { ...gameState, ...(worldState || {}) } : null;
  return { online, mock: MOCK, game };
}

function broadcast(force) {
  const snap = snapshot();
  if (snap.game) warmImages(snap.game);
  const payload = JSON.stringify(snap);
  if (!force && payload === lastBroadcast) return;
  lastBroadcast = payload;
  for (const res of clients) res.write(`event: state\ndata: ${payload}\n\n`);
}

function sendEvent(event, data) {
  const s = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(s);
}

// ---------- ponte por arquivos (modo real) ----------
function writeInbox() {
  // Uma linha por comando: id \t action \t arg
  const body = pending
    .map((c) => `${c.id}\t${c.action}\t${String(c.arg ?? '').replace(/[\t\r\n]/g, ' ')}`)
    .join('\n');
  let retry = false;
  // em todas as pastas possíveis: com o MO2 não dá para saber qual delas o jogo está lendo
  for (const dir of BRIDGES) {
    if (dir !== BRIDGE && !fs.existsSync(dir)) continue;
    const inbox = path.join(dir, 'inbox.txt');
    const tmp = inbox + '.tmp';
    try {
      fs.writeFileSync(tmp, body + (body ? '\n' : ''), 'utf8');
      fs.renameSync(tmp, inbox);
    } catch (e) {
      // O mod pode estar lendo o arquivo neste instante; tenta de novo em breve.
      retry = true;
    }
  }
  if (retry) setTimeout(writeInbox, 60);
}

const seenAcks = new Set();
function pollWorld() {
  const WORLD = bridgeFile('world.json'); // marcadores + diário (atualiza a cada ~3s)
  let st;
  try { st = fs.statSync(WORLD); } catch { return; }
  if (st.mtimeMs === worldMtime) return;
  try {
    worldState = JSON.parse(fs.readFileSync(WORLD, 'utf8').replace(/^\uFEFF/, ''));
    delete worldState.v;
    worldMtime = st.mtimeMs;
  } catch { /* no meio de uma escrita */ }
}

let lastPick = 0;
function pollState() {
  if (BRIDGES.length > 1 && Date.now() - lastPick > 2000) { lastPick = Date.now(); pickBridge(); }
  pollWorld();
  const STATE = bridgeFile('state.json');
  let st;
  try { st = fs.statSync(STATE); } catch { broadcast(); return; }
  if (st.mtimeMs !== stateMtime) {
    try {
      const parsed = JSON.parse(fs.readFileSync(STATE, 'utf8').replace(/^﻿/, ''));
      gameState = parsed;
      stateMtime = st.mtimeMs;
      handleAcks(parsed.acks || []);
    } catch {
      // Arquivo no meio de uma escrita — ignora, lê na próxima volta.
    }
  }
  broadcast();
}

function handleAcks(acks) {
  for (const a of acks) {
    if (seenAcks.has(a.id)) continue;
    seenAcks.add(a.id);
    const idx = pending.findIndex((c) => String(c.id) === String(a.id));
    if (idx >= 0) pending.splice(idx, 1);
    sendEvent('ack', a);
  }
  if (seenAcks.size > 500) seenAcks.clear();
  writeInboxIfChanged();
}

let lastInbox = null;
function writeInboxIfChanged() {
  const key = pending.map((c) => c.id).join(',');
  if (key === lastInbox) return;
  lastInbox = key;
  writeInbox();
}

// Comandos que o mod nunca confirmou (jogo fechado etc.) expiram.
setInterval(() => {
  const now = Date.now();
  for (let i = pending.length - 1; i >= 0; i--) {
    if (now - pending[i].at > 15000) {
      sendEvent('ack', { id: pending[i].id, ok: false, msg: 'timeout' });
      pending.splice(i, 1);
    }
  }
  if (!MOCK) writeInboxIfChanged();
}, 1000);

// ---------- simulação (--mock) ----------
const mock = MOCK ? require('./mock.js') : null;
if (mock) mock.setLang(opt('--lang', 'pt-br'));

function enqueue(action, arg) {
  const id = String(++nextId);
  if (MOCK) {
    setTimeout(() => {
      const r = mock.run(action, arg);
      gameState = mock.state();
      sendEvent('ack', { id, ok: r.ok, msg: r.msg, action });
      broadcast();
    }, 350);
  } else {
    pending.push({ id, action, arg, at: Date.now() });
    writeInboxIfChanged();
  }
  return id;
}

// ---------- HTTP ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.glb': 'model/gltf-binary',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.bin': 'application/octet-stream',
};

const isLocal = (req) => /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress || '');
// Painel do servidor: além de vir do próprio PC, o pedido precisa ser para localhost (contra DNS rebinding)
// e, se for de escrita, vir do próprio painel: outro site aberto no navegador não consegue mandar o
// cabeçalho X-Neuroport-Admin sem permissão (CORS), nem fingir a origem.
function adminRequestOk(req) {
  const host = String(req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
  if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) return false;
  const origin = req.headers.origin;
  if (origin && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/i.test(origin)) return false;
  if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) return false;
  if (req.method !== 'GET' && req.headers['x-neuroport-admin'] !== '1') return false;
  return true;
}
// Limite de tentativas: 8 códigos errados em 10 min bloqueiam aquele IP por 15 min (o próprio PC não conta).
const authFails = new Map(); // ip -> { n, t0, until }
const clientIp = (req) => (req.socket.remoteAddress || '').replace('::ffff:', '');
function authBlocked(req) {
  const f = authFails.get(clientIp(req));
  return !!(f && f.until && Date.now() < f.until);
}
function authed(req, url) {
  if (authBlocked(req)) return false;
  const k = normKey(url.searchParams.get('k') || req.headers['x-neuroport-key']);
  const ok = k.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(k), Buffer.from(TOKEN));
  if (!ok && !isLocal(req)) {
    const ip = clientIp(req), now = Date.now();
    let f = authFails.get(ip);
    if (!f || now - f.t0 > 600000) f = { n: 0, t0: now, until: 0 };
    if (++f.n >= 8) { f.until = now + 900000; console.log(`  [segurança] ${ip} bloqueado por 15 min (código errado ${f.n}x)`); }
    authFails.set(ip, f);
  }
  return ok;
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (c) => { b += c; if (b.length > 1e5) req.destroy(); });
    req.on('end', () => resolve(b));
  });
}

const ACTIONS = new Set(['summon', 'call', 'hangup', 'refresh', 'ping', 'waypoint', 'clearwp', 'track', 'untrack', 'call_answer', 'call_reject',
  'radio_on', 'radio_off', 'radio_set', 'radio_next', 'radio_prev', 'radio_vol', 'ad_start', 'ad_quest', 'ad_stop', 'color', 'color_reset', 'horn',
  'thread', 'thread_close', 'reply', 'quest_details', 'quest_details_close', 'buy', 'shop_refresh',
  'immersive_on', 'immersive_off', 'imm_toggle', 'imm_all', 'shard_read', 'photo_mode']);

// Aperta uma tecla (scancode) na janela do Cyberpunk 2077 — usado para o modo foto (N)
function pressGameKey(scan) {
  const ps = spawn('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'presskey.ps1'), '-Scan', String(scan)], { windowsHide: true });
  let out = '';
  ps.stdout.on('data', (d) => { out += d; });
  ps.on('exit', () => console.log(`  [modo foto] tecla enviada: ${out.trim() || 'sem resposta'}`));
}

// ---------- fotos do modo foto (pasta de capturas do jogo) ----------
const PHOTO_DIRS = [path.join(os.homedir(), 'Pictures', 'Cyberpunk 2077'), path.join(os.homedir(), 'OneDrive', 'Pictures', 'Cyberpunk 2077')];
function listPhotos() {
  const out = [];
  for (const dir of PHOTO_DIRS) {
    let names = [];
    try { names = fs.readdirSync(dir); } catch { continue; }
    for (const n of names) {
      // só as fotos do modo foto do jogo (photomode_DDMMAAAA_HHMMSS.png); outras imagens da pasta não aparecem
      if (!/^photomode_[\d_]+\.(png|jpe?g|webp)$/i.test(n)) continue;
      try { out.push({ name: n, dir, t: fs.statSync(path.join(dir, n)).mtimeMs }); } catch { /* ok */ }
    }
  }
  return out.sort((a, b) => b.t - a.t);
}


const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (url.pathname === '/api/stream') {
    if (!authed(req, url)) { res.writeHead(401); return res.end('codigo invalido'); }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write(`event: state\ndata: ${JSON.stringify(snapshot())}\n\n`);
    clients.add(res);
    clientInfo.set(res, { ip: (req.socket.remoteAddress || '').replace('::ffff:', ''), ua: req.headers['user-agent'] || '', since: Date.now() });
    console.log(`  [celular] conectado: ${clientInfo.get(res).ip}`);
    const ka = setInterval(() => res.write(': ka\n\n'), 15000);
    req.on('close', () => {
      const info = clientInfo.get(res);
      clients.delete(res); clientInfo.delete(res); clearInterval(ka);
      if (info) console.log(`  [celular] desconectado: ${info.ip}`);
    });
    return;
  }

  if (url.pathname === '/api/cmd' && req.method === 'POST') {
    if (!authed(req, url)) { res.writeHead(401); return res.end('{"error":"codigo invalido"}'); }
    let body = {};
    try { body = JSON.parse(await readBody(req)); } catch { /* vazio */ }
    if (!ACTIONS.has(body.action) && !(MOCK && (body.action === 'mock_ring' || body.action === 'mock_car'))) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end('{"error":"acao desconhecida"}');
    }
    if (!['ping', 'refresh', 'thread', 'quest_details', 'shop_refresh'].includes(body.action)) {
      console.log(`  [comando] ${body.action}${body.arg ? ' ' + String(body.arg).slice(0, 40) : ''}`);
    }
    // modo foto: o jogo não abre por script; o servidor aperta a tecla N na janela do jogo
    if (body.action === 'photo_mode' && !MOCK) pressGameKey(0x31);
    const id = enqueue(body.action, body.arg);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ id }));
  }

  if (url.pathname === '/api/check') {
    res.writeHead(authed(req, url) ? 200 : 401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: authed(req, url) }));
  }

  if (url.pathname === '/api/warm') {
    if (!authed(req, url)) { res.writeHead(401); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    return res.end(JSON.stringify({ total: warm.total, done: warm.done, failed: warm.failed }));
  }

  // shards (Codex): o mod grava shards.json à parte; o app busca quando abre o leitor
  if (url.pathname === '/api/shards') {
    if (!authed(req, url)) { res.writeHead(401); return res.end(); }
    let txt = '{"shards":[]}';
    try { txt = fs.readFileSync(bridgeFile('shards.json'), 'utf8').replace(/^\uFEFF/, ''); } catch { /* ainda não existe */ }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(txt);
  }

  if (url.pathname === '/api/photos') {
    if (!authed(req, url)) { res.writeHead(401); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(listPhotos().slice(0, 60).map((f) => ({ name: f.name, t: f.t }))));
  }
  const pm = url.pathname.match(/^\/photo\/(.+)$/);
  if (pm) {
    if (!authed(req, url)) { res.writeHead(401); return res.end(); }
    const name = decodeURIComponent(pm[1]);
    const f = listPhotos().find((x) => x.name === name);
    if (!f) { res.writeHead(404); return res.end(); }
    const ext = path.extname(name).toLowerCase();
    res.writeHead(200, { 'Content-Type': ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg', 'Cache-Control': 'public, max-age=86400' });
    return fs.createReadStream(path.join(f.dir, f.name)).pipe(res);
  }

  // ---------- painel do servidor (só no próprio PC) ----------
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    if (!isLocal(req)) { res.writeHead(403); return res.end('painel disponível só no PC'); }
    if (!adminRequestOk(req)) { res.writeHead(403); return res.end('pedido bloqueado'); }
    if (url.pathname === '/admin/api/status') {
      const snap = snapshot();
      const g = snap.game || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        mock: MOCK, port: PORT, token: TOKEN, ips: lanAddresses(), uptime: Date.now() - startedAt,
        bridge: activeBridge, bridgeExists: fs.existsSync(activeBridge), mo2: !!MO2,
        online: snap.online, inGame: !!g.inGame, mod: g.mod || null, lang: g.lang || null, immersive: !!g.immersive, immHud: g.immHud || [],
        player: g.player || null, district: g.district || null, vehicle: g.vehicle || null,
        counts: { pois: (g.pois || []).length, contacts: (g.contacts || []).length, quests: ((g.journal || {}).quests || []).length, offers: (g.offers || []).length },
        phones: [...clientInfo.values()],
        pending: pending.length,
        log: LOG.slice(-120),
      }));
    }
    if (url.pathname === '/admin/api/token' && req.method === 'POST') {
      newToken();
      console.log(`  Novo código de pareamento: ${fmtToken(TOKEN)}`);
      for (const r of clients) { try { r.end(); } catch { /* ok */ } }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ token: TOKEN }));
    }
    if (url.pathname === '/admin/api/cmd' && req.method === 'POST') {
      let body = {};
      try { body = JSON.parse(await readBody(req)); } catch { /* vazio */ }
      if (!ACTIONS.has(body.action)) { res.writeHead(400); return res.end(); }
      console.log(`  [painel] ${body.action}`);
      const id = enqueue(body.action, body.arg);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id }));
    }
    if (url.pathname === '/admin/api/open' && req.method === 'POST') {
      const which = url.searchParams.get('what');
      // o app no navegador padrão do PC, já pareado
      if (which === 'app') {
        spawn('cmd', ['/c', 'start', '', `http://localhost:${PORT}/?k=${TOKEN}`], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
        res.writeHead(204); return res.end();
      }
      const target = which === 'photos' ? (PHOTO_DIRS.find((d) => fs.existsSync(d)) || PHOTO_DIRS[0]) : which === 'project' ? path.join(__dirname, '..') : activeBridge;
      spawn('explorer', [target], { detached: true, stdio: 'ignore' }).unref();
      res.writeHead(204); return res.end();
    }
    if (url.pathname === '/admin/api/restart' && req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
      setTimeout(restartServer, 150);
      return;
    }
    if (url.pathname === '/admin/api/clear-cache' && req.method === 'POST') {
      let n = 0;
      try { for (const f of fs.readdirSync(AVATAR_DIR)) { fs.unlinkSync(path.join(AVATAR_DIR, f)); n++; } } catch { /* ok */ }
      console.log(`  [painel] cache de avatares limpo (${n} arquivos)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ removed: n }));
    }
    const af = url.pathname === '/admin' || url.pathname === '/admin/' ? 'index.html' : url.pathname.slice(7);
    const file = path.normalize(path.join(WEB_DIR, 'admin', af));
    if (!file.startsWith(path.join(WEB_DIR, 'admin'))) { res.writeHead(403); return res.end(); }
    return fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  // Avatares dos contatos: extraídos sob demanda dos atlas de UI do jogo (e guardados em cache)
  const am = url.pathname.match(/^\/avatar\/([a-z0-9_]{1,64})\.png$/i);
  if (am) {
    const file = await avatarFile(am[1], url.searchParams.get('a'));
    if (!file) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' });
    return fs.createReadStream(file).pipe(res);
  }

  // Arquivos estáticos da interface
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(WEB_DIR, p));
  if (!file.startsWith(WEB_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) {
      // caminho sem extensão (leitor de QR que altera o link etc.): volta para o app em vez de "página inexistente"
      if (!path.extname(p)) { res.writeHead(302, { Location: '/' + url.search }); return res.end(); }
      res.writeHead(404); return res.end('404');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      // os dados do mapa (10 MB) ficam em cache no celular
      'Cache-Control': file.includes(`${path.sep}map3d${path.sep}`) ? 'public, max-age=604800' : 'no-cache',
    });
    res.end(data);
  });
});

function lanAddresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list || []) {
      if (a.family === 'IPv4' && !a.internal && !/vEthernet|VirtualBox|VMware|WSL|Hyper-V/i.test(name)) {
        out.push(a.address);
      }
    }
  }
  // rede de casa primeiro (o QR usa o primeiro): 192.168 > 10 > 172.16-31 > resto (VPN, Tailscale 100.x)
  const rank = (ip) => /^192\.168\./.test(ip) ? 0 : /^10\./.test(ip) ? 1 : /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ? 2 : 3;
  return out.sort((a, b) => rank(a) - rank(b));
}

// ---------- avatares ----------
const AVATAR_DIR = path.join(WEB_DIR, 'avatars');
const avatarJobs = new Map();
// índice parte -> atlas de todas as imagens de UI do jogo (carros, apartamentos, avatares)
const ATLAS_INDEX = path.join(__dirname, '..', 'tools', 'gamefiles', 'atlas_index.json');
let atlasIndexReady = null;
function ensureAtlasIndex() {
  if (atlasIndexReady) return atlasIndexReady;
  if (fs.existsSync(ATLAS_INDEX)) return (atlasIndexReady = Promise.resolve(true));
  console.log('  [imagens] montando o índice de imagens do jogo (só na primeira vez, ~1 min)...');
  const script = path.join(__dirname, '..', 'tools', 'gamefiles', 'avatar.py');
  const run = (cmd) => new Promise((res) => {
    const p = spawn(cmd, ['-I', script, '--build-index'], { windowsHide: true, env: { ...process.env, NEUROPORT_GAME: GAME_DIR } });
    p.stdout.on('data', (d) => console.log('  [imagens] ' + String(d).trim()));
    p.on('error', () => res(false));
    p.on('exit', (c) => res(c === 0));
  });
  atlasIndexReady = run('python').then((ok) => ok || run('py'));
  return atlasIndexReady;
}
function avatarFile(part, atlas) {
  const file = path.join(AVATAR_DIR, part.toLowerCase() + '.png');
  if (fs.existsSync(file)) return Promise.resolve(file);
  if (avatarJobs.has(file)) return avatarJobs.get(file);
  const waitIndex = /^(v_|apr_)/i.test(part) ? ensureAtlasIndex() : Promise.resolve(true);
  const a = atlas && /^(0x)?[0-9a-f]{1,20}$/i.test(atlas) ? atlas : '';
  const script = path.join(__dirname, '..', 'tools', 'gamefiles', 'avatar.py');
  const run = (cmd) => new Promise((res) => {
    const p = spawn(cmd, ['-I', script, part, file, a], { windowsHide: true, env: { ...process.env, NEUROPORT_GAME: GAME_DIR } });
    p.on('error', () => res(false));
    p.on('exit', (c) => res(c === 0));
  });
  const job = waitIndex.then(() => run('python')).then((ok) => ok || run('py')).then((ok) => {
    avatarJobs.delete(file);
    return ok && fs.existsSync(file) ? file : null;
  });
  avatarJobs.set(file, job);
  return job;
}

// Pré-extração: assim que o jogo conecta, todas as imagens (contatos, garagem, Autofixer, El Capitan)
// são extraídas em segundo plano, 2 por vez. O app acompanha por /api/warm na tela de abertura.
const warm = { total: 0, done: 0, failed: 0, seen: new Set(), queue: [], running: 0 };
function warmImages(g) {
  const add = (part, atlas) => {
    if (!part || !/^[a-z0-9_]{1,64}$/i.test(part)) return;
    const k = part.toLowerCase();
    if (warm.seen.has(k)) return;
    warm.seen.add(k);
    warm.total++;
    warm.queue.push([part, atlas || '']);
  };
  for (const c of g.contacts || []) if (c.avatar) add(c.avatar, c.atlas);
  for (const v of g.vehicles || []) if (v.img) add(v.img.part, v.img.atlas);
  for (const o of g.offers || []) if (o.img) add(o.img.part, o.img.atlas);
  pumpWarm();
}
function pumpWarm() {
  while (warm.running < 2 && warm.queue.length) {
    const [part, atlas] = warm.queue.shift();
    warm.running++;
    avatarFile(part, atlas).then((f) => { if (!f) warm.failed++; }, () => { warm.failed++; })
      .finally(() => { warm.running--; warm.done++; pumpWarm(); });
  }
}

// ---------- toque de chamada ----------
// Extraído uma vez da instalação do jogo (tools/ringtone/extract_ringtone.py).
const RINGTONE = path.join(WEB_DIR, 'ringtone', 'ringtone.ogg');
function ensureRingtone() {
  if (fs.existsSync(RINGTONE)) return;
  const script = path.join(__dirname, '..', 'tools', 'gamefiles', 'extract_ringtone.py');
  const run = (cmd) => new Promise((res) => {
    const p = spawn(cmd, ['-I', script, RINGTONE], { windowsHide: true, env: { ...process.env, NEUROPORT_GAME: GAME_DIR } });
    p.stdout.on('data', (d) => process.stdout.write('  [toque] ' + d));
    p.stderr.on('data', (d) => process.stdout.write('  [toque] ' + d));
    p.on('error', () => res(false));
    p.on('exit', (c) => res(c === 0));
  });
  run('python').then((ok) => ok || run('py')).then((ok) => {
    if (!ok) console.log('  [toque] não deu para extrair o toque do jogo (precisa do Python). O app usa um toque reserva.');
  });
}
ensureRingtone();
if (!MOCK) ensureAtlasIndex();

// Reinicia o servidor: fecha a porta, sobe um processo novo no mesmo console e encerra este.
function restartServer() {
  console.log('');
  console.log('  [painel] reiniciando o servidor...');
  const args = process.argv.slice(1).filter((a) => a !== '--gui');   // a janela do painel já está aberta
  server.close(() => {
    const child = spawn(process.execPath, args, { cwd: process.cwd(), stdio: 'inherit', env: { ...process.env, NEUROPORT_RESTARTED: '1' } });
    // o filho herda o console; este processo fica só de "casca" (o .bat continua aberto) e sai junto com ele
    child.on('exit', (code) => process.exit(code || 0));
  });
  try { server.closeAllConnections(); } catch { /* node antigo */ }
}
// depois de um reinício a porta pode demorar um instante para liberar
let listenTries = 0;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && process.env.NEUROPORT_RESTARTED && listenTries++ < 20) {
    setTimeout(() => server.listen(PORT, '0.0.0.0'), 300);
    return;
  }
  if (e.code === 'EADDRINUSE') {
    console.log('');
    console.log(`  !! Port ${PORT} is already in use: Neuroport is probably already running (check the other window).`);
    console.log(`  !! A porta ${PORT} já está em uso: o Neuroport provavelmente já está aberto em outra janela.`);
    console.log('');
    process.exit(1);
  }
  throw e;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║            N E U R O P O R T             ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  if (MOCK) {
    console.log('  Modo SIMULAÇÃO (--mock): nenhum jogo necessário.');
  } else {
    console.log('  Pasta do mod: ' + BRIDGE);
    if (MO2) {
      console.log('  Mod Organizer 2: ' + MO2);
      console.log('    (também lendo ' + path.join(MO2, 'overwrite', MOD_SUBPATH) + ')');
    }
    console.log('  Pasta do jogo: ' + GAME_DIR);
    if (!fs.existsSync(BRIDGE)) {
      console.log('  !! Pasta do mod não encontrada. Rode install.ps1 ou use --bridge <pasta>.');
    }
  }
  console.log('');
  console.log('  Abra no navegador do celular (mesma rede Wi-Fi):');
  for (const ip of lanAddresses()) console.log(`    http://${ip}:${PORT}/?k=${TOKEN}`);
  console.log('');
  console.log(`  Código de pareamento: ${fmtToken(TOKEN)}`);
  console.log(`  Painel do servidor: http://localhost:${PORT}/admin`);
  console.log('  (Ctrl+C para encerrar)');
  console.log('');
  if (flag('--gui')) openGui();
});

// Abre o painel numa janela própria do Edge (modo app); sem Edge, no navegador padrão.
function openGui() {
  const url = `http://localhost:${PORT}/admin`;
  const edge = spawn('cmd', ['/c', 'start', '', 'msedge', `--app=${url}`, '--window-size=1100,760'], { detached: true, stdio: 'ignore', windowsHide: true });
  edge.on('exit', (c) => { if (c) spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref(); });
  edge.unref();
}

if (MOCK) {
  gameState = mock.state();
  setInterval(() => { mock.tick(0.4); gameState = mock.state(); broadcast(); }, 400);
} else {
  try { fs.mkdirSync(BRIDGE, { recursive: true }); } catch { /* sem permissão: avisado acima */ }
  for (const d of BRIDGES) { try { if (fs.existsSync(d)) fs.writeFileSync(path.join(d, 'inbox.txt'), ''); } catch { /* ok */ } }
  pickBridge();
  setInterval(pollState, 250);
}
