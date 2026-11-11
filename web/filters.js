// Filtros do mapa: mesmos grupos e categorias do mapa interativo da comunidade
// (cyberpunk2077-map.com), mais alguns tipos que só existem no jogo 2.x.
// Cada filtro lista os tipos de marcador do jogo (gamedataMappinVariant, sem o
// sufixo "Variant" e sem o prefixo "Zzz##_") que caem nele.
'use strict';

const FILTER_GROUPS = [
  {
    id: 'quest', color: '#f7e05a', shape: 'diamond', label: { en: 'ACTIVE JOBS', pt: 'MISSÕES ATIVAS' },
    filters: [
      { id: 'quest_obj', v: ['DefaultQuest'], extra: true, label: { en: 'Job Objective', pt: 'Objetivo de missão' } },
      { id: 'quest_other', v: ['DynamicEvent', 'Conversation', 'PhoneCall'], extra: true, color: '#ffd27a', label: { en: 'Job Point', pt: 'Ponto de missão' } },
    ],
  },
  {
    id: 'job', color: '#f7e05a', shape: 'diamond', label: { en: 'JOB', pt: 'TRABALHOS' },
    filters: [
      { id: 'gun_for_hire', v: ['BountyHunt'], quick: 'gig', label: { en: 'Gun for Hire', pt: 'Pistoleiro de aluguel' } },
      { id: 'search_recover', v: ['Retrieving'], quick: 'gig', label: { en: 'Search and Recover', pt: 'Busca e resgate' } },
      { id: 'thievery', v: ['Thievery'], quick: 'gig', label: { en: 'Thievery', pt: 'Roubo' } },
      { id: 'saboteur', v: ['Sabotage'], quick: 'gig', label: { en: 'Agent Saboteur', pt: 'Agente sabotador' } },
      { id: 'sos', v: ['ClientInDistress', 'SOSsignal'], quick: 'gig', label: { en: 'SOS: Merc Needed', pt: 'SOS: precisa-se de mercenário' } },
      { id: 'delivery', v: ['Courier'], quick: 'gig', extra: true, label: { en: 'Special Delivery', pt: 'Entrega especial' } },
      { id: 'capitan', v: ['CourierSandboxActivity'], quick: 'gig', label: { en: 'Vehicle contract (El Capitan)', pt: 'Contrato de veículo (El Capitan)' } },
      { id: 'convoy', v: ['Convoy'], quick: 'gig', label: { en: 'Convoy', pt: 'Comboio' } },
      { id: 'side_job', v: ['QuestGiver', 'ExclamationMark'], quick: 'side', color: '#ffb347', label: { en: 'Side Job', pt: 'Missão secundária' } },
    ],
  },
  {
    id: 'open', color: '#4f8bff', shape: 'diamond', label: { en: 'OPEN WORLD', pt: 'MUNDO ABERTO' },
    filters: [
      { id: 'ncpd_hustles', v: ['NCPDGig'], quick: 'ncpd', label: { en: 'NCPD Scanner Hustles', pt: 'Ocorrências do scanner da NCPD' } },
      { id: 'assault', v: ['GangWatch'], quick: 'ncpd', label: { en: 'Assault in Progress', pt: 'Agressão em andamento' } },
      { id: 'organized_crime', v: ['Outpost'], quick: 'ncpd', label: { en: 'Organized Crime Activity', pt: 'Atividade do crime organizado' } },
      { id: 'reported_crime', v: ['HiddenStash'], quick: 'ncpd', label: { en: 'Reported Crime', pt: 'Crime denunciado' } },
      { id: 'cyberpsycho', v: ['HuntForPsycho'], quick: 'ncpd', color: '#ff4d6d', label: { en: 'Cyberpsycho Sighting', pt: 'Avistamento de ciberpsicopata' } },
      { id: 'undiscovered', v: ['QuestionMark'], quick: 'ncpd', extra: true, label: { en: 'Undiscovered Activity', pt: 'Atividade não descoberta' } },
      { id: 'tarot', v: ['Tarot'], quick: 'tarot', color: '#c77dff', label: { en: 'Tarot Card', pt: 'Carta de tarô' } },
      { id: 'racing', v: ['Racing'], extra: true, label: { en: 'Street Race', pt: 'Corrida de rua' } },
      { id: 'encounter', v: ['WorldEncounter', 'RoadBlockade'], extra: true, label: { en: 'World Encounter', pt: 'Encontro no mundo' } },
      { id: 'relic', v: ['RelicDeviceBasic', 'RelicDeviceSpecial'], extra: true, label: { en: 'Relic Point', pt: 'Ponto Relic' } },
    ],
  },
  {
    id: 'service', color: '#2bfdb1', shape: 'square', label: { en: 'SERVICE POINT', pt: 'PONTOS DE SERVIÇO' },
    filters: [
      { id: 'drop_point', v: ['ServicePointDropPoint'], color: '#d8dde6', label: { en: 'Drop Point', pt: 'Ponto de entrega' } },
      { id: 'clothing', v: ['ServicePointClothes'], label: { en: 'Clothing', pt: 'Roupas' } },
      { id: 'ripperdoc', v: ['ServicePointRipperdoc', 'ServicePointCyberware'], label: { en: 'Ripperdoc', pt: 'Ripperdoc' } },
      { id: 'netrunner', v: ['ServicePointNetTrainer'], label: { en: 'Netrunner', pt: 'Netrunner' } },
      { id: 'weapon_shop', v: ['ServicePointGuns'], label: { en: 'Weapon Shop', pt: 'Loja de armas' } },
      { id: 'melee', v: ['ServicePointMeleeTrainer'], label: { en: 'Melee Weapon Vendor', pt: 'Armas brancas' } },
      { id: 'medpoint', v: ['ServicePointMeds'], label: { en: 'Medpoint', pt: 'Medpoint' } },
      { id: 'food', v: ['ServicePointFood'], label: { en: 'Food', pt: 'Comida' } },
      { id: 'bar', v: ['ServicePointBar'], label: { en: 'Bar', pt: 'Bar' } },
      { id: 'joytoy', v: ['ServicePointProstitute'], label: { en: 'Joytoy', pt: 'Joytoy' } },
      { id: 'junk', v: ['ServicePointJunk'], label: { en: 'Junk Shop', pt: 'Ferro-velho' } },
      { id: 'tech', v: ['ServicePointTech'], extra: true, label: { en: 'Tech Vendor', pt: 'Vendedor de tecnologia' } },
      { id: 'black_market', v: ['ServicePointBlackMarket'], extra: true, label: { en: 'Black Market', pt: 'Mercado negro' } },
      { id: 'glamdoc', v: ['ServicePointGlamdoc'], extra: true, label: { en: 'Glamdoc', pt: 'Glamdoc' } },
      { id: 'merchant', v: ['WanderingMerchant'], extra: true, label: { en: 'Wandering Merchant', pt: 'Vendedor ambulante' } },
    ],
  },
  {
    id: 'vehicle', color: '#ff8a5c', shape: 'circle', label: { en: 'VEHICLE', pt: 'VEÍCULOS' },
    filters: [
      { id: 'vehicle_sale', v: ['CarForPurchase', 'MotorcycleForPurchase'], label: { en: 'Vehicle for Sale', pt: 'Veículo à venda' } },
    ],
  },
  {
    id: 'other', color: '#c9d1e0', shape: 'circle', label: { en: 'OTHER', pt: 'OUTROS' },
    filters: [
      { id: 'fast_travel', v: ['FastTravel'], color: '#3f8cff', label: { en: 'Fast Travel', pt: 'Viagem rápida' } },
      { id: 'ncart', v: ['NCART'], color: '#9a6bff', extra: true, label: { en: 'NCART Station', pt: 'Estação NCART' } },
      { id: 'taxi', v: ['DelamainTaxi'], extra: true, label: { en: 'Delamain Cab', pt: 'Táxi Delamain' } },
      { id: 'apartment', v: ['Apartment', 'ApartmentToPurchase'], extra: true, label: { en: 'Apartment', pt: 'Apartamento' } },
      { id: 'stash', v: ['PlayerStash', 'Wardrobe'], extra: true, label: { en: 'Stash / Wardrobe', pt: 'Esconderijo / guarda-roupa' } },
    ],
  },
];

// Categorias do site que não são marcadores do jogo (não dá para ler pelo mod)
const FILTERS_UNAVAILABLE = {
  en: ['Landmark', 'Legendary / Iconic items'],
  pt: ['Pontos de referência', 'Itens lendários / icônicos'],
};

// Filtro dinâmico (como o mapa do jogo): tier 0 aparece em qualquer zoom (missões, gigs);
// tier 1 com zoom médio (viagem rápida, metrô, NCPD); tier 2 só bem perto (lojas e serviços).
const TIER_GROUP = { quest: 0, job: 0, open: 1, service: 2, vehicle: 2, other: 2 };
const TIER_FILTER = { fast_travel: 1, ncart: 1, cyberpsycho: 0, ncpd_hustles: 1, drop_point: 1, apartment: 1 };
// modos do filtro: dinâmico (tudo, por zoom), trabalhos, serviços, ou a lista personalizada
const FILTER_MODES = ['dynamic', 'jobs', 'services', 'custom'];
const MODE_GROUPS = { jobs: ['quest', 'job', 'open'], services: ['service', 'vehicle', 'other'] };
const MODE_STORE = 'neuroport.filters.mode';
let filterMode = 'dynamic';
try { const m = localStorage.getItem(MODE_STORE); if (FILTER_MODES.includes(m)) filterMode = m; } catch { /* ok */ }
function setFilterMode(m) {
  filterMode = m;
  try { localStorage.setItem(MODE_STORE, m); } catch { /* ok */ }
}
// o marcador entra no mapa no modo atual? (o zoom do modo dinâmico é aplicado pelo mapa)
function filterShows(p) {
  const f = FILTER_BY_ID[p.f];
  if (!f) return false;
  if (filterMode === 'custom') return filterOn(p.f);
  if (filterMode === 'dynamic') return true;
  if (filterMode === 'jobs' && f.id === 'tarot') return false;
  return MODE_GROUPS[filterMode].includes(f.group.id);
}

const GIG_AVAILABLE = '#3ee0c8';
const FILTER_BY_ID = {};
const FILTER_BY_VARIANT = {};
for (const g of FILTER_GROUPS) {
  for (const f of g.filters) {
    f.group = g;
    f.color = f.color || g.color;
    f.shape = g.shape;
    f.tier = TIER_FILTER[f.id] ?? TIER_GROUP[g.id] ?? 1;
    FILTER_BY_ID[f.id] = f;
    for (const v of f.v) FILTER_BY_VARIANT[v] = f;
  }
}

// Acrescenta filtro, categoria do Quick Gig, cor e forma a cada marcador
function enrichPoi(p) {
  const f = FILTER_BY_VARIANT[p.v];
  if (!f) return null;
  const color = f.quick === 'gig' ? (p.q ? '#f7e05a' : GIG_AVAILABLE) : f.color;
  return { ...p, f: f.id, cat: f.quick || null, color, shape: f.shape, tier: f.tier };
}

// Filtros ligados (salvos no celular). Padrão: todos ligados.
const FILTER_STORE = 'neuroport.filters.off';
let filtersOff = new Set();
try { filtersOff = new Set(JSON.parse(localStorage.getItem(FILTER_STORE) || '[]')); } catch { /* sem storage */ }
function saveFilters() {
  try { localStorage.setItem(FILTER_STORE, JSON.stringify([...filtersOff])); } catch { /* ok */ }
}
const filterOn = (id) => !filtersOff.has(id);

// Ícones de marcador do próprio jogo (extraídos do atlas de mappins: web/mapicons/<Variante>.png).
// São glifos brancos; aqui viram glifo colorido sobre um disco escuro, como no mapa do jogo.
const MAP_ICON_IMG = new Map();      // variante -> Image (null se não existir)
const MAP_ICON_CANVAS = new Map();   // variante|cor|tamanho -> canvas pronto
function mapIconImage(v, onReady) {
  let img = MAP_ICON_IMG.get(v);
  if (img === undefined) {
    img = new Image();
    img.waiting = [];
    img.onload = () => { img.ok = true; for (const cb of img.waiting.splice(0)) cb(); };
    img.onerror = () => { MAP_ICON_IMG.set(v, null); };
    img.src = 'mapicons/' + v + '.png';
    MAP_ICON_IMG.set(v, img);
  }
  if (!img) return null;
  if (img.ok) return img;
  if (onReady) img.waiting.push(onReady);
  return null;
}
// como no mapa do jogo, estes aparecem só como glifo colorido (sem disco)
const GLYPH_ONLY = /^(FastTravel|NCART|ServicePointDropPoint|Apartment|ApartmentToPurchase)$/;
// desenha o marcador num contexto 2D: disco escuro + anel + glifo na cor do filtro
function drawMapIcon(g, img, color, cx, cy, size, selected, v) {
  const r = size / 2;
  g.save();
  if (v && GLYPH_ONLY.test(v)) {
    g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = size * 0.12;
    g.drawImage(tintedIcon(img, color), cx - r, cy - r, size, size);
    if (selected) { g.shadowColor = color; g.shadowBlur = size * 0.3; g.drawImage(tintedIcon(img, color), cx - r, cy - r, size, size); }
    g.restore();
    return;
  }
  g.shadowColor = color; g.shadowBlur = size * (selected ? 0.4 : 0.15);
  g.fillStyle = 'rgba(8,10,16,.88)';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = color; g.lineWidth = Math.max(1, size * (selected ? 0.1 : 0.06));
  g.stroke();
  g.drawImage(tintedIcon(img, color), cx - r * 0.74, cy - r * 0.74, r * 1.48, r * 1.48);
  g.restore();
}
function tintedIcon(img, color) {
  const k = img.src + color;
  let c = MAP_ICON_CANVAS.get(k);
  if (c) return c;
  c = document.createElement('canvas');
  const s = 128;
  c.width = c.height = s;
  const g = c.getContext('2d');
  const sc = Math.min(s / img.width, s / img.height);
  const w = img.width * sc, h = img.height * sc;
  g.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = color;
  g.fillRect(0, 0, s, s);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
  MAP_ICON_CANVAS.set(k, c);
  return c;
}
