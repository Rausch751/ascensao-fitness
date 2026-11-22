/* ==========================================================================
   LÓGICA ASCENSÃO FITNESS - VERSÃO 31.0
   ========================================================================== */

const somClique = criarAudioSeguro('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 'clique');
const somPortal = criarAudioSeguro('https://assets.mixkit.co/active_storage/sfx/2625/2625-preview.mp3', 'portal');
const somXP = criarAudioSeguro('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 'xp');

const VERSAO_ATUAL = "33.1-beta";

/* Saves feitos antes da troca de nomes (V33.2): converte ids de itens, conquistas e títulos para os nomes novos.
   Só troca textos entre aspas, então não mexe em nada que não seja exatamente um destes valores. */
const MIGRACAO_NOMES = {
    "rasaka": "vyrassa_adaga", "baruka_lanca": "gorvak_lanca", "vulkan_clava": "ignarok_machado", "anel_monarca": "anel_soberano",
    "baran_elmo": "zarkhul_elmo", "kargalgan_manto": "mogtharn_manto", "beru_coroa": "zyrrax_coroa", "kamish_escama": "aethraxes_escama",
    "antares_coracao": "morghul_coracao", "sombra_igris": "sombra_kaelor",
    "[ Caçador de Sombras ]": "[ Aprendiz das Sombras ]", "[ Algoz dos Dungeons ]": "[ Algoz das Masmorras ]",
    "[ Nível Nacional ]": "[ Lenda Viva ]", "[ Monarca das Sombras ]": "[ Soberano do Eclipse ]", "[ Necromante Supremo ]": "[ Invocador Supremo ]"
};
function migrarNomesAntigosTexto(txt) {
    let t = String(txt);
    try { t = JSON.stringify(JSON.parse(t)); } catch (e) { /* texto inválido: segue como está */ }
    for (const k of Object.keys(MIGRACAO_NOMES)) t = t.split('"' + k + '"').join('"' + MIGRACAO_NOMES[k] + '"');
    return t;
}

/* ---------- RARIDADES ---------- */
const RARIDADES = {
    comum:    { nome: "Comum",    icone: "⚪", cor: "#cbd5e1", venda: 150 },
    raro:     { nome: "Raro",     icone: "🔵", cor: "#38bdf8", venda: 500 },
    epico:    { nome: "Épico",    icone: "🟣", cor: "#a855f7", venda: 1500 },
    lendario: { nome: "Lendário", icone: "🟡", cor: "#eab308", venda: 4000 },
    mitico:   { nome: "Mítico",   icone: "🔴", cor: "#ef4444", venda: 10000 }
};
const ORDEM_RARIDADE = ["comum", "raro", "epico", "lendario", "mitico"];
const LIMITE_RARIDADE_LOJA = "epico";

/* ---------- RANKS ---------- */
const ESCALA_RANKS = [
    { nome: "RANK E", xpRequerido: 0, fator: 0.8, icone: "🟢", desc: "-20% do Máximo", titulo: "[ O Desperto ]", sombra: null },
    {
        nome: "RANK D", xpRequerido: 5000, fator: 0.9, icone: "🔵", desc: "-10% do Máximo", titulo: "[ Aprendiz das Sombras ]",
        sombra: "🔱 Kaelor (+5% XP Bônus)",
        historiaSombra: "O Lanceiro das Brumas, de armadura prateada e lança de névoa, finca a haste no chão e baixa a cabeça diante da sua presença..."
    },
    {
        nome: "RANK C", xpRequerido: 25000, fator: 0.95, icone: "🟣", desc: "-5% do Máximo", titulo: "[ Algoz das Masmorras ]",
        sombra: "🐺 Fenryx (+10% XP Bônus)",
        historiaSombra: "O lobo alfa da geada, líder de toda uma matilha, abaixa o focinho e uiva em respeito..."
    },
    {
        nome: "RANK B", xpRequerido: 75000, fator: 1.0, icone: "🟡", desc: "100% do Máximo", titulo: "[ Cavaleiro de Elite ]",
        sombra: "🛡️ Muralha (Mitigação de Penalidade)",
        historiaSombra: "O colosso de obsidiana, coberto de runas, apoia o escudo no solo e jura proteger quem o convocou..."
    },
    {
        nome: "RANK A", xpRequerido: 200000, fator: 1.1, icone: "🟠", desc: "+10% do Máximo", titulo: "[ Comandante Supremo ]",
        sombra: "🔮 Orvanth (+25% XP e Gold de Rupturas)",
        historiaSombra: "O Oráculo Umbral, envolto em orbes de runas flutuantes, abaixa o capuz e curva-se diante do seu poder..."
    },
    {
        nome: "RANK S", xpRequerido: 400000, fator: 1.1, icone: "🔴", desc: "+10% do Máximo", titulo: "[ Lenda Viva ]",
        sombra: "🦋 Vesperia (+15% XP Bônus)",
        historiaSombra: "A Rainha das Mariposas, de asas que sussurram luz, pousa diante de você e inclina a coroa de antenas em reverência ao Soberano..."
    },
    {
        nome: "👑 SOBERANO DO ECLIPSE", xpRequerido: 900000, fator: 1.2, icone: "💀", desc: "+20% do Máximo", titulo: "[ Soberano do Eclipse ]",
        sombra: "👑 Noctaris (+20% XP Bônus)",
        historiaSombra: "O Imperador Eclipse, senhor da Legião Umbral, presta juramento eterno e todas as sombras respondem ao seu chamado supremo!"
    }
];

/* ---------- SOMBRAS: NOME, IMAGEM E FALA (chave = índice do rank) ----------
   As silhuetas ficam embutidas em sombras.js (SOMBRAS_IMAGENS). */
const SOMBRAS_DATA = {
    1: { nome: "KAELOR",  icone: "🔱", imagem: "kaelor", efeito: "+5% de XP em todos os treinos", bonus: { xp: 0.05 },
         fala: "... (o Lanceiro das Brumas finca a lança no chão e inclina a cabeça em silêncio) ...",
         lore: "Lanceiro das Brumas. Foi o primeiro a tombar nas Fendas e, mesmo depois da morte, recusou-se a abandonar o posto. Ajoelhado, jurou a lança a quem fosse digno de se erguer sozinho, e esse alguém foi você." },
    2: { nome: "FENRYX",   icone: "🐺", imagem: "fenryx", efeito: "+10% de XP em todos os treinos", bonus: { xp: 0.10 },
         fala: "AUUUUU! (o uivo grave do lobo da geada ecoa enquanto a matilha inteira abaixa a cabeça diante do Soberano)",
         lore: "Lobo alfa da geada, que corria à frente de uma matilha inteira pelas estepes congeladas. Nenhum rastro lhe escapa e nenhum inimigo o alcança. Quando ele uiva, toda a Legião avança junto." },
    3: { nome: "MURALHA",   icone: "🛡️", imagem: "muralha", efeito: "Reduz em 25% o XP perdido em penalidades", bonus: { penalidade: 0.25 },
         fala: "GRRROOOM! (o colosso de obsidiana bate o escudo no chão e faz as runas brilharem em juramento de proteção!)",
         lore: "Colosso de obsidiana forjado para ser o último obstáculo entre a Fenda e o mundo. As runas do seu escudo brilham a cada golpe que ele recebe no lugar de quem o comanda. Onde Muralha se planta, a derrota não passa." },
    4: { nome: "ORVANTH",   icone: "🔮", imagem: "orvanth", efeito: "+25% de XP e de Gold ao selar Rupturas", bonus: { ruptura: 0.25 },
         fala: "Sou Orvanth, o Oráculo Umbral. Os selos antigos e as chamas da Fenda obedecem a vós, Soberano. Minha visão é vossa até o fim dos tempos.",
         lore: "Oráculo Umbral, guardião dos selos antigos. Lê as Fendas como outros leem livros e sabe onde uma Ruptura vai se abrir antes de o céu mudar de cor. Toda essa visão agora serve a você." },
    5: { nome: "VESPERIA",   icone: "🦋", imagem: "vesperia", efeito: "+15% de XP em todos os treinos", bonus: { xp: 0.15 },
         fala: "Eu vos servirei com graça, meu Senhor! Minhas asas abrirão cada caminho na escuridão e eu as manterei abertas pela eternidade!",
         lore: "Dama das asas do crepúsculo, cujos olhos nas asas enxergam o que a escuridão esconde. Onde ela passa, os caminhos se abrem. Serve com graça, mas só segue quem treina com constância." },
    6: { nome: "NOCTARIS", icone: "👑", imagem: "noctaris", efeito: "+20% de XP em todos os treinos", bonus: { xp: 0.20 },
         fala: "Sou Noctaris, o Imperador Eclipse, senhor da Legião Umbral. É uma honra suprema estar diante do verdadeiro Soberano. Toda a minha legião e a minha coroa pertencem a vós pela eternidade.",
         lore: "Imperador Eclipse, senhor da Legião Umbral. Reinou sozinho num trono de sombras até encontrar alguém cuja disciplina brilhava mais que o seu eclipse. Inclinou a cabeça e entregou a coroa e toda a legião." }
};


/* ---------- TÍTULOS: O QUE CADA UM FAZ ---------- */
const TITULOS_INFO = {
    "[ O Desperto ]": { desc: "Título inicial. Apenas honorário (não dá bônus)." },
    "[ Aprendiz das Sombras ]": { desc: "Título do Rank D. Apenas honorário." },
    "[ Algoz das Masmorras ]": { desc: "Título do Rank C. Apenas honorário." },
    "[ Cavaleiro de Elite ]": { desc: "Título do Rank B. Apenas honorário." },
    "[ Comandante Supremo ]": { desc: "Título do Rank A. Apenas honorário." },
    "[ Lenda Viva ]": { desc: "Título do Rank S. Apenas honorário." },
    "[ Soberano do Eclipse ]": { desc: "Título do Rank máximo. Apenas honorário." },
    "[ Invocador Supremo ]": { desc: "Concluiu a Mudança de Classe. Apenas honorário." },
    "[ Caçador de Fendas ]": { desc: "Concluiu uma Masmorra Temporária 100%. Apenas honorário." },
    "[ Mercador de Relíquias ]": { desc: "Equipado: -3% no preço de tudo na Loja.", efeito: "desconto_loja", valor: 0.03 },
    "[ Colecionador Verdadeiro ]": { desc: "Equipado: +10% de Gold ao vender equipamentos.", efeito: "bonus_venda", valor: 0.10 },
    "[ Guardião do Coração ]": { desc: "Derrotou o Boss Final e guardou o troféu. Apenas honorário." },
    "[ O Apostador ]": { desc: "Título antigo (honorário)." },
    "[ Sobrevivente do Abismo ]": { desc: "Equipado: -10% no XP perdido em penalidades.", efeito: "mitiga_penalidade", valor: 0.10 },
    "[ Inabalável ]": { desc: "Equipado: você recebe 1 Descanso Remunerado por mês.", efeito: "descanso_mensal", valor: 1 },
    "[ O Que Renasce das Cinzas ]": { desc: "Recuperou um Rank perdido. Apenas honorário." },
    "[ Invasor de Portais ]": { desc: "Equipado: +10% de XP ao fechar Rupturas.", efeito: "xp_ruptura", valor: 0.10 },
    "[ Estrategista do Segundo Final ]": { desc: "Fechou uma Ruptura no último instante. Apenas honorário." },
    "[ Determinação Inabalável ]": { desc: "Fechou uma Ruptura e fez 100% das Diárias no mesmo dia. Apenas honorário." }
};

function tituloDescricao(nome) {
    return (TITULOS_INFO[nome] && TITULOS_INFO[nome].desc) || "Título honorário (não dá bônus).";
}
function efeitoTitulo(tipo) {
    const t = TITULOS_INFO[hunter.tituloEquipado];
    return (t && t.efeito === tipo) ? t.valor : 0;
}

/* ---------- ITENS (EQUIPAMENTOS) ---------- */
const BANCO_ITENS = [
    { id: "vyrassa_adaga", nome: "🗡️ Adaga Presa de Vyrassa", raridade: "raro", desc: "Equipado: +10% de XP em todos os treinos.", bonusTipo: "global", bonusVal: 0.10 },
    { id: "aranha_teia", nome: "🕷️ Brinco da Rainha Aracnídea", raridade: "raro", desc: "Equipado: +5 no atributo Agilidade (aparece no seu painel).", bonusTipo: "agilidade", bonusVal: 5 },
    { id: "gorvak_lanca", nome: "❄️ Lança Glacial de Gorvak", raridade: "epico", desc: "Equipado: +10 no atributo Resistência (aparece no seu painel).", bonusTipo: "resistencia", bonusVal: 10 },
    { id: "ignarok_machado", nome: "🔥 Machado de Guerra de Ignarok", raridade: "epico", desc: "Equipado: +15 no atributo Força (aparece no seu painel).", bonusTipo: "forca", bonusVal: 15 },
    { id: "anel_soberano", nome: "💍 Anel do Soberano", raridade: "epico", desc: "Equipado: a Força que você ganha a cada treino concluído rende +10% a mais.", bonusTipo: "forca_mult", bonusVal: 0.10 },
    { id: "zarkhul_elmo", nome: "🪖 Elmo Elétrico do Rei Zarkhul", raridade: "lendario", desc: "Equipado: +20 no atributo Inteligência (aparece no seu painel).", bonusTipo: "inteligencia", bonusVal: 20 },
    { id: "mogtharn_manto", nome: "🧙‍♂️ Manto de Xamã Orc Rubro", raridade: "lendario", desc: "Equipado: +15 no atributo Vitalidade (aparece no seu painel).", bonusTipo: "vitalidade", bonusVal: 15 },
    { id: "zyrrax_coroa", nome: "🪲 Coroa do Rei Enxame", raridade: "lendario", desc: "Equipado: +25% de XP em todos os treinos.", bonusTipo: "global", bonusVal: 0.25 },
    { id: "aethraxes_escama", nome: "🐉 Escama de Dragão Ancestral", raridade: "mitico", desc: "Equipado: +30 em TODOS os atributos (aparece no seu painel).", bonusTipo: "todos", bonusVal: 30 },
    { id: "morghul_coracao", nome: "💀 Coração do Soberano da Ruína", raridade: "mitico", desc: "Equipado: +50 em TODOS os atributos (aparece no seu painel).", bonusTipo: "todos", bonusVal: 50 },
    { id: "lamina_sombras", nome: "🗡️ Lâmina do Soberano Silente", raridade: "epico", desc: "Equipado: +15% de XP em todos os treinos. (Recompensa da Masmorra Temporária 100%.)", bonusTipo: "global", bonusVal: 0.15 },
    { id: "anel_desesperado", nome: "💍 Anel do Desesperado", raridade: "lendario", desc: "Equipado: suas metas diárias ficam 15% MAIORES (mais treino de verdade) e você ganha +10% de XP extra. Risco: a Fadiga sobe mais. Se a Fadiga chegar a 80%, o anel se desequipa sozinho.", bonusTipo: "desespero", bonusVal: 0.15, exclusivo: true },
    { id: "anel_fenda", nome: "💍 Anel Fragmentado da Fenda", raridade: "comum", desc: "Equipado: +5% de XP em todos os treinos. (Recompensa parcial da Masmorra Temporária.)", bonusTipo: "global", bonusVal: 0.05 },
    // Equipamentos vendidos na Loja (até Épico)
    { id: "tunica_iniciante", nome: "🥋 Túnica de Caçador Iniciante", raridade: "comum", desc: "Equipado: +3 no atributo Vitalidade (aparece no seu painel).", bonusTipo: "vitalidade", bonusVal: 3 },
    { id: "luvas_ferro", nome: "🧤 Luvas de Ferro Reforçadas", raridade: "comum", desc: "Equipado: +3 no atributo Força (aparece no seu painel).", bonusTipo: "forca", bonusVal: 3 },
    { id: "botas_vento", nome: "👟 Botas do Vento Veloz", raridade: "raro", desc: "Equipado: +6 no atributo Agilidade (aparece no seu painel).", bonusTipo: "agilidade", bonusVal: 6 },
    { id: "amuleto_estudioso", nome: "📿 Amuleto do Estudioso", raridade: "raro", desc: "Equipado: +5% de XP em todos os treinos.", bonusTipo: "global", bonusVal: 0.05 },
    { id: "armadura_obsidiana", nome: "🛡️ Armadura de Obsidiana", raridade: "epico", desc: "Equipado: +12 no atributo Resistência (aparece no seu painel).", bonusTipo: "resistencia", bonusVal: 12 },
    { id: "colar_arcano", nome: "🔮 Colar do Mago Arcano", raridade: "epico", desc: "Equipado: +15 no atributo Inteligência (aparece no seu painel).", bonusTipo: "inteligencia", bonusVal: 15 }
];

/* ---------- ESPAÇOS DE EQUIPAMENTO E EFEITOS REAIS DOS ITENS ----------
   Em vez de somar pontos nos atributos, cada item dá um bônus que muda o jogo de verdade:
   Força = XP das flexões | Agilidade = XP do cardio | Resistência = XP de abdominais e agachamentos
   Inteligência = XP da leitura | Vitalidade = menos Fadiga ganha por treino */
const SLOTS_EQUIP = {
    arma:     { nome: "Arma",       icone: "🗡️" },
    cabeca:   { nome: "Cabeça",     icone: "🪖" },
    corpo:    { nome: "Corpo",      icone: "🛡️" },
    maos_pes: { nome: "Mãos / Pés", icone: "🧤" },
    acess1:   { nome: "Acessório 1", icone: "💍" },
    acess2:   { nome: "Acessório 2", icone: "📿" }
};
const AJUSTE_ITENS = {
    vyrassa_adaga:             { slot: "arma",     efeitos: { xp_global: 0.10 }, desc: "Equipado: +10% de XP em TODOS os treinos." },
    aranha_teia:        { slot: "acessorio", efeitos: { xp_agilidade: 0.07, bonus_venda: 0.10 }, desc: "Equipado: +7% de XP de Agilidade (cardio) e +10% de Gold ao vender itens." },
    gorvak_lanca:       { slot: "arma",     efeitos: { xp_resistencia: 0.12 }, desc: "Equipado: +12% de XP de Resistência (abdominais e agachamentos)." },
    ignarok_machado:       { slot: "arma",     efeitos: { xp_forca: 0.12 }, desc: "Equipado: +12% de XP de Força (flexões)." },
    anel_soberano:       { slot: "acessorio", efeitos: { forca_ganho: 0.10 }, desc: "Equipado: a Força que você ganha a cada treino concluído rende +10% a mais." },
    zarkhul_elmo:         { slot: "cabeca",   efeitos: { xp_inteligencia: 0.20 }, desc: "Equipado: +20% de XP de Inteligência (leitura)." },
    mogtharn_manto:    { slot: "corpo",    efeitos: { fadiga_menos: 0.15, desconto_loja: 0.10 }, desc: "Equipado: ganha 15% menos Fadiga (Vitalidade) e tem 10% de desconto na Loja." },
    zyrrax_coroa:         { slot: "acessorio", efeitos: { xp_global: 0.20 }, desc: "Equipado: +20% de XP em TODOS os treinos." },
    aethraxes_escama:      { slot: "corpo",    efeitos: { xp_forca: 0.25, xp_agilidade: 0.25, xp_resistencia: 0.25, xp_inteligencia: 0.25, fadiga_menos: 0.20 }, desc: "Equipado: +25% de XP de Força, Agilidade, Resistência e Inteligência, e ganha 20% menos Fadiga (Vitalidade)." },
    morghul_coracao:    { slot: "acessorio", efeitos: { xp_forca: 0.30, xp_agilidade: 0.30, xp_resistencia: 0.30, xp_inteligencia: 0.30, fadiga_menos: 0.25 }, desc: "Equipado: +30% de XP de Força, Agilidade, Resistência e Inteligência, e ganha 25% menos Fadiga (Vitalidade)." },
    lamina_sombras:     { slot: "arma",     efeitos: { xp_global: 0.12 }, desc: "Equipado: +12% de XP em TODOS os treinos. (Recompensa da Masmorra Temporária 100%.)" },
    anel_desesperado:   { slot: "acessorio", efeitos: { desespero: 0.15, xp_global: 0.10 }, desc: "Equipado: suas metas diárias ficam 15% MAIORES (mais treino de verdade) e você ganha +10% de XP extra. Risco: a Fadiga sobe mais. Se a Fadiga chegar a 80%, o anel se desequipa sozinho." },
    anel_fenda:         { slot: "acessorio", efeitos: { xp_global: 0.03, desconto_loja: 0.03 }, desc: "Equipado: +3% de XP em todos os treinos e 3% de desconto na Loja. (Recompensa parcial da Masmorra Temporária.)" },
    tunica_iniciante:   { slot: "corpo",    efeitos: { fadiga_menos: 0.05 }, desc: "Equipado: ganha 5% menos Fadiga por treino (bônus de Vitalidade)." },
    luvas_ferro:        { slot: "maos_pes", efeitos: { xp_forca: 0.04 }, desc: "Equipado: +4% de XP de Força (flexões)." },
    botas_vento:        { slot: "maos_pes", efeitos: { xp_agilidade: 0.07 }, desc: "Equipado: +7% de XP de Agilidade (cardio)." },
    amuleto_estudioso:  { slot: "acessorio", efeitos: { xp_global: 0.05 }, desc: "Equipado: +5% de XP em todos os treinos." },
    armadura_obsidiana: { slot: "corpo",    efeitos: { xp_resistencia: 0.11 }, desc: "Equipado: +11% de XP de Resistência (abdominais e agachamentos)." },
    colar_arcano:       { slot: "acessorio", efeitos: { xp_inteligencia: 0.12 }, desc: "Equipado: +12% de XP de Inteligência (leitura)." }
};
BANCO_ITENS.forEach(i => { if (AJUSTE_ITENS[i.id]) Object.assign(i, AJUSTE_ITENS[i.id]); });

/* ---------- LOJA (teto: Épico) ---------- */
const ITENS_LOJA = [
    { id: "pocao_hp", tipo: "consumivel", raridade: "comum", nome: "🧪 Soro de Recuperação", preco: 500, desc: "Dá +1 Soro de Recuperação na Bolsa. O Soro salva o treino, o Streak e o XP de um dia em que algo deu errado. Não mexe na Fadiga: só descansar de verdade baixa a Fadiga.", uso: "Use na Bolsa (aba Utilitários) antes de o dia acabar." },
    { id: "pedra_polimento", tipo: "consumivel", raridade: "comum", nome: "💎 Pedra de Polimento de Elite", preco: 300, desc: "Dá +15% de XP no próximo treino concluído.", uso: "Consumida sozinha ao concluir o próximo treino (não vale na Zona de Penitência nem na Raid)." },
    { id: "chave_masmorra", tipo: "consumivel", raridade: "raro", nome: "🔑 Chave de Masmorra Instantânea", preco: 800, desc: "Abre uma Fenda Temporária: 2 horas para cumprir exercícios ~35% mais leves e ganhar XP, Gold, artefato e título. Enquanto você está dentro, as Missões Diárias ficam pausadas e voltam de onde pararam.", uso: "Use na Bolsa ou no botão 'Usar Chave de Masmorra'." },
    { id: "essencia_mana", tipo: "consumivel", raridade: "raro", nome: "🔷 Essência de Mana", preco: 700, desc: "Material usado na Caldeira do Soberano (Rank B+) para refabricar o Cristal do Repouso. Precisa de 2 por lote.", uso: "Fica guardada na Bolsa; é gasta ao refabricar." },
    { id: "tunica_iniciante", tipo: "equipamento", raridade: "comum", nome: "🥋 Túnica de Caçador Iniciante", preco: 400, desc: "Equipado: +3 no atributo Vitalidade (aparece no seu painel)." },
    { id: "luvas_ferro", tipo: "equipamento", raridade: "comum", nome: "🧤 Luvas de Ferro Reforçadas", preco: 450, desc: "Equipado: +3 no atributo Força (aparece no seu painel)." },
    { id: "botas_vento", tipo: "equipamento", raridade: "raro", nome: "👟 Botas do Vento Veloz", preco: 1200, desc: "Equipado: +6 no atributo Agilidade (aparece no seu painel)." },
    { id: "amuleto_estudioso", tipo: "equipamento", raridade: "raro", nome: "📿 Amuleto do Estudioso", preco: 1500, desc: "Equipado: +5% de XP em todos os treinos." },
    { id: "armadura_obsidiana", tipo: "equipamento", raridade: "epico", nome: "🛡️ Armadura de Obsidiana", preco: 3500, desc: "Equipado: +12 no atributo Resistência (aparece no seu painel)." },
    { id: "colar_arcano", tipo: "equipamento", raridade: "epico", nome: "🔮 Colar do Mago Arcano", preco: 3000, desc: "Equipado: +15 no atributo Inteligência (aparece no seu painel)." }
];

ITENS_LOJA.forEach(i => { if (AJUSTE_ITENS[i.id]) { i.desc = AJUSTE_ITENS[i.id].desc; i.efeitos = AJUSTE_ITENS[i.id].efeitos; i.slot = AJUSTE_ITENS[i.id].slot; } });

/* ---------- CRISTAL DO REPOUSO ---------- */
const ELIXIR_CONFIG = { rankMinimo: 3, materiaisParaDesbloquear: 3, frascosPorLote: 3, custoGold: 1500, custoEssencias: 2, cooldownDias: 30, diasMin: 7, diasMax: 15 };

/* ---------- EXERCÍCIOS & CARDIO ---------- */
const EXERCICIOS = {
    flexoes:      { icone: "💪", normal: "Flexões",      adaptado: "Flexões com Joelho",          xp: 10 },
    abdominais:   { icone: "🧘", normal: "Abdominais",   adaptado: "Abdominais Curtos (Crunch)",  xp: 5 },
    agachamentos: { icone: "🦵", normal: "Agachamentos", adaptado: "Agachamentos no Banco",       xp: 8 }
};

const CARDIO_CONFIG = {
    corrida:   { nome: "Corrida",      icone: "🏃", unidade: "Km",  xp: 150, dano: 10,  casas: 1, padrao: 2 },
    caminhada: { nome: "Caminhada",    icone: "🚶", unidade: "Km",  xp: 100, dano: 6,   casas: 1, padrao: 4 },
    bicicleta: { nome: "Bicicleta",    icone: "🚴", unidade: "min", xp: 14,  dano: 1,   casas: 0, padrao: 20 },
    corda:     { nome: "Pular Corda",  icone: "🪢", unidade: "min", xp: 20,  dano: 1.5, casas: 0, padrao: 10 }
};

/* ---------- PROGRESSÃO: DO EXERCÍCIO ASSISTIDO PARA O PRINCIPAL ---------- */
const PROG_KEYS = ['flexoes', 'agachamentos', 'abdominais', 'corrida'];
const PROG_LIMIAR = { flexoes: 10, agachamentos: 12, abdominais: 15, corrida: 2 };   // meta do assistido para propor a transição
const PROG_SHARE_PRINCIPAL = [0, 0.2, 0.4, 0.6, 0.8]; // por estágio (1 a 4)
const PROG_SHARE_ASSISTIDO = [1, 1.0, 0.8, 0.6, 0.4];
const SUGESTAO_INICIANTE = { flexoes: 8, agachamentos: 12, abdominais: 15, caminhada: 1, bicicleta: 10, corda: 5 };

const BANCO_CHEFES = [
    { id: 0, rankMinimo: 1, rankNome: "RANK D", hpMax: 100, regiao: "Caverna Subterrânea de Seul", nome: "🐍 Vyrassa das Presas Venenosas", xpPremio: 1000, itemDrop: "vyrassa_adaga", desc: "Escamas venenosas! Primeira masmorra de instância para Caçadores Rank D." },
    { id: 1, rankMinimo: 1, rankNome: "RANK D", hpMax: 200, regiao: "Túnel das Raízes Mortas", nome: "🕷️ Aranha Gigante dos Dungeons", xpPremio: 2000, itemDrop: "aranha_teia", desc: "Rainha do ninho de pedra. Agilidade e força extrema requeridas." },
    { id: 2, rankMinimo: 2, rankNome: "RANK C", hpMax: 400, regiao: "Estepes Congeladas do Norte", nome: "❄️ Gorvak da Tribo de Gelo", xpPremio: 4000, itemDrop: "gorvak_lanca", desc: "Comandante das estepes congeladas. Exige nível de Caçador Rank C!" },
    { id: 3, rankMinimo: 2, rankNome: "RANK C", hpMax: 600, regiao: "Vulcão Subterrâneo de Cinzas", nome: "👹 Ignarok o Ganancioso", xpPremio: 6000, itemDrop: "ignarok_machado", desc: "Gigante em chamas com clava devastadora!" },
    { id: 4, rankMinimo: 3, rankNome: "RANK B", hpMax: 850, regiao: "Caverna dos Reflexos Sombrios", nome: "👥 Espectro Espelhado da Caverna Sombria", xpPremio: 8500, itemDrop: "anel_soberano", desc: "Copia seus próprios atributos! Apenas a disciplina de Rank B o vence." },
    { id: 5, rankMinimo: 3, rankNome: "RANK B", hpMax: 1200, regiao: "Torre dos Trovões Demoníacos", nome: "👑 Rei Demônio Zarkhul", xpPremio: 12000, itemDrop: "zarkhul_elmo", desc: "Senhor dos raios do topo da Torre dos Trovões." },
    { id: 6, rankMinimo: 4, rankNome: "RANK A", hpMax: 1600, regiao: "Território Ocupado pelos Orcs", nome: "🧙‍♂️ Mog'Tharn do Clã Orc Rubro", xpPremio: 16000, itemDrop: "mogtharn_manto", desc: "Xamã supremo com magia de gravidade!" },
    { id: 7, rankMinimo: 4, rankNome: "RANK A", hpMax: 2500, regiao: "Arquipélago das Ilhas Cinzentas", nome: "🪲 Zyrrax (O Rei Enxame)", xpPremio: 25000, itemDrop: "zyrrax_coroa", desc: "O predador perfeito do Arquipélago!" },
    { id: 8, rankMinimo: 5, rankNome: "RANK S", hpMax: 4000, regiao: "Fenda Dimensional do Cataclismo", nome: "🐉 Aethraxes (O Dragão Cataclísmico)", xpPremio: 40000, itemDrop: "aethraxes_escama", desc: "O cataclismo em forma de dragão! Poucos Caçadores sobreviveram a ele." },
    { id: 9, rankMinimo: 6, rankNome: "SOBERANO", hpMax: 10000, regiao: "Trono do Caos Dimensional", nome: "💀 Morghul (Soberano da Ruína)", xpPremio: 100000, itemDrop: "morghul_coracao", desc: "O Imperador das Chamas Negras! Desafio supremo do Soberano!" }
];

const BANCO_CONQUISTAS = [
    // ---- Gerais ----
    { cat: "geral", id: "flex_100", titulo: "💪 Primeiros Passos da Força", desc: "Acumular 100 flexões totais no histórico", xp: 200, gold: 300, condicao: (h) => h.totaisAcumulados.flexoes >= 100 },
    { cat: "geral", id: "corr_50", titulo: "🏃 Maratonista das Sombras", desc: "Acumular 50 km de corrida/caminhada", xp: 1000, gold: 800, condicao: (h) => h.totaisAcumulados.corrida >= 50 },
    { cat: "geral", id: "streak_30", titulo: "🔥 Vontade Inabalável", desc: "Alcançar 30 dias de Streak sem interrupção", xp: 2500, gold: 1500, condicao: (h) => h.streakDias >= 30 },
    { cat: "geral", id: "sombra_kaelor", titulo: "🔱 Mestre da Lança Espectral", desc: "Desbloquear a Sombra Kaelor (Rank D)", xp: 1500, gold: 1000, condicao: (h) => h.rankMaximoAlcancado >= 1 || h.rankIndiceAtual >= 1 },

    // ---- Economia & Mercado ----
    { cat: "economia", id: "eco_ganancia", dif: "Fácil", titulo: "🪙 O Preço da Ganância", desc: "Vender o primeiro item de Boss na Loja", xp: 0, gold: 800, tituloGanho: "[ Mercador de Relíquias ]",
      condicao: (h) => (h.vendasBoss || 0) >= 1 },
    { cat: "economia", id: "eco_resgate", dif: "Média", titulo: "🌟 Resgate de Valor", desc: "Recomprar um item de Boss depois de subir de Rank", xp: 600, gold: 500, tituloGanho: "[ Colecionador Verdadeiro ]",
      condicao: (h) => (h.recomprasBoss || 0) >= 1 },
    { cat: "economia", id: "eco_guardiao", dif: "Épico", titulo: "👑 Guardião do Coração", desc: "Derrotar o Boss Final e manter o item dele no seu inventário (sem vendê-lo)", xp: 0, gold: 15000, equipGanho: "anel_desesperado", tituloGanho: "[ Guardião do Coração ]",
      condicao: (h) => (h.inventario || []).includes('morghul_coracao') },

    // ---- Disciplina & Redenção ----
    { cat: "disciplina", id: "disc_limite", dif: "Média", titulo: "🩸 No Limite do Rebaixamento", desc: "Ficar a menos de 500 XP de perder o Rank e conseguir se recuperar (voltar a 1.000 XP acima do mínimo ou subir de Rank)", xp: 800, gold: 600, tituloGanho: "[ Sobrevivente do Abismo ]",
      condicao: (h) => !!h.quaseRebaixado && (h.rankIndiceAtual > (h.quaseRebaixadoRank || 0) || (h.xpTotal - ESCALA_RANKS[h.rankIndiceAtual].xpRequerido) >= 1000) },
    { cat: "disciplina", id: "disc_tentacao", dif: "Difícil", titulo: "🛡️ Resistindo à Tentação", desc: "Completar a Punição da Zona de Penitência 3 vezes seguidas, sem falhar nenhuma", xp: 1200, gold: 0, itemGanho: { campo: "pocoesAlivio", qtd: 1, nome: "🧪 Poção de Alívio Vital" }, tituloGanho: "[ Inabalável ]",
      condicao: (h) => (h.punicoesSeguidas || 0) >= 3 },
    { cat: "disciplina", id: "disc_fenix", dif: "Épico", titulo: "🔥 Evolução Fênix", desc: "Sofrer um rebaixamento de Rank e recuperar o Rank perdido", xp: 2500, gold: 0, itemGanho: { campo: "pergaminhosLigeiro", qtd: 1, nome: "📜 Pergaminho de Treino Ligeiro" }, tituloGanho: "[ O Que Renasce das Cinzas ]",
      condicao: (h) => !!h.fenixConcluido },

    // ---- Mestre das Rupturas ----
    { cat: "rupturas", id: "rup_prioridade", dif: "Fácil / Média", titulo: "🕳️ Prioridade Absoluta", desc: "Fechar uma Ruptura a tempo com as Diárias ainda pendentes", xp: 750, gold: 500, tituloGanho: "[ Invasor de Portais ]",
      condicao: (h) => !!h.rupPrioridade },
    { cat: "rupturas", id: "rup_relogio", dif: "Difícil", titulo: "⏱️ Contra o Relógio", desc: "Concluir uma Ruptura com menos de 10% do tempo restante", xp: 1500, gold: 0, itemGanho: { campo: "elixiresFolego", qtd: 1, nome: "🧪 Elixir do Fôlego Extra" }, tituloGanho: "[ Estrategista do Segundo Final ]",
      condicao: (h) => !!h.rupLimite },
    { cat: "rupturas", id: "rup_multitarefa", dif: "Épico", titulo: "⚡ Multitarefa Imparável", desc: "Fechar uma Ruptura e concluir 100% das Diárias no mesmo dia", xp: 3000, gold: 2500, itemGanho: { campo: "pergaminhosDuplo", qtd: 1, nome: "📜 Pergaminho de XP Duplo" }, tituloGanho: "[ Determinação Inabalável ]",
      condicao: (h) => !!h.rupMultitarefa }
];

const CATEGORIAS_CONQUISTA = {
    geral: "🏆 GERAIS",
    economia: "🟢 ECONOMIA & MERCADO",
    disciplina: "🟡 DISCIPLINA & REDENÇÃO",
    rupturas: "🔴 MESTRE DAS RUPTURAS"
};

function textoRecompensasConquista(c) {
    const p = [];
    if (c.xp) p.push(`🌟 +${c.xp.toLocaleString('pt-BR')} XP`);
    if (c.gold) p.push(`🪙 +${c.gold.toLocaleString('pt-BR')} Gold`);
    if (c.ph) p.push(`🌳 +${c.ph} ponto(s) de habilidade`);
    if (c.itemGanho) p.push(c.itemGanho.nome);
    if (c.equipGanho) {
        const it = BANCO_ITENS.find(i => i.id === c.equipGanho);
        if (it) p.push(`⚔️ ${it.nome}`);
    }
    if (c.tituloGanho) p.push(`🏷️ Título ${c.tituloGanho}`);
    return p.join(' · ');
}

function textoEfeitoRecompensasConquista(c) {
    const linhas = [];
    if (c.itemGanho) linhas.push(`${c.itemGanho.nome}: ${descricaoConsumivel(c.itemGanho.campo)}`);
    if (c.equipGanho) {
        const it = BANCO_ITENS.find(i => i.id === c.equipGanho);
        if (it) linhas.push(`${it.nome}: ${it.desc}`);
    }
    if (c.tituloGanho) linhas.push(`${c.tituloGanho}: ${tituloDescricao(c.tituloGanho)}`);
    return linhas;
}

// Explicação em português simples dos consumáveis especiais
function descricaoConsumivel(campo) {
    const d = {
        pocoesAlivio: "Nos próximos 2 treinos suas metas caem 35%, mas o XP conta como se fosse a meta cheia. Só pode ser usada com Fadiga a partir de 50%, com 7 dias de espera entre usos.",
        pergaminhosLigeiro: "Seus próximos 3 treinos concluídos rendem 1,5x de XP. Ativa na Bolsa.",
        pergaminhosDuplo: "O próximo treino concluído rende 2x de XP. Ativa na Bolsa.",
        elixiresFolego: "Adiciona +5 minutos ao relógio de uma Ruptura ou Masmorra Temporária que esteja ativa.",
        descansosRemunerados: "Um dia de descanso de verdade: você não treina, o Streak é mantido, recebe 50% do XP do treino do dia e a Fadiga cai 25%."
    };
    return d[campo] || "";
}

const BANCO_DESAFIOS_RANK = {
    0: { xp: 100, lista: ["Realize 10 Polichinelos rápidos!", "Segure 30 Segundos de Prancha!", "Faça 10 Agachamentos lentos!"] },
    1: { xp: 200, lista: ["Realize 15 Flexões Diamante!", "Segure 45 Segundos de Prancha!", "Faça 15 Agachamentos com Salto!"] },
    2: { xp: 400, lista: ["Realize 20 Flexões Fechadas!", "Segure 1 Minuto de Prancha!", "Faça 25 Abdominais Infra!"] },
    3: { xp: 800, lista: ["Realize 25 Flexões Bate-Palma!", "Segure 1m30s de Prancha!", "Faça 30 Agachamentos Búlgaros!"] },
    4: { xp: 1500, lista: ["Realize 30 Burpees Explosivos!", "Segure 2 Minutos de Prancha!", "Faça 40 Flexões em Declive!"] },
    5: { xp: 3000, lista: ["Realize 50 Burpees Sem Pausa!", "Segure 3 Minutos de Prancha!", "Faça 60 Agachamentos Profundos!"] },
    6: { xp: 5000, lista: ["Realize 100 Burpees do Soberano!", "Segure 5 Minutos de Prancha de Aço!", "Faça 100 Flexões de Soberano!"] }
};

/* ---------- ESTADO DO CAÇADOR ---------- */
const HUNTER_PADRAO = {
    nome: "",
    altura: 0,
    peso: 0,
    xpTotal: 0,
    xpUltimoDia: 0,
    gold: 0,
    fadiga: 0,
    streakDias: 0,
    sorosRecuperacao: 1,
    chavesMasmorra: 1,
    pedrasPolimento: 0,
    elixires: 0,
    essenciasMana: 0,
    materiaisBoss: 0,
    elixirDesbloqueado: false,
    ultimaForjaElixir: null,
    elixirAtivoAte: null,
    tituloEquipado: "[ O Desperto ]",
    titulosColecao: ["[ O Desperto ]"],
    forca: 10,
    agilidade: 10,
    vitalidade: 10,
    resistencia: 10,
    inteligencia: 10,
    aguaIngerida: 0.0,
    metaAgua: 3.0,
    bonusAguaResgatadoHoje: false,
    capacidade: { flexoes: true, abdominais: true, agachamentos: true, corrida: true },
    cardioTipo: "corrida",
    maximos: { flexoes: 10, abdominais: 30, agachamentos: 30, corrida: 2, leitura: 10 },
    metasCalculadas: { flexoes: 8, abdominais: 24, agachamentos: 24, corrida: 1.6, leitura: 10 },
    totaisAcumulados: { flexoes: 0, corrida: 0, abdominais: 0, agachamentos: 0, leitura: 0 },
    inventario: [],
    itemEquipadoId: null,
    equipados: { arma: null, cabeca: null, corpo: null, maos_pes: null, acess1: null, acess2: null },
    pedraAdiamentoUsado: false,
    bossAdiado: false,
    pedraCicloRecebido: null,
    fadigaAvisoDia: null,
    fadigaReduzirProx: false,
    fadigaFolgaBonus: 0,
    folgaProximoDia: false,
    fadigaReducaoAtiva: false,
    folgaBonusAtivo: false,
    zonaAvisoFds: false,
    progAlt: {},
    retornoRankAtivo: false,
    dataCadastro: null,
    config: { som: true, vibracao: true, movReduzido: null, notificacoes: false, horaLembrete: '19:00', ultimoBackup: null, avisoBackupDia: null, notifDia: null },
    historico: { dias: {}, recordes: {} },
    bossFinalDerrotado: false,
    ecoVitorias: 0,
    pontosHabilidade: 0,
    arvore: [],
    arvoreMigrada: false,
    arvoreGanhos: 0,
    ultimaRecalibracao: null,
    recalAdiadaAte: null,
    semanal: { chave: null, missoes: [], perfeita: false, rerolls: 0 },
    semanasPerfeitas: 0,
    marcosStreak: [],
    retroVistaMes: null,
    recuperacao: { ativa: false, inicio: null, fim: null, motivo: null, proxima: null, retornoRestante: 0 },
    rupturaTipo: 'normal',
    rupturaAlvoTipo: null,
    rupturasVermelhas: 0,
    molduras: [],
    molduraEquipada: null,
    habilidades: {},
    buffTitulo: null,
    escudoAco: false,
    sombrasNivel: {},
    missoesSombras: {},
    buffSombras: 1,
    bossVencidoDia: null,
    conquistasDesbloqueadas: [],
    bossIndiceAtual: 0,
    bossHpAtual: 100,
    bossMetasCongeladas: null,
    bossCombateAtivo: false,
    bossCongeladoAteData: null,
    bossReaberturaPendente: false,
    cicloBossConcluido: null,
    rankDatas: {},
    bossAdiadoAvisoCiclo: null,
    avisoBossVistoCiclo: null,
    recuperacaoPreBossAplicada: null,
    preparatoriaAtiva: false,
    avisoBossSemanaiAtivo: false,
    fatorDificuldadeAjustado: null,
    diariaConcluida: false,
    folgaRegistradaFimDeSemana: false,
    ultimaFolgaFdsData: null,
    ultimoDiaConcluido: null,
    zonaPunicao: false,
    rankIndiceAtual: 0,
    isDev: false,
    dataSimuladaDev: null,
    rupturaAtiva: false,
    rupturaDuracaoMs: 0,
    ultimaRupturaDia: null,
    rupturaAlvoDia: null,
    rupturaAlvoHora: null,
    rupturaFechadaDia: null,
    rupPrioridade: false,
    rupLimite: false,
    rupMultitarefa: false,
    extensaoDiaMs: 0,
    extensaoDiaRef: null,
    calibracao: null,
    pausaDiariasInicio: null,
    zonaXpTreino: 0,
    zonaPerdaEntrada: 0,
    // Relatório de imprevisto de hoje (pesado / soro / tempo): esconde as missões do dia e mostra a explicação
    justificativaHoje: null,
    // Escada do "estava muito pesado": multiplicador das metas (0.5 a 1) e as perguntas "como foi?" depois de cada treino
    ajusteMetaPct: 1,
    ajusteMetaPerguntar: false,
    ajusteMetaAguardaResposta: false,
    genero: 'nao_informar',
    avatarRank: null,
    moldurasRankInit: false,
    avisoAvatarV32: false,
    variacoes: { v: {}, pausa: {}, pausaAte: {}, recusadas: {}, aviso: false },
    rupturaDesafio: null,
    punicoesSeguidas: 0,
    ultimoTreinoRealDia: null,
    rankMaximoAlcancado: 0,
    rankPerdido: null,
    fenixConcluido: false,
    quaseRebaixado: false,
    quaseRebaixadoRank: 0,
    sombrasExtraidas: [],
    vendasBoss: 0,
    recomprasBoss: 0,
    vendeuBossFinal: false,
    itensEnfraquecidos: [],
    itensVendidosBoss: [],
    itensDeletados: [],
    pocoesAlivio: 0,
    cargaAliviadaRestante: 0,
    cargaAliviadaAtiva: false,
    cargaAliviadaUltimoUso: null,
    descansosRemunerados: 0,
    descansoPagoHoje: false,
    ultimoMesDescanso: null,
    pergaminhosLigeiro: 0,
    pergaminhosDuplo: 0,
    buffLigeiroRestante: 0,
    buffDuploRestante: 0,
    elixiresFolego: 0,
    rupturaFimData: null,
    dataSimuladaRef: null,
    bossProgresso: { flexoes: 0, corrida: 0, abdominais: 0, agachamentos: 0, leitura: 0 },
    bossFimData: null,
    cicloBossAberto: null,
    zonaPunicaoEtapa: null,
    sombraPendenteParaExtrair: null,
    sombrasPendentes: [],
    jobChangeProgresso: 0,
    jobChangeConcluido: false,
    masmorraTempAtiva: false,
    masmorraTempAceita: false,
    masmorraTempFimData: null,
    masmorraTempConfirmacoes: { flexDiamante: false, polichinelos: false, abdInfra: false },
    execucoesDigitadas: { flexoes: 0, corrida: 0, abdominais: 0, agachamentos: 0, leitura: 0 },
    confirmacoesEx: { flexoes: false, corrida: false, abdominais: false, agachamentos: false, leitura: false }
};

let hunter = JSON.parse(JSON.stringify(HUNTER_PADRAO));

let abaBolsaAtual = 'consumiveis';
let estagioSombra = 'oculta';
let modoDevAvisoBoss = false;
let timerAlertaOvertraining = null;

/* ---------- UTILITÁRIOS ---------- */
function mesclarProfundo(base, extra) {
    Object.keys(extra).forEach(k => {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') return; // save/backup adulterado não pode alterar o protótipo dos objetos
        const v = extra[k];
        if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
            mesclarProfundo(base[k], v);
        } else {
            base[k] = v;
        }
    });
    return base;
}

/* ---------- RELÓGIO DO JOGO (REAL x PAUSADO PELAS RUPTURAS/MASMORRAS) ---------- */
function obterDataReal() {
    if (!hunter.isDev || !hunter.dataSimuladaDev) return new Date();   // data simulada só no modo dev
    // Data simulada (Dev) também corre em tempo real: segundos, minutos e horas passam normalmente
    if (!hunter.dataSimuladaRef) hunter.dataSimuladaRef = Date.now();
    return new Date(new Date(hunter.dataSimuladaDev).getTime() + (Date.now() - hunter.dataSimuladaRef));
}

// Data do "dia de treino": para enquanto uma Ruptura/Masmorra está ativa e continua de onde parou
// BETA (opção B): o tempo pausado só ESTENDE o dia do jogo em que a Ruptura/Fenda aconteceu.
// Quando esse dia termina, o atraso é zerado e o jogo volta a acompanhar a meia-noite real (sem acumular atraso para sempre).
function obterDataAtual() {
    const real = obterDataReal().getTime();
    const pausado = hunter.pausaDiariasInicio ? Math.max(0, real - hunter.pausaDiariasInicio) : 0;
    let ext = hunter.extensaoDiaMs;
    if (!Number.isFinite(ext) || ext < 0) { ext = 0; hunter.extensaoDiaMs = 0; }
    if (ext > 0 && !pausado) {
        const g = new Date(real - ext);
        const diaJogo = soData(g).getTime();
        if (!hunter.extensaoDiaRef || !Number.isFinite(new Date(hunter.extensaoDiaRef).getTime())) {
            hunter.extensaoDiaRef = new Date(diaJogo).toISOString(); // save antigo ou sem marca: o atraso vale até o fim do dia atual do jogo
        } else if (diaJogo > new Date(hunter.extensaoDiaRef).getTime()) {
            // o dia do jogo que recebeu a extensão já acabou: realinha com o relógio real, desde que isso não pule nenhum dia
            const fimDoDia = new Date(g.getFullYear(), g.getMonth(), g.getDate() + 1).getTime() - 1;
            if (real <= fimDoDia) { hunter.extensaoDiaMs = 0; hunter.extensaoDiaRef = null; ext = 0; }
            else hunter.extensaoDiaRef = new Date(diaJogo).toISOString(); // app reaberto tarde: tenta de novo na próxima virada
        }
    }
    return new Date(real - ext - pausado);
}

function sincronizarPausaDiarias() {
    const deve = !!(hunter.rupturaAtiva || (hunter.masmorraTempAtiva && hunter.masmorraTempAceita));
    const real = obterDataReal().getTime();
    if (deve && !hunter.pausaDiariasInicio) {
        hunter.pausaDiariasInicio = real;
        salvarDados();
        adicionarMsgChat("⏸️ [MISSÕES DIÁRIAS PAUSADAS]: foco total na Ruptura/Masmorra! O relógio do treino diário parou e volta exatamente de onde parou.");
    } else if (!deve && hunter.pausaDiariasInicio) {
        hunter.extensaoDiaMs = (hunter.extensaoDiaMs || 0) + Math.max(0, real - hunter.pausaDiariasInicio);
        hunter.pausaDiariasInicio = null;
        if (!hunter.extensaoDiaRef) hunter.extensaoDiaRef = soData(new Date(real - hunter.extensaoDiaMs)).toISOString(); // dia do jogo que ganhou a extensão
        salvarDados();
        adicionarMsgChat("▶️ [MISSÕES DIÁRIAS RETOMADAS]: o relógio do treino voltou de onde parou.");
    }
}

function soData(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function diffDias(a, b) {
    return Math.round((soData(a) - soData(b)) / 86400000);
}

function ehFimDeSemanaAtual() {
    const d = obterDataAtual().getDay();
    return d === 0 || d === 6;
}

function fmtAttr(v) {
    const n = Number(v) || 0;
    return Number.isInteger(n) ? n : n.toFixed(1);
}

function cardioCfg() {
    return CARDIO_CONFIG[hunter.cardioTipo] || CARDIO_CONFIG.corrida;
}

function nomeExercicio(chave) {
    const e = EXERCICIOS[chave];
    return hunter.capacidade[chave] === false ? e.adaptado : e.normal;
}

function multEquip(item) {
    return (hunter.itensEnfraquecidos || []).includes(item.id) ? 0.6 : 1;
}

function itensEquipados() {
    const eq = hunter.equipados || {};
    return Object.keys(SLOTS_EQUIP).map(s => eq[s]).filter(Boolean)
        .map(id => BANCO_ITENS.find(i => i.id === id)).filter(Boolean);
}

// Soma um tipo de efeito de todos os itens equipados (itens recomprados valem 60%)
function efeitoEquip(tipo) {
    return itensEquipados().reduce((s, it) => s + (((it.efeitos || {})[tipo]) || 0) * multEquip(it), 0) + bonusConjuntos(tipo);
}

function bonusEquipado(tipo) {
    return tipo === "forca_mult" ? efeitoEquip("forca_ganho") : 0;
}

function bonusXpGlobalEquipado() {
    return Math.min(TETO_XP_EQUIP, efeitoEquip("xp_global"));
}

// Teto ÚNICO de 60%: bônus global + bônus por atributo + conjuntos somados nunca passam de +60% de XP
function bonusXpEquipamento(valid) {
    return Math.min(TETO_XP_EQUIP, efeitoEquip('xp_global') + fracaoBonusAtributos(valid, efeitoEquip, true));
}

// Fração extra de XP vinda dos bônus por atributo (Força, Agilidade, Resistência, Inteligência)
function fracaoBonusAtributos(valid, fonte, semTeto) {
    const f = fonte || efeitoEquip;
    const cfg = cardioCfg();
    const adapt = (k) => (hunter.capacidade[k] === false ? 0.5 : 1);
    const x = {
        forca: valid.flexoes * EXERCICIOS.flexoes.xp * adapt('flexoes') + (valid.flexoes_p || 0) * EXERCICIOS.flexoes.xp + xpVariacaoDe('flexoes', valid),
        agilidade: Math.round(valid.corrida * cfg.xp * adapt('corrida')) + Math.round((valid.corrida_p || 0) * CARDIO_CONFIG.corrida.xp),
        resistencia: valid.abdominais * EXERCICIOS.abdominais.xp * adapt('abdominais') + valid.agachamentos * EXERCICIOS.agachamentos.xp * adapt('agachamentos')
            + (valid.abdominais_p || 0) * EXERCICIOS.abdominais.xp + (valid.agachamentos_p || 0) * EXERCICIOS.agachamentos.xp
            + xpVariacaoDe('abdominais', valid) + xpVariacaoDe('agachamentos', valid),
        inteligencia: valid.leitura * 15
    };
    const total = x.forca + x.agilidade + x.resistencia + x.inteligencia;
    if (total <= 0) return 0;
    const bruto = ['forca', 'agilidade', 'resistencia', 'inteligencia'].reduce((s, k) => s + x[k] * f('xp_' + k), 0) / total;
    return semTeto ? bruto : Math.min(TETO_XP_EQUIP, bruto);
}

function descontoLoja() { return Math.min(0.25, efeitoTitulo('desconto_loja') + efeitoEquip('desconto_loja') + efeitoArvore('desconto_loja')); }
function bonusVenda() { return Math.min(0.30, efeitoTitulo('bonus_venda') + efeitoEquip('bonus_venda')); }

// Anel do Desesperado: metas maiores (mais treino de verdade)
function fatorDesespero() { return 1 + efeitoEquip('desespero'); }

function desequiparItem(id) {
    const eq = hunter.equipados;
    Object.keys(SLOTS_EQUIP).forEach(s => { if (eq[s] === id) eq[s] = null; });
}

function estaEquipado(id) { return Object.values(hunter.equipados || {}).includes(id); }

function verificarAnelDesespero() {
    if (fatorDesespero() > 1 && (hunter.fadiga || 0) >= 80) {
        itensEquipados().filter(i => (i.efeitos || {}).desespero).forEach(i => desequiparItem(i.id));
        recalcularMetasDoRank();
        salvarDados();
        adicionarMsgChat("💍 [ANEL DO DESESPERADO]: sua Fadiga chegou a 80% — o anel se desequipou sozinho para proteger você. Descanse e equipe-o de novo depois.");
    }
}

function migrarEquipamentos() {
    if (!hunter.equipados) hunter.equipados = { arma: null, cabeca: null, corpo: null, maos_pes: null, acess1: null, acess2: null };
    if (hunter.itemEquipadoId) {
        const it = BANCO_ITENS.find(i => i.id === hunter.itemEquipadoId);
        if (it && !estaEquipado(it.id)) colocarNoSlot(it);
        hunter.itemEquipadoId = null;
    }
}

function colocarNoSlot(it) {
    const eq = hunter.equipados;
    if (it.slot === 'acessorio') {
        if (!eq.acess1) eq.acess1 = it.id;
        else if (!eq.acess2) eq.acess2 = it.id;
        else eq.acess1 = it.id; // ambos cheios: substitui o primeiro
    } else {
        eq[it.slot || 'arma'] = it.id;
    }
}

// Sombras já convocadas (continuam no sua Legião mesmo se você for rebaixado)
function sombrasExtraidas() {
    const r = [];
    const max = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);
    for (let i = 1; i <= max; i++) {
        if (SOMBRAS_DATA[i] && ESCALA_RANKS[i].sombra && !(hunter.sombrasPendentes || []).includes(i)) r.push(i);
    }
    return r;
}

function sombraAtiva(i) { return (hunter.rankIndiceAtual || 0) >= i; }

function bonusSombra(tipo) {
    const b = sombrasExtraidas().filter(sombraAtiva).reduce((s, i) => s + (((SOMBRAS_DATA[i] || {}).bonus || {})[tipo] || 0), 0);
    return tipo === 'xp' ? b * (1 + efeitoArvore('sombras_mult')) : b;
}

// Redução de perdas de XP: sombra Muralha (Rank B) + título equipado
function mitigarPerdaXp(qtd) {
    const m = Math.min(0.6, bonusSombra('penalidade') + efeitoTitulo('mitiga_penalidade') + efeitoArvore('mitiga_penalidade'));
    return Math.round(qtd * (1 - m));
}

/* ---------- ITENS DE BOSS: VENDA E RECOMPRA ---------- */
function chefeDoItem(id) { return BANCO_CHEFES.find(c => c.itemDrop === id) || null; }
function ehChefeFinal(c) { return c.id === BANCO_CHEFES.length - 1; }
const VALOR_VENDA_BOSS = { 0: 2500, 1: 4000, 2: 7000, 3: 11000, 4: 18000, 5: 30000, 6: 50000, 7: 80000, 8: 130000, 9: 1000000 };
function valorBaseVendaBoss(id) { const c = chefeDoItem(id); return c ? VALOR_VENDA_BOSS[c.id] : 0; }
// Quanto o jogador RECEBE ao vender (com bônus de venda de títulos/itens)
function valorVendaBoss(id) { return Math.round(valorBaseVendaBoss(id) * (1 + bonusVenda())); }
// Quanto CUSTA recomprar: 400% do valor pelo qual foi vendido (com desconto da Loja)
function precoRecompraBoss(id) { return Math.round(valorBaseVendaBoss(id) * 4 * (1 - descontoLoja())); }
function rankRecompraBoss(id) { const c = chefeDoItem(id); return c ? c.rankMinimo + 1 : 99; }
function precoLoja(item) { return Math.round(item.preco * (1 - descontoLoja() - (hunter.buffTitulo === 'barganha' ? 0.10 : 0))); }

function chefeAtual() {
    if (hunter.bossFinalDerrotado) return chefeEco();
    return BANCO_CHEFES[Math.min(hunter.bossIndiceAtual, BANCO_CHEFES.length - 1)];
}

/* ---------- CALENDÁRIO DO BOSS MENSAL ---------- */
function ultimoSabadoDoMes(ano, mes) {
    const d = new Date(ano, mes + 1, 0);
    // limite de 7 voltas: com data inválida (NaN) o laço nunca terminaria e travaria a página
    for (let i = 0; i < 7 && d.getDay() !== 6; i++) d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function infoCalendarioBoss(data) {
    const hoje = soData(data);
    let alvo = ultimoSabadoDoMes(hoje.getFullYear(), hoje.getMonth());
    if (diffDias(hoje, alvo) > 1) {
        alvo = ultimoSabadoDoMes(hoje.getFullYear(), hoje.getMonth() + 1);
    }
    const dias = diffDias(alvo, hoje); // dias até o sábado da raid
    let fase = 'normal';
    if (dias === 0 || dias === -1) fase = 'boss';
    else if (dias === 1) fase = 'sexta-pre';
    else if (dias >= 2 && dias <= 5) fase = 'preparatoria';
    return { alvo, dias, fase, avisoPrevio: (dias >= 1 && dias <= 7), ciclo: alvo.toDateString() };
}

function bossFreezeAtivo(dataAtual) {
    return !!(hunter.bossCongeladoAteData && dataAtual < new Date(hunter.bossCongeladoAteData));
}

// BETA: carência de preparo. O Boss do mês só chega se o jogador já treinou o bastante antes do sábado da Raid:
//  - pelo menos 14 dias desde que confirmou o plano da calibração (uma reavaliação inteira)
//  - pelo menos 7 dias desde que alcançou o Rank exigido por este Boss
// Quem não cumpre fica com a Raid adiada para o mês seguinte (sem semana preparatória nem sexta de descanso neste ciclo).
const BOSS_CARENCIA_ENTRADA_DIAS = 14;
const BOSS_CARENCIA_RANK_DIAS = 7;
function bossMotivoAdiamento(info) {
    const chefe = chefeAtual();
    const alvo = soData(info.alvo);
    const cal = hunter.calibracao;
    if (cal && cal.concluida && cal.fim) {
        const ini = new Date(cal.fim);
        if (!isNaN(ini.getTime())) {
            const dias = diffDias(alvo, soData(ini));
            if (dias < BOSS_CARENCIA_ENTRADA_DIAS) return { tipo: 'entrada', faltam: BOSS_CARENCIA_ENTRADA_DIAS - dias };
        }
    }
    const rd = hunter.rankDatas && hunter.rankDatas[chefe.rankMinimo];
    if (rd) {
        const dr = new Date(rd);
        if (!isNaN(dr.getTime())) {
            const dias = diffDias(alvo, soData(dr));
            if (dias < BOSS_CARENCIA_RANK_DIAS) return { tipo: 'rank', faltam: BOSS_CARENCIA_RANK_DIAS - dias };
        }
    }
    return null;
}

// Avisa uma vez por ciclo que a Raid foi adiada (só quando o jogador já tem o Rank e a Raid está na janela de aviso)
function checarAdiamentoBoss() {
    try {
        const info = infoCalendarioBoss(obterDataAtual());
        if (!info.avisoPrevio || hunter.bossCombateAtivo || sistemaCongelado() || bossFreezeAtivo(obterDataAtual())) return;
        if (hunter.rankIndiceAtual < chefeAtual().rankMinimo || info.ciclo === hunter.cicloBossConcluido) return;
        if (hunter.bossAdiadoAvisoCiclo === info.ciclo) return;
        const m = bossMotivoAdiamento(info);
        if (!m) return;
        hunter.bossAdiadoAvisoCiclo = info.ciclo;
        salvarDados();
        const porque = m.tipo === 'entrada'
            ? 'Você começou a jornada há pouco tempo e o Sistema quer que você treine pelo menos 2 semanas antes de enfrentar um Boss.'
            : 'Você alcançou o Rank exigido há poucos dias e precisa de pelo menos 1 semana nele para estar preparado.';
        const msg = `⏳ [RAID ADIADA]\n\nA Raid de ${chefeAtual().nome} deste mês foi adiada para o próximo mês.\n\n${porque}\n\nSem pressa: neste mês você segue o treino normal, sem semana preparatória e sem a sexta de descanso. O Boss espera por você.`;
        adicionarMsgChat('⏳ [RAID ADIADA]: o Sistema adiou a Raid deste mês para o próximo, para você chegar mais preparado. Siga o treino normal.');
        avisarJogo(msg);
    } catch (e) { console.error(e); }
}

function bossDisponivel(info) {
    const chefe = chefeAtual();
    if (hunter.rankIndiceAtual < chefe.rankMinimo) return false;
    if (bossFreezeAtivo(obterDataAtual())) return false;
    if (info.ciclo === hunter.cicloBossConcluido) return false;
    if (bossMotivoAdiamento(info)) return false;
    return true;
}

function sistemaCongelado() {
    return !!(hunter.elixirAtivoAte && obterDataAtual() < new Date(hunter.elixirAtivoAte));
}

function obterEstadoDia() {
    const dataAtual = obterDataAtual();
    const dia = dataAtual.getDay();
    const info = infoCalendarioBoss(dataAtual);
    return {
        info,
        ehFDS: (dia === 0 || dia === 6),
        frozen: sistemaCongelado(),
        descansoBoss: (!hunter.bossCombateAtivo && info.fase === 'sexta-pre' && bossDisponivel(info)),
        folga: !!hunter.folgaRegistradaFimDeSemana && !hunter.bossCombateAtivo,
        zonaAguardando: !!(hunter.zonaPunicao && hunter.zonaPunicaoEtapa === 'aguardando' && !hunter.bossCombateAtivo),
        justificado: !!(justificativaDeHoje() && !hunter.bossCombateAtivo),
        pausado: !!hunter.pausaDiariasInicio,
        bossVencidoHoje: hunter.bossVencidoDia === dataAtual.toDateString() && !hunter.bossCombateAtivo,
        calibracaoHoje: !!(hunter.calibracao && hunter.calibracao.concluida && hunter.calibracao.fimDia === dataAtual.toDateString() && !hunter.bossCombateAtivo),
        boss: estadoBoss(),
        bloqueioFadiga: false // V30.1: não trava mais; aos 95% o jogador responde a uma caixa de alerta
    };
}


/* ---------- ESTADO DO BOSS (visibilidade do card) ---------- */
function estadoBoss() {
    const r = { visivel: false, ativo: false, pendente: false };
    if (sistemaCongelado()) return r;
    if (hunter.bossCombateAtivo) { r.visivel = true; r.ativo = true; return r; }

    const dataAtual = obterDataAtual();
    if (bossFreezeAtivo(dataAtual)) return r;

    const info = infoCalendarioBoss(dataAtual);
    const chefe = chefeAtual();
    const ehFDS = (dataAtual.getDay() === 0 || dataAtual.getDay() === 6);
    const temRank = (hunter.rankIndiceAtual >= chefe.rankMinimo);
    const diaBoss = (info.fase === 'boss' && info.ciclo !== hunter.cicloBossConcluido && temRank && !bossMotivoAdiamento(info));
    const reabertura = (hunter.bossReaberturaPendente && ehFDS && temRank);

    if ((diaBoss || reabertura) && !hunter.diariaConcluida) {
        r.visivel = true;
        r.pendente = true;
    }
    return r;
}

/* ---------- XP DO TREINO / PENALIDADES DE XP ---------- */
function xpBrutoExercicios(valid) {
    const cfg = cardioCfg();
    const adapt = (k) => (hunter.capacidade[k] === false ? 0.5 : 1);
    return (valid.flexoes * EXERCICIOS.flexoes.xp * adapt('flexoes'))
        + (valid.agachamentos * EXERCICIOS.agachamentos.xp * adapt('agachamentos'))
        + (valid.abdominais * EXERCICIOS.abdominais.xp * adapt('abdominais'))
        + Math.round(valid.corrida * cfg.xp * adapt('corrida'))
        // Séries do exercício principal na transição: 100% do XP
        + ((valid.flexoes_p || 0) * EXERCICIOS.flexoes.xp)
        + ((valid.agachamentos_p || 0) * EXERCICIOS.agachamentos.xp)
        + ((valid.abdominais_p || 0) * EXERCICIOS.abdominais.xp)
        + Math.round((valid.corrida_p || 0) * CARDIO_CONFIG.corrida.xp)
        // V33: variações mais difíceis (1 repetição vale mais, + bônus pequeno por grau)
        + xpVariacaoDe('flexoes', valid) + xpVariacaoDe('agachamentos', valid) + xpVariacaoDe('abdominais', valid);
}

function xpBaseDoTreino(valid) {
    let xpEx = xpBrutoExercicios(valid);
    // Semana Preparatória: volume -25%, mas mantém 100% do XP
    if (hunter.preparatoriaAtiva) xpEx = Math.round(xpEx / 0.75);
    else if (hunter.cargaAliviadaAtiva) xpEx = Math.round(xpEx * (hunter.razaoAliviada || (1 / 0.65))); // Carga Aliviada: metas -35%, XP 100%
    return Math.round(xpEx) + (valid.leitura * 15);
}

function xpTotalDasMetas() {
    const m = hunter.metasCalculadas;
    return xpBaseDoTreino({ flexoes: m.flexoes, agachamentos: m.agachamentos, abdominais: m.abdominais, corrida: m.corrida, leitura: m.leitura,
        flexoes_p: m.flexoes_p || 0, agachamentos_p: m.agachamentos_p || 0, abdominais_p: m.abdominais_p || 0, corrida_p: m.corrida_p || 0,
        flexoes_v: m.flexoes_v || 0, agachamentos_v: m.agachamentos_v || 0, abdominais_v: m.abdominais_v || 0 });
}

// XP REAL que o treino de hoje renderia ao cumprir as metas: base + equipamentos (teto 60%) + árvore + Sombras.
// (Consumíveis de uso único não entram: não são garantidos.) É a base de cálculo das perdas da Zona de Penitência.
function xpPrevistoDoTreino() {
    const m = hunter.metasCalculadas;
    const valid = { flexoes: m.flexoes, agachamentos: m.agachamentos, abdominais: m.abdominais, corrida: m.corrida, leitura: m.leitura,
        flexoes_p: m.flexoes_p || 0, agachamentos_p: m.agachamentos_p || 0, abdominais_p: m.abdominais_p || 0, corrida_p: m.corrida_p || 0,
        flexoes_v: m.flexoes_v || 0, agachamentos_v: m.agachamentos_v || 0, abdominais_v: m.abdominais_v || 0 };
    const mult = 1 + bonusXpEquipamento(valid) + bonusXpArvore(valid, 1, true) + bonusSombra('xp');
    return Math.round(xpBaseDoTreino(valid) * mult);
}

// Entrada na Zona: perde AUTOMATICAMENTE 50% do XP real do treino (menos a mitigação de Muralha/título/árvore, se houver)
function aplicarPerdaEntradaZona() {
    const treino = xpPrevistoDoTreino();
    const bruta = Math.round(treino * 0.5);
    const mitigada = mitigarPerdaXp(bruta);
    const perdido = descontarXp(mitigada);
    hunter.zonaXpTreino = treino;
    hunter.zonaPerdaEntrada = perdido;
    return { treino, bruta, mitigada, perdido };
}

// Explica de forma honesta por que a perda foi menor que 50% do treino (proteção do jogador e/ou pouco XP disponível)
function textoMotivoPerdaMenor(r) {
    const partes = [];
    if (r.bruta > r.mitigada) partes.push(`sua proteção evitou ${(r.bruta - r.mitigada).toLocaleString('pt-BR')} XP`);
    if (r.mitigada > r.perdido) partes.push(`você só tinha ${r.perdido.toLocaleString('pt-BR')} XP para perder`);
    return partes.length ? `; ${partes.join(' e ')}` : '';
}

// Proteção de iniciante: quem ainda não ganhou nenhum XP não tem nada a perder, então a Zona não faz sentido
function protegidoDeIniciante() {
    return (hunter.xpTotal || 0) <= 0 && !hunter.zonaPunicao && !hunter.bossCombateAtivo;
}

// XP total que a meta da Raid (metas x1.75) valeria, mesmo que o boss ainda não tenha sido aceito
function xpDasMetasDoBoss() {
    const ativoAntes = hunter.bossCombateAtivo;
    const metasAntes = { ...hunter.metasCalculadas };
    const congeladas = hunter.bossMetasCongeladas;
    const prepAntes = hunter.preparatoriaAtiva;
    const aliviadaAntes = hunter.cargaAliviadaAtiva;
    hunter.bossCombateAtivo = true;
    hunter.bossMetasCongeladas = null;
    recalcularMetasDoRank();
    const xp = xpTotalDasMetas();
    hunter.bossCombateAtivo = ativoAntes;
    hunter.bossMetasCongeladas = congeladas;
    hunter.metasCalculadas = metasAntes;
    hunter.preparatoriaAtiva = prepAntes;
    hunter.cargaAliviadaAtiva = aliviadaAntes;
    return xp;
}

function rankPorXp(xp) {
    let r = 0;
    for (let i = 0; i < ESCALA_RANKS.length; i++) if (xp >= ESCALA_RANKS[i].xpRequerido) r = i;
    return r;
}

// Rebaixamento: se o XP cair abaixo do mínimo do Rank, o jogador regride (até o Rank inicial com 0 XP)
function verificarRebaixamento() {
    const novo = rankPorXp(hunter.xpTotal);
    if (novo >= hunter.rankIndiceAtual) return false;
    const antigo = hunter.rankIndiceAtual;
    hunter.rankPerdido = Math.max(hunter.rankPerdido == null ? 0 : hunter.rankPerdido, antigo);
    hunter.rankIndiceAtual = novo;
    if (hunter.rankDatas) Object.keys(hunter.rankDatas).forEach(k => { if (Number(k) > novo) delete hunter.rankDatas[k]; });
    hunter.quaseRebaixado = false;
    if (hunter.tituloEquipado === ESCALA_RANKS[antigo].titulo) hunter.tituloEquipado = ESCALA_RANKS[novo].titulo;
    recalcularMetasDoRank();
    salvarDados();
    atualizarLegiãoSombras();
    adicionarMsgChat(`📉 [REBAIXAMENTO DE RANK]: suas perdas de XP derrubaram você de ${ESCALA_RANKS[antigo].nome} para ${ESCALA_RANKS[novo].nome}. Recupere o XP para voltar!`);
    avisarJogo(`📉 [REBAIXAMENTO DE RANK]\n\nVocê caiu de ${ESCALA_RANKS[antigo].nome} para ${ESCALA_RANKS[novo].nome}.\nVolte a ganhar XP para recuperar o Rank perdido.`);
    return true;
}

// Desconta XP (pode rebaixar o Rank). Retorna quanto foi realmente descontado.
function descontarXp(qtd) {
    const antes = hunter.xpTotal || 0;
    hunter.xpTotal = Math.max(0, antes - Math.max(0, qtd));
    const perdido = antes - hunter.xpTotal;
    const rankAntes = hunter.rankIndiceAtual;
    verificarRebaixamento();
    if (hunter.rankIndiceAtual === rankAntes && rankAntes > 0) {
        const margem = hunter.xpTotal - ESCALA_RANKS[rankAntes].xpRequerido;
        if (margem < 500) { hunter.quaseRebaixado = true; hunter.quaseRebaixadoRank = rankAntes; }
    }
    return perdido;
}

function registrarXpDoDia(qtd) {
    registrarHistorico({ xp: qtd });
}

/* ---------- RAID DE 2 DIAS: PROGRESSO, CONTADOR DE 48H E FALHA ---------- */
const CHAVES_EX = ['flexoes', 'agachamentos', 'abdominais', 'corrida', 'leitura'];

function zerarProgressoBoss() {
    hunter.bossProgresso = { flexoes: 0, corrida: 0, abdominais: 0, agachamentos: 0, leitura: 0 };
}

function bossMetaCompleta() {
    const p = hunter.bossProgresso || {};
    const m = hunter.metasCalculadas;
    return CHAVES_EX.every(k => (p[k] || 0) >= m[k]);
}

function fracaoProgressoBoss() {
    const m = hunter.metasCalculadas;
    const p = hunter.bossProgresso || {};
    const pesos = { flexoes: 1, agachamentos: 1, abdominais: 1, corrida: (cardioCfg().dano || 1), leitura: 1 };
    let tot = 0, feito = 0;
    CHAVES_EX.forEach(k => {
        tot += m[k] * pesos[k];
        feito += Math.min(p[k] || 0, m[k]) * pesos[k];
    });
    return tot > 0 ? feito / tot : 0;
}

// Abre a janela de 48h (começa à 00:00 de sábado e termina à 00:00 de segunda)
function garantirJanelaBoss() {
    if (hunter.bossFimData) return;
    const agora = obterDataAtual();
    const info = infoCalendarioBoss(agora);
    let fim;
    if (info.fase === 'boss') {
        fim = new Date(info.alvo);
        fim.setDate(fim.getDate() + 2);
    } else if (agora.getDay() === 6 || agora.getDay() === 0) {
        fim = soData(agora);
        fim.setDate(fim.getDate() + (agora.getDay() === 6 ? 2 : 1));
    } else {
        fim = new Date(agora.getTime() + 48 * 3600 * 1000);
    }
    hunter.bossFimData = fim.toISOString();
    hunter.cicloBossAberto = info.ciclo;
    salvarDados();
}

function fmtContagem(ms) {
    const t = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function atualizarContadorBoss() {
    const box = document.getElementById('boss-contador-box');
    const card = document.getElementById('card-boss-fight');
    if (!box || !card) return;
    if (!hunter.bossFimData || card.classList.contains('escondido')) {
        box.classList.add('escondido');
        return;
    }
    const diff = new Date(hunter.bossFimData) - obterDataAtual();
    if (diff <= 0) return; // o tick processa a falha
    box.classList.remove('escondido');
    const el = document.getElementById('boss-contador');
    el.innerText = fmtContagem(diff);
    el.classList.toggle('critico', diff < 6 * 3600 * 1000);
}

function verificarExpiracaoBoss(renderizar = true) {
    if (!hunter.bossFimData) return;
    if (obterDataAtual() < new Date(hunter.bossFimData)) return;
    processarFalhaBoss(renderizar);
}

function processarFalhaBoss(renderizar = true) {
    const chefe = chefeAtual();
    const perda = xpDasMetasDoBoss();
    const real = descontarXp(mitigarPerdaXp(perda));

    hunter.bossCombateAtivo = false;
    hunter.bossFimData = null;
    hunter.cicloBossAberto = null;
    hunter.bossAdiado = false;
    hunter.bossReaberturaPendente = false;
    hunter.bossMetasCongeladas = null;
    hunter.bossHpAtual = chefe.hpMax;
    zerarProgressoBoss();

    const ate = obterDataAtual();
    ate.setDate(ate.getDate() + 30);
    hunter.bossCongeladoAteData = ate.toISOString();

    recalcularMetasDoRank();
    salvarDados();
    adicionarMsgChat(`💀 [RAID FALHOU]: O relógio de 48h chegou a zero! Perdeu ${real.toLocaleString('pt-BR')} XP (total dos exercícios da Raid) e o Portal ficará bloqueado por 1 mês.`);
    avisarJogo(`💀 [TEMPO ESGOTADO]\n\nO relógio de 48h da Raid chegou a zero.\n-${real.toLocaleString('pt-BR')} XP (total dos exercícios da Raid).\nO Portal fica bloqueado por 1 mês.`);
    if (renderizar) carregarEExibirInterface();
}

function registrarProgressoBoss(chave, meta) {
    tocarAudioSeguro(somClique);
    const input = document.getElementById('boss-in-' + chave);
    if (!input) return;
    let v = parseFloat(input.value) || 0;
    if (v < 0) v = 0;

    const prog = (hunter.bossProgresso && hunter.bossProgresso[chave]) || 0;
    const restante = Math.max(0, parseFloat((meta - prog).toFixed(2)));
    if (v > restante) {
        v = restante;
        mostrarAlertaOvertraining(input);
    }
    if (v <= 0) return;

    hunter.bossProgresso[chave] = parseFloat((prog + v).toFixed(2));

    const chefe = chefeAtual();
    hunter.bossHpAtual = Math.round(chefe.hpMax * (1 - fracaoProgressoBoss()));

    salvarDados();
    renderizarMissoes();
    atualizarBarraHpBoss();
    tremerBoss();

    if (bossMetaCompleta()) {
        adicionarMsgChat("⚔️ [RAID]: Todas as metas foram registradas! Clique em CONCLUIR RAID para derrotar o chefe.");
    } else {
        adicionarMsgChat(`📌 [RAID]: Progresso salvo! Você pode continuar amanhã (sábado e domingo valem). Sem perda de XP se não terminar tudo hoje.`);
    }
}

/* ---------- RELÓGIO DA RUPTURA (TEMPO REAL) ---------- */
const RUPTURA_DURACAO_MIN = 30;

function atualizarTimerRuptura() {
    if (!hunter.rupturaAtiva) return;
    const agora = obterDataReal();
    if (!hunter.rupturaFimData) {
        hunter.rupturaDuracaoMs = duracaoRupturaMs();
        hunter.rupturaFimData = new Date(agora.getTime() + hunter.rupturaDuracaoMs).toISOString();
        salvarDados();
    }
    const diff = new Date(hunter.rupturaFimData) - agora;
    const el = document.getElementById('timer-ruptura');
    if (diff <= 0) {
        hunter.rupturaAtiva = false;
        hunter.rupturaDesafio = null;
        hunter.rupturaFimData = null;
        hunter.rupturaTipo = 'normal';
        salvarDados();
        adicionarMsgChat("🕳️ [RUPTURA]: O tempo acabou e a fenda se fechou sozinha. Nenhuma recompensa foi obtida (sem perda de XP). Suas missões diárias voltaram.");
        carregarEExibirInterface();
        return;
    }
    if (el) {
        el.innerText = fmtContagem(diff);
        el.classList.toggle('critico', diff < 5 * 60000);
    }
}

/* ---------- INICIALIZAÇÃO ---------- */
/* ---------- PRIVACIDADE, TERMOS DE USO E AVISO DE SAÚDE (LGPD) ---------- */
const CONTATO_PRIVACIDADE = 'ascensaofitness.contato@gmail.com';  // canal para dúvidas e pedidos sobre dados
const VERSAO_TERMOS = '2026-11-21';                              // mude esta data quando o texto da política mudar: todo mundo aceita de novo
const CHAVE_ACEITE = 'solo_fitness_aceite';

function aceiteTermosValido() {
    try {
        const a = JSON.parse(localStorage.getItem(CHAVE_ACEITE) || 'null');
        return !!(a && a.versao === VERSAO_TERMOS && a.maior18 === true);
    } catch (e) { return false; }
}

function htmlPoliticaPrivacidade() {
    return `
<p><b>Ascensão Fitness</b> é um jogo para te motivar a treinar. Está em <b>versão BETA</b> (de testes). Versão deste texto: ${VERSAO_TERMOS}.</p>
<h4>1. Quais dados o jogo guarda</h4>
<p>Apelido ou nome, gênero (opcional), altura, peso, quais exercícios você consegue fazer e quantas repetições, o que você registra nos treinos (flexões, abdominais, agachamentos, corrida, leitura, água), XP, rank, itens, configurações e o histórico do seu progresso. <b>Altura, peso e desempenho físico são dados de saúde</b>, que a lei (LGPD) trata como dados sensíveis.</p>
<h4>2. Onde ficam seus dados</h4>
<p>Ficam <b>somente neste aparelho e neste navegador</b> (armazenamento local). O jogo <b>não tem conta, login nem banco de dados</b> e não envia seus dados para nenhum servidor do jogo. Por isso, o responsável pelo app não tem acesso ao que você registra.</p>
<h4>3. Para que usamos</h4>
<p>Só para o jogo funcionar: calcular metas de treino, XP, rank, penalidades e recompensas, e mostrar o seu progresso. Não usamos para publicidade e <b>não vendemos nem compartilhamos</b> seus dados.</p>
<h4>4. Serviços de terceiros</h4>
<p>A página do jogo é entregue por um serviço de hospedagem (como o GitHub Pages) e carrega fontes do <b>Google Fonts</b> e sons do <b>Mixkit</b>. Esses serviços podem registrar dados técnicos de acesso, como o seu endereço IP, como acontece em qualquer site. O jogo não envia a eles os seus dados de treino.</p>
<h4>5. Base legal</h4>
<p>O tratamento se baseia no seu <b>consentimento</b> (LGPD, art. 7º, I e art. 11, II, a), dado ao marcar a caixa de aceite abaixo. Você pode retirar o consentimento quando quiser, apagando seus dados (veja o item 6).</p>
<h4>6. Seus direitos</h4>
<p>• <b>Acessar e levar seus dados:</b> Backup &gt; Exportar save.<br>
• <b>Corrigir:</b> por enquanto, para mudar nome, altura ou peso é preciso reiniciar o Sistema (exporte o backup antes, se quiser guardar o progresso).<br>
• <b>Apagar tudo e retirar o consentimento:</b> Reiniciar o Sistema &gt; <b>APAGAR TUDO</b> (apaga também as cópias de segurança). Limpar os dados do navegador também apaga tudo.<br>
• <b>Dúvidas ou pedidos:</b> ${CONTATO_PRIVACIDADE}</p>
<h4>7. Idade mínima</h4>
<p>O jogo é para <b>maiores de 18 anos</b>. Se você é menor de idade, não use o jogo.</p>
<h4>8. Aviso de saúde</h4>
<p>O Ascensão Fitness <b>não é um serviço médico</b> e não substitui a orientação de um médico, educador físico ou nutricionista. As metas do jogo são sugestões gerais. Antes de começar ou aumentar a intensidade dos treinos, consulte um profissional de saúde, principalmente se você tem alguma condição de saúde, lesão ou toma medicamentos. <b>Pare imediatamente</b> se sentir dor, tontura, falta de ar ou mal-estar. Você é responsável por respeitar os seus limites.</p>
<h4>9. Segurança e backup</h4>
<p>Quem usa o mesmo aparelho e o mesmo navegador pode ver o seu progresso. Se você limpar os dados do navegador ou trocar de aparelho, <b>perde o progresso</b>, a menos que tenha exportado um backup.</p>
<h4>10. Mudanças neste texto</h4>
<p>Se esta política mudar, o jogo pede um novo aceite.</p>
<h4>11. Contato</h4>
<p>${CONTATO_PRIVACIDADE}</p>`;
}

// modoLeitura = true: só mostra o texto (botão nas Configurações). false: tela de aceite obrigatória.
function abrirTermos(modoLeitura) {
    let m = document.getElementById('modal-termos');
    if (m) m.remove();
    m = document.createElement('div');
    m.id = 'modal-termos';
    m.className = 'modal-bg';
    m.style.zIndex = '100000';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    const caixa = document.createElement('div');
    caixa.className = 'modal-box';
    caixa.style.cssText = 'max-height:92vh;display:flex;flex-direction:column;width:min(94vw,560px);';
    const h = document.createElement('h3');
    h.style.cssText = 'color:#38bdf8;margin:0 0 8px;';
    h.innerText = modoLeitura ? '🛡️ [POLÍTICA DE PRIVACIDADE]' : '🛡️ [PRIVACIDADE E TERMOS DE USO]';
    const corpo = document.createElement('div');
    corpo.style.cssText = 'overflow-y:auto;flex:1 1 auto;min-height:0;text-align:left;font-size:0.85rem;line-height:1.5;padding-right:6px;margin-bottom:10px;';
    corpo.innerHTML = htmlPoliticaPrivacidade();
    caixa.appendChild(h); caixa.appendChild(corpo);

    if (modoLeitura) {
        const fechar = document.createElement('button');
        fechar.type = 'button'; fechar.className = 'btn-sistema btn-nao'; fechar.style.width = '100%'; fechar.innerText = '[ FECHAR ]';
        fechar.addEventListener('click', () => m.remove());
        caixa.appendChild(fechar);
    } else {
        const mkCk = (id, html) => {
            const l = document.createElement('label');
            l.style.cssText = 'display:flex;gap:8px;align-items:flex-start;text-align:left;font-size:0.85rem;margin:4px 0;cursor:pointer;';
            const c = document.createElement('input'); c.type = 'checkbox'; c.id = id; c.style.cssText = 'margin-top:3px;flex:0 0 auto;';
            const t = document.createElement('span'); t.innerText = html;
            l.appendChild(c); l.appendChild(t); caixa.appendChild(l);
            return c;
        };
        const ck1 = mkCk('termos-ck-politica', 'Li e aceito a Política de Privacidade e o Aviso de Saúde.');
        const ck2 = mkCk('termos-ck-idade', 'Declaro ter 18 anos ou mais.');
        const ok = document.createElement('button');
        ok.type = 'button'; ok.id = 'termos-btn-aceitar'; ok.className = 'btn-sistema btn-sim'; ok.style.cssText = 'width:100%;margin-top:8px;'; ok.innerText = '[ ACEITAR E CONTINUAR ]'; ok.disabled = true;
        const no = document.createElement('button');
        no.type = 'button'; no.id = 'termos-btn-recusar'; no.className = 'btn-sistema btn-nao'; no.style.cssText = 'width:100%;margin-top:6px;'; no.innerText = '[ NÃO ACEITO ]';
        const aviso = document.createElement('p');
        aviso.id = 'termos-aviso'; aviso.style.cssText = 'font-size:0.8rem;color:#f87171;margin:6px 0 0;';
        const atualiza = () => { ok.disabled = !(ck1.checked && ck2.checked); };
        ck1.addEventListener('change', atualiza); ck2.addEventListener('change', atualiza);
        ok.addEventListener('click', () => {
            if (!(ck1.checked && ck2.checked)) return;
            try { localStorage.setItem(CHAVE_ACEITE, JSON.stringify({ versao: VERSAO_TERMOS, em: new Date().toISOString(), maior18: true })); } catch (e) {}
            m.remove();
        });
        no.addEventListener('click', () => { aviso.innerText = 'Sem o aceite o jogo não pode ser usado, porque ele precisa guardar seus dados de treino neste aparelho. Nada foi guardado. Você pode fechar esta página.'; });
        caixa.appendChild(ok); caixa.appendChild(no); caixa.appendChild(aviso);
    }
    m.appendChild(caixa);
    document.body.appendChild(m);
}

// Primeiro acesso (ou texto novo): ninguém usa o jogo sem aceitar
function garantirAceiteTermos() {
    if (aceiteTermosValido()) return;
    abrirTermos(false);
}

document.addEventListener('DOMContentLoaded', () => {

    let dadosSalvos = null;
    try { dadosSalvos = localStorage.getItem('solo_fitness_hunter'); } catch (e) {}

    if (dadosSalvos) {
        let leituraOk = false;
        try {
            const salvo = JSON.parse(migrarNomesAntigosTexto(dadosSalvos));
            if (!salvo.nome || salvo.nome === "") throw new Error("Dados incompletos");
            hunter = mesclarProfundo(JSON.parse(JSON.stringify(HUNTER_PADRAO)), salvo);
            hunter.isDev = false;                                   // nunca vem do save
            delete hunter.email;                                    // dado que o jogo não usa mais (minimização de dados)
            if (typeof devAoCarregar === 'function') devAoCarregar();
            migrarEquipamentos();
            migrarV31();
            localStorage.setItem('solo_fitness_versao', VERSAO_ATUAL);
            leituraOk = true;
        } catch (e) {
            // Guarda uma cópia antes de descartar, para o jogador poder restaurar em Backup
            let tinhaDados = false;
            try { const t = JSON.parse(dadosSalvos); tinhaDados = !!(t && t.nome); } catch (e2) { tinhaDados = dadosSalvos.length > 50 || /"nome"\s*:\s*"[^"]+"/.test(dadosSalvos); }
            if (tinhaDados) {
                try { localStorage.setItem('solo_fitness_corrompido', dadosSalvos); } catch (e3) {}
                setTimeout(() => avisarJogo('🧯 [SAVE NÃO ABRIU]\n\nNão consegui ler o seu save. Uma cópia de segurança foi guardada: clique em "IMPORTAR SAVE" na tela inicial e restaure em "Save que não abriu".'), 600);
            }
            localStorage.removeItem('solo_fitness_hunter');
            exibirTelaInicial();
        }
        if (leituraOk) {
            const modal = document.getElementById('sistema-modal');
            if (modal) modal.style.display = 'none';
            document.getElementById('app-principal').classList.remove('escondido');
            try { carregarEExibirInterface(); }
            catch (e) {
                console.error(e);
                setTimeout(() => avisarJogo('⚠️ [ERRO NA TELA]\n\nAlgo falhou ao montar a tela, mas o seu save está intacto. Recarregue a página. Se persistir, exporte um backup em Backup > Exportar e avise o desenvolvedor.\n\nDetalhe: ' + (e && e.message)), 300);
            }
        }
    } else {
        try { localStorage.setItem('solo_fitness_versao', VERSAO_ATUAL); } catch (e) {}
        exibirTelaInicial();
    }

    configurarTriagemCadastro();
    configurarBackupUI();
    configurarV31UI();
    aplicarConfigVisual();
    garantirAceiteTermos();

    document.getElementById('btn-sim-inicial')?.addEventListener('click', () => {
        tocarAudioSeguro(somClique);
        document.getElementById('janela-inicio').classList.add('escondido');
        document.getElementById('janela-cadastro').classList.remove('escondido');
    });

    document.getElementById('btn-nao-inicial')?.addEventListener('click', () => {
        tocarAudioSeguro(somClique);
        const alerta = document.getElementById('efeito-alerta');
        if (alerta) alerta.classList.add('piscar-alerta');
        setTimeout(() => {
            if (alerta) alerta.classList.remove('piscar-alerta');
            document.getElementById('janela-inicio').classList.add('escondido');
            document.getElementById('janela-desistencia').classList.remove('escondido');
        }, 400);
    });

    document.getElementById('btn-voltar')?.addEventListener('click', () => {
        tocarAudioSeguro(somClique);
        document.getElementById('janela-desistencia').classList.add('escondido');
        document.getElementById('janela-inicio').classList.remove('escondido');
    });

    document.getElementById('btn-sair')?.addEventListener('click', () => {
        window.close();
        setTimeout(() => { window.location.href = "https://www.google.com"; }, 300);
    });

    document.getElementById('btn-concluir-cadastro')?.addEventListener('click', finalizarCadastroEEntrarPortal);
    document.getElementById('btn-executar-treino')?.addEventListener('click', concluirTreinoIntegral);
    document.getElementById('btn-recusar-fimdesemana')?.addEventListener('click', recusarTreinoFimDeSemana);
    document.getElementById('btn-concluir-ruptura')?.addEventListener('click', concluirRupturaPortal);

    document.getElementById('btn-aceitar-boss')?.addEventListener('click', aceitarDesafioBossFight);
    ['btn-usar-pedra-teleporte', 'btn-pedra-boss-pre'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            const bloqueado = !!hunter.bossAdiado;
            const bt = document.getElementById('btn-pedra-imprevisto');
            if (bt) bt.classList.toggle('escondido', bloqueado);
            const nota = document.getElementById('pedra-nota');
            if (nota) nota.innerText = bloqueado
                ? "⛔ O adiamento de 1 semana já foi usado neste Boss. Agora você pode: enfrentar o Portal, cancelá-lo por metas elevadas (congela 30 dias) ou deixar o tempo acabar (perde o XP dos exercícios da Raid e o Portal fica bloqueado por 1 mês)."
                : "💎 A Pedra é grátis, mas o adiamento por imprevisto só pode ser usado UMA vez por Boss.";
            document.getElementById('modal-pedra-teleporte').classList.remove('escondido');
        });
    });
    document.getElementById('btn-cancelar-teleporte')?.addEventListener('click', () => {
        document.getElementById('modal-pedra-teleporte').classList.add('escondido');
    });
    document.getElementById('btn-confirmar-aviso-boss')?.addEventListener('click', confirmarAvisoBoss);
    document.getElementById('btn-confirmar-venda-boss')?.addEventListener('click', confirmarVendaBoss);
    document.getElementById('btn-cancelar-venda-boss')?.addEventListener('click', fecharModalVendaBoss);

    document.getElementById('btn-nao-cumpri')?.addEventListener('click', () => {
        if (hunter.zonaPunicao) {
            avisarJogo("🚨 Na Zona de Penitência não existe opção de imprevisto. Cumpra os exercícios punitivos ou aceite as perdas.");
            return;
        }
        if (!hunter.diariaConcluida || hunter.isDev) {
            document.getElementById('modal-justificativa').classList.remove('escondido');
        } else {
            adicionarMsgChat("[SISTEMA]: Treino de hoje já foi registrado!");
        }
    });

    // BETA: o relatório de imprevisto não tinha como ser fechado sem escolher uma opção (toque acidental no botão vermelho)
    document.getElementById('btn-cancelar-justificativa')?.addEventListener('click', () => {
        document.getElementById('modal-justificativa').classList.add('escondido');
    });

    document.getElementById('btn-desafio-urgente')?.addEventListener('click', solicitarDesafioUrgente);
    document.getElementById('btn-ver-conquistas')?.addEventListener('click', abrirModalConquistas);
    document.getElementById('btn-fechar-conquistas')?.addEventListener('click', () => {
        document.getElementById('modal-conquistas').classList.add('escondido');
    });

    document.getElementById('btn-abrir-inventario')?.addEventListener('click', abrirModalInventario);
    document.getElementById('btn-fechar-inventario')?.addEventListener('click', () => {
        document.getElementById('modal-inventario').classList.add('escondido');
    });

    document.getElementById('btn-fechar-slot-equip')?.addEventListener('click', fecharSeletorSlot);
    document.getElementById('btn-abrir-galeria-sombras')?.addEventListener('click', abrirGaleriaSombras);
    document.getElementById('btn-fechar-galeria')?.addEventListener('click', () => {
        document.getElementById('modal-galeria-sombras').classList.add('escondido');
    });
    document.getElementById('modal-galeria-cena')?.addEventListener('click', fecharCenaGaleria);
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const cena = document.getElementById('modal-galeria-cena');
        if (cena && !cena.classList.contains('escondido')) { fecharCenaGaleria(); return; }
        ['modal-slot-equip', 'modal-galeria-sombras'].forEach(id => document.getElementById(id)?.classList.add('escondido'));
    });

    document.getElementById('btn-abrir-loja')?.addEventListener('click', abrirModalLoja);
    document.getElementById('btn-fechar-loja')?.addEventListener('click', () => {
        document.getElementById('modal-loja').classList.add('escondido');
    });

    document.getElementById('btn-abrir-mapa')?.addEventListener('click', abrirModalMapaMundial);
    document.getElementById('btn-fechar-mapa')?.addEventListener('click', () => {
        document.getElementById('modal-mapa').classList.add('escondido');
    });

    document.getElementById('btn-usar-chave-masmorra')?.addEventListener('click', usarChaveMasmorra);
    document.getElementById('btn-aceitar-masmorra-temp')?.addEventListener('click', aceitarMasmorraTemp);
    document.getElementById('btn-recusar-masmorra-temp')?.addEventListener('click', recusarMasmorraTemp);
    document.getElementById('btn-cancelar-raid-temp')?.addEventListener('click', recusarMasmorraTemp);
    document.getElementById('btn-concluir-masmorra-temp')?.addEventListener('click', concluirMasmorraTemp);

    document.getElementById('btn-reset-perfil')?.addEventListener('click', reiniciarPerfil);
    document.getElementById('btn-ver-ranks')?.addEventListener('click', abrirModalRanks);
    document.getElementById('btn-fechar-ranks')?.addEventListener('click', () => {
        document.getElementById('modal-ranks').classList.add('escondido');
    });

    document.getElementById('btn-confirmar-checkin')?.addEventListener('click', processarRecomendacaoTreino);
    document.getElementById('btn-adiar-reavaliacao')?.addEventListener('click', adiarReavaliacao);
    document.getElementById('btn-salvar-rankup')?.addEventListener('click', concluirRecalibracaoRankUp);

    document.getElementById('btn-erga-se')?.addEventListener('click', executarComandoErgase);
    document.getElementById('modal-extracao-sombra')?.addEventListener('click', absorverSombra);

    document.getElementById('select-titulo-equipado')?.addEventListener('change', (e) => {
        hunter.tituloEquipado = e.target.value;
        salvarDados();
        tocarAudioSeguro(somClique);
        atualizarDescTitulo();
        adicionarMsgChat(`🗡️ [EQUIPAMENTO]: Título alterado para ${hunter.tituloEquipado}! ${tituloDescricao(hunter.tituloEquipado)}`);
    });

    document.getElementById('btn-usar-soro')?.addEventListener('click', usarSoroPeloRelatorio);
    document.querySelectorAll('.btn-ajuste-meta').forEach(b => b.addEventListener('click', () => responderAjusteMeta(b.dataset.resp)));

    iniciarTimerECheck();
});

/* ---------- CADASTRO & TRIAGEM ---------- */
function configurarTriagemCadastro() {
    const selTipo = document.getElementById('cad-cardio-tipo');
    const selCorrer = document.getElementById('cad-pode-correr');
    if (!selTipo || !selCorrer) return;

    function atualizarLabelCardio() {
        const cfg = CARDIO_CONFIG[selTipo.value] || CARDIO_CONFIG.corrida;
        const lbl = document.getElementById('lbl-cad-cardio');
        const input = document.getElementById('cad-max-corrida');
        if (lbl) lbl.innerText = `Máx. ${cfg.nome} contínua (${cfg.unidade}):`;
        if (input) {
            input.step = cfg.casas === 0 ? "1" : "0.1";
            const naoCorre = selCorrer.value === 'nao';
            input.value = naoCorre ? (SUGESTAO_INICIANTE[selTipo.value] || cfg.padrao) : cfg.padrao;
            if (lbl && naoCorre) lbl.innerText = `${cfg.nome} (${cfg.unidade}) — sugestão de iniciante, pode alterar:`;
        }
    }

    function atualizarOpcoes() {
        const podeCorrer = selCorrer.value === 'sim';
        Array.from(selTipo.options).forEach(o => {
            const impacto = (o.value === 'corrida' || o.value === 'corda');
            o.disabled = (!podeCorrer && impacto);
        });
        if (!podeCorrer && (selTipo.value === 'corrida' || selTipo.value === 'corda')) {
            selTipo.value = 'caminhada';
        }
        atualizarLabelCardio();
    }

    selCorrer.addEventListener('change', atualizarOpcoes);
    selTipo.addEventListener('change', atualizarLabelCardio);
    atualizarOpcoes();

    // Se o jogador NÃO consegue o exercício principal, o Sistema sugere uma meta de iniciante (editável)
    const cfgsBase = {
        flexoes:      { sel: 'cad-pode-flexao', inp: 'cad-max-flexoes',      lbl: 'lbl-cad-flex',  normal: "Máx. Flexões seguidas:",      alt: "Flexões com joelho (sugestão de iniciante, pode alterar):", padrao: 10 },
        agachamentos: { sel: 'cad-pode-agach',  inp: 'cad-max-agachamentos', lbl: 'lbl-cad-agach', normal: "Máx. Agachamentos seguidos:", alt: "Agachamentos no banco (sugestão de iniciante, pode alterar):", padrao: 30 },
        abdominais:   { sel: 'cad-pode-abd',    inp: 'cad-max-abdominais',   lbl: 'lbl-cad-abd',   normal: "Máx. Abdominais seguidos:",   alt: "Abdominais curtos (sugestão de iniciante, pode alterar):", padrao: 30 }
    };
    Object.keys(cfgsBase).forEach(k => {
        const c = cfgsBase[k];
        const sel = document.getElementById(c.sel), inp = document.getElementById(c.inp), lbl = document.getElementById(c.lbl);
        if (!sel || !inp) return;
        const atualizar = () => {
            const nao = sel.value === 'nao';
            inp.value = nao ? SUGESTAO_INICIANTE[k] : c.padrao;
            if (lbl) lbl.innerText = nao ? c.alt : c.normal;
        };
        sel.addEventListener('change', atualizar);
    });
    selCorrer.addEventListener('change', () => atualizarLabelCardio());
    selTipo.addEventListener('change', () => atualizarLabelCardio());
}

function finalizarCadastroEEntrarPortal() {
    const nome = document.getElementById('cad-nome').value.trim().slice(0, 30);
    const altura = parseFloat(document.getElementById('cad-altura').value);
    const peso = parseFloat(document.getElementById('cad-peso').value);

    const maxFlex = parseInt(document.getElementById('cad-max-flexoes').value) || 10;
    const maxAbd = parseInt(document.getElementById('cad-max-abdominais').value) || 30;
    const maxAgach = parseInt(document.getElementById('cad-max-agachamentos').value) || 30;

    const cardioTipo = document.getElementById('cad-cardio-tipo').value || 'corrida';
    const cfgCardio = CARDIO_CONFIG[cardioTipo];
    const maxCardio = parseFloat(document.getElementById('cad-max-corrida').value) || cfgCardio.padrao;

    if (!nome || !altura || !peso) {
        avisarJogo("⚠️ [SISTEMA]: Preencha nome, altura e peso!");
        return;
    }

    hunter.nome = nome;
    hunter.dataCadastro = obterDataAtual().toDateString();
    hunter.altura = altura;
    hunter.peso = peso;
    hunter.genero = (document.getElementById('cad-genero') || {}).value || 'nao_informar';
    hunter.avisoAvatarV32 = true;
    hunter.capacidade = {
        flexoes: document.getElementById('cad-pode-flexao').value === 'sim',
        agachamentos: document.getElementById('cad-pode-agach').value === 'sim',
        abdominais: document.getElementById('cad-pode-abd').value === 'sim',
        corrida: document.getElementById('cad-pode-correr').value === 'sim'
    };
    hunter.cardioTipo = cardioTipo;
    hunter.maximos = { flexoes: maxFlex, abdominais: maxAbd, agachamentos: maxAgach, corrida: maxCardio, leitura: 10 };
    hunter.isDev = false;
    hunter.ultimaRecalibracao = obterDataAtual().toISOString();
    hunter.arvoreMigrada = true;
    hunter.retroVistaMes = chaveMes();
    hunter.ultimoDiaConcluido = obterDataAtual().toDateString();
    calIniciar(); // BETA: cadastro novo começa pela calibração obrigatória de 3 dias

    recalcularMetasDoRank();
    salvarDados();

    tocarAudioSeguro(somPortal);
    const portal = document.getElementById('efeito-portal');
    const claraoNeon = document.getElementById('efeito-clarao');
    const modal = document.getElementById('sistema-modal');

    document.getElementById('janela-cadastro').classList.add('escondido');

    if (portal) portal.classList.add('ativar-portal');

    setTimeout(() => {
        if (claraoNeon) claraoNeon.classList.remove('escondido');
        setTimeout(() => { if (claraoNeon) claraoNeon.classList.add('disparar-piscadas'); }, 50);

        setTimeout(() => {
            if (modal) modal.style.display = 'none';
            if (claraoNeon) claraoNeon.classList.remove('disparar-piscadas');
            document.getElementById('app-principal').classList.remove('escondido');
            carregarEExibirInterface();
        }, 700);
    }, 1000);
}

/* ---------- INTERFACE PRINCIPAL ---------- */
function carregarEExibirInterface() {
    hunter.isDev = false;                                       // nunca vem do save
    if (typeof devAoCarregar === 'function') devAoCarregar();   // só existe na cópia local, com js/dev.js
    if (calibracaoAtiva()) { mostrarCalibracao(); return; } // BETA: nos 3 primeiros dias só existe o treino de calibração
    sincronizarPausaDiarias();
    atualizarRecuperacaoDiaria();
    const dataAtual = obterDataAtual();

    document.getElementById('user-nome').innerText = hunter.nome;
    document.getElementById('user-altura').innerText = hunter.altura;
    document.getElementById('user-peso').innerText = hunter.peso;
    document.getElementById('user-gold').innerText = (hunter.gold || 0).toLocaleString('pt-BR');
    document.getElementById('streak-dias').innerText = hunter.streakDias || 0;
    document.getElementById('qtd-soros').innerText = hunter.sorosRecuperacao || 0;
    document.getElementById('data-sistema').innerText = dataAtual.toLocaleDateString('pt-BR');

    if (hunter.bossCombateAtivo) {
        document.body.classList.add('modo-dungeon-ativa');
        document.getElementById('titulo-interface-app').innerText = "🏰 INSTÂNCIA DE MASMORRA ATIVA";
    } else {
        document.body.classList.remove('modo-dungeon-ativa');
        document.getElementById('titulo-interface-app').innerText = "INTERFACE DO CAÇADOR";
    }

    checarResetDiario();
    checarDescansoMensal();
    aplicarRecuperacaoPreBoss();
    atualizarPainelFadiga();
    verificarAnelDesespero();
    verificarAlertaFadiga95();
    atualizarPainelAgua();
    atualizarAtributosERank();
    atualizarInventarioTitulos();
    atualizarLegiãoSombras();
    renderizarSlotEquipamento();
    checarEAtivarCicloBossFight();
    checarRupturaPortalSurpresa();
    checarJobChangeQuest();
    exibirMasmorraTempCard();
    checarConquistasAutomated();
    renderizarMissoes();
    verificarSombraPendente();
    checarAdiamentoBoss();
    checarAvisoPrevioBoss();
    aplicarConfigVisual();
    checarLembreteBackup();
    checarProtecaoEInstalacao();
    garantirSemanal();
    verificarMarcosStreak();
    gerarMissoesSombras();
    aplicarVisuais();
    checarReavaliacaoMensal();
    checarRetrospectiva();
}

/* ---------- FADIGA BIOMECÂNICA ---------- */
function atualizarPainelFadiga() {
    const bar = document.getElementById('fadiga-fill');
    const txt = document.getElementById('fadiga-texto');
    const alerta = document.getElementById('alerta-fadiga');
    const val = Math.round(Math.min(100, Math.max(0, hunter.fadiga || 0)));

    if (bar) bar.style.width = `${val}%`;
    if (txt) txt.innerText = `${val}%`;

    if (!alerta) return;
    alerta.classList.remove('nivel-70', 'nivel-80', 'nivel-90');

    if (val >= 95) {
        alerta.className = 'alerta-fadiga nivel-90';
        alerta.innerText = "🚨 RISCO DE LESÃO (95%+): considere reduzir as metas do próximo treino ou tirar um dia de folga. Escolha na caixa de alerta do Sistema.";
    } else if (val >= 80) {
        alerta.className = 'alerta-fadiga nivel-80';
        alerta.innerText = "🛑 ALERTA: Descanso Ativo recomendado (80%+). Faça alongamento leve e priorize o sono.";
    } else if (val >= 70) {
        alerta.className = 'alerta-fadiga nivel-70';
        alerta.innerText = "⚠️ AVISO: Excesso de Fadiga Corporal (70%+). Cuidado para não chegar ao limite de lesão.";
    } else {
        alerta.className = 'alerta-fadiga escondido';
        alerta.innerText = "";
    }
}

function avisarLimiaresFadiga(antes, depois) {
    if (depois >= 95 && antes < 95) {
        adicionarMsgChat("🚨 [FADIGA CRÍTICA]: 95%+! Risco de lesão. Responda ao alerta do Sistema.");
    } else if (depois >= 80 && antes < 80) {
        adicionarMsgChat("🛑 [FADIGA ALTA]: 80%+. Descanso Ativo recomendado.");
    } else if (depois >= 70 && antes < 70) {
        adicionarMsgChat("⚠️ [FADIGA]: 70%+. Excesso de Fadiga Corporal detectado.");
    }
}

function verificarAlertaFadiga95() {
    if ((hunter.fadiga || 0) < 95) return;
    const hojeStr = obterDataAtual().toDateString();
    if (hunter.fadigaAvisoDia === hojeStr) return;
    const m = document.getElementById('modal-fadiga');
    if (!m || !m.classList.contains('escondido')) return;
    const ocupado = ['modal-rankup', 'modal-extracao-sombra', 'modal-aviso-boss'].some(id => {
        const e = document.getElementById(id); return e && !e.classList.contains('escondido');
    });
    if (ocupado || sistemaCongelado() || hunter.pausaDiariasInicio) return;

    const est = obterEstadoDia();
    const restrito = !!(est.boss.pendente || est.boss.ativo || hunter.zonaPunicao);
    document.getElementById('fadiga-opcao-reduzir').classList.toggle('escondido', restrito);
    document.getElementById('fadiga-opcao-folga').classList.toggle('escondido', restrito);
    document.getElementById('fadiga-nota-restrita').classList.toggle('escondido', !restrito);
    tocarAudioSeguro(somPortal);
    m.classList.remove('escondido');
}

function responderAlertaFadiga(opcao) {
    tocarAudioSeguro(somClique);
    document.getElementById('modal-fadiga').classList.add('escondido');
    hunter.fadigaAvisoDia = obterDataAtual().toDateString();
    if (opcao === 'bem') {
        adicionarMsgChat("💪 [FADIGA 95%+]: você disse que está bem. Treino liberado, mas cuidado com o risco de lesão!");
    } else if (opcao === 'reduzir') {
        hunter.fadigaReduzirProx = true;
        recalcularMetasDoRank();
        adicionarMsgChat("🛡️ [FADIGA 95%+]: o próximo treino terá metas 25% menores. O XP será proporcional ao que você fizer.");
    } else if (opcao === 'folga') {
        registrarFolgaPorFadiga();
    }
    salvarDados();
    carregarEExibirInterface();
}

// Folga por Fadiga: sem perda de XP, Streak mantido, -20% de Fadiga; no próximo dia útil as metas sobem 10%
function registrarFolgaPorFadiga() {
    const hoje = obterDataAtual();
    if (hunter.diariaConcluida || hunter.folgaRegistradaFimDeSemana) {
        hunter.folgaProximoDia = true; // o treino de hoje já foi feito: a folga vale para amanhã
        adicionarMsgChat("🛌 [FOLGA AGENDADA]: amanhã é seu dia de descanso (sem perda de XP). No próximo dia útil as metas sobem 10% e depois voltam ao normal.");
        return;
    }
    hunter.folgaRegistradaFimDeSemana = true;
    hunter.fadiga = Math.max(0, (hunter.fadiga || 0) - 20);
    hunter.ultimoDiaConcluido = hoje.toDateString();
    hunter.fadigaFolgaBonus = 1;
    adicionarMsgChat("🛌 [FOLGA POR FADIGA]: dia de descanso registrado, sem perda de XP e com o Streak mantido. Fadiga −20%. No próximo dia útil as metas terão +10%, depois voltam ao normal.");
}

function aplicarFolgaAgendada() {
    if (!hunter.folgaProximoDia) return;
    hunter.folgaProximoDia = false;
    hunter.folgaRegistradaFimDeSemana = true;
    hunter.fadiga = Math.max(0, (hunter.fadiga || 0) - 20);
    hunter.fadigaFolgaBonus = 1;
    adicionarMsgChat("🛌 [FOLGA POR FADIGA]: hoje é seu dia de descanso agendado (sem perda de XP, Streak mantido, Fadiga −20%). Na próxima missão útil as metas terão +10%.");
}

function aplicarRecuperacaoPreBoss() {
    const info = infoCalendarioBoss(obterDataAtual());
    if (info.fase !== 'sexta-pre' || hunter.bossCombateAtivo || !bossDisponivel(info)) return;
    if (hunter.recuperacaoPreBossAplicada === info.ciclo) return;

    hunter.recuperacaoPreBossAplicada = info.ciclo;
    hunter.fadiga = Math.max(0, (hunter.fadiga || 0) - 20);
    salvarDados();
    adicionarMsgChat("🛌 [SEXTA PRÉ-RAID]: Descanso obrigatório aplicado! -20% de Fadiga. Chegue 100% recuperado ao Portal amanhã.");
}

function recusarTreinoFimDeSemana() {
    if (sistemaCongelado()) return;
    const hoje = obterDataAtual();
    const dia = hoje.getDay();
    const ehFDS = (dia === 0 || dia === 6);

    if (!ehFDS && (hunter.fadiga || 0) < 95) return;
    if (hunter.folgaRegistradaFimDeSemana || hunter.diariaConcluida) return;

    tocarAudioSeguro(somClique);
    hunter.folgaRegistradaFimDeSemana = true;
    hunter.fadiga = Math.max(0, (hunter.fadiga || 0) - 20);
    hunter.ultimoDiaConcluido = hoje.toDateString();

    if (ehFDS) {
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        const completo = (dia === 0 && hunter.ultimaFolgaFdsData === ontem.toDateString());
        hunter.ultimaFolgaFdsData = hoje.toDateString();
        if (completo) {
            adicionarMsgChat("🏖️ [FIM DE SEMANA COMPLETO DE DESCANSO]: Sábado + Domingo em repouso = -40% de Fadiga Corporal no total!");
        } else {
            adicionarMsgChat("☕ [REGENERAÇÃO]: Folga registrada! -20% de Fadiga Corporal. A missão volta amanhã (Sáb ➔ Dom ➔ próximo Sáb).");
        }
    } else {
        hunter.fadigaFolgaBonus = 1;
        adicionarMsgChat("🛌 [DESCANSO FORÇADO]: Dia de descanso registrado! -20% de Fadiga. Streak preservado. No próximo dia útil as metas terão +10%.");
    }

    salvarDados();
    carregarEExibirInterface();
}

/* ---------- JOB CHANGE ---------- */
function checarJobChangeQuest() {
    const card = document.getElementById('card-job-change');
    if (!card) return;

    if (hunter.rankIndiceAtual >= 2 && !hunter.jobChangeConcluido) {
        card.classList.remove('escondido');
        document.getElementById('job-progress-dias').innerText = hunter.jobChangeProgresso || 0;
    } else {
        card.classList.add('escondido');
    }
}

/* ---------- MASMORRA TEMPORÁRIA (FENDA) ---------- */
async function usarChaveMasmorra() {
    if (sistemaCongelado()) {
        avisarJogo("🧪 O Sistema está congelado pelo Cristal do Repouso. Aguarde o fim do efeito.");
        return;
    }
    if ((hunter.chavesMasmorra || 0) <= 0) {
        avisarJogo("⚠️ Você não possui Chaves de Masmorra Instantâneas!");
        return;
    }
    if ((hunter.fadiga || 0) >= 95 && !await confirmarJogo("🚨 Fadiga em 95% ou mais: risco de lesão. Entrar na Fenda mesmo assim?")) {
        return;
    }
    if (hunter.masmorraTempAtiva) {
        avisarJogo("⚠️ Você já possui uma Fenda Temporária ativa!");
        return;
    }

    hunter.chavesMasmorra -= 1;
    hunter.masmorraTempAtiva = true;
    hunter.masmorraTempAceita = false;

    const dataFim = obterDataReal();
    dataFim.setHours(dataFim.getHours() + 2);
    hunter.masmorraTempFimData = dataFim.toISOString();
    hunter.masmorraTempConfirmacoes = { flexDiamante: false, polichinelos: false, abdInfra: false };

    salvarDados();
    carregarEExibirInterface();
    adicionarMsgChat("🔑 [CHAVE DE MASMORRA]: Fenda Temporária invocada!");
}

function exibirMasmorraTempCard() {
    const card = document.getElementById('card-masmorra-temp');
    if (!card) return;

    if (hunter.masmorraTempAtiva) {
        card.classList.remove('escondido');
        document.getElementById('temp-dungeon-desc').innerText = "Fenda Paralela Leve (Tempo Limite): Cumpra os exercícios reduzidos (~35% mais leves; Flexão Diamante em proporção biomecânica real) na SUA variante (joelho, banco, crunch) para obter artefatos raros e Títulos!";

        if (hunter.masmorraTempAceita) {
            document.getElementById('caixa-convite-temp').classList.add('escondido');
            document.getElementById('caixa-timer-temp').classList.remove('escondido');
        } else {
            document.getElementById('caixa-convite-temp').classList.remove('escondido');
            document.getElementById('caixa-timer-temp').classList.add('escondido');
        }
        renderizarMissoesTemp();
    } else {
        card.classList.add('escondido');
    }
}

function metaFlexaoDiamante() {
    // V33: proporção real da flexão diamante (~60% do máximo de flexões normais), na versão "leve" da Fenda (~45% do esforço)
    return Math.max(2, Math.round((hunter.maximos.flexoes || 10) * 0.60 * 0.45));
}

function renderizarMissoesTemp() {
    const container = document.getElementById('container-missoes-temp');
    if (!container) return;

    const metas = hunter.metasCalculadas;
    const flexDiamanteMeta = metaFlexaoDiamante();
    const polichinelosMeta = Math.max(15, Math.round(metas.agachamentos * 0.8));
    const abdInfraMeta = Math.max(10, Math.round(metas.abdominais * 0.65));
    const nomeFlex = hunter.capacidade.flexoes === false ? "Flexões Diamante no Joelho" : "Flexões Diamante";
    const nomePoli = nomePolichinelo(), nomeInfra = nomeAbdInfra();

    container.innerHTML = `
        <div class="missao-item-input">
            <span class="missao-meta-label" title="${nomeFlex}">💎 ${nomeFlex} (Mín: ${flexDiamanteMeta}):</span>
            <input type="number" id="exec-temp-flex" class="input-resultado-exec" value="${flexDiamanteMeta}">
            <button type="button" id="btn-conf-temp-flex" class="btn-confirmar-ex" onclick="confirmarExTemp('flexDiamante')">CONFIRMAR</button>
        </div>
        <div class="missao-item-input">
            <span class="missao-meta-label">🏃 ${nomePoli} (Mín: ${polichinelosMeta}):</span>
            <input type="number" id="exec-temp-poli" class="input-resultado-exec" value="${polichinelosMeta}">
            <button type="button" id="btn-conf-temp-poli" class="btn-confirmar-ex" onclick="confirmarExTemp('polichinelos')">CONFIRMAR</button>
        </div>
        <div class="missao-item-input">
            <span class="missao-meta-label">🧘 ${nomeInfra} (Mín: ${abdInfraMeta}):</span>
            <input type="number" id="exec-temp-abd" class="input-resultado-exec" value="${abdInfraMeta}">
            <button type="button" id="btn-conf-temp-abd" class="btn-confirmar-ex" onclick="confirmarExTemp('abdInfra')">CONFIRMAR</button>
        </div>
    `;

    atualizarVisualTemp('flexDiamante', 'btn-conf-temp-flex');
    atualizarVisualTemp('polichinelos', 'btn-conf-temp-poli');
    atualizarVisualTemp('abdInfra', 'btn-conf-temp-abd');
}

function confirmarExTemp(key) {
    tocarAudioSeguro(somClique);
    hunter.masmorraTempConfirmacoes[key] = true;
    salvarDados();
    renderizarMissoesTemp();
}

function atualizarVisualTemp(key, btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    if (hunter.masmorraTempConfirmacoes[key]) {
        btn.className = 'btn-confirmar-ex ex-confirmado-verde';
        btn.innerText = '✔ CUMPRIDO';
    } else {
        btn.className = 'btn-confirmar-ex';
        btn.innerText = 'CONFIRMAR';
    }
}

function aceitarMasmorraTemp() {
    tocarAudioSeguro(somPortal);
    hunter.masmorraTempAceita = true;
    sincronizarPausaDiarias();
    salvarDados();
    renderizarMissoes();
    document.getElementById('caixa-convite-temp').classList.add('escondido');
    document.getElementById('caixa-timer-temp').classList.remove('escondido');
    adicionarMsgChat("⚔️ [MASMORRA ACEITA]: Cronómetro regressivo ativado!");
}

function recusarMasmorraTemp() {
    tocarAudioSeguro(somClique);
    hunter.masmorraTempAtiva = false;
    hunter.masmorraTempAceita = false;
    hunter.masmorraTempFimData = null;
    salvarDados();
    carregarEExibirInterface();
    adicionarMsgChat("☕ [MASMORRA FINALIZADA/SAÍDA]: Fenda fechada sem perdas de XP.");
}

function concluirMasmorraTemp() {
    tocarAudioSeguro(somXP);

    const conf = hunter.masmorraTempConfirmacoes || {};
    const cumpriuTudo = conf.flexDiamante && conf.polichinelos && conf.abdInfra;
    const cumpriuAlgum = conf.flexDiamante || conf.polichinelos || conf.abdInfra;

    hunter.masmorraTempAtiva = false;
    hunter.masmorraTempAceita = false;
    hunter.masmorraTempFimData = null;

    if (cumpriuTudo) {
        hunter.xpTotal += 2000;
        hunter.gold += 1000;

        if (!hunter.inventario.includes("lamina_sombras")) {
            hunter.inventario.push("lamina_sombras");
        }
        if (!hunter.titulosColecao.includes("[ Caçador de Fendas ]")) {
            hunter.titulosColecao.push("[ Caçador de Fendas ]");
        }

        avisarJogo("🏆 [MASMORRA CONCLUÍDA 100%!]\n\nExcelente! Superou o desafio completo a tempo!\n\nRecompensas:\n+2.000 XP!\n+1.000 Gold!\nArtefato: Lâmina do Soberano Silente\nTítulo Novo: [ Caçador de Fendas ]");
    } else if (cumpriuAlgum) {
        hunter.xpTotal += 800;
        hunter.gold += 400;

        if (!hunter.inventario.includes("anel_fenda")) {
            hunter.inventario.push("anel_fenda");
        }

        avisarJogo("⚖️ [MASMORRA CONCLUÍDA PARCIALMENTE]\n\nCumpriu parte dos exercícios!\n\nRecompensas Parciais:\n+800 XP!\n+400 Gold!\nArtefato: Anel Fragmentado da Fenda (Sem ganho de Título).");
    } else {
        avisarJogo("🚪 [MASMORRA ENCERRADA]\n\nNenhum exercício foi confirmado. A masmorra foi fechada sem prémios nem penalidades.");
    }

    salvarDados();
    carregarEExibirInterface();
}

/* ---------- HIDRATAÇÃO (RECOMENDADO) ---------- */
function adicionarAgua(qtdLitros) {
    tocarAudioSeguro(somClique);
    hunter.aguaIngerida = parseFloat(((hunter.aguaIngerida || 0) + qtdLitros).toFixed(2));
    if (qtdLitros > 0) registrarHistorico({ agua: qtdLitros });
    const meta = hunter.metaAgua || 3.0;

    if (hunter.aguaIngerida >= meta && !hunter.bonusAguaResgatadoHoje) {
        hunter.bonusAguaResgatadoHoje = true;
        hunter.xpTotal += 200;
        hunter.gold += 100;
        tocarAudioSeguro(somXP);
        semanalEvento('agua');
        adicionarMsgChat(`💧 [META RECOMENDADA BATIDA]: ${hunter.aguaIngerida.toFixed(2)}L! +200 XP e +100 Gold Bônus por hidratação!`);
    } else if (hunter.aguaIngerida < meta) {
        const pct = Math.round((hunter.aguaIngerida / meta) * 100);
        adicionarMsgChat(`💧 [HIDRATAÇÃO]: ${hunter.aguaIngerida.toFixed(2)}L de ${meta.toFixed(1)}L (${pct}%). Continue assim!`);
    }

    salvarDados();
    atualizarPainelAgua();
    atualizarAtributosERank();
    document.getElementById('user-gold').innerText = (hunter.gold || 0).toLocaleString('pt-BR');
}

function resetarAgua() {
    tocarAudioSeguro(somClique);
    hunter.aguaIngerida = 0.0;
    salvarDados();
    atualizarPainelAgua();
}

function atualizarPainelAgua() {
    const txtAtual = document.getElementById('agua-atual-texto');
    const txtMeta = document.getElementById('agua-meta-texto');
    const barFill = document.getElementById('agua-bar-fill');
    const badgeBonus = document.getElementById('badge-agua-bonus');

    const ingerida = hunter.aguaIngerida || 0.0;
    const meta = hunter.metaAgua || 3.0;

    if (txtAtual) txtAtual.innerText = ingerida.toFixed(2);
    if (txtMeta) txtMeta.innerText = meta.toFixed(1);

    if (barFill) {
        const porc = Math.min(100, (ingerida / meta) * 100);
        barFill.style.width = `${porc}%`;
    }

    if (badgeBonus) {
        if (hunter.bonusAguaResgatadoHoje) badgeBonus.classList.remove('escondido');
        else badgeBonus.classList.add('escondido');
    }
}

function emitirRelatorioAgua() {
    const ing = hunter.aguaIngerida || 0;
    const meta = hunter.metaAgua || 3.0;

    if (ing <= 0) {
        adicionarMsgChat(`💧 [RELATÓRIO DE HIDRATAÇÃO]: Ontem foram registrados 0.0L (meta recomendada: ${meta.toFixed(1)}L). Sem penalidades, mas seu corpo agradece mais água hoje!`);
    } else if (ing < meta) {
        const pct = Math.round((ing / meta) * 100);
        adicionarMsgChat(`💧 [RELATÓRIO DE HIDRATAÇÃO]: Ontem você bebeu ${ing.toFixed(2)}L de ${meta.toFixed(1)}L (${pct}%). Faltaram ${(meta - ing).toFixed(2)}L — sem penalidades. Bata a meta hoje para ganhar +200 XP e +100 Gold!`);
    } else {
        adicionarMsgChat(`💧 [RELATÓRIO DE HIDRATAÇÃO]: Meta recomendada atingida ontem (${ing.toFixed(2)}L)! Bônus de +200 XP e +100 Gold garantido. Excelente!`);
    }
}

/* ---------- RUPTURA ---------- */
// Ruptura surpresa: ~15% dos dias úteis (a partir do Rank D) uma fenda abre em um horário sorteado
function sortearRupturaDoDia() {
    const d = obterDataAtual();
    const dow = d.getDay();
    if (hunter.rankIndiceAtual < 1 || dow === 0 || dow === 6) return;
    if (hunter.rupturaAtiva || sistemaCongelado() || recuperacaoAtiva()) return;
    if (Math.random() >= 0.15) return;
    hunter.rupturaAlvoDia = obterDataReal().toDateString();
    hunter.rupturaAlvoHora = 9 + Math.floor(Math.random() * 12); // entre 9h e 20h
    hunter.rupturaAlvoTipo = (hunter.rankIndiceAtual >= 2 && Math.random() < 0.2) ? 'vermelha' : 'normal';
}

function verificarRupturaProgramada() {
    if (!hunter.rupturaAlvoDia || hunter.rupturaAtiva) return;
    const real = obterDataReal();
    if (hunter.rupturaAlvoDia !== real.toDateString()) { hunter.rupturaAlvoDia = null; return; }
    if (real.getHours() < hunter.rupturaAlvoHora) return;
    if (sistemaCongelado() || recuperacaoAtiva() || hunter.bossCombateAtivo || hunter.masmorraTempAtiva || hunter.zonaPunicao || hunter.pausaDiariasInicio) return;
    hunter.rupturaAlvoDia = null;
    hunter.ultimaRupturaDia = real.toDateString();
    hunter.rupturaAtiva = true;
    hunter.rupturaTipo = hunter.rupturaAlvoTipo === 'vermelha' ? 'vermelha' : 'normal';
    hunter.rupturaAlvoTipo = null;
    hunter.rupturaDuracaoMs = duracaoRupturaMs();
    hunter.rupturaFimData = new Date(real.getTime() + hunter.rupturaDuracaoMs).toISOString();
    salvarDados();
    carregarEExibirInterface();
    tocarAudioSeguro(somPortal);
    adicionarMsgChat(hunter.rupturaTipo === 'vermelha' ? `🔴 [RUPTURA CARMESIM]: uma fenda rara e perigosa se abriu! Você tem ${Math.round(hunter.rupturaDuracaoMs / 60000)} minutos. A recompensa é muito maior. Suas missões diárias ficam pausadas até lá.` : `🕳️ [RUPTURA DETECTADA]: uma fenda se abriu! Você tem ${Math.round(hunter.rupturaDuracaoMs / 60000)} minutos para fechá-la. Suas missões diárias ficam pausadas até lá.`);
}

function checarRupturaPortalSurpresa() {
    const cardRuptura = document.getElementById('card-ruptura-portal');
    if (!cardRuptura) return;

    if (hunter.rupturaAtiva) {
        cardRuptura.classList.remove('escondido');
        { const te = document.getElementById('texto-desafio-ruptura'); te.style.whiteSpace = 'pre-line'; te.innerText = textoDesafioRuptura(); }
        atualizarTimerRuptura();
    } else {
        cardRuptura.classList.add('escondido');
    }
}

function concluirRupturaPortal() {
    tocarAudioSeguro(somXP);
    const agora = obterDataReal();
    const dur = hunter.rupturaDuracaoMs || (RUPTURA_DURACAO_MIN * 60000);
    const restante = hunter.rupturaFimData ? (new Date(hunter.rupturaFimData) - agora) : dur;
    const hoje = obterDataAtual().toDateString();

    // Conquistas da Ruptura
    if (!hunter.diariaConcluida) hunter.rupPrioridade = true;           // fechou com Diárias pendentes
    if (restante < dur * 0.10) hunter.rupLimite = true;                  // fechou com <10% do tempo
    hunter.rupturaFechadaDia = hoje;
    if (hunter.ultimoTreinoRealDia === hoje) hunter.rupMultitarefa = true; // Diárias 100% no mesmo dia

    const vermelha = hunter.rupturaTipo === 'vermelha';
    hunter.rupturaAtiva = false;
    hunter.rupturaDesafio = null;
    hunter.rupturaFimData = null;
    hunter.rupturaTipo = 'normal';
    const bonusX = 1 + efeitoTitulo('xp_ruptura') + efeitoArvore('ruptura_xp') + bonusSombra('ruptura');
    const xp = Math.round((vermelha ? 4500 : 1500) * bonusX);
    const goldR = Math.round((vermelha ? 1500 : 500) * (1 + bonusSombra('ruptura')));
    hunter.xpTotal += xp;
    hunter.gold += goldR;
    registrarHistorico({ rupturas: 1 });
    const extras = [];
    if (vermelha) {
        hunter.rupturasVermelhas = (hunter.rupturasVermelhas || 0) + 1;
        ganharPontosHabilidade(1, 'Ruptura Carmesim selada');
        extras.push('🌳 +1 ponto de habilidade');
        if (!hunter.titulosColecao.includes('[ Caçador da Fenda Rubra ]')) { hunter.titulosColecao.push('[ Caçador da Fenda Rubra ]'); extras.push('🏷️ Título [ Caçador da Fenda Rubra ]'); }
        if (desbloquearMoldura('fenda_rubra')) extras.push('🖼️ Moldura Fenda Rubra');
    }
    salvarDados();
    carregarEExibirInterface();
    flutuarXp(xp);
    avisarJogo(`${vermelha ? '🔴 [RUPTURA CARMESIM SELADA!]' : '⚡ [RUPTURA CONTIDA!]'}\n\nRecompensas:\n+${xp.toLocaleString('pt-BR')} XP!\n+${goldR.toLocaleString('pt-BR')} Gold!${extras.length ? '\n' + extras.join('\n') : ''}\n\nSuas missões diárias foram retomadas.`);
}

/* ---------- BOSS MENSAL ---------- */
function checarEAtivarCicloBossFight() {
    const card = document.getElementById('card-boss-fight');
    if (!card) return;

    verificarExpiracaoBoss(false);

    if (sistemaCongelado()) {
        card.classList.add('escondido');
        return;
    }

    const dataAtual = obterDataAtual();

    // Congelamento só esconde o card quando NÃO há luta em andamento
    if (hunter.bossCongeladoAteData && !hunter.bossCombateAtivo) {
        const dataCongelada = new Date(hunter.bossCongeladoAteData);
        if (dataAtual < dataCongelada) {
            card.classList.add('escondido');
            return;
        } else {
            hunter.bossCongeladoAteData = null;
            hunter.bossReaberturaPendente = true;
            salvarDados();
        }
    }

    const est = estadoBoss();
    const chefe = chefeAtual();

    if (!est.visivel) {
        card.classList.add('escondido');
        atualizarContadorBoss();
        return;
    }

    garantirJanelaBoss();

    document.getElementById('boss-nome').innerText = chefe.nome;
    document.getElementById('boss-desc').innerText = `${chefe.desc} [Região: ${chefe.regiao}]`;
    document.getElementById('boss-nome').innerText = chefe.eco ? `${chefe.nome} (Eco nº ${(hunter.ecoVitorias || 0) + 1})` : chefe.nome;
    card.classList.remove('escondido');

    if (est.ativo) {
        document.getElementById('caixa-confirmacao-boss').classList.add('escondido');
        document.getElementById('container-hp-boss').classList.remove('escondido');
        atualizarBarraHpBoss();
    } else {
        document.getElementById('caixa-confirmacao-boss').classList.remove('escondido');
        document.getElementById('container-hp-boss').classList.add('escondido');
    }
    atualizarContadorBoss();
}

function atualizarBarraHpBoss() {
    const chefe = chefeAtual();
    const hpMax = chefe.hpMax;
    const hpAtual = Math.max(0, Math.round(hunter.bossHpAtual));

    const barraFill = document.getElementById('boss-hp-fill');
    const textoHp = document.getElementById('boss-hp-texto');

    if (barraFill && textoHp) {
        const porc = (hpAtual / hpMax) * 100;
        barraFill.style.width = `${porc}%`;
        textoHp.innerText = `${hpAtual} / ${hpMax} HP`;
    }
}

async function aceitarDesafioBossFight() {
    if ((hunter.fadiga || 0) >= 95 && !await confirmarJogo("🚨 Sua Fadiga está em 95% ou mais: há risco de lesão. Deseja entrar na Raid mesmo assim?\n\n(Se preferir, use a Pedra de Retorno.)")) {
        return;
    }
    tocarAudioSeguro(somPortal);
    hunter.bossCombateAtivo = true;
    hunter.bossReaberturaPendente = false;
    const chefe = chefeAtual();

    garantirJanelaBoss();
    zerarProgressoBoss();
    hunter.bossHpAtual = chefe.hpMax;

    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
    adicionarMsgChat("⚔️ [ENTRANDO NA MASMORRA]: Modo Dungeon ativado! Você tem 2 DIAS (sábado e domingo) para completar a meta. Seu progresso fica salvo e não há perda de XP se não terminar tudo hoje.");
}

function processarPedraTeleporte(motivo) {
    document.getElementById('modal-pedra-teleporte').classList.add('escondido');
    tocarAudioSeguro(somPortal);

    const dataAtual = obterDataAtual();

    // A Raid é encerrada: zera progresso e contador de 48h (sem perda de XP)
    hunter.bossFimData = null;
    hunter.cicloBossAberto = null;
    zerarProgressoBoss();

    if (motivo === 'imprevisto') {
        if (hunter.bossAdiado) { avisarJogo("⛔ O adiamento de 1 semana já foi usado neste Boss. Enfrente o Portal ou cancele por metas elevadas."); return; }
        hunter.bossAdiado = true;
        dataAtual.setDate(dataAtual.getDate() + 7);
        hunter.bossCongeladoAteData = dataAtual.toISOString();
        hunter.bossCombateAtivo = false;

        adicionarMsgChat("💎 [PEDRA DE RETORNO]: Retirada emergencial realizada! O Portal reabre daqui a 7 dias. Atenção: este adiamento só pode ser usado UMA vez por Boss. Na semana que vem você terá que enfrentar o Portal, cancelá-lo por metas elevadas ou aceitar a perda.");
    }
    else if (motivo === 'dificil') {
        dataAtual.setDate(dataAtual.getDate() + 30);
        hunter.bossCongeladoAteData = dataAtual.toISOString();
        hunter.bossMetasCongeladas = { ...hunter.metasCalculadas };
        hunter.bossAdiado = false;
        hunter.bossCombateAtivo = false;

        adicionarMsgChat("💎 [PEDRA DE RETORNO]: Congelamento tático aplicado por 30 dias!");
    }

    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
}

/* ---------- AVISO PRÉVIO DO BOSS (TELA CHEIA) ---------- */
function checarAvisoPrevioBoss() {
    const info = infoCalendarioBoss(obterDataAtual());
    if (!info.avisoPrevio || hunter.bossCombateAtivo || sistemaCongelado()) return;
    if (!bossDisponivel(info)) return;
    if (hunter.avisoBossVistoCiclo === info.ciclo) return;

    const rankup = document.getElementById('modal-rankup');
    const sombra = document.getElementById('modal-extracao-sombra');
    if (rankup && !rankup.classList.contains('escondido')) return;
    if (sombra && !sombra.classList.contains('escondido')) return;

    abrirAvisoBoss(false, info);
}

function abrirAvisoBoss(modoDev, info) {
    modoDevAvisoBoss = modoDev;
    const chefe = chefeAtual();
    const ref = info || infoCalendarioBoss(obterDataAtual());

    document.getElementById('aviso-boss-titulo').innerText = chefe.nome;
    document.getElementById('aviso-boss-regiao').innerText = `📍 ${chefe.regiao}`;

    if (modoDev) {
        document.getElementById('aviso-boss-tag').innerText = "🛠️ [MODO DEV] SIMULAÇÃO DO AVISO PRÉVIO DE RAID";
        document.getElementById('aviso-boss-prazo').innerText = `O Portal abre no último fim de semana do mês (${ref.alvo.toLocaleDateString('pt-BR')}). Confirmar pula direto para a Arena de Batalha.`;
        document.getElementById('btn-confirmar-aviso-boss').innerText = "[ CONFIRMAR ]";
    } else {
        const dias = Math.max(1, ref.dias);
        document.getElementById('aviso-boss-tag').innerText = "🚨 ALERTA DE RAID IMINENTE 🚨";
        document.getElementById('aviso-boss-prazo').innerText = `O Portal abre no sábado, ${ref.alvo.toLocaleDateString('pt-BR')} — faltam ${dias} dia(s)!`;
        document.getElementById('btn-confirmar-aviso-boss').innerText = "[ ENTENDIDO ]";
    }

    tocarAudioSeguro(somPortal);
    document.getElementById('modal-aviso-boss').classList.remove('escondido');
}

function confirmarAvisoBoss() {
    tocarAudioSeguro(somClique);
    document.getElementById('modal-aviso-boss').classList.add('escondido');

    if (modoDevAvisoBoss && hunter.isDev) {
        // Bypass de teste: vai direto para a Arena de Batalha
        modoDevAvisoBoss = false;
        const chefe = chefeAtual();
        // Limpa qualquer adiamento (pedra de teleporte) para a Arena abrir sempre
        hunter.bossCongeladoAteData = null;
        hunter.bossMetasCongeladas = null;
        hunter.bossCombateAtivo = true;
        hunter.bossReaberturaPendente = false;
        hunter.diariaConcluida = false;
        hunter.bossHpAtual = chefe.hpMax;
        zerarProgressoBoss();
        hunter.bossFimData = new Date(obterDataAtual().getTime() + 48 * 3600 * 1000).toISOString();
        hunter.cicloBossAberto = infoCalendarioBoss(obterDataAtual()).ciclo;
        recalcularMetasDoRank();
        salvarDados();
        carregarEExibirInterface();
        adicionarMsgChat("🛠️ [DEV MODE]: Bypass ativo — Arena do Boss aberta para teste de HP, mecânicas e saques!");
    } else {
        const info = infoCalendarioBoss(obterDataAtual());
        hunter.avisoBossVistoCiclo = info.ciclo;
        salvarDados();
        adicionarMsgChat("📅 [ALERTA DE RAID]: Semana Preparatória ativada — volume -25% (Seg–Qui), 100% do XP. Sexta: descanso obrigatório.");
    }
}

/* ---------- METAS DO RANK ---------- */
function recalcularMetasDoRank() {
    hunter.preparatoriaAtiva = false;
    hunter.cargaAliviadaAtiva = false;
    hunter.fadigaReducaoAtiva = false;
    hunter.folgaBonusAtivo = false;

    if (hunter.bossMetasCongeladas && hunter.bossCombateAtivo) {
        hunter.metasCalculadas = { ...hunter.bossMetasCongeladas };
        return;
    }

    const rankInfo = ESCALA_RANKS[hunter.rankIndiceAtual];
    let fator = hunter.fatorDificuldadeAjustado || rankInfo.fator;

    const dataAtual = obterDataAtual();
    const diaSemana = dataAtual.getDay();
    const ehFimDeSemana = (diaSemana === 0 || diaSemana === 6) && !calForcaDiaUtil;

    if (!hunter.bossCombateAtivo) fator = fator * fatorDesespero();

    if (hunter.bossCombateAtivo) {
        fator = fator * 1.75;
    } else if (ehFimDeSemana) {
        fator = fator * 0.5;
    } else {
        const info = infoCalendarioBoss(dataAtual);
        if (info.fase === 'preparatoria' && bossDisponivel(info)) {
            fator = fator * 0.75;
            hunter.preparatoriaAtiva = true;
            hunter.fadigaFolgaBonus = 0; // semana preparatória: o +10% pós-folga não se aplica
        } else if ((hunter.cargaAliviadaRestante || 0) > 0 && !hunter.zonaPunicao) {
            fator = fator * 0.65; // Carga Aliviada: -35% de volume (XP continua 100%)
            hunter.cargaAliviadaAtiva = true;
        } else if (hunter.fadigaReduzirProx && !hunter.zonaPunicao) {
            fator = fator * 0.75; // Redução por fadiga alta: -25% (o XP acompanha as repetições feitas)
            hunter.fadigaReducaoAtiva = true;
        } else if ((hunter.fadigaFolgaBonus || 0) > 0 && !hunter.zonaPunicao) {
            fator = fator * 1.10; // Pós-folga: +10% só neste treino
            hunter.folgaBonusAtivo = true;
        }
    }

    // Escada do "estava muito pesado": todas as metas (inclusive leitura) acompanham o ajuste, fora da Raid e da Zona
    const ajusteMeta = (!hunter.bossCombateAtivo && !hunter.zonaPunicao) ? Math.min(1, Math.max(0.5, Number(hunter.ajusteMetaPct) || 1)) : 1;
    fator = fator * ajusteMeta;

    hunter.posturaAtiva = false;
    hunter.recMetaAtiva = false;
    if (!hunter.bossCombateAtivo && !hunter.zonaPunicao) {
        const retorno = (hunter.recuperacao && hunter.recuperacao.retornoRestante) || 0;
        if (recuperacaoAtiva()) { fator = fator * 0.5; hunter.recMetaAtiva = true; }
        else if (retorno > 0) { fator = fator * [1, 0.9, 0.8, 0.7][Math.min(3, retorno)]; hunter.recMetaAtiva = true; }
        else if (hunter.buffTitulo === 'postura' && !hunter.preparatoriaAtiva && !hunter.cargaAliviadaAtiva && !hunter.fadigaReducaoAtiva && !ehFimDeSemana) { fator = fator * 1.10; hunter.posturaAtiva = true; }
    }

    const cfg = cardioCfg();
    const cardioBruto = hunter.maximos.corrida * fator;
    const cardioMeta = cfg.casas === 0 ? Math.max(1, Math.round(cardioBruto)) : parseFloat(cardioBruto.toFixed(1));

    if (hunter.cargaAliviadaAtiva) {
        // Razão exata entre o XP da meta cheia e o da meta reduzida (evita erro de arredondamento)
        const f0 = fator / 0.65;
        const cb0 = hunter.maximos.corrida * f0;
        const cheia = { flexoes: Math.max(1, Math.round(hunter.maximos.flexoes * f0)), abdominais: Math.max(1, Math.round(hunter.maximos.abdominais * f0)), agachamentos: Math.max(1, Math.round(hunter.maximos.agachamentos * f0)), corrida: cfg.casas === 0 ? Math.max(1, Math.round(cb0)) : parseFloat(cb0.toFixed(1)) };
        const red = { flexoes: Math.max(1, Math.round(hunter.maximos.flexoes * fator)), abdominais: Math.max(1, Math.round(hunter.maximos.abdominais * fator)), agachamentos: Math.max(1, Math.round(hunter.maximos.agachamentos * fator)), corrida: cardioMeta };
        hunter.razaoAliviada = xpBrutoExercicios(cheia) / Math.max(1, xpBrutoExercicios(red));
    } else {
        hunter.razaoAliviada = null;
    }

    hunter.metasCalculadas = {
        flexoes: Math.max(1, Math.round(hunter.maximos.flexoes * fator)),
        abdominais: Math.max(1, Math.round(hunter.maximos.abdominais * fator)),
        agachamentos: Math.max(1, Math.round(hunter.maximos.agachamentos * fator)),
        corrida: cardioMeta,
        leitura: Math.max(5, Math.round(hunter.maximos.leitura * (hunter.fatorDificuldadeAjustado || 1.0) * ajusteMeta))
    };
    if (hunter.bossCombateAtivo) {
        const ch = chefeAtual();
        if (ch && ch.eco) (ch.foco || []).forEach(k => {
            const v = hunter.metasCalculadas[k];
            hunter.metasCalculadas[k] = (k === 'corrida' && cfg.casas !== 0) ? parseFloat((v * 1.25).toFixed(1)) : Math.max(1, Math.round(v * 1.25));
        });
    }
    aplicarTransicaoExercicios();
    aplicarVariacoes();
}

// Transição do exercício assistido para o principal (séries mistas, estágios 1 a 4)
function aplicarTransicaoExercicios() {
    const m = hunter.metasCalculadas;
    PROG_KEYS.forEach(k => {
        const pr = (hunter.progAlt || {})[k];
        if (!pr) return;
        pr.base = m[k]; // meta cheia do exercício assistido, antes da divisão
        if (!pr.estagio || hunter.capacidade[k] !== false || hunter.bossCombateAtivo) return;
        if (k === 'corrida' && hunter.cardioTipo !== 'caminhada') return;
        const base = m[k];
        const shareP = PROG_SHARE_PRINCIPAL[pr.estagio];
        const fracA = PROG_SHARE_ASSISTIDO[pr.estagio];
        if (k === 'corrida') {
            m.corrida_p = Math.max(0.2, parseFloat((base * shareP).toFixed(1)));
            m.corrida = Math.max(0.2, parseFloat((base * fracA).toFixed(1)));
        } else {
            m[k + '_p'] = Math.max(1, Math.round(base * shareP));
            m[k] = Math.max(1, Math.round(base * fracA));
        }
    });
}

function nomeSerieForca(k) {
    if (k === 'corrida') return "Corrida (trecho de força)";
    return `${EXERCICIOS[k].normal} (série de força)`;
}

function iconeSerie(k) { return k === 'corrida' ? "🏃" : EXERCICIOS[k].icone; }

// Chamada ao concluir um treino normal de dia útil: conta treinos e decide quando perguntar
function avaliarProgressaoAlternativa() {
    if (!hunter.progAlt) hunter.progAlt = {};
    const m = hunter.metasCalculadas;
    let algum = false;
    PROG_KEYS.forEach(k => {
        if (hunter.capacidade[k] !== false) return;
        if (k === 'corrida' && hunter.cardioTipo !== 'caminhada') return;
        const pr = hunter.progAlt[k] || (hunter.progAlt[k] = { estagio: 0, treinos: 0, ultimaSubida: null, pergunta: false });
        const base = pr.base || m[k];
        if (pr.estagio === 0) {
            // Pergunta cedo: quando você FEZ (ou tem como meta) o volume de conforto em 3 treinos,
            // ou, no máximo, a cada 8 treinos com o exercício assistido.
            const feito = Math.max(base, (hunter.execucoesDigitadas || {})[k] || 0);
            if (feito >= PROG_LIMIAR[k]) pr.treinos = (pr.treinos || 0) + 1;
            pr.treinosTotais = (pr.treinosTotais || 0) + 1;
            if (pr.treinos >= 3 || pr.treinosTotais >= 8) { pr.pergunta = true; algum = true; }
        } else {
            pr.treinos = (pr.treinos || 0) + 1;
            const dias = pr.ultimaSubida ? diffDias(obterDataAtual(), new Date(pr.ultimaSubida)) : 99;
            if (pr.treinos >= 3 && dias >= 7 && (hunter.fadiga || 0) < 70) { pr.pergunta = true; algum = true; }
        }
    });
    return algum;
}

function marcarPerguntaProgressaoRankUp() {
    if (!hunter.progAlt) hunter.progAlt = {};
    PROG_KEYS.forEach(k => {
        if (hunter.capacidade[k] !== false) return;
        if (k === 'corrida' && hunter.cardioTipo !== 'caminhada') return;
        const pr = hunter.progAlt[k] || (hunter.progAlt[k] = { estagio: 0, treinos: 0, ultimaSubida: null, pergunta: false });
        const base = pr.base || hunter.maximos[k];
        if (pr.estagio === 0 && hunter.maximos[k] >= PROG_LIMIAR[k]) pr.pergunta = true;
        if (pr.estagio > 0) pr.pergunta = true;
    });
}

function graduarExercicio(k) {
    const pr = hunter.progAlt[k];
    const base = pr.base || hunter.maximos[k];
    hunter.capacidade[k] = true;
    if (k === 'corrida') {
        hunter.cardioTipo = 'corrida';
        hunter.maximos.corrida = Math.max(1, parseFloat((base * 0.5).toFixed(1)));
    } else {
        hunter.maximos[k] = Math.max(2, Math.round(base * 0.77)); // o principal pesa ~30% mais que o assistido
    }
    hunter.progAlt[k] = { estagio: 0, treinos: 0, ultimaSubida: null, pergunta: false, graduado: true };
    const nome = k === 'corrida' ? 'Corrida' : EXERCICIOS[k].normal;
    adicionarMsgChat(`🎓 [GRADUAÇÃO]: você completou a transição e agora faz ${nome} do jeito principal, valendo 100% do XP!`);
    avisarJogo(`🎓 [GRADUAÇÃO DE EXERCÍCIO]\n\nVocê dominou a transição! ${nome} agora é o exercício principal (100% do XP). O assistido saiu da sua rotina.`);
}

async function processarPerguntasProgressao() {
    if (!hunter.progAlt) return;
    let mudou = false;
    for (const k of PROG_KEYS) {
        const pr = hunter.progAlt[k];
        if (!pr || !pr.pergunta) continue;
        pr.pergunta = false;
        mudou = true;
        const ad = k === 'corrida' ? 'Caminhada' : EXERCICIOS[k].adaptado;
        const no = k === 'corrida' ? 'Corrida' : EXERCICIOS[k].normal;
        const hoje = obterDataAtual().toISOString();
        if (pr.estagio === 0) {
            const ok = await confirmarJogo(`🔓 [EVOLUÇÃO DE EXERCÍCIO]\n\nVocê consegue fazer ${ad} com conforto, em volume alto?\n\nSe sim, o Sistema inicia uma transição GRADUAL para ${no}: no começo do treino (descansado) você faz poucas repetições de ${no}, e o resto do volume continua em ${ad}.\n• ${no}: 100% do XP por repetição\n• ${ad}: 50% do XP por repetição`, { sim: '[ SIM, INICIAR TRANSIÇÃO ]', nao: '[ AINDA NÃO ]' });
            pr.treinos = 0; pr.treinosTotais = 0;
            if (ok) {
                pr.estagio = 1; pr.ultimaSubida = hoje;
                adicionarMsgChat(`🔓 [TRANSIÇÃO INICIADA]: estágio 1 de 4 para ${no}. Faça a série de força no início do treino, com técnica perfeita.`);
            }
        } else {
            const ok = await confirmarJogo(`📈 [PROGRESSÃO - ${no}]\n\nO estágio ${pr.estagio} de 4 foi confortável?`, { sim: '[ SIM, SUBIR DE ESTÁGIO ]', nao: '[ AINDA NÃO ]' });
            pr.treinos = 0;
            if (ok) {
                pr.estagio += 1; pr.ultimaSubida = hoje;
                if (pr.estagio >= 5) { graduarExercicio(k); continue; }
                adicionarMsgChat(`📈 [PROGRESSÃO]: ${no} subiu para o estágio ${pr.estagio} de 4.`);
            } else if (pr.estagio > 1 && await confirmarJogo(`Foi difícil demais ou doloroso?\n\nSe sim, o Sistema volta 1 estágio (mais seguro).`, { sim: '[ SIM, VOLTAR 1 ESTÁGIO ]', nao: '[ MANTER O ESTÁGIO ]' })) {
                pr.estagio -= 1; pr.ultimaSubida = hoje;
                adicionarMsgChat(`🛟 [PROGRESSÃO]: ${no} voltou para o estágio ${pr.estagio}. Sem pressa: o corpo se adapta no seu tempo.`);
            } else {
                pr.ultimaSubida = hoje;
            }
        }
    }
    if (mudou) {
        recalcularMetasDoRank();
        salvarDados();
        carregarEExibirInterface();
    }
}



/* ---------- CONCLUIR TREINO ---------- */
function concluirTreinoIntegral() {
    if (sistemaCongelado()) return;
    if (hunter.pausaDiariasInicio) {
        avisarJogo("⏸️ As Missões Diárias estão pausadas enquanto a Ruptura/Masmorra está ativa. Termine-a primeiro!");
        return;
    }
    // Zona "aguardando" bloqueia o treino comum, mas NÃO a Raid em andamento (antes o botão da Raid não fazia nada)
    if (hunter.zonaPunicao && hunter.zonaPunicaoEtapa === 'aguardando' && !hunter.bossCombateAtivo) return;
    if (hunter.diariaConcluida && !hunter.isDev) {
        adicionarMsgChat("[SISTEMA]: Treino de hoje já foi registrado!");
        return;
    }

    const metas = hunter.metasCalculadas;
    const ex = hunter.execucoesDigitadas;
    const ehFDS = ehFimDeSemanaAtual();
    const cfg = cardioCfg();
    const teto = (m) => ehFDS ? m : m * 2; // fim de semana: sem bônus de overachievement

    const modoBoss = !!hunter.bossCombateAtivo;
    const punicao = !!(hunter.zonaPunicao && hunter.zonaPunicaoEtapa === 'ativa' && !modoBoss);
    let valid;
    if (modoBoss) {
        // Raid de 2 dias: vale o progresso acumulado (sábado + domingo)
        if (!bossMetaCompleta()) {
            avisarJogo("⚔️ A meta da Raid ainda não foi completada. Registre o restante dos exercícios (você tem até o fim do domingo).");
            return;
        }
        valid = { flexoes: metas.flexoes, agachamentos: metas.agachamentos, abdominais: metas.abdominais, corrida: metas.corrida, leitura: metas.leitura };
    } else {
        valid = {
            flexoes: Math.min(ex.flexoes, teto(metas.flexoes)),
            agachamentos: Math.min(ex.agachamentos, teto(metas.agachamentos)),
            abdominais: Math.min(ex.abdominais, teto(metas.abdominais)),
            corrida: Math.min(ex.corrida, teto(metas.corrida)),
            leitura: ehFDS ? Math.min(ex.leitura, metas.leitura) : ex.leitura
        };
        PROG_KEYS.forEach(k => { if (metas[k + '_p']) valid[k + '_p'] = Math.min(ex[k + '_p'] || 0, teto(metas[k + '_p'])); });
        // V33: variações valem só até a meta (sem bônus de overachievement: exercício mais difícil, risco maior)
        VAR_KEYS.forEach(k => { if (metas[k + '_v']) valid[k + '_v'] = Math.min(ex[k + '_v'] || 0, metas[k + '_v']); });
    }

    hunter.totaisAcumulados.flexoes += valid.flexoes + (valid.flexoes_p || 0) + (valid.flexoes_v || 0);
    hunter.totaisAcumulados.abdominais += valid.abdominais + (valid.abdominais_p || 0) + (valid.abdominais_v || 0);
    hunter.totaisAcumulados.agachamentos += valid.agachamentos + (valid.agachamentos_p || 0) + (valid.agachamentos_v || 0);
    hunter.totaisAcumulados.leitura += valid.leitura;
    if (cfg.unidade === "Km") hunter.totaisAcumulados.corrida += valid.corrida + (valid.corrida_p || 0);

    const totalXPBase = xpBaseDoTreino(valid);

    // Proporção do volume cumprido (para Fadiga e Gold)
    const razoes = [
        valid.flexoes / metas.flexoes,
        valid.agachamentos / metas.agachamentos,
        valid.abdominais / metas.abdominais,
        valid.corrida / metas.corrida
    ];
    const ratio = Math.min(2, Math.max(1, razoes.reduce((a, b) => a + b, 0) / razoes.length));

    // Bônus de XP: equipamento + Sombras convocadas (+ consumíveis, que não valem na Raid nem na Zona de Penitência)
    const consumiveisValem = !modoBoss && !punicao;
    let bonusMult = 1.0 + bonusXpEquipamento(valid) + bonusXpArvore(valid, ratio, consumiveisValem) + bonusSombra('xp');
    if (consumiveisValem && hunter.posturaAtiva) bonusMult += 0.10;
    let multPergaminho = 1;
    let gastouDuplo = false, gastouLigeiro = false;

    if (consumiveisValem && hunter.pedrasPolimento > 0) {
        bonusMult += 0.15;
        hunter.pedrasPolimento -= 1;
        adicionarMsgChat("💎 [POLIMENTO ATIVO]: Bônus de +15% XP consumido da Pedra de Polimento!");
    }
    if (consumiveisValem) {
        if ((hunter.buffDuploRestante || 0) > 0) { multPergaminho = 2; gastouDuplo = true; }
        else if ((hunter.buffLigeiroRestante || 0) > 0) { multPergaminho = 1.5; gastouLigeiro = true; }
    }

    let totalXP = Math.round(totalXPBase * bonusMult * multPergaminho);
    if (punicao) totalXP = 0; // Punição cumprida: dia contado, mas sem ganho de XP
    // Economia calibrada: ~20 a 30 de Gold por treino (fim de semana: 12)
    let totalGoldGanhado = ehFDS ? 12 : 20 + Math.round((ratio - 1) * 10);
    totalGoldGanhado = Math.round(totalGoldGanhado * (1 + efeitoArvore('gold_treino')));

    let xpPremioBoss = 0;
    if (modoBoss) {
        const chefe = chefeAtual();
        hunter.bossHpAtual = 0; // meta completa nos 2 dias = chefe derrotado
        atualizarBarraHpBoss();

        if (hunter.bossHpAtual <= 0) {
            xpPremioBoss = Math.round(chefe.xpPremio * (1 + efeitoArvore('xp_boss')));
            totalXP += xpPremioBoss;
            totalGoldGanhado += 2000;

            if (chefe.eco) totalGoldGanhado += 3000;
            if (chefe.itemDrop && !hunter.inventario.includes(chefe.itemDrop)) {
                hunter.inventario.push(chefe.itemDrop);
            }
            hunter.materiaisBoss = (hunter.materiaisBoss || 0) + 1;

            tocarAudioSeguro(somXP);
            if (chefe.eco) vitoriaEco(chefe);
            else avisarJogo(`🏆 [PORTAL CONQUISTADO!]\n\nDerrotou ${chefe.nome}!\nRecompensas:\n+${chefe.xpPremio} XP!\n+2.000 Gold!\nArtefato: ${(BANCO_ITENS.find(i => i.id === chefe.itemDrop) || {}).nome || chefe.itemDrop}\n💠 +1 Material Raro de Boss`);

            hunter.bossCombateAtivo = false;
            hunter.bossVencidoDia = obterDataAtual().toDateString();
            hunter.bossAdiado = false;
            hunter.cicloBossConcluido = infoCalendarioBoss(obterDataAtual()).ciclo;
            hunter.bossReaberturaPendente = false;
            if (chefe.id === BANCO_CHEFES.length - 1) { hunter.bossFinalDerrotado = true; adicionarMsgChat('🌌 [TRONO DO CAOS]: Morghul caiu! Nos próximos meses, os ECOS dos chefes antigos virão desafiar o Soberano, com recompensas cosméticas e pontos de habilidade.'); }
            hunter.bossIndiceAtual = Math.min(hunter.bossIndiceAtual + 1, BANCO_CHEFES.length - 1);
            hunter.bossFimData = null;
            hunter.cicloBossAberto = null;
            zerarProgressoBoss();
        }
    }

    // Ganho de atributos (bônus de equipamento são aplicados dinamicamente na exibição)
    const multForca = 1 + bonusEquipado("forca_mult");
    hunter.forca = parseFloat((hunter.forca + 2 * multForca).toFixed(1));
    hunter.agilidade += 2;
    hunter.vitalidade += 2;
    hunter.resistencia += 2;
    hunter.inteligencia += 3;

    // Fadiga proporcional ao volume
    const fadigaAntes = hunter.fadiga || 0;
    let fadigaGanha;
    if (ehFDS) {
        fadigaGanha = 8; // 50% da meta: +7% a +8%
    } else {
        fadigaGanha = Math.round(15 + (ratio - 1) * 6); // 100% = +15 | 150% = +18 | 200% = +21
        if (!modoBoss) fadigaGanha += fadigaDasVariacoes(valid); // V33: variação difícil cansa um pouco mais
    }
    // A Fadiga acompanha o volume real de treino
    const aliviadaNesteTreino = !!hunter.cargaAliviadaAtiva;
    if (hunter.fadigaReducaoAtiva) fadigaGanha = Math.max(1, Math.round(fadigaGanha * 0.75));
    if (aliviadaNesteTreino) fadigaGanha = Math.max(1, Math.round(fadigaGanha * 0.65));
    else if (!modoBoss && fatorDesespero() > 1) fadigaGanha = Math.round(fadigaGanha * fatorDesespero());
    // Bônus de Vitalidade dos equipamentos: ganha menos Fadiga
    fadigaGanha = Math.max(1, Math.round(fadigaGanha * (1 - Math.min(0.5, efeitoEquip('fadiga_menos')))));
    hunter.fadiga = Math.min(100, fadigaAntes + fadigaGanha);

    hunter.xpTotal += totalXP;
    registrarXpDoDia(totalXP - xpPremioBoss);
    if (punicao) {
        hunter.punicoesSeguidas = (hunter.punicoesSeguidas || 0) + 1;
        hunter.zonaXpTreino = 0;
        hunter.zonaPerdaEntrada = 0;
    }
    hunter.zonaPunicao = false;
    hunter.zonaPunicaoEtapa = null;

    // Efeitos temporários gastos neste treino
    if (hunter.fadigaReducaoAtiva) { hunter.fadigaReduzirProx = false; adicionarMsgChat("🛡️ [REDUÇÃO DE METAS]: treino mais leve concluído. As metas voltam ao normal."); }
    if (hunter.folgaBonusAtivo) { hunter.fadigaFolgaBonus = 0; adicionarMsgChat("💪 [PÓS-FOLGA]: treino com +10% concluído. As metas voltam ao normal a partir do próximo."); }
    if (gastouDuplo) hunter.buffDuploRestante -= 1;
    if (gastouLigeiro) hunter.buffLigeiroRestante -= 1;
    if (aliviadaNesteTreino) {
        hunter.cargaAliviadaRestante = Math.max(0, (hunter.cargaAliviadaRestante || 0) - 1);
        if (hunter.cargaAliviadaRestante === 0) adicionarMsgChat("🧪 [CARGA ALIVIADA]: o efeito da Poção de Alívio Vital terminou. Suas metas voltam ao normal.");
    }
    let perguntarProgressao = false;
    if (!modoBoss && !punicao && !ehFDS) perguntarProgressao = avaliarProgressaoAlternativa();
    if (!modoBoss && !punicao && !ehFDS) registrarUsoVariacoes(valid);
    if (!modoBoss && !punicao) {
        hunter.ultimoTreinoRealDia = obterDataAtual().toDateString();
        if (hunter.rupturaFechadaDia === hunter.ultimoTreinoRealDia) hunter.rupMultitarefa = true;
    }
    hunter.gold += totalGoldGanhado;
    hunter.streakDias = (hunter.streakDias || 0) + 1;
    hunter.diariaConcluida = true;
    hunter.ultimoDiaConcluido = obterDataAtual().toDateString();
    // Escada do "estava muito pesado": depois de um treino normal de dia útil o Sistema pergunta como foi
    if (hunter.ajusteMetaPerguntar && !modoBoss && !punicao && !ehFDS) hunter.ajusteMetaAguardaResposta = true;

    {
        const vol = {
            flexoes: valid.flexoes + (valid.flexoes_p || 0) + (valid.flexoes_v || 0), abdominais: valid.abdominais + (valid.abdominais_p || 0) + (valid.abdominais_v || 0),
            agachamentos: valid.agachamentos + (valid.agachamentos_p || 0) + (valid.agachamentos_v || 0), corrida: valid.corrida + (valid.corrida_p || 0), leitura: valid.leitura
        };
        registrarHistorico({ treino: true, tipo: modoBoss ? 'raid' : punicao ? 'zona' : 'treino', flexoes: vol.flexoes, abdominais: vol.abdominais, agachamentos: vol.agachamentos, corrida: vol.corrida, leitura: vol.leitura, streak: hunter.streakDias });
        const cheio = valid.flexoes >= metas.flexoes && valid.abdominais >= metas.abdominais && valid.agachamentos >= metas.agachamentos && valid.corrida >= metas.corrida && valid.leitura >= metas.leitura && VAR_KEYS.every(k => !metas[k + '_v'] || (valid[k + '_v'] || 0) >= metas[k + '_v']);
        semanalEvento('treino', { punicao, cheio, vol });
        if (!modoBoss && !punicao) sombrasEvento(vol);
        if (hunter.posturaAtiva) { hunter.buffTitulo = null; hunter.posturaAtiva = false; adicionarMsgChat('⚔️ [POSTURA DE GUERRA]: treino concluído, o efeito foi consumido.'); }
        if (!modoBoss && !punicao && !recuperacaoAtiva() && hunter.recuperacao && (hunter.recuperacao.retornoRestante || 0) > 0) {
            hunter.recuperacao.retornoRestante -= 1;
            if (hunter.recuperacao.retornoRestante === 0) adicionarMsgChat('🩹 [RETORNO CONCLUÍDO]: suas metas voltaram ao normal.');
        }
        verificarMarcosStreak();
        flutuarXp(totalXP);
    }

    if (hunter.rankIndiceAtual >= 2 && !hunter.jobChangeConcluido) {
        hunter.jobChangeProgresso = (hunter.jobChangeProgresso || 0) + 1;
        if (hunter.jobChangeProgresso >= 3) {
            hunter.jobChangeConcluido = true;
            if (!hunter.titulosColecao.includes("[ Invocador Supremo ]")) {
                hunter.titulosColecao.push("[ Invocador Supremo ]");
            }
            avisarJogo("🩸 [PROVA DE FOGO CONCLUÍDA!]\n\nConquistou a Mudança de Classe!\nTítulo Desbloqueado: [ Invocador Supremo ]!");
        }
    }

    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
    if (punicao) {
        const amanha = obterDataAtual(); amanha.setDate(amanha.getDate() + 1);
        const fdsAmanha = (amanha.getDay() === 0 || amanha.getDay() === 6);
        const quando = fdsAmanha ? "O descanso do fim de semana é respeitado e o treino normal, com ganho de XP, volta na segunda-feira." : "Seus treinos normais recomeçarão no próximo dia.";
        adicionarMsgChat(`✅ [PUNIÇÃO CUMPRIDA]: você saiu da Zona de Penitência! O dia conta como treino concluído (+${totalGoldGanhado} Gold, Streak ${hunter.streakDias}), mas sem ganho de XP. 🛡️ Fadiga +${fadigaGanha}%. ${quando}`);
        avisarJogo(`✅ Você saiu da Zona de Penitência!\n\n${quando}`);
    } else {
        adicionarMsgChat(`🏆 [TREINO CUMPRIDO]: +${totalXP.toLocaleString('pt-BR')} XP e +${totalGoldGanhado} Gold! 🔥 Streak: ${hunter.streakDias} dias. 🛡️ Fadiga +${fadigaGanha}% (${Math.round(hunter.fadiga)}%).`);
    }
    avisarLimiaresFadiga(fadigaAntes, hunter.fadiga);
    if (perguntarProgressao) setTimeout(processarPerguntasProgressao, 400);
    if (!modoBoss && !punicao) setTimeout(() => processarVariacoes().catch(() => {}), 900);
}

/* ---------- MISSÕES DIÁRIAS ---------- */
function htmlLinhaMissao(chave, inputId, btnId, icone, rotulo, unidade, meta, tetoVal, step, estiloLinha, estiloLabel, estiloBtn) {
    const valorInicial = hunter.execucoesDigitadas[chave] || meta;
    const un = unidade ? ` ${unidade}` : "";
    const tetoTxt = (tetoVal === null) ? "Sem Limite" : `${tetoVal}${un}`;
    const tetoArg = (tetoVal === null) ? "null" : tetoVal;
    const adaptTag = hunter.capacidade[chave] === false ? " 🔻XP-50%" : "";
    const tituloCompleto = `${rotulo}${adaptTag} (Mín: ${meta}${un} | Máx: ${tetoTxt})`;
    const maxAttr = (tetoVal === null) ? "" : `max="${tetoVal}"`;

    return `
        <div class="missao-item-input" style="${estiloLinha || ''}">
            <span class="missao-meta-label" style="${estiloLabel || ''}" title="${tituloCompleto}">${icone} ${rotulo}${adaptTag} (Mín: ${meta}${un} | Máx: ${tetoTxt}):</span>
            <input type="number" ${step ? `step="${step}"` : ""} ${maxAttr} min="0" id="${inputId}" class="input-resultado-exec" value="${valorInicial}" oninput="limitarInputExec(this, ${tetoArg})">
            <button type="button" id="${btnId}" class="btn-confirmar-ex" style="${estiloBtn || ''}" onclick="confirmarExercicio('${chave}', '${inputId}', ${meta}, ${tetoArg})">CONFIRMAR</button>
        </div>`;
}

function htmlLinhaBoss(chave, icone, rotulo, unidade, meta, step, estiloLinha) {
    const prog = (hunter.bossProgresso && hunter.bossProgresso[chave]) || 0;
    const restante = Math.max(0, parseFloat((meta - prog).toFixed(2)));
    const cumprido = prog >= meta;
    const pct = Math.min(100, Math.round((prog / meta) * 100));
    const un = unidade ? ` ${unidade}` : "";
    const adaptTag = hunter.capacidade[chave] === false ? " 🔻XP-50%" : "";
    return `
        <div class="missao-item-input missao-boss-item" style="${estiloLinha || ''}">
            <span class="missao-meta-label">${icone} ${rotulo}${adaptTag} — <b>${fmtAttr(prog)}/${meta}${un}</b> (${pct}%)</span>
            <input type="number" ${step ? `step="${step}"` : ""} min="0" max="${restante}" id="boss-in-${chave}" class="input-resultado-exec" value="${restante}" ${cumprido ? 'disabled' : ''} oninput="limitarInputExec(this, ${restante})">
            <button type="button" id="boss-btn-${chave}" class="btn-confirmar-ex ${cumprido ? 'ex-confirmado-verde' : ''}" ${cumprido ? 'disabled' : ''} onclick="registrarProgressoBoss('${chave}', ${meta})">${cumprido ? '✔ CUMPRIDO' : 'REGISTRAR'}</button>
        </div>`;
}

function limitarInputExec(input, tetoVal) {
    if (tetoVal === null || tetoVal === undefined) return;
    const v = parseFloat(input.value);
    if (isNaN(v)) return;
    if (v < 0) { input.value = 0; return; }
    if (v > tetoVal) {
        input.value = tetoVal;
        mostrarAlertaOvertraining(input);
    }
}

function mostrarAlertaOvertraining(input) {
    const el = document.getElementById('alerta-overtraining');
    if (el) el.classList.remove('escondido');
    if (input) {
        input.classList.add('input-sobrecarga');
        setTimeout(() => input.classList.remove('input-sobrecarga'), 900);
    }
    if (timerAlertaOvertraining) clearTimeout(timerAlertaOvertraining);
    timerAlertaOvertraining = setTimeout(() => {
        const e2 = document.getElementById('alerta-overtraining');
        if (e2) e2.classList.add('escondido');
    }, 6000);
}

function renderizarMissoes() {
    const container = document.getElementById('container-missoes');
    if (!container) return;

    const metas = hunter.metasCalculadas;
    const est = obterEstadoDia();
    const ehFDS = est.ehFDS;
    const cfg = cardioCfg();

    const elTitulo = document.getElementById('titulo-missao-card');
    const elTag = document.getElementById('tag-status-sistema');
    const elDesc = document.getElementById('desc-missao-ajuste');
    const elStatus = document.getElementById('status-diaria');

    if (elStatus) elStatus.innerText = hunter.diariaConcluida ? "CONCLUÍDA" : "EM ANDAMENTO";

    // No dia do boss (antes de aceitar) só existem 2 opções: fazer a Raid ou usar a Pedra de Retorno
    const cardMissoes = document.getElementById('card-painel-missoes');
    if (cardMissoes) cardMissoes.classList.toggle('escondido', !!(est.boss.pendente && !est.frozen));

    // ---- Estados que ocultam o treino ----
    if (est.frozen) {
        const ate = new Date(hunter.elixirAtivoAte);
        elTitulo.innerText = "🧪 SISTEMA CONGELADO - CRISTAL DO REPOUSO";
        elTag.innerText = "🧪 [LICENÇA MÉDICA / VIAGEM]";
        elDesc.innerText = "Streak 100% protegido. Sem penalidades.";
        container.innerHTML = `<div class="estado-descanso"><strong>🧪 CRISTAL DO REPOUSO ATIVO</strong>O Sistema está congelado até <b>${ate.toLocaleDateString('pt-BR')}</b>. Descanse, viaje ou se recupere — seu Streak (${hunter.streakDias || 0} dias) está intacto.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.pausado) {
        elTitulo.innerText = "⏸️ MISSÕES DIÁRIAS PAUSADAS";
        elTag.innerText = "⏸️ [FOCO NA RUPTURA / MASMORRA]";
        elDesc.innerText = "O relógio do treino diário parou.";
        container.innerHTML = `<div class="estado-descanso"><strong>⏸️ PRIORIDADE TOTAL À RUPTURA/MASMORRA</strong>Suas Missões Diárias e o relógio do dia ficam <b>congelados</b> enquanto a Ruptura ou a Masmorra Temporária estiver ativa. Quando você <b>concluir, recuar ou o tempo acabar</b>, elas voltam <b>exatamente de onde pararam</b>.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.calibracaoHoje) {
        elTitulo.innerText = "🌅 JORNADA COMEÇA AMANHÃ";
        elTag.innerText = "🧪 [CALIBRAÇÃO CONCLUÍDA]";
        elDesc.innerText = "O treino de teste de hoje já foi feito.";
        container.innerHTML = `<div class="estado-descanso"><strong>🌅 A VERDADEIRA JORNADA COMEÇA AMANHÃ</strong>Você já treinou hoje na calibração, então <b>não há Missões Diárias hoje</b>: descanse e hidrate-se. A partir de amanhã o XP, o Rank, o Streak e as penalidades passam a valer.${calAmanhaEhFds() ? '<br><br>📅 Amanhã é fim de semana: as metas ficam <b>50% menores</b> para você se recuperar e voltam ao normal na segunda-feira.' : ''}</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }
    if (est.bossVencidoHoje) {
        elTitulo.innerText = "🏆 RAID CONCLUÍDA";
        elTag.innerText = "🏆 [BOSS DERROTADO - TREINO DO DIA CONTADO]";
        elDesc.innerText = "A Raid já valeu como o treino de hoje.";
        container.innerHTML = `<div class="estado-descanso"><strong>🏆 PORTAL CONQUISTADO</strong>Derrotar o Boss já contabilizou como o seu treino de hoje (Streak: ${hunter.streakDias || 0} dias). <b>Não há Missões Diárias hoje</b>: descanse. A rotina normal volta amanhã.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.descansoBoss) {
        elTitulo.innerText = "🛌 DESCANSO OBRIGATÓRIO PRÉ-RAID";
        elTag.innerText = "🛌 [SEXTA PRÉ-BOSS]";
        elDesc.innerText = "Amanhã o Portal abre!";
        container.innerHTML = `<div class="estado-descanso"><strong>🛌 SEXTA-FEIRA PRÉ-RAID</strong>Treino bloqueado hoje. Seu corpo recuperou -20% de Fadiga para você enfrentar <b>${chefeAtual().nome}</b> 100% regenerado.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.justificado) {
        const j = justificativaDeHoje();
        const xpJ = Math.max(0, Math.round(Number(j.xp) || 0));
        const feitosJ = Math.max(0, Math.round(Number(j.feitos) || 0));
        const pctAtual = Math.round((hunter.ajusteMetaPct || 1) * 100);
        const sk = hunter.streakDias || 0;
        if (j.tipo === 'soro') {
            elTitulo.innerText = "🧪 SORO DE RECUPERAÇÃO USADO";
            elTag.innerText = "🧪 [DIA SALVO PELO SORO]";
            elDesc.innerText = "As missões de hoje foram encerradas. Elas voltam amanhã.";
            container.innerHTML = `<div class="estado-descanso"><strong>🧪 TREINO E STREAK PRESERVADOS</strong>O Soro salvou o seu dia: o Streak continua em <b>${sk} dia(s)</b>. Você recebeu <b>+${xpJ.toLocaleString('pt-BR')} XP</b> apenas pelos exercícios que cumpriu e confirmou${feitosJ ? ` (${feitosJ} exercício(s))` : ''}. Os exercícios que ficaram incompletos não renderam XP. As missões voltam amanhã.</div>`;
        } else if (j.tipo === 'pesado') {
            elTitulo.innerText = "⚖️ RECALIBRAÇÃO DE METAS";
            elTag.innerText = "⚖️ [TREINO PESADO DEMAIS]";
            elDesc.innerText = "As missões de hoje foram encerradas. Elas voltam amanhã, mais leves.";
            container.innerHTML = `<div class="estado-descanso"><strong>⚖️ METAS REAJUSTADAS NO PRÓXIMO TREINO</strong>Seu Streak foi mantido (<b>${sk} dia(s)</b>), mas hoje não rende XP. No próximo treino as metas ficam em <b>${pctAtual}%</b> do normal. Depois dele o Sistema vai perguntar como foi, e repete a pergunta a cada treino até as metas encaixarem direitinho.</div>`;
        } else {
            elTitulo.innerText = "⏳ SEM TEMPO HOJE";
            elTag.innerText = "⏳ [IMPREVISTO REGISTRADO]";
            elDesc.innerText = "As missões de hoje foram encerradas. Elas voltam amanhã.";
            container.innerHTML = `<div class="estado-descanso"><strong>⏳ STREAK PERDIDO, SEM ZONA DE PENITÊNCIA</strong>Você não foi enviado à Zona de Penitência, mas o Streak foi zerado e hoje não rende XP, mesmo que tenha feito parte do treino. As missões voltam amanhã.</div>`;
        }
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.zonaAguardando) {
        elTitulo.innerText = "🚨 ZONA DE PENITÊNCIA";
        elTag.innerText = "🚨 [ZONA DE PENITÊNCIA - AGUARDANDO]";
        elDesc.innerText = "As missões da zona ficam disponíveis no próximo dia útil.";
        const tz = hunter.zonaXpTreino || 0;
        const perdaE = hunter.zonaPerdaEntrada != null && hunter.zonaPerdaEntrada > 0 ? hunter.zonaPerdaEntrada : Math.round(tz * 0.5);
        container.innerHTML = `<div class="estado-descanso"><strong>🚨 VOCÊ FOI ENVIADO À ZONA DE PENITÊNCIA</strong>Você perdeu <b>50% do XP do treino de hoje</b> (${perdaE.toLocaleString('pt-BR')} XP, de um treino que rende ${tz.toLocaleString('pt-BR')} XP com seus bônus). As missões da zona <b>só ficam disponíveis no próximo dia útil</b> (fim de semana é descanso).<br>Se cumprir, você escapa (mas sem ganhar XP). Se não cumprir, perde mais <b>50% do XP do treino</b> (perda total de 100%) e volta sozinho aos treinos normais. Aqui <b>não existe opção de imprevisto</b>.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.boss.ativo) {
        elTitulo.innerText = "⚔️ MISSÃO DE FIM DE SEMANA (MASMORRA)";
        elTag.innerText = "⚔️ [RAID DO BOSS - 2 DIAS PARA COMPLETAR]";
        elDesc.innerText = "Você tem 2 DIAS (sábado e domingo) para cumprir a meta. Registre o que fizer: o progresso fica salvo e não há perda de XP se não terminar tudo no primeiro dia." + notaRaidTransicao();
        const m = hunter.metasCalculadas;
        container.innerHTML =
            htmlLinhaBoss('flexoes', EXERCICIOS.flexoes.icone, nomeExercicio('flexoes'), "", m.flexoes, null, "") +
            htmlLinhaBoss('corrida', cfg.icone, cfg.nome, cfg.unidade, m.corrida, cfg.casas === 0 ? "1" : "0.1", "") +
            htmlLinhaBoss('abdominais', EXERCICIOS.abdominais.icone, nomeExercicio('abdominais'), "", m.abdominais, null, "") +
            htmlLinhaBoss('agachamentos', EXERCICIOS.agachamentos.icone, nomeExercicio('agachamentos'), "", m.agachamentos, null, "") +
            htmlLinhaBoss('leitura', "🧠", "Leitura", "Pág.", m.leitura, null, "border-color: #38bdf8;");
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.folga && hunter.descansoPagoHoje) {
        elTitulo.innerText = "☕ DESCANSO REMUNERADO";
        elTag.innerText = "☕ [DESCANSO COM RECOMPENSA]";
        elDesc.innerText = "Hoje seu corpo descansa de verdade.";
        container.innerHTML = `<div class="estado-descanso"><strong>☕ DESCANSO REMUNERADO ATIVO</strong>Você não treina hoje, o Streak (${hunter.streakDias || 0} dias) foi mantido, recebeu <b>50% do XP do treino do dia</b> e a Fadiga caiu 25% (agora ${Math.round(hunter.fadiga || 0)}%). Descanse de verdade — o benefício só vale se o corpo descansar.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    if (est.folga) {
        elTitulo.innerText = "☕ DIA DE DESCANSO REGISTRADO";
        elTag.innerText = "☕ [RECUPERAÇÃO ATIVA]";
        elDesc.innerText = "A missão reaparece amanhã.";
        container.innerHTML = `<div class="estado-descanso"><strong>☕ FOLGA REGISTRADA</strong>Missão oculta por hoje. Ela reaparece amanhã (Sábado ➔ Domingo ➔ próximo Sábado). Fadiga atual: ${Math.round(hunter.fadiga || 0)}%.</div>`;
        atualizarAcessibilidadeBotoesPrincipais();
        return;
    }

    // ---- Títulos por contexto ----
    if (hunter.zonaPunicao) {
        elTitulo.innerText = "🚨 ZONA DE PENITÊNCIA";
        elTag.innerText = "🚨 [ZONA DE PENITÊNCIA ATIVA]";
        elDesc.innerText = `Cumpra TODAS as missões hoje para escapar. Concluir não dá XP, mas evita perder mais 50% do treino (até ${(hunter.zonaXpTreino || 0).toLocaleString('pt-BR')} XP). Não existe opção de imprevisto.`;
    } else if (est.bloqueioFadiga) {
        elTitulo.innerText = "⛔ TREINO BLOQUEADO POR FADIGA";
        elTag.innerText = "🚨 [FADIGA CRÍTICA 95%+]";
        elDesc.innerText = "Registre um dia de descanso para regenerar o corpo.";
    } else if (ehFDS) {
        elTitulo.innerText = hunter.bossCombateAtivo ? "⚔️ MISSÃO DE FIM DE SEMANA (MASMORRA)" : "🛌 DIA DE DESCANSO DO CAÇADOR";
        elTag.innerText = "☕ [RECUPERAÇÃO OPCIONAL]";
        elDesc.innerText = "Fim de semana é opcional! Metas fixas em 50%, sem bônus de overachievement.";
    } else if (hunter.cargaAliviadaAtiva) {
        elTitulo.innerText = "🧪 CARGA ALIVIADA ATIVA";
        elTag.innerText = "🧪 [POÇÃO DE ALÍVIO VITAL]";
        elDesc.innerText = `Metas 35% menores e XP de 100%! Treinos aliviados restantes: ${hunter.cargaAliviadaRestante}. Aproveite para o corpo descansar.`;
    } else if (hunter.fadigaReducaoAtiva) {
        elTitulo.innerText = "🛡️ TREINO REDUZIDO POR FADIGA";
        elTag.innerText = "🛡️ [METAS -25%]";
        elDesc.innerText = "Metas 25% menores hoje. O XP é proporcional às repetições feitas (sem compensação).";
    } else if (hunter.folgaBonusAtivo) {
        elTitulo.innerText = "💪 TREINO PÓS-FOLGA (+10%)";
        elTag.innerText = "💪 [METAS +10% SÓ HOJE]";
        elDesc.innerText = "Você descansou: hoje as metas sobem 10%. Depois deste treino tudo volta ao normal.";
    } else if (hunter.preparatoriaAtiva) {
        elTitulo.innerText = "🛡️ SEMANA PREPARATÓRIA DA RAID";
        elTag.innerText = "🛡️ [PREPARAÇÃO PARA O BOSS]";
        elDesc.innerText = `Volume -25% com 100% do XP! A Raid abre em ${est.info.dias} dia(s).`;
    } else {
        elTitulo.innerText = "📋 MISSÃO DIÁRIA DE TREINAMENTO & ESTUDO";
        elTag.innerText = "⚠️ [SISTEMA ATIVO]";
        elDesc.innerText = "Confirme cada exercício individualmente (teto rígido: 2x a meta):";
    }

    const tetoDe = (m) => ehFDS ? m : parseFloat((m * 2).toFixed(1));

    const linhasSerie = PROG_KEYS.filter(k => metas[k + '_p']).map(k => {
        const un = k === 'corrida' ? "Km" : "";
        return htmlLinhaMissao(k + '_p', 'exec-' + k + '-p', 'btn-conf-' + k + '-p', iconeSerie(k), nomeSerieForca(k), un, metas[k + '_p'], tetoDe(metas[k + '_p']), k === 'corrida' ? "0.1" : null, "border-color:#f59e0b;", "color:#f59e0b;", "background:#f59e0b;");
    });
    const notaTransicao = linhasSerie.length
        ? `<div class="nota-transicao">🔄 <b>TRANSIÇÃO ATIVA:</b> faça primeiro a(s) série(s) de força (exercício normal, 100% do XP), descansado e com boa técnica. Depois complete o volume do exercício assistido (50% do XP).</div>`
        : '';

    const linhasVar = VAR_KEYS.filter(k => metas[k + '_v']).map(k => {
        const d = (metas.var || {})[k];
        return htmlLinhaMissao(k + '_v', 'exec-' + k + '-v', 'btn-conf-' + k + '-v', '🧬', `${d ? d.nome : 'Variação'} (variação, +${d ? Math.round(VAR_BONUS_GRAU[d.grau] * 100) : 0}% XP)`, "", metas[k + '_v'], metas[k + '_v'], null, "border-color:#14b8a6;", "color:#2dd4bf;", "background:#14b8a6;");
    });
    const notaVar = linhasVar.length ? notaVariacoesDoDia() : '';

    container.innerHTML = notaTransicao + notaVar + linhasSerie.join('') + linhasVar.join('') +
        htmlLinhaMissao('flexoes', 'exec-flex', 'btn-conf-flexoes', EXERCICIOS.flexoes.icone, nomeExercicio('flexoes'), "", metas.flexoes, tetoDe(metas.flexoes), null) +
        htmlLinhaMissao('corrida', 'exec-corrida', 'btn-conf-corrida', cfg.icone, cfg.nome, cfg.unidade, metas.corrida, tetoDe(metas.corrida), cfg.casas === 0 ? "1" : "0.1") +
        htmlLinhaMissao('abdominais', 'exec-abd', 'btn-conf-abdominais', EXERCICIOS.abdominais.icone, nomeExercicio('abdominais'), "", metas.abdominais, tetoDe(metas.abdominais), null) +
        htmlLinhaMissao('agachamentos', 'exec-agach', 'btn-conf-agachamentos', EXERCICIOS.agachamentos.icone, nomeExercicio('agachamentos'), "", metas.agachamentos, tetoDe(metas.agachamentos), null) +
        htmlLinhaMissao('leitura', 'exec-leitura', 'btn-conf-leitura', "🧠", "Leitura", "Pág.", metas.leitura, ehFDS ? metas.leitura : null, null, "border-color: #38bdf8;", "color: #38bdf8;", "background:#38bdf8;");

    atualizarVisualItemEx('flexoes', 'exec-flex', 'btn-conf-flexoes', metas.flexoes);
    atualizarVisualItemEx('corrida', 'exec-corrida', 'btn-conf-corrida', metas.corrida);
    atualizarVisualItemEx('abdominais', 'exec-abd', 'btn-conf-abdominais', metas.abdominais);
    atualizarVisualItemEx('agachamentos', 'exec-agach', 'btn-conf-agachamentos', metas.agachamentos);
    atualizarVisualItemEx('leitura', 'exec-leitura', 'btn-conf-leitura', metas.leitura);
    PROG_KEYS.filter(k => metas[k + '_p']).forEach(k => atualizarVisualItemEx(k + '_p', 'exec-' + k + '-p', 'btn-conf-' + k + '-p', metas[k + '_p']));
    VAR_KEYS.filter(k => metas[k + '_v']).forEach(k => atualizarVisualItemEx(k + '_v', 'exec-' + k + '-v', 'btn-conf-' + k + '-v', metas[k + '_v']));

    atualizarAcessibilidadeBotoesPrincipais();
}

function atualizarVisualItemEx(tipoKey, inputId, btnId, metaVal) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;

    if (hunter.confirmacoesEx[tipoKey]) {
        const val = hunter.execucoesDigitadas[tipoKey];
        if (val < metaVal) {
            input.classList.add('abaixo-meta');
            btn.className = 'btn-confirmar-ex ex-confirmado-vermelho';
            btn.innerText = '✖ INCOMPLETO';
        } else {
            input.classList.remove('abaixo-meta');
            btn.className = 'btn-confirmar-ex ex-confirmado-verde';
            btn.innerText = '✔ CUMPRIDO';
        }
    } else {
        input.classList.remove('abaixo-meta');
        btn.className = 'btn-confirmar-ex';
        btn.innerText = 'CONFIRMAR';
    }
}

function confirmarExercicio(tipoKey, inputId, metaVal, tetoVal) {
    tocarAudioSeguro(somClique);
    let val = parseFloat(document.getElementById(inputId).value) || 0;

    if (tetoVal !== null && tetoVal !== undefined && val > tetoVal) {
        val = tetoVal;
        mostrarAlertaOvertraining(document.getElementById(inputId));
    }
    if (val < 0) val = 0;

    hunter.execucoesDigitadas[tipoKey] = val;
    hunter.confirmacoesEx[tipoKey] = true;

    salvarDados();
    renderizarMissoes();
}

function atualizarAcessibilidadeBotoesPrincipais() {
    const btnVerde = document.getElementById('btn-executar-treino');
    const btnVermelho = document.getElementById('btn-nao-cumpri');
    const btnRecusar = document.getElementById('btn-recusar-fimdesemana');
    const btnPedra = document.getElementById('btn-usar-pedra-teleporte');

    const est = obterEstadoDia();
    const metas = hunter.metasCalculadas;
    const ex = hunter.execucoesDigitadas;
    const conf = hunter.confirmacoesEx;
    const bossAtivo = est.boss.ativo;

    const escondeTreino = est.frozen || est.descansoBoss || est.folga || est.zonaAguardando || est.justificado || est.pausado || est.bossVencidoHoje || est.calibracaoHoje;
    const naZona = !!hunter.zonaPunicao;

    if (btnVerde) btnVerde.classList.toggle('escondido', escondeTreino);
    // Na Raid: só ficam "Concluir" e "Usar Pedra de Retorno" (sem imprevisto/descanso)
    if (btnVermelho) btnVermelho.classList.toggle('escondido', escondeTreino || bossAtivo || naZona); // sem imprevisto na Zona de Penitência
    if (btnPedra) btnPedra.classList.toggle('escondido', escondeTreino || !bossAtivo);

    let todasCumpriu;
    if (bossAtivo) {
        todasCumpriu = bossMetaCompleta();
    } else {
        const flexOk = conf.flexoes && (ex.flexoes >= metas.flexoes);
        const corrOk = conf.corrida && (ex.corrida >= metas.corrida);
        const abdOk = conf.abdominais && (ex.abdominais >= metas.abdominais);
        const agachOk = conf.agachamentos && (ex.agachamentos >= metas.agachamentos);
        const leituraOk = conf.leitura && (ex.leitura >= metas.leitura);
        const seriesOk = PROG_KEYS.every(k => !metas[k + '_p'] || (conf[k + '_p'] && (ex[k + '_p'] || 0) >= metas[k + '_p']));
        const varOk = VAR_KEYS.every(k => !metas[k + '_v'] || (conf[k + '_v'] && (ex[k + '_v'] || 0) >= metas[k + '_v']));
        todasCumpriu = flexOk && corrOk && abdOk && agachOk && leituraOk && seriesOk && varOk;
    }
    const jaConcluiu = hunter.diariaConcluida && !hunter.isDev;

    if (btnVerde) {
        btnVerde.disabled = !todasCumpriu || jaConcluiu || est.bloqueioFadiga;
        btnVerde.innerText = est.bloqueioFadiga
            ? "[ ⛔ TREINO BLOQUEADO ]"
            : (jaConcluiu ? "[ ✔ TREINO DE HOJE CONCLUÍDO ]"
                : (bossAtivo ? "[ ⚔️ CONCLUIR RAID - DERROTAR O CHEFE ]"
                    : (naZona ? "[ 🚨 CONCLUIR PUNIÇÃO (SEM XP) ]" : "[ CONCLUIR TREINO - TODAS AS METAS BATIDAS ]")));
    }
    if (btnVermelho) btnVermelho.disabled = todasCumpriu;

    if (btnRecusar) {
        const mostrar = !escondeTreino && !bossAtivo && !hunter.diariaConcluida && (est.ehFDS || (hunter.fadiga || 0) >= 95);
        btnRecusar.classList.toggle('escondido', !mostrar);
        btnRecusar.innerText = est.ehFDS
            ? "[ ☕ RECUSAR MISSÃO EXTRA (USAR DIA DE DESCANSO) ]"
            : "[ 🛌 REGISTRAR DESCANSO FORÇADO (-20% FADIGA) ]";
    }
}

function atualizarInventarioTitulos() {
    const select = document.getElementById('select-titulo-equipado');
    if (!select) return;

    select.innerHTML = '';
    hunter.titulosColecao.forEach(titulo => {
        const option = document.createElement('option');
        option.value = titulo;
        const comEfeito = TITULOS_INFO[titulo] && TITULOS_INFO[titulo].efeito;
        option.innerText = comEfeito ? `${titulo} ★` : titulo;
        if (titulo === hunter.tituloEquipado) option.selected = true;
        select.appendChild(option);
    });
    atualizarDescTitulo();
}

function atualizarDescTitulo() {
    const el = document.getElementById('desc-titulo-equipado');
    if (el) el.innerText = `ℹ️ ${tituloDescricao(hunter.tituloEquipado)}  (★ = título com bônus real)`;
}

function atualizarLegiãoSombras() {
    const container = document.getElementById('lista-sombras');
    if (!container) return;

    const lista = sombrasExtraidas().map(i => {
        const d = SOMBRAS_DATA[i];
        if (!sombraAtiva(i)) {
            return `<div style="margin-top:4px; opacity:0.55;"><b style="color:#94a3b8;">🔒 ${d.icone} ${d.nome}</b> <span style="font-size:0.7rem; color:#f59e0b;">(DORMINDO)</span><br><span style="font-size:0.75rem; color:#94a3b8;">Bônus bloqueado: volte ao ${ESCALA_RANKS[i].nome} para reativar. (${d.efeito})</span></div>`;
        }
        return `<div style="margin-top:4px;"><b style="color:#c084fc;">${d.icone} ${d.nome}</b><br><span style="font-size:0.75rem; color:#94a3b8;">${d.efeito}</span></div>`;
    });

    if (lista.length > 0) container.innerHTML = lista.join('');
    else container.innerText = "Nenhuma sombra convocada ainda. Suba de Rank para convocar sombras: cada uma dá um bônus permanente.";
}

/* ---------- ATRIBUTOS & RANK ---------- */
function atualizarAtributosERank() {
    document.getElementById('attr-forca').innerText = fmtAttr(hunter.forca);
    document.getElementById('attr-agilidade').innerText = fmtAttr(hunter.agilidade);
    document.getElementById('attr-vitalidade').innerText = fmtAttr(hunter.vitalidade);
    document.getElementById('attr-resistencia').innerText = fmtAttr(hunter.resistencia);
    document.getElementById('attr-inteligencia').innerText = fmtAttr(hunter.inteligencia || 10);

    hunter.rankMaximoAlcancado = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);
    verificarRebaixamento();
    const rankIndex = rankPorXp(hunter.xpTotal);

    if (rankIndex > hunter.rankIndiceAtual) {
        const anterior = hunter.rankIndiceAtual;
        const novoRecorde = rankIndex > (hunter.rankMaximoAlcancado || 0);
        hunter.rankIndiceAtual = rankIndex;
        if (!hunter.rankDatas || typeof hunter.rankDatas !== 'object') hunter.rankDatas = {};
        for (let ri = anterior + 1; ri <= rankIndex; ri++) hunter.rankDatas[ri] = obterDataAtual().toISOString();
        hunter.tituloEquipado = ESCALA_RANKS[rankIndex].titulo;
        if (!hunter.titulosColecao.includes(ESCALA_RANKS[rankIndex].titulo)) {
            hunter.titulosColecao.push(ESCALA_RANKS[rankIndex].titulo);
        }

        // Evolução Fênix: recuperou o Rank que tinha perdido
        if (hunter.rankPerdido != null && rankIndex >= hunter.rankPerdido) {
            hunter.fenixConcluido = true;
            hunter.rankPerdido = null;
            adicionarMsgChat(`🔥 [EVOLUÇÃO FÊNIX]: você recuperou o Rank perdido e renasceu das cinzas!`);
        }

        if (novoRecorde) {
            const maxAntigo = hunter.rankMaximoAlcancado || 0;
            hunter.rankMaximoAlcancado = rankIndex;
            ganharPontosHabilidade(3 * Math.max(1, rankIndex - maxAntigo), `Novo Rank: ${ESCALA_RANKS[rankIndex].nome}`);
            if (!hunter.sombrasPendentes) hunter.sombrasPendentes = [];
            for (let i = Math.max(anterior, maxAntigo) + 1; i <= rankIndex; i++) {
                if (SOMBRAS_DATA[i] && !hunter.sombrasPendentes.includes(i)) hunter.sombrasPendentes.push(i);
            }
            salvarDados();
            dispararAnimacaoRankUp(ESCALA_RANKS[rankIndex].nome);
        } else {
            // Rank já conquistado antes: sem cerimônia de novo (sem nova sombra nem recalibração)
            const reativadas = sombrasExtraidas().filter(i => i > anterior && i <= rankIndex).map(i => SOMBRAS_DATA[i].nome);
            salvarDados();
            adicionarMsgChat(`📈 [RANK RECUPERADO]: você voltou para ${ESCALA_RANKS[rankIndex].nome}!${reativadas.length ? ' Sombras reativadas: ' + reativadas.join(', ') + '.' : ''}`);
            dispararAnimacaoRankUp(ESCALA_RANKS[rankIndex].nome, { retorno: true, sombras: reativadas });
        }
    }

    const rankAtual = ESCALA_RANKS[hunter.rankIndiceAtual];
    const proximoRank = ESCALA_RANKS[hunter.rankIndiceAtual + 1] || rankAtual;

    aplicarMoldura();
    document.getElementById('rank-badge').innerText = rankAtual.nome;

    let xpAtualNoRank = hunter.xpTotal - rankAtual.xpRequerido;
    let xpNecessarioTotal = proximoRank.xpRequerido - rankAtual.xpRequerido;

    if (hunter.rankIndiceAtual === ESCALA_RANKS.length - 1) {
        document.getElementById('xp-fill').style.width = `100%`;
        document.getElementById('xp-texto').innerText = `${hunter.xpTotal.toLocaleString('pt-BR')} XP (NÍVEL MÁXIMO)`;
    } else {
        let porcentagem = (xpAtualNoRank / xpNecessarioTotal) * 100;
        document.getElementById('xp-fill').style.width = `${Math.min(100, Math.max(0, porcentagem))}%`;
        document.getElementById('xp-texto').innerText = `${hunter.xpTotal.toLocaleString('pt-BR')} / ${proximoRank.xpRequerido.toLocaleString('pt-BR')} XP`;
    }
}

/* ---------- RANK UP & CHECK-IN ---------- */
function dispararAnimacaoRankUp(nomeNovoRank, opcoes) {
    modoReavaliacaoAtivo = false;
    document.getElementById('btn-adiar-reavaliacao')?.classList.add('escondido');
    const retorno = !!(opcoes && opcoes.retorno);
    hunter.retornoRankAtivo = retorno;
    tocarAudioSeguro(retorno ? somXP : somPortal);
    document.getElementById('badge-novo-rank').innerText = nomeNovoRank;
    document.getElementById('up-peso').value = hunter.peso;
    document.getElementById('up-altura').value = hunter.altura;

    const tit = document.getElementById('rankup-titulo');
    const txt = document.getElementById('rankup-texto');
    const janela = document.getElementById('rankup-janela');
    if (retorno) {
        if (tit) tit.innerText = "💪 [SISTEMA: BEM-VINDO DE VOLTA!]";
        const sh = (opcoes.sombras && opcoes.sombras.length) ? ` As sombras ${opcoes.sombras.join(', ')} foram reativadas e voltaram a te dar bônus.` : "";
        if (txt) txt.innerText = `Bom trabalho ao retornar ao ${nomeNovoRank}, Caçador!${sh} Confirme seus dados para recalibrar as metas.`;
        if (janela) janela.classList.remove('animar-rankup');
    } else {
        if (tit) tit.innerText = "🚨 [SISTEMA: EVOLUÇÃO DE RANK!] 🚨";
        if (txt) txt.innerText = "Parabéns, Caçador! Seus limites físicos foram superados.";
        if (janela) janela.classList.add('animar-rankup');
        efeitoCinematico(nomeNovoRank);
    }

    const cfg = cardioCfg();
    const lbl = document.getElementById('up-label-cardio');
    if (lbl) lbl.innerText = `Novo Máx. ${cfg.nome} (${cfg.unidade}):`;
    const inputCardio = document.getElementById('up-corrida');
    if (inputCardio) inputCardio.step = cfg.casas === 0 ? "1" : "0.1";

    document.getElementById('secao-novas-metas').classList.add('escondido');
    document.getElementById('caixa-recomendacao-sistema').classList.add('escondido');
    document.getElementById('btn-confirmar-checkin').classList.remove('escondido');
    document.getElementById('modal-rankup').classList.remove('escondido');
}

function processarRecomendacaoTreino() {
    tocarAudioSeguro(somClique);

    const sens = document.getElementById('up-sensacao').value;
    let mult = 1.0;
    let msg = "";
    let cor = "#38bdf8";

    if (modoReavaliacaoAtivo) {
        // Reavaliação de 4 semanas: aumentos menores (evolução gradual e segura)
        if (sens === 'Muito Forte e Disposto') { mult = 1.05; msg = "🔥 Ótima evolução! O Sistema recomenda aumentar seus máximos em ~5%."; cor = "#22c55e"; }
        else if (sens === 'Bem e Constante') { mult = 1.03; msg = "💪 Evolução constante! O Sistema recomenda um aumento gradual de ~3% nos máximos."; cor = "#38bdf8"; }
        else { mult = 1.0; msg = "⚠️ Priorize a recuperação! O Sistema mantém seus máximos atuais. Cuide do sono, da água e dos dias de descanso."; cor = "#f59e0b"; }
    } else if (sens === 'Muito Forte e Disposto') {
        mult = 1.10;
        msg = "🔥 Ótima evolução! O Sistema recomenda aumentar seus máximos em ~10%.";
        cor = "#22c55e";
    } else if (sens === 'Bem e Constante') {
        mult = 1.05;
        msg = "💪 Evolução constante! O Sistema recomenda um aumento gradual de ~5% nos máximos.";
        cor = "#38bdf8";
    } else {
        mult = 1.0;
        msg = "⚠️ Priorize a recuperação! O Sistema mantém seus máximos atuais. Cuide do sono, da água e dos dias de descanso.";
        cor = "#f59e0b";
    }

    const cfg = cardioCfg();
    const m = hunter.maximos;
    document.getElementById('up-flex').value = Math.max(m.flexoes, Math.ceil(m.flexoes * mult));
    document.getElementById('up-abd').value = Math.max(m.abdominais, Math.ceil(m.abdominais * mult));
    document.getElementById('up-agach').value = Math.max(m.agachamentos, Math.ceil(m.agachamentos * mult));
    document.getElementById('up-corrida').value = cfg.casas === 0
        ? Math.max(m.corrida, Math.ceil(m.corrida * mult))
        : Math.max(m.corrida, parseFloat((m.corrida * mult).toFixed(1)));

    const caixa = document.getElementById('caixa-recomendacao-sistema');
    caixa.style.borderColor = cor;
    caixa.style.color = cor;
    caixa.style.background = "rgba(15, 23, 42, 0.8)";
    document.getElementById('msg-recomendacao-texto').innerText = msg;
    caixa.classList.remove('escondido');

    document.getElementById('secao-novas-metas').classList.remove('escondido');
    document.getElementById('btn-confirmar-checkin').classList.add('escondido');
}

function concluirRecalibracaoRankUp() {
    hunter.peso = parseFloat(document.getElementById('up-peso')?.value) || hunter.peso;
    hunter.altura = parseFloat(document.getElementById('up-altura')?.value) || hunter.altura;

    const f = parseInt(document.getElementById('up-flex')?.value);
    const a = parseInt(document.getElementById('up-abd')?.value);
    const g = parseInt(document.getElementById('up-agach')?.value);
    const c = parseFloat(document.getElementById('up-corrida')?.value);
    if (f > 0) hunter.maximos.flexoes = f;
    if (a > 0) hunter.maximos.abdominais = a;
    if (g > 0) hunter.maximos.agachamentos = g;
    if (c > 0) hunter.maximos.corrida = c;

    hunter.ultimaRecalibracao = obterDataAtual().toISOString();
    hunter.recalAdiadaAte = null;
    zerarAjusteMeta(); // máximos novos: o ajuste da escada "muito pesado" deixa de valer
    const eraReavaliacao = modoReavaliacaoAtivo;
    modoReavaliacaoAtivo = false;
    document.getElementById('btn-adiar-reavaliacao')?.classList.add('escondido');
    if (eraReavaliacao) adicionarMsgChat("📅 [REAVALIAÇÃO CONCLUÍDA]: máximos atualizados. A próxima reavaliação será daqui a 2 semanas (ou no próximo Rank).");
    recalcularMetasDoRank();
    salvarDados();
    document.getElementById('modal-rankup').classList.add('escondido');
    if (!hunter.retornoRankAtivo) marcarPerguntaProgressaoRankUp();
    if (hunter.retornoRankAtivo) {
        hunter.retornoRankAtivo = false;
        adicionarMsgChat(`💪 [BOM TRABALHO]: você voltou ao ${ESCALA_RANKS[hunter.rankIndiceAtual].nome}! Metas recalibradas e bônus reativados.`);
    }
    carregarEExibirInterface();
    setTimeout(processarPerguntasProgressao, 500);
}

/* ---------- CONVOCAÇÃO DE SOMBRAS: ERGA-SE ---------- */
function verificarSombraPendente() {
    if (!hunter.sombrasPendentes || hunter.sombrasPendentes.length === 0) return;
    const rankup = document.getElementById('modal-rankup');
    const modal = document.getElementById('modal-extracao-sombra');
    if (!modal) return;
    if (rankup && !rankup.classList.contains('escondido')) return;
    if (!modal.classList.contains('escondido')) return;

    abrirModalSombra(hunter.sombrasPendentes[0]);
}

function abrirModalSombra(rankIdx) {
    const dados = SOMBRAS_DATA[rankIdx];
    const rank = ESCALA_RANKS[rankIdx];
    if (!dados || !rank) {
        hunter.sombrasPendentes.shift();
        salvarDados();
        return;
    }

    estagioSombra = 'aviso';

    // Prepara a cena (ainda escondida): nome, fala e silhueta
    document.getElementById('cena-nome').innerText = dados.nome;
    document.getElementById('sombra-fala').innerText = dados.fala || "";

    const img = document.getElementById('sombra-img');
    const fallback = document.getElementById('sombra-emoji-fallback');
    fallback.innerText = dados.icone;
    const src = (typeof SOMBRAS_IMAGENS !== 'undefined' && dados.imagem) ? SOMBRAS_IMAGENS[dados.imagem] : null;
    if (src) {
        img.classList.remove('escondido');
        fallback.classList.add('escondido');
        img.src = src;
    } else {
        img.classList.add('escondido');
        fallback.classList.remove('escondido');
    }

    // Cena completa (tela cheia) quando existir para esta sombra; senão, a silhueta de sempre
    const cenaEl = document.getElementById('cena-sombra');
    const fundo = document.getElementById('cena-fundo');
    const srcCena = (typeof SOMBRAS_CENAS !== 'undefined' && dados.imagem) ? SOMBRAS_CENAS[dados.imagem] : null;
    cenaEl.classList.remove('absorvendo');
    cenaEl.classList.toggle('com-cena', !!srcCena);
    if (fundo) fundo.style.backgroundImage = srcCena ? `url("${srcCena}")` : 'none';
    const fundoBlur = document.getElementById('cena-fundo-blur');
    if (fundoBlur) fundoBlur.style.backgroundImage = srcCena ? `url("${srcCena}")` : 'none';
    cenaAtualChave = srcCena ? dados.imagem : null;
    ajustarCena();

    const palco = document.getElementById('cena-palco');
    palco.classList.remove('visivel', 'absorver');
    document.getElementById('cena-sombra').classList.add('escondido');
    document.getElementById('sombra-aviso').classList.remove('escondido');

    tocarAudioSeguro(somPortal);
    document.getElementById('modal-extracao-sombra').classList.remove('escondido');
}

function executarComandoErgase(e) {
    if (e) e.stopPropagation();
    if (estagioSombra !== 'aviso') return;
    estagioSombra = 'revelando';

    tocarAudioSeguro(somPortal);
    document.getElementById('sombra-aviso').classList.add('escondido');

    // Escuridão toma a tela inteira (reinicia as animações CSS da cena)
    const cena = document.getElementById('cena-sombra');
    cena.classList.add('escondido');
    void cena.offsetWidth;
    cena.classList.remove('escondido');

    // A sombra se ergue do breu, com nome, balão e dica na sequência
    setTimeout(() => {
        document.getElementById('cena-palco').classList.add('visivel');
    }, 1700);

    setTimeout(() => {
        estagioSombra = 'revelada';
    }, 3000);
}

function absorverSombra() {
    if (estagioSombra !== 'revelada') return;
    estagioSombra = 'absorvendo';

    const rankIdx = hunter.sombrasPendentes[0];
    const dados = SOMBRAS_DATA[rankIdx];

    document.getElementById('cena-palco').classList.add('absorver');
    document.getElementById('cena-sombra').classList.add('absorvendo');
    document.getElementById('sombra-dica').style.display = 'none';
    tocarAudioSeguro(somXP);
    fumacaSombra();

    setTimeout(() => {
        document.getElementById('modal-extracao-sombra').classList.add('escondido');
        document.getElementById('cena-sombra').classList.add('escondido');
        document.getElementById('sombra-dica').style.display = '';
        estagioSombra = 'oculta';

        hunter.sombrasPendentes.shift();
        salvarDados();
        if (dados) adicionarMsgChat(`🌌 [CONVOCAÇÃO CONCLUÍDA]: ${dados.icone} ${dados.nome} foi absorvido e agora serve ao seu Legião Umbral!`);
        carregarEExibirInterface();
    }, 1150);
}

/* ---------- SELETOR DE ITEM POR SLOT ---------- */
let slotEquipAberto = null;

function itensDoSlot(slot) {
    return (hunter.inventario || [])
        .map(id => BANCO_ITENS.find(i => i.id === id))
        .filter(Boolean)
        .filter(i => (slot === 'acess1' || slot === 'acess2') ? i.slot === 'acessorio' : (i.slot || 'arma') === slot)
        .sort((a, b) => ORDEM_RARIDADE.indexOf(b.raridade) - ORDEM_RARIDADE.indexOf(a.raridade));
}

function abrirSeletorSlot(slot) {
    if (!SLOTS_EQUIP[slot]) return;
    tocarAudioSeguro(somClique);
    slotEquipAberto = slot;
    renderizarSeletorSlot();
    document.getElementById('modal-slot-equip').classList.remove('escondido');
}

function fecharSeletorSlot() {
    slotEquipAberto = null;
    document.getElementById('modal-slot-equip').classList.add('escondido');
}

function renderizarSeletorSlot() {
    const slot = slotEquipAberto;
    if (!slot) return;
    const info = SLOTS_EQUIP[slot];
    document.getElementById('slot-equip-titulo').innerText = `${info.icone} ${info.nome.toUpperCase()}`;

    const atualId = (hunter.equipados || {})[slot];
    const atual = atualId ? BANCO_ITENS.find(i => i.id === atualId) : null;
    const boxAtual = document.getElementById('slot-equip-atual');
    boxAtual.innerHTML = atual
        ? `<div class="slot-atual-box"><span style="color:#94a3b8; font-size:0.72rem;">EQUIPADO AGORA</span><br><b style="color:#fde68a;">${atual.nome}</b>
             <button type="button" class="btn-dev-acao" style="margin-left:8px;" onclick="desequiparDoSlot('${slot}')">DESEQUIPAR</button></div>`
        : `<div class="slot-atual-box" style="color:#94a3b8;">Slot vazio.</div>`;

    const lista = document.getElementById('slot-equip-lista');
    const itens = itensDoSlot(slot);
    if (itens.length === 0) {
        lista.innerHTML = `<p style="color:#94a3b8; text-align:center;">Você ainda não tem nenhum item para este slot.<br><span style="font-size:0.78rem;">Eles vêm da Loja, dos Bosses, das Masmorras e de outras recompensas.</span></p>`;
        return;
    }
    lista.innerHTML = '';
    itens.forEach(item => {
        const r = RARIDADES[item.raridade];
        const aqui = atualId === item.id;
        const emOutro = !aqui && estaEquipado(item.id);
        const ehBoss = !!chefeDoItem(item.id);
        const fraco = (hunter.itensEnfraquecidos || []).includes(item.id);
        const rot = aqui ? '✔ NESTE SLOT (DESEQUIPAR)' : (emOutro ? 'MOVER PARA CÁ' : 'EQUIPAR');
        const acao = aqui ? `desequiparDoSlot('${slot}')` : `equiparNoSlot('${item.id}','${slot}')`;
        const div = document.createElement('div');
        div.className = 'rank-item-info';
        div.style.borderColor = r.cor;
        div.innerHTML = `
            <div><strong>${item.nome}</strong>
                <span class="tag-raridade" style="color:${r.cor}; border-color:${r.cor};">${r.icone} ${r.nome}</span>
                ${ehBoss ? '<span class="tag-raridade" style="color:#ef4444; border-color:#ef4444;">ITEM DE BOSS</span>' : ''}
                ${fraco ? '<span class="tag-raridade" style="color:#f59e0b; border-color:#f59e0b;">ENFRAQUECIDO 60%</span>' : ''}
                ${emOutro ? '<span class="tag-raridade" style="color:#94a3b8; border-color:#475569;">EQUIPADO EM OUTRO SLOT</span>' : ''}</div>
            <div style="font-size:0.8rem; color:#eab308;"><b>O que faz:</b> ${item.desc}${fraco ? ' (Só 60% do poder, por ser uma versão recomprada.)' : ''}</div>
            ${textoConjuntoDoItem(item.id).map(t => `<div style="font-size:0.75rem; color:#38bdf8;">${t}</div>`).join('')}
            <div style="margin-top:6px;"><button type="button" class="btn-dev-acao" onclick="${acao}">${rot}</button></div>`;
        lista.appendChild(div);
    });
}

function aposMudarEquipamento() {
    recalcularMetasDoRank();
    salvarDados();
    renderizarSlotEquipamento();
    atualizarAtributosERank();
    renderizarMissoes();
    if (!document.getElementById('modal-inventario').classList.contains('escondido')) renderizarBolsa();
}

function equiparNoSlot(itemId, slot) {
    const item = BANCO_ITENS.find(i => i.id === itemId);
    if (!item || !SLOTS_EQUIP[slot] || !(hunter.inventario || []).includes(itemId)) return;
    const okSlot = (slot === 'acess1' || slot === 'acess2') ? item.slot === 'acessorio' : (item.slot || 'arma') === slot;
    if (!okSlot) return;
    if ((item.efeitos || {}).desespero && (hunter.fadiga || 0) >= 80) {
        avisarJogo("💍 Com a Fadiga em 80% ou mais, o Anel do Desesperado não pode ser equipado. Descanse primeiro!");
        return;
    }
    const anteriorId = hunter.equipados[slot];
    const anterior = (anteriorId && anteriorId !== itemId) ? BANCO_ITENS.find(i => i.id === anteriorId) : null;
    desequiparItem(itemId);          // se estava em outro slot, sai de lá
    hunter.equipados[slot] = itemId;
    adicionarMsgChat(`🗡️ [ARTEFATO EQUIPADO]: ${item.nome} ativo! ${item.desc}${anterior ? ` (${anterior.nome} voltou para a Bolsa.)` : ''}`);
    fecharSeletorSlot();
    aposMudarEquipamento();
    brilhoEquipar(item.raridade);
}

function desequiparDoSlot(slot) {
    const id = (hunter.equipados || {})[slot];
    const item = id ? BANCO_ITENS.find(i => i.id === id) : null;
    if (!item) return;
    hunter.equipados[slot] = null;
    adicionarMsgChat(`🗡️ ${item.nome} desequipado.`);
    fecharSeletorSlot();
    aposMudarEquipamento();
}

/* ---------- GALERIA DAS SOMBRAS ---------- */
function abrirGaleriaSombras() {
    tocarAudioSeguro(somClique);
    renderizarGaleriaSombras();
    document.getElementById('modal-galeria-sombras').classList.remove('escondido');
}

// Nome do rank sem o emoji do começo (ex.: "👑 SOBERANO DO ECLIPSE" -> "SOBERANO DO ECLIPSE")
function nomeRankLimpo(i) { return String((ESCALA_RANKS[i] || {}).nome || '').replace(/^[^A-Za-zÀ-ú]+/, ''); }

function renderizarGaleriaSombras() {
    const grade = document.getElementById('galeria-grade');
    if (!grade) return;
    const extraidas = sombrasExtraidas();
    const pendentes = hunter.sombrasPendentes || [];
    const ids = Object.keys(SOMBRAS_DATA).map(Number).sort((a, b) => a - b);
    document.getElementById('galeria-resumo').innerText = `${extraidas.length} de ${ids.length} sombras reveladas`;

    grade.innerHTML = ids.map(i => {
        const d = SOMBRAS_DATA[i];
        const rank = nomeRankLimpo(i);
        if (extraidas.includes(i)) {
            const dorme = !sombraAtiva(i);
            return `<div class="galeria-card" role="button" tabindex="0" onclick="abrirCenaGaleria(${i})" onkeydown="if(event.key==='Enter'){abrirCenaGaleria(${i});}">
                <div class="galeria-thumb" data-cena="${d.imagem}" data-ordem="${i}"></div>
                <div class="galeria-info">
                    <div class="galeria-nome">${d.icone} ${d.nome}</div>
                    <div class="galeria-rank">Surge no ${rank}${dorme ? ' · <span style="color:#f59e0b;">💤 dormindo</span>' : ''}</div>
                    <div class="galeria-lore">${d.lore || ''}</div>
                    <div class="galeria-efeito">✨ ${d.efeito}${dorme ? ` <span style="color:#f59e0b;">(volte ao ${rank} para reativar)</span>` : ''}</div>
                    <div class="galeria-ver">Toque para ver a cena</div>
                </div>
            </div>`;
        }
        const aguardando = pendentes.includes(i);
        return `<div class="galeria-card galeria-bloqueada">
            <div class="galeria-thumb" data-cena="${d.imagem}" data-ordem="${i}"><span class="galeria-interrog">?</span></div>
            <div class="galeria-info">
                <div class="galeria-nome">🔒 ??????</div>
                <div class="galeria-rank">${aguardando ? `${rank} alcançado!` : `Surge no ${rank}`}</div>
                <div class="galeria-lore" style="font-style:italic;">${aguardando ? 'Esta sombra aguarda a sua convocação. Convoque-a para revelá-la.' : `Alcance o ${rank} para revelar esta sombra.`}</div>
            </div>
        </div>`;
    }).join('');

    // As imagens são aplicadas por JS (são grandes) — bloqueadas ficam escuras e desfocadas
    grade.querySelectorAll('.galeria-thumb').forEach(el => {
        const src = (typeof SOMBRAS_CENAS !== 'undefined') ? SOMBRAS_CENAS[el.dataset.cena] : null;
        if (src) el.style.backgroundImage = `url("${src}")`;
        el.style.backgroundPosition = el.dataset.cena === 'kaelor' ? '50% 22%' : '50% 35%';
    });
}

function abrirCenaGaleria(i) {
    const d = SOMBRAS_DATA[i];
    if (!d || !sombrasExtraidas().includes(i)) return;
    const src = (typeof SOMBRAS_CENAS !== 'undefined') ? SOMBRAS_CENAS[d.imagem] : null;
    const img = document.getElementById('galeria-cena-img');
    const blur = document.getElementById('galeria-cena-blur');
    if (src) { img.src = src; img.style.display = ''; blur.style.backgroundImage = `url("${src}")`; }
    else { img.removeAttribute('src'); img.style.display = 'none'; blur.style.backgroundImage = 'none'; }
    document.getElementById('galeria-cena-nome').innerText = `${d.icone} ${d.nome}`;
    document.getElementById('galeria-cena-rank').innerText = `Surge no ${nomeRankLimpo(i)}`;
    document.getElementById('galeria-cena-lore').innerText = d.lore || '';
    document.getElementById('galeria-cena-efeito').innerText = `✨ ${d.efeito}`;
    document.getElementById('modal-galeria-cena').classList.remove('escondido');
}

function fecharCenaGaleria() {
    document.getElementById('modal-galeria-cena').classList.add('escondido');
}

/* ---------- LOJA ---------- */
function abrirModalLoja() {
    const container = document.getElementById('lista-itens-loja');
    container.innerHTML = '';

    const limite = ORDEM_RARIDADE.indexOf(LIMITE_RARIDADE_LOJA);
    const desc = descontoLoja();
    if (desc > 0) {
        const aviso = document.createElement('div');
        aviso.style.cssText = "font-size:0.78rem; color:#22c55e; text-align:center; margin-bottom:6px;";
        aviso.innerText = `🏷️ Seus títulos/itens dão ${Math.round(desc * 100)}% de desconto em tudo na Loja.`;
        container.appendChild(aviso);
    }

    ITENS_LOJA.filter(i => ORDEM_RARIDADE.indexOf(i.raridade) <= limite).forEach(item => {
        const r = RARIDADES[item.raridade];
        const possui = item.tipo === 'equipamento' && hunter.inventario.includes(item.id);
        const div = document.createElement('div');
        div.className = 'rank-item-info';
        div.innerHTML = `
            <div><strong>${item.nome}</strong>
                <span class="tag-raridade" style="color:${r.cor}; border-color:${r.cor};">${r.icone} ${r.nome}</span>
                - <span style="color:#22c55e">${precoLoja(item).toLocaleString('pt-BR')} Gold</span></div>
            <div style="font-size:0.8rem; color:#cbd5e1;"><b>O que faz:</b> ${item.desc}</div>
            ${item.uso ? `<div style="font-size:0.78rem; color:#94a3b8;"><b>Como usar:</b> ${item.uso}</div>` : ''}
            ${possui
                ? `<div style="margin-top:6px; color:#22c55e; font-size:0.8rem;">✔ JÁ POSSUI</div>`
                : `<button type="button" class="btn-dev-acao" style="margin-top:6px; border-color:#22c55e; color:#22c55e;" onclick="solicitarConfirmacaoCompra('${item.id}')">🛒 COMPRAR</button>`}
        `;
        container.appendChild(div);
    });

    // Relíquias de Boss vendidas (voltam enfraquecidas, só depois de subir de Rank)
    const vendidas = hunter.itensVendidosBoss || [];
    if (vendidas.length > 0) {
        const cab = document.createElement('div');
        cab.style.cssText = "margin-top:10px; font-family:'Orbitron',sans-serif; font-size:0.8rem; color:#ef4444;";
        cab.innerText = "🏺 RELÍQUIAS DE BOSS (ITENS QUE VOCÊ VENDEU)";
        container.appendChild(cab);
        vendidas.forEach(id => {
            const it = BANCO_ITENS.find(i => i.id === id);
            if (!it) return;
            const r = RARIDADES[it.raridade];
            const rankNec = rankRecompraBoss(id);
            const liberado = hunter.rankIndiceAtual >= rankNec;
            const div = document.createElement('div');
            div.className = 'rank-item-info';
            div.style.borderColor = r.cor;
            div.innerHTML = `
                <div><strong>${it.nome}</strong> <span class="tag-raridade" style="color:${r.cor}; border-color:${r.cor};">${r.icone} ${r.nome}</span>
                    <span class="tag-raridade" style="color:#f59e0b; border-color:#f59e0b;">VERSÃO ENFRAQUECIDA</span></div>
                <div style="font-size:0.8rem; color:#cbd5e1;"><b>O que faz:</b> ${it.desc} <b>(Só 60% do poder original ao recomprar.)</b></div>
                <div style="font-size:0.78rem; color:#94a3b8;">Preço de recompra: ${precoRecompraBoss(id).toLocaleString('pt-BR')} Gold (400% do valor da venda).</div>
                ${liberado
                    ? `<button type="button" class="btn-dev-acao" style="margin-top:6px; border-color:#22c55e; color:#22c55e;" onclick="recomprarRelíquiaBoss('${id}')">🛒 RECOMPRAR</button>`
                    : `<div style="margin-top:6px; color:#ef4444; font-size:0.8rem;">🔒 Só fica disponível quando você alcançar o ${ESCALA_RANKS[Math.min(rankNec, ESCALA_RANKS.length - 1)].nome}.</div>`}
            `;
            container.appendChild(div);
        });
    }

    const nota = document.createElement('div');
    nota.style.cssText = "font-size:0.78rem; color:#94a3b8; text-align:center; margin-top:8px;";
    nota.innerText = "🔒 Itens 🟡 Lendários e 🔴 Míticos são exclusivos de Bosses e Raids.";
    container.appendChild(nota);

    document.getElementById('modal-loja').classList.remove('escondido');
}

async function recomprarRelíquiaBoss(id) {
    const it = BANCO_ITENS.find(i => i.id === id);
    if (!it || !(hunter.itensVendidosBoss || []).includes(id)) return;
    if (hunter.rankIndiceAtual < rankRecompraBoss(id)) {
        avisarJogo("🔒 Você ainda não alcançou o Rank necessário para recomprar esta relíquia.");
        return;
    }
    const preco = precoRecompraBoss(id);
    if ((hunter.gold || 0) < preco) {
        avisarJogo("⚠️ Gold insuficiente para recomprar esta relíquia!");
        return;
    }
    if (!await confirmarJogo(`🏺 Recomprar "${it.nome}" por ${preco.toLocaleString('pt-BR')} Gold?\n\nEla volta ENFRAQUECIDA (60% do poder original).`)) return;

    hunter.gold -= preco;
    hunter.itensVendidosBoss = hunter.itensVendidosBoss.filter(x => x !== id);
    if (!hunter.inventario.includes(id)) hunter.inventario.push(id);
    if (!hunter.itensEnfraquecidos.includes(id)) hunter.itensEnfraquecidos.push(id);
    hunter.recomprasBoss = (hunter.recomprasBoss || 0) + 1;

    tocarAudioSeguro(somXP);
    salvarDados();
    adicionarMsgChat(`🏺 [LOJA]: ${it.nome} recomprado (versão enfraquecida). Equipe-o no Arsenal!`);
    carregarEExibirInterface();
    abrirModalLoja();
}

async function solicitarConfirmacaoCompra(itemId) {
    tocarAudioSeguro(somClique);
    const item = ITENS_LOJA.find(i => i.id === itemId);
    if (!item) return;
    if (await confirmarJogo(`🛒 [CONFIRMAÇÃO DE COMPRA DO SISTEMA]:\n\nDeseja realmente gastar ${precoLoja(item)} Gold para adquirir "${item.nome}"?\n\nO que faz: ${item.desc}`)) {
        comprarItemLoja(itemId);
    }
}

function comprarItemLoja(itemId) {
    const item = ITENS_LOJA.find(i => i.id === itemId);
    if (!item) return;
    const preco = precoLoja(item);

    if (ORDEM_RARIDADE.indexOf(item.raridade) > ORDEM_RARIDADE.indexOf(LIMITE_RARIDADE_LOJA)) {
        avisarJogo("🔒 Este item é exclusivo de Bosses e Raids!");
        return;
    }
    if ((hunter.gold || 0) < preco) {
        avisarJogo("⚠️ Gold insuficiente para comprar este item!");
        return;
    }
    if (item.tipo === 'equipamento' && hunter.inventario.includes(item.id)) {
        avisarJogo("✔ Você já possui este equipamento!");
        return;
    }

    hunter.gold -= preco;
    if (hunter.buffTitulo === 'barganha') { hunter.buffTitulo = null; adicionarMsgChat('🏷️ [BARGANHA]: desconto extra aplicado nesta compra.'); }

    if (itemId === "pocao_hp") {
        hunter.sorosRecuperacao = (hunter.sorosRecuperacao || 0) + 1;
        adicionarMsgChat("🧪 [LOJA]: Soro de Recuperação comprado! Use-o na Bolsa para salvar um dia em que algo deu errado.");
    } else if (itemId === "pedra_polimento") {
        hunter.pedrasPolimento = (hunter.pedrasPolimento || 0) + 1;
        adicionarMsgChat("💎 [LOJA]: Pedra de Polimento comprada! Ela dá +15% de XP no próximo treino, sozinha.");
    } else if (itemId === "chave_masmorra") {
        hunter.chavesMasmorra = (hunter.chavesMasmorra || 0) + 1;
        adicionarMsgChat("🔑 [LOJA]: Chave de Masmorra comprada!");
    } else if (itemId === "essencia_mana") {
        hunter.essenciasMana = (hunter.essenciasMana || 0) + 1;
        adicionarMsgChat("🔷 [LOJA]: Essência de Mana adquirida!");
    } else if (item.tipo === 'equipamento') {
        hunter.inventario.push(item.id);
        adicionarMsgChat(`🗡️ [LOJA]: ${item.nome} adquirido! Equipe-o no Arsenal da Bolsa.`);
    }

    salvarDados();
    carregarEExibirInterface();
    abrirModalLoja();
}

/* ---------- EQUIPAMENTO ATIVO ---------- */
function resumoBonusEquip() {
    const l = [];
    const p = (v) => `${Math.round(v * 100)}%`;
    if (efeitoEquip('xp_global')) l.push(`⭐ +${p(Math.min(TETO_XP_EQUIP, efeitoEquip('xp_global')))} XP em tudo`);
    if (efeitoEquip('xp_forca')) l.push(`💪 Força: +${p(efeitoEquip('xp_forca'))} XP`);
    if (efeitoEquip('xp_agilidade')) l.push(`⚡ Agilidade: +${p(efeitoEquip('xp_agilidade'))} XP`);
    if (efeitoEquip('xp_resistencia')) l.push(`🛡️ Resistência: +${p(efeitoEquip('xp_resistencia'))} XP`);
    if (efeitoEquip('xp_inteligencia')) l.push(`🧠 Inteligência: +${p(efeitoEquip('xp_inteligencia'))} XP`);
    if (efeitoEquip('fadiga_menos')) l.push(`❤️ Vitalidade: −${p(Math.min(0.5, efeitoEquip('fadiga_menos')))} Fadiga ganha`);
    if (efeitoEquip('desconto_loja')) l.push(`🏷️ −${p(efeitoEquip('desconto_loja'))} preços da Loja`);
    if (efeitoEquip('bonus_venda')) l.push(`💰 +${p(efeitoEquip('bonus_venda'))} Gold ao vender`);
    if (efeitoEquip('forca_ganho')) l.push(`💪 +${p(efeitoEquip('forca_ganho'))} Força ganha por treino`);
    return l;
}

function renderizarSlotEquipamento() {
    const slot = document.getElementById('slot-item-equipado');
    if (!slot) return;
    slot.className = "slots-equip-grid";
    let html = '';
    Object.keys(SLOTS_EQUIP).forEach(s => {
        const id = (hunter.equipados || {})[s];
        const it = id ? BANCO_ITENS.find(i => i.id === id) : null;
        const info = SLOTS_EQUIP[s];
        const clique = `role="button" tabindex="0" onclick="abrirSeletorSlot('${s}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirSeletorSlot('${s}');}"`;
        if (it) {
            const fraco = (hunter.itensEnfraquecidos || []).includes(it.id) ? ' <span style="color:#f59e0b;">(60%)</span>' : '';
            html += `<div class="slot-equip slot-equip-cheio slot-equip-click slot-r-${it.raridade}" ${clique} title="${(it.desc || '').replace(/"/g, '&quot;')}"><div class="slot-equip-nome">${info.icone} ${info.nome}</div><div class="slot-equip-item">${it.nome}${fraco}</div></div>`;
        } else {
            html += `<div class="slot-equip slot-equip-click" ${clique}><div class="slot-equip-nome">${info.icone} ${info.nome}</div><div class="slot-equip-vazio">vazio · toque para equipar</div></div>`;
        }
    });
    const res = resumoBonusEquip().concat(linhasConjuntos());
    html += `<div class="slots-equip-resumo">${res.length ? '<b>Bônus ativos:</b> ' + res.join(' · ') : 'Nenhum bônus ativo. Toque em um slot para equipar um item.'}</div>`;
    slot.innerHTML = html;
}

/* ---------- BOLSA UNIFICADA ---------- */
function abrirModalInventario() {
    filtroBolsaCons = 'todos'; filtroBolsaArsenal = 'todos'; filtroBolsaRaridade = 'todas';
    renderizarBolsa();
    document.getElementById('modal-inventario').classList.remove('escondido');
}

function trocarAbaBolsa(aba) {
    tocarAudioSeguro(somClique);
    abaBolsaAtual = aba;
    renderizarBolsa();
}

function renderizarBolsa() {
    const container = document.getElementById('lista-itens-inventario');
    if (!container) return;

    document.getElementById('aba-consumiveis').classList.toggle('ativa', abaBolsaAtual === 'consumiveis');
    document.getElementById('aba-arsenal').classList.toggle('ativa', abaBolsaAtual === 'arsenal');

    const barra = document.getElementById('filtros-bolsa');
    if (barra) barra.innerHTML = htmlFiltrosBolsa();

    container.innerHTML = '';
    if (abaBolsaAtual === 'consumiveis') renderizarAbaConsumiveis(container);
    else renderizarAbaArsenal(container);
}

/* ---------- FILTROS DA BOLSA ---------- */
let filtroBolsaCons = 'todos';
let filtroBolsaArsenal = 'todos';
let filtroBolsaRaridade = 'todas';

const FILTROS_CONSUMIVEIS = [
    ['todos', 'Todos'], ['pocoes', '🧪 Poções'], ['pergaminhos', '📜 Pergaminhos'], ['materiais', '💎 Materiais'], ['especiais', '🔑 Especiais']
];
const FILTROS_ARSENAL = [
    ['todos', 'Todos'], ['arma', '🗡️ Armas'], ['cabeca', '🪖 Cabeça'], ['corpo', '🛡️ Corpo'], ['maos_pes', '🧤 Mãos/Pés'], ['acessorio', '💍 Acessórios']
];
// Categoria de cada utilitário (usada pelo filtro da aba Utilitários)
function categoriaConsumivel(nome) {
    if (/Pergaminho/.test(nome)) return 'pergaminhos';
    if (/Polimento|Ess[eê]ncia|Material/.test(nome)) return 'materiais';
    if (/Chave|Descanso/.test(nome)) return 'especiais';
    return 'pocoes'; // Soro, Poção de Alívio, Elixir do Fôlego, Cristal do Repouso
}
function categoriaEquip(item) { return (item.slot === 'acessorio') ? 'acessorio' : (item.slot || 'arma'); }

function htmlFiltrosBolsa() {
    const chip = (tipo, val, txt, ativo) => `<button type="button" class="filtro-bolsa${ativo ? ' ativo' : ''}" onclick="definirFiltroBolsa('${tipo}','${val}')">${txt}</button>`;
    if (abaBolsaAtual === 'consumiveis') {
        return FILTROS_CONSUMIVEIS.map(([v, t]) => chip('cons', v, t, filtroBolsaCons === v)).join('');
    }
    let h = FILTROS_ARSENAL.map(([v, t]) => chip('arsenal', v, t, filtroBolsaArsenal === v)).join('');
    h += '<div class="filtros-bolsa-linha">' + chip('raridade', 'todas', 'Todas as raridades', filtroBolsaRaridade === 'todas')
        + ORDEM_RARIDADE.map(r => chip('raridade', r, `${RARIDADES[r].icone} ${RARIDADES[r].nome}`, filtroBolsaRaridade === r)).join('') + '</div>';
    return h;
}

function definirFiltroBolsa(tipo, valor) {
    tocarAudioSeguro(somClique);
    if (tipo === 'cons') filtroBolsaCons = valor;
    else if (tipo === 'arsenal') filtroBolsaArsenal = valor;
    else filtroBolsaRaridade = valor;
    renderizarBolsa();
}

function linhaBolsa(nome, qtd, desc, botaoHtml) {
    // Com um filtro de categoria ativo, só aparecem os utilitários dessa categoria que o jogador possui
    if (filtroBolsaCons !== 'todos' && (categoriaConsumivel(nome) !== filtroBolsaCons || !(qtd > 0))) return '';
    return `<div class="rank-item-info">
        <div><strong>${nome}</strong> <span style="color:#38bdf8;">x${qtd}</span></div>
        <div style="font-size:0.8rem; color:#cbd5e1;">${desc}</div>
        ${botaoHtml || ''}
    </div>`;
}

function renderizarAbaConsumiveis(container) {
    const btn = (txt, fn, cor) => `<button type="button" class="btn-dev-acao" style="margin-top:6px; ${cor ? `border-color:${cor}; color:${cor};` : ''}" onclick="${fn}">${txt}</button>`;
    const d = (faz, como) => `<b>O que faz:</b> ${faz}<br><b>Como usar:</b> ${como}`;

    let html = '';

    // Efeitos ativos (para o jogador saber o que está valendo agora)
    const ativos = [];
    if ((hunter.cargaAliviadaRestante || 0) > 0) ativos.push(`🧪 Carga Aliviada: ${hunter.cargaAliviadaRestante} treino(s) com metas -35% e XP 100%`);
    if ((hunter.buffLigeiroRestante || 0) > 0) ativos.push(`📜 Treino Ligeiro: ${hunter.buffLigeiroRestante} treino(s) com 1,5x de XP`);
    if ((hunter.buffDuploRestante || 0) > 0) ativos.push(`📜 XP Duplo: próximo treino com 2x de XP`);
    if ((hunter.pedrasPolimento || 0) > 0) ativos.push(`💎 Polimento: +15% de XP no próximo treino`);
    if (hunter.elixirAtivoAte && sistemaCongelado()) ativos.push(`🧪 Cristal do Repouso: Sistema congelado`);
    if (filtroBolsaCons === 'todos') html += `<div class="status-efeitos-bolsa"><b>✨ EFEITOS ATIVOS AGORA</b><br>${ativos.length ? ativos.join('<br>') : 'Nenhum efeito ativo no momento.'}</div>`;

    html += linhaBolsa("🧪 Soro de Recuperação", hunter.sorosRecuperacao || 0,
        d("salva um dia em que algo deu errado: o treino conta como feito e o Streak e o XP do dia ficam protegidos. Não mexe na Fadiga.",
          "clique em USAR AGORA antes de o dia acabar. Não funciona na Zona de Penitência."),
        (hunter.sorosRecuperacao > 0) ? btn("USAR AGORA", "usarSoroDaBolsa()", "#a855f7") : "");

    html += linhaBolsa("🧪 Poção de Alívio Vital", hunter.pocoesAlivio || 0,
        d("alivia o treino de verdade: nos próximos 2 treinos suas metas caem 35%, mas o XP vale como se fosse a meta cheia e a Fadiga sobe menos (porque você treinou menos). Não reduz a barra de Fadiga sozinha: o corpo descansa de fato.",
          "só com Fadiga a partir de 50%, 7 dias de espera entre usos. Não vale na Raid, no fim de semana nem na Zona de Penitência."),
        (hunter.pocoesAlivio > 0) ? btn("USAR AGORA", "usarPocaoAlivio()", "#22c55e") : "");

    html += linhaBolsa("☕ Descanso Remunerado", hunter.descansosRemunerados || 0,
        d("um dia de descanso de verdade: você não treina, o Streak é mantido, recebe 50% do XP do treino do dia e a Fadiga cai 25%.",
          "clique em USAR HOJE em um dia sem treino concluído (não vale no dia do Boss nem na Zona de Penitência). Você ganha 1 por mês com o título [ Inabalável ] equipado."),
        (hunter.descansosRemunerados > 0) ? btn("USAR HOJE", "usarDescansoRemunerado()", "#22c55e") : "");

    html += linhaBolsa("💎 Pedra de Polimento de Elite", hunter.pedrasPolimento || 0,
        d("+15% de XP no próximo treino concluído.", "automático: é gasta sozinha ao concluir o próximo treino (não vale na Zona de Penitência nem na Raid)."));

    html += linhaBolsa("📜 Pergaminho de Treino Ligeiro", hunter.pergaminhosLigeiro || 0,
        d("seus próximos 3 treinos concluídos rendem 1,5x de XP.", "clique em ATIVAR e conclua seus treinos normalmente (não vale na Raid nem na Zona de Penitência; não acumula com o XP Duplo)."),
        (hunter.pergaminhosLigeiro > 0) ? btn("ATIVAR", "ativarPergaminho('ligeiro')", "#eab308") : "");

    html += linhaBolsa("📜 Pergaminho de XP Duplo", hunter.pergaminhosDuplo || 0,
        d("o próximo treino concluído rende 2x de XP.", "clique em ATIVAR antes de treinar (não vale na Raid nem na Zona de Penitência; tem prioridade sobre o Treino Ligeiro)."),
        (hunter.pergaminhosDuplo > 0) ? btn("ATIVAR", "ativarPergaminho('duplo')", "#eab308") : "");

    html += linhaBolsa("🧪 Elixir do Fôlego Extra", hunter.elixiresFolego || 0,
        d("acrescenta +5 minutos ao relógio da Ruptura ou da Masmorra Temporária que estiver ativa.", "só funciona com uma Ruptura ou Masmorra Temporária em andamento. Clique em USAR AGORA."),
        (hunter.elixiresFolego > 0) ? btn("USAR AGORA", "usarElixirFolego()", "#38bdf8") : "");

    html += linhaBolsa("🔑 Chave de Masmorra Instantânea", hunter.chavesMasmorra || 0,
        d("abre uma Fenda Temporária de 2 horas com exercícios ~35% mais leves; dá XP, Gold, artefato e título. Enquanto você está dentro, as Missões Diárias ficam pausadas e voltam de onde pararam.",
          "clique em USAR AGORA e aceite o convite da Fenda quando estiver pronto."),
        (hunter.chavesMasmorra > 0) ? btn("USAR AGORA", "usarChaveDaBolsa()", "#a855f7") : "");

    let opcoesDias = '';
    for (let dd = ELIXIR_CONFIG.diasMin; dd <= ELIXIR_CONFIG.diasMax; dd++) opcoesDias += `<option value="${dd}">${dd} dias</option>`;
    const elixirAcao = (hunter.elixires > 0)
        ? `<div style="margin-top:6px;">Congelar por: <select id="sel-dias-elixir" class="select-elixir">${opcoesDias}</select> ${btn("USAR ELIXIR", "usarElixirDaVida()", "#ef4444")}</div>`
        : "";
    html += linhaBolsa("🧪 Cristal do Repouso 🔴", hunter.elixires || 0,
        d("Licença Médica / Viagem: congela o Sistema por 7 a 15 dias mantendo o Streak 100% intacto, sem penalidades. Treinos e Bosses ficam pausados.",
          "escolha quantos dias e clique em USAR ELIXIR. É forjado na Caldeira do Soberano (Rank B+)."),
        elixirAcao);

    html += linhaBolsa("🔷 Essência de Mana", hunter.essenciasMana || 0,
        d("material de forja: não tem efeito sozinho.", "fica guardada; 2 delas são gastas a cada vez que você refabrica o Cristal do Repouso na Caldeira."));
    html += linhaBolsa("💠 Material Raro de Boss", hunter.materiaisBoss || 0,
        d("material dropado ao derrotar Bosses: não tem efeito sozinho.", "3 deles desbloqueiam o primeiro lote do Cristal do Repouso na Caldeira do Soberano (Rank B+)."));

    if (filtroBolsaCons === 'todos' || filtroBolsaCons === 'materiais') html += htmlCaldeira();
    else if (!html) html = '';
    if (!html.trim()) html = '<p style="color:#94a3b8; text-align:center;">Nada aqui ainda. Você não possui utilitários dessa categoria.</p>';

    container.innerHTML = html;
}

function diasRestantesCooldownElixir() {
    if (!hunter.ultimaForjaElixir) return 0;
    const decorridos = diffDias(obterDataAtual(), new Date(hunter.ultimaForjaElixir));
    return Math.max(0, ELIXIR_CONFIG.cooldownDias - decorridos);
}

function htmlCaldeira() {
    if (hunter.rankIndiceAtual < ELIXIR_CONFIG.rankMinimo) {
        return `<div class="caldeira-box"><h4>🔥 CALDEIRA DO SOBERANO</h4><div style="font-size:0.8rem; color:#94a3b8;">🔒 Desbloqueada no Rank B. Reúna ${ELIXIR_CONFIG.materiaisParaDesbloquear} Materiais Raros de Boss para forjar o Cristal do Repouso.</div></div>`;
    }

    if (!hunter.elixirDesbloqueado) {
        const tem = hunter.materiaisBoss || 0;
        const pronto = tem >= ELIXIR_CONFIG.materiaisParaDesbloquear;
        return `<div class="caldeira-box"><h4>🔥 CALDEIRA DO SOBERANO</h4>
            <div style="font-size:0.8rem; color:#e9d5ff;">Forje um Lote de ${ELIXIR_CONFIG.frascosPorLote} Frascos Míticos do Cristal do Repouso usando ${ELIXIR_CONFIG.materiaisParaDesbloquear} Materiais Raros de Boss.<br>Materiais: <b>${tem}/${ELIXIR_CONFIG.materiaisParaDesbloquear}</b></div>
            <button type="button" class="btn-dev-acao" style="margin-top:6px; border-color:#a855f7; color:#a855f7;" ${pronto ? '' : 'disabled'} onclick="forjarElixir()">🔥 FORJAR LOTE</button></div>`;
    }

    const cd = diasRestantesCooldownElixir();
    const temGold = (hunter.gold || 0) >= ELIXIR_CONFIG.custoGold;
    const temEss = (hunter.essenciasMana || 0) >= ELIXIR_CONFIG.custoEssencias;
    const pode = cd === 0 && temGold && temEss;
    return `<div class="caldeira-box"><h4>🔥 CALDEIRA DO SOBERANO — REFABRICAÇÃO</h4>
        <div style="font-size:0.8rem; color:#e9d5ff;">Custo: <b>${ELIXIR_CONFIG.custoGold} Gold</b> + <b>${ELIXIR_CONFIG.custoEssencias} Essências de Mana</b> (você tem ${hunter.essenciasMana || 0}).<br>
        Rende ${ELIXIR_CONFIG.frascosPorLote} Frascos. Cooldown: ${cd > 0 ? `<b style="color:#ef4444;">${cd} dia(s) restantes</b>` : '<b style="color:#22c55e;">pronta</b>'}.</div>
        <button type="button" class="btn-dev-acao" style="margin-top:6px; border-color:#a855f7; color:#a855f7;" ${pode ? '' : 'disabled'} onclick="forjarElixir()">🔥 REFABRICAR</button></div>`;
}

function forjarElixir() {
    if (hunter.rankIndiceAtual < ELIXIR_CONFIG.rankMinimo) return;

    if (!hunter.elixirDesbloqueado) {
        if ((hunter.materiaisBoss || 0) < ELIXIR_CONFIG.materiaisParaDesbloquear) {
            avisarJogo("⚠️ Materiais Raros de Boss insuficientes!");
            return;
        }
        hunter.materiaisBoss -= ELIXIR_CONFIG.materiaisParaDesbloquear;
        hunter.elixirDesbloqueado = true;
    } else {
        if (diasRestantesCooldownElixir() > 0) {
            avisarJogo("⏳ A Caldeira ainda está em cooldown!");
            return;
        }
        if ((hunter.gold || 0) < ELIXIR_CONFIG.custoGold || (hunter.essenciasMana || 0) < ELIXIR_CONFIG.custoEssencias) {
            avisarJogo("⚠️ Gold ou Essências de Mana insuficientes!");
            return;
        }
        hunter.gold -= ELIXIR_CONFIG.custoGold;
        hunter.essenciasMana -= ELIXIR_CONFIG.custoEssencias;
    }

    hunter.elixires = (hunter.elixires || 0) + ELIXIR_CONFIG.frascosPorLote;
    hunter.ultimaForjaElixir = obterDataAtual().toISOString();
    tocarAudioSeguro(somXP);

    salvarDados();
    adicionarMsgChat(`🧪 [CALDEIRA DO SOBERANO]: Lote forjado! +${ELIXIR_CONFIG.frascosPorLote} Frascos do Cristal do Repouso (Mítico).`);
    document.getElementById('user-gold').innerText = (hunter.gold || 0).toLocaleString('pt-BR');
    renderizarBolsa();
}

async function usarElixirDaVida() {
    if ((hunter.elixires || 0) <= 0) return;
    if (sistemaCongelado()) {
        avisarJogo("🧪 O Sistema já está congelado por um Elixir ativo!");
        return;
    }
    const dias = parseInt(document.getElementById('sel-dias-elixir')?.value) || ELIXIR_CONFIG.diasMin;

    if (!await confirmarJogo(`🧪 Usar 1 Cristal do Repouso para congelar o Sistema por ${dias} dias?\n\nSeu Streak ficará 100% intacto, sem penalidades. Treinos e Bosses ficam pausados.`)) return;

    hunter.elixires -= 1;
    const fim = soData(obterDataAtual());
    fim.setDate(fim.getDate() + dias);
    hunter.elixirAtivoAte = fim.toISOString();
    hunter.folgaRegistradaFimDeSemana = false;
    hunter.ultimoDiaConcluido = obterDataAtual().toDateString();

    tocarAudioSeguro(somPortal);
    salvarDados();
    document.getElementById('modal-inventario').classList.add('escondido');
    carregarEExibirInterface();
    adicionarMsgChat(`🧪 [CRISTAL DO REPOUSO]: Sistema congelado por ${dias} dias! Streak preservado. Boa recuperação/viagem!`);
}

async function usarSoroDaBolsa() {
    if ((hunter.sorosRecuperacao || 0) <= 0) return;
    if (hunter.zonaPunicao) {
        avisarJogo("🚨 Na Zona de Penitência não existe justificativa: o Soro não pode ser usado. Cumpra a punição!");
        return;
    }
    if (hunter.diariaConcluida) {
        avisarJogo("✔ O treino de hoje já está registrado!");
        return;
    }
    if (!await confirmarJogo(textoConfirmarSoro(), { sim: '[ USAR SORO ]', nao: '[ VOLTAR ]' })) return;
    usarSoroRecuperacao();
    renderizarBolsa();
}

async function usarPocaoAlivio() {
    if ((hunter.pocoesAlivio || 0) <= 0) return;
    if (sistemaCongelado()) { avisarJogo("🧪 O Sistema está congelado pelo Cristal do Repouso."); return; }
    if (hunter.bossCombateAtivo) { avisarJogo("⚔️ A Poção de Alívio não vale durante a Raid do Boss."); return; }
    if (hunter.zonaPunicao) { avisarJogo("🚨 Na Zona de Penitência não há alívio: cumpra a punição!"); return; }
    if ((hunter.cargaAliviadaRestante || 0) > 0) { avisarJogo("🧪 Você já está com a Carga Aliviada ativa!"); return; }
    if ((hunter.fadiga || 0) < 50) {
        avisarJogo("🧪 Você não está cansado o suficiente. A Poção de Alívio Vital só funciona com a Fadiga em 50% ou mais — ela é para quem realmente precisa de um treino mais leve.");
        return;
    }
    if (hunter.cargaAliviadaUltimoUso) {
        const dias = diffDias(obterDataAtual(), new Date(hunter.cargaAliviadaUltimoUso));
        if (dias < 7) { avisarJogo(`⏳ A Poção tem 7 dias de espera entre usos. Faltam ${7 - dias} dia(s).`); return; }
    }
    if (!await confirmarJogo("🧪 Usar a Poção de Alívio Vital?\n\nNos próximos 2 treinos suas metas caem 35%, mas o XP conta como se fosse a meta cheia. A barra de Fadiga NÃO cai sozinha: ela sobe menos porque você treina menos. Aproveite para descansar de verdade!")) return;

    hunter.pocoesAlivio -= 1;
    hunter.cargaAliviadaRestante = 2;
    hunter.cargaAliviadaUltimoUso = obterDataAtual().toISOString();
    recalcularMetasDoRank();
    tocarAudioSeguro(somXP);
    salvarDados();
    document.getElementById('modal-inventario').classList.add('escondido');
    carregarEExibirInterface();
    adicionarMsgChat("🧪 [CARGA ALIVIADA]: ativa por 2 treinos! Metas -35% com XP de 100%. Descanse de verdade.");
}

function ativarPergaminho(tipo) {
    if (tipo === 'ligeiro') {
        if ((hunter.pergaminhosLigeiro || 0) <= 0) return;
        if ((hunter.buffLigeiroRestante || 0) > 0) { avisarJogo("📜 O Treino Ligeiro já está ativo!"); return; }
        hunter.pergaminhosLigeiro -= 1;
        hunter.buffLigeiroRestante = 3;
        adicionarMsgChat("📜 [PERGAMINHO DE TREINO LIGEIRO]: seus próximos 3 treinos concluídos rendem 1,5x de XP!");
    } else {
        if ((hunter.pergaminhosDuplo || 0) <= 0) return;
        if ((hunter.buffDuploRestante || 0) > 0) { avisarJogo("📜 O XP Duplo já está ativo!"); return; }
        hunter.pergaminhosDuplo -= 1;
        hunter.buffDuploRestante = 1;
        adicionarMsgChat("📜 [PERGAMINHO DE XP DUPLO]: seu próximo treino concluído rende 2x de XP!");
    }
    tocarAudioSeguro(somXP);
    salvarDados();
    renderizarBolsa();
}

function usarElixirFolego() {
    if ((hunter.elixiresFolego || 0) <= 0) return;
    const extra = 5 * 60000;
    if (hunter.rupturaAtiva && hunter.rupturaFimData) {
        hunter.rupturaFimData = new Date(new Date(hunter.rupturaFimData).getTime() + extra).toISOString();
        hunter.rupturaDuracaoMs = (hunter.rupturaDuracaoMs || RUPTURA_DURACAO_MIN * 60000) + extra;
    } else if (hunter.masmorraTempAtiva && hunter.masmorraTempAceita && hunter.masmorraTempFimData) {
        hunter.masmorraTempFimData = new Date(new Date(hunter.masmorraTempFimData).getTime() + extra).toISOString();
    } else {
        avisarJogo("🧪 O Elixir do Fôlego Extra só funciona com uma Ruptura ou Masmorra Temporária em andamento.");
        return;
    }
    hunter.elixiresFolego -= 1;
    tocarAudioSeguro(somXP);
    salvarDados();
    adicionarMsgChat("🧪 [FÔLEGO EXTRA]: +5 minutos adicionados ao relógio!");
    renderizarBolsa();
}

async function usarDescansoRemunerado() {
    if ((hunter.descansosRemunerados || 0) <= 0) return;
    const est = obterEstadoDia();
    if (est.frozen || est.pausado) { avisarJogo("⛔ Não é possível usar o Descanso agora (Sistema congelado ou pausado)."); return; }
    if (hunter.zonaPunicao) { avisarJogo("🚨 Na Zona de Penitência não existe descanso. Cumpra a punição!"); return; }
    if (est.boss.visivel || est.descansoBoss) { avisarJogo("⚔️ No dia do Boss (e na sexta antes dele) o descanso já é definido pelo Sistema."); return; }
    if (hunter.diariaConcluida || hunter.folgaRegistradaFimDeSemana) { avisarJogo("✔ Hoje já está registrado (treino concluído ou descanso)."); return; }
    if (!await confirmarJogo("☕ Usar o Descanso Remunerado hoje?\n\nVocê NÃO treina hoje, o Streak é mantido, recebe 50% do XP do treino do dia e a Fadiga cai 25%. Descanse de verdade!")) return;

    const xp = Math.round(xpTotalDasMetas() * 0.5);
    hunter.descansosRemunerados -= 1;
    hunter.xpTotal += xp;
    registrarXpDoDia(xp);
    hunter.fadiga = Math.max(0, (hunter.fadiga || 0) - 25);
    hunter.folgaRegistradaFimDeSemana = true;
    hunter.descansoPagoHoje = true;
    hunter.diariaConcluida = true;
    hunter.ultimoDiaConcluido = obterDataAtual().toDateString();
    tocarAudioSeguro(somXP);
    salvarDados();
    document.getElementById('modal-inventario').classList.add('escondido');
    carregarEExibirInterface();
    adicionarMsgChat(`☕ [DESCANSO REMUNERADO]: +${xp.toLocaleString('pt-BR')} XP, Fadiga -25% (${Math.round(hunter.fadiga)}%) e Streak mantido. Descanse de verdade!`);
}

function checarDescansoMensal() {
    if (efeitoTitulo('descanso_mensal') <= 0) return;
    const d = obterDataAtual();
    const mes = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (hunter.ultimoMesDescanso !== mes) {
        hunter.ultimoMesDescanso = mes;
        hunter.descansosRemunerados = (hunter.descansosRemunerados || 0) + 1;
        salvarDados();
        adicionarMsgChat("☕ [TÍTULO INABALÁVEL]: você recebeu 1 Descanso Remunerado deste mês! Veja na Bolsa.");
    }
}

function usarChaveDaBolsa() {
    document.getElementById('modal-inventario').classList.add('escondido');
    usarChaveMasmorra();
}

function renderizarAbaArsenal(container) {
    if (hunter.inventario.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; text-align:center;">Nenhum equipamento obtido ainda. Derrote Bosses ou compre na Loja!</p>';
        return;
    }

    const itens = hunter.inventario
        .map(id => BANCO_ITENS.find(i => i.id === id))
        .filter(Boolean)
        .filter(i => filtroBolsaArsenal === 'todos' || categoriaEquip(i) === filtroBolsaArsenal)
        .filter(i => filtroBolsaRaridade === 'todas' || i.raridade === filtroBolsaRaridade)
        .sort((a, b) => ORDEM_RARIDADE.indexOf(b.raridade) - ORDEM_RARIDADE.indexOf(a.raridade));

    if (itens.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; text-align:center;">Nada aqui ainda. Nenhum equipamento seu combina com esses filtros.</p>';
        return;
    }

    itens.forEach(item => {
        const r = RARIDADES[item.raridade];
        const equipado = estaEquipado(item.id);
        const ehBoss = !!chefeDoItem(item.id);
        const fraco = (hunter.itensEnfraquecidos || []).includes(item.id);
        const valor = ehBoss ? valorVendaBoss(item.id) : Math.round(r.venda * (1 + bonusVenda()));
        const div = document.createElement('div');
        div.className = 'rank-item-info';
        div.style.borderColor = r.cor;
        div.innerHTML = `
            <div><strong>${item.nome}</strong>
                <span class="tag-raridade" style="color:${r.cor}; border-color:${r.cor};">${r.icone} ${r.nome}</span>
                <span class="tag-raridade" style="color:#94a3b8; border-color:#475569;">${item.slot === 'acessorio' ? 'ACESSÓRIO' : (SLOTS_EQUIP[item.slot] || {nome:''}).nome.toUpperCase()}</span>
                ${ehBoss ? '<span class="tag-raridade" style="color:#ef4444; border-color:#ef4444;">ITEM DE BOSS</span>' : ''}
                ${fraco ? '<span class="tag-raridade" style="color:#f59e0b; border-color:#f59e0b;">ENFRAQUECIDO 60%</span>' : ''}</div>
            <div style="font-size:0.8rem; color:#eab308;"><b>O que faz:</b> ${item.desc}${fraco ? ' (Só 60% do poder, por ser uma versão recomprada.)' : ''}</div>
            ${textoConjuntoDoItem(item.id).map(t => `<div style="font-size:0.75rem; color:#38bdf8;">${t}</div>`).join('')}
            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
                <button type="button" class="btn-dev-acao" onclick="equiparItem('${item.id}')">${equipado ? '✔ EQUIPADO (DESEQUIPAR)' : 'EQUIPAR'}</button>
                <button type="button" class="btn-dev-acao" style="border-color:#22c55e; color:#22c55e;" onclick="venderItem('${item.id}')">💰 VENDER (${valor.toLocaleString('pt-BR')} G)${ehBoss ? ' ⚠️' : ''}</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function equiparItem(itemId) {
    const item = BANCO_ITENS.find(i => i.id === itemId);
    if (!item) return;
    if (estaEquipado(itemId)) {
        desequiparItem(itemId);
        adicionarMsgChat(`🗡️ ${item.nome} desequipado.`);
    } else {
        if ((item.efeitos || {}).desespero && (hunter.fadiga || 0) >= 80) {
            avisarJogo("💍 Com a Fadiga em 80% ou mais, o Anel do Desesperado não pode ser equipado. Descanse primeiro!");
            return;
        }
        colocarNoSlot(item);
        adicionarMsgChat(`🗡️ [ARTEFATO EQUIPADO]: ${item.nome} ativo! ${item.desc}`);
        window.__brilhoPend = item.raridade;
    }
    recalcularMetasDoRank();
    salvarDados();
    renderizarSlotEquipamento();
    atualizarAtributosERank();
    renderizarMissoes();
    renderizarBolsa();
    if (window.__brilhoPend) { brilhoEquipar(window.__brilhoPend); window.__brilhoPend = null; }
}

let itemVendaBossPendente = null;

async function venderItem(itemId) {
    const item = BANCO_ITENS.find(i => i.id === itemId);
    if (!item) return;
    if (chefeDoItem(itemId)) { abrirModalVendaBoss(itemId); return; }

    const r = RARIDADES[item.raridade];
    const valor = Math.round(r.venda * (1 + bonusVenda()));
    if (!await confirmarJogo(`💰 Vender "${item.nome}" (${r.icone} ${r.nome}) por ${valor} Gold?\n\nEsta ação não pode ser desfeita.`)) return;

    hunter.inventario = hunter.inventario.filter(id => id !== itemId);
    desequiparItem(itemId);
    hunter.gold += valor;

    tocarAudioSeguro(somXP);
    recalcularMetasDoRank();
    salvarDados();
    adicionarMsgChat(`💰 [ARSENAL]: ${item.nome} vendido por ${valor} Gold.`);
    document.getElementById('user-gold').innerText = (hunter.gold || 0).toLocaleString('pt-BR');
    renderizarSlotEquipamento();
    atualizarAtributosERank();
    renderizarBolsa();
}

function abrirModalVendaBoss(itemId) {
    const item = BANCO_ITENS.find(i => i.id === itemId);
    const chefe = chefeDoItem(itemId);
    if (!item || !chefe) return;
    itemVendaBossPendente = itemId;
    const final = ehChefeFinal(chefe);
    const valor = valorVendaBoss(itemId);
    const rankRec = ESCALA_RANKS[Math.min(rankRecompraBoss(itemId), ESCALA_RANKS.length - 1)];

    document.getElementById('venda-boss-nome').innerText = item.nome;
    document.getElementById('venda-boss-valor').innerHTML = `Você recebe <b style="color:#22c55e;">${valor.toLocaleString('pt-BR')} Gold</b> <small>(valor fixo deste Boss${bonusVenda() > 0 ? ' + ' + Math.round(bonusVenda() * 100) + '% de bônus de venda' : ''})</small>`;

    let html = `<li>⚠️ Este é um <b>item único de Boss</b>: só existe um no jogo.</li>`;
    if (final) {
        html += `<li>🔥 <b>VENDA DEFINITIVA:</b> este é o item do <b>Boss Final</b>. O valor é altíssimo, mas ele será <b>DELETADO</b> do jogo, não vai para a Loja e <b>não pode ser comprado de volta nunca mais</b>.</li>`;
    } else {
        html += `<li>📉 Na Loja, o item passa a ter <b>efeitos enfraquecidos</b> (só 60% do poder original ao recomprar).</li>
                 <li>🔒 Ele só <b>reaparece para recompra</b> quando você alcançar o <b>${rankRec.nome}</b> (1 Rank acima do Rank do Boss que o dropou).</li>
                 <li>🏷️ Para comprar de volta, a Loja cobra <b>400% do valor da venda: ${precoRecompraBoss(itemId).toLocaleString('pt-BR')} Gold</b>.</li>`;
    }
    document.getElementById('venda-boss-lista').innerHTML = html;
    document.getElementById('btn-confirmar-venda-boss').innerText = final ? "[ VENDER PARA SEMPRE ]" : "[ CONFIRMAR VENDA ]";
    tocarAudioSeguro(somPortal);
    document.getElementById('modal-venda-boss').classList.remove('escondido');
}

function fecharModalVendaBoss() {
    itemVendaBossPendente = null;
    document.getElementById('modal-venda-boss').classList.add('escondido');
}

function confirmarVendaBoss() {
    const itemId = itemVendaBossPendente;
    const item = BANCO_ITENS.find(i => i.id === itemId);
    const chefe = chefeDoItem(itemId);
    if (!item || !chefe) { fecharModalVendaBoss(); return; }

    const valor = valorVendaBoss(itemId);
    hunter.inventario = hunter.inventario.filter(id => id !== itemId);
    desequiparItem(itemId);
    hunter.itensEnfraquecidos = (hunter.itensEnfraquecidos || []).filter(id => id !== itemId);
    hunter.gold += valor;
    hunter.vendasBoss = (hunter.vendasBoss || 0) + 1;

    if (ehChefeFinal(chefe)) {
        hunter.vendeuBossFinal = true;
        if (!hunter.itensDeletados.includes(itemId)) hunter.itensDeletados.push(itemId);
        adicionarMsgChat(`🔥 [VENDA DEFINITIVA]: ${item.nome} foi deletado do jogo para sempre. +${valor.toLocaleString('pt-BR')} Gold.`);
    } else {
        if (!hunter.itensVendidosBoss.includes(itemId)) hunter.itensVendidosBoss.push(itemId);
        adicionarMsgChat(`💰 [VENDA DE BOSS]: ${item.nome} vendido por ${valor.toLocaleString('pt-BR')} Gold. Ele voltará à Loja (enfraquecido) quando você alcançar o ${ESCALA_RANKS[Math.min(rankRecompraBoss(itemId), ESCALA_RANKS.length - 1)].nome}.`);
    }

    tocarAudioSeguro(somXP);
    fecharModalVendaBoss();
    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
    renderizarBolsa();
}

/* ---------- RANKS, MAPA, CONQUISTAS ---------- */
function abrirModalRanks() {
    const listaContainer = document.getElementById('ranks-lista');
    listaContainer.innerHTML = '';

    ESCALA_RANKS.forEach((r) => {
        const item = document.createElement('div');
        item.className = 'rank-item-info';
        const alcancado = hunter.xpTotal >= r.xpRequerido;
        if (alcancado) item.classList.add('rank-alcançado');

        item.innerHTML = `
            <div><strong>${r.icone} ${r.nome}</strong> ${r.titulo} - Exige: ${r.xpRequerido.toLocaleString('pt-BR')} XP</div>
        `;
        listaContainer.appendChild(item);
    });

    document.getElementById('modal-ranks').classList.remove('escondido');
}

function abrirModalMapaMundial() {
    const container = document.getElementById('lista-mapa-regioes');
    container.innerHTML = '';

    BANCO_CHEFES.forEach((chefe, idx) => {
        const div = document.createElement('div');
        div.className = 'rank-item-info';
        const derrotado = idx < hunter.bossIndiceAtual || (idx === BANCO_CHEFES.length - 1 && hunter.bossFinalDerrotado);
        const liberado = hunter.rankIndiceAtual >= chefe.rankMinimo;
        let status = "🔒 Bloqueado (" + chefe.rankNome + ")";
        if (derrotado) status = "✅ Derrotado";
        else if (liberado) status = "⚔️ Liberado";

        if (derrotado) div.classList.add('rank-alcançado');

        div.innerHTML = `
            <div><strong>[Região ${idx + 1}]: ${chefe.regiao}</strong> - <small>${status}</small></div>
            <div style="font-size:0.85rem; color:#cbd5e1;">Chefe: ${chefe.nome}</div>
        `;
        container.appendChild(div);
    });
    if (hunter.bossFinalDerrotado) {
        const eco = chefeEco();
        const div = document.createElement('div');
        div.className = 'rank-item-info';
        div.innerHTML = `<div><strong>[Fenda dos Ecos]: ${eco.regiao}</strong> - <small>⚔️ Ecos vencidos: ${hunter.ecoVitorias || 0}</small></div><div style="font-size:0.85rem; color:#cbd5e1;">Próximo: ${eco.nome} — HP ${eco.hpMax.toLocaleString('pt-BR')}</div><div style="font-size:0.78rem; color:#94a3b8;">${eco.desc}</div>`;
        container.appendChild(div);
    }

    document.getElementById('modal-mapa').classList.remove('escondido');
}

function mostrarToastConquista(c) {
    mostrarToast({
        tag: '🏆 CONQUISTA DESBLOQUEADA', titulo: c.titulo,
        texto: `<b>Você ganhou:</b> ${textoRecompensasConquista(c) || '—'}`,
        linhas: textoEfeitoRecompensasConquista(c) || [], cor: '#eab308'
    });
}

function checarConquistasAutomated() {
    let mudou = false;
    BANCO_CONQUISTAS.forEach(c => {
        if (hunter.conquistasDesbloqueadas.includes(c.id)) return;
        let ok = false;
        try { ok = !!c.condicao(hunter); } catch (e) { ok = false; }
        if (!ok) return;

        hunter.conquistasDesbloqueadas.push(c.id);
        hunter.xpTotal += c.xp || 0;
        hunter.gold += c.gold || 0;
        if (c.itemGanho) hunter[c.itemGanho.campo] = (hunter[c.itemGanho.campo] || 0) + c.itemGanho.qtd;
        if (c.equipGanho && !hunter.inventario.includes(c.equipGanho)) hunter.inventario.push(c.equipGanho);
        if (c.tituloGanho && !hunter.titulosColecao.includes(c.tituloGanho)) hunter.titulosColecao.push(c.tituloGanho);
        if (c.ph) ganharPontosHabilidade(c.ph, c.titulo);
        tocarAudioSeguro(somXP);
        adicionarMsgChat(`🏆 [CONQUISTA]: "${c.titulo}" — ${textoRecompensasConquista(c)}`);
        mostrarToastConquista(c);
        mudou = true;
    });
    if (mudou) {
        salvarDados();
        atualizarInventarioTitulos();
        atualizarAtributosERank();
    }
}

/* ---------- JUSTIFICATIVAS ---------- */
// Relatório de imprevisto de hoje, ainda válido (a data é a do dia do jogo; amanhã ele some sozinho)
function justificativaDeHoje() {
    const j = hunter && hunter.justificativaHoje;
    if (!j || typeof j !== 'object') return null;
    return j.data === obterDataAtual().toDateString() ? j : null;
}

// Texto de confirmação de cada motivo (o jogador lê o que vai acontecer ANTES de confirmar)
function textoExplicacaoJustificativa(motivo) {
    const pct = Math.round(Math.min(hunter.ajusteMetaPct || 1, 0.8) * 100);
    if (motivo === 'pesado') return `⚖️ [ESTAVA MUITO PESADO]\n\n• Seu Streak é mantido.\n• Hoje não rende XP e as missões de hoje somem.\n• No próximo treino as metas ficam em ${pct}% do normal.\n• Depois desse treino o Sistema pergunta como foi (muito pesado, no limite ou fácil) e ajusta as metas, treino a treino, até encaixar.\n\nConfirmar?`;
    if (motivo === 'preguica') return `❌ [PREGUIÇA / DESISTÊNCIA]\n\n• Você perde 50% do XP do treino de hoje, agora (no máximo o XP que você tem).\n• O Streak zera.\n• As missões de hoje somem e você entra na Zona de Penitência: as missões da zona liberam no próximo dia útil (se já tiver passado da meia-noite quando você abrir o jogo, ela já estará ativa).\n• Cumprir a Zona não dá XP, mas evita perder mais 50%.\n\nConfirmar?`;
    return `⏳ [NÃO TIVE TEMPO]\n\n• Você NÃO vai para a Zona de Penitência.\n• Mas o Streak é perdido e hoje não rende nenhum XP, mesmo que você tenha feito parte do treino.\n• As missões de hoje somem e voltam amanhã.\n\nConfirmar?`;
}

async function processarJustificativa(motivo) {
    if (hunter.zonaPunicao) { avisarJogo("🚨 Na Zona de Penitência não existe justificativa. Cumpra a punição!"); return; }
    if (hunter.diariaConcluida && !hunter.isDev) { adicionarMsgChat("[SISTEMA]: Treino de hoje já foi registrado!"); return; }
    if (!['pesado', 'preguica', 'tempo'].includes(motivo)) return;
    if (motivo === 'preguica' && protegidoDeIniciante()) {
        document.getElementById('modal-justificativa').classList.add('escondido');
        avisarJogo("🌱 [SEM PRESSÃO]\n\nVocê ainda não ganhou nenhum XP, então não há o que perder e o Sistema não te manda para a Zona de Penitência. O dia continua aberto: quando puder, faça o treino. Quando você ganhar o primeiro XP, as regras normais passam a valer.");
        return;
    }
    document.getElementById('modal-justificativa').classList.add('escondido');
    const ok = await confirmarJogo(textoExplicacaoJustificativa(motivo), { sim: '[ CONFIRMAR ]', nao: '[ VOLTAR ]' });
    if (!ok) { document.getElementById('modal-justificativa').classList.remove('escondido'); return; }
    if (hunter.diariaConcluida && !hunter.isDev) return; // nada mudou? (segurança contra toque duplo)

    const hoje = obterDataAtual().toDateString();
    if (motivo === 'pesado') {
        // Streak mantido, sem XP; próximo treino com metas 20% menores e a escada de perguntas começa
        hunter.ajusteMetaPct = Math.min(Math.max(0.5, Number(hunter.ajusteMetaPct) || 1), 0.8);
        hunter.ajusteMetaPerguntar = true;
        hunter.ajusteMetaAguardaResposta = false;
        hunter.justificativaHoje = { data: hoje, tipo: 'pesado' };
        hunter.diariaConcluida = true;
        hunter.ultimoDiaConcluido = hoje;
        salvarDados();
        carregarEExibirInterface();
        adicionarMsgChat(`⚖️ [RECALIBRAÇÃO]: Streak mantido (${hunter.streakDias || 0} dias), sem XP hoje. No próximo treino as metas ficam em ${Math.round(hunter.ajusteMetaPct * 100)}% do normal. Depois dele, o Sistema pergunta como foi.`);
    } else if (motivo === 'preguica') {
        // Entrada na zona: perde 50% do XP do treino estipulado para hoje; missões da zona só liberam no próximo dia útil
        const rz = aplicarPerdaEntradaZona();
        const { treino: treinoDoDia, perdido } = rz;
        hunter.zonaPunicao = true;
        hunter.zonaPunicaoEtapa = 'aguardando';
        hunter.diariaConcluida = false;
        hunter.streakDias = 0;
        hunter.ultimoDiaConcluido = hoje;
        salvarDados();
        carregarEExibirInterface();
        adicionarMsgChat(`🚨 [ZONA DE PENITÊNCIA]: Perdeu ${perdido.toLocaleString('pt-BR')} XP automaticamente (50% do treino de hoje, que rende ${treinoDoDia.toLocaleString('pt-BR')} XP com seus bônus${textoMotivoPerdaMenor(rz)}). As missões da zona liberam no próximo dia útil. Se não cumpri-las, perderá mais 50% do treino (perda total de 100%).`);
    } else if (motivo === 'tempo') {
        // Sem Zona, mas Streak perdido e nenhum XP (mesmo que tenha feito parte do treino)
        hunter.streakDias = 0;
        hunter.justificativaHoje = { data: hoje, tipo: 'tempo' };
        hunter.diariaConcluida = true;
        hunter.ultimoDiaConcluido = hoje;
        registrarHistorico({ tipo: 'perdido', streak: 0 });
        if (hunter.semanal && hunter.semanal.chave === chaveSemana(obterDataAtual())) semanalEvento('perdido');
        salvarDados();
        carregarEExibirInterface();
        adicionarMsgChat("⏳ [SEM TEMPO]: você não vai para a Zona de Penitência, mas o Streak foi perdido e hoje não rende XP. As missões voltam amanhã.");
    }
}

/* ---------- ESCADA DO "ESTAVA MUITO PESADO": pergunta depois de cada treino até encaixar ---------- */
const AJUSTE_META_MIN = 0.5;
const AJUSTE_META_PASSO = 0.10;

function abrirPerguntaAjusteMeta() {
    const m = document.getElementById('modal-ajuste-meta');
    if (!m || !m.classList.contains('escondido')) return;
    const pct = Math.round((hunter.ajusteMetaPct || 1) * 100);
    const t = document.getElementById('ajuste-meta-texto');
    if (t) t.innerText = `As metas deste treino estavam em ${pct}% do normal. Sua resposta ajusta o próximo treino, e a pergunta se repete até as metas encaixarem.`;
    m.classList.remove('escondido');
}

function responderAjusteMeta(resposta) {
    const m = document.getElementById('modal-ajuste-meta');
    if (m) m.classList.add('escondido');
    if (!hunter.ajusteMetaAguardaResposta) return;
    hunter.ajusteMetaAguardaResposta = false;
    let pct = Math.min(1, Math.max(AJUSTE_META_MIN, Number(hunter.ajusteMetaPct) || 1));
    let msg;
    if (resposta === 'pesado') {
        const novo = Math.max(AJUSTE_META_MIN, Math.round((pct - AJUSTE_META_PASSO) * 100) / 100);
        if (novo === pct) {
            hunter.ajusteMetaPerguntar = false;
            msg = `⚖️ [AJUSTE DE METAS]: as metas já estão no mínimo (${Math.round(pct * 100)}%). Se ainda está pesado, use o Modo Recuperação no menu para recomeçar com calma.`;
        } else {
            pct = novo;
            msg = `⚖️ [AJUSTE DE METAS]: metas reduzidas para ${Math.round(pct * 100)}% no próximo treino. Depois dele eu pergunto de novo.`;
        }
    } else if (resposta === 'facil') {
        pct = Math.min(1, Math.round((pct + AJUSTE_META_PASSO) * 100) / 100);
        if (pct >= 1) {
            hunter.ajusteMetaPerguntar = false;
            msg = "💪 [AJUSTE DE METAS]: você voltou às metas normais (100%). A calibração terminou!";
        } else {
            msg = `💪 [AJUSTE DE METAS]: metas aumentadas para ${Math.round(pct * 100)}% no próximo treino. Depois dele eu pergunto de novo.`;
        }
    } else {
        hunter.ajusteMetaPerguntar = false;
        msg = `✅ [AJUSTE DE METAS]: perfeito! As metas ficam em ${Math.round(pct * 100)}% e a calibração terminou. Elas voltam ao normal na próxima reavaliação ou no próximo Rank.`;
    }
    hunter.ajusteMetaPct = pct;
    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
    adicionarMsgChat(msg);
}

// A reavaliação e o Rank novo recalibram os máximos do jogador: o ajuste da escada deixa de fazer sentido
function zerarAjusteMeta() {
    hunter.ajusteMetaPct = 1;
    hunter.ajusteMetaPerguntar = false;
    hunter.ajusteMetaAguardaResposta = false;
}

// XP e volume do que o jogador JÁ CONFIRMOU hoje (usado pelo Soro): só os exercícios cumpridos contam
function volumeConfirmadoDeHoje() {
    const metas = hunter.metasCalculadas || {};
    const ex = hunter.execucoesDigitadas || {};
    const conf = hunter.confirmacoesEx || {};
    const ehFDS = ehFimDeSemanaAtual();
    const teto = (m) => ehFDS ? m : m * 2;
    const valid = { flexoes: 0, agachamentos: 0, abdominais: 0, corrida: 0, leitura: 0 };
    let feitos = 0;
    ['flexoes', 'agachamentos', 'abdominais', 'corrida'].forEach(k => {
        if (conf[k] && (ex[k] || 0) > 0) { valid[k] = Math.min(ex[k], teto(metas[k] || 0)); feitos++; }
    });
    if (conf.leitura && (ex.leitura || 0) > 0) { valid.leitura = ehFDS ? Math.min(ex.leitura, metas.leitura || 0) : ex.leitura; feitos++; }
    PROG_KEYS.forEach(k => {
        if (metas[k + '_p'] && conf[k + '_p'] && (ex[k + '_p'] || 0) > 0) { valid[k + '_p'] = Math.min(ex[k + '_p'], teto(metas[k + '_p'])); feitos++; }
    });
    VAR_KEYS.forEach(k => {
        if (metas[k + '_v'] && conf[k + '_v'] && (ex[k + '_v'] || 0) > 0) { valid[k + '_v'] = Math.min(ex[k + '_v'], metas[k + '_v']); feitos++; }
    });
    const base = xpBaseDoTreino(valid);
    const mult = 1 + bonusXpEquipamento(valid) + bonusXpArvore(valid, 1, false) + bonusSombra('xp');
    return { valid, feitos, xp: Math.max(0, Math.round(base * mult)) };
}

function usarSoroRecuperacao() {
    if (hunter.zonaPunicao) {
        avisarJogo("🚨 Na Zona de Penitência não existe justificativa. Cumpra a punição!");
        return;
    }
    if ((hunter.sorosRecuperacao || 0) <= 0) {
        avisarJogo("⚠️ Não possui Soros de Recuperação!");
        return;
    }
    if (hunter.diariaConcluida && !hunter.isDev) { avisarJogo("✔ O treino de hoje já está registrado!"); return; }
    // Treino e Streak são preservados; o XP vem só dos exercícios que o jogador já cumpriu e confirmou (os incompletos não rendem)
    const r = volumeConfirmadoDeHoje();
    hunter.sorosRecuperacao -= 1;
    if (r.xp > 0) {
        hunter.xpTotal += r.xp;
        registrarXpDoDia(r.xp);
        const t = hunter.totaisAcumulados;
        t.flexoes += r.valid.flexoes + (r.valid.flexoes_p || 0) + (r.valid.flexoes_v || 0);
        t.abdominais += r.valid.abdominais + (r.valid.abdominais_p || 0) + (r.valid.abdominais_v || 0);
        t.agachamentos += r.valid.agachamentos + (r.valid.agachamentos_p || 0) + (r.valid.agachamentos_v || 0);
        t.leitura += r.valid.leitura;
        if (cardioCfg().unidade === "Km") t.corrida += r.valid.corrida + (r.valid.corrida_p || 0);
        tocarAudioSeguro(somXP);
    }
    hunter.justificativaHoje = { data: obterDataAtual().toDateString(), tipo: 'soro', xp: r.xp, feitos: r.feitos };
    hunter.diariaConcluida = true;
    hunter.zonaPunicao = false;
    hunter.zonaPunicaoEtapa = null;
    hunter.ultimoDiaConcluido = obterDataAtual().toDateString();
    document.getElementById('modal-justificativa').classList.add('escondido');
    salvarDados();
    carregarEExibirInterface();
    adicionarMsgChat(`🧪 [SORO UTILIZADO]: treino e Streak preservados (${hunter.streakDias || 0} dias). ${r.xp > 0 ? `+${r.xp.toLocaleString('pt-BR')} XP pelos exercícios que você cumpriu e confirmou.` : 'Nenhum exercício foi confirmado, então hoje não rendeu XP.'} Os exercícios incompletos não renderam XP.`);
    avisarJogo(`🧪 [SORO UTILIZADO]\n\nSeu treino e seu Streak foram preservados.\n${r.xp > 0 ? `+${r.xp.toLocaleString('pt-BR')} XP (${r.feitos} exercício(s) cumpridos).` : 'Nenhum exercício confirmado: hoje não rende XP.'}\nOs exercícios que ficaram incompletos não rendem XP.`);
}

function textoConfirmarSoro() {
    const r = volumeConfirmadoDeHoje();
    return `🧪 Usar 1 Soro de Recuperação?\n\n• O treino e o Streak de hoje são preservados.\n• Você recebe XP só dos exercícios que já CONFIRMOU (agora: ${r.feitos} exercício(s), +${r.xp.toLocaleString('pt-BR')} XP).\n• Os incompletos não rendem XP, e as missões de hoje somem.\n\nDica: confirme antes os exercícios que você já fez.`;
}

async function usarSoroPeloRelatorio() {
    if ((hunter.sorosRecuperacao || 0) <= 0) { avisarJogo("⚠️ Não possui Soros de Recuperação!"); return; }
    if (hunter.zonaPunicao) { avisarJogo("🚨 Na Zona de Penitência não existe justificativa. Cumpra a punição!"); return; }
    if (hunter.diariaConcluida && !hunter.isDev) { avisarJogo("✔ O treino de hoje já está registrado!"); return; }
    document.getElementById('modal-justificativa').classList.add('escondido');
    if (!await confirmarJogo(textoConfirmarSoro(), { sim: '[ USAR SORO ]', nao: '[ VOLTAR ]' })) { document.getElementById('modal-justificativa').classList.remove('escondido'); return; }
    usarSoroRecuperacao();
}

async function solicitarDesafioUrgente() {
    const d = montarDesafioEmergencia(hunter.rankIndiceAtual);
    const xpPremio = d.xp;

    if (await confirmarJogo(`⚡ [DESAFIO DE EMERGÊNCIA]:\n\n"${d.texto}"${d.nota}\n\nPrémio: +${xpPremio} XP!\n\nCompletou este desafio extra?`)) {
        hunter.xpTotal += xpPremio;
        tocarAudioSeguro(somXP);
        adicionarMsgChat(`🔥 [SISTEMA]: Desafio superado! +${xpPremio} XP.`);
        salvarDados();
        atualizarAtributosERank();
    }
}

/* ---------- TIMER & RESET DIÁRIO ---------- */
function iniciarTimerECheck() {
    setInterval(() => {
        if (!hunter.nome) return;
        if (calibracaoAtiva()) { calAtualizarSeMudouDia(); return; } // sem XP, sem penalidade, sem virada de dia do jogo durante a calibração

        sincronizarPausaDiarias();
        checarResetDiario();
        // BETA: XP que chega fora do treino (missão semanal, conquista...) também pode cruzar o limite do Rank: não espera o próximo treino
        if (rankPorXp(hunter.xpTotal) > (hunter.rankIndiceAtual || 0) && !modalOcupado() && !modoReavaliacaoAtivo && !hunter.bossCombateAtivo) {
            try { atualizarAtributosERank(); } catch (e) { console.error(e); }
        }
        // Escada do "muito pesado": pergunta pendente (também reabre depois de recarregar a página)
        if (hunter.ajusteMetaAguardaResposta && !modalOcupado() && !modoReavaliacaoAtivo && !hunter.bossCombateAtivo && rankPorXp(hunter.xpTotal) <= (hunter.rankIndiceAtual || 0)) abrirPerguntaAjusteMeta();
        verificarExpiracaoBoss(true);
        atualizarContadorBoss();
        atualizarTimerRuptura();
        verificarRupturaProgramada();

        const agora = obterDataAtual();
        const amanha = new Date(agora);
        amanha.setDate(agora.getDate() + 1);
        amanha.setHours(0, 0, 0, 0);

        const diff = amanha - agora;
        const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diff / (1000 * 60)) % 60);
        const segundos = Math.floor((diff / 1000) % 60);

        const timerEl = document.getElementById('timer-reset');
        if (timerEl) {
            timerEl.innerText = `${String(horas).padStart(2, '0')}h ${String(minutos).padStart(2, '0')}m ${String(segundos).padStart(2, '0')}s`;
        }

        if (hunter.masmorraTempAtiva && hunter.masmorraTempFimData) {
            const dataFim = new Date(hunter.masmorraTempFimData);
            const diffTemp = dataFim - obterDataReal();

            if (diffTemp <= 0) {
                if (hunter.masmorraTempAceita) concluirMasmorraTemp();
                else recusarMasmorraTemp();
            } else {
                const hT = Math.floor((diffTemp / (1000 * 60 * 60)) % 24);
                const mT = Math.floor((diffTemp / (1000 * 60)) % 60);
                const sT = Math.floor((diffTemp / 1000) % 60);
                const timerTempEl = document.getElementById('timer-masmorra-temp');
                if (timerTempEl) {
                    timerTempEl.innerText = `${String(hT).padStart(2, '0')}:${String(mT).padStart(2, '0')}:${String(sT).padStart(2, '0')}`;
                }
            }
        }
    }, 1000);
}

// Sexta-feira de descanso obrigatório antes da Raid (nada de treino nem de missão de zona nesse dia)
function ehSextaPreRaid(dia) {
    const info = infoCalendarioBoss(dia);
    return info.fase === 'sexta-pre' && hunter.rankIndiceAtual >= chefeAtual().rankMinimo
        && info.ciclo !== hunter.cicloBossConcluido && !bossFreezeAtivo(dia) && !bossMotivoAdiamento(info);
}

// Dia útil que acabou sem treino, sem descanso registrado e sem justificativa: entra na Zona de Penitência e o Streak zera
function avaliarDiaPerdido(dia) {
    const dow = dia.getDay();
    if (dow === 0 || dow === 6) return;                         // fim de semana é opcional
    if (hunter.diariaConcluida || hunter.folgaRegistradaFimDeSemana) return; // treinou, descansou ou justificou
    if (recuperacaoAtivaEm(dia)) { registrarHistorico({ tipo: 'folga' }, chaveDia(dia)); return; } // Modo Recuperação
    if (hunter.zonaPunicao || hunter.bossCombateAtivo) return;   // zona tem regra própria; Raid tem relógio próprio
    if (hunter.dataCadastro === dia.toDateString()) return;      // primeiro dia no Sistema
    if (hunter.elixirAtivoAte && new Date(hunter.elixirAtivoAte) > soData(dia)) return; // Cristal do Repouso protege
    if (ehSextaPreRaid(dia)) return; // descanso obrigatório pré-Raid
    if (efeitoArvore('folga_tatica') > 0 && (hunter.fadigaFimDoDia || 0) >= 60 && hunter.folgaTaticaMes !== chaveMes(dia)) {
        hunter.folgaTaticaMes = chaveMes(dia);
        registrarHistorico({ tipo: 'folga' }, chaveDia(dia));
        adicionarMsgChat(`🛌 [FOLGA TÁTICA]: seu corpo estava em ${Math.round(hunter.fadigaFimDoDia)}% de Fadiga. O dia sem treino virou folga: sem Zona de Penitência e com o Streak mantido (1x por mês).`);
        return;
    }

    // Proteção de iniciante: sem nenhum XP não há o que perder; o dia sem treino vira só um aviso amigável (sem Zona, sem dia perdido no calendário)
    if (protegidoDeIniciante()) {
        adicionarMsgChat("🌱 [SEM PRESSÃO]: você ainda não começou a jornada, então o dia sem treino não gerou nenhuma penalidade. Quando você ganhar o primeiro XP, o Sistema passa a contar tudo. Bora treinar hoje!");
        setTimeout(() => avisarJogo("🌱 [SEM PRESSÃO]\n\nVocê ainda não treinou de verdade, então não há Zona de Penitência nem perda de XP. As regras normais começam a valer assim que você ganhar o primeiro XP. Que tal treinar hoje?"), 300);
        return;
    }

    const rz = aplicarPerdaEntradaZona();
    const { treino: treinoDoDia, perdido } = rz;
    hunter.zonaPunicao = true;
    hunter.zonaPunicaoEtapa = 'aguardando';
    hunter.streakDias = 0;
    registrarHistorico({ tipo: 'perdido', streak: 0 }, chaveDia(dia));
    if (hunter.semanal && hunter.semanal.chave === chaveSemana(dia)) semanalEvento('perdido');
    adicionarMsgChat(`🚨 [DIA PERDIDO]: o dia acabou sem treino registrado. Você foi enviado à Zona de Penitência: -${perdido.toLocaleString('pt-BR')} XP automaticamente (50% do treino, que rende ${treinoDoDia.toLocaleString('pt-BR')} XP com seus bônus${textoMotivoPerdaMenor(rz)}) e o Streak foi zerado. As missões da zona liberam no próximo dia útil.`);
    setTimeout(() => avisarJogo(`🚨 [DIA PERDIDO]\n\nVocê não registrou o treino de ontem.\n-${perdido.toLocaleString('pt-BR')} XP e Streak zerado.\nVocê entrou na Zona de Penitência: cumpra as missões da zona no próximo dia útil (sem XP) ou perderá mais 50% do XP do treino (perda total de 100%).`), 300);
}

function checarResetDiario() {
    const hoje = obterDataAtual();
    const hojeStr = hoje.toDateString();

    // data do último dia corrompida (save editado/antigo): recomeça de hoje em vez de gerar NaN em Fadiga/penalidades
    if (hunter.ultimoDiaConcluido && isNaN(new Date(hunter.ultimoDiaConcluido).getTime())) hunter.ultimoDiaConcluido = hojeStr;

    if (hunter.ultimoDiaConcluido && hunter.ultimoDiaConcluido !== hojeStr) {
        const diasPassados = Math.max(1, Math.min(10, diffDias(hoje, new Date(hunter.ultimoDiaConcluido))));

        // Relatório da hidratação do dia anterior (antes de zerar)
        emitirRelatorioAgua();

        // Recuperação passiva: -10% de Fadiga por noite de sono
        const fadigaAntes = hunter.fadiga || 0;
        hunter.fadigaFimDoDia = fadigaAntes;
        hunter.fadiga = Math.max(0, fadigaAntes - (10 * diasPassados));
        if (fadigaAntes > 0) {
            adicionarMsgChat(`😴 [SONO REPARADOR]: -${Math.round(fadigaAntes - hunter.fadiga)}% de Fadiga Corporal na virada do dia (${Math.round(hunter.fadiga)}%).`);
        }

        if (!hunter.diariaConcluida && hunter.folgaRegistradaFimDeSemana) registrarHistorico({ tipo: 'folga' }, chaveDia(new Date(hunter.ultimoDiaConcluido)));
        avaliarDiaPerdido(new Date(hunter.ultimoDiaConcluido));

        // Zona de Penitência: entrada -> missões no dia seguinte -> se falhar, perde mais 50% (100% no total) e sai sozinho
        if (hunter.zonaPunicao) {
            for (let k = diasPassados - 1; k >= 0 && hunter.zonaPunicao; k--) {
                const diaK = new Date(hoje); diaK.setDate(diaK.getDate() - k);
                const fdsK = (diaK.getDay() === 0 || diaK.getDay() === 6) || ehSextaPreRaid(diaK);
                if (hunter.zonaPunicaoEtapa === 'aguardando') {
                    if (fdsK) {
                        if (!hunter.zonaAvisoFds) { hunter.zonaAvisoFds = true; adicionarMsgChat("🚨 [ZONA DE PENITÊNCIA]: hoje é dia de descanso (fim de semana ou pré-Raid). As missões da zona ficam disponíveis no próximo dia útil."); }
                        continue;
                    }
                    hunter.zonaAvisoFds = false;
                    hunter.zonaPunicaoEtapa = 'ativa';
                    adicionarMsgChat("🚨 [ZONA DE PENITÊNCIA]: As missões da zona estão liberadas! Cumpra todas hoje (sem XP) ou perderá mais 50% do XP do treino.");
                } else {
                    const treino = hunter.zonaXpTreino || xpPrevistoDoTreino();
                    const resto = Math.round(treino * 0.5); // falhar custa mais 50% do treino: total = 100% (50% na entrada + 50%)
                    const perdidoZona = descontarXp(mitigarPerdaXp(resto));
                    const perdaEntrada = hunter.zonaPerdaEntrada || 0;
                    hunter.zonaPunicao = false;
                    hunter.zonaPunicaoEtapa = null;
                    hunter.zonaXpTreino = 0;
                    hunter.zonaPerdaEntrada = 0;
                    hunter.punicoesSeguidas = 0;
                    adicionarMsgChat(`💀 [ZONA DE PENITÊNCIA]: Missões não cumpridas! Perdeu mais ${perdidoZona.toLocaleString('pt-BR')} XP. Perda total da zona: ${(perdaEntrada + perdidoZona).toLocaleString('pt-BR')} XP (treino de ${treino.toLocaleString('pt-BR')} XP). Você saiu da zona e voltou aos treinos normais.`);
                }
            }
        }
        hunter.diariaConcluida = false;
        hunter.justificativaHoje = null;
        hunter.folgaRegistradaFimDeSemana = false;
        hunter.descansoPagoHoje = false;
        aplicarFolgaAgendada();
        sortearRupturaDoDia();
        hunter.aguaIngerida = 0.0;
        hunter.bonusAguaResgatadoHoje = false;
        hunter.confirmacoesEx = { flexoes: false, corrida: false, abdominais: false, agachamentos: false, leitura: false };
        hunter.execucoesDigitadas = { flexoes: 0, corrida: 0, abdominais: 0, agachamentos: 0, leitura: 0 };
        hunter.ultimoDiaConcluido = hojeStr;

        // Fim do efeito do Cristal do Repouso
        if (hunter.elixirAtivoAte && !sistemaCongelado()) {
            hunter.elixirAtivoAte = null;
            adicionarMsgChat("🧪 [CRISTAL DO REPOUSO]: O efeito terminou! O Sistema foi reativado e seu Streak foi preservado.");
        }

        recalcularMetasDoRank();
        salvarDados();
        carregarEExibirInterface();
        adicionarMsgChat(`💧 [NOVO DIA]: Meta recomendada de hidratação hoje: ${(hunter.metaAgua || 3.0).toFixed(1)}L.`);
    }
}

function adicionarMsgChat(texto) {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) return;

    const msg = document.createElement('div');
    msg.className = 'msg-sistema';
    chatLog.appendChild(msg);

    const palavras = texto.split(" ");
    let i = 0;

    function digitarPalavra() {
        if (i < palavras.length) {
            msg.innerText += (i === 0 ? "" : " ") + palavras[i];
            i++;
            chatLog.scrollTop = chatLog.scrollHeight;
            setTimeout(digitarPalavra, 35);
        }
    }
    digitarPalavra();
}

async function reiniciarPerfil() {
    if (!(await confirmarJogo("Tem certeza que deseja reiniciar o Sistema do zero?"))) return;
    // Cópias de segurança (diárias, "save anterior" e "save que não abriu") também guardam nome, altura e peso
    let chaves = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('solo_fitness_') === 0 && k !== 'solo_fitness_hunter' && k !== 'solo_fitness_versao' && k !== CHAVE_ACEITE) chaves.push(k);
        }
    } catch (e) { chaves = []; }
    let apagarCopias = false;
    if (chaves.length > 0) {
        apagarCopias = await confirmarJogo(
            "🧹 Apagar também as cópias de segurança deste aparelho?\n\n" +
            "• APAGAR TUDO: some tudo (nome, altura, peso e progresso). Recomendado em aparelho compartilhado.\n" +
            "• MANTER CÓPIAS: você ainda poderá voltar atrás pela tela de Backup.",
            { sim: '[ APAGAR TUDO ]', nao: '[ MANTER CÓPIAS ]' });
    }
    try {
        localStorage.removeItem('solo_fitness_hunter');
        localStorage.removeItem('solo_fitness_versao');
        if (apagarCopias) chaves.forEach(k => localStorage.removeItem(k));
        localStorage.removeItem(CHAVE_ACEITE); // recomeçar do zero retira o consentimento: o novo perfil aceita de novo
    } catch (e) {}
    location.reload();
}

function exibirTelaInicial() {
    const modal = document.getElementById('sistema-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.opacity = '1';
    }
    document.getElementById('app-principal').classList.add('escondido');
    document.getElementById('janela-inicio').classList.remove('escondido');
    document.getElementById('janela-cadastro').classList.add('escondido');
    document.getElementById('janela-desistencia').classList.add('escondido');
}

function salvarDados() {
    try {
        const txt = JSON.stringify(hunter);
        localStorage.setItem('solo_fitness_hunter', txt);
        if (hunter.nome) snapshotDiario(txt);
    } catch (e) {
        if (!window.__avisouFalhaSalvar) {
            window.__avisouFalhaSalvar = true;
            try { avisarJogo('⚠️ [ERRO AO SALVAR]\n\nNão consegui gravar seu progresso neste navegador (armazenamento cheio ou bloqueado). Faça um backup agora em Backup > Exportar.'); } catch (e2) {}
        }
    }
}

function migrarV31() {
    if (!hunter.ultimaRecalibracao) hunter.ultimaRecalibracao = obterDataAtual().toISOString();
    if (hunter.bossIndiceAtual >= BANCO_CHEFES.length - 1 && !hunter.bossFinalDerrotado) {
        const final = BANCO_CHEFES[BANCO_CHEFES.length - 1].itemDrop;
        if ((hunter.inventario || []).includes(final) || (hunter.itensVendidosBoss || []).includes(final) || (hunter.itensDeletados || []).includes(final) || hunter.vendeuBossFinal) hunter.bossFinalDerrotado = true;
    }
    if (hunter.nome && !hunter.arvoreMigrada) {
        hunter.arvoreMigrada = true;
        const pts = 3 * (hunter.rankMaximoAlcancado || 0);
        if (pts > 0 && !(hunter.arvoreGanhos > 0)) {
            hunter.pontosHabilidade = (hunter.pontosHabilidade || 0) + pts;
            hunter.arvoreGanhos = (hunter.arvoreGanhos || 0) + pts;
            setTimeout(() => { try { avisarJogo(`🌳 [NOVA ÁRVORE DE HABILIDADES]\n\nPelos Ranks que você já conquistou, o Sistema deu ${pts} ponto(s) de habilidade. Gaste no botão "Árvore" do painel lateral!`); } catch (e) {} }, 900);
        }
    }
    if (hunter.nome && !hunter.retroVistaMes) hunter.retroVistaMes = chaveMes();
    migrarV32();
}


/* ==========================================================================
   V31 — NÚCLEO: modais do jogo, som, vibração, avisos, histórico e backup
   ========================================================================== */

/* ---------- MODAIS DO JOGO (no lugar de alert/confirm do navegador) ---------- */
const filaModalJogo = [];
let modalJogoAtual = null;
const jogoLog = [];   // últimos avisos mostrados (útil para depuração e testes)

function _separarTituloAviso(texto, tituloPadrao) {
    const t = String(texto == null ? '' : texto);
    const i = t.indexOf('\n\n');
    if (i > 0 && i <= 70) return { titulo: t.slice(0, i), corpo: t.slice(i + 2) };
    return { titulo: tituloPadrao, corpo: t };
}

function avisarJogo(texto, titulo) {
    jogoLog.push(String(texto));
    if (jogoLog.length > 60) jogoLog.shift();
    return new Promise(res => { filaModalJogo.push({ tipo: 'aviso', texto, titulo, res }); _abrirProximoModalJogo(); });
}

function confirmarJogo(texto, opcoes) {
    jogoLog.push(String(texto));
    if (jogoLog.length > 60) jogoLog.shift();
    return new Promise(res => { filaModalJogo.push(Object.assign({ tipo: 'confirma', texto, res }, opcoes || {})); _abrirProximoModalJogo(); });
}

function _abrirProximoModalJogo() {
    if (modalJogoAtual || filaModalJogo.length === 0) return;
    const el = document.getElementById('modal-jogo');
    const it = filaModalJogo.shift();
    if (!el) {
        // Sem o HTML do modal (não deveria acontecer): usa os diálogos do navegador
        if (it.tipo === 'aviso') { window.alert(it.texto); it.res(true); } else { it.res(window.confirm(it.texto)); }
        return _abrirProximoModalJogo();
    }
    modalJogoAtual = it;
    const sep = _separarTituloAviso(it.texto, it.titulo || (it.tipo === 'confirma' ? '❓ [SISTEMA: CONFIRMAÇÃO]' : '⚠️ [SISTEMA]'));
    document.getElementById('jogo-titulo').innerText = it.titulo || sep.titulo;
    document.getElementById('jogo-texto').innerText = it.titulo ? String(it.texto) : sep.corpo;
    const bt = document.getElementById('jogo-botoes');
    bt.innerHTML = '';
    const mk = (rotulo, classe, val, id) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn-sistema ' + classe; b.id = id; b.innerText = rotulo;
        b.onclick = () => responderModalJogo(val);
        bt.appendChild(b);
        return b;
    };
    let principal;
    if (it.tipo === 'confirma') {
        principal = mk(it.sim || '[ CONFIRMAR ]', 'btn-sim', true, 'jogo-btn-sim');
        mk(it.nao || '[ CANCELAR ]', 'btn-nao', false, 'jogo-btn-nao');
    } else {
        principal = mk('[ OK ]', 'btn-sim', true, 'jogo-btn-ok');
    }
    el.classList.remove('escondido');
    try { principal.focus(); } catch (e) {}
}

function responderModalJogo(valor) {
    const it = modalJogoAtual;
    if (!it) return;
    modalJogoAtual = null;
    const el = document.getElementById('modal-jogo');
    if (el) el.classList.add('escondido');
    try { it.res(valor); } catch (e) {}
    // abre o próximo da fila logo em seguida (evita piscar)
    setTimeout(_abrirProximoModalJogo, 30);
}

document.addEventListener('keydown', (e) => {
    if (!modalJogoAtual) return;
    if (e.key === 'Escape') { responderModalJogo(modalJogoAtual.tipo === 'confirma' ? false : true); }
    else if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName !== 'BUTTON') { responderModalJogo(true); }
});

/* ---------- CONFIGURAÇÕES, SOM E VIBRAÇÃO ---------- */
function cfgJogo() {
    if (!hunter.config) hunter.config = {};
    return hunter.config;
}

function movimentoReduzido() {
    const c = cfgJogo();
    if (c.movReduzido === true) return true;
    if (c.movReduzido === false) return false;
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
}

function aplicarConfigVisual() {
    document.body.classList.toggle('mov-reduzido', movimentoReduzido());
}

let _ctxAudio = null;
function _ctxSom() {
    try {
        if (!_ctxAudio) {
            const C = window.AudioContext || window.webkitAudioContext;
            if (C) _ctxAudio = new C();
        }
        if (_ctxAudio && _ctxAudio.state === 'suspended') _ctxAudio.resume();
        return _ctxAudio;
    } catch (e) { return null; }
}

// Notas simples sintetizadas no próprio navegador (funcionam sem internet)
function _nota(ctx, freq, ini, dur, tipo, vol, freqFim) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime + ini);
    if (freqFim) o.frequency.exponentialRampToValueAtTime(freqFim, ctx.currentTime + ini + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime + ini);
    g.gain.exponentialRampToValueAtTime(vol || 0.06, ctx.currentTime + ini + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ini + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + ini);
    o.stop(ctx.currentTime + ini + dur + 0.05);
}

function sintetizarSom(tipo) {
    try {
        if (hunter && hunter.config && hunter.config.som === false) return;
        const ctx = _ctxSom();
        if (!ctx) return;
        if (tipo === 'clique') { _nota(ctx, 880, 0, 0.06, 'square', 0.03); }
        else if (tipo === 'xp') { [523, 659, 784, 1047].forEach((f, i) => _nota(ctx, f, i * 0.08, 0.16, 'sine', 0.06)); }
        else if (tipo === 'portal') { _nota(ctx, 110, 0, 0.7, 'sawtooth', 0.05, 440); _nota(ctx, 660, 0.3, 0.5, 'sine', 0.03, 990); }
        else if (tipo === 'rankup') { _nota(ctx, 55, 0, 1.4, 'sawtooth', 0.09, 40); [262, 330, 392, 523].forEach((f, i) => _nota(ctx, f, 0.5 + i * 0.12, 0.9, 'triangle', 0.05)); }
        else if (tipo === 'sombra') { _nota(ctx, 90, 0, 1.2, 'sine', 0.08, 55); _nota(ctx, 180, 0.15, 1.0, 'triangle', 0.03, 120); }
        else if (tipo === 'equipar') { _nota(ctx, 392, 0, 0.1, 'square', 0.03); _nota(ctx, 587, 0.09, 0.2, 'triangle', 0.05); }
        else if (tipo === 'erro') { _nota(ctx, 150, 0, 0.25, 'sawtooth', 0.05, 90); }
        else if (tipo === 'golpe') { _nota(ctx, 200, 0, 0.18, 'square', 0.06, 60); }
    } catch (e) { /* som é opcional */ }
}

function criarAudioSeguro(url, tipo) {
    const obj = { _tipo: tipo || 'clique', _el: null, _falhou: false };
    try {
        const a = new Audio(url);
        a.preload = 'none';
        a.addEventListener('error', () => { obj._falhou = true; });
        obj._el = a;
    } catch (e) { obj._falhou = true; }
    return obj;
}

function tocarSom(tipo) { sintetizarSom(tipo); }

function tocarAudioSeguro(audio) {
    if (!audio) return;
    if (typeof hunter !== 'undefined' && hunter && hunter.config && hunter.config.som === false) return;
    try {
        if (audio._falhou || !audio._el) { sintetizarSom(audio._tipo); return; }
        audio._el.currentTime = 0;
        const p = audio._el.play();
        if (p && p.catch) p.catch(() => { audio._falhou = true; sintetizarSom(audio._tipo); });
    } catch (e) { audio._falhou = true; sintetizarSom(audio._tipo); }
}

function vibrar(padrao) {
    try {
        if (hunter && hunter.config && hunter.config.vibracao === false) return;
        if (movimentoReduzido()) return;
        if (navigator.vibrate) navigator.vibrate(padrao || 40);
    } catch (e) {}
}

/* ---------- NOTIFICAÇÕES NA TELA (TOASTS) ---------- */
function mostrarToast(o) {
    let box = document.getElementById('toast-conquistas');
    if (!box) {
        box = document.createElement('div');
        box.id = 'toast-conquistas';
        document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'toast-conquista' + (o.classe ? ' ' + o.classe : '');
    if (o.cor) { t.style.borderColor = o.cor; t.style.boxShadow = `0 0 18px ${o.cor}55`; }
    const linhas = (o.linhas || []).map(l => `<div class="toast-linha">• ${l}</div>`).join('');
    t.innerHTML = `<div class="toast-tag" ${o.cor ? `style="color:${o.cor}"` : ''}>${o.tag || '🔔 AVISO DO SISTEMA'}</div><div class="toast-titulo">${o.titulo || ''}</div>${o.texto ? `<div class="toast-rec">${o.texto}</div>` : ''}${linhas}`;
    if (o.acao) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'toast-btn'; b.innerText = o.acao.rotulo;
        b.onclick = (ev) => { ev.stopPropagation(); try { o.acao.fn(); } catch (e) {} t.remove(); };
        t.appendChild(b);
    }
    t.onclick = () => t.remove();
    box.appendChild(t);
    while (box.children.length > 4) box.removeChild(box.firstChild);
    const dur = o.duracao || 8000;
    setTimeout(() => { t.classList.add('saindo'); setTimeout(() => t.remove(), 500); }, dur);
    return t;
}

/* ---------- HISTÓRICO DO CAÇADOR (base de estatísticas, retrospectiva e diário) ---------- */
function pad2(n) { return String(n).padStart(2, '0'); }
function chaveDia(d) {
    const x = d ? new Date(d) : obterDataAtual();
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
}
function chaveMes(d) {
    const x = d ? new Date(d) : obterDataAtual();
    return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}`;
}
function chaveSemana(d) {
    // chave = segunda-feira da semana (AAAA-MM-DD)
    const x = soData(d ? new Date(d) : obterDataAtual());
    const dow = (x.getDay() + 6) % 7; // segunda = 0
    x.setDate(x.getDate() - dow);
    return chaveDia(x);
}
function dataDeChave(k) {
    const p = String(k).split('-').map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
}

const CAMPOS_SOMA_HIST = ['xp', 'flexoes', 'abdominais', 'agachamentos', 'corrida', 'leitura', 'agua', 'gold', 'rupturas'];

// Soma números e define os demais campos do dia atual (ou do dia informado)
function registrarHistorico(patch, chave) {
    if (!hunter.historico) hunter.historico = { dias: {}, recordes: {} };
    if (!hunter.historico.dias) hunter.historico.dias = {};
    const k = chave || chaveDia();
    const d = hunter.historico.dias[k] || (hunter.historico.dias[k] = { xp: 0 });
    Object.keys(patch || {}).forEach(c => {
        if (CAMPOS_SOMA_HIST.includes(c)) d[c] = Math.round(((d[c] || 0) + (patch[c] || 0)) * 100) / 100;
        else d[c] = patch[c];
    });
    const r = hunter.historico.recordes || (hunter.historico.recordes = {});
    const maior = (nome, v) => { if (v > (r[nome] || 0)) r[nome] = v; };
    maior('xpDia', d.xp || 0); maior('flexoesDia', d.flexoes || 0); maior('abdominaisDia', d.abdominais || 0);
    maior('agachamentosDia', d.agachamentos || 0); maior('kmDia', d.corrida || 0);
    maior('streak', hunter.streakDias || 0);
    podarHistorico();
}

function podarHistorico() {
    const dias = hunter.historico && hunter.historico.dias;
    if (!dias) return;
    const ks = Object.keys(dias);
    if (ks.length <= 420) return;
    ks.sort().slice(0, ks.length - 400).forEach(k => delete dias[k]);
}

/* ---------- BACKUP: EXPORTAR / IMPORTAR / PONTOS DE RESTAURAÇÃO ---------- */
function hashTexto(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16);
}

function montarEnvelopeSave() {
    const dados = JSON.parse(JSON.stringify(hunter));
    const corpo = JSON.stringify(dados);
    return {
        app: 'ascensao-fitness',
        formato: 1,
        versao: VERSAO_ATUAL,
        exportadoEm: new Date().toISOString(),
        resumo: { nome: hunter.nome, rank: (ESCALA_RANKS[hunter.rankIndiceAtual] || {}).nome, xp: hunter.xpTotal, streak: hunter.streakDias },
        assinatura: hashTexto(corpo),
        dados
    };
}

function codificarSave(env) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(env))));
}

function decodificarTextoSave(txt) {
    const t = String(txt || '').trim();
    if (!t) throw new Error('vazio');
    if (t[0] === '{') return JSON.parse(migrarNomesAntigosTexto(t));
    return JSON.parse(migrarNomesAntigosTexto(decodeURIComponent(escape(atob(t.replace(/\s+/g, ''))))));
}

function validarEnvelopeSave(env) {
    if (!env || typeof env !== 'object') return { ok: false, erro: 'O arquivo não é um save válido.' };
    if (env.app !== 'ascensao-fitness' && env.app !== 'solo-leveling-fitness') return { ok: false, erro: 'Este arquivo não pertence ao Ascensão Fitness.' };
    const d = env.dados;
    if (!d || typeof d !== 'object') return { ok: false, erro: 'O save está sem dados do Caçador.' };
    if (typeof d.nome !== 'string' || !d.nome.trim()) return { ok: false, erro: 'O save não tem o nome do Caçador (arquivo incompleto).' };
    if (typeof d.xpTotal !== 'number' || !isFinite(d.xpTotal) || d.xpTotal < 0) return { ok: false, erro: 'O XP do save é inválido.' };
    if (typeof d.rankIndiceAtual !== 'number' || d.rankIndiceAtual < 0 || d.rankIndiceAtual >= ESCALA_RANKS.length) return { ok: false, erro: 'O Rank do save é inválido.' };
    if (env.assinatura && env.assinatura !== hashTexto(JSON.stringify(d))) return { ok: false, erro: 'O arquivo foi alterado ou está corrompido (assinatura não confere).' };
    const maj = parseInt(String(env.versao || '0').split('.')[0], 10) || 0;
    const majAtual = parseInt(String(VERSAO_ATUAL).split('.')[0], 10) || 0;
    if (maj > majAtual) return { ok: false, erro: `Este save é da versão ${env.versao}, mais nova que a do seu jogo (${VERSAO_ATUAL}). Atualize os arquivos do jogo antes de importar.` };
    return { ok: true };
}

function _baixarTexto(nome, texto, tipo) {
    const blob = new Blob([texto], { type: tipo || 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 500);
}

function exportarSave() {
    cfgJogo().ultimoBackup = new Date().toISOString();
    salvarDados();
    const env = montarEnvelopeSave();
    const nomeSeguro = String(hunter.nome || 'cacador').replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '') || 'cacador';
    _baixarTexto(`solo-fitness-save-${nomeSeguro}-${chaveDia(new Date())}.json`, JSON.stringify(env, null, 1));
    tocarSom('xp');
    adicionarMsgChat('💾 [BACKUP]: save exportado! Guarde o arquivo em um lugar seguro (nuvem, e-mail ou pen drive).');
    atualizarStatusBackup();
}

async function copiarCodigoSave() {
    cfgJogo().ultimoBackup = new Date().toISOString();
    salvarDados();
    const cod = codificarSave(montarEnvelopeSave());
    const area = document.getElementById('txt-backup-codigo');
    if (area) area.value = cod;
    let copiou = false;
    try { await navigator.clipboard.writeText(cod); copiou = true; } catch (e) {}
    if (area && !copiou) { area.focus(); area.select(); try { copiou = document.execCommand('copy'); } catch (e) {} }
    avisarJogo(copiou ? '💾 [CÓDIGO COPIADO]\n\nO código do seu save foi copiado. Cole em um bloco de notas ou mensagem para guardar. Para restaurar, cole o código no campo "Colar código" e importe.' : '💾 [CÓDIGO GERADO]\n\nNão consegui copiar automaticamente: o código está no campo de texto do Backup. Selecione tudo e copie manualmente.');
    atualizarStatusBackup();
}

function _lerArquivoTexto(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result || ''));
        r.onerror = () => rej(new Error('leitura'));
        r.readAsText(file);
    });
}

// ---------- SANEAMENTO DE SAVE IMPORTADO ----------
// Protege o jogo contra arquivos quebrados ou exagerados (não impede quem quer editar o próprio save para valores "reais").
const LIMITE_SAVE_BYTES = 1000000;   // um save normal tem ~5 KB
const LIMITES_NUM = { xpTotal: [0, 1e9], gold: [0, 1e9], streakDias: [0, 36500], fadiga: [0, 100], ajusteMetaPct: [0.5, 1] };
const MAX_ITENS_LISTA = 5000;

function sanearSave(d) {
    let ajustes = 0;
    delete d.email;
    const tipoDe = v => Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof v);
    Object.keys(HUNTER_PADRAO).forEach(k => {
        if (!(k in d)) return;
        const pad = HUNTER_PADRAO[k], v = d[k];
        const tp = tipoDe(pad), tv = tipoDe(v);
        if (tp !== 'null' && tv !== 'null' && tp !== tv) { d[k] = JSON.parse(JSON.stringify(pad)); ajustes++; return; }
        if (tv === 'number') {
            if (!isFinite(v)) { d[k] = pad; ajustes++; return; }
            const lim = LIMITES_NUM[k];
            if (lim && (v < lim[0] || v > lim[1])) { d[k] = Math.min(lim[1], Math.max(lim[0], v)); ajustes++; }
        } else if (tv === 'array' && v.length > MAX_ITENS_LISTA) { d[k] = v.slice(0, MAX_ITENS_LISTA); ajustes++; }
        else if (tv === 'object' && tp === 'object') {
            Object.keys(v).forEach(kk => {
                if (typeof v[kk] === 'number' && (!isFinite(v[kk]) || Math.abs(v[kk]) > 1e9)) { v[kk] = (typeof pad[kk] === 'number') ? pad[kk] : 0; ajustes++; }
            });
        }
    });
    if ('justificativaHoje' in d) {
        const j = d.justificativaHoje;
        const ok = j && typeof j === 'object' && !Array.isArray(j) && typeof j.data === 'string' && ['pesado', 'soro', 'tempo'].includes(j.tipo);
        if (j !== null && !ok) { d.justificativaHoje = null; ajustes++; }
        else if (ok) {
            const xp = Math.max(0, Math.min(1e9, Math.round(Number(j.xp) || 0))), feitos = Math.max(0, Math.min(50, Math.round(Number(j.feitos) || 0)));
            d.justificativaHoje = { data: String(j.data).slice(0, 30), tipo: j.tipo, xp, feitos };
        }
    }
    if (typeof d.nome === 'string') {
        const limpo = d.nome.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30);
        if (limpo !== d.nome) { d.nome = limpo || 'Caçador'; ajustes++; }
    }
    return { dados: d, ajustes };
}

async function importarSaveDeTexto(txt) {
    if (String(txt || '').length > LIMITE_SAVE_BYTES) { avisarJogo('⚠️ [IMPORTAR SAVE]\n\nEsse arquivo é grande demais para ser um save do jogo (o limite é 1 MB). Um save normal tem poucos KB.'); return false; }
    let env;
    try { env = decodificarTextoSave(txt); }
    catch (e) { avisarJogo('⚠️ [IMPORTAR SAVE]\n\nNão consegui ler esse conteúdo. Use o arquivo .json exportado pelo jogo ou o código gerado em "Copiar código".'); return false; }
    const v = validarEnvelopeSave(env);
    if (!v.ok) { avisarJogo('⚠️ [IMPORTAR SAVE]\n\n' + v.erro); return false; }
    const d = env.dados;
    const atual = hunter && hunter.nome ? `\n\nSave ATUAL neste aparelho: ${hunter.nome} — ${(ESCALA_RANKS[hunter.rankIndiceAtual] || {}).nome}, ${Math.round(hunter.xpTotal || 0).toLocaleString('pt-BR')} XP.` : '';
    const msg = `📂 [IMPORTAR SAVE]\n\nSave do arquivo: ${d.nome} — ${(ESCALA_RANKS[d.rankIndiceAtual] || {}).nome}, ${Math.round(d.xpTotal).toLocaleString('pt-BR')} XP, Streak ${d.streakDias || 0}.\nExportado em ${new Date(env.exportadoEm).toLocaleString('pt-BR')} (versão ${env.versao}).${atual}\n\nO save atual será SUBSTITUÍDO (uma cópia dele fica guardada como "save anterior"). Continuar?`;
    const ok = await confirmarJogo(msg, { sim: '[ SIM, IMPORTAR ]', nao: '[ CANCELAR ]' });
    if (!ok) return false;
    let ajustesImport = 0;
    try {
        const anterior = localStorage.getItem('solo_fitness_hunter');
        if (anterior) localStorage.setItem('solo_fitness_backup_anterior', anterior);
        const san = sanearSave(JSON.parse(JSON.stringify(d)));
        ajustesImport = san.ajustes;
        const novo = mesclarProfundo(JSON.parse(JSON.stringify(HUNTER_PADRAO)), san.dados);
        novo.isDev = false;
        localStorage.setItem('solo_fitness_hunter', JSON.stringify(novo));
        localStorage.setItem('solo_fitness_versao', VERSAO_ATUAL);
    } catch (e) {
        avisarJogo('⚠️ [IMPORTAR SAVE]\n\nNão foi possível gravar o save neste navegador (armazenamento cheio ou bloqueado).');
        return false;
    }
    await avisarJogo('✅ [SAVE IMPORTADO]\n\nTudo certo! O jogo vai recarregar com o save importado.' + (ajustesImport ? `\n\n🔧 ${ajustesImport} valor(es) inválido(s) ou exagerado(s) do arquivo foram corrigidos automaticamente.` : ''));
    location.reload();
    return true;
}

async function importarSaveDeArquivo(file) {
    if (!file) return;
    let txt = '';
    try { txt = await _lerArquivoTexto(file); } catch (e) { avisarJogo('⚠️ [IMPORTAR SAVE]\n\nNão consegui ler o arquivo.'); return; }
    await importarSaveDeTexto(txt);
}

function snapshotsDisponiveis() {
    const r = [];
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf('solo_fitness_snap_') === 0) r.push(k);
        }
    } catch (e) {}
    return r.sort().reverse();
}

function snapshotDiario(textoJson) {
    try {
        const k = 'solo_fitness_snap_' + chaveDia(new Date());
        if (localStorage.getItem(k)) return;
        localStorage.setItem(k, textoJson);
        snapshotsDisponiveis().slice(3).forEach(x => localStorage.removeItem(x));
    } catch (e) {}
}

async function restaurarSnapshot(chave) {
    let raw = null;
    try { raw = localStorage.getItem(chave); } catch (e) {}
    if (!raw) { avisarJogo('⚠️ Esse ponto de restauração não existe mais.'); return; }
    let d;
    try { d = JSON.parse(migrarNomesAntigosTexto(raw)); } catch (e) { avisarJogo('⚠️ Esse ponto de restauração está corrompido.'); return; }
    const dia = chave.replace('solo_fitness_snap_', '').split('-').reverse().join('/');
    const ok = await confirmarJogo(`↩️ [RESTAURAR PONTO]\n\nVoltar ao estado do início do dia ${dia}?\n${d.nome} — ${(ESCALA_RANKS[d.rankIndiceAtual] || {}).nome}, ${Math.round(d.xpTotal || 0).toLocaleString('pt-BR')} XP, Streak ${d.streakDias || 0}.\n\nO progresso feito depois disso será perdido (uma cópia do estado atual fica guardada como "save anterior").`, { sim: '[ SIM, RESTAURAR ]' });
    if (!ok) return;
    try {
        const atual = localStorage.getItem('solo_fitness_hunter');
        if (atual) localStorage.setItem('solo_fitness_backup_anterior', atual);
        localStorage.setItem('solo_fitness_hunter', raw);
    } catch (e) { avisarJogo('⚠️ Não foi possível restaurar neste navegador.'); return; }
    location.reload();
}

async function restaurarSaveAnterior() {
    let raw = null;
    try { raw = localStorage.getItem('solo_fitness_backup_anterior'); } catch (e) {}
    if (!raw) { avisarJogo('⚠️ Não há "save anterior" guardado.'); return; }
    const ok = await confirmarJogo('↩️ [RESTAURAR SAVE ANTERIOR]\n\nTrocar o save atual pelo que estava guardado antes da última importação/restauração?', { sim: '[ SIM, RESTAURAR ]' });
    if (!ok) return;
    try {
        const atual = localStorage.getItem('solo_fitness_hunter');
        localStorage.setItem('solo_fitness_hunter', raw);
        if (atual) localStorage.setItem('solo_fitness_backup_anterior', atual);
    } catch (e) { return; }
    location.reload();
}

function atualizarStatusBackup() {
    const el = document.getElementById('backup-status');
    if (!el) return;
    const u = hunter && hunter.config && hunter.config.ultimoBackup;
    if (!u) el.innerHTML = '⚠️ Você <b>ainda não exportou</b> nenhum backup. Se os dados do navegador forem apagados, o progresso se perde.';
    else {
        const dias = Math.floor((Date.now() - new Date(u).getTime()) / 86400000);
        el.innerHTML = `✅ Último backup: <b>${new Date(u).toLocaleString('pt-BR')}</b> (${dias === 0 ? 'hoje' : 'há ' + dias + ' dia(s)'}).`;
    }
    const lista = document.getElementById('lista-snapshots');
    if (lista) {
        const snaps = snapshotsDisponiveis();
        let html = '';
        snaps.forEach(k => {
            let d = null; try { d = JSON.parse(localStorage.getItem(k)); } catch (e) {}
            if (!d) return;
            const dia = k.replace('solo_fitness_snap_', '').split('-').reverse().join('/');
            html += `<div class="snap-linha"><span>🕒 <b>${dia}</b> — ${(ESCALA_RANKS[d.rankIndiceAtual] || {}).nome || ''}, ${Math.round(d.xpTotal || 0).toLocaleString('pt-BR')} XP, Streak ${d.streakDias || 0}</span><button type="button" class="btn-dev-acao" data-snap="${k}">Restaurar</button></div>`;
        });
        if (localStorage.getItem('solo_fitness_backup_anterior')) html += `<div class="snap-linha"><span>📦 <b>Save anterior</b> (guardado antes da última importação/restauração)</span><button type="button" class="btn-dev-acao" data-snap="__anterior">Restaurar</button></div>`;
        if (localStorage.getItem('solo_fitness_corrompido')) html += `<div class="snap-linha"><span>🧯 <b>Save que não abriu</b> (cópia de segurança)</span><button type="button" class="btn-dev-acao" data-snap="solo_fitness_corrompido">Restaurar</button></div>`;
        lista.innerHTML = html || '<div class="desc-item-mini">Os pontos de restauração aparecem aqui a partir do próximo dia de uso (o jogo guarda os 3 últimos).</div>';
        lista.querySelectorAll('button[data-snap]').forEach(b => {
            b.onclick = () => { const k = b.getAttribute('data-snap'); if (k === '__anterior') restaurarSaveAnterior(); else restaurarSnapshot(k); };
        });
    }
}

function abrirModalBackup() {
    atualizarStatusBackup();
    const m = document.getElementById('modal-backup');
    if (m) m.classList.remove('escondido');
}

function checarLembreteBackup() {
    if (!hunter.nome) return;
    const c = cfgJogo();
    const hoje = chaveDia(new Date());
    if (c.avisoBackupDia === hoje) return;
    const ref = c.ultimoBackup ? new Date(c.ultimoBackup).getTime() : (hunter.dataCadastro ? new Date(hunter.dataCadastro).getTime() : Date.now());
    const dias = Math.floor((Date.now() - ref) / 86400000);
    if (dias < 7) return;
    c.avisoBackupDia = hoje;
    salvarDados();
    mostrarToast({
        tag: '💾 LEMBRETE DE BACKUP',
        titulo: c.ultimoBackup ? `Seu último backup foi há ${dias} dias` : 'Você ainda não fez backup do seu progresso',
        texto: 'Exporte o save para não perder seu progresso se os dados do navegador forem apagados.',
        cor: '#38bdf8', duracao: 15000,
        acao: { rotulo: '[ FAZER BACKUP AGORA ]', fn: abrirModalBackup }
    });
}

/* ---------- PROTEÇÃO DO SAVE + INSTALAÇÃO NA TELA INICIAL ---------- */
let eventoInstalar = null;   // guardado do navegador (Chrome/Android/Edge) para abrir o instalador

function jogoInstalado() {
    try { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
    catch (e) { return false; }
}
function ehIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function ehAndroid() { return /Android/i.test(navigator.userAgent || ''); }

// Pede ao navegador para NÃO apagar os dados do jogo sozinho quando faltar espaço ou ficar muito tempo sem abrir
async function pedirArmazenamentoPersistente() {
    try {
        if (!(navigator.storage && navigator.storage.persist)) { estadoArmazenamento = 'indisponivel'; return; }
        if (navigator.storage.persisted && await navigator.storage.persisted()) { estadoArmazenamento = 'protegido'; return; }
        estadoArmazenamento = (await navigator.storage.persist()) ? 'protegido' : 'nao';
    } catch (e) { estadoArmazenamento = 'indisponivel'; }
}
let estadoArmazenamento = 'desconhecido';

function textoComoInstalar() {
    if (ehIOS()) return 'No iPhone/iPad (use o Safari): toque no botão Compartilhar (quadrado com a seta para cima), depois em "Adicionar à Tela de Início". Isso protege melhor o seu progresso e abre o jogo como um app, sem instalar nada da loja.';
    if (ehAndroid()) return 'No Android (Chrome): toque no menu ⋮ do navegador e escolha "Instalar app" ou "Adicionar à tela inicial". É só um atalho seguro para o site, sem baixar arquivo e sem loja de apps.';
    return 'No computador (Chrome ou Edge): clique no ícone de instalar na barra de endereço, ou no menu ⋮ e "Instalar Ascensão Fitness". É só um atalho para o site.';
}

async function instalarNaTelaInicial() {
    if (jogoInstalado()) { avisarJogo('✅ O jogo já está instalado e aberto como app.'); return; }
    if (eventoInstalar) {
        try {
            eventoInstalar.prompt();
            const r = await eventoInstalar.userChoice;
            if (r && r.outcome === 'accepted') cfgJogo().instalarOculto = true;
            eventoInstalar = null;
            salvarDados();
            return;
        } catch (e) { eventoInstalar = null; }
    }
    avisarJogo(textoComoInstalar(), '📲 INSTALAR NA TELA INICIAL');
}

function checarProtecaoEInstalacao() {
    if (!hunter.nome) return;
    pedirArmazenamentoPersistente();
    const c = cfgJogo();
    if (jogoInstalado() || c.instalarOculto) return;
    if (!/^https?:$/.test(location.protocol)) return;            // só faz sentido no site publicado
    const hoje = chaveDia(new Date());
    if (c.avisoInstalarDia === hoje || (c.avisoInstalarVezes || 0) >= 3) return;
    // Só avisa onde existe um caminho de instalação (celular ou navegador que ofereça o instalador)
    if (!(eventoInstalar || ehIOS() || ehAndroid())) return;
    c.avisoInstalarDia = hoje;
    c.avisoInstalarVezes = (c.avisoInstalarVezes || 0) + 1;
    salvarDados();
    mostrarToast({
        tag: '📲 DICA DO SISTEMA',
        titulo: 'Instale o jogo na tela inicial',
        texto: 'Seu progresso fica mais protegido e o jogo abre como um app. Não instala nada da loja: é só um atalho seguro.',
        cor: '#a855f7', duracao: 14000,
        acao: { rotulo: '[ COMO INSTALAR ]', fn: instalarNaTelaInicial }
    });
}

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); eventoInstalar = e; });
window.addEventListener('appinstalled', () => { try { cfgJogo().instalarOculto = true; eventoInstalar = null; salvarDados(); } catch (e) {} });

function configurarBackupUI() {
    document.getElementById('btn-abrir-backup')?.addEventListener('click', abrirModalBackup);
    document.getElementById('btn-inicial-importar')?.addEventListener('click', abrirModalBackup);
    document.getElementById('btn-fechar-backup')?.addEventListener('click', () => document.getElementById('modal-backup').classList.add('escondido'));
    document.getElementById('btn-backup-exportar')?.addEventListener('click', exportarSave);
    document.getElementById('btn-backup-copiar')?.addEventListener('click', copiarCodigoSave);
    document.getElementById('btn-backup-importar-texto')?.addEventListener('click', () => importarSaveDeTexto(document.getElementById('txt-backup-codigo').value));
    const inp = document.getElementById('input-backup-arquivo');
    if (inp) inp.addEventListener('change', async () => { const f = inp.files && inp.files[0]; await importarSaveDeArquivo(f); inp.value = ''; });
}


/* ==========================================================================
   V31 — ENDGAME: BOSS ECO, PONTOS DE HABILIDADE, MOLDURAS E REAVALIAÇÃO DE 4 SEMANAS
   ========================================================================== */

Object.assign(TITULOS_INFO, {
    "[ Caçador de Ecos ]": { desc: "Derrotou o primeiro Eco do Trono do Caos. Apenas honorário." },
    "[ Ceifador de Ecos ]": { desc: "Derrotou 5 Ecos. Apenas honorário." },
    "[ Senhor dos Ecos ]": { desc: "Derrotou 10 Ecos. Apenas honorário." },
    "[ Vontade de Ferro ]": { desc: "Chegou a 30 dias seguidos de treino. Apenas honorário." },
    "[ Centurião ]": { desc: "Chegou a 100 dias seguidos de treino. Apenas honorário." },
    "[ Ano Inabalável ]": { desc: "Chegou a 365 dias seguidos de treino. Apenas honorário." },
    "[ Caçador da Fenda Rubra ]": { desc: "Fechou uma Ruptura Carmesim. Apenas honorário." },
    "[ Semana Perfeita ]": { desc: "Completou as 3 missões semanais em uma mesma semana. Apenas honorário." }
});

/* ---------- MOLDURAS DO AVATAR (cosméticas) ---------- */
const MOLDURAS = {
    eco_1: { nome: "Moldura do Eco I", cor: "#a855f7", origem: "Derrotar o 1º Boss Eco" },
    eco_2: { nome: "Moldura do Eco II", cor: "#8b5cf6", origem: "Derrotar o 2º Boss Eco" },
    eco_3: { nome: "Moldura do Eco III", cor: "#6366f1", origem: "Derrotar o 3º Boss Eco" },
    eco_4: { nome: "Moldura do Eco IV", cor: "#3b82f6", origem: "Derrotar o 4º Boss Eco" },
    eco_5: { nome: "Moldura do Eco V", cor: "#06b6d4", origem: "Derrotar o 5º Boss Eco" },
    chama_30: { nome: "Chama Inabalável", cor: "#f97316", origem: "Streak de 30 dias" },
    ouro_365: { nome: "Coroa de Ouro", cor: "#eab308", origem: "Streak de 365 dias" },
    fenda_rubra: { nome: "Fenda Rubra", cor: "#ef4444", origem: "Fechar uma Ruptura Carmesim" },
    perfeita_10: { nome: "Disciplina Perfeita", cor: "#22c55e", origem: "10 semanas perfeitas" }
};

function desbloquearMoldura(id) {
    if (!MOLDURAS[id]) return false;
    if (!hunter.molduras) hunter.molduras = [];
    if (hunter.molduras.includes(id)) return false;
    hunter.molduras.push(id);
    mostrarToast({ tag: '🖼️ NOVA MOLDURA', titulo: MOLDURAS[id].nome, texto: `Desbloqueada: ${MOLDURAS[id].origem}. Equipe no seu perfil.`, cor: MOLDURAS[id].cor });
    return true;
}

/* ---------- PONTOS DE HABILIDADE (usados na Árvore) ---------- */
function ganharPontosHabilidade(qtd, motivo) {
    if (!(qtd > 0)) return;
    hunter.pontosHabilidade = (hunter.pontosHabilidade || 0) + qtd;
    hunter.arvoreGanhos = (hunter.arvoreGanhos || 0) + qtd;
    adicionarMsgChat(`🌳 [PONTOS DE HABILIDADE]: +${qtd} ponto(s) (${motivo || 'recompensa'}). Gaste na Árvore de Habilidades!`);
    mostrarToast({ tag: '🌳 PONTO DE HABILIDADE', titulo: `+${qtd} ponto(s) de habilidade`, texto: motivo || '', cor: '#22c55e', duracao: 6000 });
}

/* ---------- BOSS ECO: O DESAFIO DEPOIS DO ÚLTIMO CHEFE ---------- */
const ECOS = [
    { base: "Vyrassa", icone: "🐍", foco: ['flexoes', 'abdominais'], regiao: "Fenda dos Ecos — Câmara Venenosa" },
    { base: "Zarkhul", icone: "⚡", foco: ['corrida', 'agachamentos'], regiao: "Fenda dos Ecos — Torre Fantasma" },
    { base: "Zyrrax", icone: "🪲", foco: ['leitura', 'flexoes'], regiao: "Fenda dos Ecos — Ninho Eterno" },
    { base: "Aethraxes", icone: "🐉", foco: ['abdominais', 'corrida'], regiao: "Fenda dos Ecos — Céu Rachado" },
    { base: "Morghul", icone: "💀", foco: ['agachamentos', 'leitura'], regiao: "Fenda dos Ecos — Trono Vazio" }
];
// Nomes seguem a variante que o jogador faz (ex.: Flexões com Joelho)
const NOME_EXERCICIO_CURTO = {
    get flexoes() { return nomeExercicio('flexoes'); }, get abdominais() { return nomeExercicio('abdominais'); }, get agachamentos() { return nomeExercicio('agachamentos'); },
    corrida: 'Cardio', leitura: 'Leitura'
};

function chefeEco() {
    const n = hunter.ecoVitorias || 0;
    const e = ECOS[n % ECOS.length];
    return {
        id: 100 + (n % ECOS.length), eco: true, rankMinimo: 6, rankNome: "SOBERANO",
        hpMax: Math.min(20000, 12000 + 500 * n),
        regiao: e.regiao,
        nome: `${e.icone} Eco de ${e.base}`,
        xpPremio: 30000 + 2000 * Math.min(n, 10),
        itemDrop: null,
        foco: e.foco.slice(),
        desc: `Um reflexo sombrio de ${e.base}, preso entre as dimensões. Foco do Eco: +25% de meta em ${e.foco.map(k => NOME_EX_GENERICO[k]).join(' e ')} (na sua variante de cada exercício).`
    };
}

function vitoriaEco(chefe) {
    hunter.ecoVitorias = (hunter.ecoVitorias || 0) + 1;
    const n = hunter.ecoVitorias;
    const linhas = [`+${chefe.xpPremio.toLocaleString('pt-BR')} XP`, '+5.000 Gold', '💠 +1 Material Raro de Boss', `🌳 +${2 + efeitoArvore('ph_eco')} pontos de habilidade`];
    ganharPontosHabilidade(2 + efeitoArvore('ph_eco'), `Vitória sobre ${chefe.nome}`);
    if (n <= 5 && desbloquearMoldura('eco_' + n)) linhas.push(`🖼️ ${MOLDURAS['eco_' + n].nome}`);
    const tit = n === 1 ? "[ Caçador de Ecos ]" : n === 5 ? "[ Ceifador de Ecos ]" : n === 10 ? "[ Senhor dos Ecos ]" : null;
    if (tit && !hunter.titulosColecao.includes(tit)) { hunter.titulosColecao.push(tit); linhas.push(`🏷️ Título ${tit}`); }
    avisarJogo(`🏆 [ECO DERROTADO!]\n\nVocê destruiu ${chefe.nome}!\nRecompensas:\n${linhas.join('\n')}\n\nEcos vencidos até agora: ${n}. O próximo Eco será diferente!`);
}

/* ---------- REAVALIAÇÃO DE 2 SEMANAS (atualiza os máximos sem precisar subir de Rank) ---------- */
const REAVALIACAO_DIAS = 14;
let modoReavaliacaoAtivo = false;

function modalOcupado() {
    return ['modal-rankup', 'modal-extracao-sombra', 'modal-aviso-boss', 'modal-fadiga', 'modal-jogo', 'modal-retro', 'modal-recuperacao', 'modal-ajuste-meta'].some(id => {
        const e = document.getElementById(id); return e && !e.classList.contains('escondido');
    });
}

function checarReavaliacaoMensal() {
    if (modoReavaliacaoAtivo || !hunter.nome) return;
    if (!hunter.ultimaRecalibracao) { hunter.ultimaRecalibracao = obterDataAtual().toISOString(); salvarDados(); return; }
    const hoje = obterDataAtual();
    if (diffDias(hoje, new Date(hunter.ultimaRecalibracao)) < REAVALIACAO_DIAS) return;
    if (hunter.recalAdiadaAte && hoje < new Date(hunter.recalAdiadaAte)) return;
    if (modalOcupado() || sistemaCongelado() || hunter.pausaDiariasInicio || hunter.zonaPunicao || hunter.bossCombateAtivo) return;
    if (hunter.recuperacao && hunter.recuperacao.ativa) return;
    abrirReavaliacao();
}

function abrirReavaliacao() {
    modoReavaliacaoAtivo = true;
    hunter.retornoRankAtivo = false;
    tocarAudioSeguro(somPortal);
    document.getElementById('badge-novo-rank').innerText = "REAVALIAÇÃO";
    document.getElementById('up-peso').value = hunter.peso;
    document.getElementById('up-altura').value = hunter.altura;
    const tit = document.getElementById('rankup-titulo');
    const txt = document.getElementById('rankup-texto');
    const janela = document.getElementById('rankup-janela');
    if (tit) tit.innerText = "📅 [SISTEMA: REAVALIAÇÃO DE 2 SEMANAS]";
    if (txt) txt.innerText = "Já passaram 2 semanas desde a última calibragem. Seu corpo evolui com o tempo: atualize seus máximos para o treino continuar na medida certa.";
    if (janela) janela.classList.remove('animar-rankup');
    const cfg = cardioCfg();
    const lbl = document.getElementById('up-label-cardio');
    if (lbl) lbl.innerText = `Novo Máx. ${cfg.nome} (${cfg.unidade}):`;
    const inputCardio = document.getElementById('up-corrida');
    if (inputCardio) inputCardio.step = cfg.casas === 0 ? "1" : "0.1";
    document.getElementById('secao-novas-metas').classList.add('escondido');
    document.getElementById('caixa-recomendacao-sistema').classList.add('escondido');
    document.getElementById('btn-confirmar-checkin').classList.remove('escondido');
    document.getElementById('btn-adiar-reavaliacao').classList.remove('escondido');
    document.getElementById('modal-rankup').classList.remove('escondido');
}

function adiarReavaliacao() {
    const d = obterDataAtual();
    d.setDate(d.getDate() + 3);
    hunter.recalAdiadaAte = d.toISOString();
    modoReavaliacaoAtivo = false;
    document.getElementById('btn-adiar-reavaliacao').classList.add('escondido');
    document.getElementById('modal-rankup').classList.add('escondido');
    salvarDados();
    adicionarMsgChat("📅 [REAVALIAÇÃO ADIADA]: o Sistema volta a perguntar em 3 dias. Seus máximos continuam os mesmos até lá.");
}


/* ==========================================================================
   V31 — ENGAJAMENTO: MISSÕES SEMANAIS, MARCOS DE STREAK, RETROSPECTIVA,
         MODO RECUPERAÇÃO E RUPTURA CARMESIM
   ========================================================================== */

function prngSeed(str) {
    let seed = parseInt(hashTexto(String(str)), 16) >>> 0;
    return function () {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ---------- MISSÕES SEMANAIS ---------- */
const SEM_TIPOS_FIM = ['fadiga', 'limpa']; // avaliadas só no fim da semana
const SEM_NOME_EX = {
    get flexoes() { return nomeExercicio('flexoes'); }, get abdominais() { return nomeExercicio('abdominais'); }, get agachamentos() { return nomeExercicio('agachamentos'); },
    corrida: 'de Cardio', leitura: 'páginas de Leitura'
};

function recompensaMissaoSemanal() {
    const r = hunter.rankIndiceAtual || 0;
    const k = 1 + efeitoArvore('semanal_bonus');
    return { gold: Math.round(80 * (1 + 0.25 * r) * k), xp: Math.round(xpTotalDasMetas() * 0.3 * k) };
}

function gerarMissoesSemanais(chave) {
    const sm = hunter.semanal;
    const rnd = prngSeed(chave + '|' + (hunter.nome || '') + '|' + (sm.rerolls || 0));
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const fator = (ESCALA_RANKS[hunter.rankIndiceAtual] || ESCALA_RANKS[0]).fator;
    const cfg = cardioCfg();
    const lista = [];

    const a = pick(['dias', 'cheio']);
    lista.push(a === 'dias' ? { id: 'dias', alvo: 4, prog: 0, dias: [] } : { id: 'cheio', alvo: 3, prog: 0, dias: [] });

    const ex = pick(['flexoes', 'abdominais', 'agachamentos', 'corrida', 'leitura']);
    let alvo;
    if (ex === 'corrida') { const b = (hunter.maximos.corrida || 1) * fator * 4; alvo = cfg.casas === 0 ? Math.max(4, Math.round(b)) : Math.max(1, parseFloat(b.toFixed(1))); }
    else if (ex === 'leitura') alvo = Math.max(20, Math.round((hunter.maximos.leitura || 10) * 4));
    else alvo = Math.max(10, Math.round((hunter.maximos[ex] || 10) * fator * 4));
    lista.push({ id: 'vol', ex, alvo, prog: 0 });

    const c = pick(['agua', 'fadiga', 'limpa']);
    if (c === 'agua') lista.push({ id: 'agua', alvo: 4, prog: 0 });
    else if (c === 'fadiga') lista.push({ id: 'fadiga', alvo: 85, prog: 0, falhou: false });
    else lista.push({ id: 'limpa', alvo: 1, prog: 0, falhou: false });

    lista.forEach(m => { m.feito = false; });
    return lista;
}

function nomeMissaoSemanal(m) {
    if (m.id === 'dias') return `📅 Treinar em ${m.alvo} dias da semana`;
    if (m.id === 'cheio') return `🎯 Bater 100% das metas em ${m.alvo} treinos`;
    if (m.id === 'vol') {
        const un = m.ex === 'corrida' ? ` ${cardioCfg().unidade} de Cardio` : ` ${SEM_NOME_EX[m.ex]}`;
        return `📈 Acumular ${m.alvo}${un} na semana`;
    }
    if (m.id === 'agua') return `💧 Bater a meta de água em ${m.alvo} dias`;
    if (m.id === 'fadiga') return `🛡️ Manter a Fadiga abaixo de ${m.alvo}% a semana toda`;
    return '✅ Não perder nenhum dia útil';
}

function garantirSemanal() {
    if (!hunter.nome) return;
    if (!hunter.semanal) hunter.semanal = { chave: null, missoes: [], perfeita: false, rerolls: 0 };
    const sm = hunter.semanal;
    const atual = chaveSemana();
    if (sm.chave === atual && sm.missoes.length) return;
    if (sm.chave && sm.missoes.length) fecharSemana();
    hunter.semanal = { chave: atual, missoes: [], perfeita: false, perfeitaPaga: false, rerolls: 0 };
    hunter.semanal.missoes = gerarMissoesSemanais(atual);
    salvarDados();
    adicionarMsgChat('📆 [MISSÕES DA SEMANA]: novas missões semanais disponíveis! Veja o card "Missões da Semana".');
}

function fecharSemana() {
    const sm = hunter.semanal;
    sm.missoes.forEach(m => {
        if (m.feito) return;
        if (m.id === 'fadiga' && !m.falhou) concluirMissaoSemanal(m, true);
        else if (m.id === 'limpa' && !m.falhou) concluirMissaoSemanal(m, true);
    });
    const feitas = sm.missoes.filter(m => m.feito).length;
    checarSemanaPerfeita(true);
    adicionarMsgChat(`📆 [SEMANA ENCERRADA]: você cumpriu ${feitas} de ${sm.missoes.length} missões semanais.`);
}

function concluirMissaoSemanal(m, silencioso) {
    if (m.feito) return;
    m.feito = true;
    const r = recompensaMissaoSemanal();
    hunter.gold += r.gold;
    hunter.xpTotal += r.xp;
    registrarXpDoDia(r.xp);
    tocarAudioSeguro(somXP);
    mostrarToast({ tag: '📆 MISSÃO SEMANAL CUMPRIDA', titulo: nomeMissaoSemanal(m), texto: `+${r.gold} Gold e +${r.xp.toLocaleString('pt-BR')} XP`, cor: '#22c55e', duracao: 6000 });
    adicionarMsgChat(`📆 [MISSÃO SEMANAL]: "${nomeMissaoSemanal(m)}" cumprida! +${r.gold} Gold e +${r.xp.toLocaleString('pt-BR')} XP.`);
    checarSemanaPerfeita(false);
}

function checarSemanaPerfeita(aoFechar) {
    const sm = hunter.semanal;
    if (!sm || sm.perfeitaPaga || !sm.missoes.length) return;
    if (!sm.missoes.every(m => m.feito)) return;
    sm.perfeitaPaga = true;
    hunter.semanasPerfeitas = (hunter.semanasPerfeitas || 0) + 1;
    hunter.gold += 150;
    hunter.pedrasPolimento = (hunter.pedrasPolimento || 0) + 1 + efeitoArvore('semana_pedra');
    ganharPontosHabilidade(1, 'Semana Perfeita');
    const extras = [];
    if (!hunter.titulosColecao.includes('[ Semana Perfeita ]')) { hunter.titulosColecao.push('[ Semana Perfeita ]'); extras.push('🏷️ Título [ Semana Perfeita ]'); }
    if (hunter.semanasPerfeitas >= 10 && desbloquearMoldura('perfeita_10')) extras.push('🖼️ Moldura Disciplina Perfeita');
    avisarJogo(`🌟 [SEMANA PERFEITA!]\n\nVocê cumpriu as 3 missões da semana!\n+150 Gold\n💎 +1 Pedra de Polimento\n🌳 +1 ponto de habilidade${extras.length ? '\n' + extras.join('\n') : ''}\n\nSemanas perfeitas: ${hunter.semanasPerfeitas}`);
    registrarHistorico({ semanaPerfeita: true });
}

function semanalEvento(tipo, info) {
    if (!hunter.nome) return;
    if (tipo !== 'perdido') garantirSemanal();
    const sm = hunter.semanal;
    if (!sm || !sm.missoes) return;
    const hoje = chaveDia();
    let mudou = false;
    sm.missoes.forEach(m => {
        if (m.feito) return;
        if (tipo === 'treino') {
            if (m.id === 'dias' && !info.punicao && !(m.dias || []).includes(hoje)) { m.dias.push(hoje); m.prog = m.dias.length; mudou = true; }
            if (m.id === 'cheio' && info.cheio && !(m.dias || []).includes(hoje)) { m.dias.push(hoje); m.prog = m.dias.length; mudou = true; }
            if (m.id === 'vol' && !info.punicao) { m.prog = Math.round((m.prog + (info.vol[m.ex] || 0)) * 100) / 100; mudou = true; }
            if (m.id === 'fadiga' && (hunter.fadiga || 0) >= m.alvo) { m.falhou = true; mudou = true; }
        } else if (tipo === 'agua' && m.id === 'agua') { m.prog += 1; mudou = true; }
        else if (tipo === 'perdido' && m.id === 'limpa') { m.falhou = true; mudou = true; }
        else if (tipo === 'fadiga' && m.id === 'fadiga' && (hunter.fadiga || 0) >= m.alvo) { m.falhou = true; mudou = true; }
        if (!SEM_TIPOS_FIM.includes(m.id) && m.prog >= m.alvo) concluirMissaoSemanal(m);
    });
    if (mudou) { salvarDados(); renderizarSemanal(); }
}

function renderizarSemanal() {
    const lista = document.getElementById('semanal-lista');
    if (!lista || !hunter.semanal) return;
    const sm = hunter.semanal;
    const r = recompensaMissaoSemanal();
    let feitas = 0;
    lista.innerHTML = sm.missoes.map(m => {
        if (m.feito) feitas++;
        let prog = 0, txt = '';
        if (SEM_TIPOS_FIM.includes(m.id)) {
            prog = m.feito ? 100 : (m.falhou ? 0 : 50);
            txt = m.feito ? '✔ cumprida' : (m.falhou ? '✖ não cumprida' : 'em andamento (avaliada no fim da semana)');
        } else {
            prog = Math.min(100, (m.prog / m.alvo) * 100);
            txt = `${m.id === 'vol' && m.ex === 'corrida' ? Number(m.prog).toFixed(1) : Math.round(m.prog)} / ${m.alvo}`;
        }
        const cor = m.feito ? '#22c55e' : (m.falhou ? '#ef4444' : '#38bdf8');
        return `<div class="sem-item ${m.feito ? 'sem-feita' : ''} ${m.falhou ? 'sem-falhou' : ''}"><div class="sem-topo"><span>${nomeMissaoSemanal(m)}</span><span class="sem-prog" style="color:${cor}">${txt}</span></div><div class="sem-barra"><div class="sem-barra-fill" style="width:${prog}%; background:${cor};"></div></div></div>`;
    }).join('');
    const st = document.getElementById('semanal-status');
    if (st) st.innerText = `${feitas}/${sm.missoes.length}`;
    const rod = document.getElementById('semanal-rodape');
    if (rod) rod.innerHTML = `Cada missão: <b>+${r.gold} Gold</b> e <b>+${r.xp.toLocaleString('pt-BR')} XP</b>. Cumpriu as 3 → <b>Semana Perfeita</b>: +150 Gold, 💎 Pedra de Polimento e 🌳 +1 ponto de habilidade. Semanas perfeitas: <b>${hunter.semanasPerfeitas || 0}</b>.${podeRerolarSemanal() ? ' <button type="button" class="btn-dev-acao" id="btn-rerolar-semanal">🎲 Trocar missões (habilidade do título)</button>' : ''}`;
    document.getElementById('btn-rerolar-semanal')?.addEventListener('click', rerolarSemanal);
}

function podeRerolarSemanal() { return typeof habilidadeDisponivel === 'function' && habilidadeDisponivel('reavaliar') && !(hunter.semanal && hunter.semanal.missoes.some(m => m.feito)); }
function rerolarSemanal() {
    if (!podeRerolarSemanal()) return;
    usarHabilidadeTitulo('reavaliar', true);
}

/* ---------- MARCOS DE STREAK ---------- */
const MARCOS_STREAK = [
    { dias: 7, gold: 500, itens: { pedrasPolimento: 1 }, txt: '+500 Gold e 💎 1 Pedra de Polimento' },
    { dias: 14, itens: { sorosRecuperacao: 1 }, ph: 1, txt: '🧪 1 Soro de Recuperação e 🌳 +1 ponto de habilidade' },
    { dias: 30, gold: 1500, ph: 1, titulo: '[ Vontade de Ferro ]', moldura: 'chama_30', txt: '+1.500 Gold, 🌳 +1 ponto, título [ Vontade de Ferro ] e a moldura Chama Inabalável' },
    { dias: 60, itens: { pocoesAlivio: 1 }, ph: 1, txt: '🧪 1 Poção de Alívio Vital e 🌳 +1 ponto de habilidade' },
    { dias: 100, itens: { pergaminhosDuplo: 1 }, ph: 2, titulo: '[ Centurião ]', txt: '📜 1 Pergaminho de XP Duplo, 🌳 +2 pontos e o título [ Centurião ]' },
    { dias: 200, gold: 3000, ph: 2, txt: '+3.000 Gold e 🌳 +2 pontos de habilidade' },
    { dias: 365, gold: 5000, ph: 3, titulo: '[ Ano Inabalável ]', moldura: 'ouro_365', txt: '+5.000 Gold, 🌳 +3 pontos, título [ Ano Inabalável ] e a Coroa de Ouro' }
];

function verificarMarcosStreak() {
    if (!hunter.nome) return;
    if (!hunter.marcosStreak) hunter.marcosStreak = [];
    const st = hunter.streakDias || 0;
    let mudou = false;
    MARCOS_STREAK.forEach(m => {
        if (st < m.dias || hunter.marcosStreak.includes(m.dias)) return;
        hunter.marcosStreak.push(m.dias);
        mudou = true;
        if (m.gold) hunter.gold += m.gold;
        Object.keys(m.itens || {}).forEach(c => { hunter[c] = (hunter[c] || 0) + m.itens[c]; });
        if (m.ph) ganharPontosHabilidade(m.ph, `Streak de ${m.dias} dias`);
        if (m.titulo && !hunter.titulosColecao.includes(m.titulo)) hunter.titulosColecao.push(m.titulo);
        if (m.moldura) desbloquearMoldura(m.moldura);
        tocarAudioSeguro(somXP);
        vibrar([60, 40, 60]);
        mostrarToast({ tag: `🔥 MARCO DE STREAK: ${m.dias} DIAS`, titulo: `${m.dias} dias seguidos!`, texto: `Recompensa: ${m.txt}`, cor: '#f97316', duracao: 9000 });
        adicionarMsgChat(`🔥 [MARCO DE STREAK]: ${m.dias} dias seguidos! Recompensa: ${m.txt}.`);
    });
    if (mudou) { salvarDados(); atualizarInventarioTitulos(); }
}

/* ---------- RETROSPECTIVA MENSAL ---------- */
const NOMES_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function nomeMesChave(k) { const p = k.split('-').map(Number); return `${NOMES_MESES[p[1] - 1]} de ${p[0]}`; }
function mesAnteriorChave(k) { const p = k.split('-').map(Number); const d = new Date(p[0], p[1] - 2, 1); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; }

function estatisticasMes(chave) {
    const dias = (hunter.historico && hunter.historico.dias) || {};
    const ks = Object.keys(dias).filter(k => k.indexOf(chave) === 0).sort();
    const r = { chave, dias: ks.length, treinos: 0, folgas: 0, perdidos: 0, xp: 0, gold: 0, rupturas: 0, raid: false, zona: 0,
        tot: { flexoes: 0, abdominais: 0, agachamentos: 0, corrida: 0, leitura: 0 }, melhorDia: null, melhorSemana: null, maiorStreak: 0, semanasPerfeitas: 0, semanas: {} };
    ks.forEach(k => {
        const d = dias[k];
        if (d.treino) r.treinos++;
        if (d.tipo === 'folga') r.folgas++;
        if (d.tipo === 'perdido') r.perdidos++;
        if (d.tipo === 'raid') r.raid = true;
        if (d.tipo === 'zona') r.zona++;
        r.xp += d.xp || 0; r.gold += d.gold || 0; r.rupturas += d.rupturas || 0;
        Object.keys(r.tot).forEach(e => { r.tot[e] += d[e] || 0; });
        if (!r.melhorDia || (d.xp || 0) > r.melhorDia.xp) r.melhorDia = { dia: k, xp: d.xp || 0 };
        const sk = chaveSemana(dataDeChave(k));
        r.semanas[sk] = (r.semanas[sk] || 0) + (d.xp || 0);
        r.maiorStreak = Math.max(r.maiorStreak, d.streak || 0);
        if (d.semanaPerfeita) r.semanasPerfeitas++;
    });
    Object.keys(r.semanas).forEach(sk => { if (!r.melhorSemana || r.semanas[sk] > r.melhorSemana.xp) r.melhorSemana = { semana: sk, xp: r.semanas[sk] }; });
    return r;
}

function exercicioQueMaisEvoluiu(atual, anterior) {
    let melhor = null;
    ['flexoes', 'abdominais', 'agachamentos', 'corrida', 'leitura'].forEach(e => {
        if (atual.treinos < 3 || anterior.treinos < 3) return;
        const a = atual.tot[e] / atual.treinos, b = anterior.tot[e] / anterior.treinos;
        if (b <= 0 || a <= 0) return;
        const pct = (a / b - 1) * 100;
        if (!melhor || pct > melhor.pct) melhor = { ex: e, pct };
    });
    return melhor;
}

function htmlRetrospectiva(chave) {
    const a = estatisticasMes(chave);
    const b = estatisticasMes(mesAnteriorChave(chave));
    const dif = (x, y) => (y > 0 ? `${x >= y ? '▲' : '▼'} ${Math.abs(Math.round((x / y - 1) * 100))}% vs. mês anterior` : 'sem mês anterior para comparar');
    const evo = exercicioQueMaisEvoluiu(a, b);
    const tile = (ic, titulo, val, sub) => `<div class="retro-tile"><div class="retro-ic">${ic}</div><div class="retro-val">${val}</div><div class="retro-tit">${titulo}</div>${sub ? `<div class="retro-sub">${sub}</div>` : ''}</div>`;
    const sem = a.melhorSemana ? `${dataDeChave(a.melhorSemana.semana).toLocaleDateString('pt-BR')} (${a.melhorSemana.xp.toLocaleString('pt-BR')} XP)` : '—';
    const nota = (hunter.historico.notas || {})[chave] || '';
    return `<div class="retro-grid">
        ${tile('🌟', 'XP ganho no mês', a.xp.toLocaleString('pt-BR'), dif(a.xp, b.xp))}
        ${tile('🏋️', 'Dias de treino', a.treinos, dif(a.treinos, b.treinos))}
        ${tile('🔥', 'Maior streak', a.maiorStreak + ' dias', '')}
        ${tile('🛌', 'Folgas / dias perdidos', `${a.folgas} / ${a.perdidos}`, a.zona ? `${a.zona} punição(ões) cumprida(s)` : '')}
        ${tile('🕳️', 'Rupturas fechadas', a.rupturas, '')}
        ${tile('🌟', 'Semanas perfeitas', a.semanasPerfeitas, '')}
    </div>
    <div class="retro-linha">📅 <b>Melhor semana:</b> ${sem}</div>
    <div class="retro-linha">⭐ <b>Melhor dia:</b> ${a.melhorDia ? dataDeChave(a.melhorDia.dia).toLocaleDateString('pt-BR') + ' (' + a.melhorDia.xp.toLocaleString('pt-BR') + ' XP)' : '—'}</div>
    <div class="retro-linha">📈 <b>Maior evolução:</b> ${evo ? `${NOME_EXERCICIO_CURTO[evo.ex]} (+${Math.round(evo.pct)}% por treino)` : 'faltam dados dos dois meses para comparar'}</div>
    <div class="retro-linha">👹 <b>Raid do mês:</b> ${a.raid ? '✅ Boss derrotado' : '— nenhuma Raid vencida'}</div>
    <div class="retro-linha">🏋️ <b>Totais:</b> ${Math.round(a.tot.flexoes)} flexões · ${Math.round(a.tot.abdominais)} abdominais · ${Math.round(a.tot.agachamentos)} agachamentos · ${a.tot.corrida.toFixed(1)} de cardio · ${Math.round(a.tot.leitura)} de leitura</div>
    <label class="retro-label">📝 Diário do mês (escreva como foi):</label>
    <textarea id="retro-nota" class="backup-texto" rows="3" placeholder="Como você se sentiu neste mês? O que quer melhorar?">${nota.replace(/</g, '&lt;')}</textarea>`;
}

let retroChaveAtual = null;
function abrirRetrospectiva(chave) {
    retroChaveAtual = chave;
    document.getElementById('retro-titulo').innerText = `📖 RETROSPECTIVA — ${nomeMesChave(chave).toUpperCase()}`;
    document.getElementById('retro-corpo').innerHTML = htmlRetrospectiva(chave);
    document.getElementById('modal-retro').classList.remove('escondido');
    tocarSom('xp');
}
function fecharRetrospectiva() {
    const ta = document.getElementById('retro-nota');
    if (ta && retroChaveAtual) {
        if (!hunter.historico.notas) hunter.historico.notas = {};
        if (ta.value.trim()) hunter.historico.notas[retroChaveAtual] = ta.value.trim().slice(0, 2000); else delete hunter.historico.notas[retroChaveAtual];
        salvarDados();
    }
    document.getElementById('modal-retro').classList.add('escondido');
}

function checarRetrospectiva() {
    if (!hunter.nome) return;
    const atual = chaveMes();
    if (!hunter.retroVistaMes) { hunter.retroVistaMes = atual; salvarDados(); return; }
    if (hunter.retroVistaMes === atual) return;
    if (modalOcupado()) return;
    const anterior = mesAnteriorChave(atual);
    hunter.retroVistaMes = atual;
    salvarDados();
    const a = estatisticasMes(anterior);
    if (a.dias === 0) return;
    abrirRetrospectiva(anterior);
}

/* ---------- MODO RECUPERAÇÃO (LESÃO / DOENÇA) ---------- */
function recuperacaoAtiva() {
    const r = hunter.recuperacao;
    return !!(r && r.ativa && r.fim && obterDataAtual() < new Date(r.fim));
}
function recuperacaoAtivaEm(dataRef) {
    const r = hunter.recuperacao;
    return !!(r && r.inicio && r.fim && soData(dataRef) >= soData(new Date(r.inicio)) && soData(dataRef) < new Date(r.fim));
}

function abrirModalRecuperacao() {
    const r = hunter.recuperacao || {};
    let bloqueio = '';
    if (recuperacaoAtiva()) bloqueio = 'O Modo Recuperação já está ativo.';
    else if (hunter.bossCombateAtivo) bloqueio = 'Você está dentro de uma Raid. Use a Pedra de Retorno (grátis) para sair dela e depois declare a recuperação.';
    else if (hunter.zonaPunicao) bloqueio = 'Você está na Zona de Penitência. Resolva a punição primeiro (a zona não pode ser cancelada pelo Modo Recuperação).';
    else if (hunter.pausaDiariasInicio) bloqueio = 'Termine a Ruptura/Masmorra em andamento primeiro.';
    else if (sistemaCongelado()) bloqueio = 'O Sistema já está congelado pelo Cristal do Repouso.';
    else if (r.proxima && obterDataAtual() < new Date(r.proxima)) bloqueio = `Você poderá declarar uma nova recuperação a partir de ${new Date(r.proxima).toLocaleDateString('pt-BR')} (intervalo de 7 dias para evitar abuso).`;
    if (bloqueio) { avisarJogo('🩹 [MODO RECUPERAÇÃO]\n\n' + bloqueio); return; }
    document.getElementById('modal-recuperacao').classList.remove('escondido');
}

function iniciarRecuperacao(motivo, dias) {
    const ini = soData(obterDataAtual());
    const fim = new Date(ini); fim.setDate(fim.getDate() + dias);
    hunter.recuperacao = { ativa: true, inicio: ini.toISOString(), fim: fim.toISOString(), motivo, dias, proxima: null, retornoRestante: 0 };
    if (!hunter.bossCongeladoAteData || new Date(hunter.bossCongeladoAteData) < fim) hunter.bossCongeladoAteData = fim.toISOString();
    hunter.recuperacao.bossCongelou = true;
    recalcularMetasDoRank();
    salvarDados();
    document.getElementById('modal-recuperacao').classList.add('escondido');
    carregarEExibirInterface();
    adicionarMsgChat(`🩹 [MODO RECUPERAÇÃO ATIVO]: ${dias} dia(s), até ${new Date(fim.getTime() - 86400000).toLocaleDateString('pt-BR')}. Sem Zona de Penitência, Streak preservado, treino opcional com metas −50% (XP proporcional), sem Raid/Ruptura. Descanse e cuide de você!`);
}

function encerrarRecuperacao(antecipado) {
    const r = hunter.recuperacao;
    if (!r || !r.ativa) return;
    r.ativa = false;
    const base = antecipado ? soData(obterDataAtual()) : new Date(r.fim);
    if (antecipado) {
        if (r.bossCongelou && hunter.bossCongeladoAteData === r.fim) hunter.bossCongeladoAteData = null;
        r.fim = base.toISOString();
    }
    r.bossCongelou = false;
    const prox = new Date(base); prox.setDate(prox.getDate() + 7);
    r.proxima = prox.toISOString();
    r.retornoRestante = 3;
    recalcularMetasDoRank();
    salvarDados();
    adicionarMsgChat(`🩹 [RECUPERAÇÃO ENCERRADA]: bem-vindo de volta! Nos próximos 3 treinos as metas voltam aos poucos (−30%, −20%, −10%) e o XP é proporcional ao que você fizer.`);
}

function atualizarRecuperacaoDiaria() {
    const r = hunter.recuperacao;
    if (r && r.ativa && r.fim && obterDataAtual() >= new Date(r.fim)) encerrarRecuperacao(false);
}

function renderizarRecuperacao() {
    const card = document.getElementById('card-recuperacao');
    const btn = document.getElementById('btn-modo-recuperacao');
    const ativa = recuperacaoAtiva();
    if (card) card.classList.toggle('escondido', !ativa);
    if (btn) btn.classList.toggle('escondido', ativa);
    if (ativa) {
        const r = hunter.recuperacao;
        const restam = Math.max(1, diffDias(new Date(r.fim), obterDataAtual()));
        document.getElementById('rec-info').innerHTML = `Ativo até <b>${new Date(new Date(r.fim).getTime() - 86400000).toLocaleDateString('pt-BR')}</b> (${restam} dia(s)). Sem Zona de Penitência, Streak preservado, Raid e Ruptura suspensas. O treino de hoje é <b>opcional</b>, com metas −50% e XP proporcional.`;
    }
}

/* ---------- RUPTURA CARMESIM ---------- */
function duracaoRupturaMs() {
    const min = (hunter.rupturaTipo === 'vermelha' ? 20 : RUPTURA_DURACAO_MIN) + (typeof efeitoArvore === 'function' ? efeitoArvore('ruptura_tempo') : 0);
    return min * 60000;
}

function textoDesafioRuptura() {
    // O texto é montado uma vez e fica fixo até a Ruptura fechar (nível real do jogador na hora em que ela abriu)
    const tipo = hunter.rupturaTipo === 'vermelha' ? 'vermelha' : 'normal';
    if (!hunter.rupturaDesafio || hunter.rupturaDesafio.tipo !== tipo) hunter.rupturaDesafio = { tipo, texto: montarDesafioRuptura() };
    return hunter.rupturaDesafio.texto;
}

function aplicarVisualRuptura() {
    const card = document.getElementById('card-ruptura-portal');
    if (!card) return;
    const verm = hunter.rupturaTipo === 'vermelha';
    card.classList.toggle('ruptura-vermelha', verm);
    const t = document.getElementById('ruptura-titulo'); if (t) t.innerText = verm ? '🔴 ALERTA: RUPTURA CARMESIM!' : '🕳️ ALERTA: RUPTURA DE PORTAL NA REGIÃO!';
    const g = document.getElementById('ruptura-tag'); if (g) g.innerText = verm ? 'EVENTO RARO' : 'EVENTO SURPRESA';
    const btn = document.getElementById('btn-concluir-ruptura'); if (btn) btn.innerText = verm ? '🔴 [ SELAR A RUPTURA CARMESIM ]' : '⚡ [ CONTER RUPTURA IMEDIATAMENTE ]';
}

/* ==========================================================================
   V31 — PROGRESSÃO: ÁRVORE DE HABILIDADES, HABILIDADES DE TÍTULO,
         MISSÕES DAS SOMBRAS E CONJUNTOS DE EQUIPAMENTO
   ========================================================================== */

/* ---------- ÁRVORE DE HABILIDADES ----------
   5 ramos x 4 nós (custo 1, 2, 3 e 4 pontos = 10 por ramo, 50 no total).
   Regra de ouro do jogo: NENHUM nó diminui a Fadiga diretamente.
   Os bônus da árvore têm teto próprio (+20% de XP) e NÃO entram no teto de 60% dos equipamentos. */
const TETO_XP_ARVORE = 0.20;
const ARVORE = {
    forca: { nome: 'Força', icone: '💪', cor: '#ef4444', sub: 'flexões e Raid', nos: [
        { id: 'f1', nome: 'Punhos Firmes', custo: 1, efeito: { xp_forca: 0.03 }, desc: '+3% de XP de Força (flexões).' },
        { id: 'f2', nome: 'Golpe Pesado', custo: 2, req: 'f1', efeito: { xp_forca: 0.04 }, desc: '+4% de XP de Força (flexões).' },
        { id: 'f3', nome: 'Fúria Controlada', custo: 3, req: 'f2', efeito: { xp_alem: 0.04 }, desc: '+4% de XP quando você passa de verdade da meta (média ≥ 120% das metas). Mais esforço real, mais Fadiga: não vale na Raid nem na Zona de Penitência.' },
        { id: 'f4', nome: 'Golpe do Soberano', custo: 4, req: 'f3', efeito: { xp_forca: 0.08, xp_boss: 0.10 }, desc: '+8% de XP de Força e +10% no XP de prêmio dos Bosses.' }
    ] },
    agilidade: { nome: 'Agilidade', icone: '⚡', cor: '#38bdf8', sub: 'cardio e Rupturas', nos: [
        { id: 'a1', nome: 'Passos Leves', custo: 1, efeito: { xp_agilidade: 0.03 }, desc: '+3% de XP de Agilidade (cardio).' },
        { id: 'a2', nome: 'Vento Veloz', custo: 2, req: 'a1', efeito: { xp_agilidade: 0.04 }, desc: '+4% de XP de Agilidade (cardio).' },
        { id: 'a3', nome: 'Fôlego de Caçador', custo: 3, req: 'a2', efeito: { ruptura_tempo: 5 }, desc: '+5 minutos para fechar qualquer Ruptura.' },
        { id: 'a4', nome: 'Passo das Sombras', custo: 4, req: 'a3', efeito: { xp_agilidade: 0.08, ruptura_xp: 0.15 }, desc: '+8% de XP de Agilidade e +15% de XP ao fechar Rupturas.' }
    ] },
    resistencia: { nome: 'Resistência', icone: '🛡️', cor: '#22c55e', sub: 'core, pernas e disciplina', nos: [
        { id: 'r1', nome: 'Core de Aço', custo: 1, efeito: { xp_resistencia: 0.03 }, desc: '+3% de XP de Resistência (abdominais e agachamentos).' },
        { id: 'r2', nome: 'Pernas de Pedra', custo: 2, req: 'r1', efeito: { xp_resistencia: 0.04 }, desc: '+4% de XP de Resistência (abdominais e agachamentos).' },
        { id: 'r3', nome: 'Folga Tática', custo: 3, req: 'r2', efeito: { folga_tatica: 1 }, desc: 'Uma vez por mês, se um dia útil acabar sem treino mas sua Fadiga estiver em 60% ou mais, o dia vira folga: sem Zona de Penitência e com Streak mantido. Só funciona com o corpo realmente cansado.' },
        { id: 'r4', nome: 'Vontade de Ferro', custo: 4, req: 'r3', efeito: { xp_resistencia: 0.08, mitiga_penalidade: 0.10 }, desc: '+8% de XP de Resistência e −10% no XP perdido em penalidades.' }
    ] },
    inteligencia: { nome: 'Inteligência', icone: '📖', cor: '#a855f7', sub: 'leitura e planejamento', nos: [
        { id: 'i1', nome: 'Foco Total', custo: 1, efeito: { xp_inteligencia: 0.04 }, desc: '+4% de XP de Inteligência (leitura).' },
        { id: 'i2', nome: 'Leitor Voraz', custo: 2, req: 'i1', efeito: { xp_inteligencia: 0.06 }, desc: '+6% de XP de Inteligência (leitura).' },
        { id: 'i3', nome: 'Estrategista', custo: 3, req: 'i2', efeito: { semanal_bonus: 0.25 }, desc: '+25% de Gold e XP nas Missões da Semana.' },
        { id: 'i4', nome: 'Mente do Soberano', custo: 4, req: 'i3', efeito: { xp_inteligencia: 0.10, semana_pedra: 1 }, desc: '+10% de XP de Inteligência e +1 Pedra de Polimento extra em cada Semana Perfeita.' }
    ] },
    sombras: { nome: 'Comando das Sombras', icone: '🌑', cor: '#eab308', sub: 'ouro e exército', nos: [
        { id: 's1', nome: 'Olhar do Mercador', custo: 1, efeito: { desconto_loja: 0.03 }, desc: '−3% nos preços da Loja (soma com o teto de 25%).' },
        { id: 's2', nome: 'Mão Dourada', custo: 2, req: 's1', efeito: { gold_treino: 0.05 }, desc: '+5% de Gold em cada treino concluído.' },
        { id: 's3', nome: 'Soldados Dedicados', custo: 3, req: 's2', efeito: { missao_sombra: 0.25 }, desc: '+25% de Gold nas Missões das Sombras.' },
        { id: 's4', nome: 'Eco do Soberano', custo: 4, req: 's3', efeito: { sombras_mult: 0.10, ph_eco: 1 }, desc: '+10% no bônus de XP das suas Sombras e +1 ponto de habilidade extra a cada Eco derrotado.' }
    ] }
};

function todosNosArvore() { const r = []; Object.keys(ARVORE).forEach(k => ARVORE[k].nos.forEach(n => r.push(Object.assign({ ramo: k }, n)))); return r; }
function noArvore(id) { return todosNosArvore().find(n => n.id === id) || null; }
function temNo(id) { return (hunter.arvore || []).includes(id); }
function efeitoArvore(tipo) {
    return (hunter.arvore || []).reduce((s, id) => { const n = noArvore(id); return s + ((n && n.efeito[tipo]) || 0); }, 0);
}
function pontosGastosArvore() { return (hunter.arvore || []).reduce((s, id) => s + ((noArvore(id) || {}).custo || 0), 0); }
function custoRespecArvore() { return Math.min(15000, 500 + 250 * pontosGastosArvore()); }

function estadoNoArvore(n) {
    if (temNo(n.id)) return 'comprado';
    if (n.req && !temNo(n.req)) return 'bloqueado';
    if ((hunter.pontosHabilidade || 0) < n.custo) return 'sem-pontos';
    return 'disponivel';
}

async function comprarNoArvore(id) {
    const n = noArvore(id);
    if (!n) return;
    const est = estadoNoArvore(n);
    if (est === 'comprado') return;
    if (est === 'bloqueado') { avisarJogo(`🔒 Antes de liberar "${n.nome}", compre o nó anterior do ramo ${ARVORE[n.ramo].nome}.`); return; }
    if (est === 'sem-pontos') { avisarJogo(`🌳 Faltam pontos de habilidade: "${n.nome}" custa ${n.custo} e você tem ${hunter.pontosHabilidade || 0}.\n\nPontos vêm de novo Rank, Boss Eco, Semana Perfeita e marcos de Streak.`); return; }
    const ok = await confirmarJogo(`🌳 Gastar ${n.custo} ponto(s) em "${n.nome}"?\n\n${n.desc}`, { sim: 'Aprender', nao: 'Cancelar' });
    if (!ok) return;
    hunter.pontosHabilidade -= n.custo;
    hunter.arvore.push(n.id);
    tocarAudioSeguro(somXP);
    vibrar([40]);
    salvarDados();
    renderizarArvore();
    atualizarBadgeArvore();
    adicionarMsgChat(`🌳 [ÁRVORE DE HABILIDADES]: você aprendeu "${n.nome}" — ${n.desc}`);
    if (['a3', 'a4'].includes(n.id) && hunter.rupturaAtiva) adicionarMsgChat('⚡ O novo tempo vale a partir da próxima Ruptura.');
}

async function respecArvore() {
    const gastos = pontosGastosArvore();
    if (!gastos) { avisarJogo('🌳 Você ainda não gastou nenhum ponto.'); return; }
    const custo = custoRespecArvore();
    if ((hunter.gold || 0) < custo) { avisarJogo(`🪙 Redistribuir custa ${custo.toLocaleString('pt-BR')} Gold e você tem ${(hunter.gold || 0).toLocaleString('pt-BR')}.`); return; }
    const ok = await confirmarJogo(`🔄 Redistribuir a árvore?\n\nTodos os ${gastos} ponto(s) gastos voltam para você e os nós são zerados.\nCusto: ${custo.toLocaleString('pt-BR')} Gold.`, { sim: 'Redistribuir', nao: 'Cancelar' });
    if (!ok) return;
    hunter.gold -= custo;
    hunter.pontosHabilidade = (hunter.pontosHabilidade || 0) + gastos;
    hunter.arvore = [];
    salvarDados();
    renderizarArvore();
    atualizarBadgeArvore();
    carregarEExibirInterface();
    adicionarMsgChat(`🔄 [ÁRVORE]: pontos devolvidos (${gastos}). Escolha de novo!`);
}

function resumoBonusArvore() {
    const l = [];
    const p = (v) => `${Math.round(v * 100)}%`;
    ['forca', 'agilidade', 'resistencia', 'inteligencia'].forEach(k => {
        const v = efeitoArvore('xp_' + k);
        if (v) l.push(`${{ forca: '💪', agilidade: '⚡', resistencia: '🛡️', inteligencia: '🧠' }[k]} +${p(v)} XP de ${k.charAt(0).toUpperCase() + k.slice(1)}`);
    });
    if (efeitoArvore('xp_alem')) l.push(`🔥 +${p(efeitoArvore('xp_alem'))} XP ao passar de 120% das metas`);
    if (efeitoArvore('xp_boss')) l.push(`👹 +${p(efeitoArvore('xp_boss'))} XP de prêmio dos Bosses`);
    if (efeitoArvore('ruptura_tempo')) l.push(`⏱️ +${efeitoArvore('ruptura_tempo')} min nas Rupturas`);
    if (efeitoArvore('ruptura_xp')) l.push(`🕳️ +${p(efeitoArvore('ruptura_xp'))} XP nas Rupturas`);
    if (efeitoArvore('folga_tatica')) l.push('🛌 Folga Tática (1x/mês)');
    if (efeitoArvore('mitiga_penalidade')) l.push(`🛡️ −${p(efeitoArvore('mitiga_penalidade'))} XP perdido em penalidades`);
    if (efeitoArvore('semanal_bonus')) l.push(`📆 +${p(efeitoArvore('semanal_bonus'))} nas Missões da Semana`);
    if (efeitoArvore('semana_pedra')) l.push('💎 +1 Pedra por Semana Perfeita');
    if (efeitoArvore('desconto_loja')) l.push(`🏷️ −${p(efeitoArvore('desconto_loja'))} na Loja`);
    if (efeitoArvore('gold_treino')) l.push(`🪙 +${p(efeitoArvore('gold_treino'))} Gold por treino`);
    if (efeitoArvore('missao_sombra')) l.push(`🌑 +${p(efeitoArvore('missao_sombra'))} Gold nas Missões das Sombras`);
    if (efeitoArvore('sombras_mult')) l.push(`👑 +${p(efeitoArvore('sombras_mult'))} no bônus das Sombras`);
    if (efeitoArvore('ph_eco')) l.push('🌳 +1 ponto por Eco derrotado');
    return l;
}

// Bônus de XP vindo da árvore (teto próprio de +20%, separado do teto de 60% dos equipamentos)
function bonusXpArvore(valid, ratio, consumiveisValem) {
    const fn = (k) => efeitoArvore(k);
    let b = fracaoBonusAtributos(valid, fn, true);
    if (consumiveisValem && ratio >= 1.2) b += efeitoArvore('xp_alem');
    return Math.min(TETO_XP_ARVORE, b);
}

function renderizarArvore() {
    const box = document.getElementById('arvore-corpo');
    if (!box) return;
    document.getElementById('arvore-pontos').innerText = hunter.pontosHabilidade || 0;
    document.getElementById('arvore-gastos').innerText = pontosGastosArvore();
    const rotulo = { comprado: '✔ APRENDIDO', bloqueado: '🔒 BLOQUEADO', 'sem-pontos': 'FALTAM PONTOS', disponivel: 'APRENDER' };
    box.innerHTML = Object.keys(ARVORE).map(k => {
        const r = ARVORE[k];
        const nos = r.nos.map(n => {
            const est = estadoNoArvore(n);
            return `<button type="button" class="no-arvore no-${est}" style="--cor-ramo:${r.cor}" data-no="${n.id}" onclick="comprarNoArvore('${n.id}')">
                <span class="no-topo"><b>${n.nome}</b><span class="no-custo">${n.custo} pt</span></span>
                <span class="no-desc">${n.desc}</span>
                <span class="no-estado">${rotulo[est]}</span></button>`;
        }).join('<div class="no-ligacao" style="--cor-ramo:' + r.cor + '"></div>');
        const gasto = r.nos.filter(n => temNo(n.id)).reduce((s, n) => s + n.custo, 0);
        return `<div class="ramo-arvore" style="--cor-ramo:${r.cor}"><div class="ramo-titulo">${r.icone} ${r.nome}<small>${r.sub} · ${gasto}/10</small></div>${nos}</div>`;
    }).join('');
    const res = resumoBonusArvore();
    document.getElementById('arvore-resumo').innerHTML = res.length ? '<b>Bônus ativos:</b> ' + res.join(' · ') : 'Nenhum nó aprendido ainda. Comece pelo primeiro nó de qualquer ramo.';
    const bt = document.getElementById('btn-respec-arvore');
    if (bt) bt.innerText = `[ 🔄 REDISTRIBUIR (${pontosGastosArvore() ? custoRespecArvore().toLocaleString('pt-BR') + ' G' : 'nada gasto'}) ]`;
}

function abrirModalArvore() {
    renderizarArvore();
    document.getElementById('modal-arvore').classList.remove('escondido');
}
function atualizarBadgeArvore() {
    const b = document.getElementById('badge-arvore');
    if (b) { const n = hunter.pontosHabilidade || 0; b.innerText = n; b.classList.toggle('escondido', n <= 0); }
}

/* ---------- HABILIDADES ATIVAS DOS TÍTULOS ---------- */
const HABILIDADES_TITULO = {
    postura: { titulo: '[ Cavaleiro de Elite ]', nome: '⚔️ Postura de Guerra', cd: 7, desc: 'No próximo treino as metas ficam 10% maiores e você ganha +10% de XP extra. Mais esforço real, mais Fadiga. Não vale na Raid nem na Zona.' },
    ordem: { titulo: '[ Invocador Supremo ]', nome: '🌑 Ordem das Sombras', cd: 7, desc: 'Convoca uma missão extra para uma Sombra sua que esteja livre.' },
    reavaliar: { titulo: '[ Caçador de Fendas ]', nome: '🎲 Reavaliar Missões', cd: 7, desc: 'Sorteia novas Missões da Semana (só se nenhuma já foi cumprida).' },
    barganha: { titulo: '[ Mercador de Relíquias ]', nome: '🏷️ Barganha', cd: 7, desc: 'A próxima compra na Loja ganha mais 10% de desconto.' }
};
Object.keys(HABILIDADES_TITULO).forEach(id => {
    const t = TITULOS_INFO[HABILIDADES_TITULO[id].titulo];
    if (t) t.habilidade = id;
});

function habilidadeDoTitulo() {
    const id = Object.keys(HABILIDADES_TITULO).find(k => HABILIDADES_TITULO[k].titulo === hunter.tituloEquipado);
    return id || null;
}
function cooldownHabilidade(id) {
    const h = (hunter.habilidades || {})[id];
    if (!h || !h.ultimo) return 0;
    return Math.max(0, HABILIDADES_TITULO[id].cd - diffDias(soData(obterDataAtual()), soData(new Date(h.ultimo))));
}
function habilidadeDisponivel(id) {
    return habilidadeDoTitulo() === id && cooldownHabilidade(id) === 0;
}

async function usarHabilidadeTitulo(id, semConfirmar) {
    const hab = HABILIDADES_TITULO[id];
    if (!hab || habilidadeDoTitulo() !== id) { avisarJogo('Essa habilidade só funciona com o título correspondente equipado.'); return; }
    const cd = cooldownHabilidade(id);
    if (cd > 0) { avisarJogo(`⏳ ${hab.nome} volta a ficar pronta em ${cd} dia(s).`); return; }
    if (hunter.zonaPunicao) { avisarJogo('Habilidades de título não funcionam na Zona de Penitência.'); return; }
    if (!semConfirmar) {
        const ok = await confirmarJogo(`${hab.nome}\n\n${hab.desc}\n\nRecarga: ${hab.cd} dias. Usar agora?`, { sim: 'Usar', nao: 'Cancelar' });
        if (!ok) return;
    }
    let usou = false;
    if (id === 'postura') {
        if (hunter.bossCombateAtivo) { avisarJogo('Não dá para usar a Postura de Guerra durante a Raid.'); return; }
        if (hunter.diariaConcluida === false && Object.values(hunter.confirmacoesEx || {}).some(Boolean)) { avisarJogo('Use a Postura de Guerra antes de confirmar qualquer exercício do treino.'); return; }
        hunter.buffTitulo = 'postura';
        recalcularMetasDoRank();
        usou = true;
        adicionarMsgChat('⚔️ [POSTURA DE GUERRA]: o próximo treino terá metas +10% e +10% de XP extra.');
    } else if (id === 'ordem') {
        const livres = sombrasExtraidas().filter(i => sombraAtiva(i) && SOMBRA_MISSAO[i] && (!hunter.missoesSombras[i] || hunter.missoesSombras[i].estado !== 'ativa'));
        if (!livres.length) { avisarJogo('Todas as suas Sombras já estão em missão (ou você ainda não tem Sombras com missão). A habilidade não foi gasta.'); return; }
        criarMissaoSombra(livres[0]);
        usou = true;
    } else if (id === 'reavaliar') {
        if (!hunter.semanal || hunter.semanal.missoes.some(m => m.feito)) { avisarJogo('Já existe uma missão da semana cumprida: não dá para sortear de novo. A habilidade não foi gasta.'); return; }
        hunter.semanal.rerolls = (hunter.semanal.rerolls || 0) + 1;
        hunter.semanal.missoes = gerarMissoesSemanais(hunter.semanal.chave);
        renderizarSemanal();
        usou = true;
        adicionarMsgChat('🎲 [REAVALIAR MISSÕES]: novas Missões da Semana sorteadas.');
    } else if (id === 'barganha') {
        hunter.buffTitulo = 'barganha';
        usou = true;
        adicionarMsgChat('🏷️ [BARGANHA]: a próxima compra na Loja terá mais 10% de desconto.');
    }
    if (!usou) return;
    if (!hunter.habilidades) hunter.habilidades = {};
    hunter.habilidades[id] = { ultimo: obterDataAtual().toISOString() };
    tocarAudioSeguro(somXP);
    salvarDados();
    renderizarHabilidadeTitulo();
    carregarEExibirInterface();
}

function renderizarHabilidadeTitulo() {
    const el = document.getElementById('habilidade-titulo');
    if (!el) return;
    const id = habilidadeDoTitulo();
    if (!id) { el.classList.add('escondido'); el.innerHTML = ''; return; }
    const h = HABILIDADES_TITULO[id];
    const cd = cooldownHabilidade(id);
    el.classList.remove('escondido');
    const ativoBuff = (id === 'postura' && hunter.buffTitulo === 'postura') || (id === 'barganha' && hunter.buffTitulo === 'barganha');
    el.innerHTML = `<div class="hab-nome">${h.nome}</div><div class="hab-desc">${h.desc}</div>
        <button type="button" class="btn-hab" id="btn-usar-habilidade" ${cd > 0 || ativoBuff ? 'disabled' : ''}>${ativoBuff ? '✔ ATIVA (aguardando uso)' : cd > 0 ? `⏳ pronta em ${cd} dia(s)` : '[ USAR HABILIDADE ]'}</button>`;
    document.getElementById('btn-usar-habilidade')?.addEventListener('click', () => usarHabilidadeTitulo(id));
}

/* ---------- MISSÕES DAS SOMBRAS ---------- */
const SOMBRA_MISSAO = { 1: { ex: 'flexoes' }, 2: { ex: 'agachamentos' }, 3: { ex: 'abdominais' }, 4: { ex: 'leitura' }, 5: { ex: 'corrida' }, 6: { ex: 'leitura' } };

function nivelSombra(i) { const s = (hunter.sombrasNivel || {})[i]; return Math.min(5, 1 + Math.floor(((s && s.conc) || 0) / 5)); }

function recompensaMissaoSombra(i) {
    const base = 100 + 40 * (hunter.rankIndiceAtual || 0);
    return Math.round(base * (1 + 0.25 * (nivelSombra(i) - 1)) * (1 + efeitoArvore('missao_sombra')));
}

function criarMissaoSombra(i) {
    const cfg = SOMBRA_MISSAO[i];
    if (!cfg) return;
    const metas = hunter.metasCalculadas || {};
    const base = metas[cfg.ex] || 10;
    const alvo = cfg.ex === 'corrida' && cardioCfg().casas !== 0 ? Math.max(1, parseFloat((base * 3).toFixed(1))) : Math.max(5, Math.round(base * 3));
    const exp = soData(obterDataAtual()); exp.setDate(exp.getDate() + 4);
    if (!hunter.missoesSombras) hunter.missoesSombras = {};
    hunter.missoesSombras[i] = { estado: 'ativa', ex: cfg.ex, alvo, prog: 0, dia: chaveDia(), exp: exp.toISOString() };
    adicionarMsgChat(`🌑 [MISSÃO DA SOMBRA]: ${SOMBRAS_DATA[i].nome} pede ${alvo} ${cfg.ex === 'corrida' ? cardioCfg().unidade + ' de ' + cardioCfg().nome : NOME_EXERCICIO_CURTO[cfg.ex].toLowerCase()} acumulados nos próximos 4 dias.`);
}

function gerarMissoesSombras() {
    if (!hunter.nome) return;
    if (!hunter.missoesSombras) hunter.missoesSombras = {};
    if (!hunter.sombrasNivel) hunter.sombrasNivel = {};
    const hoje = chaveDia();
    let mudou = false;
    if (!hunter.bossCombateAtivo) recalcularMetasDoRank();
    sombrasExtraidas().filter(sombraAtiva).forEach(i => {
        if (!SOMBRA_MISSAO[i]) return;
        const m = hunter.missoesSombras[i];
        if (m && m.estado === 'ativa' && obterDataAtual() > new Date(m.exp)) {
            m.estado = 'expirada'; mudou = true;
            adicionarMsgChat(`🌑 [MISSÃO DA SOMBRA]: ${SOMBRAS_DATA[i].nome} voltou sem completar a missão. Sem punição: uma nova chega amanhã.`);
        }
        const atual = hunter.missoesSombras[i];
        if (!atual || (atual.estado !== 'ativa' && atual.dia !== hoje)) {
            if (hunter.recuperacao && recuperacaoAtiva()) return;
            if (!hunter.metasCalculadas || !hunter.metasCalculadas.flexoes) return;
            criarMissaoSombra(i); mudou = true;
        }
    });
    if (mudou) salvarDados();
}

function concluirMissaoSombra(i) {
    const m = hunter.missoesSombras[i];
    m.estado = 'cumprida';
    if (!hunter.sombrasNivel[i]) hunter.sombrasNivel[i] = { conc: 0, ph: false };
    const s = hunter.sombrasNivel[i];
    const nivelAntes = nivelSombra(i);
    s.conc += 1;
    const gold = recompensaMissaoSombra(i);
    hunter.gold += gold;
    registrarHistorico({ gold });
    tocarAudioSeguro(somXP);
    mostrarToast({ tag: '🌑 MISSÃO DA SOMBRA', titulo: `${SOMBRAS_DATA[i].nome} cumpriu a missão!`, texto: `+${gold.toLocaleString('pt-BR')} Gold · Nível ${nivelSombra(i)}`, cor: '#c084fc', duracao: 6000 });
    adicionarMsgChat(`🌑 [MISSÃO DA SOMBRA]: ${SOMBRAS_DATA[i].nome} concluiu a missão! +${gold} Gold.`);
    if (nivelSombra(i) > nivelAntes) {
        adicionarMsgChat(`⭐ [SOMBRA EVOLUIU]: ${SOMBRAS_DATA[i].nome} chegou ao nível ${nivelSombra(i)}! As próximas missões pagam mais.`);
        if (nivelSombra(i) === 5 && !s.ph) { s.ph = true; ganharPontosHabilidade(1, `${SOMBRAS_DATA[i].nome} no nível máximo`); }
    }
}

function sombrasEvento(vol) {
    if (!hunter.missoesSombras) return;
    let mudou = false;
    Object.keys(hunter.missoesSombras).forEach(i => {
        const m = hunter.missoesSombras[i];
        if (!m || m.estado !== 'ativa') return;
        const v = vol[m.ex] || 0;
        if (v <= 0) return;
        m.prog = Math.round((m.prog + v) * 100) / 100;
        mudou = true;
        if (m.prog >= m.alvo) concluirMissaoSombra(i);
    });
    if (mudou) { salvarDados(); renderizarMissoesSombras(); }
}

function renderizarMissoesSombras() {
    const el = document.getElementById('lista-missoes-sombras');
    const card = document.getElementById('card-missoes-sombras');
    if (!el) return;
    const itens = sombrasExtraidas().filter(sombraAtiva).filter(i => SOMBRA_MISSAO[i]);
    if (card) card.classList.toggle('escondido', itens.length === 0);
    el.innerHTML = itens.map(i => {
        const m = (hunter.missoesSombras || {})[i];
        const d = SOMBRAS_DATA[i];
        const lvl = nivelSombra(i);
        if (!m || m.estado !== 'ativa') {
            return `<div class="sem-item"><div class="sem-topo"><span>${d.icone} ${d.nome} <small>nível ${lvl}</small></span><span class="sem-prog" style="color:#94a3b8">${m && m.estado === 'cumprida' ? '✔ cumprida — nova amanhã' : 'descansando — nova amanhã'}</span></div></div>`;
        }
        const pct = Math.min(100, (m.prog / m.alvo) * 100);
        const rest = Math.max(1, diffDias(new Date(m.exp), obterDataAtual()));
        const un = m.ex === 'corrida' ? cardioCfg().unidade : '';
        return `<div class="sem-item"><div class="sem-topo"><span>${d.icone} ${d.nome} <small>nível ${lvl}</small></span><span class="sem-prog" style="color:#c084fc">${m.ex === 'corrida' ? Number(m.prog).toFixed(1) : Math.round(m.prog)} / ${m.alvo} ${un}</span></div><div class="sem-barra"><div class="sem-barra-fill" style="width:${pct}%; background:#a855f7;"></div></div><div class="sem-sub">${NOME_EXERCICIO_CURTO[m.ex]} · ${rest} dia(s) · recompensa ${recompensaMissaoSombra(i).toLocaleString('pt-BR')} Gold</div></div>`;
    }).join('');
}

/* ---------- CONJUNTOS DE EQUIPAMENTO ----------
   Os bônus dos conjuntos contam como bônus de equipamento: entram no teto de 60% de XP. */
const TETO_XP_EQUIP = 0.60;
const CONJUNTOS = {
    veterano: { nome: 'Caçador Veterano', pecas: ['tunica_iniciante', 'luvas_ferro', 'amuleto_estudioso'], bonus: { 2: { xp_global: 0.02 }, 3: { xp_global: 0.03, desconto_loja: 0.03 } } },
    erudito: { nome: 'Erudito Arcano', pecas: ['zarkhul_elmo', 'colar_arcano', 'amuleto_estudioso'], bonus: { 2: { xp_inteligencia: 0.06 }, 3: { xp_inteligencia: 0.08, xp_global: 0.03 } } },
    corte: { nome: 'Corte do Enxame', pecas: ['aranha_teia', 'zyrrax_coroa', 'mogtharn_manto'], bonus: { 2: { xp_agilidade: 0.05 }, 3: { xp_agilidade: 0.05, xp_global: 0.04 } } },
    soberano: { nome: 'Soberano Caído', pecas: ['aethraxes_escama', 'morghul_coracao', 'lamina_sombras'], bonus: { 2: { xp_forca: 0.05, xp_resistencia: 0.05 }, 3: { xp_global: 0.05, xp_inteligencia: 0.05 } } }
};

function pecasDoConjunto(c) {
    const eq = Object.values(hunter.equipados || {}).filter(Boolean);
    return c.pecas.filter(p => eq.includes(p)).length;
}
function bonusConjuntos(tipo) {
    let s = 0;
    Object.keys(CONJUNTOS).forEach(k => {
        const c = CONJUNTOS[k], n = pecasDoConjunto(c);
        [2, 3].forEach(t => { if (n >= t && c.bonus[t] && c.bonus[t][tipo]) s += c.bonus[t][tipo]; });
    });
    return s;
}
function linhasConjuntos() {
    const l = [];
    Object.keys(CONJUNTOS).forEach(k => {
        const c = CONJUNTOS[k], n = pecasDoConjunto(c);
        if (n >= 2) l.push(`🧩 ${c.nome} (${n}/3)`);
    });
    return l;
}
function textoConjuntoDoItem(id) {
    const k = Object.keys(CONJUNTOS).filter(x => CONJUNTOS[x].pecas.includes(id));
    return k.map(x => {
        const c = CONJUNTOS[x], n = pecasDoConjunto(c);
        const f = (b) => Object.keys(b).map(t => ({ xp_global: `+${Math.round(b[t] * 100)}% XP`, desconto_loja: `−${Math.round(b[t] * 100)}% Loja`, xp_inteligencia: `+${Math.round(b[t] * 100)}% XP Int.`, xp_agilidade: `+${Math.round(b[t] * 100)}% XP Agil.`, xp_forca: `+${Math.round(b[t] * 100)}% XP Força`, xp_resistencia: `+${Math.round(b[t] * 100)}% XP Resist.` }[t])).join(', ');
        return `🧩 Conjunto ${c.nome} (${n}/3): 2 peças: ${f(c.bonus[2])} · 3 peças: mais ${f(c.bonus[3])} (soma)`;
    });
}


/* ==========================================================================
   V31 — INTERFACE E EFEITOS VISUAIS, CONFIGURAÇÕES, ESTATÍSTICAS, GALERIA,
         MOLDURAS, NOTIFICAÇÕES E PWA
   ========================================================================== */

/* ---------- TEMAS POR RANK, ZONA VERMELHA E MOLDURAS ---------- */
const TEMAS_RANK = ['#22c55e', '#38bdf8', '#a855f7', '#eab308', '#f97316', '#ef4444', '#c084fc'];

function aplicarVisuais() {
    if (!hunter.nome) return;
    const idx = Math.min(hunter.rankIndiceAtual || 0, TEMAS_RANK.length - 1);
    document.body.dataset.rank = idx;
    document.documentElement.style.setProperty('--cor-rank', TEMAS_RANK[idx]);
    document.body.classList.toggle('modo-zona-penalidade', !!hunter.zonaPunicao);
    document.body.classList.toggle('modo-recuperacao', recuperacaoAtiva());
    aplicarMoldura();
    atualizarBadgeArvore();
    aplicarVisualRuptura();
    renderizarSemanal();
    renderizarMissoesSombras();
    renderizarHabilidadeTitulo();
    renderizarRecuperacao();
}

/* ---------- EFEITOS ---------- */
function flutuarXp(qtd, cor) {
    if (movimentoReduzido() || !(qtd > 0)) return;
    const barra = document.getElementById('xp-fill');
    if (!barra) return;
    const r = barra.parentElement.getBoundingClientRect();
    const e = document.createElement('div');
    e.className = 'xp-flutuante';
    e.innerText = `+${qtd.toLocaleString('pt-BR')} XP`;
    if (cor) e.style.color = cor;
    e.style.left = `${r.left + r.width / 2}px`;
    e.style.top = `${r.top - 6}px`;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 1900);
}

function efeitoCinematico(nomeRank) {
    const antigo = document.getElementById('fx-cinema'); if (antigo) antigo.remove();
    const reduzido = movimentoReduzido();
    const fx = document.createElement('div');
    fx.id = 'fx-cinema';
    fx.className = reduzido ? 'fx-cinema fx-simples' : 'fx-cinema';
    fx.innerHTML = `<div class="fx-raios"></div><div class="fx-texto"><small>EVOLUÇÃO</small><b>${nomeRank}</b></div>`;
    document.body.appendChild(fx);
    vibrar([80, 50, 80, 50, 160]);
    setTimeout(() => fx.classList.add('fx-sai'), reduzido ? 1100 : 2600);
    setTimeout(() => fx.remove(), reduzido ? 1500 : 3200);
}

function tremerBoss() {
    const c = document.getElementById('card-boss-fight');
    if (!c) return;
    vibrar([30, 20, 60]);
    if (movimentoReduzido()) return;
    c.classList.remove('tremer'); void c.offsetWidth; c.classList.add('tremer');
    const f = document.getElementById('boss-hp-fill');
    if (f) { f.classList.remove('hp-golpe'); void f.offsetWidth; f.classList.add('hp-golpe'); }
    setTimeout(() => c.classList.remove('tremer'), 650);
}

function fumacaSombra() {
    if (movimentoReduzido()) return;
    const alvo = document.getElementById('cena-palco') || document.getElementById('modal-extracao-sombra');
    if (!alvo) return;
    for (let i = 0; i < 16; i++) {
        const s = document.createElement('span');
        s.className = 'fumaca-sombra';
        s.style.left = `${10 + Math.random() * 80}%`;
        s.style.animationDelay = `${Math.random() * 0.5}s`;
        s.style.setProperty('--dx', `${Math.round(Math.random() * 120 - 60)}px`);
        alvo.appendChild(s);
        setTimeout(() => s.remove(), 1900);
    }
}

function brilhoEquipar(raridade) {
    const s = document.getElementById('slot-item-equipado');
    if (!s) return;
    vibrar(25);
    if (movimentoReduzido()) return;
    ORDEM_RARIDADE.forEach(r => s.classList.remove('equip-flash-' + r));
    void s.offsetWidth;
    s.classList.add('equip-flash-' + (raridade || 'comum'));
    setTimeout(() => ORDEM_RARIDADE.forEach(r => s.classList.remove('equip-flash-' + r)), 1400);
}

/* ---------- CONFIGURAÇÕES ---------- */
function abrirConfig() {
    const c = cfgJogo();
    document.getElementById('cfg-som').checked = c.som !== false;
    document.getElementById('cfg-vib').checked = c.vibracao !== false;
    document.getElementById('cfg-mov').value = c.movReduzido === true ? 'sim' : c.movReduzido === false ? 'nao' : 'auto';
    document.getElementById('cfg-notif').checked = !!c.notificacoes;
    document.getElementById('cfg-hora').value = c.horaLembrete || '19:00';
    const nota = document.getElementById('cfg-notif-nota');
    const sup = 'Notification' in window;
    const nInst = document.getElementById('cfg-instalar-nota');
    const bInst = document.getElementById('btn-instalar-app');
    if (bInst) bInst.style.display = jogoInstalado() ? 'none' : '';
    if (nInst) nInst.innerText = (jogoInstalado() ? '✅ Instalado como app. ' : '') + ({ protegido: '💾 Armazenamento protegido contra limpeza automática: sim.', nao: '💾 Armazenamento protegido contra limpeza automática: não (o navegador não concedeu). Faça backups com frequência.', indisponivel: '💾 Este navegador não oferece proteção extra do armazenamento. Faça backups com frequência.' }[estadoArmazenamento] || '💾 Verificando a proteção do armazenamento...');
    nota.innerText = !sup ? 'Este navegador não oferece notificações.' : (Notification.permission === 'denied' ? 'As notificações estão bloqueadas nas permissões do navegador.' : 'O lembrete só aparece enquanto o app estiver aberto (ou instalado como app). Sem servidor, ele não consegue acordar o celular sozinho.');
    if (!document.getElementById('btn-politica')) {
        const bp = document.createElement('button');
        bp.type = 'button'; bp.id = 'btn-politica'; bp.className = 'btn-inventario'; bp.style.cssText = 'border-color:#38bdf8;color:#38bdf8;margin-top:8px;';
        bp.innerText = '[ 🛡️ POLÍTICA DE PRIVACIDADE ]';
        bp.addEventListener('click', () => abrirTermos(true));
        const fim = document.getElementById('btn-fechar-config');
        if (fim && fim.parentNode) fim.parentNode.insertBefore(bp, fim);
    }
    document.getElementById('modal-config').classList.remove('escondido');
}

async function salvarConfigDoModal() {
    const c = cfgJogo();
    c.som = document.getElementById('cfg-som').checked;
    c.vibracao = document.getElementById('cfg-vib').checked;
    const m = document.getElementById('cfg-mov').value;
    c.movReduzido = m === 'sim' ? true : m === 'nao' ? false : null;
    c.horaLembrete = document.getElementById('cfg-hora').value || '19:00';
    const quer = document.getElementById('cfg-notif').checked;
    if (quer && !c.notificacoes) {
        if (!('Notification' in window)) { avisarJogo('Este navegador não oferece notificações.'); document.getElementById('cfg-notif').checked = false; }
        else {
            let p = Notification.permission;
            if (p === 'default') { try { p = await Notification.requestPermission(); } catch (e) { p = 'denied'; } }
            c.notificacoes = (p === 'granted');
            if (!c.notificacoes) { document.getElementById('cfg-notif').checked = false; avisarJogo('Permissão de notificações não concedida.'); }
        }
    } else c.notificacoes = quer;
    aplicarConfigVisual();
    salvarDados();
}

function checarNotificacaoLembrete() {
    try {
        const c = cfgJogo();
        if (!hunter.nome || !c.notificacoes || !('Notification' in window) || Notification.permission !== 'granted') return;
        const real = obterDataReal();
        const hoje = chaveDia(real);
        if (c.notifDia === hoje || hunter.diariaConcluida) return;
        const [h, mi] = String(c.horaLembrete || '19:00').split(':').map(Number);
        if (real.getHours() * 60 + real.getMinutes() < h * 60 + mi) return;
        if (real.getDay() === 0 || real.getDay() === 6) return;
        c.notifDia = hoje;
        salvarDados();
        const corpo = `Seu treino de hoje ainda está pendente. Streak atual: ${hunter.streakDias || 0} dias.`;
        if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(r => r.showNotification('⚔️ Missão diária pendente', { body: corpo, tag: 'lembrete' })).catch(() => new Notification('⚔️ Missão diária pendente', { body: corpo }));
        else new Notification('⚔️ Missão diária pendente', { body: corpo });
    } catch (e) {}
}

function registrarPWA() {
    try {
        if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (e) {}
}

/* ---------- ESTATÍSTICAS ---------- */
function xpPorSemana(n) {
    const dias = (hunter.historico && hunter.historico.dias) || {};
    const seg = dataDeChave(chaveSemana());
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
        const ini = new Date(seg); ini.setDate(ini.getDate() - 7 * i);
        let xp = 0;
        for (let d = 0; d < 7; d++) { const x = new Date(ini); x.setDate(x.getDate() + d); xp += ((dias[chaveDia(x)] || {}).xp || 0); }
        out.push({ ini, xp });
    }
    return out;
}

function svgGraficoSemanal() {
    const s = xpPorSemana(8);
    const max = Math.max(1, ...s.map(x => x.xp));
    const W = 340, H = 140, pb = 22, pt = 14, bw = 30, gap = (W - 8 * bw) / 9;
    const barras = s.map((x, i) => {
        const h = Math.max(1, (x.xp / max) * (H - pb - pt));
        const px = gap + i * (bw + gap), py = H - pb - h;
        const rotulo = `${pad2(x.ini.getDate())}/${pad2(x.ini.getMonth() + 1)}`;
        return `<g><rect x="${px}" y="${py}" width="${bw}" height="${h}" rx="3" fill="var(--cor-rank, #38bdf8)" opacity="${i === 7 ? 1 : 0.7}"><title>Semana de ${rotulo}: ${x.xp.toLocaleString('pt-BR')} XP</title></rect>
        <text x="${px + bw / 2}" y="${H - 7}" text-anchor="middle" font-size="9" fill="#94a3b8">${rotulo}</text>
        ${x.xp ? `<text x="${px + bw / 2}" y="${py - 3}" text-anchor="middle" font-size="9" fill="#cbd5e1">${x.xp >= 1000 ? (x.xp / 1000).toFixed(1) + 'k' : x.xp}</text>` : ''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" class="stat-svg" role="img" aria-label="XP por semana nas últimas 8 semanas">${barras}</svg>`;
}

function htmlMapaCalor() {
    const dias = (hunter.historico && hunter.historico.dias) || {};
    const seg = dataDeChave(chaveSemana());
    const ini = new Date(seg); ini.setDate(ini.getDate() - 7 * 11);
    const vals = Object.keys(dias).map(k => dias[k].xp || 0).filter(v => v > 0).sort((a, b) => a - b);
    const nivel = (v) => { if (!(v > 0)) return 0; const q = vals.length ? vals.indexOf(v) / vals.length : 0; return q < 0.34 ? 1 : q < 0.67 ? 2 : 3; };
    let cel = '';
    for (let c = 0; c < 12; c++) for (let r = 0; r < 7; r++) {
        const d = new Date(ini); d.setDate(d.getDate() + c * 7 + r);
        const k = chaveDia(d), reg = dias[k], futuro = d > obterDataAtual();
        const tipo = reg && reg.tipo;
        const cls = futuro ? 'hm-futuro' : tipo === 'perdido' ? 'hm-perdido' : tipo === 'folga' ? 'hm-folga' : 'hm-n' + nivel(reg && reg.xp);
        cel += `<i class="${cls}" style="grid-column:${c + 1};grid-row:${r + 1}" title="${d.toLocaleDateString('pt-BR')}${reg ? ' — ' + (reg.xp || 0).toLocaleString('pt-BR') + ' XP' : ''}"></i>`;
    }
    return `<div class="heatmap" role="img" aria-label="Mapa de calor dos últimos 84 dias">${cel}</div>
    <div class="hm-legenda"><i class="hm-n0"></i>sem treino <i class="hm-n1"></i><i class="hm-n2"></i><i class="hm-n3"></i>mais XP <i class="hm-folga"></i>folga <i class="hm-perdido"></i>perdido</div>`;
}

function abrirStats() {
    const h = hunter.historico || { dias: {}, recordes: {} };
    const r = h.recordes || {};
    const dias = Object.values(h.dias || {});
    const treinos = dias.filter(d => d.treino).length;
    const linhas = [
        ['🔥 Maior Streak', `${r.streak || 0} dias`], ['⭐ Maior XP em um dia', (r.xpDia || 0).toLocaleString('pt-BR')],
        ['💪 Mais flexões em um dia', r.flexoesDia || 0], ['🧘 Mais abdominais em um dia', r.abdominaisDia || 0],
        ['🦵 Mais agachamentos em um dia', r.agachamentosDia || 0], ['🏃 Maior cardio em um dia', (r.kmDia || 0).toFixed(1)],
        ['🏋️ Treinos registrados', treinos], ['🌟 Semanas perfeitas', hunter.semanasPerfeitas || 0],
        ['👹 Ecos derrotados', hunter.ecoVitorias || 0], ['🔴 Rupturas Vermelhas', hunter.rupturasVermelhas || 0]
    ];
    const notas = Object.keys(h.notas || {}).sort().reverse().slice(0, 4).map(k => `<div class="nota-diario"><b>${nomeMesChave(k)}</b><br>${String(h.notas[k]).replace(/</g, '&lt;')}</div>`).join('');
    document.getElementById('stats-corpo').innerHTML = `
        <h4 class="stat-tit">XP por semana (últimas 8)</h4>${svgGraficoSemanal()}
        <h4 class="stat-tit">Últimos 84 dias</h4>${htmlMapaCalor()}
        <h4 class="stat-tit">Recordes e totais</h4>
        <div class="stat-grid">${linhas.map(l => `<div><span>${l[0]}</span><b>${l[1]}</b></div>`).join('')}</div>
        <h4 class="stat-tit">Diário</h4>${notas || '<div class="desc-item-mini">Nenhuma anotação ainda. Elas aparecem na Retrospectiva Mensal.</div>'}`;
    document.getElementById('modal-stats').classList.remove('escondido');
}

function abrirRetroMenu() {
    const atual = chaveMes();
    const ant = mesAnteriorChave(atual);
    abrirRetrospectiva(estatisticasMes(ant).dias > 0 ? ant : atual);
}

/* ---------- GALERIA DE CONQUISTAS COM BARRAS DE PROGRESSO ---------- */
CATEGORIAS_CONQUISTA.engajamento = '🌟 ENGAJAMENTO & ENDGAME';
TITULOS_INFO["[ Mestre da Árvore ]"] = { desc: "Gastou 50 pontos na Árvore de Habilidades. Apenas honorário." };
BANCO_CONQUISTAS.push(
    { cat: 'engajamento', id: 'semana_1', dif: 'Fácil', titulo: '🌟 Semana Perfeita', desc: 'Cumprir as 3 Missões da Semana', xp: 500, gold: 400, condicao: (h) => (h.semanasPerfeitas || 0) >= 1 },
    { cat: 'engajamento', id: 'semana_10', dif: 'Difícil', titulo: '🏅 Disciplina Perfeita', desc: 'Conseguir 10 Semanas Perfeitas', xp: 4000, gold: 3000, ph: 1, condicao: (h) => (h.semanasPerfeitas || 0) >= 10 },
    { cat: 'engajamento', id: 'streak_100', dif: 'Épico', titulo: '💯 Centurião', desc: 'Chegar a 100 dias de Streak', xp: 8000, gold: 3000, condicao: (h) => (h.streakDias || 0) >= 100 },
    { cat: 'engajamento', id: 'eco_1', dif: 'Épico', titulo: '🌌 Caçador de Ecos', desc: 'Derrotar o primeiro Boss Eco', xp: 5000, gold: 2000, condicao: (h) => (h.ecoVitorias || 0) >= 1 },
    { cat: 'engajamento', id: 'eco_5', dif: 'Lendário', titulo: '🌌 Ceifador de Ecos', desc: 'Derrotar 5 Bosses Eco', xp: 15000, gold: 10000, ph: 2, condicao: (h) => (h.ecoVitorias || 0) >= 5 },
    { cat: 'engajamento', id: 'rup_vermelha', dif: 'Difícil', titulo: '🔴 Fenda Rubra', desc: 'Selar uma Ruptura Carmesim', xp: 2000, gold: 1500, tituloGanho: '[ Caçador da Fenda Rubra ]', condicao: (h) => (h.rupturasVermelhas || 0) >= 1 },
    { cat: 'engajamento', id: 'arvore_20', dif: 'Média', titulo: '🌳 Raízes Fundas', desc: 'Gastar 20 pontos na Árvore de Habilidades', xp: 2000, gold: 1000, condicao: (h) => (h.arvore || []).reduce((s, id) => s + ((noArvore(id) || {}).custo || 0), 0) >= 20 },
    { cat: 'engajamento', id: 'arvore_50', dif: 'Épico', titulo: '🌳 Mestre da Árvore', desc: 'Gastar 50 pontos (a árvore inteira)', xp: 10000, gold: 8000, tituloGanho: '[ Mestre da Árvore ]', condicao: (h) => (h.arvore || []).reduce((s, id) => s + ((noArvore(id) || {}).custo || 0), 0) >= 50 },
    { cat: 'engajamento', id: 'sombras_10', dif: 'Média', titulo: '🌑 Comandante da Legião', desc: 'Concluir 10 Missões das Sombras', xp: 1500, gold: 1500, condicao: (h) => Object.values(h.sombrasNivel || {}).reduce((s, x) => s + ((x && x.conc) || 0), 0) >= 10 },
    { cat: 'engajamento', id: 'backup_1', dif: 'Fácil', titulo: '💾 Precavido', desc: 'Exportar o seu save pela primeira vez', xp: 300, gold: 300, condicao: (h) => !!(h.config && h.config.ultimoBackup) }
);

const PROG_CONQUISTAS = {
    flex_100: (h) => [h.totaisAcumulados.flexoes, 100],
    corr_50: (h) => [h.totaisAcumulados.corrida, 50],
    streak_30: (h) => [h.streakDias || 0, 30],
    eco_ganancia: (h) => [h.vendasBoss || 0, 1],
    eco_resgate: (h) => [h.recomprasBoss || 0, 1],
    disc_tentacao: (h) => [h.punicoesSeguidas || 0, 3],
    semana_10: (h) => [h.semanasPerfeitas || 0, 10],
    streak_100: (h) => [h.streakDias || 0, 100],
    eco_5: (h) => [h.ecoVitorias || 0, 5],
    arvore_20: (h) => [Math.min(20, pontosGastosArvore()), 20],
    arvore_50: (h) => [Math.min(50, pontosGastosArvore()), 50],
    sombras_10: (h) => [Math.min(10, Object.values(h.sombrasNivel || {}).reduce((s, x) => s + ((x && x.conc) || 0), 0)), 10]
};

function abrirModalConquistas() {
    const container = document.getElementById('lista-conquistas-body');
    container.innerHTML = '';
    const total = BANCO_CONQUISTAS.length, ok = BANCO_CONQUISTAS.filter(c => hunter.conquistasDesbloqueadas.includes(c.id)).length;
    const resumo = document.createElement('div');
    resumo.className = 'galeria-resumo';
    resumo.innerHTML = `<b>${ok}/${total}</b> conquistas <div class="sem-barra"><div class="sem-barra-fill" style="width:${(ok / total) * 100}%; background:#eab308;"></div></div>`;
    container.appendChild(resumo);

    Object.keys(CATEGORIAS_CONQUISTA).forEach(cat => {
        const lista = BANCO_CONQUISTAS.filter(c => c.cat === cat);
        if (!lista.length) return;
        const cab = document.createElement('div');
        cab.style.cssText = "margin:10px 0 4px; font-family:'Orbitron',sans-serif; font-size:0.85rem; color:#eab308;";
        cab.innerText = CATEGORIAS_CONQUISTA[cat];
        container.appendChild(cab);
        lista.forEach(c => {
            const div = document.createElement('div');
            const desbloqueada = hunter.conquistasDesbloqueadas.includes(c.id);
            div.className = `rank-item-info ${desbloqueada ? 'rank-alcançado' : ''}`;
            const efeitos = textoEfeitoRecompensasConquista(c).map(l => `<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">• ${l}</div>`).join('');
            let barra = '';
            if (PROG_CONQUISTAS[c.id]) {
                let a = 0, b = 1;
                try { [a, b] = PROG_CONQUISTAS[c.id](hunter); } catch (e) {}
                const v = desbloqueada ? b : Math.min(a, b);
                barra = `<div class="conq-prog"><div class="sem-barra"><div class="sem-barra-fill" style="width:${Math.min(100, (v / b) * 100)}%; background:${desbloqueada ? '#22c55e' : '#38bdf8'};"></div></div><span>${Number.isInteger(v) ? v : v.toFixed(1)} / ${b}</span></div>`;
            }
            div.innerHTML = `
                <div><strong>${desbloqueada ? '✅ ' : ''}${c.titulo}</strong> ${c.dif ? `<span class="tag-raridade" style="color:#f59e0b; border-color:#f59e0b;">${c.dif}</span>` : ''}</div>
                <div style="font-size:0.8rem; color:#cbd5e1;"><b>Como conseguir:</b> ${c.desc}</div>
                ${barra}
                <div style="font-size:0.8rem; color:#eab308;"><b>Recompensas:</b> ${textoRecompensasConquista(c) || '—'}</div>
                ${efeitos}`;
            container.appendChild(div);
        });
    });
    document.getElementById('modal-conquistas').classList.remove('escondido');
}

/* ---------- LIGAÇÃO DOS BOTÕES NOVOS ---------- */
function configurarV31UI() {
    const on = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('click', fn); };
    const fechar = (id, modal) => on(id, () => document.getElementById(modal).classList.add('escondido'));
    on('btn-abrir-arvore', abrirModalArvore); fechar('btn-fechar-arvore', 'modal-arvore');
    on('btn-respec-arvore', respecArvore);
    on('btn-abrir-stats', abrirStats); fechar('btn-fechar-stats', 'modal-stats');
    on('btn-abrir-config', abrirConfig);
    on('btn-instalar-app', instalarNaTelaInicial);
    on('btn-aviso-sistema', () => avisarJogo(textoAvisoDoSistema()));
    on('btn-fechar-config', () => { salvarConfigDoModal(); document.getElementById('modal-config').classList.add('escondido'); });
    ['cfg-som', 'cfg-vib', 'cfg-mov', 'cfg-notif', 'cfg-hora'].forEach(id => document.getElementById(id)?.addEventListener('change', salvarConfigDoModal));
    on('btn-abrir-molduras', abrirMolduras); fechar('btn-fechar-molduras', 'modal-molduras');
    on('avatar-icone', abrirMolduras);
    on('btn-abrir-retro', abrirRetroMenu);
    on('btn-fechar-retro', fecharRetrospectiva);
    on('btn-modo-recuperacao', abrirModalRecuperacao);
    on('btn-cancelar-recuperacao', () => document.getElementById('modal-recuperacao').classList.add('escondido'));
    document.querySelectorAll('.btn-rec-opc').forEach(b => b.addEventListener('click', () => iniciarRecuperacao(b.dataset.motivo, parseInt(b.dataset.dias, 10))));
    on('btn-encerrar-recuperacao', async () => {
        if (await confirmarJogo('🩹 Encerrar o Modo Recuperação agora?\n\nO treino volta com metas reduzidas nos 3 primeiros dias (−30%, −20%, −10%).', { sim: 'Encerrar', nao: 'Continuar' })) { encerrarRecuperacao(true); carregarEExibirInterface(); }
    });
    configurarV32UI();
    configurarV33UI();
    registrarPWA();
    setInterval(checarNotificacaoLembrete, 60000);
}


/* ==========================================================================
   V32 — NÍVEL REAL DOS EXERCÍCIOS (Rupturas, Fendas e Desafios) + AVATARES E MOLDURAS QUADRADAS
   ========================================================================== */

/* ---------- NÍVEL REAL: o desafio segue a variante que o jogador faz AGORA ---------- */
const DICA_VARIANTE = {
    flexoes: 'joelhos apoiados no chão, corpo reto dos joelhos à cabeça',
    abdominais: 'levante só os ombros, sem puxar o pescoço',
    agachamentos: 'sente no banco e levante com controle, sem pular'
};
const NOME_EX_GENERICO = { flexoes: 'Flexões', abdominais: 'Abdominais', agachamentos: 'Agachamentos', corrida: 'Cardio', leitura: 'Leitura' };

function exercicioAssistido(k) { return hunter.capacidade && hunter.capacidade[k] === false; }
function estagioTransicao(k) {
    const pr = (hunter.progAlt || {})[k];
    return (exercicioAssistido(k) && pr && pr.estagio) ? pr.estagio : 0;
}

// Alvo proporcional ao máximo REAL do jogador na variante que ele faz hoje.
//  - exercício normal ........ n repetições do exercício normal
//  - exercício assistido ..... n repetições da variante assistida (ex.: Flexões com Joelho)
//  - em transição (estágio 1-4) mesma divisão do treino diário: série de força (principal) + série assistida
// opc: { minimo, teto (fração do máximo que nunca é ultrapassada), nome (nome do normal), nomeAssist }
function alvoExercicio(k, frac, opc) {
    opc = opc || {};
    const max = Math.max(1, Number((hunter.maximos || {})[k]) || 1);
    let n = Math.round(max * frac);
    n = Math.max(opc.minimo || 3, n);
    n = Math.min(n, Math.max(1, Math.round(max * (opc.teto || 1))));
    n = Math.max(1, n);
    const e = EXERCICIOS[k];
    if (!exercicioAssistido(k)) return { k, total: n, assistido: false, estagio: 0, partes: [{ n, nome: opc.nome || e.normal }] };
    const nomeAs = opc.nomeAssist || e.adaptado;
    const est = estagioTransicao(k);
    if (!est) return { k, total: n, assistido: true, estagio: 0, partes: [{ n, nome: nomeAs }] };
    const forca = Math.max(1, Math.round(n * PROG_SHARE_PRINCIPAL[est]));
    const assist = Math.max(1, Math.round(n * PROG_SHARE_ASSISTIDO[est]));
    return { k, total: n, assistido: true, estagio: est, partes: [{ n: forca, nome: `${e.normal} (série de força)`, forca: true }, { n: assist, nome: nomeAs }] };
}

function textoAlvo(a) { return a.partes.map(p => `${p.n} ${p.nome}`).join(' + '); }

function notaNivel(alvos) {
    const l = [];
    alvos.forEach(a => {
        if (a && a.assistido && DICA_VARIANTE[a.k]) l.push(`${EXERCICIOS[a.k].adaptado}: ${DICA_VARIANTE[a.k]}`);
        if (a && a.estagio) l.push(`${EXERCICIOS[a.k].normal}: faça a série de força primeiro, descansado e com técnica perfeita`);
    });
    return l.length ? `\n(Seu nível — ${l.join(' · ')}. Divida em séries, descanse e pare se sentir dor.)` : '\n(Divida em séries, descanse entre elas e pare se sentir dor.)';
}

function fmtSegundos(s) {
    s = Math.round(s);
    if (s < 60) return `${s} segundos`;
    const m = Math.floor(s / 60), r = s % 60;
    return r ? `${m}m${String(r).padStart(2, '0')}s` : `${m} minuto${m > 1 ? 's' : ''}`;
}

/* ---------- RUPTURA: o texto fica fixo enquanto ela está aberta ---------- */
function montarDesafioRuptura() {
    if (hunter.rupturaTipo !== 'vermelha') {
        const f = alvoExercicio('flexoes', 0.5, { minimo: 5, teto: 0.8 });
        return `⚡ Ruptura Detectada! Realize rapidamente ${textoAlvo(f)} para fechar a fenda!${notaNivel([f])}`;
    }
    const f = alvoExercicio('flexoes', exercicioAssistido('flexoes') ? 1.0 : 1.2, { minimo: 8, teto: 1.2 });
    const a = alvoExercicio('agachamentos', 1.0, { minimo: 10, teto: 1.0 });
    return `🔴 RUPTURA CARMESIM! Em até ${Math.round(duracaoRupturaMs() / 60000)} minutos faça ${textoAlvo(f)} e ${textoAlvo(a)} para selar a fenda!${notaNivel([f, a])}`;
}

/* ---------- FENDA TEMPORÁRIA (Masmorra): nomes da variante que o jogador faz ---------- */
function nomePolichinelo() {
    return (exercicioAssistido('agachamentos') || exercicioAssistido('corrida')) ? 'Polichinelos sem salto (passo lateral)' : 'Polichinelos RÁPIDOS';
}
function nomeAbdInfra() {
    return exercicioAssistido('abdominais') ? 'Abdominais Infra com joelhos dobrados (versão leve)' : 'Abdominais Infra';
}

/* ---------- DESAFIO DE EMERGÊNCIA: proporcional ao máximo e à variante ---------- */
const DESAFIOS_V32 = {
    0: { xp: 100, itens: [{ t: 'poli', n: 10 }, { t: 'prancha', m: 1.0 }, { t: 'ex', k: 'agachamentos', f: 0.35, min: 5, nome: 'Agachamentos lentos', nomeAs: 'Agachamentos no Banco, bem devagar' }] },
    1: { xp: 200, itens: [{ t: 'ex', k: 'flexoes', f: 0.30, min: 3, nome: 'Flexões Diamante', nomeAs: 'Flexões Diamante no Joelho' }, { t: 'prancha', m: 1.2 }, { t: 'ex', k: 'agachamentos', f: 0.40, min: 6, nome: 'Agachamentos com Salto', nomeAs: 'Agachamentos no Banco (sem salto)' }] },
    2: { xp: 400, itens: [{ t: 'ex', k: 'flexoes', f: 0.40, min: 4, nome: 'Flexões Fechadas', nomeAs: 'Flexões Fechadas no Joelho' }, { t: 'prancha', m: 1.5 }, { t: 'ex', k: 'abdominais', f: 0.50, min: 8, nome: 'Abdominais Infra', nomeAs: 'Abdominais Infra com joelhos dobrados (leve)' }] },
    3: { xp: 800, itens: [{ t: 'ex', k: 'flexoes', f: 0.50, min: 5, nome: 'Flexões Bate-Palma', nomeAs: 'Flexões com Joelho (sem bater palma)' }, { t: 'prancha', m: 2.0 }, { t: 'ex', k: 'agachamentos', f: 0.60, min: 8, nome: 'Agachamentos Búlgaros', nomeAs: 'Agachamentos no Banco, bem devagar' }] },
    4: { xp: 1500, itens: [{ t: 'burpee', f: 0.35 }, { t: 'prancha', m: 2.4 }, { t: 'ex', k: 'flexoes', f: 0.60, min: 6, nome: 'Flexões em Declive', nomeAs: 'Flexões com Joelho, mãos num apoio alto' }] },
    5: { xp: 3000, itens: [{ t: 'burpee', f: 0.50 }, { t: 'prancha', m: 3.0 }, { t: 'ex', k: 'agachamentos', f: 0.90, min: 10, nome: 'Agachamentos Profundos', nomeAs: 'Agachamentos no Banco, bem devagar' }] },
    6: { xp: 5000, itens: [{ t: 'burpee', f: 0.60, nome: 'Burpees do Soberano' }, { t: 'prancha', m: 4.0, nome: 'Prancha de Aço' }, { t: 'ex', k: 'flexoes', f: 1.0, min: 8, nome: 'Flexões de Soberano', nomeAs: 'Flexões com Joelho de Soberano' }] }
};

function textoItemDesafio(it) {
    if (it.t === 'poli') {
        const sem = (exercicioAssistido('agachamentos') || exercicioAssistido('corrida'));
        return { texto: `Realize ${it.n} ${sem ? 'Polichinelos sem salto (passo lateral)' : 'Polichinelos rápidos'}!`, alvos: [] };
    }
    if (it.t === 'prancha') {
        const ass = exercicioAssistido('abdominais');
        const s = Math.max(15, Math.min(300, Math.round((hunter.maximos.abdominais || 20) * it.m * (ass ? 0.7 : 1))));
        return { texto: `Segure ${fmtSegundos(s)} de ${it.nome || 'Prancha'}${ass ? ' com os joelhos apoiados' : ''}!`, alvos: [] };
    }
    if (it.t === 'burpee') {
        const ass = exercicioAssistido('agachamentos') || exercicioAssistido('flexoes');
        const n = Math.max(3, Math.round((hunter.maximos.agachamentos || 20) * it.f));
        const nome = it.nome || 'Burpees';
        return { texto: ass ? `Realize ${n} Burpees sem salto e sem flexão (passo para trás, um pé de cada vez)!` : `Realize ${n} ${nome} sem pausa longa!`, alvos: [] };
    }
    const a = alvoExercicio(it.k, it.f, { minimo: it.min, teto: 1.0, nome: it.nome, nomeAssist: it.nomeAs });
    return { texto: `Faça ${textoAlvo(a)}!`, alvos: [a] };
}

function montarDesafioEmergencia(rank) {
    const cfg = DESAFIOS_V32[rank] || DESAFIOS_V32[0];
    const it = cfg.itens[Math.floor(Math.random() * cfg.itens.length)];
    const r = textoItemDesafio(it);
    return { xp: cfg.xp, texto: r.texto, nota: notaNivel(r.alvos) };
}

function notaRaidTransicao() {
    const ls = PROG_KEYS.filter(k => k !== 'corrida' && estagioTransicao(k) > 0).map(k => EXERCICIOS[k].adaptado);
    return ls.length ? ` Na Raid você faz só a versão assistida (${ls.join(', ')}), no seu nível seguro: a série de força fica de fora.` : '';
}

/* ---------- AVATAR QUADRADO ---------- */
function generoAvatar() { return hunter.genero === 'feminino' ? 'f' : 'm'; }

function indiceAvatar() {
    const max = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);
    if (hunter.avatarRank != null && hunter.avatarRank >= 0 && hunter.avatarRank <= max) return Math.min(6, hunter.avatarRank);
    return Math.min(6, hunter.rankIndiceAtual || 0);
}

function srcAvatar(i, g) {
    try { return (typeof AVATARES_IMG !== 'undefined' && AVATARES_IMG[g || generoAvatar()] || [])[i] || ''; } catch (e) { return ''; }
}

function atualizarAvatar() {
    const img = document.getElementById('avatar-img');
    if (!img) return;
    const i = indiceAvatar();
    const src = srcAvatar(i);
    if (src) { if (img.getAttribute('src') !== src) img.setAttribute('src', src); img.style.display = ''; }
    else img.style.display = 'none';
    const rk = ESCALA_RANKS[i] || ESCALA_RANKS[0];
    img.alt = `Avatar do Caçador — ${rk.nome}`;
    const box = document.getElementById('avatar-icone');
    if (box) box.dataset.rank = i;
}

/* ---------- MOLDURAS: estilos quadrados ---------- */
const COR_AVATAR_RANK = ['#b4835a', '#cbd5e1', '#facc15', '#38bdf8', '#f97316', '#a855f7', '#c026d3'];
const ESTILO_MOLDURA = { eco_1: 'runas', eco_2: 'runas', eco_3: 'runas', eco_4: 'runas', eco_5: 'runas', chama_30: 'chama', ouro_365: 'ouro', fenda_rubra: 'cantos', perfeita_10: 'dupla' };
Object.keys(ESTILO_MOLDURA).forEach(id => { if (MOLDURAS[id]) MOLDURAS[id].estilo = ESTILO_MOLDURA[id]; });
['simples', 'dupla', 'cantos', 'dupla', 'chama', 'runas', 'sombra'].forEach((est, i) => {
    MOLDURAS['rank_' + i] = { nome: `Moldura ${i === 6 ? 'do Soberano' : 'do Rank ' + 'EDCBAS'[i]}`, cor: COR_AVATAR_RANK[i], estilo: est, rank: i, origem: `Alcançar o ${ESCALA_RANKS[i].nome}` };
});

function sincronizarMolduras() {
    if (!hunter.nome) return;
    if (!hunter.molduras) hunter.molduras = [];
    const max = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);
    let novas = 0;
    for (let i = 0; i <= Math.min(6, max); i++) {
        const id = 'rank_' + i;
        if (!hunter.molduras.includes(id)) {
            hunter.molduras.push(id); novas++;
            if (hunter.moldurasRankInit && MOLDURAS[id]) mostrarToast({ tag: '🖼️ NOVA MOLDURA', titulo: MOLDURAS[id].nome, texto: 'Desbloqueada ao subir de Rank. Toque no avatar para aplicar.', cor: MOLDURAS[id].cor });
        }
    }
    hunter.moldurasRankInit = true;
    return novas;
}

function aplicarMoldura() {
    const av = document.getElementById('avatar-icone');
    if (!av) return;
    sincronizarMolduras();
    atualizarAvatar();
    const m = hunter.molduraEquipada && MOLDURAS[hunter.molduraEquipada];
    Array.from(av.classList).filter(c => c.startsWith('m-')).forEach(c => av.classList.remove(c));
    av.classList.toggle('com-moldura', !!m);
    if (m) av.classList.add('m-' + (m.estilo || 'simples'));
    av.style.setProperty('--cor-moldura', m ? m.cor : 'transparent');
    av.title = m ? `Moldura: ${m.nome} (toque para trocar ou remover)` : 'Toque para trocar a moldura e a aparência';
}

function htmlAvatarMini(i, molduraId, extra) {
    const m = molduraId && MOLDURAS[molduraId];
    const src = srcAvatar(i);
    return `<span class="avatar-quadro mini ${m ? 'com-moldura m-' + (m.estilo || 'simples') : ''} ${extra || ''}" style="--cor-moldura:${m ? m.cor : 'transparent'}"><span class="avatar-janela">${src ? `<img class="avatar-img" src="${src}" alt="" draggable="false">` : '🛡️'}</span><span class="avatar-moldura-sobre"></span></span>`;
}

function abrirMolduras() {
    sincronizarMolduras();
    const box = document.getElementById('molduras-lista');
    const donas = hunter.molduras || [];
    const iAv = indiceAvatar();
    const max = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);

    const prev = document.getElementById('avatar-previa');
    if (prev) {
        const m = hunter.molduraEquipada && MOLDURAS[hunter.molduraEquipada];
        prev.className = 'avatar-quadro grande ' + (m ? 'com-moldura m-' + (m.estilo || 'simples') : '');
        prev.style.setProperty('--cor-moldura', m ? m.cor : 'transparent');
        const src = srcAvatar(iAv);
        prev.innerHTML = `<div class="avatar-janela">${src ? `<img class="avatar-img" src="${src}" alt="" draggable="false">` : ''}</div><div class="avatar-moldura-sobre"></div>`;
    }
    const sel = document.getElementById('avatar-genero');
    if (sel) sel.value = hunter.genero || 'nao_informar';

    const gal = document.getElementById('avatar-galeria');
    if (gal) {
        let h = `<button type="button" class="avatar-opc ${hunter.avatarRank == null ? 'ativa' : ''}" data-av="auto">${htmlAvatarMini(Math.min(6, hunter.rankIndiceAtual || 0))}<b>Automático</b><small>segue seu Rank</small></button>`;
        for (let i = 0; i <= 6; i++) {
            const livre = i <= max;
            const nomeRk = i === 6 ? 'Soberano' : 'Rank ' + 'EDCBAS'[i];
            h += `<button type="button" class="avatar-opc ${hunter.avatarRank === i ? 'ativa' : ''} ${livre ? '' : 'bloqueada'}" data-av="${i}" ${livre ? '' : 'disabled'}>${livre ? htmlAvatarMini(i) : '<span class="avatar-quadro mini"><span class="avatar-janela travado">🔒</span></span>'}<b>${nomeRk}</b></button>`;
        }
        gal.innerHTML = h;
        gal.querySelectorAll('.avatar-opc:not([disabled])').forEach(b => b.addEventListener('click', () => {
            hunter.avatarRank = b.dataset.av === 'auto' ? null : parseInt(b.dataset.av, 10);
            salvarDados(); aplicarMoldura(); abrirMolduras();
        }));
    }

    box.innerHTML = `<button type="button" class="moldura-opc ${!hunter.molduraEquipada ? 'ativa' : ''}" data-m="">${htmlAvatarMini(iAv)}<b>Sem moldura</b><small>avatar limpo</small></button>` +
        Object.keys(MOLDURAS).map(id => {
            const m = MOLDURAS[id], tem = donas.includes(id);
            const prevHtml = tem ? htmlAvatarMini(iAv, id) : `<span class="avatar-quadro mini"><span class="avatar-janela travado">🔒</span></span>`;
            return `<button type="button" class="moldura-opc ${hunter.molduraEquipada === id ? 'ativa' : ''} ${tem ? '' : 'bloqueada'}" data-m="${id}" ${tem ? '' : 'disabled'}>${prevHtml}<b>${m.nome}</b><small>${tem ? (hunter.molduraEquipada === id ? 'em uso' : 'desbloqueada') : m.origem}</small></button>`;
        }).join('');
    box.querySelectorAll('.moldura-opc:not([disabled])').forEach(b => b.addEventListener('click', () => {
        hunter.molduraEquipada = b.dataset.m || null;
        salvarDados(); aplicarMoldura(); abrirMolduras();
    }));
    const rem = document.getElementById('btn-remover-moldura');
    if (rem) rem.disabled = !hunter.molduraEquipada;
    document.getElementById('modal-molduras').classList.remove('escondido');
}

function configurarV32UI() {
    const sel = document.getElementById('avatar-genero');
    if (sel) sel.addEventListener('change', () => {
        hunter.genero = sel.value; salvarDados(); aplicarMoldura(); abrirMolduras();
    });
    const rem = document.getElementById('btn-remover-moldura');
    if (rem) rem.addEventListener('click', () => {
        hunter.molduraEquipada = null; salvarDados(); aplicarMoldura(); abrirMolduras();
    });
}

function migrarV32() {
    if (!hunter.nome) return;
    migrarV33();
    if (!hunter.genero) hunter.genero = 'nao_informar';
    if (!hunter.avisoAvatarV32) {
        hunter.avisoAvatarV32 = true;
        setTimeout(() => { try { adicionarMsgChat('🖼️ [AVATAR]: seu Caçador agora tem um avatar de verdade, que muda a cada Rank! Toque nele para escolher o gênero (padrão: masculino), a aparência e as molduras.'); } catch (e) {} }, 1500);
    }
}

/* =====================================================================
   V33 — VARIAÇÕES DE EXERCÍCIO (progressão por dificuldade real)
   - Exercícios mais difíceis entram MISTURADOS durante a semana (não são fixos).
   - Cada variação ocupa só uma parte do volume (20% a 30%) e a proporção é baseada no seu máximo.
   - XP: 1 repetição vale o equivalente em repetições normais + bônus pequeno (2% a 5% por grau).
   - Proporções: algumas vêm de estudos de carga (flexão com pés elevados); outras são estimativas
     conservadoras (EMG/biomecânica), e o app ajusta pelo seu feedback ("foi confortável?").
   ===================================================================== */
const VAR_KEYS = ['flexoes', 'agachamentos', 'abdominais'];
const VAR_BONUS_GRAU = { 1: 0.02, 2: 0.03, 3: 0.04, 4: 0.05 };      // XP extra por grau de dificuldade
const VAR_SHARE_GRAU = { 1: 0.30, 2: 0.30, 3: 0.25, 4: 0.20 };      // parcela do volume trocada pela variação
const VAR_RANK_GRAU = { 1: 1, 2: 3, 3: 4, 4: 5 };                   // Rank mínimo (índice) por grau: D, B, A, S
const VAR_DIAS = { agachamentos: [1, 4], flexoes: [2, 5], abdominais: [3, 5] }; // dias da semana (1=seg ... 5=sex)
const VAR_REPL_MAX = 0.5;                                           // a variação nunca troca mais que 50% da meta

const VARIACOES = [
    { id: 'pes_elevados', k: 'flexoes', nome: 'Flexões com Pés Elevados', grau: 1, razao: 0.85, lados: 1, maxNormal: 35, req: null, base: 'estudo',
      dica: 'Pés num apoio baixo (30 a 40 cm), corpo em linha reta, ombros longe das orelhas.',
      fonte: 'Estudos de carga (Ebben 2011, Suprak 2011): pés elevados carregam ~70-74% do peso nas mãos contra ~64% na flexão normal.' },
    { id: 'diamante', k: 'flexoes', nome: 'Flexões Diamante', grau: 1, razao: 0.60, lados: 1, maxNormal: 35, req: null, base: 'estimativa',
      dica: 'Mãos sob o peito formando um diamante, cotovelos junto ao corpo. Pare se o punho ou o cotovelo doerem.',
      fonte: 'Estimativa: estudos de eletromiografia mostram o tríceps muito mais exigido, mas não há estudo de carga. Proporção conservadora.' },
    { id: 'arqueiro', k: 'flexoes', nome: 'Flexões Arqueiro', grau: 2, razao: 0.30, lados: 2, maxNormal: 45, req: 'diamante', base: 'estimativa',
      dica: 'Um braço estica de lado enquanto o outro faz a flexão. Alterne os lados; conte o total.',
      fonte: 'Estimativa: carga quase total num braço, com o outro ajudando só de apoio.' },
    { id: 'um_braco_assist', k: 'flexoes', nome: 'Flexão de Um Braço Assistida', grau: 3, razao: 0.12, lados: 2, maxNormal: 60, req: 'arqueiro', base: 'estimativa',
      dica: 'Mão livre apoiada num degrau ou na parede, pés afastados. Conte o total dos dois lados.',
      fonte: 'Estimativa: o braço de trabalho recebe mais que o peso do tronco inteiro; a ajuda reduz isso.' },
    { id: 'um_braco', k: 'flexoes', nome: 'Flexão de Um Braço', grau: 4, razao: 0.05, lados: 2, maxNormal: 80, req: 'um_braco_assist', base: 'estimativa',
      dica: 'Pés bem afastados, corpo firme. Poucas repetições perfeitas valem mais que muitas ruins. Conte o total dos dois lados.',
      fonte: 'Estimativa: um braço só leva mais que o peso do tronco; só aparece para quem já tem máximo muito alto.' },
    { id: 'bulgaro', k: 'agachamentos', nome: 'Agachamento Búlgaro', grau: 1, razao: 0.50, lados: 2, maxNormal: 40, req: null, base: 'estimativa',
      dica: 'Pé de trás num banco baixo, tronco firme, joelho da frente alinhado com o pé. Conte o total das duas pernas.',
      fonte: 'Estimativa: a perna da frente carrega ~70-80% do peso do corpo, contra ~50% de cada perna no agachamento comum.' },
    { id: 'pistol_assist', k: 'agachamentos', nome: 'Agachamento Pistol Assistido', grau: 3, razao: 0.25, lados: 2, maxNormal: 55, req: 'bulgaro', base: 'estimativa',
      dica: 'Uma perna só, segurando num apoio firme (batente, TRX) para controlar a descida. Conte o total das duas pernas.',
      fonte: 'Estimativa: perna única com amplitude total; o apoio tira parte da carga.' },
    { id: 'pistol', k: 'agachamentos', nome: 'Agachamento Pistol', grau: 4, razao: 0.10, lados: 2, maxNormal: 70, req: 'pistol_assist', base: 'estimativa',
      dica: 'Uma perna só, sem apoio, descida controlada. Pare se o joelho incomodar. Conte o total das duas pernas.',
      fonte: 'Estimativa: perna única, amplitude total, sem ajuda. Exige mobilidade de tornozelo e quadril.' },
    { id: 'infra', k: 'abdominais', nome: 'Abdominal Infra', grau: 1, razao: 0.65, lados: 1, maxNormal: 50, req: null, base: 'estimativa',
      dica: 'Deitado, eleve os joelhos em direção ao peito sem tirar a lombar do chão.',
      fonte: 'Estimativa baseada em eletromiografia da parte inferior do reto abdominal.' },
    { id: 'elev_pernas', k: 'abdominais', nome: 'Elevação de Pernas', grau: 2, razao: 0.45, lados: 1, maxNormal: 60, req: 'infra', base: 'estimativa',
      dica: 'Pernas estendidas, sobe e desce com controle; se a lombar sair do chão, dobre os joelhos.',
      fonte: 'Estimativa: braço de alavanca maior que o abdominal infra.' },
    { id: 'v_up', k: 'abdominais', nome: 'Canivete (V-up)', grau: 3, razao: 0.30, lados: 1, maxNormal: 70, req: 'elev_pernas', base: 'estimativa',
      dica: 'Braços e pernas sobem juntos formando um V. Movimento controlado, sem balanço.',
      fonte: 'Estimativa: exige força e mobilidade do tronco todo.' }
];

function varPorId(id) { return VARIACOES.find(v => v.id === id) || null; }
function varEstado() {
    if (!hunter.variacoes || typeof hunter.variacoes !== 'object' || Array.isArray(hunter.variacoes)) hunter.variacoes = {};
    const e = hunter.variacoes;
    ['v', 'pausa', 'pausaAte', 'recusadas'].forEach(c => { if (!e[c] || typeof e[c] !== 'object' || Array.isArray(e[c])) e[c] = {}; });
    // cada variação ativa precisa ser um objeto com frac/usos numéricos (save adulterado não pode gerar NaN nas metas)
    Object.keys(e.v).forEach(id => {
        const s = e.v[id];
        const vr = VARIACOES.find(x => x.id === id);
        if (!vr || !s || typeof s !== 'object' || Array.isArray(s)) { delete e.v[id]; return; } // entrada inválida: a variação volta a ficar bloqueada
        if (s.frac != null && !Number.isFinite(s.frac)) s.frac = 0.5;
        ['usos', 'ok', 'treinos'].forEach(c => { if (s[c] != null && !Number.isFinite(s[c])) s[c] = 0; });
        if (!Number.isFinite(s.max) || s.max < 1) s.max = varMaxInicial(vr);
    });
    return e;
}
function varAjustaPar(n, vr) { return vr.lados === 2 ? Math.max(2, 2 * Math.round(n / 2)) : Math.max(1, Math.round(n)); }
// Estimativa de repetições seguras: 70% do que a proporção indica
function varMaxInicial(vr) { return varAjustaPar((hunter.maximos[vr.k] || 10) * vr.razao * 0.7, vr); }
// Teto de evolução do limite: 90% da proporção (nunca passa disso por feedback)
function varTetoMax(vr) { return Math.max(varMaxInicial(vr), varAjustaPar((hunter.maximos[vr.k] || 10) * vr.razao * 0.9, vr)); }

function varDesbloqueadas(k) { const st = varEstado(); return VARIACOES.filter(v => v.k === k && st.v[v.id]); }

// Requisitos para liberar uma variação: lista de pendências (vazia = pode liberar)
function varFaltas(vr) {
    const st = varEstado();
    const f = [];
    if (hunter.capacidade[vr.k] === false) f.push('fazer o exercício principal (não o assistido)');
    const rankMin = VAR_RANK_GRAU[vr.grau];
    if ((hunter.rankIndiceAtual || 0) < rankMin) f.push(`Rank ${ESCALA_RANKS[rankMin].nome.replace('RANK ', '')} ou superior`);
    const mx = hunter.maximos[vr.k] || 0;
    if (mx < vr.maxNormal) f.push(`máximo de ${EXERCICIOS[vr.k].normal} ≥ ${vr.maxNormal} (hoje: ${mx})`);
    if (vr.req) {
        const r = varPorId(vr.req);
        const sr = st.v[vr.req];
        if (!sr) f.push(`liberar antes: ${r.nome}`);
        else if (!varDominada(vr.req)) f.push(`dominar antes: ${r.nome} (falta uma checagem "foi confortável?" com resposta sim)`);
    }
    // uma variação nova por vez em cada exercício: as ativas precisam estar dominadas
    const pendente = varDesbloqueadas(vr.k).find(a => a.id !== vr.id && !varDominada(a.id));
    if (!st.v[vr.id] && pendente) f.push(`dominar primeiro: ${pendente.nome}`);
    return f;
}

// "Dominada": o jogador respondeu SIM ao menos uma vez à pergunta "foi confortável?" (3 treinos bons)
function varDominada(id) {
    const s = varEstado().v[id];
    return !!(s && (s.ok || 0) >= 1);
}

function varPausada(k) {
    const st = varEstado();
    if (st.pausa[k]) return true;
    const ate = st.pausaAte[k];
    return !!(ate && obterDataAtual() < new Date(ate));
}

function varSemana(d) {
    return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000 + 3) / 7);
}

function varDiasDe(k) {
    if (k === 'flexoes' && varDesbloqueadas('flexoes').length >= 3) return [1, 3, 5];
    return VAR_DIAS[k];
}

// Qual variação cai hoje para o exercício k (ou null): dias fixos da semana, variação rotacionando
function varDoDia(k, data) {
    const d = data || obterDataAtual();
    const lista = varDesbloqueadas(k);
    if (!lista.length) return null;
    const dias = varDiasDe(k);
    const pos = dias.indexOf(d.getDay());
    if (pos < 0) return null;
    return lista[(varSemana(d) * dias.length + pos) % lista.length];
}

// Condições do dia em que NENHUMA variação aparece (só treino normal, sem risco extra)
function varPermitidoHoje() {
    if (hunter.bossCombateAtivo || hunter.zonaPunicao) return false;
    if (ehFimDeSemanaAtual()) return false;
    if (recuperacaoAtiva()) return false;
    if (((hunter.recuperacao && hunter.recuperacao.retornoRestante) || 0) > 0) return false;
    if (hunter.preparatoriaAtiva || hunter.cargaAliviadaAtiva || hunter.fadigaReducaoAtiva) return false;
    if ((hunter.fadiga || 0) >= 70) return false;
    return true;
}

// Repetições da variação para uma meta normal de 'meta' reps: parte do volume do grau x nível atual do jogador (frac)
function varCalcReps(vr, meta) {
    const s = varEstado().v[vr.id] || {};
    const frac = Math.max(0.3, Math.min(1, s.frac == null ? 0.5 : s.frac));
    const nEq = Math.round(meta * VAR_SHARE_GRAU[vr.grau]);
    let v = varAjustaPar(nEq * vr.razao * frac, vr);
    v = Math.min(v, varTetoMax(vr));  // nunca passa do teto de segurança, mesmo que o máximo normal tenha caído
    return { v, repl: Math.round(v / vr.razao), cheio: varAjustaPar(nEq * vr.razao, vr) };
}

// Quantas repetições a variação pede hoje (ou pediria) com a meta normal atual
function varRepsAtuais(vr) {
    const m = hunter.metasCalculadas || {};
    const d = (m.var || {})[vr.k];
    const meta = (d && d.id === vr.id) ? d.metaOriginal : (m[vr.k] || 10);
    return varCalcReps(vr, meta).v;
}

function aplicarVariacoes() {
    const m = hunter.metasCalculadas;
    if (!m) return;
    VAR_KEYS.forEach(k => { delete m[k + '_v']; });
    delete m.var;
    if (!hunter.nome || !varPermitidoHoje()) return;
    const st = varEstado();
    const info = {};
    VAR_KEYS.forEach(k => {
        if (hunter.capacidade[k] === false || varPausada(k)) return;
        const vr = varDoDia(k);
        if (!vr) return;
        const meta = m[k];
        const c = varCalcReps(vr, meta);
        const v = c.v, repl = c.repl;
        if (v < 1 || repl > meta * VAR_REPL_MAX || meta - repl < 1) return;
        m[k + '_v'] = v;
        m[k] = Math.max(1, meta - repl);
        info[k] = { id: vr.id, nome: vr.nome, grau: vr.grau, razao: vr.razao, repl, metaOriginal: meta, xpRep: (repl * EXERCICIOS[k].xp * (1 + VAR_BONUS_GRAU[vr.grau])) / v };  // as reps da variação valem EXATAMENTE o volume trocado + bônus do grau
    });
    if (Object.keys(info).length) m.var = info;
}

function xpVariacaoDe(k, valid) {
    const n = (valid || {})[k + '_v'] || 0;
    if (!n) return 0;
    const d = ((hunter.metasCalculadas || {}).var || {})[k];
    return d ? n * d.xpRep : 0;
}

function fadigaDasVariacoes(valid) {
    const info = (hunter.metasCalculadas || {}).var || {};
    return VAR_KEYS.reduce((s, k) => s + ((valid[k + '_v'] || 0) > 0 && info[k] ? info[k].grau : 0), 0);
}

function notaVariacoesDoDia() {
    const info = (hunter.metasCalculadas || {}).var || {};
    const itens = VAR_KEYS.filter(k => info[k]).map(k => {
        const d = info[k];
        return `<b>${d.nome}</b>: ${hunter.metasCalculadas[k + '_v']} reps no lugar de ${d.repl} de ${EXERCICIOS[k].normal} (o resto do volume segue normal)`;
    });
    const dicas = VAR_KEYS.filter(k => info[k]).map(k => (varPorId(info[k].id) || {}).dica).filter(Boolean);
    return `<div class="nota-transicao nota-variacao">🧬 <b>VARIAÇÃO DO DIA:</b> ${itens.join(' • ')}.<br>Faça a variação primeiro, descansado e com técnica limpa. ${dicas.join(' ')} <b>Dor articular = pare e troque pelo normal.</b></div>`;
}

// Depois de cada treino: conta usos e marca quando perguntar "foi confortável?"
function registrarUsoVariacoes(valid) {
    const info = (hunter.metasCalculadas || {}).var || {};
    const st = varEstado();
    let algum = false;
    VAR_KEYS.forEach(k => {
        const d = info[k];
        const meta = hunter.metasCalculadas[k + '_v'];
        if (!d || !meta || (valid[k + '_v'] || 0) < meta * 0.8) return;
        const s = st.v[d.id];
        if (!s) return;
        s.treinos = (s.treinos || 0) + 1;
        s.usos = (s.usos || 0) + 1;
        s.ultimo = obterDataAtual().toISOString();
        if (s.treinos >= 3) { s.pergunta = true; algum = true; }
    });
    return algum;
}

function textoOfertaVariacao(vr) {
    const ini = Math.max(vr.lados, varCalcReps({ ...vr }, (hunter.metasCalculadas || {})[vr.k] || 10).v || 1);
    return `🧬 [NOVA VARIAÇÃO DISPONÍVEL]\n\n${vr.nome} (grau ${vr.grau} de 4)\n\nVocê registrou ${hunter.maximos[vr.k]} ${EXERCICIOS[vr.k].normal} seguidas, então já dá para começar. Ela entraria MISTURADA na semana, trocando ~${Math.round(VAR_SHARE_GRAU[vr.grau] * 100)}% do volume nos dias dela, começando com ${ini} repetições por treino e subindo aos poucos conforme você for bem.\n• XP: +${Math.round(VAR_BONUS_GRAU[vr.grau] * 100)}% por repetição equivalente\n• Proporção usada: ${Math.round(vr.razao * 100)}% do seu máximo normal (${vr.base === 'estudo' ? 'baseada em estudo' : 'estimativa conservadora'})\n• Cansa um pouco mais (+${vr.grau}% de Fadiga)\n\n${vr.dica}\n\nAtivar agora? Você pode pausar quando quiser no painel 🧬 VARIAÇÕES.`;
}

function ativarVariacao(vr) {
    const st = varEstado();
    st.v[vr.id] = { max: varMaxInicial(vr), frac: 0.5, ok: 0, treinos: 0, usos: 0, pergunta: false, desde: obterDataAtual().toISOString() };
    delete st.recusadas[vr.id];
    adicionarMsgChat(`🧬 [VARIAÇÃO ATIVADA]: ${vr.nome}. Ela aparece misturada ao treino da semana, no começo da sessão, começando com ${varRepsAtuais(vr)} reps (sobe aos poucos conforme você for bem).`);
    recalcularMetasDoRank();
    salvarDados();
    carregarEExibirInterface();
}

async function processarVariacoes() {
    if (!hunter.nome || !hunter.variacoes) return;
    const st = varEstado();
    // 1) Feedback ("foi confortável?")
    for (const vr of VARIACOES) {
        const s = st.v[vr.id];
        if (!s || !s.pergunta) continue;
        s.pergunta = false; s.treinos = 0;
        const conf = await confirmarJogo(`🧬 [CHECAGEM DE VARIAÇÃO]\n\n${vr.nome}: as últimas 3 vezes foram CONFORTÁVEIS (técnica limpa, sem dor, sobrando um pouco de fôlego)?\n\nSe sim, o limite sobe ~10%. Se não, ele é reduzido.`, { sim: '[ SIM, FOI CONFORTÁVEL ]', nao: '[ FOI PESADO / DOEU ]' });
        if (conf) {
            s.ok = (s.ok || 0) + 1;
            const antes = varRepsAtuais(vr);
            s.frac = Math.min(1, (s.frac == null ? 0.5 : s.frac) + 0.15);
            const depois = varRepsAtuais(vr);
            if (depois > antes) adicionarMsgChat(`🧬 [VARIAÇÃO]: você foi bem em ${vr.nome}! A quantidade subiu de ${antes} para ${depois} reps nos dias dela.`);
            else adicionarMsgChat(`🧬 [VARIAÇÃO]: você foi bem em ${vr.nome} e já faz a quantidade-alvo (${depois} reps). Aumente o máximo do exercício normal para liberar mais.`);
        } else {
            const dor = await confirmarJogo(`Houve DOR (articulação, punho, ombro, joelho ou lombar), e não só cansaço muscular?`, { sim: '[ SIM, TEVE DOR ]', nao: '[ SÓ FOI PESADO ]' });
            if (dor) {
                s.frac = Math.max(0.3, (s.frac == null ? 0.5 : s.frac) - 0.2);
                const ate = obterDataAtual(); ate.setDate(ate.getDate() + 7);
                st.pausaAte[vr.k] = ate.toISOString();
                adicionarMsgChat(`🩹 [VARIAÇÃO PAUSADA]: as variações de ${EXERCICIOS[vr.k].normal} ficam pausadas por 7 dias e ${vr.nome} volta a ${varRepsAtuais(vr)} reps. Se a dor continuar, procure um profissional de saúde.`);
            } else {
                s.frac = Math.max(0.3, (s.frac == null ? 0.5 : s.frac) - 0.1);
                adicionarMsgChat(`🧬 [VARIAÇÃO]: ${vr.nome} ajustada para ${varRepsAtuais(vr)} reps. Sem pressa: a próxima variação só abre quando esta ficar confortável.`);
            }
        }
        recalcularMetasDoRank();
        salvarDados();
    }
    // 2) Ofertas de novas variações (no máximo 2 por vez)
    let ofertas = 0;
    // o próximo degrau da escada (quem tem pré-requisito) vem antes das alternativas de mesmo nível
    const ordem = VARIACOES.slice().sort((a, b) => (a.req ? 0 : 1) - (b.req ? 0 : 1));
    for (const vr of ordem) {
        if (ofertas >= 2) break;
        if (st.v[vr.id] || varFaltas(vr).length) continue;
        const rec = st.recusadas[vr.id];
        if (rec && diffDias(obterDataAtual(), new Date(rec)) < 14) continue;
        ofertas++;
        const ok = await confirmarJogo(textoOfertaVariacao(vr), { sim: '[ SIM, ATIVAR ]', nao: '[ AGORA NÃO ]' });
        if (ok) ativarVariacao(vr);
        else { st.recusadas[vr.id] = obterDataAtual().toISOString(); salvarDados(); }
    }
    carregarEExibirInterface();
}

/* ---------- Painel 🧬 VARIAÇÕES ---------- */
function abrirVariacoes() {
    const box = document.getElementById('variacoes-corpo');
    if (!box) return;
    const st = varEstado();
    const info = (hunter.metasCalculadas || {}).var || {};
    const partes = [];
    VAR_KEYS.forEach(k => {
        const pausada = varPausada(k);
        const assistido = hunter.capacidade[k] === false;
        const hoje = info[k] ? `<div class="var-hoje">Hoje: <b>${info[k].nome}</b> (${hunter.metasCalculadas[k + '_v']} reps)</div>` : '';
        const dias = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
        const diasTxt = varDiasDe(k).map(d => dias[d]).join(', ');
        const lista = VARIACOES.filter(v => v.k === k).map(vr => {
            const s = st.v[vr.id];
            const faltas = s ? [] : varFaltas(vr);
            let estado, acao = '';
            if (s) estado = `<span class="var-ok">✅ ATIVA — ${varRepsAtuais(vr)} reps (${Math.round((s.frac == null ? 0.5 : s.frac) * 100)}% da carga-alvo) • ${s.usos || 0} treino(s)${varDominada(vr.id) ? ' • dominada ✔' : ''}</span>`;
            else if (!faltas.length) { estado = '<span class="var-disp">🔓 DISPONÍVEL</span>'; acao = `<button type="button" class="btn-sistema btn-sim var-ativar" data-var="${vr.id}">ATIVAR</button>`; }
            else estado = `<span class="var-bloq">🔒 Falta: ${faltas.join('; ')}</span>`;
            return `<div class="var-item">
                <div class="var-topo"><b>${vr.nome}</b><span class="var-grau">grau ${vr.grau} • +${Math.round(VAR_BONUS_GRAU[vr.grau] * 100)}% XP</span></div>
                <div class="var-estado">${estado}</div>
                <div class="desc-item-mini">${Math.round(vr.razao * 100)}% do seu máximo normal • troca ~${Math.round(VAR_SHARE_GRAU[vr.grau] * 100)}% do volume • ${vr.base === 'estudo' ? '📚 proporção de estudo' : '📐 estimativa conservadora'}</div>
                <div class="desc-item-mini">${vr.fonte}</div>
                ${acao}
            </div>`;
        }).join('');
        partes.push(`<div class="var-grupo">
            <h4 class="subtitulo-bloco">${EXERCICIOS[k].icone} ${EXERCICIOS[k].normal}</h4>
            <div class="desc-item-mini">Dias da variação: ${diasTxt} (a variação gira entre as ativas)</div>
            ${assistido ? '<div class="var-bloq">🔒 Variações só liberam depois da transição para o exercício principal.</div>' : ''}
            ${hoje}
            <button type="button" class="btn-sistema ${pausada ? 'btn-sim' : 'btn-nao'} var-pausar" data-ex="${k}" style="width:100%; margin:6px 0;">${pausada ? '▶️ RETOMAR VARIAÇÕES' : '⏸️ PAUSAR VARIAÇÕES (lesão / desconforto)'}</button>
            ${lista}
        </div>`);
    });
    box.innerHTML = partes.join('');
    box.querySelectorAll('.var-ativar').forEach(b => b.addEventListener('click', async () => {
        const vr = varPorId(b.dataset.var);
        if (vr && await confirmarJogo(textoOfertaVariacao(vr), { sim: '[ SIM, ATIVAR ]', nao: '[ CANCELAR ]' })) { ativarVariacao(vr); abrirVariacoes(); }
    }));
    box.querySelectorAll('.var-pausar').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.ex;
        const s2 = varEstado();
        if (varPausada(k)) { s2.pausa[k] = false; s2.pausaAte[k] = null; } else s2.pausa[k] = true;
        hunter.confirmacoesEx[k + '_v'] = false;
        recalcularMetasDoRank();
        salvarDados();
        carregarEExibirInterface();
        abrirVariacoes();
    }));
    document.getElementById('modal-variacoes').classList.remove('escondido');
}

function configurarV33UI() {
    const ab = document.getElementById('btn-abrir-variacoes');
    if (ab) ab.addEventListener('click', abrirVariacoes);
    const fe = document.getElementById('btn-fechar-variacoes');
    if (fe) fe.addEventListener('click', () => document.getElementById('modal-variacoes').classList.add('escondido'));
}

/* V33.1: sombras por Rank (D Kaelor, C Fenryx, B Muralha, A Orvanth, S Vesperia, Soberano Noctaris).
   Nível/missões acompanham a sombra: Muralha 2→3, Fenryx 3→2, Vesperia 4→5, Noctaris 5→6. */
function migrarSombrasPorRank() {
    if (!hunter.nome || hunter.sombrasRankV2) return;
    const mapa = { 2: 3, 3: 2, 4: 5, 5: 6 };
    ['sombrasNivel', 'missoesSombras'].forEach(k => {
        const antigo = hunter[k] || {}, novo = {};
        Object.keys(antigo).forEach(i => { novo[mapa[i] || i] = antigo[i]; });
        hunter[k] = novo;
    });
    hunter.sombrasRankV2 = true;
    if (!hunter.sombrasPendentes) hunter.sombrasPendentes = [];
    const maxR = Math.max(hunter.rankMaximoAlcancado || 0, hunter.rankIndiceAtual || 0);
    // Rank que passou a ter uma sombra nova (Soberano) ou trocou de dono (Orvanth no A) e já foi alcançado: cerimônia de convocação
    [4, 6].forEach(i => { if (maxR >= i && !hunter.sombrasPendentes.includes(i)) hunter.sombrasPendentes.push(i); });
    if (maxR >= 1) setTimeout(() => { try { adicionarMsgChat('🌑 [SOMBRAS POR RANK]: D Kaelor · C Fenryx · B Muralha · A Orvanth · S Vesperia · Soberano Noctaris.'); } catch (e) {} }, 1500);
}

function migrarV33() {
    if (!hunter.nome) return;
    migrarSombrasPorRank();
    varEstado();
    if (!hunter.variacoes.aviso) {
        hunter.variacoes.aviso = true;
        setTimeout(() => { try { adicionarMsgChat('🧬 [VARIAÇÕES]: exercícios mais difíceis (diamante, arqueiro, búlgaro...) agora aparecem MISTURADOS na semana quando seu máximo e seu Rank permitirem, com um pequeno bônus de XP. Veja tudo no painel 🧬 VARIAÇÕES.'); } catch (e) {} }, 2000);
    }
}


/* ---------- V33: enquadramento da cena da Sombra (celular em pé x computador deitado) ---------- */
// Tamanho da arte e a caixa do "assunto" (fração 0-1) que precisa aparecer inteira na tela
const SOMBRAS_CENAS_INFO = {
    kaelor:   { w: 1024, h: 778, x0: 0.22, x1: 0.80, y0: -0.10, y1: 0.98 },
    fenryx:   { w: 1024, h: 572, x0: 0.10, x1: 0.90, y0: -0.05, y1: 0.97 },
    muralha:  { w: 1024, h: 572, x0: 0.26, x1: 0.72, y0: -0.15, y1: 0.97 },
    orvanth:  { w: 1024, h: 572, x0: 0.20, x1: 0.76, y0: -0.15, y1: 0.97 },
    vesperia: { w: 1024, h: 572, x0: 0.15, x1: 0.85, y0: -0.15, y1: 0.95 },
    noctaris: { w: 1024, h: 572, x0: 0.18, x1: 0.82, y0: -0.25, y1: 0.95 }
};
let cenaAtualChave = null;

function ajustarCena() {
    const f = document.getElementById('cena-fundo');
    const b = document.getElementById('cena-fundo-blur');
    const info = cenaAtualChave ? SOMBRAS_CENAS_INFO[cenaAtualChave] : null;
    if (!f) return;
    if (!info) { f.style.cssText = f.style.backgroundImage ? `background-image:${f.style.backgroundImage}` : ''; if (b) b.classList.remove('ativo'); f.classList.remove('fit'); return; }
    const W = window.innerWidth, H = window.innerHeight;
    const cobrir = Math.max(W / info.w, H / info.h);
    const bx = info.x1 - info.x0, by = info.y1 - info.y0;
    // nunca amplia mais que o necessário para cobrir a tela, e reduz o suficiente para mostrar o assunto inteiro
    const esc = Math.min(cobrir, W / (info.w * bx), (H * 0.95) / (info.h * by));
    const iw = info.w * esc, ih = info.h * esc;
    let left = W / 2 - ((info.x0 + info.x1) / 2) * iw;
    let top = H * 0.56 - ((info.y0 + info.y1) / 2) * ih;
    left = iw >= W ? Math.min(0, Math.max(W - iw, left)) : (W - iw) / 2;
    top = ih >= H ? Math.min(0, Math.max(H - ih, top)) : Math.max(0, Math.min(H - ih, H * 0.56 - ih / 2));
    const img = f.style.backgroundImage;
    f.style.cssText = `background-image:${img}; left:${left.toFixed(1)}px; top:${top.toFixed(1)}px; width:${iw.toFixed(1)}px; height:${ih.toFixed(1)}px; background-size:100% 100%;`;
    const sobra = iw < W - 1 || ih < H - 1;
    f.classList.toggle('fit', sobra);
    if (b) b.classList.toggle('ativo', sobra);
}
window.addEventListener('resize', () => { try { if (cenaAtualChave) ajustarCena(); } catch (e) {} });


/* ==========================================================================
   V33.1 BETA — CALIBRAÇÃO INICIAL (obrigatória, 3 dias, sem XP e sem penalidade)
   Cadastro novo: o jogador testa cada exercício, diz como foi (leve / no limite / pesado)
   e o Sistema ajusta a estimativa a cada dia. No fim, a tela "Seu plano" define o treino real.
   ========================================================================== */
const CAL_DIAS = 3;
const CAL_CHAVES = ['flexoes', 'agachamentos', 'abdominais', 'corrida'];
const CAL_MIN_PRINCIPAL = { flexoes: 5, agachamentos: 8, abdominais: 10 }; // abaixo disso, sugere a versão assistida
let calForcaDiaUtil = false; // só a prévia do plano: mostra a meta de um dia útil, mesmo se a calibração terminar num fim de semana
let calTela = null; // 'dia' | 'espera' | 'plano' (para saber se a tela precisa mudar quando o dia vira)

function calibracaoAtiva() { return !!(hunter && hunter.calibracao && hunter.calibracao.ativa); }

function calIniciar() {
    const m = hunter.maximos || {};
    hunter.calibracao = {
        ativa: true, dia: 1, ultimoDiaFeito: null,
        est: { flexoes: m.flexoes, agachamentos: m.agachamentos, abdominais: m.abdominais, corrida: m.corrida },
        hist: { flexoes: [], agachamentos: [], abdominais: [], corrida: [] }
    };
}

function calCasas(k) { return (k === 'corrida' && cardioCfg().casas !== 0) ? 1 : 0; }
function calFmt(k, v) { return calCasas(k) ? Number(v).toFixed(1).replace('.', ',') : String(Math.round(v)); }
function calNum(txt) { const n = parseFloat(String(txt).replace(',', '.')); return Number.isFinite(n) ? n : NaN; }
function calNome(k) {
    if (k === 'corrida') { const c = cardioCfg(); return `${c.icone} ${c.nome}`; }
    return `${EXERCICIOS[k].icone} ${nomeExercicio(k)}`;
}
function calUnidade(k) { return k === 'corrida' ? cardioCfg().unidade : 'repetições'; }
function calPiso(k) { return k === 'corrida' ? (calCasas(k) ? 0.2 : 1) : 1; }
function calTeto(k) { return k === 'corrida' ? (cardioCfg().unidade === 'Km' ? 60 : 600) : 300; }

// Próxima estimativa a partir do alvo do dia, do que foi feito e de como foi a sensação
function calProximaEstimativa(k, alvo, feitas, sens) {
    const dec = calCasas(k), passo = dec ? 0.1 : 1, piso = calPiso(k);
    let v = feitas;
    const completou = feitas >= alvo;
    if (sens === 'leve' && completou) v = feitas * 1.2;
    else if (sens === 'pesado') v = feitas * 0.85;
    v = Math.max(piso, v);
    let out = dec ? Math.round(v * 10) / 10 : Math.round(v);
    if (sens === 'leve' && completou && out <= feitas) out = feitas + passo;
    if (sens === 'pesado' && out >= feitas && feitas > piso) out = feitas - passo;
    out = Math.max(piso, dec ? Math.round(out * 10) / 10 : Math.round(out));
    return Math.min(calTeto(k), out);
}

function calEl(id) { return document.getElementById(id); }

function mostrarCalibracao() {
    const app = calEl('app-principal'); if (app) app.classList.add('escondido');
    const modal = calEl('sistema-modal'); if (modal) modal.style.display = 'none';
    const j = calEl('janela-calibracao'); if (!j) return;
    j.classList.remove('escondido');
    const cal = hunter.calibracao;
    if (cal.dia > CAL_DIAS) return calRenderPlano();
    if (cal.ultimoDiaFeito === obterDataAtual().toDateString()) return calRenderEspera();
    calRenderDia();
}

function calAtualizarSeMudouDia() {
    if (calTela === 'espera') calAtualizarRelogio();
    if (calTela === 'espera' && hunter.calibracao.ultimoDiaFeito !== obterDataAtual().toDateString()) mostrarCalibracao();
}

function calCabecalho(titulo, texto) {
    return `<div class="calib-header">${titulo}</div><p class="calib-texto">${texto}</p>`;
}

function calRenderDia() {
    calTela = 'dia';
    const cal = hunter.calibracao;
    const cards = CAL_CHAVES.map(k => {
        const alvo = cal.est[k];
        const passo = calCasas(k) ? '0.1' : '1';
        return `<div class="calib-card" data-k="${k}" data-sens="limite">
            <div class="calib-titulo">${calNome(k)}</div>
            <div class="calib-alvo">Tente fazer <b>${calFmt(k, alvo)}</b> ${calUnidade(k)}${k === 'corrida' ? '' : ' seguidas'}, com boa técnica.</div>
            <label class="calib-label">Quanto você conseguiu de verdade?
                <input type="number" inputmode="decimal" class="calib-input" id="cal-feitas-${k}" min="0" step="${passo}" value="${calFmt(k, alvo).replace(',', '.')}">
            </label>
            <div class="calib-sensacao">
                <button type="button" class="calib-sens" data-v="leve">😌 Leve</button>
                <button type="button" class="calib-sens sel" data-v="limite">💪 No limite</button>
                <button type="button" class="calib-sens" data-v="pesado">🥵 Pesado</button>
            </div>
        </div>`;
    }).join('');
    calEl('calib-conteudo').innerHTML =
        calCabecalho(`🧪 [CALIBRAÇÃO DO SISTEMA — DIA ${cal.dia} DE ${CAL_DIAS}]`,
            'Este é um treino de teste: <b>não dá XP, não conta streak e não tem penalidade</b>. Faça uma série de cada exercício <b>parando 2 repetições antes de falhar</b>, com técnica limpa, e conte o que conseguiu. Marque como foi: se ficou leve o Sistema sobe a estimativa, se ficou pesado ele diminui.') +
        cards +
        `<button type="button" id="btn-cal-registrar" class="btn-sistema btn-sim calib-btn-principal">[ REGISTRAR DIA ${cal.dia} ]</button>`;
}

function calRenderEspera() {
    calTela = 'espera';
    const cal = hunter.calibracao;
    const dev = (typeof devHtmlCalibracao === 'function') ? devHtmlCalibracao() : '';
    calEl('calib-conteudo').innerHTML =
        calCabecalho('🧪 [CALIBRAÇÃO DO SISTEMA]', `Dia ${cal.dia - 1} de ${CAL_DIAS} registrado! ✅<br>Volte amanhã para o <b>dia ${cal.dia} de ${CAL_DIAS}</b>. O Sistema já ajustou sua estimativa com o que você fez hoje. Descanse e hidrate-se.`) +
        `<div class="calib-relogio">
            <div class="calib-relogio-rotulo">Próximo treino liberado em</div>
            <div class="calib-relogio-tempo" id="cal-contagem">--:--:--</div>
            <div class="calib-relogio-sub">Liberado à meia-noite · agora são <b id="cal-hora-atual">--:--:--</b></div>
        </div>` + dev;
    calAtualizarRelogio();
}

// Relógio da tela de espera: hora atual do jogo + contagem regressiva até a meia-noite (quando o próximo dia de calibração abre)
function calAtualizarRelogio() {
    const elC = calEl('cal-contagem'), elH = calEl('cal-hora-atual');
    if (!elC || !elH) return;
    const agora = obterDataAtual();
    const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0, 0);
    let seg = Math.max(0, Math.ceil((meiaNoite.getTime() - agora.getTime()) / 1000));
    const dois = n => String(n).padStart(2, '0');
    elC.textContent = `${dois(Math.floor(seg / 3600))}:${dois(Math.floor((seg % 3600) / 60))}:${dois(seg % 60)}`;
    elH.textContent = `${dois(agora.getHours())}:${dois(agora.getMinutes())}:${dois(agora.getSeconds())}`;
}

async function calRegistrarDia() {
    const cal = hunter.calibracao;
    const leituras = {};
    for (const k of CAL_CHAVES) {
        const card = document.querySelector(`.calib-card[data-k="${k}"]`);
        const feitas = calNum(calEl('cal-feitas-' + k).value);
        if (!Number.isFinite(feitas) || feitas < 0 || feitas > calTeto(k)) {
            avisarJogo(`⚠️ [SISTEMA]: confira o valor de ${calNome(k).replace(/^\S+\s/, '')}. Digite quanto você conseguiu fazer (use 0 se não fez).`);
            return;
        }
        leituras[k] = { feitas, sens: card.dataset.sens || 'limite' };
    }
    const hoje = obterDataAtual().toDateString();
    const btn = calEl('btn-cal-registrar'); if (btn) btn.disabled = true;
    for (const k of CAL_CHAVES) {
        const alvo = cal.est[k], { feitas, sens } = leituras[k];
        cal.hist[k].push({ dia: cal.dia, alvo, feitas, sens });
        let prox = calProximaEstimativa(k, alvo, feitas, sens);
        // Fez muito pouco do exercício principal: oferece a versão assistida (mais segura)
        if (k !== 'corrida' && hunter.capacidade[k] !== false && prox < CAL_MIN_PRINCIPAL[k]) {
            const sim = await confirmarJogo(`🧪 [CALIBRAÇÃO]\n\nVocê fez poucas repetições de ${EXERCICIOS[k].normal}. Quer trocar para ${EXERCICIOS[k].adaptado}, que é mais seguro para começar?\n\nVocê poderá evoluir para ${EXERCICIOS[k].normal} gradualmente depois.`, { sim: `[ SIM, USAR ${EXERCICIOS[k].adaptado.toUpperCase()} ]`, nao: '[ NÃO, CONTINUAR COM O PRINCIPAL ]' });
            if (sim) { hunter.capacidade[k] = false; prox = Math.max(SUGESTAO_INICIANTE[k], Math.round(prox * 1.3)); }
        } else if (k === 'corrida' && hunter.cardioTipo === 'corrida' && prox < 0.5) {
            const sim = await confirmarJogo(`🧪 [CALIBRAÇÃO]\n\nVocê correu muito pouco. Quer trocar a Corrida por Caminhada, mais segura para começar?\n\nVocê poderá evoluir para a corrida gradualmente depois.`, { sim: '[ SIM, USAR CAMINHADA ]', nao: '[ NÃO, CONTINUAR COM A CORRIDA ]' });
            if (sim) { hunter.capacidade.corrida = false; hunter.cardioTipo = 'caminhada'; prox = SUGESTAO_INICIANTE.caminhada; }
        }
        cal.est[k] = prox;
    }
    cal.dia += 1;
    cal.ultimoDiaFeito = hoje;
    salvarDados();
    mostrarCalibracao();
}

function calSnapshotMetas(maxs, caps) {
    // calcula as metas do início com os valores digitados, sem mexer no jogo de verdade
    const bak = JSON.stringify(hunter);
    let metas = null;
    calForcaDiaUtil = true;
    try {
        hunter.maximos = Object.assign({}, hunter.maximos, maxs);
        hunter.capacidade = Object.assign({}, hunter.capacidade, caps);
        recalcularMetasDoRank();
        metas = Object.assign({}, hunter.metasCalculadas);
    } catch (e) { metas = null; }
    calForcaDiaUtil = false;
    hunter = JSON.parse(bak);
    return metas;
}

function calRenderPlano() {
    calTela = 'plano';
    const cal = hunter.calibracao;
    const linhas = CAL_CHAVES.map(k => {
        const passo = calCasas(k) ? '0.1' : '1';
        const seletor = k === 'corrida' ? '' : `<select class="calib-input calib-sel" id="cal-var-${k}">
                <option value="principal"${hunter.capacidade[k] !== false ? ' selected' : ''}>${EXERCICIOS[k].normal}</option>
                <option value="assistido"${hunter.capacidade[k] === false ? ' selected' : ''}>${EXERCICIOS[k].adaptado}</option></select>`;
        const hist = cal.hist[k].map(h => calFmt(k, h.feitas)).join(' → ');
        return `<div class="calib-card" data-k="${k}">
            <div class="calib-titulo">${k === 'corrida' ? calNome(k) : EXERCICIOS[k].icone + ' ' + EXERCICIOS[k].normal}</div>
            <div class="calib-alvo">Seus 3 dias: ${hist || '—'}</div>
            ${seletor}
            <label class="calib-label">Seu máximo (${calUnidade(k)}${k === 'corrida' ? ' contínuos' : ' seguidas'}):
                <input type="number" inputmode="decimal" class="calib-input" id="cal-max-${k}" min="${calPiso(k)}" step="${passo}" value="${calFmt(k, cal.est[k]).replace(',', '.')}">
            </label>
            <div class="calib-meta" id="cal-meta-${k}"></div>
        </div>`;
    }).join('');
    const leitura = `<div class="calib-card"><div class="calib-titulo">🧠 Leitura</div>
        <label class="calib-label">Páginas por dia (meta de leitura):
        <input type="number" inputmode="numeric" class="calib-input" id="cal-max-leitura" min="1" step="1" value="${hunter.maximos.leitura || 10}"></label></div>`;
    calEl('calib-conteudo').innerHTML =
        calCabecalho('📋 [SEU PLANO DE TREINO]', 'A calibração terminou! Estes são os seus números reais. Ajuste o que quiser: <b>o XP e o Rank passam a contar a partir de amanhã</b>, quando começa a verdadeira jornada. Na dúvida, escolha o número menor; o Sistema reavalia você a cada <b>2 semanas</b>.' + (calAmanhaEhFds() ? '<br><br>📅 <b>Atenção:</b> amanhã é fim de semana, então o Sistema vai mostrar metas <b>50% menores</b> nesse dia. Elas voltam ao normal na segunda-feira.' : '')) +
        linhas + leitura +
        `<button type="button" id="btn-cal-comecar" class="btn-sistema btn-sim calib-btn-principal">[ CONFIRMAR PLANO ]</button>`;
    calAtualizarPrevia();
}

function calLerPlano() {
    const maxs = {}, caps = {};
    for (const k of CAL_CHAVES) {
        const v = calNum(calEl('cal-max-' + k).value);
        if (!Number.isFinite(v) || v < calPiso(k) || v > calTeto(k)) return null;
        maxs[k] = calCasas(k) ? Math.round(v * 10) / 10 : Math.round(v);
        if (k !== 'corrida') caps[k] = calEl('cal-var-' + k).value !== 'assistido';
    }
    const l = calNum(calEl('cal-max-leitura').value);
    if (!Number.isFinite(l) || l < 1 || l > 500) return null;
    maxs.leitura = Math.round(l);
    return { maxs, caps };
}

function calAtualizarPrevia() {
    const plano = calLerPlano();
    CAL_CHAVES.forEach(k => {
        const el = calEl('cal-meta-' + k); if (!el) return;
        const m = plano ? calSnapshotMetas(plano.maxs, plano.caps) : null;
        el.innerText = m ? `Meta de treino num dia útil: ${calFmt(k, m[k])} ${calUnidade(k)}` : '';
    });
}

function calConcluir() {
    const plano = calLerPlano();
    if (!plano) { avisarJogo('⚠️ [SISTEMA]: confira os números do plano. Todos precisam ser valores válidos maiores que zero.'); return; }
    const cal = hunter.calibracao;
    hunter.maximos = Object.assign({}, hunter.maximos, plano.maxs);
    hunter.capacidade = Object.assign({}, hunter.capacidade, plano.caps);
    cal.ativa = false;
    cal.concluida = true;
    const agora = obterDataAtual();
    cal.fim = agora.toISOString();
    hunter.ultimaRecalibracao = agora.toISOString(); // a reavaliação (a cada 2 semanas) conta a partir do plano
    hunter.ultimoDiaConcluido = agora.toDateString(); // o jogo começa hoje: nenhum dia da calibração conta como perdido
    hunter.diariaConcluida = true; // hoje o jogador já treinou (teste): a jornada de verdade começa amanhã e hoje não conta como dia perdido
    cal.fimDia = agora.toDateString();
    const msgAmanha = calMensagemAmanha();
    recalcularMetasDoRank();
    salvarDados();
    calTela = null;
    calEl('janela-calibracao').classList.add('escondido');
    calEl('app-principal').classList.remove('escondido');
    carregarEExibirInterface();
    adicionarMsgChat('🧪 [CALIBRAÇÃO CONCLUÍDA]: seu plano está definido! A verdadeira jornada começa amanhã: a partir de lá o XP, o Rank e o Streak contam. A reavaliação acontece a cada 2 semanas.');
    avisarJogo(textoAvisoDoSistema()); // as janelas entram em fila: primeiro o aviso do Sistema, depois "a jornada começa amanhã"
    avisarJogo(msgAmanha);
}

// Aviso de boas-vindas: o Sistema está aqui para ajudar, mas a evolução depende da vontade do jogador
function textoAvisoDoSistema() {
    return '🤝 [O SISTEMA ESTÁ AQUI PARA TE AJUDAR]\n\n' +
        'Antes de começar, um aviso importante: o Sistema não existe para te punir. Ele existe para caminhar com você.\n\n' +
        'A vida acontece: cansaço, correria, dor, trabalho, dias ruins. Por isso você sempre pode relatar um imprevisto, como "estava muito pesado", "não tive tempo" ou usar um Soro de Recuperação, e o Sistema ajusta o caminho junto com você.\n\n' +
        'Mas lembre-se: nenhuma regra, item ou justificativa treina por você. A sua evolução depende da sua vontade de crescer. O Sistema abre o caminho; quem dá os passos é você.\n\n' +
        'Respeite o seu corpo. Se sentir dor ou algo estranho, pare e procure um profissional de saúde. Boa jornada!';
}

// Amanhã (no relógio do jogo) cai no fim de semana?
function calAmanhaEhFds() {
    const a = obterDataAtual(); a.setDate(a.getDate() + 1);
    return a.getDay() === 0 || a.getDay() === 6;
}
function calMensagemAmanha() {
    let t = '🌅 [A VERDADEIRA JORNADA COMEÇA AMANHÃ]\n\nVocê já treinou hoje na calibração, então hoje não há Missão Diária. A partir de amanhã o XP, o Rank, o Streak e as penalidades passam a valer.';
    if (calAmanhaEhFds()) t += '\n\n📅 Amanhã é fim de semana: o Sistema reduz as metas em 50% aos sábados e domingos para você descansar e se recuperar. Por isso os números vão parecer menores. Na segunda-feira elas voltam ao normal.';
    return t;
}

document.addEventListener('click', (e) => {
    const t = e.target.closest ? e.target.closest('button') : null;
    if (!t) return;
    if (t.classList.contains('calib-sens')) {
        const card = t.closest('.calib-card');
        card.dataset.sens = t.dataset.v;
        card.querySelectorAll('.calib-sens').forEach(b => b.classList.toggle('sel', b === t));
    } else if (t.id === 'btn-cal-registrar') calRegistrarDia();
    else if (t.id === 'btn-cal-comecar') calConcluir();
});
document.addEventListener('input', (e) => { if (e.target && e.target.closest && e.target.closest('#janela-calibracao') && calTela === 'plano') calAtualizarPrevia(); });
document.addEventListener('change', (e) => { if (e.target && e.target.closest && e.target.closest('#janela-calibracao') && calTela === 'plano') calAtualizarPrevia(); });