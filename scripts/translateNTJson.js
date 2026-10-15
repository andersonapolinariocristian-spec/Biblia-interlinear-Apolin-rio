const fs = require('fs');
const path = require('path');

const bibleDir = path.resolve(__dirname, '../src/data/bible');
const ntBooks = [
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 
  'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', 
  '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
];

// Translation mappings
const EXACT_GLOSS_MAP = {
  'this': 'o / este',
  'that': 'aquele / que',
  'these': 'estes',
  'those': 'aqueles',
  'and': 'e',
  'also': 'também',
  'even': 'mesmo / até',
  'but': 'mas / porém / e',
  'moreover': 'além disso',
  'himself': 'ele / a si mesmo / seu',
  'herself': 'ela / a si mesma / sua',
  'themselves': 'eles / a si mesmos / seus',
  'itself': 'a si mesmo',
  'he': 'ele',
  'she': 'ela',
  'it': 'isto / ele',
  'you': 'tu / você / vós',
  'I': 'eu',
  'we': 'nós',
  'they': 'eles',
  'to be': 'ser / estar',
  'to say': 'dizer / falar',
  'to speak': 'falar / declarar',
  'no': 'não',
  'not': 'não',
  'in': 'em / dentro de',
  'into': 'para dentro de / em',
  'who': 'quem / o qual / aquele que',
  'which': 'o qual / que',
  'what': 'o que / qual',
  'for': 'porque / pois / para',
  'to have': 'ter / possuir',
  'upon': 'sobre / em cima de',
  'on': 'sobre / em',
  'out of': 'de / de dentro de',
  'from': 'de / a partir de',
  'if': 'se',
  'to become': 'tornar-se / acontecer',
  'then': 'então / logo',
  'to come': 'vir / chegar',
  'to go': 'ir / partir',
  'to see with the eyes': 'ver / contemplar / olhar',
  'to see': 'ver / perceber',
  'to the advantage of': 'em favor de / para',
  'to make': 'fazer / produzir / realizar',
  'to do': 'fazer / praticar',
  'a human being': 'ser humano / homem / pessoa',
  'a man': 'homem / varão',
  'a woman': 'mulher',
  'of separation': 'de / separado de',
  'with': 'com / junto a',
  'through': 'por meio de / através de',
  'a certain': 'certo / algum',
  'a brother': 'irmão',
  'the day': 'o dia',
  'as': 'como / assim como',
  'generator or male ancestor': 'pai / antepassado / progenitor',
  'father': 'pai',
  'mother': 'mãe',
  'down from': 'de cima para baixo / conforme',
  'to give': 'dar / conceder / entregar',
  'of speech': 'palavra / discurso / o Verbo',
  'to write': 'escrever / registrar',
  'a son': 'filho / descendente',
  'many': 'muitos / numeroso',
  'one': 'um / único',
  'arable land': 'terra / solo / região',
  'to separate': 'separar / apartar',
  'to will': 'querer / desejar / ter vontade',
  'a learner': 'discípulo / aprendiz',
  'about': 'acerca de / sobre / ao redor',
  'either': 'ou / quer',
  'neither': 'nem',
  'all': 'todo / tudo / todos',
  'individually': 'cada um / todo',
  'a god or goddess': 'Deus / divindade',
  'God': 'Deus',
  'Lord': 'Senhor',
  'Christ': 'Cristo / Ungido',
  'Jesus': 'Jesus',
  'Spirit': 'Espírito',
  'Holy Spirit': 'Espírito Santo',
  'of men who fathered children': 'gerou / pai de',
  'to be born': 'nascer / ser gerado',
  'to be begotten': 'ser gerado',
  'a written book': 'livro / rolo / registro genealógico',
  'source': 'origem / linhagem / genealogia',
  'second king of Israel': 'Davi (rei de Israel)',
  'Abraham , the son of Terah and the founder of the Jewish nation': 'Abraão (o patriarca e pai da fé)',
  'Isaac , the son of Abraham and Sarah': 'Isaque (filho de Abraão e Sara)',
  'Jacob , was the second son of Isaac, the father of Joseph, the husband of Mary': 'Jacó (filho de Isaque e pai das doze tribos)',
  'Judah or Judas , the fourth son of Jacob, an unknown ancestor of Christ, a man surnamed': 'Judá (filho de Jacó, antepassado de Cristo)',
  'Solomon , the son of David and was the wisest and richest king that ever lived': 'Salomão (rei de Israel, filho de Davi)',
  'Rehoboam , the son of Solomon by an Ammonite princess Naamah': 'Roboão (filho de Salomão)',
  'Zerubbabel , the head of the tribe of Judah at the time of the return f': 'Zorobabel (líder no retorno do cativeiro)',
  'Shealtiel , the son of Jeconiah in the genealogy of Christ': 'Salatiel (filho de Jeconias na linhagem messiânica)',
  'removal from one abode to another, esp. a forced removal': 'deportação / exílio / cativeiro',
  'Babylon , a very large and famous city, the residence of the Babylonian kings, situated on both b': 'Babilônia (cidade do cativeiro)',
  'a little child': 'filhinho / criança / pequenino',
  'to guard': 'guardar / vigiar / proteger',
  'an image': 'imagem / ídolo / representação',
  'love': 'amor / ágape',
  'faith': 'fé / fidelidade',
  'grace': 'graça / favor divino',
  'peace': 'paz',
  'life': 'vida / vida eterna'
};

function translateText(text) {
  if (!text) return text;
  const trimmed = text.trim();
  if (EXACT_GLOSS_MAP[trimmed]) return EXACT_GLOSS_MAP[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(EXACT_GLOSS_MAP)) {
    if (k.toLowerCase() === lower) return v;
  }

  if (lower.startsWith('of men who fathered')) return 'gerou / pai de';
  if (lower.startsWith('to be born')) return 'nascer / ser gerado';
  if (lower.startsWith('second king of')) return 'Davi (rei de Israel)';
  if (lower.startsWith('a son')) return 'filho / descendente';
  if (lower.startsWith('a written book')) return 'livro / rolo';
  if (lower.startsWith('source, origin') || lower.startsWith('source')) return 'origem / genealogia';
  if (lower.startsWith('this, that')) return 'o / este / aquele';
  if (lower.startsWith('and, also')) return 'e / também';
  if (lower.startsWith('but, moreover')) return 'mas / porém / e';
  if (lower.startsWith('himself, herself')) return 'ele / seu / a si mesmo';
  if (lower.startsWith('a brother')) return 'irmão';
  if (lower.startsWith('out of, from')) return 'de / a partir de';
  if (lower.startsWith('with, after')) return 'com / depois de';
  if (lower.startsWith('removal from one')) return 'deportação / cativeiro';
  if (lower.startsWith('to guard, to watch')) return 'guardar / vigiar';
  if (lower.startsWith('a little child')) return 'filhinho / criança';
  if (lower.startsWith('an image, likeness')) return 'imagem / ídolo';
  if (lower.startsWith('that which has not only')) return 'verdadeiro / autêntico';

  return text;
}

function translateDefinition(def, lemma, strong) {
  if (!def) return def;
  const text = def.trim();

  if (/fathered children/i.test(text)) {
    return 'Gerar, dar à luz, ser gerado ou suscitar descendência. No contexto genealógico messiânico de Mateus e Lucas, denota a linhagem patrilinear messiânica.';
  }
  if (/written book/i.test(text)) {
    return 'Livro, rolo de pergaminho, códice ou registro escrito sagrado. Termo grego "Biblos" (donde provém a palavra Bíblia), designando o registro inspirado das Escrituras.';
  }
  if (/source, origin/i.test(text)) {
    return 'Origem, nascimento, princípio, genealogia e linhagem de uma família. Corresponde ao hebraico "Toledot" (história das gerações).';
  }
  if (/second king of Israel/i.test(text)) {
    return 'Davi, o segundo e mais ilustre rei de Israel, antepassado direto do Messias segundo a carne, homem segundo o coração de Deus a quem foi prometido o trono eterno.';
  }
  if (/founder of the Jewish nation/i.test(text)) {
    return 'Abraão, patriarca chamado por Deus para sair de Ur dos Caldeus, pai de todos os que creem e amigo de Deus.';
  }
  if (/the son of Abraham and Sarah/i.test(text)) {
    return 'Isaque, filho prometido de Abraão e Sara nascido pela fé, herdeiro da promessa da aliança.';
  }
  if (/second son of Isaac/i.test(text)) {
    return 'Jacó (Israel), filho de Isaque e Rebeca, pai dos doze patriarcas que formaram as doze tribos do povo de Deus.';
  }
  if (/fourth son of Jacob/i.test(text)) {
    return 'Judá, quarto filho de Jacó e Lia, da cuja tribo descende o Leão de Judá, o Messias Jesus Cristo.';
  }
  if (/wisest and richest king/i.test(text)) {
    return 'Salomão, filho de Davi e Bate-Seba, construtor do primeiro Templo em Jerusalém, conhecido pela sabedoria outorgada por Deus.';
  }
  if (/removal from one abode/i.test(text)) {
    return 'Transmigração, exílio forçado ou deportação do povo de Judá para a Babilônia sob Nabucodonosor em 586 a.C.';
  }
  if (/large and famous city, the residence of the Babylonian kings/i.test(text)) {
    return 'Babilônia, capital imperial do cativeiro judaico, centro do império neobabilônico.';
  }
  if (/rarely used for the young of animals/i.test(text)) {
    return 'Filho, herdeiro, descendente. No sentido messiânico mais sublime ("O Filho de Deus", "O Filho do Homem"), expressa a deidade e filiação eterna de Cristo.';
  }
  if (/born of the same two parents/i.test(text)) {
    return 'Irmão consanguíneo, parente ou membro da mesma família da fé (irmão em Cristo).';
  }
  if (/term of kindly address by teachers/i.test(text)) {
    return 'Filhinhos, crianças pequenas. No Novo Testamento, expressão carinhosa e paternal para instruir os discípulos.';
  }
  if (/to guard, to watch/i.test(text)) {
    return 'Guardar, vigiar com diligência e vigilância espiritual, proteger contra heresias e perigos morais.';
  }
  if (/an image, likeness/i.test(text)) {
    return 'Ídolo, imagem esculpida ou representação falsa de deus que usurpa o culto devido unicamente ao Deus vivo.';
  }
  if (/real nature corresponding to the name/i.test(text)) {
    return 'Verdadeiro, autêntico, genuíno, real em oposição ao que é falso ou ilusório. (1 Jo 5:20: "Este é o verdadeiro Deus").';
  }

  return def;
}

let totalWordsTranslated = 0;

for (const b of ntBooks) {
  const filePath = path.join(bibleDir, `${b}.json`);
  if (!fs.existsSync(filePath)) continue;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let modified = false;

  for (const chap of Object.values(data.chapters)) {
    for (const v of chap) {
      for (const w of v.words) {
        const oldTr = w.translation;
        const newTr = translateText(w.translation);
        if (newTr !== oldTr) {
          w.translation = newTr;
          modified = true;
          totalWordsTranslated++;
        }

        const oldDef = w.definition;
        const newDef = translateDefinition(w.definition, w.lemma, w.strong);
        if (newDef !== oldDef) {
          w.definition = newDef;
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log(`Updated book ${b}`);
  }
}

console.log(`=== Total words translated into Portuguese: ${totalWordsTranslated} ===`);
