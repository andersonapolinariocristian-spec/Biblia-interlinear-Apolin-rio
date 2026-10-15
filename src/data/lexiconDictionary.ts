export interface LexiconEntry {
  strong: string;
  original: string;
  transliteration: string;
  language: 'hebrew' | 'greek';
  partOfSpeech: string;
  definition: string;
  theologicalUsage: string;
  occurrences: number;
  root: string;
  cognates?: string[];
}

export const THEOLOGICAL_LEXICON: Record<string, LexiconEntry> = {
  // ================= HEBRAICO =================
  'H7225': {
    strong: 'H7225',
    original: 'רֵאשִׁית',
    transliteration: 'reshít',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Princípio, primícias, ראש (rosh = cabeça/cume), o melhor ou primeiro de uma série temporal ou hierárquica.',
    theologicalUsage: 'Em Gn 1:1, בְּרֵאשִׁית indica o ponto de partida do tempo e da matéria quando Deus chamou à existência todas as coisas. Também denota a oferta das primícias (Lv 23:10) consagradas a Yahweh.',
    occurrences: 51,
    root: 'רֹאשׁ (rosh)',
    cognates: ['H7218 (rosh)', 'H7223 (rishon)']
  },
  'H1254': {
    strong: 'H1254',
    original: 'בָּרָא',
    transliteration: 'bará',
    language: 'hebrew',
    partOfSpeech: 'Verbo (Tronco Qal)',
    definition: 'Criar, formar, moldar por ato soberano exclusivo de Deus.',
    theologicalUsage: 'No Antigo Testamento hebraico, o sujeito de בָּרָא é EXCLUSIVAMENTE Deus (Elohim). Nenhum homem ou anjo pode fazer o que bara descreve: trazer à existência o que antes não existia (criatio ex nihilo).',
    occurrences: 54,
    root: 'ב-ר-א',
    cognates: ['H1255 (Berochah)']
  },
  'H430': {
    strong: 'H430',
    original: 'אֱלֹהִים',
    transliteration: 'Elohím',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Masculino Plural Majestático',
    definition: 'Deus, Juiz supremo, Divindade Todo-Poderosa.',
    theologicalUsage: 'Plural quantitativo de intensidade ou majestade (Pluralis Majestatis). Embora gramaticalmente no plural (-im), rege verbos e adjetivos no singular em contextos monoteístas bíblicos (como בָּרָא em Gn 1:1), apontando para a plenitude inesgotável da divindade.',
    occurrences: 2606,
    root: 'אֵל (El / Eloah)',
    cognates: ['H410 (El)', 'H433 (Eloah)']
  },
  'H3068': {
    strong: 'H3068',
    original: 'יְהוָה',
    transliteration: 'Adonái (YHWH / Tetragrama)',
    language: 'hebrew',
    partOfSpeech: 'Nome Próprio Divino Inefável',
    definition: 'O Deus da Aliança, Aquele que É eternamente, o Todo-Suficiente que Se auto-revelou a Moisés na sarça ardente.',
    theologicalUsage: 'Proveniente da raiz הוה/היה (ser, existir). Expressa fidelidade indelével à aliança com Seu povo. Na tradição judaica e leitura bíblica piedosa, é lido reverentemente como "Adonai" (meu Senhor) ou "HaShem" (O Nome).',
    occurrences: 6828,
    root: 'הָיָה (hayah - ser/existir)',
    cognates: ['H1961 (hayah)', 'H3050 (Yah)']
  },
  'H7307': {
    strong: 'H7307',
    original: 'רוּחַ',
    transliteration: 'rúach',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Feminino / Masculino',
    definition: 'Sopro, vento, respiração vital, espírito humano ou o Espírito de Deus (Ruach Elohim / Ruach HaKodesh).',
    theologicalUsage: 'Em Gn 1:2, o Ruach paira sobre as águas gerando vida e ordem. É o Espírito regenerador profetizado em Ezequiel 37 (vale de ossos secos) e derramado em Joel 2.',
    occurrences: 378,
    root: 'ר-ו-ח',
    cognates: ['H7306 (ruach - cheiro suave)']
  },
  'H7965': {
    strong: 'H7965',
    original: 'שָׁלוֹם',
    transliteration: 'shalóm',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Paz, plenitude, integridade, bem-estar holístico, harmonia e reconciliação com Deus.',
    theologicalUsage: 'Muito além da ausência de conflito militar, shalom denota o florescimento humano integral sob a bênção e a justiça divina. Cumprido na profecia do Príncipe da Paz (Sar Shalom - Is 9:6) e na cruz de Isaías 53:5.',
    occurrences: 237,
    root: 'שָׁלֵם (shalem - ser completo/restituído)',
    cognates: ['H8003 (shalem)', 'H8002 (shelem)']
  },
  'H2617': {
    strong: 'H2617',
    original: 'חֶסֶד',
    transliteration: 'chésed',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Graça leal, misericórdia pactual, amor fiel e imutável que nunca falha.',
    theologicalUsage: 'Termo central da aliança bíblica. Chesed é o amor perseverante com o qual Deus Se compromete inabalavelmente com o Seu povo mesmo diante de suas falhas (Sl 136: "porque a sua benignidade dura para sempre").',
    occurrences: 249,
    root: 'ח-ס-ד',
    cognates: ['H2623 (chasid - piedoso)']
  },
  'H8064': {
    strong: 'H8064',
    original: 'שָׁמַיִם',
    transliteration: 'shamáyim',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Masculino Plural Dual',
    definition: 'Céus, firmamento, abóbada celeste, a morada visível dos astros e a habitação de Deus.',
    theologicalUsage: 'Representa a totalidade das esferas celestes criadas por Deus em Gn 1:1. Na teologia bíblica, o céu dos céus proclama a glória do Altíssimo (Sl 19:1) e é a sede de Seu trono celestial (Sl 103:19).',
    occurrences: 421,
    root: 'שָׁמַיִם',
    cognates: ['H8065 (shemayin)']
  },
  'H776': {
    strong: 'H776',
    original: 'אֶרֶץ',
    transliteration: 'érets',
    language: 'hebrew',
    partOfSpeech: 'Substantivo Feminino Singular',
    definition: 'Terra, o planeta habitável, o solo fértil ou uma região/nação específica.',
    theologicalUsage: 'Em conjunto com hashamayim (os céus), forma o merismo hebraico para designar todo o universo criado. É o palco da redenção e da aliança divina dada a Abraão (Gn 12) e que será renovada em novos céus e nova terra (Is 65:17; Ap 21:1).',
    occurrences: 2504,
    root: 'אֶרֶץ',
    cognates: ['H778 (ara)']
  },
  'H853': {
    strong: 'H853',
    original: 'אֵת',
    transliteration: '\'et',
    language: 'hebrew',
    partOfSpeech: 'Partícula de Objeto Direto Definido',
    definition: 'Partícula gramatical hebraica sem tradução direta que marca o acusativo (objeto direto definido).',
    theologicalUsage: 'Sinal distintivo do hebraico bíblico. Em Gn 1:1, precede os céus e a terra, indicando que foram objetos diretos e específicos da soberana ação criadora de Deus.',
    occurrences: 7302,
    root: 'אֵת'
  },

  // ================= GREGO =================
  'G3056': {
    strong: 'G3056',
    original: 'λόγος',
    transliteration: 'lógos',
    language: 'greek',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Palavra, discurso, razão divina, o Verbo encarnado.',
    theologicalUsage: 'João toma o conceito de Logos conhecido pelos filósofos gregos (a ordem racional do universo) e pelos judeus (o Dabar Yahweh / Memra) e o personaliza em Jesus Cristo: o Deus vivo, preexistente e feito homem (Jo 1:1,14; 1Jo 1:1; Ap 19:13).',
    occurrences: 330,
    root: 'λέγω (lego - falar, declarar)',
    cognates: ['G3004 (lego)', 'G3049 (logizomai)']
  },
  'G26': {
    strong: 'G26',
    original: 'ἀγάπη',
    transliteration: 'agápē',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Amor sacrificial, desinteressado, incondicional e transcendente.',
    theologicalUsage: 'Distinto de philos (amizade) ou eros (desejo), agape é o amor que brota da própria natureza de Deus (1Jo 4:8: "Deus é amor"). É demonstrado soberanamente na morte de Cristo pelo pecador (Jo 3:16; Rm 5:8; 1Co 13).',
    occurrences: 116,
    root: 'ἀγαπάω (agapao)',
    cognates: ['G25 (agapao)', 'G27 (agapetos)']
  },
  'G5485': {
    strong: 'G5485',
    original: 'χάρις',
    transliteration: 'cháris',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Graça, favor imerecido, generosidade salvífica de Deus, beleza espiritual e dom soberano.',
    theologicalUsage: 'A causa motriz da salvação no Novo Testamento (Ef 2:8: "Pela graça sois salvos, por meio da fé"). Em Cristo, a graça de Deus se manifestou trazendo salvação a todos os homens (Tt 2:11).',
    occurrences: 156,
    root: 'χαίρω (chairo - alegrar-se)',
    cognates: ['G5463 (chairo)', 'G5486 (charisma)']
  },
  'G4102': {
    strong: 'G4102',
    original: 'πίστις',
    transliteration: 'pístis',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Fé, convicção firme, confiança irrestrita e fidelidade salvífica.',
    theologicalUsage: 'Não é mero assentimento intelectual, mas entrega resoluta da vida a Cristo e dependência total de Sua obra expiatória (Rm 1:17; Hb 11:1). Produz fidelidade e boas obras consequentes.',
    occurrences: 243,
    root: 'πείθω (peitho - convencer, persuadir)',
    cognates: ['G4100 (pisteuo)', 'G4103 (pistos)']
  },
  'G4151': {
    strong: 'G4151',
    original: 'πνεῦμα',
    transliteration: 'pneúma',
    language: 'greek',
    partOfSpeech: 'Substantivo Neutro',
    definition: 'Espírito, sopro de vento, vida incorpórea, o Espírito Santo (Pneuma Hagion).',
    theologicalUsage: 'Terceira Pessoa da Trindade que regenera, batiza, habita, santifica e sela o crente para o dia da redenção (Jo 14:26; Rm 8:9-16; Gl 5:22).',
    occurrences: 379,
    root: 'πνέω (pneo - soprar)',
    cognates: ['G4152 (pneumatikos)', 'G4154 (pneo)']
  },
  'G2316': {
    strong: 'G2316',
    original: 'θεός',
    transliteration: 'theós',
    language: 'greek',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Deus, a Divindade Suprema, Criador e Sustentador do universo.',
    theologicalUsage: 'Utilizado no Novo Testamento tanto para o Pai celestial quanto para o Filho, Jesus Cristo (Jo 1:1,18; Jo 20:28; Tt 2:13; Hb 1:8), atestando Sua plena deidade consubstancial.',
    occurrences: 1317,
    root: 'θεός',
    cognates: ['G2304 (theios)', 'G2320 (theotes)']
  },
  'G0602': {
    strong: 'G0602',
    original: 'ἀποκάλυψις',
    transliteration: 'apokálypsis',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Revelação divina, desvendamento ou remoção de véu sobre mistérios sagrados antes ocultos.',
    theologicalUsage: 'Em Ap 1:1, designa o desvelamento sobrenatural da Pessoa e dos triunfos escatológicos de Jesus Cristo. Não significa catástrofe, mas a manifestação luminosa da vitória final de Deus e do Cordeiro.',
    occurrences: 18,
    root: 'ἀποκαλύπτω (apokalypto: tirar o véu)',
    cognates: ['G0601 (apokalypto)', 'G2572 (kalypto)']
  },
  'G2424': {
    strong: 'G2424',
    original: 'Ἰησοῦς',
    transliteration: 'Iēsoús',
    language: 'greek',
    partOfSpeech: 'Nome Próprio Divino',
    definition: 'Jesus, o Salvador encarnado do mundo (equivalente grego do hebraico Yeshua/Yehoshua).',
    theologicalUsage: 'Significa "Yahweh é Salvação" (Mt 1:21). No Apocalipse, Jesus é a testemunha fiel, o Cordeiro imolado no centro do trono e o Rei dos reis triunfante.',
    occurrences: 917,
    root: 'H3091 (Yehoshua / Yeshua)',
    cognates: ['G2424']
  },
  'G5547': {
    strong: 'G5547',
    original: 'Χριστός',
    transliteration: 'Christós',
    language: 'greek',
    partOfSpeech: 'Título Messiânico / Nome Próprio',
    definition: 'Cristo, o Ungido (tradução do hebraico Mashiach / Messias).',
    theologicalUsage: 'Consagrado pelo Espírito Santo para a tríplice função de Profeta supremo, Sumo Sacerdote celestial e Rei eterno que regerá todas as nações.',
    occurrences: 529,
    root: 'χρίω (chrio: ungir com óleo santo)',
    cognates: ['G5548 (chrio)', 'G5545 (chrisma)']
  },
  'G1163': {
    strong: 'G1163',
    original: 'δεῖ',
    transliteration: 'dei',
    language: 'greek',
    partOfSpeech: 'Verbo Impessoal',
    definition: 'É necessário, convém, determinação compulsória por decreto divino.',
    theologicalUsage: 'Expressa a necessidade irrevogável dos planos proféticos e da soberana vontade salvífica de Deus (Ap 1:1; 4:1; 22:6). Nada frustra o conselho do Todo-Poderoso.',
    occurrences: 101,
    root: 'δέω (deo: atar, ligar)',
    cognates: ['G1163 (dei)', 'G1210 (deo)']
  },
  'G1166': {
    strong: 'G1166',
    original: 'δείκνυμι',
    transliteration: 'deíknymi',
    language: 'greek',
    partOfSpeech: 'Verbo Transitivo',
    definition: 'Mostrar, exibir claramente aos olhos, demonstrar mediante evidências concretas.',
    theologicalUsage: 'Usado para as visões proféticas concedidas pelo Pai ao Filho e deste aos Seus servos para desvendar os eventos que hão de sobrevir.',
    occurrences: 33,
    root: 'δείκνυμι',
    cognates: ['G1167 (deigma)', 'G1168 (deigmatizo)']
  },
  'G1325': {
    strong: 'G1325',
    original: 'δίδωμι',
    transliteration: 'dídōmi',
    language: 'greek',
    partOfSpeech: 'Verbo Transitivo',
    definition: 'Dar, conceder por graça, outorgar livre e soberanamente.',
    theologicalUsage: 'Enfatiza que a revelação e a vida eterna são dádivas imerecidas do amor do Pai mediante Seu Filho.',
    occurrences: 415,
    root: 'δίδωμι',
    cognates: ['G1394 (dosis)', 'G1435 (doron)']
  },
  'G1401': {
    strong: 'G1401',
    original: 'δοῦλος',
    transliteration: 'doúlos',
    language: 'greek',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Servo, escravo voluntário inteiramente consagrado à vontade do seu Senhor.',
    theologicalUsage: 'Título de honra suprema usado pelos apóstolos e profetas bíblicos (como João em Ap 1:1), expressando submissão alegre à soberania de Cristo.',
    occurrences: 124,
    root: 'δέω (deo: estar atado por amor e lealdade)',
    cognates: ['G1398 (douleuo)', 'G1397 (douleia)']
  },
  'G2491': {
    strong: 'G2491',
    original: 'Ἰωάννης',
    transliteration: 'Iōánnēs',
    language: 'greek',
    partOfSpeech: 'Nome Próprio',
    definition: 'João (hebraico Yohanan = Deus é gracioso e compassivo).',
    theologicalUsage: 'O discípulo a quem Jesus amava, autor do quarto Evangelho, das três epístolas joaninas e do livro da Revelação na ilha de Patmos.',
    occurrences: 135,
    root: 'H3076 (Yohanan)',
    cognates: ['G2491']
  },
  'G3107': {
    strong: 'G3107',
    original: 'μακάριος',
    transliteration: 'makários',
    language: 'greek',
    partOfSpeech: 'Adjetivo Masculino',
    definition: 'Bem-aventurado, supremamente feliz e participante da graça de Deus.',
    theologicalUsage: 'Abre as sete bem-aventuranças proféticas do Apocalipse (Ap 1:3; 14:13; 16:15; 19:9; 20:6; 22:7; 22:14), prometendo bênção aos que leem, ouvem e guardam a Palavra.',
    occurrences: 50,
    root: 'μακάριος',
    cognates: ['G3106 (makarizo)', 'G3108 (makarismos)']
  },
  'G4394': {
    strong: 'G4394',
    original: 'προφητεία',
    transliteration: 'prophēteía',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Profecia, mensagem inspirada procedente do Espírito de Deus.',
    theologicalUsage: 'No Apocalipse (1:3; 19:10; 22:7), designa a mensagem profética autêntica que proclama o testemunho de Jesus ("o testemunho de Jesus é o espírito de profecia").',
    occurrences: 19,
    root: 'πρό (pro: antes/diante) + φημί (phemi: falar)',
    cognates: ['G4395 (propheteuo)', 'G4396 (prophetes)']
  },
  'G5083': {
    strong: 'G5083',
    original: 'τηρέω',
    transliteration: 'tēréō',
    language: 'greek',
    partOfSpeech: 'Verbo Transitivo',
    definition: 'Guardar com diligência, observar fielmente, preservar contra desvios.',
    theologicalUsage: 'Descreve a guarda perseverante dos mandamentos de Deus e da fé em Jesus (Ap 14:12), fidelidade exigida dos santos no tempo do fim.',
    occurrences: 70,
    root: 'τηρός (guarda/vigilância)',
    cognates: ['G5084 (teresis)']
  },
  'G1577': {
    strong: 'G1577',
    original: 'ἐκκλησία',
    transliteration: 'ekklēsía',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Igreja, congregação ou assembleia dos chamados por Deus para fora do mundo.',
    theologicalUsage: 'A comunidade redimida de Cristo (as 7 igrejas da Ásia em Ap 1-3) chamada à fidelidade doutrinária e comunhão com seu Noivo celestial.',
    occurrences: 114,
    root: 'ἐκ (ek: para fora) + καλέω (kaleo: chamar)',
    cognates: ['G2564 (kaleo)', 'G2821 (klesis)']
  },
  'G2362': {
    strong: 'G2362',
    original: 'θρόνος',
    transliteration: 'thrónos',
    language: 'greek',
    partOfSpeech: 'Substantivo Masculino',
    definition: 'Trono soberano, assento régio da majestade divina no santuário celeste.',
    theologicalUsage: 'Símbolo central do governo e do juízo de Deus no Apocalipse (mencionado mais de 40 vezes), atestando que Deus reina no cosmos mesmo quando os poderes terrenos se rebelam.',
    occurrences: 62,
    root: 'θρόνος',
    cognates: ['G2362']
  },
  'G4416': {
    strong: 'G4416',
    original: 'πρωτότοκος',
    transliteration: 'prōtótokos',
    language: 'greek',
    partOfSpeech: 'Adjetivo Masculino',
    definition: 'Primogênito, detentor dos direitos de primogenitura, preeminência e soberania.',
    theologicalUsage: 'Em Ap 1:5 ("primogênito dos mortos") e Cl 1:15-18, denota a primazia triunfal de Cristo sobre a morte e a ressurreição, garantindo a redenção de todos os salvos.',
    occurrences: 8,
    root: 'πρῶτος (protos: primeiro) + τίκτω (tikto: dar à luz)',
    cognates: ['G4413 (protos)']
  },
  'G3507': {
    strong: 'G3507',
    original: 'νεφέλη',
    transliteration: 'nephélē',
    language: 'greek',
    partOfSpeech: 'Substantivo Feminino',
    definition: 'Nuvem celestial, veículo glorioso da presença de Deus.',
    theologicalUsage: 'Em Ap 1:7 ("Eis que vem com as nuvens"), evoca Dn 7:13 e Mt 24:30: o regresso visível, literal e majestoso de Jesus nas nuvens celestiais de anjos.',
    occurrences: 25,
    root: 'νέφος (nephos: grande massa de nuvem)',
    cognates: ['G3509 (nephos)']
  }
};
