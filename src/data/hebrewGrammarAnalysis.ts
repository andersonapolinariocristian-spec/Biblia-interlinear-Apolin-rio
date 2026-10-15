/**
 * Hebrew Linguistic Breakdown & Nikkud Analysis Utility
 * Deconstructs biblical Hebrew words into letter tokens, vowels, and masoretic accents.
 */

export interface MasoreticSign {
  char: string;
  name: string;
  category: 'consonant' | 'vowel' | 'diacritic' | 'cantillation';
  sound: string;
  description: string;
}

export interface HebrewLetterSegment {
  raw: string; // The full grapheme cluster (e.g. בְּ or רֵ or שִׁ)
  baseConsonant: string; // e.g. ב
  consonantName: string; // e.g. Bet
  transliteration: string; // e.g. b
  vowels: string[]; // e.g. [Sheva, Dagesh]
  vowelNames: string[]; // e.g. ["Sheva (vogal neutra/semivogal)", "Dagesh (ponto forte)"]
  phoneticBreakdown: string; // e.g. "Bet com Dagesh e Sheva = Be"
}

// Map of Hebrew consonant unicode points to names and info
const CONSONANT_MAP: Record<string, { name: string; translit: string; sound: string }> = {
  '\u05D0': { name: 'Alef (א)', translit: 'ʾ', sound: 'Consoante laríngea suave (muda com vogal)' },
  '\u05D1': { name: 'Bet / Vet (ב)', translit: 'b/v', sound: 'Com Dagesh: B oclusivo. Sem Dagesh: V fricativo' },
  '\u05D2': { name: 'Gimel (ג)', translit: 'g', sound: 'G sonoro como em "glória"' },
  '\u05D3': { name: 'Dalet (ד)', translit: 'd', sound: 'D dental como em "Deus"' },
  '\u05D4': { name: 'He (ה)', translit: 'h', sound: 'H aspirado como em "house"' },
  '\u05D5': { name: 'Vav (ו)', translit: 'v/o/u', sound: 'V consonantal ou suporte para vogais Holam/Shuruk' },
  '\u05D6': { name: 'Zayin (ז)', translit: 'z', sound: 'Z sonoro como em "zebra"' },
  '\u05D7': { name: 'Chet (ח)', translit: 'ḥ', sound: 'Gutural rascante forte no fundo da garganta' },
  '\u05D8': { name: 'Tet (ט)', translit: 'ṭ', sound: 'T enfático velarizado' },
  '\u05D9': { name: 'Yod (י)', translit: 'y/i', sound: 'Semivogal Y ou suporte para vogal I longa' },
  '\u05DA': { name: 'Kaf Sofit (ך)', translit: 'kh', sound: 'Kaf em posição final com som gutural Kh' },
  '\u05DB': { name: 'Kaf (כ)', translit: 'k/kh', sound: 'Com dagesh: K forte. Sem dagesh: Kh suave' },
  '\u05DC': { name: 'Lamed (ל)', translit: 'l', sound: 'L alveolar suave como em "luz"' },
  '\u05DD': { name: 'Mem Sofit (ם)', translit: 'm', sound: 'Mem em posição final de palavra' },
  '\u05DE': { name: 'Mem (מ)', translit: 'm', sound: 'M bilabial como em "mãe"' },
  '\u05DF': { name: 'Nun Sofit (ן)', translit: 'n', sound: 'Nun em posição final de palavra' },
  '\u05E0': { name: 'Nun (נ)', translit: 'n', sound: 'N nasal como em "navio"' },
  '\u05E1': { name: 'Samekh (ס)', translit: 's', sound: 'S sibilante puro como em "santo"' },
  '\u05E2': { name: 'Ayin (ע)', translit: 'ʿ', sound: 'Constrição faríngea profunda laríngea' },
  '\u05E3': { name: 'Pe Sofit (ף)', translit: 'f', sound: 'Pe em posição final com som F' },
  '\u05E4': { name: 'Pe / Fe (פ)', translit: 'p/f', sound: 'Com dagesh: P. Sem dagesh: F' },
  '\u05E5': { name: 'Tsadi Sofit (ץ)', translit: 'ts', sound: 'Tsadi em posição final' },
  '\u05E6': { name: 'Tsadi (צ)', translit: 'ts', sound: 'Ts sibilante enfático como "pizza"' },
  '\u05E7': { name: 'Qof (ק)', translit: 'q', sound: 'Q velar posterior profundo' },
  '\u05E8': { name: 'Resh (ר)', translit: 'r', sound: 'R alveolar sonoro como em "rei"' },
  '\u05E9': { name: 'Shin / Sin (ש)', translit: 'sh/s', sound: 'Com ponto à direita: Sh ("chá"). À esquerda: S' },
  '\u05EA': { name: 'Tav (ת)', translit: 't', sound: 'T firme, última letra do alfabeto' }
};

// Map of Hebrew Nikkud (Masoretic vowel points)
const NIKKUD_MAP: Record<string, { name: string; sound: string; description: string }> = {
  '\u05B0': { name: 'Sheva (ְ)', sound: 'e breve / semivogal muda', description: 'Ponto vertical duplo que indica semivogal ou pausa silenciosa (quiescente)' },
  '\u05B1': { name: 'Hataf Segol (ֱ)', sound: 'e ultrabreve', description: 'Vogal composta ultrabreve sob guturais' },
  '\u05B2': { name: 'Hataf Patach (ֲ)', sound: 'a ultrabreve', description: 'Patach reduzido ultrabreve' },
  '\u05B3': { name: 'Hataf Qamats (ֳ)', sound: 'o ultrabreve', description: 'Qamats reduzido ultrabreve' },
  '\u05B4': { name: 'Hiriq (ִ)', sound: 'i (como em "vida")', description: 'Ponto único sob a letra indicando vogal I' },
  '\u05B5': { name: 'Tsere (ֵ)', sound: 'ê (como em "mesa")', description: 'Dois pontos horizontais indicando E longo' },
  '\u05B6': { name: 'Segol (ֶ)', sound: 'é (como em "pé")', description: 'Três pontos em triângulo indicando E breve aberto' },
  '\u05B7': { name: 'Patach (ַ)', sound: 'a breve (como em "paz")', description: 'Traço horizontal simples sob a letra' },
  '\u05B8': { name: 'Qamats (ָ)', sound: 'a longo ou o (como em "mar")', description: 'Sinal em forma de T sob a letra' },
  '\u05B9': { name: 'Holam (ֹ)', sound: 'ô (como em "sol")', description: 'Ponto superior esquerdo indicando vogal O longa' },
  '\u05BA': { name: 'Holam Haser (ֺ)', sound: 'o', description: 'Holam defectivo' },
  '\u05BB': { name: 'Kubuts (ֻ)', sound: 'u (como em "luz")', description: 'Três pontos diagonais sob a letra indicando vogal U' },
  '\u05BC': { name: 'Dagesh / Mappiq (ּ)', sound: 'duplicação ou endurecimento', description: 'Ponto no centro da letra (Dagesh lene endurece B, K, P; Dagesh forte duplica)' },
  '\u05BD': { name: 'Meteg (ֽ)', sound: 'pausa métrica', description: 'Traço vertical indicando ênfase secundária' },
  '\u05BF': { name: 'Rafe (ֿ)', sound: 'suavizador', description: 'Traço superior indicando ausência de Dagesh' },
  '\u05C1': { name: 'Ponto de Shin (ׁ)', sound: 'sh', description: 'Ponto no topo direito da letra Shin' },
  '\u05C2': { name: 'Ponto de Sin (ׂ)', sound: 's', description: 'Ponto no topo esquerdo da letra Sin' }
};

/**
 * Segments a Hebrew word into didactic syllables / graphemes (Consonant + its Nikkud).
 * Preserves the exact characters and masoretic points.
 */
export function segmentHebrewWord(hebrewWord: string): HebrewLetterSegment[] {
  if (!hebrewWord) return [];

  // Remove cantillation marks that are non-essential for didactic reading, or keep all
  // Unicode Hebrew range: 0590-05FF
  const segments: HebrewLetterSegment[] = [];

  // Use Intl.Segmenter with grapheme granularity if available
  let graphemeList: string[] = [];
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    const segmenter = new (Intl as any).Segmenter('he', { granularity: 'grapheme' });
    graphemeList = Array.from(segmenter.segment(hebrewWord)).map((s: any) => s.segment);
  } else {
    // Regex fallback for grapheme clusters (consonant followed by combining marks)
    const matches = hebrewWord.match(/[\u05D0-\u05EA][\u0591-\u05C7]*/g);
    graphemeList = matches || hebrewWord.split('');
  }

  for (const grapheme of graphemeList) {
    // Extract base consonant
    let baseConsonant = '';
    const vowels: string[] = [];
    const vowelNames: string[] = [];

    for (const char of grapheme) {
      if (CONSONANT_MAP[char]) {
        baseConsonant = char;
      } else if (NIKKUD_MAP[char]) {
        vowels.push(char);
        vowelNames.push(NIKKUD_MAP[char].name);
      }
    }

    if (!baseConsonant && grapheme.trim().length > 0) {
      // Punctuation like Maqaf (־) or Sof Pasuq (׃)
      baseConsonant = grapheme;
    }

    const consonantInfo = CONSONANT_MAP[baseConsonant] || {
      name: baseConsonant,
      translit: baseConsonant,
      sound: 'Caractere especial massorético'
    };

    let phoneticBreakdown = consonantInfo.name;
    if (vowelNames.length > 0) {
      phoneticBreakdown += ` com ${vowelNames.join(' e ')}`;
    }

    segments.push({
      raw: grapheme,
      baseConsonant: baseConsonant || grapheme,
      consonantName: consonantInfo.name,
      transliteration: consonantInfo.translit,
      vowels,
      vowelNames,
      phoneticBreakdown
    });
  }

  return segments;
}

/**
 * Returns plain consonant string (without Nikkud)
 */
export function stripHebrewNikkud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '');
}

/**
 * Returns list of pure consonants from a Hebrew word
 */
export function getHebrewConsonants(text: string): string[] {
  const pure = stripHebrewNikkud(text);
  return pure.split('').filter((c) => /[\u05D0-\u05EA]/.test(c));
}
