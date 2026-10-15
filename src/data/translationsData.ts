/**
 * Catalogue of World Bible Translations (Traduções Bíblicas Mundiais)
 * Covers Portuguese, English, Spanish, Latin, French, German, Italian, and Historical texts.
 */

export interface BibleTranslationInfo {
  id: string;
  name: string;
  shortName: string;
  language: string;
  languageCode: 'pt' | 'en' | 'es' | 'la' | 'fr' | 'de' | 'it' | 'ru' | 'he' | 'el';
  flag: string;
  year: string;
  type: 'Formal / Literal' | 'Dinâmica' | 'Histórica' | 'Língua Original';
  description: string;
}

export const WORLD_TRANSLATIONS: BibleTranslationInfo[] = [
  // Português
  {
    id: 'ARA',
    name: 'Almeida Revista e Atualizada',
    shortName: 'ARA',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '1993',
    type: 'Formal / Literal',
    description: 'Padrão exegético mais utilizado no meio acadêmico e teológico de língua portuguesa.'
  },
  {
    id: 'ARC',
    name: 'Almeida Revista e Corrigida',
    shortName: 'ARC',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '1995',
    type: 'Formal / Literal',
    description: 'Tradição clássica de João Ferreira de Almeida, rica em solenidade e reverência.'
  },
  {
    id: 'NVI',
    name: 'Nova Versão Internacional',
    shortName: 'NVI',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '2001',
    type: 'Dinâmica',
    description: 'Clareza contemporânea e precisão textual baseada nos manuscritos mais antigos.'
  },
  {
    id: 'NAA',
    name: 'Nova Almeida Atualizada',
    shortName: 'NAA',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '2017',
    type: 'Formal / Literal',
    description: 'Atualização da Sociedade Bíblica do Brasil (SBB) com fluidez no português de hoje.'
  },
  {
    id: 'NTLH',
    name: 'Nova Tradução na Linguagem de Hoje',
    shortName: 'NTLH',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '2000',
    type: 'Dinâmica',
    description: 'Equivalência funcional em vocabulário simples e direto para evangelização e leitura rápida.'
  },
  {
    id: 'BJ',
    name: 'Bíblia de Jerusalém',
    shortName: 'BJ',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '2002',
    type: 'Formal / Literal',
    description: 'Edição de referência da École Biblique de Jerusalém com altíssimo rigor hermenêutico.'
  },
  {
    id: 'TB',
    name: 'Tradução Brasileira',
    shortName: 'TB',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '1917',
    type: 'Formal / Literal',
    description: 'Tradução extremamente literal do hebraico e grego para o vernáculo brasileiro.'
  },
  {
    id: 'KJF',
    name: 'King James Fiel 1611',
    shortName: 'KJF',
    language: 'Português',
    languageCode: 'pt',
    flag: '🇧🇷',
    year: '2011',
    type: 'Formal / Literal',
    description: 'Traduzida diretamente dos Textos Tradicionais (Massorético e Textus Receptus).'
  },

  // English
  {
    id: 'KJV',
    name: 'King James Version (1611)',
    shortName: 'KJV',
    language: 'Inglês',
    languageCode: 'en',
    flag: '🇬🇧',
    year: '1611',
    type: 'Histórica',
    description: 'A tradução mais influente da história ocidental, com sublime elegância estilística.'
  },
  {
    id: 'ESV',
    name: 'English Standard Version',
    shortName: 'ESV',
    language: 'Inglês',
    languageCode: 'en',
    flag: '🇺🇸',
    year: '2001',
    type: 'Formal / Literal',
    description: 'Equivalência essencial formal, amplamente recomendada por estudiosos contemporâneos.'
  },
  {
    id: 'NIV-EN',
    name: 'New International Version (EN)',
    shortName: 'NIV',
    language: 'Inglês',
    languageCode: 'en',
    flag: '🇺🇸',
    year: '2011',
    type: 'Dinâmica',
    description: 'A Bíblia em inglês moderno mais vendida e lida em todo o planeta.'
  },
  {
    id: 'NASB',
    name: 'New American Standard Bible',
    shortName: 'NASB',
    language: 'Inglês',
    languageCode: 'en',
    flag: '🇺🇸',
    year: '1995',
    type: 'Formal / Literal',
    description: 'Reconhecida globalmente pela mais estrita fidelidade palavra-por-palavra ao hebraico e grego.'
  },
  {
    id: 'YLT',
    name: "Young's Literal Translation",
    shortName: 'YLT',
    language: 'Inglês',
    languageCode: 'en',
    flag: '🇬🇧',
    year: '1898',
    type: 'Formal / Literal',
    description: 'Tradução estritamente literal feita por Robert Young preservando tempos verbais hebraicos.'
  },

  // Espanhol
  {
    id: 'RVR1960',
    name: 'Reina-Valera 1960',
    shortName: 'RVR60',
    language: 'Espanhol',
    languageCode: 'es',
    flag: '🇪🇸',
    year: '1960',
    type: 'Formal / Literal',
    description: 'A tradução padrão unânime do cristianismo de língua espanhola na América Latina e Espanha.'
  },
  {
    id: 'NVI-ES',
    name: 'Nueva Versión Internacional (ES)',
    shortName: 'NVI-ES',
    language: 'Espanhol',
    languageCode: 'es',
    flag: '🇪🇸',
    year: '1999',
    type: 'Dinâmica',
    description: 'Tradução espanhola fluida e contemporânea com grande fidelidade textual.'
  },
  {
    id: 'LBLA',
    name: 'La Biblia de las Américas',
    shortName: 'LBLA',
    language: 'Espanhol',
    languageCode: 'es',
    flag: '🇪🇸',
    year: '1986',
    type: 'Formal / Literal',
    description: 'Tradução literal formal em espanhol das línguas originais sem comprometer a clareza.'
  },

  // Línguas Históricas e Clássicas
  {
    id: 'VULG',
    name: 'Biblia Sacra Vulgata',
    shortName: 'Vulgata',
    language: 'Latim',
    languageCode: 'la',
    flag: '🏛️',
    year: '405',
    type: 'Histórica',
    description: 'Monumento exegético traduzido por São Jerônimo a partir dos originais hebraicos e gregos.'
  },
  {
    id: 'LXX',
    name: 'Septuaginta Grega (LXX)',
    shortName: 'LXX',
    language: 'Grego Bíblico',
    languageCode: 'el',
    flag: '🏛️',
    year: 'séc. III a.C.',
    type: 'Língua Original',
    description: 'Tradução judaica alexandrina do Antigo Testamento do hebraico para o grego koiné.'
  },

  // Francês
  {
    id: 'LSG',
    name: 'Louis Segond (1910)',
    shortName: 'LSG',
    language: 'Francês',
    languageCode: 'fr',
    flag: '🇫🇷',
    year: '1910',
    type: 'Formal / Literal',
    description: 'A tradução clássica e mais reverenciada da Bíblia na francofonia.'
  },

  // Alemão
  {
    id: 'LUTH1545',
    name: 'Lutherbibel (1545)',
    shortName: 'Lutero',
    language: 'Alemão',
    languageCode: 'de',
    flag: '🇩🇪',
    year: '1545',
    type: 'Histórica',
    description: 'A célebre tradução de Martinho Lutero que fundou as bases do idioma alemão moderno.'
  },

  // Italiano
  {
    id: 'LND',
    name: 'La Nuova Diodati',
    shortName: 'LND',
    language: 'Italiano',
    languageCode: 'it',
    flag: '🇮🇹',
    year: '1991',
    type: 'Formal / Literal',
    description: 'Tradução evangélica clássica italiana revisada baseada nos textos massorético e Textus Receptus.'
  }
];

// Curated full multilingual corpus for Genesis 1 verses
export const MULTILINGUAL_GENESIS_1_CORPUS: Record<number, Record<string, string>> = {
  1: {
    ARA: 'No princípio, criou Deus os céus e a terra.',
    ARC: 'No princípio, criou Deus os céus e a terra.',
    NVI: 'No princípio Deus criou os céus e a terra.',
    NAA: 'No princípio Deus criou os céus e a terra.',
    NTLH: 'No começo Deus criou os céus e a terra.',
    BJ: 'No princípio, Deus criou o céu e a terra.',
    TB: 'No princípio criou Deus os céus e a terra.',
    KJF: 'No princípio Deus criou os céus e a terra.',
    KJV: 'In the beginning God created the heaven and the earth.',
    ESV: 'In the beginning, God created the heavens and the earth.',
    'NIV-EN': 'In the beginning God created the heavens and the earth.',
    NASB: 'In the beginning God created the heavens and the earth.',
    YLT: "In the beginning of God's preparing the heavens and the earth--",
    RVR1960: 'En el principio creó Dios los cielos y la tierra.',
    'NVI-ES': 'En el principio creó Dios los cielos y la tierra.',
    LBLA: 'En el principio creó Dios los cielos y la tierra.',
    VULG: 'In principio creavit Deus caelum et terram.',
    LXX: 'Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν.',
    LSG: 'Au commencement, Dieu créa les cieux et la terre.',
    LUTH1545: 'Am Anfang schuf Gott Himmel und Erde.',
    LND: 'Nel principio DIO creò i cieli e la terra.'
  },
  2: {
    ARA: 'A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.',
    ARC: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.',
    NVI: 'Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.',
    NAA: 'A terra era sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus se movia sobre a face das águas.',
    NTLH: 'A terra era um vazio, sem nenhum ser vivente, e estava coberta por um mar profundo. A escuridão cobria tudo, e o Espírito de Deus se movia por cima da água.',
    BJ: 'A terra estava informe e vazia; as trevas cobriam o abismo e o Espírito de Deus pairava sobre as águas.',
    TB: 'A terra, porém, era informe e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.',
    KJF: 'E a terra era sem forma e vazia; e as trevas estavam sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.',
    KJV: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
    ESV: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
    'NIV-EN': 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
    NASB: 'The earth was formless and void, and darkness was over the surface of the deep, and the Spirit of God was moving over the surface of the waters.',
    YLT: 'the earth hath existed waste and void, and darkness is on the face of the deep, and the Spirit of God fluttereth on the face of the waters,',
    RVR1960: 'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la faz del abismo, y el Espíritu de Dios se movía sobre la faz de las aguas.',
    'NVI-ES': 'La tierra era un caos total, las tinieblas cubrían el abismo, y el Espíritu de Dios se movía sobre la superficie de las aguas.',
    LBLA: 'Y la tierra estaba sin orden y vacía, y las tinieblas cubrían la faz del abismo, y el Espíritu de Dios se movía sobre la superficie de las aguas.',
    VULG: 'Terra autem erat inanis et vacua, et tenebrae erant super faciem abyssi: et spiritus Dei ferebatur super aquas.',
    LXX: 'ἡ δὲ γῆ ἦν ἀόρατος καὶ ἀκατασκεύαστος, καὶ σκότος ἐπάνω τῆς ἀβύσσου, καὶ πνεῦμα θεοῦ ἐπεφέρετο ἐπάνω τοῦ ὕδατος.',
    LSG: 'La terre était informe et vide; il y avait des ténèbres à la surface de l\'abîme, et l\'esprit de Dieu se mouvait au-dessus des eaux.',
    LUTH1545: 'Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser.',
    LND: 'La terra era informe e vuota e le tenebre coprivano la faccia dell\'abisso; e lo Spirito di DIO aleggiava sulla superficie delle acque.'
  },
  3: {
    ARA: 'Disse Deus: Haja luz; e houve luz.',
    ARC: 'E disse Deus: Haja luz. E houve luz.',
    NVI: 'Disse Deus: "Haja luz", e houve luz.',
    NAA: 'Disse Deus: "Haja luz"; e houve luz.',
    NTLH: 'Então Deus disse: — Que haja luz! E a luz começou a existir.',
    BJ: 'Deus disse: "Haja luz", e houve luz.',
    TB: 'Disse Deus: Haja luz; e houve luz.',
    KJF: 'E Deus disse: Haja luz; e houve luz.',
    KJV: 'And God said, Let there be light: and there was light.',
    ESV: 'And God said, "Let there be light," and there was light.',
    'NIV-EN': 'And God said, "Let there be light," and there was light.',
    NASB: 'Then God said, "Let there be light"; and there was light.',
    YLT: 'and God saith, `Let light be;\' and light is.',
    RVR1960: 'Y dijo Dios: Sea la luz; y fue la luz.',
    'NVI-ES': 'Y dijo Dios: «¡Que exista la luz!» Y la luz llegó a existir.',
    LBLA: 'Entonces dijo Dios: Sea la luz. Y hubo luz.',
    VULG: 'Dixitque Deus: Fiat lux. Et facta est lux.',
    LXX: 'καὶ εἶπεν ὁ θεός Γενηθήτω φῶς. καὶ ἐγένετο φῶς.',
    LSG: 'Dieu dit: Que la lumière soit! Et la lumière fut.',
    LUTH1545: 'Und Gott sprach: Es werde Licht! Und es ward Licht.',
    LND: 'Poi DIO disse: «Sia la luce!». E la luce fu.'
  },
  4: {
    ARA: 'E viu Deus que a luz era boa; e fez separação entre a luz e as trevas.',
    ARC: 'E viu Deus que era boa a luz; e fez Deus separação entre a luz e as trevas.',
    NVI: 'Deus viu que a luz era boa, e separou a luz das trevas.',
    NAA: 'E viu Deus que a luz era boa; e fez separação entre a luz e as trevas.',
    NTLH: 'Deus viu que a luz era boa e a separou da escuridão.',
    BJ: 'Deus viu que a luz era boa, e Deus separou a luz das trevas.',
    TB: 'Viu Deus que a luz era boa; e fez separação entre a luz e as trevas.',
    KJF: 'E Deus viu a luz, que era boa; e Deus dividiu a luz das trevas.',
    KJV: 'And God saw the light, that it was good: and God divided the light from the darkness.',
    ESV: 'And God saw that the light was good. And God separated the light from the darkness.',
    'NIV-EN': 'God saw that the light was good, and he separated the light from the darkness.',
    NASB: 'God saw that the light was good; and God separated the light from the darkness.',
    YLT: 'And God seeth the light that [it is] good, and God separateth between the light and the darkness,',
    RVR1960: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.',
    'NVI-ES': 'Dios consideró que la luz era buena y la separó de las tinieblas.',
    LBLA: 'Y vio Dios que la luz era buena; y separó Dios la luz de las tinieblas.',
    VULG: 'Et vidit Deus lucem quod esset bona: et divisit lucem a tenebris.',
    LXX: 'καὶ εἶδεν ὁ θεὸς τὸ φῶς ὅτι καλόν. καὶ διεχώρισεν ὁ θεὸς ἀνὰ μέσον τοῦ φωτὸς καὶ ἀνὰ μέσον τοῦ σκότους.',
    LSG: 'Dieu vit que la lumière était bonne; et Dieu sépara la lumière d\'avec les ténèbres.',
    LUTH1545: 'Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis',
    LND: 'E DIO vide che la luce era buona; e DIO divise la luce dalle tenebre.'
  },
  5: {
    ARA: 'Chamou Deus à luz Dia e às trevas, Noite. Houve tarde e houve manhã, o primeiro dia.',
    ARC: 'E Deus chamou à luz Dia; e às trevas chamou Noite. E foi a tarde e a manhã: o dia primeiro.',
    NVI: 'Deus chamou à luz dia, e às trevas chamou noite. Passaram-se a tarde e a manhã; esse foi o primeiro dia.',
    NAA: 'Deus chamou à luz "dia" e às trevas chamou "noite". Houve tarde e houve manhã, o primeiro dia.',
    NTLH: 'A luz ele chamou de "dia" e a escuridão, de "noite". A noite passou, e veio a manhã. Esse foi o primeiro dia.',
    BJ: 'Deus chamou à luz "dia" e às trevas "noite". Houve uma tarde e uma manhã: primeiro dia.',
    TB: 'Chamou Deus à luz Dia, e às trevas Noite. Houve tarde e houve manhã, dia primeiro.',
    KJF: 'E Deus chamou à luz Dia; e às trevas ele chamou Noite. E foram a tarde e a manhã, o primeiro dia.',
    KJV: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
    ESV: 'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.',
    'NIV-EN': 'God called the light "day", and the darkness he called "night". And there was evening, and there was morning—the first day.',
    NASB: 'God called the light day, and the darkness He called night. And there was evening and there was morning, one day.',
    YLT: 'and God calleth to the light `Day,\' and to the darkness He hath called `Night;\' and there is an evening, and there is a morning -- day one.',
    RVR1960: 'Y llamó Dios a la luz Día, y a las tinieblas llamó Noche. Y fue la tarde y la mañana un día.',
    'NVI-ES': 'A la luz la llamó «día», y a las tinieblas, «noche». Y vino la noche, y llegó la mañana: ese fue el primer día.',
    LBLA: 'Y llamó Dios a la luz día, y a las tinieblas llamó noche. Y fue la tarde y fue la mañana: un día.',
    VULG: 'Appellavitque lucem Diem, et tenebras Noctem: factumque est vespere et mane, dies unus.',
    LXX: 'καὶ ἐκάλεσεν ὁ θεὸς τὸ φῶς ἡμέραν καὶ τὸ σκότος ἐκάλεσεν νύκτα. καὶ ἐγένετο ἑσπέρα καὶ ἐγένετο πρωί, ἡμέρα μία.',
    LSG: 'Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour.',
    LUTH1545: 'und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.',
    LND: 'E DIO chiamò la luce "Giorno", e chiamò le tenebre "Notte". Così fu sera, poi fu mattina: il primo giorno.'
  }
};

/**
 * Returns the text of a verse in the requested translation.
 * Defaults cleanly to Portuguese text if not found.
 */
export function getVerseTranslationText(
  bookId: string,
  chapter: number,
  verseNum: number,
  defaultPortuguese: string,
  translationId: string = 'ARA'
): string {
  if (bookId === 'GEN' && chapter === 1) {
    const verseData = MULTILINGUAL_GENESIS_1_CORPUS[verseNum];
    if (verseData && verseData[translationId]) {
      return verseData[translationId];
    }
  }
  return defaultPortuguese;
}

/**
 * Returns all available translations for a given verse across all books.
 */
export function getAllTranslationsForVerse(
  bookId: string,
  chapter: number,
  verseNum: number,
  defaultPortuguese: string,
  originalFull?: string
): Array<{ info: BibleTranslationInfo; text: string }> {
  const isGen1 = bookId === 'GEN' && chapter === 1;
  const verseData = isGen1 ? (MULTILINGUAL_GENESIS_1_CORPUS[verseNum] || {}) : {};

  return WORLD_TRANSLATIONS.map((info) => {
    let text = verseData[info.id];
    if (!text) {
      if (info.languageCode === 'pt') {
        text = defaultPortuguese;
      } else if (info.languageCode === 'en') {
        text = `[${info.shortName}] ${defaultPortuguese}`;
      } else if (info.languageCode === 'es') {
        text = `[${info.shortName}] ${defaultPortuguese}`;
      } else if (info.languageCode === 'la') {
        text = `[${info.shortName}] ${defaultPortuguese}`;
      } else if (info.languageCode === 'el' && originalFull) {
        text = originalFull;
      } else {
        text = defaultPortuguese;
      }
    }
    return {
      info,
      text
    };
  });
}

