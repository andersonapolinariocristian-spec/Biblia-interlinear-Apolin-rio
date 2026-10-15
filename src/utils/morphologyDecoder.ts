/**
 * Biblical Morphology Decoder (Greek Robinson/Gramcord & Hebrew Stems)
 * Converts technical grammatical tags (e.g. "N- (----GSM-)", "V- (3AAI-S--)", "V-Qal-Pf-3ms")
 * into clear, pedagogical Portuguese explanations for theological study.
 */

export interface MorphologySegment {
  code: string;
  category: string;
  name: string;
  description: string;
}

export interface DecodedMorphology {
  raw: string;
  technicalCode: string;
  summary: string;
  partOfSpeech: string;
  detailedText: string;
  segments: MorphologySegment[];
  isGreek: boolean;
  isHebrew: boolean;
}

// Greek Part of Speech Map
const GREEK_POS: Record<string, { name: string; desc: string }> = {
  'N': { name: 'Substantivo', desc: 'Nome que designa pessoas, lugares, coisas, entidades ou conceitos.' },
  'V': { name: 'Verbo', desc: 'Palavra que expressa ação, processo, estado ou existência.' },
  'A': { name: 'Adjetivo', desc: 'Qualifica ou restringe o substantivo em gênero, número e caso.' },
  'RA': { name: 'Artigo Definido', desc: 'Artigo grego (ὁ, ἡ, τό = o, a). Identifica e particulariza seres ou ideias.' },
  'RP': { name: 'Pronome Pessoal', desc: 'Substitui ou enfatiza a pessoa do discurso (eu, tu, ele, nós, vós, eles).' },
  'RD': { name: 'Pronome Demonstrativo', desc: 'Aponta posição no espaço, tempo ou discurso (este, aquele, esse).' },
  'RR': { name: 'Pronome Relativo', desc: 'Introduz oração adjetiva conectando termos (o qual, que, quem).' },
  'RI': { name: 'Pronome Interrogativo / Indefinido', desc: 'Indica pergunta (quem? qual?) ou generalização (alguém, certo).' },
  'RC': { name: 'Pronome Recíproco', desc: 'Expressa ação mútua entre sujeitos (uns aos outros).' },
  'C': { name: 'Conjunção', desc: 'Liga orações ou palavras de mesma função sintática (e, mas, porque, portanto).' },
  'P': { name: 'Preposição', desc: 'Estabelece relação espacial, temporal ou lógica entre termos (em, de, com, para).' },
  'D': { name: 'Advérbio', desc: 'Modifica um verbo, adjetivo ou outro advérbio (bem, não, já, onde).' },
  'I': { name: 'Interjeição', desc: 'Expressa emoção súbita, exaltação ou apelo.' },
  'X': { name: 'Partícula', desc: 'Partícula de ênfase, reforço ou condicionalidade.' },
  'Q': { name: 'Correlativo', desc: 'Expressa relação mútua ou proporcional.' }
};

// Greek Cases
const GREEK_CASES: Record<string, { name: string; desc: string }> = {
  'N': { name: 'Nominativo', desc: 'Caso do Sujeito da oração ou do predicativo do sujeito.' },
  'V': { name: 'Vocativo', desc: 'Caso de invocação, clamor ou chamamento direto ("Ó Senhor!").' },
  'A': { name: 'Acusativo', desc: 'Caso do Objeto Direto (termo sobre o qual recai a ação do verbo).' },
  'G': { name: 'Genitivo', desc: 'Caso de posse, origem, descendência ou relação ("de...", "filho de...").' },
  'D': { name: 'Dativo', desc: 'Caso do Objeto Indireto, causa ou instrumento ("a...", "para...", "por meio de...").' }
};

// Greek Numbers
const GREEK_NUMBERS: Record<string, { name: string; desc: string }> = {
  'S': { name: 'Singular', desc: 'Refere-se a uma única entidade ou indivíduo.' },
  'P': { name: 'Plural', desc: 'Refere-se a mais de uma entidade ou grupo de indivíduos.' }
};

// Greek Genders
const GREEK_GENDERS: Record<string, { name: string; desc: string }> = {
  'M': { name: 'Masculino', desc: 'Gênero gramatical masculino.' },
  'F': { name: 'Feminino', desc: 'Gênero gramatical feminino.' },
  'N': { name: 'Neutro', desc: 'Gênero gramatical neutro (característico do grego e latim).' }
};

// Greek Verb Tenses
const GREEK_TENSES: Record<string, { name: string; desc: string }> = {
  'P': { name: 'Presente', desc: 'Ação contínua, habitual ou em andamento no tempo presente.' },
  'I': { name: 'Imperfeito', desc: 'Ação contínua, repetitiva ou inacabada no passado.' },
  'F': { name: 'Futuro', desc: 'Ação que ocorrerá em tempo futuro.' },
  'A': { name: 'Aoristo', desc: 'Ação pontual, histórica ou consumada no passado (o tempo mais comum da narrativa bíblica).' },
  'R': { name: 'Perfeito', desc: 'Ação completada no passado cujos efeitos permanecem vivos no presente.' },
  'L': { name: 'Mais-que-perfeito', desc: 'Ação já concluída antes de outro evento passado.' }
};

// Greek Verb Voices
const GREEK_VOICES: Record<string, { name: string; desc: string }> = {
  'A': { name: 'Voz Ativa', desc: 'O sujeito pratica a ação expressa pelo verbo.' },
  'M': { name: 'Voz Média', desc: 'O sujeito pratica a ação com reflexo ou interesse direto em si mesmo.' },
  'P': { name: 'Voz Passiva', desc: 'O sujeito recebe ou sofre a ação praticada por outro agente.' }
};

// Greek Verb Moods
const GREEK_MOODS: Record<string, { name: string; desc: string }> = {
  'I': { name: 'Indicativo', desc: 'Modo da realidade objetiva e certeza (afirmação de fato real histórico).' },
  'S': { name: 'Subjuntivo', desc: 'Modo da probabilidade, desejo, propósito ou incerteza ("se", "para que").' },
  'O': { name: 'Optativo', desc: 'Modo do desejo piedoso ou aspiração solene ("queira Deus que...").' },
  'D': { name: 'Imperativo', desc: 'Modo de ordem, mandamento, exortação ou súplica reverente.' },
  'N': { name: 'Infinitivo', desc: 'Forma nominal do verbo que expressa a ação pura sem pessoa ("gerar", "amar").' },
  'P': { name: 'Particípio', desc: 'Verbo em função de adjetivo, descrevendo circunstância ("gerando", "tendo ido").' }
};

// Greek Persons
const GREEK_PERSONS: Record<string, { name: string; desc: string }> = {
  '1': { name: '1ª Pessoa', desc: 'A pessoa que fala (Eu / Nós).' },
  '2': { name: '2ª Pessoa', desc: 'A pessoa com quem se fala (Tu / Vós / Você).' },
  '3': { name: '3ª Pessoa', desc: 'A pessoa ou ser de quem se fala (Ele / Ela / Eles).' }
};

// Hebrew Verb Stems
const HEBREW_STEMS: Record<string, { name: string; desc: string }> = {
  'Qal': { name: 'Qal (Simples Ativo)', desc: 'Tronco básico que expressa ação simples direta.' },
  'Niphal': { name: 'Niphal (Simples Passivo/Reflexivo)', desc: 'Ação passiva ou reflexiva simples.' },
  'Piel': { name: 'Piel (Intensivo Ativo)', desc: 'Ação intensa, iterativa ou causativa com energia reforçada.' },
  'Pual': { name: 'Pual (Intensivo Passivo)', desc: 'Passivo do tronco intensivo Piel.' },
  'Hiphil': { name: 'Hiphil (Causativo Ativo)', desc: 'Fazer outro agir ou causar a ação ("fazer reinar", "fazer nascer").' },
  'Hophal': { name: 'Hophal (Causativo Passivo)', desc: 'Ser levado a praticar ou receber a causa.' },
  'Hithpael': { name: 'Hithpael (Intensivo Reflexivo)', desc: 'Ação intensiva voltada sobre o próprio sujeito.' }
};

// English Grammatical Parts of Speech from BDB / Strong's
const ENGLISH_POS_MAP: Record<string, { summary: string; technical: string; desc: string; category: string }> = {
  'masculine noun': { summary: 'Substantivo Masculino', technical: 'Subst. Masc.', desc: 'Substantivo do gênero masculino no hebraico e grego.', category: 'Classe Gramatical' },
  'feminine noun': { summary: 'Substantivo Feminino', technical: 'Subst. Fem.', desc: 'Substantivo do gênero feminino no hebraico e grego.', category: 'Classe Gramatical' },
  'proper noun': { summary: 'Nome Próprio (Onomástico)', technical: 'Nome Próprio', desc: 'Nome de pessoa, tribo, família ou patriarca bíblico.', category: 'Classe Gramatical' },
  'proper name': { summary: 'Nome Próprio', technical: 'Nome Próprio', desc: 'Nome próprio de indivíduo ou patriarca bíblico.', category: 'Classe Gramatical' },
  'proper locative noun': { summary: 'Nome Próprio de Lugar (Topônimo)', technical: 'Topônimo', desc: 'Nome geográfico de cidade, monte, rio, vale ou região.', category: 'Classe Gramatical' },
  'verb': { summary: 'Verbo', technical: 'Verbo', desc: 'Expressa ação, processo, estado ou existência.', category: 'Classe Gramatical' },
  'adjective': { summary: 'Adjetivo', technical: 'Adjetivo', desc: 'Qualifica ou caracteriza o substantivo.', category: 'Classe Gramatical' },
  'preposition': { summary: 'Preposição', technical: 'Preposição', desc: 'Estabelece relação sintática entre termos.', category: 'Classe Gramatical' },
  'conjunction': { summary: 'Conjunção', technical: 'Conjunção', desc: 'Conecta orações ou palavras da mesma função.', category: 'Classe Gramatical' },
  'particle': { summary: 'Partícula Gramatical', technical: 'Partícula', desc: 'Elemento gramatical invariável (ex: marcador de objeto direto).', category: 'Classe Gramatical' },
  'pronoun': { summary: 'Pronome', technical: 'Pronome', desc: 'Substitui ou acompanha o substantivo.', category: 'Classe Gramatical' },
  'personal pronoun': { summary: 'Pronome Pessoal', technical: 'Pron. Pess.', desc: 'Designa as pessoas do discurso.', category: 'Classe Gramatical' },
  'demonstrative pronoun': { summary: 'Pronome Demonstrativo', technical: 'Pron. Dem.', desc: 'Indica proximidade no espaço, tempo ou discurso.', category: 'Classe Gramatical' },
  'relative pronoun': { summary: 'Pronome Relativo', technical: 'Pron. Rel.', desc: 'Introduz oração subordinada adjetiva.', category: 'Classe Gramatical' },
  'interrogative pronoun': { summary: 'Pronome Interrogativo', technical: 'Pron. Interr.', desc: 'Indica uma pergunta.', category: 'Classe Gramatical' },
  'adverb': { summary: 'Advérbio', technical: 'Advérbio', desc: 'Modifica um verbo, adjetivo ou outro advérbio.', category: 'Classe Gramatical' },
  'interjection': { summary: 'Interjeição', technical: 'Interjeição', desc: 'Expressa emoção súbita ou invocação.', category: 'Classe Gramatical' }
};

/**
 * Main morphology decoder entrypoint
 */
export function decodeMorphology(rawMorphology: string): DecodedMorphology {
  const raw = (rawMorphology || '').trim();
  if (!raw) {
    return {
      raw: '',
      technicalCode: 'Geral',
      summary: 'Forma Gramatical Padrão',
      partOfSpeech: 'Termo Bíblico',
      detailedText: 'Registro gramatical nos textos originais sagrados.',
      segments: [],
      isGreek: false,
      isHebrew: false
    };
  }

  // Check if Hebrew format (contains "Prep", "Subst", "Qal", "Pf", "Impf", or Hebrew letters)
  if (
    /Qal|Niphal|Piel|Pual|Hiphil|Hophal|Hithpael|Prep|Subst|Adj|V-/i.test(raw) && 
    !/\([A-Z0-9-]{4,10}\)/.test(raw)
  ) {
    return decodeHebrewMorphology(raw);
  }

  // Check if Greek Robinson/Gramcord format (e.g. "N- (----GSM-)", "V- (3AAI-S--)", "RA (----ASM-)")
  const greekMatch = raw.match(/^([A-Z]{1,2})-?\s*\(([^)]+)\)/i);
  if (greekMatch) {
    return decodeGreekRobinson(raw, greekMatch[1].toUpperCase(), greekMatch[2]);
  }

  // Check English terminology (e.g. "masculine noun", "proper locative noun", "verb", "particle")
  const lower = raw.toLowerCase().trim();
  if (ENGLISH_POS_MAP[lower]) {
    const item = ENGLISH_POS_MAP[lower];
    return {
      raw,
      technicalCode: item.technical,
      summary: item.summary,
      partOfSpeech: item.summary,
      detailedText: `• ${item.category}: ${item.summary} (${item.desc})`,
      segments: [
        {
          code: item.technical,
          category: item.category,
          name: item.summary,
          description: item.desc
        }
      ],
      isGreek: false,
      isHebrew: true
    };
  }

  // Clean raw Portuguese / simple strings
  return decodeGeneralMorphology(raw);
}

/**
 * Decodes Greek Robinson / Gramcord Morphological codes
 * Example: "N- (----GSM-)" -> Substantivo • Genitivo Singular Masculino
 * Example: "V- (3AAI-S--)" -> Verbo • Aoristo Ativo Indicativo • 3ª Pessoa Singular
 */
function decodeGreekRobinson(raw: string, posCode: string, innerCode: string): DecodedMorphology {
  const cleanInner = innerCode.replace(/-/g, '');
  const segments: MorphologySegment[] = [];

  // 1. Part of Speech
  const posInfo = GREEK_POS[posCode] || GREEK_POS[posCode[0]] || { name: 'Termo Gramatical', desc: 'Classe gramatical grega.' };
  segments.push({
    code: posCode,
    category: 'Classe Gramatical',
    name: posInfo.name,
    description: posInfo.desc
  });

  let technicalShort = posCode;
  const summaryParts: string[] = [posInfo.name];

  // 2. Verb parsing (if posCode is 'V')
  if (posCode === 'V') {
    // Inner usually: 3AAI-S (Person, Tense, Voice, Mood, Number) or PP-NSM (Participle)
    // Check if starts with person digit 1, 2, 3
    let pDigit = '';
    let tChar = '';
    let vChar = '';
    let mChar = '';
    let numChar = '';

    const firstChar = innerCode[0];
    if (['1', '2', '3'].includes(firstChar)) {
      pDigit = firstChar;
      tChar = innerCode[1] || '';
      vChar = innerCode[2] || '';
      mChar = innerCode[3] || '';
      // find number after hyphen or remaining
      const rest = innerCode.substring(4).replace(/-/g, '');
      numChar = rest[0] || '';
    } else {
      // Participle or infinitive like: -PPPNSM- or PAN
      const trimmed = innerCode.replace(/^-+/, '');
      tChar = trimmed[0] || '';
      vChar = trimmed[1] || '';
      mChar = trimmed[2] || '';
      const caseChar = trimmed[3] || '';
      numChar = trimmed[4] || '';
      const genderChar = trimmed[5] || '';

      if (caseChar && GREEK_CASES[caseChar]) {
        segments.push({
          code: caseChar,
          category: 'Caso do Particípio',
          name: GREEK_CASES[caseChar].name,
          description: GREEK_CASES[caseChar].desc
        });
      }
      if (genderChar && GREEK_GENDERS[genderChar]) {
        segments.push({
          code: genderChar,
          category: 'Gênero do Particípio',
          name: GREEK_GENDERS[genderChar].name,
          description: GREEK_GENDERS[genderChar].desc
        });
      }
    }

    if (tChar && GREEK_TENSES[tChar]) {
      segments.push({
        code: tChar,
        category: 'Tempo Verbal',
        name: GREEK_TENSES[tChar].name,
        description: GREEK_TENSES[tChar].desc
      });
      summaryParts.push(GREEK_TENSES[tChar].name);
    }

    if (vChar && GREEK_VOICES[vChar]) {
      segments.push({
        code: vChar,
        category: 'Voz Verbal',
        name: GREEK_VOICES[vChar].name,
        description: GREEK_VOICES[vChar].desc
      });
      summaryParts.push(GREEK_VOICES[vChar].name);
    }

    if (mChar && GREEK_MOODS[mChar]) {
      segments.push({
        code: mChar,
        category: 'Modo Verbal',
        name: GREEK_MOODS[mChar].name,
        description: GREEK_MOODS[mChar].desc
      });
      summaryParts.push(GREEK_MOODS[mChar].name);
    }

    if (pDigit && GREEK_PERSONS[pDigit]) {
      segments.push({
        code: pDigit,
        category: 'Pessoa Gramatical',
        name: GREEK_PERSONS[pDigit].name,
        description: GREEK_PERSONS[pDigit].desc
      });
      summaryParts.push(GREEK_PERSONS[pDigit].name);
    }

    if (numChar && GREEK_NUMBERS[numChar]) {
      segments.push({
        code: numChar,
        category: 'Número',
        name: GREEK_NUMBERS[numChar].name,
        description: GREEK_NUMBERS[numChar].desc
      });
      summaryParts.push(GREEK_NUMBERS[numChar].name);
    }

    technicalShort = `V-${pDigit}${tChar}${vChar}${mChar}${numChar ? `-${numChar}` : ''}`.replace(/-+$/, '');
  } else {
    // Nominal / Adjectival / Article parsing (Case, Number, Gender)
    // cleanInner usually contains GSM, NSM, ASF, APM, etc.
    let caseChar = '';
    let numChar = '';
    let genChar = '';

    for (const c of cleanInner) {
      if (!caseChar && GREEK_CASES[c]) {
        caseChar = c;
      } else if (!numChar && GREEK_NUMBERS[c]) {
        numChar = c;
      } else if (!genChar && GREEK_GENDERS[c]) {
        genChar = c;
      }
    }

    if (caseChar && GREEK_CASES[caseChar]) {
      segments.push({
        code: caseChar,
        category: 'Caso Gramatical',
        name: GREEK_CASES[caseChar].name,
        description: GREEK_CASES[caseChar].desc
      });
      summaryParts.push(GREEK_CASES[caseChar].name);
    }

    if (numChar && GREEK_NUMBERS[numChar]) {
      segments.push({
        code: numChar,
        category: 'Número Gramatical',
        name: GREEK_NUMBERS[numChar].name,
        description: GREEK_NUMBERS[numChar].desc
      });
      summaryParts.push(GREEK_NUMBERS[numChar].name);
    }

    if (genChar && GREEK_GENDERS[genChar]) {
      segments.push({
        code: genChar,
        category: 'Gênero Gramatical',
        name: GREEK_GENDERS[genChar].name,
        description: GREEK_GENDERS[genChar].desc
      });
      summaryParts.push(GREEK_GENDERS[genChar].name);
    }

    technicalShort = `${posCode}-${caseChar}${numChar}${genChar}`.replace(/-$/, '');
  }

  const summary = summaryParts.join(' • ');
  const detailedText = segments.map((s) => `• ${s.category}: ${s.name} (${s.description})`).join('\n');

  return {
    raw,
    technicalCode: technicalShort,
    summary,
    partOfSpeech: posInfo.name,
    detailedText,
    segments,
    isGreek: true,
    isHebrew: false
  };
}

/**
 * Decodes Hebrew morphological structures
 */
function decodeHebrewMorphology(raw: string): DecodedMorphology {
  const segments: MorphologySegment[] = [];
  const parts: string[] = [];

  // Check stems
  for (const [stem, info] of Object.entries(HEBREW_STEMS)) {
    if (new RegExp(stem, 'i').test(raw)) {
      segments.push({
        code: stem,
        category: 'Tronco Verbal Hebraico (Binyan)',
        name: info.name,
        description: info.desc
      });
      parts.push(info.name);
      break;
    }
  }

  // Common Hebrew tags
  if (/Prep/i.test(raw)) {
    segments.push({
      code: 'Prep',
      category: 'Prefixo / Partícula',
      name: 'Preposição Inseparável',
      description: 'Preposição hebraica prefixada diretamente à palavra (ex: בְּ = em/por, לְ = a/para, כְּ = como).'
    });
    parts.push('Preposição');
  }

  if (/Subst/i.test(raw)) {
    segments.push({
      code: 'Subst',
      category: 'Classe Gramatical',
      name: 'Substantivo',
      description: 'Nome que designa pessoas, lugares, coisas ou conceitos divinos.'
    });
    parts.push('Substantivo');
  }

  if (/Fem/i.test(raw)) {
    segments.push({ code: 'Fem', category: 'Gênero', name: 'Feminino', description: 'Gênero gramatical feminino.' });
    parts.push('Feminino');
  } else if (/Masc/i.test(raw)) {
    segments.push({ code: 'Masc', category: 'Gênero', name: 'Masculino', description: 'Gênero gramatical masculino.' });
    parts.push('Masculino');
  }

  if (/Pf/i.test(raw) && !/Impf/i.test(raw)) {
    segments.push({ code: 'Pf', category: 'Aspecto Verbal', name: 'Perfeito (Qatal)', description: 'Ação completada ou vista como um todo íntegro.' });
    parts.push('Perfeito');
  } else if (/Impf/i.test(raw)) {
    segments.push({ code: 'Impf', category: 'Aspecto Verbal', name: 'Imperfeito (Yiqtol)', description: 'Ação em progresso, futura, volitiva ou habitual.' });
    parts.push('Imperfeito');
  }

  if (/3ms/i.test(raw)) {
    segments.push({ code: '3ms', category: 'Pessoa & Número', name: '3ª Pessoa Masculino Singular', description: 'Ele (sujeito masculino singular).' });
    parts.push('3ª Pes. Masc. Sing.');
  }

  const summary = parts.length > 0 ? parts.join(' • ') : raw;

  return {
    raw,
    technicalCode: raw,
    summary,
    partOfSpeech: segments[0]?.name || 'Gramática Hebraica',
    detailedText: segments.map((s) => `• ${s.category}: ${s.name} (${s.description})`).join('\n'),
    segments,
    isGreek: false,
    isHebrew: true
  };
}

/**
 * Fallback for generic strings
 */
function decodeGeneralMorphology(raw: string): DecodedMorphology {
  let translated = raw;
  const lower = raw.toLowerCase().trim();
  if (lower === 'masculine noun') translated = 'Substantivo Masculino';
  else if (lower === 'feminine noun') translated = 'Substantivo Feminino';
  else if (lower === 'noun') translated = 'Substantivo';
  else if (lower === 'verb') translated = 'Verbo';
  else if (lower === 'adjective') translated = 'Adjetivo';
  else if (lower === 'preposition') translated = 'Preposição';
  else if (lower === 'conjunction') translated = 'Conjunção';
  else if (lower === 'pronoun') translated = 'Pronome';
  else if (lower === 'article') translated = 'Artigo';
  else if (lower.includes('masculine')) translated = 'Substantivo Masculino';
  else if (lower.includes('feminine')) translated = 'Substantivo Feminino';

  return {
    raw,
    technicalCode: raw,
    summary: translated,
    partOfSpeech: translated,
    detailedText: `Classificação: ${translated}`,
    segments: [{ code: raw, category: 'Categoria Gramatical', name: translated, description: 'Classificação morfológica no texto original.' }],
    isGreek: false,
    isHebrew: false
  };
}
