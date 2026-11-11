// Textos da interface em inglês e português.
// O idioma segue o do jogo (state.game.lang: "pt-br", "en-us"...);
// antes de o jogo responder, usa o idioma do celular.
'use strict';

const I18N = {
  en: {
    pairTag: '// NEURAL LINK',
    pairText: 'Enter the pairing code shown in the server window on your PC.',
    connect: 'CONNECT',
    badCode: 'Invalid code',
    location: 'LOCATION',
    lvl: 'LVL',
    linkOn: 'LINK ACTIVE', linkIdle: 'NO GAME', linkWait: 'CONNECTING',
    tabContacts: 'CONTACTS', tabVehicles: 'VEHICLES', tabMap: 'MAP',
    contactsTitle: 'CONTACTS',
    noContacts: 'No contacts available.',
    callVehicle: 'CALL VEHICLE',
    cars: 'CARS', bikes: 'BIKES',
    elCap: 'CAPITAN', elCapFull: 'EL CAPITAN', capFind: 'SHOW ALL POSSIBLE LOCATIONS', capExit: 'EXIT',
    capFindNote: 'Contracts spawn at fixed spots (mostly in Dogtown) at random times. The map shows the ones marked now (cyan), every spot where one appeared in your game (purple) and the areas from player guides (orange).',
    capLive: '{n} contract(s) on the map now', capSpotsN: '{n} known spot(s)', capSpotsOnly: 'No contract now · {n} known spot(s)',
    capNoSpots: 'No contract now and none seen yet: look around Dogtown', capGuideSpot: 'GUIDE AREA · EL CAPITAN CONTRACT', capSpotSeen: 'POSSIBLE SPOT · SEEN {n}×', capLiveNow: 'EL CAPITAN · AVAILABLE NOW',
    capTitle: 'EL CAPITAN // VEHICLE CONTRACTS', capIntroDone: 'Push It to the Limit complete', capIntroTodo: 'Not started: finish Push It to the Limit (Dogtown, after Lucretia My Reflection)',
    capDone: 'CONTRACTS DONE', capFailed: 'FAILED', capActive: 'ACTIVE CONTRACT', capNone: 'none', capRewards: 'AUTOFIXER CARS UNLOCKED BY HIS CONTRACTS',
    capOwned: 'IN GARAGE', capAvail: 'AT AUTOFIXER', capLocked: 'LOCKED', capCount: '{a}/{b} in garage',
    capNote: 'Contract cars are random; finishing them unlocks these cars at the Autofixer.',
    vHp: 'HORSEPOWER', vMass: 'MASS', vDrive: 'DRIVETRAIN', vYear: 'YEAR', vTop: 'TOP SPEED', vAccel: 'ACCELERATION', vSeats: 'SEATS', vWeapons: 'WEAPONS',
    vMg: 'Machine guns', vRl: 'Missiles', vPrice: 'PRICE', vMaker: 'MAKER', vType: 'TYPE', untrackShort: 'Stop tracking',
    car: 'Car', bike: 'Motorcycle',
    noVehicles: 'No vehicles in this category.',
    active: 'ACTIVE',
    available: 'Available', unavailable: 'Unavailable',
    contact: 'CONTACT', contactQuest: 'CONTACT · JOB',
    lastMsg: 'LAST MESSAGE',
    back: 'BACK', call: 'CALL',
    holocall: 'HOLOCALL',
    calling: 'CALLING…', incoming: 'INCOMING CALL', onCall: 'ON CALL',
    hangup: 'END CALL', callEnded: 'Call ended',
    vehicleOnWay: '// VEHICLE INBOUND',
    summonFallback: 'Active vehicle inbound (could not switch model)',
    noSignal: 'NO SIGNAL',
    offlineGame: 'The game is not responding. Launch Cyberpunk 2077 with the Neuroport mod installed.',
    offlineSave: 'Game connected. Load a save to use the phone.',
    noPc: 'No connection to the PC',
    system: 'SYSTEM', error: 'ERROR', vehicle: 'VEHICLE', gps: 'GPS',
    err_not_found: 'Not found', err_game_refused: 'The game refused the request',
    err_load_save: 'Load a save first', err_unknown_action: 'Unknown action',
    err_mod_error: 'Mod error (see the CET overlay)', err_bad_args: 'Invalid position',
    err_timeout: 'No response from the game',
    // Quick Gig
    cat_ncpd: 'NCPD', cat_gig: 'GIG', cat_tarot: 'TAROT', cat_side: 'SIDE JOB',
    catLong_quest: 'Job Objective', catLong_ncpd: 'NCPD Scanner', catLong_gig: 'Fixer Gig', catLong_tarot: 'Tarot Graffiti', catLong_side: 'Side Job',
    nearestAny: 'NEAREST OF ALL',
    markGps: 'MARK ON GPS',
    nearby: 'NEARBY',
    gpsActive: 'GPS ROUTE',
    clear: 'CLEAR',
    waypointSet: 'Route set on GPS', waypointCleared: 'GPS route cleared',
    noneFound: 'Nothing found',
    inRange: (n) => `${n} within 1.5 km`,
    noCodeware: 'Reading map markers requires the Codeware mod. Install it and restart the game.',
    poisWaiting: 'Scanning the map…',
    customPoint: 'Custom point',
    // Mapa
    mapHint: 'Tap a marker or any point to set GPS',
    north: 'NORTH', heading: 'HEADING',
    you: 'You',
    tabJournal: 'JOURNAL', journalTitle: 'JOURNAL',
    filters: 'FILTERS', all: 'ALL', none: 'NONE', done: 'DONE',
    distance: 'DISTANCE', height: 'HEIGHT', coords: 'COORDINATES',
    trackedJob: 'TRACKED JOB', objective: 'OBJECTIVE', trackedTag: 'TRACKED',
    track: 'TRACK JOB', untrack: 'UNTRACK',
    jg_main: 'MAIN JOBS', jg_side: 'SIDE JOBS', jg_gig: 'GIGS', jg_other: 'OTHER',
    noQuests: 'No active jobs.', journalWaiting: 'Reading the journal…',
    questTracked: 'Job tracked', questUntracked: 'Job untracked',
    err_no_objective: 'This job has no active objective right now',
    notAvailable: 'Not readable from the game:',
    extra: 'GAME',
    fmode_dynamic: 'DYNAMIC', fmode_jobs: 'JOBS', fmode_services: 'SERVICES', fmode_custom: 'CUSTOM',
    fmodeDesc_dynamic: 'Like the game: more detail as you zoom in',
    fmodeDesc_jobs: 'Only active jobs, gigs and activities',
    fmodeDesc_services: 'Shops, drop points, food, travel',
    fmodeDesc_custom: 'Pick each category yourself',
    ftier0: 'ALWAYS', ftier1: 'MID ZOOM', ftier2: 'CLOSE',
    noObjective: 'No active objective',
    tabRadio: 'RADIO', radioTitle: 'RADIO', radioOff: 'RADIO OFF', pocketRadio: 'POCKET RADIO', carRadio: 'CAR RADIO',
    stations: 'STATIONS', nowPlaying: 'NOW PLAYING',
    carModeWidget: 'CAR MODE', carModeIn: 'Open navigation', carModeOut: 'Open (on foot)',
    carMode: 'CAR', exitCar: 'PHONE', carNav: 'NAV', carCar: 'CAR',
    adStart: 'AUTODRIVE', adStop: 'STOP AUTODRIVE', adQuest: 'DRIVE TO ACTIVE JOB', noTracked: 'No tracked job', questRoute: 'Autodrive to the active job', quickDest: 'QUICK DESTINATIONS',
    noDest: 'No destination. Pick one below or tap the map.', eta: 'ETA',
    paint: 'PAINT', primary: 'PRIMARY', secondary: 'SECONDARY', lights: 'LIGHTS',
    apply: 'APPLY', restore: 'RESTORE', horn: 'HORN',
    crystalNote: 'Only for vehicles with CrystalCoat',
    colorSet: 'Paint applied', colorReset: 'Paint restored',
    err_no_destination: 'Set a destination first', err_no_autodrive: 'Autodrive unavailable',
    err_not_in_vehicle: 'You are not in a vehicle',
    err_summon_cooldown: 'Vehicle on cooldown, try again shortly', err_summon_blocked: 'The game blocked the call here',
    mapLoading: 'LOADING NIGHT CITY…', mapLost: 'The phone dropped the 3D map (video memory); recovering…', mapFailed: 'Could not load the 3D map (radar mode)',
    remaining: 'to destination',
    recenter: 'RECENTER',
    answer: 'ANSWER', reject: 'DECLINE', silence: 'SILENCE RINGTONE',
    missedCall: (n) => `Missed call from ${n}`, callRejected: 'Call declined',
    err_no_incoming: 'The call is no longer ringing',
  },
  pt: {
    pairTag: '// LINK NEURAL',
    pairText: 'Digite o código de pareamento que aparece na janela do servidor no PC.',
    connect: 'CONECTAR',
    badCode: 'Código inválido',
    location: 'LOCAL',
    lvl: 'NV',
    linkOn: 'LINK ATIVO', linkIdle: 'SEM JOGO', linkWait: 'CONECTANDO',
    tabContacts: 'CONTATOS', tabVehicles: 'VEÍCULOS', tabMap: 'MAPA',
    contactsTitle: 'CONTATOS',
    noContacts: 'Nenhum contato disponível.',
    callVehicle: 'CHAMAR VEÍCULO',
    cars: 'CARROS', bikes: 'MOTOS',
    elCap: 'CAPITAN', elCapFull: 'EL CAPITAN', capFind: 'MOSTRAR TODOS OS LOCAIS POSSÍVEIS', capExit: 'SAIR',
    capFindNote: 'Os contratos aparecem em pontos fixos (a maioria em Dogtown), em horários aleatórios. O mapa mostra os marcados agora (ciano), os pontos onde algum já apareceu no seu jogo (roxo) e as áreas dos guias de jogadores (laranja).',
    capLive: '{n} contrato(s) no mapa agora', capSpotsN: '{n} ponto(s) conhecido(s)', capSpotsOnly: 'Nenhum contrato agora · {n} ponto(s) conhecido(s)',
    capNoSpots: 'Nenhum contrato agora e nenhum visto ainda: procure por Dogtown', capGuideSpot: 'ÁREA DO GUIA · CONTRATO DO EL CAPITAN', capSpotSeen: 'POSSÍVEL LOCAL · VISTO {n}×', capLiveNow: 'EL CAPITAN · DISPONÍVEL AGORA',
    capTitle: 'EL CAPITAN // CONTRATOS DE VEÍCULOS', capIntroDone: 'Push It to the Limit concluída', capIntroTodo: 'Não começou: conclua Push It to the Limit (Dogtown, depois de Lucretia My Reflection)',
    capDone: 'CONTRATOS FEITOS', capFailed: 'FALHOS', capActive: 'CONTRATO ATIVO', capNone: 'nenhum', capRewards: 'CARROS DO AUTOFIXER LIBERADOS PELOS CONTRATOS',
    capOwned: 'NA GARAGEM', capAvail: 'NO AUTOFIXER', capLocked: 'BLOQUEADO', capCount: '{a}/{b} na garagem',
    capNote: 'Os carros dos contratos são aleatórios; concluir contratos libera estes carros no Autofixer.',
    vHp: 'POTÊNCIA', vMass: 'MASSA', vDrive: 'TRAÇÃO', vYear: 'ANO', vTop: 'VELOCIDADE MÁX.', vAccel: 'ACELERAÇÃO', vSeats: 'LUGARES', vWeapons: 'ARMAS',
    vMg: 'Metralhadoras', vRl: 'Mísseis', vPrice: 'PREÇO', vMaker: 'FABRICANTE', vType: 'TIPO', untrackShort: 'Parar de rastrear',
    car: 'Carro', bike: 'Moto',
    noVehicles: 'Nenhum veículo nesta categoria.',
    active: 'ATIVO',
    available: 'Disponível', unavailable: 'Indisponível',
    contact: 'CONTATO', contactQuest: 'CONTATO · MISSÃO',
    lastMsg: 'ÚLTIMA MENSAGEM',
    back: 'VOLTAR', call: 'LIGAR',
    holocall: 'CHAMADA HOLOGRÁFICA',
    calling: 'CHAMANDO…', incoming: 'CHAMADA RECEBIDA', onCall: 'EM LINHA',
    hangup: 'ENCERRAR', callEnded: 'Chamada encerrada',
    vehicleOnWay: '// VEÍCULO A CAMINHO',
    summonFallback: 'Veículo ativo a caminho (não deu para trocar o modelo)',
    noSignal: 'SEM SINAL',
    offlineGame: 'O jogo não está respondendo. Abra o Cyberpunk 2077 com o mod Neuroport instalado.',
    offlineSave: 'Jogo conectado. Carregue um save para usar o celular.',
    noPc: 'Sem conexão com o PC',
    system: 'SISTEMA', error: 'ERRO', vehicle: 'VEÍCULO', gps: 'GPS',
    err_not_found: 'Não encontrado', err_game_refused: 'O jogo recusou o pedido',
    err_load_save: 'Carregue um save primeiro', err_unknown_action: 'Ação desconhecida',
    err_mod_error: 'Erro no mod (veja o overlay do CET)', err_bad_args: 'Posição inválida',
    err_timeout: 'Sem resposta do jogo',
    cat_ncpd: 'NCPD', cat_gig: 'GIG', cat_tarot: 'TARÔ', cat_side: 'MISSÃO SECUNDÁRIA',
    catLong_quest: 'Objetivo da missão', catLong_ncpd: 'Ocorrência NCPD', catLong_gig: 'Gig de fixer', catLong_tarot: 'Grafite de tarô', catLong_side: 'Missão secundária',
    nearestAny: 'MAIS PRÓXIMO DE TODOS',
    markGps: 'MARCAR NO GPS',
    nearby: 'PRÓXIMOS',
    gpsActive: 'ROTA NO GPS',
    clear: 'LIMPAR',
    waypointSet: 'Rota marcada no GPS', waypointCleared: 'Rota do GPS removida',
    noneFound: 'Nada encontrado',
    inRange: (n) => `${n} a menos de 1,5 km`,
    noCodeware: 'Ler os marcadores do mapa exige o mod Codeware. Instale e reinicie o jogo.',
    poisWaiting: 'Varrendo o mapa…',
    customPoint: 'Ponto personalizado',
    mapHint: 'Toque num marcador ou ponto para marcar o GPS',
    north: 'NORTE', heading: 'BÚSSOLA',
    you: 'Você',
    tabJournal: 'DIÁRIO', journalTitle: 'DIÁRIO',
    filters: 'FILTROS', all: 'TODOS', none: 'NENHUM', done: 'PRONTO',
    distance: 'DISTÂNCIA', height: 'ALTURA', coords: 'COORDENADAS',
    trackedJob: 'MISSÃO RASTREADA', objective: 'OBJETIVO', trackedTag: 'RASTREADA',
    track: 'RASTREAR', untrack: 'PARAR DE RASTREAR',
    jg_main: 'MISSÕES PRINCIPAIS', jg_side: 'MISSÕES SECUNDÁRIAS', jg_gig: 'GIGS', jg_other: 'OUTROS',
    noQuests: 'Nenhuma missão ativa.', journalWaiting: 'Lendo o diário…',
    questTracked: 'Missão rastreada', questUntracked: 'Missão não rastreada',
    err_no_objective: 'Esta missão não tem objetivo ativo agora',
    notAvailable: 'Não dá para ler do jogo:',
    extra: 'JOGO',
    fmode_dynamic: 'DINÂMICO', fmode_jobs: 'TRABALHOS', fmode_services: 'SERVIÇOS', fmode_custom: 'PERSONALIZADO',
    fmodeDesc_dynamic: 'Como no jogo: mais detalhes ao aproximar',
    fmodeDesc_jobs: 'Só missões, gigs e atividades ativas',
    fmodeDesc_services: 'Lojas, drop points, comida, transporte',
    fmodeDesc_custom: 'Escolha cada categoria',
    ftier0: 'SEMPRE', ftier1: 'ZOOM MÉDIO', ftier2: 'DE PERTO',
    noObjective: 'Sem objetivo ativo',
    tabRadio: 'RÁDIO', radioTitle: 'RÁDIO', radioOff: 'RÁDIO DESLIGADO', pocketRadio: 'RÁDIO DE BOLSO', carRadio: 'RÁDIO DO CARRO',
    stations: 'ESTAÇÕES', nowPlaying: 'TOCANDO AGORA',
    carModeWidget: 'MODO CARRO', carModeIn: 'Abrir navegação', carModeOut: 'Abrir (a pé)',
    carMode: 'CARRO', exitCar: 'CELULAR', carNav: 'NAV', carCar: 'CARRO',
    adStart: 'PILOTO AUTOMÁTICO', adStop: 'PARAR PILOTO', adQuest: 'NAVEGAR ATÉ A MISSÃO ATIVA', noTracked: 'Nenhuma missão rastreada', questRoute: 'Piloto automático até a missão ativa', quickDest: 'DESTINOS RÁPIDOS',
    noDest: 'Sem destino. Escolha abaixo ou toque no mapa.', eta: 'CHEGADA',
    paint: 'PINTURA', primary: 'PRIMÁRIA', secondary: 'SECUNDÁRIA', lights: 'LUZES',
    apply: 'APLICAR', restore: 'RESTAURAR', horn: 'BUZINA',
    crystalNote: 'Só em veículos com CrystalCoat',
    colorSet: 'Pintura aplicada', colorReset: 'Pintura restaurada',
    err_no_destination: 'Defina um destino primeiro', err_no_autodrive: 'Piloto automático indisponível',
    err_not_in_vehicle: 'Você não está num veículo',
    err_summon_cooldown: 'Veículo em recarga, tente daqui a pouco', err_summon_blocked: 'O jogo bloqueou a chamada aqui',
    mapLoading: 'CARREGANDO NIGHT CITY…', mapLost: 'O celular derrubou o mapa 3D (memória de vídeo); recuperando…', mapFailed: 'Não deu para carregar o mapa 3D (modo radar)',
    remaining: 'até o destino',
    recenter: 'CENTRALIZAR',
    answer: 'ATENDER', reject: 'RECUSAR', silence: 'SILENCIAR TOQUE',
    missedCall: (n) => `Chamada perdida de ${n}`, callRejected: 'Chamada recusada',
    err_no_incoming: 'A chamada já não está tocando',
  },
};

let LANG = /^pt/i.test(navigator.language || '') ? 'pt' : 'en';

function langFromGame(code) {
  if (!code) return null;
  return /^pt/i.test(code) ? 'pt' : 'en';
}

function t(key, ...args) {
  const v = (I18N[LANG] && I18N[LANG][key]) ?? I18N.en[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

function applyI18n() {
  document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
}

function setLang(l) {
  if (!l || l === LANG) return false;
  LANG = l;
  applyI18n();
  return true;
}

function fmtDist(m) {
  if (m == null || !isFinite(m)) return '—';
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  const km = (m / 1000).toFixed(1);
  return `${LANG === 'pt' ? km.replace('.', ',') : km} km`;
}

function fmtHeight(dz) {
  if (dz == null || !isFinite(dz)) return '—';
  const r = Math.round(dz);
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r)} m`;
}

function fmtMoney(n) {
  return Number(n).toLocaleString(LANG === 'pt' ? 'pt-BR' : 'en-US');
}

applyI18n();
