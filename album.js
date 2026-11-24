/* =====================================================================
   Minigames — Álbum de hipopótamos e baús da sorte
   Fotos saem de baús (3 sorteios por baú, podem repetir). Baús: loja (Enzola Coins) ou atividades.
   Para adicionar fotos: coloque o arquivo em album/ e acrescente uma linha em ALBUM.
   ===================================================================== */
const ALBUM_FACTS = {
  h01: "Hipopótamos passam até 16 horas por dia na água, que protege a pele do sol e do calor.",
  h02: "À noite eles saem da água para pastar e podem andar vários quilômetros atrás de capim.",
  h03: "Um macho adulto pesa em média de 1.500 a 1.800 kg, mais que um carro pequeno.",
  h04: "A boca abre até cerca de 150°, e os caninos de baixo podem passar de 50 cm.",
  h05: "Os parentes vivos mais próximos dos hipopótamos são as baleias e os golfinhos, não os cavalos nem os porcos.",
  h06: "Um filhote nasce com 25 a 50 kg, geralmente dentro d'água.",
  h07: "Machos marcam território espalhando fezes com o rabo, como se fosse um ventilador.",
  h08: "Bocejar nem sempre é sono: também é uma forma de mostrar os dentes e a força.",
  h09: "A pele solta um líquido avermelhado que funciona como protetor solar e ajuda contra bactérias. Não é suor nem sangue.",
  h10: "Olhos, orelhas e narinas ficam no alto da cabeça, então ele respira e vigia quase todo submerso.",
  h11: "Um filhote desmama por volta de 1 ano, mas pode ficar perto da mãe por vários anos.",
  h12: "Hipopótamos não nadam de verdade: eles caminham e quicam no fundo dos rios.",
  h13: "Filhotes mamam debaixo d'água, fechando narinas e orelhas.",
  h14: "Um hipopótamo segura a respiração por cerca de 5 minutos.",
  h15: "Eles se comunicam com roncos e grunhidos que viajam pela água e pelo ar ao mesmo tempo.",
  h16: "Os dentes da frente servem de arma e exibição. Quem corta o capim são os lábios largos e musculosos.",
  h17: "Dormindo na água, o hipopótamo sobe para respirar por reflexo, sem nem acordar.",
  h18: "O hipopótamo é um dos mamíferos mais perigosos para humanos na África.",
  h19: "Peixes pequenos limpam a pele dos hipopótamos, comendo algas e parasitas.",
  h20: "Debaixo d'água, hipopótamos andam no fundo em câmera lenta, quase como se planassem.",
  h21: "Em terra, correm a cerca de 30 km/h em trechos curtos.",
  h22: "Vivem em grupos de cerca de 10 a 30 indivíduos, chamados de bandos.",
  h23: "Uma membrana transparente cobre os olhos quando mergulham, como um óculos de natação natural.",
  h24: "Cada grupo costuma ter um macho dominante que defende a área do bando.",
  h25: "Um hipopótamo come cerca de 35 a 40 kg de capim por noite.",
  h26: "A pele pode ter até 5 cm de espessura em algumas partes do corpo.",
  h27: "As narinas se fecham sozinhas quando ele mergulha.",
  h28: "A língua é grande e rosada, e aparece bem nos bocejos.",
  h29: "Os lábios podem chegar a cerca de 50 cm de largura, e cortam o capim como um cortador de grama.",
  h30: "Os caninos nunca param de crescer durante a vida do hipopótamo.",
  h31: "Fora da água por muito tempo, a pele resseca e racha. Por isso ele vive molhado.",
  h32: "Hipopótamos comem em terra firme, nunca dentro d'água.",
  h33: "Eles passam boa parte do dia descansando na água rasa ou na margem.",
  h34: "Brigas entre machos podem deixar cicatrizes enormes na pele.",
  h35: "Na África, o hipopótamo-comum vive em rios e lagos ao sul do Saara.",
  h36: "Na natureza, vivem entre 40 e 50 anos. Em zoológicos alguns passaram dos 50.",
  h37: "Mesmo parecendo lentos, atacam rápido quando se sentem ameaçados.",
  h38: "Entre machos, mostrar os dentes funciona como aviso: \"olha o tamanho do que eu tenho\".",
  h39: "Plantas aquáticas como o aguapé crescem em rios e lagoas onde os hipopótamos vivem.",
  h40: "A cor da pele varia de cinza a rosado, e fica avermelhada pelo líquido que ela produz.",
  h41: "O nome vem do grego e quer dizer \"cavalo do rio\".",
  h42: "Parados, parecem pedras: só o topo da cabeça aparece na superfície.",
  h43: "Eles repetem as mesmas trilhas todas as noites, e as trilhas viram caminhos no capim.",
  h44: "Hipopótamos andam em fila pelas trilhas até as áreas de pasto.",
  h45: "Filhotes descansam em cima das costas da mãe quando estão na água.",
  h46: "A mãe é muito protetora e enfrenta quem chega perto do filhote.",
  h47: "A gestação dura cerca de 8 meses e a fêmea tem um filhote por vez.",
  h48: "Os dentes de um hipopótamo são feitos de marfim, e já foram muito procurados por caçadores.",
  h49: "Os hipopótamos-comuns são considerados vulneráveis à extinção, por causa da caça e da perda de habitat.",
  h50: "Dormir encostado em outro hipopótamo é comum, o grupo todo costuma descansar junto.",
  h51: "Em zoológicos, hipopótamos às vezes ganham melancia como petisco.",
  h52: "Filhotes aprendem cedo a prender o ar e a abrir os olhos debaixo d'água.",
  h53: "O líquido avermelhado da pele é chamado de \"suor de sangue\", mas não é sangue nem suor.",
  h54: "A água ajuda o grupo a se refrescar, por isso é comum ver vários juntos em banhos coletivos.",
  h55: "No fim da tarde, eles seguem das lagoas para os pastos por trilhas de terra.",
  h56: "Encostar a boca pode ser um cumprimento ou o começo de uma disputa.",
  h57: "Machos adultos podem ter território fixo na água e dividem o espaço com várias fêmeas.",
  h58: "De perfil, a linha da boca vai quase até os olhos.",
  h59: "Existe o hipopótamo-pigmeu, que pesa menos de 300 kg e vive em florestas da África Ocidental.",
  h60: "O hipopótamo-pigmeu é ameaçado de extinção e é bem mais difícil de ver que o comum.",
  h61: "A cabeça é enorme, e ele gosta de apoiá-la na margem ou na água para descansar.",
  h62: "Os olhos e as orelhas no topo da cabeça permitem ficar atento ao ambiente quase todo submerso.",
  h63: "Mesmo fora da água, o hipopótamo precisa voltar a ela antes do amanhecer para a pele não ressecar.",
  h64: "Depois de uma noite de pasto, voltam para a água e descansam até a noite seguinte.",
  h65: "O hipopótamo está entre os maiores mamíferos terrestres, atrás de elefantes e rinocerontes-brancos.",
};
const albFact = id => ALBUM_FACTS[id] || "";
const ALBUM = [
  { id: "h01", name: "Mergulhador Rosado", img: "album/h01.webp", ar: 1.507, rar: 1 },
  { id: "h02", name: "Pôr do Sol na Savana", img: "album/h02.webp", ar: 1.53, rar: 1 },
  { id: "h03", name: "Chegou o Chefe", img: "album/h03.webp", ar: 1.272, rar: 1 },
  { id: "h04", name: "Bocejo na Savana", img: "album/h04.webp", ar: 1.504, rar: 1 },
  { id: "h05", name: "Rio de Chocolate", img: "album/h05.webp", ar: 1.682, rar: 1 },
  { id: "h06", name: "Bebê Nadador", img: "album/h06.webp", ar: 0.75, rar: 1 },
  { id: "h07", name: "Rei do Aguapé", img: "album/h07.webp", ar: 1.778, rar: 1 },
  { id: "h08", name: "Bocejo ao Amanhecer", img: "album/h08.webp", ar: 0.8, rar: 1 },
  { id: "h09", name: "Banho de Esguicho", img: "album/h09.webp", ar: 1.779, rar: 1 },
  { id: "h10", name: "Radar de Narinas", img: "album/h10.webp", ar: 2.0, rar: 1 },
  { id: "h11", name: "Mamãe e Filhote", img: "album/h11.webp", ar: 1.599, rar: 1 },
  { id: "h12", name: "Cheguei Molhando", img: "album/h12.webp", ar: 1.779, rar: 1 },
  { id: "h13", name: "Filhote Sentadinho", img: "album/h13.webp", ar: 1.0, rar: 1 },
  { id: "h14", name: "Sorriso do Lago", img: "album/h14.webp", ar: 1.0, rar: 1 },
  { id: "h15", name: "Sorrisão", img: "album/h15.webp", ar: 1.0, rar: 1 },
  { id: "h16", name: "Bocão Gigante", img: "album/h16.webp", ar: 1.0, rar: 1 },
  { id: "h17", name: "Soneca na Lama", img: "album/h17.webp", ar: 1.493, rar: 1 },
  { id: "h18", name: "Olhar de Respeito", img: "album/h18.webp", ar: 0.8, rar: 1 },
  { id: "h19", name: "Amigo dos Peixes", img: "album/h19.webp", ar: 1.593, rar: 1 },
  { id: "h20", name: "Periscópio", img: "album/h20.webp", ar: 0.724, rar: 1 },
  { id: "h21", name: "Dia de Folga na Areia", img: "album/h21.webp", ar: 1.503, rar: 1 },
  { id: "h22", name: "Trio na Lagoa", img: "album/h22.webp", ar: 1.5, rar: 1 },
  { id: "h23", name: "Olhos nos Olhos", img: "album/h23.webp", ar: 1.5, rar: 1 },
  { id: "h24", name: "Reunião da Família", img: "album/h24.webp", ar: 1.468, rar: 1 },
  { id: "h25", name: "Coroa de Aguapé", img: "album/h25.webp", ar: 1.333, rar: 1 },
  { id: "h26", name: "Rosto Redondinho", img: "album/h26.webp", ar: 1.475, rar: 1 },
  { id: "h27", name: "Focinho Gigante", img: "album/h27.webp", ar: 1.5, rar: 1 },
  { id: "h28", name: "Língua de Fora", img: "album/h28.webp", ar: 1.364, rar: 1 },
  { id: "h29", name: "Linguinha Fofa", img: "album/h29.webp", ar: 1.0, rar: 1 },
  { id: "h30", name: "Bocejo Dentuço", img: "album/h30.webp", ar: 1.501, rar: 1 },
  { id: "h31", name: "Banheirinha Azul", img: "album/h31.webp", ar: 1.333, rar: 1 },
  { id: "h32", name: "Hora do Lanche", img: "album/h32.webp", ar: 1.681, rar: 1 },
  { id: "h33", name: "Cochilo no Tanque", img: "album/h33.webp", ar: 0.997, rar: 1 },
  { id: "h34", name: "Briga de Bocões", img: "album/h34.webp", ar: 1.471, rar: 1 },
  { id: "h35", name: "Filhote de Estúdio", img: "album/h35.webp", ar: 1.236, rar: 1 },
  { id: "h36", name: "Banho de Sol", img: "album/h36.webp", ar: 1.5, rar: 1 },
  { id: "h37", name: "Hipopóts Apaixonados", img: "album/h37.webp", ar: 1.247, rar: 1 },
  { id: "h38", name: "Ataque Aquático", img: "album/h38.webp", ar: 1.483, rar: 1 },
  { id: "h39", name: "Bocejo na Lagoa", img: "album/h39.webp", ar: 1.5, rar: 1 },
  { id: "h40", name: "Coroa Verde", img: "album/h40.webp", ar: 1.501, rar: 1 },
  { id: "h41", name: "Língua de Fora Total", img: "album/h41.webp", ar: 1.5, rar: 1 },
  { id: "h42", name: "Olhar Submarino", img: "album/h42.webp", ar: 1.173, rar: 1 },
  { id: "h43", name: "Soneca na Pedra", img: "album/h43.webp", ar: 1.176, rar: 1 },
  { id: "h44", name: "Passeio no Gramado", img: "album/h44.webp", ar: 1.5, rar: 1 },
  { id: "h45", name: "Hora de Beber Água", img: "album/h45.webp", ar: 1.504, rar: 1 },
  { id: "h46", name: "Filhote Curioso", img: "album/h46.webp", ar: 1.501, rar: 1 },
  { id: "h47", name: "Mãe e Filhote Mergulhando", img: "album/h47.webp", ar: 1.0, rar: 1 },
  { id: "h48", name: "Colo de Mãe", img: "album/h48.webp", ar: 1.063, rar: 1 },
  { id: "h49", name: "Dupla na Água", img: "album/h49.webp", ar: 1.0, rar: 1 },
  { id: "h50", name: "Passeio no Zoológico", img: "album/h50.webp", ar: 1.5, rar: 1 },
  { id: "h51", name: "Sonequinha a Dois", img: "album/h51.webp", ar: 2.098, rar: 1 },
  { id: "h52", name: "Merenda de Melancia", img: "album/h52.webp", ar: 0.75, rar: 1 },
  { id: "h53", name: "Bebê de Braços Cruzados", img: "album/h53.webp", ar: 0.692, rar: 1 },
  { id: "h54", name: "Olhos de Fora", img: "album/h54.webp", ar: 1.461, rar: 1 },
  { id: "h55", name: "Banho Coletivo", img: "album/h55.webp", ar: 1.5, rar: 1 },
  { id: "h56", name: "Caminhada na Terra Vermelha", img: "album/h56.webp", ar: 1.779, rar: 1 },
  { id: "h57", name: "Beijo de Hipopótamos", img: "album/h57.webp", ar: 1.5, rar: 1 },
  { id: "h58", name: "Preguiça na Areia", img: "album/h58.webp", ar: 1.918, rar: 1 },
  { id: "h59", name: "Sorriso de Perfil", img: "album/h59.webp", ar: 1.5, rar: 1 },
  { id: "h60", name: "Filhote Pigmeu", img: "album/h60.webp", ar: 1.667, rar: 1 },
  { id: "h61", name: "Bocejo Verde", img: "album/h61.webp", ar: 1.5, rar: 1 },
  { id: "h62", name: "Focinho no Chão", img: "album/h62.webp", ar: 1.0, rar: 1 },
  { id: "h63", name: "Cabeça Pesada", img: "album/h63.webp", ar: 1.599, rar: 1 },
  { id: "h64", name: "Olhando pro Céu", img: "album/h64.webp", ar: 1.6, rar: 1 },
  { id: "h65", name: "Dupla Cansada", img: "album/h65.webp", ar: 1.5, rar: 1 },
  // próximas fotos: { id: "h66", name: "Nome", img: "album/h66.webp", ar: 1.5, rar: 1 },   // rar: 1 comum · 0.4 rara · 0.15 lendária
];
const CH_ORDER = ["comum", "raro", "epico", "lendario"], FREE_PER_DAY = 2;
const CH_R = {
  comum:    { name: "Baú comum",    price: 75,   draws: 3, odds: [40, 50, 10], coins: [[5, 40], [10, 30], [20, 18], [35, 8], [60, 3], [100, 1]],        skinExp: .5,  w: ["#c98a4b", "#9a5e2c", "#6e3d1a"], m: ["#8a93a6", "#e3e8f2", "#7c869b"], band: ["#fff0a0", "#ffc936", "#c9850a"], col: "#b8794a" },
  raro:     { name: "Baú raro",     price: 190,  draws: 3, odds: [34, 46, 20], coins: [[10, 28], [20, 30], [35, 22], [60, 12], [100, 6], [200, 2]],    skinExp: .25, w: ["#6f9bf0", "#4468c4", "#2a4590"], m: ["#9fb0d4", "#eef3ff", "#8393b8"], band: ["#fff0a0", "#ffc936", "#c9850a"], col: "#5d86e6" },
  epico:    { name: "Baú épico",    price: 500,  draws: 4, odds: [30, 40, 30], coins: [[35, 26], [60, 30], [100, 26], [200, 14], [300, 4]],            skinExp: 0,   w: ["#b97ae8", "#8546c0", "#53288a"], m: ["#c9b4e8", "#f6eeff", "#a58cc9"], band: ["#ffe9a0", "#ffb938", "#b8730a"], col: "#a561dd" },
  lendario: { name: "Baú lendário", price: 1250, draws: 5, odds: [26, 32, 42], coins: [[100, 30], [200, 34], [300, 24], [500, 12]],                    skinExp: -.4, w: ["#ffd04a", "#e8920f", "#a35a00"], m: ["#fff6c0", "#ffe27a", "#d9a21a"], band: ["#ff8aa0", "#ff3d66", "#b3123a"], col: "#ffb000", guaranteeSkin: true },
};
const chR = r => CH_R[r] || CH_R.comum;
let mgTab = "game";
let chestUid = 0;
const chestSvg = (cls = "", rar = "comum") => { const u = "c" + (++chestUid), K = chR(rar); return `<svg class="chest ${cls}" viewBox="0 0 140 120" aria-hidden="true"><defs>
  <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.w[0]}"/><stop offset=".55" stop-color="${K.w[1]}"/><stop offset="1" stop-color="${K.w[2]}"/></linearGradient>
  <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K.m[0]}"/><stop offset=".45" stop-color="${K.m[1]}"/><stop offset="1" stop-color="${K.m[2]}"/></linearGradient>
  <linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.band[0]}"/><stop offset=".5" stop-color="${K.band[1]}"/><stop offset="1" stop-color="${K.band[2]}"/></linearGradient>
  <radialGradient id="${u}l" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff8c4"/><stop offset=".5" stop-color="#ffd24a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="70" cy="112" rx="56" ry="6" fill="rgba(0,0,0,.28)"/>
  <g class="chest-in"><ellipse cx="70" cy="62" rx="52" ry="22" fill="url(#${u}l)"/><g class="chest-coins"><ellipse cx="46" cy="60" rx="9" ry="4.2" fill="#ffc936" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="62" cy="55" rx="9" ry="4.2" fill="#ffd95e" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="80" cy="57" rx="9" ry="4.2" fill="#ffc936" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="95" cy="62" rx="9" ry="4.2" fill="#ffd95e" stroke="#a86a06" stroke-width="1.4"/><ellipse cx="70" cy="52" rx="9" ry="4.2" fill="#fff0a0" stroke="#a86a06" stroke-width="1.4"/></g></g>
  <path d="M14 62 H126 V104 Q126 108 122 108 H18 Q14 108 14 104 Z" fill="url(#${u}w)" stroke="#3d200c" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#3d200c" stroke-width="1.2" opacity=".55"><path d="M14 76 H126"/><path d="M14 91 H126"/><path d="M30 62 V108 M52 62 V108 M88 62 V108 M110 62 V108" opacity=".5"/></g>
  <path d="M20 66 H44 M72 80 H104 M24 96 H50" stroke="#e9b27a" stroke-width="1.4" opacity=".5" stroke-linecap="round"/>
  <g stroke="#3d200c" stroke-width="2"><rect x="14" y="60" width="16" height="48" rx="3" fill="url(#${u}m)"/><rect x="110" y="60" width="16" height="48" rx="3" fill="url(#${u}m)"/><rect x="14" y="98" width="112" height="10" rx="3" fill="url(#${u}m)"/></g>
  <g fill="#4a5163"><circle cx="22" cy="68" r="1.8"/><circle cx="22" cy="84" r="1.8"/><circle cx="22" cy="102" r="1.8"/><circle cx="118" cy="68" r="1.8"/><circle cx="118" cy="84" r="1.8"/><circle cx="118" cy="102" r="1.8"/></g>
  <g class="chest-lid"><path d="M12 62 V46 Q12 14 70 14 Q128 14 128 46 V62 Z" fill="url(#${u}w)" stroke="#3d200c" stroke-width="3" stroke-linejoin="round"/>
    <path d="M26 56 Q30 24 70 22" fill="none" stroke="#e9b27a" stroke-width="2" opacity=".45" stroke-linecap="round"/>
    <g stroke="#3d200c" stroke-width="1.2" opacity=".5"><path d="M20 34 Q70 6 120 34" fill="none"/><path d="M13 48 H127"/></g>
    <g stroke="#3d200c" stroke-width="2"><path d="M12 62 V46 Q12 30 22 22 L32 22 Q20 32 30 62 Z" fill="url(#${u}m)"/><path d="M128 62 V46 Q128 30 118 22 L108 22 Q120 32 110 62 Z" fill="url(#${u}m)"/><path d="M52 15 Q70 12 88 15 V62 H52 Z" fill="url(#${u}g)"/></g>
    <rect x="12" y="56" width="116" height="8" rx="2" fill="url(#${u}m)" stroke="#3d200c" stroke-width="2"/>
    <g fill="#4a5163"><circle cx="21" cy="46" r="1.8"/><circle cx="119" cy="46" r="1.8"/></g><path d="M56 22 V58 M84 22 V58" stroke="#a86a06" stroke-width="1.2" opacity=".6"/></g>
  <g class="chest-lock"><rect x="58" y="62" width="24" height="26" rx="5" fill="url(#${u}g)" stroke="#3d200c" stroke-width="2.4"/><circle cx="70" cy="73" r="4.2" fill="#3d200c"/><path d="M68.4 75 h3.2 l1 8 h-5.2 z" fill="#3d200c"/><path d="M62 66 q8 -4 16 0" stroke="#fff6c8" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/></g>
</svg>` };
function albumLoad() {
  lg = lg || lgLoad(); lg.album = lg.album || {}; lg.cx = lg.cx || {}; let ch = false;
  if (typeof W !== "undefined" && !W.missing) return lg;   // baú de boas-vindas e baús antigos: o servidor cuida
  if (lg.chests > 0) { lg.cx.comum = (lg.cx.comum || 0) + lg.chests; lg.chests = 0; ch = true }      // baús antigos viram comuns
  if (ALBUM.length && !lg.bauWelcome) { lg.bauWelcome = true; lg.cx.comum = (lg.cx.comum || 0) + 1; ch = true }
  if (ch) lgSave(true); return lg;
}
const albumOwned = () => { albumLoad(); return ALBUM.filter(p => lg.album[p.id] > 0).length };
const chestCount = r => { lg = lg || lgLoad(); return (lg.cx && lg.cx[r]) || 0 };
const chestTotal = () => CH_ORDER.reduce((a, r) => a + chestCount(r), 0);
const freeLeft = () => { lg = lg || lgLoad(); if (typeof W !== "undefined" && W.ok) return Math.max(0, W.data.free_left | 0); const f = lg.free || {}; return Math.max(0, FREE_PER_DAY - (f.day === spDay(0) ? f.n || 0 : 0)) };
const chestBadge = () => { try { return chestTotal() + (user ? freeLeft() : 0) } catch (e) { return 0 } };
async function chestFree() {
  albumLoad(); if (!freeLeft()) { toast("Os baús grátis de hoje já foram pegos. Volte depois da meia-noite!"); return }
  if (!W.missing) { if (chestFree.busy) return; chestFree.busy = true; const d = await walletCall("wallet_free_chest"); chestFree.busy = false; if (d) { toast(`🎁 Baú grátis pego! Restam ${freeLeft()} hoje.`); renderLingo() } return }
  const f = lg.free && lg.free.day === spDay(0) ? lg.free : { day: spDay(0), n: 0 }; f.n++; lg.free = f;
  lg.cx.comum = (lg.cx.comum || 0) + 1; lgSave(true); toast(`🎁 Baú grátis pego! Restam ${freeLeft()} hoje.`); renderLingo();
}
function chestGive(n, why, rar = "comum", source) {
  if (!user || !n) return 0; albumLoad();
  if (!W.missing) {
    // o servidor confere o limite de baús por dia dessa origem
    lg.cx[rar] = (lg.cx[rar] || 0) + n;
    for (let i = 0; i < n; i++) walletCall("wallet_chest_earn", { p_source: source || "lingo_perfect", p_rar: rar }, { quiet: true }).then(d => {
      if (d && !d.got) toast("Limite de baús de hoje atingido: esse não entrou.");
      if (!d) walletLoad(true);
      walletRefresh();
    });
    if (why) toast(`🎁 ${why}: você ganhou ${n === 1 ? "um " + chR(rar).name.toLowerCase() : n + " " + chR(rar).name.toLowerCase() + "s"}! Abra em Minigames › Álbum.`);
    return n;
  }
  lg.cx[rar] = (lg.cx[rar] || 0) + n; lgSave(true);
  if (why) toast(`🎁 ${why}: você ganhou ${n === 1 ? "um " + chR(rar).name.toLowerCase() : n + " " + chR(rar).name.toLowerCase() + "s"}! Abra em Minigames › Álbum.`);
  return n;
}
const chestSkins = () => LG_SKINS.filter(k => !k.group && k.price > 0);   // fora as skins de conquista (Free Fire, Pássaro, Colecionador) e a clássica
function chestPick(list) { const t = list.reduce((a, x) => a + x[1], 0); let r = Math.random() * t; for (const x of list) { r -= x[1]; if (r <= 0) return x[0] } return list[0][0] }
function chestDraw(rar = "comum", forceSkin = false) {
  const K = chR(rar), r = Math.random() * 100;
  let kind = forceSkin ? "skin" : r < K.odds[0] ? "photo" : r < K.odds[0] + K.odds[1] ? "coins" : "skin";
  if (kind === "photo" && !ALBUM.length) kind = "coins";
  if (kind === "skin") { const pool = chestSkins().filter(k => !skinHas(k.id)); if (pool.length) return { t: "skin", sk: chestPick(pool.map(k => [k, Math.pow(k.price, -K.skinExp)])) }; kind = "coins" }
  if (kind === "coins") return { t: "coins", n: chestPick(K.coins) };
  const tot = ALBUM.reduce((a, p) => a + (p.rar || 1), 0); let q = Math.random() * tot, hit = ALBUM[ALBUM.length - 1];
  for (const p of ALBUM) { q -= p.rar || 1; if (q <= 0) { hit = p; break } }
  return { t: "photo", p: hit };
}
async function chestBuy(rar) {
  albumLoad(); const K = chR(rar);
  if ((lg.goiabas || 0) < K.price) { toast(`Faltam ${K.price - (lg.goiabas || 0)} Enzola Coins.`); return }
  if (!W.missing) { if (chestBuy.busy) return; chestBuy.busy = true; const d = await walletCall("wallet_buy_chest", { p_rar: rar }); chestBuy.busy = false; if (!d) return; toast(`${K.name} comprado! 🎁`); if (typeof lgShopRender === "function" && $("#lgs-ovl")) lgShopRender(); return }
  lg.goiabas -= K.price; lg.cx[rar] = (lg.cx[rar] || 0) + 1; lgSave(true);
  toast(`${K.name} comprado! 🎁`); if (typeof lgShopRender === "function" && $("#lgs-ovl")) lgShopRender();
}
const chestOddsTxt = r => { const K = chR(r); return `${K.draws} prêmios · ${K.odds[2]}% de chance de skin` };
function chestShopHTML(bal) {
  return `<div class="lgs-chests"><div class="lgs-ch-h"><b>🎁 Baús da sorte</b><small class="muted">Fotos de hipopótamo, Enzola Coins e skins. Quanto mais raro o baú, melhores os prêmios.</small></div>
    ${CH_ORDER.map(r => { const K = chR(r); return `<div class="lgs-chest" style="--rc:${K.col}">${chestSvg("sm", r)}<div class="lgs-ci"><b>${K.name}</b><small class="muted">${chestOddsTxt(r)}${K.guaranteeSkin ? " · 1 skin garantida" : ""} · você tem ${chestCount(r)}</small></div>
      <div class="lgs-cb"><button class="btn sm lgs-buy${bal >= K.price ? "" : " lack"}" data-lgs-buy-chest="${r}" aria-label="Comprar ${K.name} por ${K.price} Enzola Coins">${gbI()}${K.price}</button></div></div>` }).join("")}</div>`;
}
function albumOvl() { let b = $("#alb-ovl"); if (!b) { b = document.createElement("div"); b.id = "alb-ovl"; b.className = "alb-ovl"; b.setAttribute("role", "dialog"); b.setAttribute("aria-modal", "true"); b.setAttribute("aria-label", "Baú da sorte"); document.body.append(b); document.documentElement.classList.add("lg-open") } return b }
function albumClose() { const b = $("#alb-ovl"); if (b) b.remove(); if (!$("#lgs-ovl") && !$("#sh-ovl")) document.documentElement.classList.remove("lg-open"); if (tab === "idiomas") renderLingo() }
async function chestOpen(rar) {
  albumLoad(); if (!rar || !chestCount(rar)) rar = [...CH_ORDER].reverse().find(r => chestCount(r) > 0); if (!rar) return;
  if (!W.missing) {
    // o sorteio acontece no servidor; aqui só a animação
    if (chestOpen.busy) return; chestOpen.busy = true;
    const K = chR(rar);
    albumOvl().innerHTML = `<div class="alb-box rv"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button>
    <div class="alb-stage" id="alb-stage"><div class="chest-w shake">${chestSvg("", rar)}</div><p class="muted">Abrindo o ${K.name.toLowerCase()}…</p></div></div>`;
    const t0 = Date.now(), d = await walletCall("wallet_open_chest", { p_rar: rar }); chestOpen.busy = false;
    if (!d) { albumClose(); return }
    const got = (d.got || []).map(x => x.t === "photo" ? { t: "photo", p: ALBUM.find(p => p.id === x.id) || { id: x.id, name: x.id, img: `album/${x.id}.webp` }, fresh: !!x.fresh }
      : x.t === "coins" ? { t: "coins", n: x.n | 0 } : { t: "skin", sk: skinOf(x.id), fresh: !!x.fresh, dup: x.dup | 0 });
    rewardsCheck();
    const done = ALBUM.length && albumOwned() === ALBUM.length, nf = got.filter(x => x.t === "photo" && x.fresh).length, coins = got.reduce((a, x) => a + (x.t === "coins" ? x.n : x.dup || 0), 0), sk = got.filter(x => x.t === "skin" && x.fresh);
    chestShow = { got, i: -1, done, nf, coins, sk, busy: false, rar: d.rar || rar };
    setTimeout(() => { if ($("#alb-stage")) { $("#alb-stage").innerHTML = `<div class="chest-w open pop">${chestSvg("open", rar)}</div><div class="rv-burst" aria-hidden="true"></div>`; setTimeout(chestNext, 750) } }, Math.max(0, 1200 - (Date.now() - t0)));
    return;
  }
  lg.cx[rar]--; lg.skins = lg.skins || {}; const K = chR(rar);
  const got = Array.from({ length: K.draws }, (_, i) => {
    const d = chestDraw(rar, !!K.guaranteeSkin && i === 0);
    if (d.t === "photo") { const had = lg.album[d.p.id] > 0; lg.album[d.p.id] = (lg.album[d.p.id] || 0) + 1; d.fresh = !had }
    else if (d.t === "coins") lg.goiabas = (lg.goiabas || 0) + d.n;
    else { if (skinHas(d.sk.id)) { d.dup = Math.round(d.sk.price / 2); lg.goiabas = (lg.goiabas || 0) + d.dup } else { lg.skins[d.sk.id] = true; d.fresh = true } }
    return d;
  });
  lgSave(true);
  rewardsCheck();
  const done = ALBUM.length && albumOwned() === ALBUM.length, nf = got.filter(d => d.t === "photo" && d.fresh).length, coins = got.reduce((a, d) => a + (d.t === "coins" ? d.n : d.dup || 0), 0), sk = got.filter(d => d.t === "skin" && d.fresh);
  chestShow = { got, i: -1, done, nf, coins, sk, busy: false, rar };
  albumOvl().innerHTML = `<div class="alb-box rv"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button>
    <div class="alb-stage" id="alb-stage"><div class="chest-w shake">${chestSvg("", rar)}</div><p class="muted">Abrindo o ${K.name.toLowerCase()}…</p></div></div>`;
  setTimeout(() => { if ($("#alb-stage")) { $("#alb-stage").innerHTML = `<div class="chest-w open pop">${chestSvg("open", rar)}</div><div class="rv-burst" aria-hidden="true"></div>`; setTimeout(chestNext, 750) } }, 1200);
}
let chestShow = null;
const chestKind = d => d.t === "photo" ? (d.fresh ? "Foto nova!" : "Foto repetida") : d.t === "coins" ? "Enzola Coins" : d.fresh ? "Skin nova!" : "Skin repetida";
function chestCard(d, big) {
  if (d.t === "photo") return `<figure class="alb-c rv-c${d.fresh ? " new" : ""}"><img src="${esc(d.p.img)}" alt="${esc(d.p.name)}"><figcaption>${esc(d.p.name)}</figcaption><span class="alb-tag">${d.fresh ? "NOVA!" : "Repetida"}</span></figure>`;
  if (d.t === "coins") return `<figure class="alb-c rv-c alb-coin"><div class="alb-cb">${gbI("big")}<b>+${d.n}</b></div><figcaption>Enzola Coins</figcaption><span class="alb-tag">Moedas</span></figure>`;
  return `<figure class="alb-c rv-c alb-sk${d.fresh ? " new" : ""}"><div class="alb-sb"><img src="${esc(d.sk.img)}" alt=""></div><figcaption>${esc(d.sk.name)}${d.dup ? ` · +${d.dup} Coins` : ""}</figcaption><span class="alb-tag">${d.fresh ? "SKIN NOVA!" : "Repetida"}</span></figure>`;
}
function chestNext() {
  const s = chestShow, st = $("#alb-stage"); if (!s || !st || s.busy) return;
  s.busy = true;
  const show = () => {
    s.i++;
    if (s.i >= s.got.length) return chestSummary();
    const d = s.got[s.i], rare = d.t === "skin" && d.fresh || d.t === "coins" && d.n >= 60 || d.t === "photo" && d.fresh;
    st.innerHTML = `<div class="rv-step"><div class="rv-burst on${rare ? " rare" : ""}" aria-hidden="true"></div><div class="rv-card">${chestCard(d)}</div>
      <div class="rv-lab">${esc(chestKind(d))}</div><div class="rv-dots" aria-hidden="true">${s.got.map((_, k) => `<i class="${k <= s.i ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn rv-go" data-alb-next>${s.i === s.got.length - 1 ? "Ver resumo" : "Próximo prêmio"}</button></div>`;
    if (typeof lgBeep === "function") lgBeep("ok");
    s.busy = false; const b = $(".rv-go"); if (b) b.focus({ preventScroll: true });
  };
  const old = st.querySelector(".rv-card, .chest-w");
  if (old && s.i >= 0) { old.classList.add("rv-out"); setTimeout(show, 380) } else show();
}
function chestSummary() {
  const s = chestShow, st = $("#alb-stage"); if (!s || !st) return; s.busy = false;
  const parts = []; if (s.sk.length) parts.push(`${s.sk.length > 1 ? "skins novas" : "skin nova"}: ${s.sk.map(d => esc(d.sk.name)).join(", ")} (com avatar e banner!)`);
  if (s.nf) parts.push(`${s.nf} foto${s.nf > 1 ? "s" : ""} nova${s.nf > 1 ? "s" : ""}`); if (s.coins) parts.push(`${s.coins} Enzola Coins`);
  st.innerHTML = `<div class="alb-got">${s.got.map((d, i) => `<div style="--i:${i};display:contents">${chestCard(d).replace("alb-c rv-c", "alb-c")}</div>`).join("")}</div>
    <p class="alb-sum">${parts.length ? "Você ganhou " + parts.join(" · ") + "!" : "Só repetidas desta vez. Tente outro baú!"}${s.done ? " 🎉 Álbum completo!" : ""}</p>
    <div class="alb-acts">${(() => { const nx = chestCount(s.rar) ? s.rar : [...CH_ORDER].reverse().find(r => chestCount(r) > 0); return nx ? `<button class="btn" data-alb-open="${nx}">Abrir outro: ${chR(nx).name.toLowerCase()} (${chestCount(nx)})</button>` : "" })()}<button class="btn ghost" data-alb-close>Fechar</button></div>`;
}
function albumHTML() {
  albumLoad(); const own = albumOwned(), N = ALBUM.length, pct = N ? Math.round(own / N * 100) : 0;
  if (!N) return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Junte todas as fotos abrindo baús da sorte.</p></div></div><div class="panel empty"><b>Em breve</b>As primeiras fotos de hipopótamos estão chegando ao álbum.</div>`;
  return `<div class="sec-head"><div><h2 class="h">Álbum de hipopótamos</h2><p class="muted">Abra baús da sorte: fotos, Enzola Coins ou até skins. Fotos podem vir repetidas!</p></div></div>
    <div class="alb-top panel"><div class="alb-prog"><b>${own}/${N} fotos</b><div class="g-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${own}"><i style="width:${pct}%"></i></div>${own === N ? `<small>🎉 Álbum completo!</small>` : `<small class="muted">Faltam ${N - own}</small>`}</div>
    </div>
    <div class="alb-cx panel"><div class="alb-free"><div><b>🎁 Baús grátis de hoje: ${freeLeft()}/${FREE_PER_DAY}</b><small class="muted">${freeLeft() ? "Pegue um baú comum de graça" : "Novos baús grátis à meia-noite"}</small></div><button class="btn sm" data-alb-free${freeLeft() ? "" : " disabled"}>${freeLeft() ? "Pegar baú grátis" : "Volte amanhã"}</button></div>
      <div class="alb-rar">${CH_ORDER.map(r => { const K = chR(r), n = chestCount(r); return `<div class="alb-rc${n ? " has" : ""}" style="--rc:${K.col}">${chestSvg("sm", r)}<b>${K.name.replace("Baú ", "")}</b><small>${n} baú${n === 1 ? "" : "s"}</small><button class="btn sm${n ? "" : " ghost"}" data-alb-open="${r}"${n ? "" : " disabled"}>Abrir</button></div>` }).join("")}</div>
      <button class="btn ghost sm alb-buy" data-lg-shop>${gbI()}Comprar baús na loja</button></div>
    ${typeof xfSectionHTML === "function" ? xfSectionHTML() : ""}
    ${albBookHTML()}`;
}

/* ---------- livro: capa + páginas em mosaico, com virada de página ---------- */
const ALB_PER = 6, ALB_COLS = 8, ALB_ROWS = 10;
// mosaicos: [coluna, linha, largura, altura] numa grade 8×10 (página 4:5)
const ALB_TPL = {
  6: [
    [[0,0,4,3],[4,0,4,3],[0,3,3,4],[3,3,5,4],[0,7,5,3],[5,7,3,3]],
    [[0,0,3,6],[3,0,5,3],[3,3,5,3],[0,6,4,4],[4,6,4,2],[4,8,4,2]],
    [[0,0,8,3],[0,3,3,3],[3,3,5,3],[0,6,5,4],[5,6,3,2],[5,8,3,2]],
    [[0,0,3,5],[3,0,3,5],[6,0,2,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]],
  ],
  5: [[[0,0,5,5],[5,0,3,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]]],
  4: [[[0,0,8,5],[0,5,3,5],[3,5,5,3],[3,8,5,2]]],
  3: [[[0,0,8,5],[0,5,4,5],[4,5,4,5]]],
  2: [[[0,0,8,5],[0,5,8,5]]],
  1: [[[0,0,8,10]]],
};
let albPg = 0, albBusy = false, albLay = {};
const albPages = () => 1 + Math.ceil(ALBUM.length / ALB_PER);
function albLayout(pg) {            // pg >= 1: escolhe o mosaico e encaixa cada foto na célula de proporção mais próxima
  if (albLay[pg]) return albLay[pg];
  const items = ALBUM.slice((pg - 1) * ALB_PER, pg * ALB_PER), n = items.length, tpls = ALB_TPL[n] || ALB_TPL[1];
  let best = null;
  const perm = (arr, k, used, cur, tpl, score) => {
    if (k === arr.length) { if (!best || score < best.score) best = { score, cells: cur.slice(), tpl }; return }
    for (let i = 0; i < arr.length; i++) if (!used[i]) { used[i] = 1; const c = tpl[i], d = Math.abs(Math.log((c[2] / c[3]) / (arr[k].ar || 1.3)));
      cur[k] = c; perm(arr, k + 1, used, cur, tpl, score + d); used[i] = 0 }
  };
  tpls.forEach(tpl => perm(items, 0, [], [], tpl, 0));
  return albLay[pg] = items.map((p, i) => ({ p, c: best.cells[i], idx: (pg - 1) * ALB_PER + i }));
}
function albPageHTML(pg) {
  albumLoad();
  if (pg === 0) { const own = albumOwned(), N = ALBUM.length;
    return `<div class="bk-cover"><img src="album/capa.webp" alt="Capa do álbum de hipopótamos"><div class="bk-ct"><b>Álbum de Hipopótamos</b><span>${own}/${N} fotos</span><button class="btn sm" data-alb-go="1">Abrir o álbum</button></div></div>` }
  const cells = albLayout(pg).map(({ p, c, idx }) => { const n = lg.album[p.id] || 0, st = `grid-column:${c[0] + 1}/span ${c[2]};grid-row:${c[1] + 1}/span ${c[3]}`;
    return n ? `<button class="bk-c own" style="${st}" data-alb-zoom="${p.id}" aria-label="${esc(p.name)}, ${n} cópia${n > 1 ? "s" : ""}"><img src="${esc(p.img)}" alt=""><span class="alb-n">#${idx + 1}</span>${n > 1 ? `<span class="alb-x">×${n}</span>` : ""}</button>`
      : `<div class="bk-c" style="${st}" aria-label="Foto ${idx + 1} ainda não conquistada"><span class="alb-q">?</span><span class="alb-n">#${idx + 1}</span></div>` }).join("");
  return `<div class="bk-page"><div class="bk-mos">${cells}</div><div class="bk-no">${pg + 1}</div></div>`;
}
function albBookHTML() {
  albPg = Math.min(albPg, albPages() - 1);
  return `<div class="bk-wrap"><div class="bk" id="bk" tabindex="0" aria-label="Álbum, página ${albPg + 1} de ${albPages()}"><div class="bk-spine" aria-hidden="true"></div><div class="bk-pg" id="bk-cur">${albPageHTML(albPg)}</div></div>
    <div class="bk-nav"><button class="btn ghost sm" data-alb-go="prev" id="bk-prev"${albPg === 0 ? " disabled" : ""} aria-label="Página anterior">${ic("chev")}Anterior</button><span class="muted" id="bk-ind">${albPg === 0 ? "Capa" : `Página ${albPg} de ${albPages() - 1}`}</span><button class="btn ghost sm" data-alb-go="next" id="bk-next"${albPg >= albPages() - 1 ? " disabled" : ""} aria-label="Próxima página">Próxima${ic("chev")}</button></div></div>`;
}
function albNav() {
  const i = $("#bk-ind"), pv = $("#bk-prev"), nx = $("#bk-next"), bk = $("#bk");
  if (i) i.textContent = albPg === 0 ? "Capa" : `Página ${albPg} de ${albPages() - 1}`;
  if (pv) pv.disabled = albPg === 0; if (nx) nx.disabled = albPg >= albPages() - 1;
  if (bk) bk.setAttribute("aria-label", `Álbum, página ${albPg + 1} de ${albPages()}`);
}
function albGo(to) {
  if (albBusy || to < 0 || to >= albPages() || to === albPg) return;
  const bk = $("#bk"), cur = $("#bk-cur"); if (!bk || !cur) return;
  const fwd = to > albPg;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { cur.innerHTML = albPageHTML(to); albPg = to; albNav(); return }
  albBusy = true;
  const fl = document.createElement("div"); fl.className = "bk-fl " + (fwd ? "fwd" : "bwd");
  fl.innerHTML = `<div class="bk-f front">${albPageHTML(fwd ? albPg : to)}</div><div class="bk-f back"></div><div class="bk-sh" aria-hidden="true"></div>`;
  if (fwd) cur.innerHTML = albPageHTML(to);
  bk.append(fl);
  let done = false; const fin = () => { if (done) return; done = true; if (!fwd) cur.innerHTML = albPageHTML(to); fl.remove(); albPg = to; albBusy = false; albNav() };
  fl.addEventListener("animationend", fin, { once: true }); setTimeout(fin, 1100);
}
let albTx = null;
document.addEventListener("touchstart", e => { const t = e.target.closest && e.target.closest("#bk"); albTx = t ? e.touches[0].clientX : null }, { passive: true });
document.addEventListener("touchend", e => { if (albTx == null) return; const dx = e.changedTouches[0].clientX - albTx; albTx = null; if (Math.abs(dx) > 50) albGo(albPg + (dx < 0 ? 1 : -1)) }, { passive: true });
document.addEventListener("keydown", e => { if (!$("#bk") || $("#alb-ovl") || $("#lgs-ovl") || $("#sh-ovl") || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "")) return; if (e.key === "ArrowRight") albGo(albPg + 1); else if (e.key === "ArrowLeft") albGo(albPg - 1) });
document.addEventListener("click", e => {
  const c = s => e.target.closest(s); let b;
  if (b = c("[data-alb-go]")) { const g = b.dataset.albGo; albGo(g === "next" ? albPg + 1 : g === "prev" ? albPg - 1 : +g); return }
  if (b = c("[data-mg]")) { mgTab = b.dataset.mg; renderLingo(); return }
  if (c("[data-alb-next]")) { chestNext(); return }
  if (c("[data-alb-free]") && !c("[data-alb-free]").disabled) { chestFree(); return }
  if (c("[data-alb-open]") && !c("[data-alb-open]").disabled) { chestOpen(c("[data-alb-open]").dataset.albOpen); return }
  if (c("[data-alb-close]") || e.target.id === "alb-ovl") { albumClose(); return }
  if (b = c("[data-alb-zoom]")) { const p = ALBUM.find(x => x.id === b.dataset.albZoom); if (!p) return; const n = (lg.album || {})[p.id] || 0;
    albumOvl().innerHTML = `<div class="alb-box zoom"><button class="iconbtn lgs-x" data-alb-close aria-label="Fechar">${ic("x")}</button><img src="${esc(p.img)}" alt="${esc(p.name)}"><p><b>${esc(p.name)}</b><span class="muted"> · ${n} cópia${n > 1 ? "s" : ""}</span></p><p class="alb-fact"><b>🦛 Curiosidade #${ALBUM.indexOf(p) + 1}</b><br>${esc(albFact(p.id))}</p></div>`; return }
  if (c("[data-lgs-buy-chest]")) { chestBuy(c("[data-lgs-buy-chest]").dataset.lgsBuyChest); return }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && $("#alb-ovl")) albumClose() });

/* ---------- conquistas: skins especiais e certificados ---------- */
function lgAllDone() { lg = lg || lgLoad(); return Object.keys(LG_LANGS).every(k => LG_UNITS.every((_, u) => Array.from({ length: LG_LESSONS }, (_, l) => l).every(l => lg.done[`${k}-${u}-${l}`]))) }
const lgDoneCount = () => { lg = lg || lgLoad(); let n = 0; for (const k of Object.keys(LG_LANGS)) LG_UNITS.forEach((_, u) => { for (let l = 0; l < LG_LESSONS; l++) if (lg.done[`${k}-${u}-${l}`]) n++ }); return [n, Object.keys(LG_LANGS).length * LG_UNITS.length * LG_LESSONS] };
function rewardsCheck() {
  if (!user || !loaded) return; lg = lg || lgLoad(); lg.cert = lg.cert || {}; let ch = false;
  const srv = typeof W !== "undefined" && !W.missing;
  // skins de conquista: o servidor confere (álbum completo / lições) antes de entregar
  if (lgAllDone() && !lg.cert.lingo) { lg.cert.lingo = spDay(0); ch = true; if (srv) { lgSave(true); setTimeout(() => walletCall("wallet_claim_skin", { p_id: "ave" }, { quiet: true }).then(walletRefresh), 1500) } else lg.skins = { ...(lg.skins || {}), ave: true }; toast("🎓 Enzolingo concluído! Você ganhou a skin Enzola Pássaro e um certificado (aba Minigames).") }
  else if (srv && lg.cert.lingo && W.ok && !skinHas("ave") && !rewardsCheck.ave) { rewardsCheck.ave = 1; walletCall("wallet_claim_skin", { p_id: "ave" }, { quiet: true }).then(walletRefresh) }
  if (ALBUM.length && albumOwned() === ALBUM.length && !lg.cert.album) { lg.cert.album = spDay(0); lg.cert.albumN = ALBUM.length; ch = true; if (srv) walletCall("wallet_claim_skin", { p_id: "colecionador" }, { quiet: true }).then(walletRefresh); else lg.skins = { ...(lg.skins || {}), colecionador: true }; toast("📖 Álbum completo! Você ganhou a skin Colecionador e um certificado (aba Minigames).") }
  else if (srv && lg.cert.album && W.ok && !skinHas("colecionador") && !rewardsCheck.col) { rewardsCheck.col = 1; walletCall("wallet_claim_skin", { p_id: "colecionador" }, { quiet: true }).then(walletRefresh) }
  if (ch) lgSave(true);
}
const CERT = {
  lingo: { title: "Enzolingo", color: ["#58CC02", "#1c6b10"], accent: "#C8F26B", skin: "loja/h-ave.webp", line: () => "concluiu todas as lições do Enzolingo, em Inglês e Espanhol,", sub: () => `${lgDoneCount()[1]} lições concluídas com o hipopótamo` },
  album: { title: "Álbum de Hipopótamos", color: ["#FFB000", "#8a4a10"], accent: "#FFE9A8", skin: "loja/h-colecionador.webp", line: () => "completou o Álbum de Hipopótamos do Jogos Enzola,", sub: () => `${(lg.cert && lg.cert.albumN) || ALBUM.length} fotos conquistadas nos baús da sorte` },
};
const certCode = (k) => { let h = 2166136261; for (const c of (user.id + k + ((lg.cert || {})[k] || ""))) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return "JE-" + k.slice(0, 2).toUpperCase() + "-" + (h >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(-7) };
const certDate = iso => { const [y, m, d] = String(iso).split("-").map(Number); return `${d} de ${["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][m - 1]} de ${y}` };
async function certCanvas(k) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const C = CERT[k], W = 1754, H = 1240, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d");
  const [c1, c2] = C.color, FT = "'Chakra Petch', system-ui, sans-serif", FB = "Figtree, system-ui, sans-serif";
  const bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#0B1129"); bg.addColorStop(1, "#172A66"); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const gl = x.createRadialGradient(W * .8, H * .25, 20, W * .8, H * .25, 800); gl.addColorStop(0, c1 + "55"); gl.addColorStop(1, c1 + "00"); x.fillStyle = gl; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = .06; x.fillStyle = "#fff"; for (let i = -H; i < W; i += 90) { x.beginPath(); x.moveTo(i, H); x.lineTo(i + 40, H); x.lineTo(i + 40 + H, 0); x.lineTo(i + H, 0); x.fill() } x.restore();
  const bd = x.createLinearGradient(0, 0, W, 0); bd.addColorStop(0, c1); bd.addColorStop(.5, C.accent); bd.addColorStop(1, c1);
  x.lineWidth = 14; x.strokeStyle = bd; x.strokeRect(48, 48, W - 96, H - 96); x.lineWidth = 3; x.strokeStyle = C.accent + "99"; x.strokeRect(78, 78, W - 156, H - 156);
  for (const [cx, cy] of [[78, 78], [W - 78, 78], [78, H - 78], [W - 78, H - 78]]) { x.fillStyle = C.accent; x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.fill(); x.fillStyle = "#0B1129"; x.beginPath(); x.arc(cx, cy, 6, 0, 7); x.fill() }
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src });
  const [logo, hip] = await Promise.all([load("logo.png"), load(C.skin)]);
  if (logo) { const lh = 110, lw = logo.width * lh / logo.height; x.drawImage(logo, 130, 120, lw, lh) }
  x.textAlign = "left"; x.fillStyle = "#AEBBDD"; x.font = `600 26px ${FB}`; x.fillText("JOGOS ENZOLA · MOVIMENTO ENZOLA", 130 + (logo ? logo.width * 110 / logo.height + 26 : 0), 190);
  if (hip) { const hh = 780, hw = hip.width * hh / hip.height; x.save(); x.shadowColor = "rgba(0,0,0,.45)"; x.shadowBlur = 40; x.shadowOffsetY = 18; x.drawImage(hip, W - hw - 110, H - hh - 100, hw, hh); x.restore() }
  x.textAlign = "left"; x.fillStyle = C.accent; x.font = `700 30px ${FB}`; x.fillText("CERTIFICADO DE CONCLUSÃO", 130, 330);
  x.fillStyle = "#fff"; x.font = `700 96px ${FT}`; x.fillText(C.title, 130, 430);
  x.fillStyle = "#C9D3F0"; x.font = `500 34px ${FB}`; x.fillText("Certificamos com muito orgulho que", 130, 520);
  let nm = (typeof nick === "function" ? nick() : "") || "Jogador"; let fs = 120; x.font = `700 ${fs}px ${FT}`; while (x.measureText(nm).width > 940 && fs > 50) { fs -= 4; x.font = `700 ${fs}px ${FT}` }
  const g2 = x.createLinearGradient(130, 0, 1070, 0); g2.addColorStop(0, "#fff"); g2.addColorStop(1, C.accent); x.fillStyle = g2; x.fillText(nm, 130, 650);
  x.fillStyle = c1; x.fillRect(130, 678, Math.min(940, x.measureText(nm).width), 6);
  x.fillStyle = "#C9D3F0"; x.font = `500 36px ${FB}`; x.fillText(C.line(), 130, 750); x.fillStyle = "#fff"; x.font = `700 36px ${FB}`; x.fillText(C.sub() + ".", 130, 800);
  x.fillStyle = "#AEBBDD"; x.font = `500 30px ${FB}`; x.fillText(`Concedido em ${certDate((lg.cert || {})[k] || spDay(0))}`, 130, 880);
  x.fillStyle = "#7F8DB5"; x.font = `500 24px ${FB}`; x.fillText(`@${typeof uname === "function" ? uname() : ""}  ·  Código ${certCode(k)}`, 130, 925);
  // selo
  const sx = 700, sy = 1090; x.save(); x.translate(sx, sy); x.rotate(-.12);
  x.fillStyle = c1; x.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832, r = i % 2 ? 78 : 90; x.lineTo(Math.cos(a) * r, Math.sin(a) * r) } x.fill();
  x.fillStyle = "#0B1129"; x.beginPath(); x.arc(0, 0, 66, 0, 7); x.fill(); x.strokeStyle = C.accent; x.lineWidth = 4; x.beginPath(); x.arc(0, 0, 58, 0, 7); x.stroke();
  x.fillStyle = C.accent; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `700 20px ${FB}`; x.fillText("COMPLETO", 0, 22); x.font = "46px serif"; x.fillText(k === "lingo" ? "🎓" : "📖", 0, -18); x.restore();
  x.textAlign = "left"; x.textBaseline = "alphabetic";
  x.fillStyle = "#fff"; x.fillRect(130, 1060, 360, 3); x.fillStyle = "#AEBBDD"; x.font = `600 26px ${FB}`; x.fillText("Movimento Enzola", 130, 1100); x.font = `500 22px ${FB}`; x.fillStyle = "#7F8DB5"; x.fillText("Jogos Enzola · jogos-enzola.vercel.app", 130, 1136);
  return cv;
}
function certBlob(cv, type, q) { return new Promise(r => cv.toBlob(r, type, q)) }
async function certPdf(cv) {
  const jpg = new Uint8Array(await (await certBlob(cv, "image/jpeg", .93)).arrayBuffer()), enc = new TextEncoder(), parts = [], off = []; let len = 0;
  const put = b => { const u = typeof b === "string" ? enc.encode(b) : b; parts.push(u); len += u.length };
  put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const obj = (n, body) => { off[n] = len; put(`${n} 0 obj\n${body}\nendobj\n`) };
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>"); obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>");
  const cs = "q 842 0 0 595 0 0 cm /Im0 Do Q"; obj(4, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
  off[5] = len; put(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); put(jpg); put("\nendstream\nendobj\n");
  const xr = len; put("xref\n0 6\n0000000000 65535 f \n"); for (let i = 1; i <= 5; i++) put(String(off[i]).padStart(10, "0") + " 00000 n \n");
  put(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}
function certHTML(keys = ["lingo", "album"]) {
  rewardsCheck(); const [dn, dt] = lgDoneCount(), N = ALBUM.length, own = albumOwned();
  const card = (k, ok, prog, hint) => `<div class="cert-card${ok ? " ok" : ""}"><div class="cert-pv" id="cp-${k}">${ok ? `<span class="muted">Gerando prévia…</span>` : `<div class="cert-lock">🔒<small>${hint}</small></div>`}</div>
    <div class="cert-b"><b>Certificado · ${CERT[k].title}</b><small class="muted">${ok ? "Concedido em " + certDate(lg.cert[k]) : prog}</small>
    ${ok ? `<div class="cert-a"><button class="btn sm" data-cert="${k}:png">${ic("image")}Baixar imagem</button><button class="btn ghost sm" data-cert="${k}:pdf">${ic("download")}Baixar PDF</button></div>` : ""}</div></div>`;
  const earned = keys.filter(k => (lg.cert || {})[k]); if (!earned.length) return "";     // certificados só aparecem depois de conquistados
  return `<div class="sec-head cert-h"><div><h2 class="h">🏅 ${earned.length > 1 ? "Seus certificados" : "Seu certificado"}</h2><p class="muted">Conquista concluída! Baixe em imagem ou PDF.</p></div></div>
    <div class="cert-grid">${earned.map(k => card(k, true)).join("")}</div>`;
}
async function certPreview() {
  for (const k of ["lingo", "album"]) { if (!(lg.cert || {})[k]) continue; const box = $("#cp-" + k); if (!box) continue;
    try { const cv = await certCanvas(k); const u = cv.toDataURL("image/jpeg", .8); const b2 = $("#cp-" + k); if (b2) b2.innerHTML = `<img src="${u}" alt="Prévia do certificado ${esc(CERT[k].title)}">` } catch (e) {} }
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-cert]"); if (!b) return; const [k, t] = b.dataset.cert.split(":"); if (!(lg.cert || {})[k]) return;
  const old = b.innerHTML; b.disabled = true; b.textContent = "Gerando…";
  try { const cv = await certCanvas(k), nm = "certificado-" + k + "-" + ((typeof uname === "function" && uname()) || "enzola");
    const blob = t === "pdf" ? await certPdf(cv) : await certBlob(cv, "image/png");
    if (!(await shareOrDownload(blob, nm + (t === "pdf" ? ".pdf" : ".png"), "Meu certificado"))) toast(t === "pdf" ? "PDF salvo." : "Imagem salva.");
  } catch (er) { toast("Não foi possível gerar o certificado agora.") }
  b.disabled = false; b.innerHTML = old;
});
