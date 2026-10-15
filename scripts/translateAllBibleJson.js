const fs = require('fs');
const path = require('path');

const bibleDir = path.resolve(__dirname, '../src/data/bible');
const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json'));

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
  'to become': 'tornar-se / vir a ser / acontecer',
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
  'father': 'pai',
  'mother': 'mãe',
  'to give': 'dar / conceder / entregar',
  'of speech': 'palavra / discurso / o Verbo',
  'to write': 'escrever / registrar',
  'a son': 'filho / descendente',
  'many': 'muitos / numeroso',
  'one': 'um / único',
  'arable land': 'terra / solo / região',
  'to separate': 'separar / apartar',
  'to will': 'querer / desejar / ter vontade',
  'about': 'acerca de / sobre / ao redor',
  'all': 'todo / tudo / todos',
  'God': 'Deus',
  'Lord': 'Senhor',
  'Christ': 'Cristo / Ungido',
  'Jesus': 'Jesus',
  'Spirit': 'Espírito',
  'Holy Spirit': 'Espírito Santo',
  'blessed': 'abençoado / bem-aventurado',
  'heaven': 'céu',
  'earth': 'terra',
  'king': 'rei',
  'kingdom': 'reino',
  'glory': 'glória',
  'grace': 'graça',
  'peace': 'paz',
  'faith': 'fé',
  'love': 'amor',
  'prophecy': 'profecia',
  'prophet': 'profeta',
  'priest': 'sacerdote',
  'temple': 'templo',
  'altar': 'altar',
  'blood': 'sangue',
  'water': 'água',
  'fire': 'fogo',
  'light': 'luz',
  'darkness': 'trevas',
  'word': 'palavra',
  'name': 'nome',
  'power': 'poder',
  'hand': 'mão',
  'eye': 'olho',
  'ear': 'ouvido',
  'foot': 'pé',
  'heart': 'coração',
  'soul': 'alma',
  'mind': 'mente',
  'city': 'cidade',
  'mountain': 'monte / montanha',
  'sea': 'mar',
  'river': 'rio',
  'tree': 'árvore',
  'fruit': 'fruto',
  'seed': 'semente',
  'sheep': 'ovelha',
  'shepherd': 'pastor',
  'door': 'porta',
  'way': 'caminho',
  'truth': 'verdade',
  'life': 'vida'
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
  if (lower.startsWith('source, origin')) return 'origem / genealogia';
  if (lower.startsWith('laying bare')) return 'revelação / desvendamento';
  if (lower.startsWith('a slave')) return 'servo / escravo';
  if (lower.startsWith('a messenger')) return 'mensageiro / anjo';
  if (lower.startsWith('blessed')) return 'bem-aventurado';
  if (lower.startsWith('to distinguish')) return 'ler / discernir';

  return text;
}

function translateDefinition(def) {
  if (!def) return def;
  const text = def.trim();

  if (/laying bare, making naked/i.test(text)) {
    return 'Revelação, desvendamento da verdade divina, instrução sobre coisas antes ocultas reveladas por Cristo.';
  }
  if (/heaven, heavens, sky/i.test(text)) {
    return 'Céus, firmamento, abóbada celeste e morada de Deus.';
  }
  if (/fathered children/i.test(text)) {
    return 'Gerar, dar à luz, ser gerado ou suscitar descendência.';
  }
  if (/written book/i.test(text)) {
    return 'Livro, rolo de pergaminho ou registro escrito sagrado.';
  }
  if (/source, origin/i.test(text)) {
    return 'Origem, nascimento, princípio, genealogia e linhagem.';
  }
  if (/second king of Israel/i.test(text)) {
    return 'Davi, o segundo e mais ilustre rei de Israel.';
  }
  if (/blessed, happy/i.test(text)) {
    return 'Bem-aventurado, supremamente feliz e abençoado por Deus.';
  }
  if (/a slave, bondman/i.test(text)) {
    return 'Servo, escravo dedicado voluntariamente à vontade de Deus.';
  }
  if (/a messenger, envoy/i.test(text)) {
    return 'Mensageiro, enviado, anjo celestial ou mensageiro de Deus.';
  }

  return def;
}

function translateMorphology(morph) {
  if (!morph) return morph;
  const lower = morph.toLowerCase().trim();
  if (lower === 'masculine noun') return 'Substantivo Masculino';
  if (lower === 'feminine noun') return 'Substantivo Feminino';
  if (lower === 'noun') return 'Substantivo';
  if (lower === 'verb') return 'Verbo';
  if (lower === 'adjective') return 'Adjetivo';
  if (lower === 'preposition') return 'Preposição';
  if (lower === 'conjunction') return 'Conjunção';
  if (lower === 'pronoun') return 'Pronome';
  if (lower === 'article') return 'Artigo';
  return morph;
}

let totalUpdated = 0;

for (const file of files) {
  const filePath = path.join(bibleDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    continue;
  }

  let modified = false;
  if (data && data.chapters) {
    for (const chap of Object.values(data.chapters)) {
      if (Array.isArray(chap)) {
        for (const v of chap) {
          if (v && Array.isArray(v.words)) {
            for (const w of v.words) {
              const newTr = translateText(w.translation);
              if (newTr !== w.translation) {
                w.translation = newTr;
                modified = true;
                totalUpdated++;
              }

              const newDef = translateDefinition(w.definition);
              if (newDef !== w.definition) {
                w.definition = newDef;
                modified = true;
              }

              const newMorph = translateMorphology(w.morphology);
              if (newMorph !== w.morphology) {
                w.morphology = newMorph;
                modified = true;
              }
            }
          }
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data));
    console.log(`Updated book JSON: ${file}`);
  }
}

console.log(`=== Successfully processed all Bible books. Total fields updated: ${totalUpdated} ===`);
