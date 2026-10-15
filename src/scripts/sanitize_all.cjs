const fs = require('fs');
const path = require('path');

// Comprehensive dictionary for all English Strong glosses, phrases, and definitions
const GLOSS_MAP = {
  'laying bare': 'revelação / desvendamento',
  'making naked': 'desnudamento / revelação',
  'a disclosure of truth': 'revelação da verdade',
  'to show': 'mostrar / manifestar',
  'it is necessary': 'é necessário / convém',
  'quickness': 'em breve / com presteza',
  'speed': 'rapidez / presteza',
  'to give a sign': 'notificar / indicar por sinal',
  'to order': 'enviar / ordenar',
  'opinion': 'glória / honra / reputação',
  'royal power': 'reino / soberania régia',
  'a priest': 'sacerdote / ministro sagrado',
  'force': 'poder / domínio / força',
  'for ever': 'para todo o sempre / pela eternidade',
  'a cloud': 'nuvem celeste',
  'the eye': 'olho / faculdade de ver',
  'whoever': 'quem quer que / todo aquele que',
  'to put out': 'traspassar / perfurar',
  'to cut': 'lamentar-se / golpear o peito',
  'a tribe': 'tribo / estirpe',
  'due measure': 'tempo oportuno / kairós',
  'near': 'perto / próximo',
  'seven': 'sete (plenitude divina)',
  'a gathering of citizens': 'igreja / congregação dos chamados',
  'to loose any person': 'libertar / desatar / absolver',
  'equivalent to 264': 'pecado / transgressão',
  'to miss the mark': 'pecar / errar o alvo de Deus',
  'I, me, my': 'eu / mim / meu',
  'and, also, even, indeed, but': 'e / também / certamente',
  'himself, herself, themselves, itself, he, she, it, the same': 'ele / seu / a si mesmo',
  'this, that, these, etc.': 'o / este / aquele',
  'a god or goddess': 'Deus / Divindade',
  'to become, i.e. to come into existence': 'acontecer / vir a ser / cumprir-se',
  'in, by, with etc.': 'em / por meio de / com',
  'to give, to give something to someone': 'dar / conceder / outorgar',
  'of persons, to welcome, to entertain, to be fond of, to love dearly': 'amar / ter amor ágape',
  'blood, of man or animals': 'sangue purificador e expiatório',
  'to make, with the names of things made': 'fazer / constituir / estabelecer',
  'generator or male ancestor': 'pai / Pai celestial',
  'arable land, the ground, the earth': 'terra / mundo habitado',
  'an assembly, an assembly of the people': 'igreja / congregação',
  'to attend to carefully, take care of, to guard': 'guardar / observar com diligência',
  'a discourse emanating from divine inspiration': 'profecia bíblica inspirada',
  'to distinguish between, to recognise, to know accurately, to acknowledge, to read': 'ler / compreender espiritualmente',
  'to see with the eyes, to see with the mind': 'ver / contemplar / perceber',
  'to come, of persons, to come from one place to another': 'vir / chegar / regressar',
  'with, after, behind': 'com / depois de',
  'individually, each, every, any, all': 'todo / cada um / todos',
  'of speech, a word, uttered by a living voice': 'Palavra / o Verbo divino (Logos)',
  'to write, with reference to the form of the letters': 'escrever / registrar nas Escrituras',
  'near, of place and position': 'perto / chegado',
  'who, which, what, that': 'quem / o qual / aquele que',
  'land': 'terra / solo',
  'to be': 'ser / estar / existir',
  'formlessness': 'sem forma / caos primordial',
  'emptiness': 'vazio / deserto',
  'darkness': 'trevas / escuridão',
  'upon': 'sobre / em cima de',
  'face': 'face / superfície',
  'deep': 'abismo / profundezas',
  'wind': 'Espírito / sopro de Deus',
  'to say': 'dizer / declarar',
  'light': 'luz',
  'to see': 'ver / contemplar',
  'that': 'que / porque',
  'good': 'bom / excelente',
  'to divide': 'separar / fazer divisão',
  'between': 'entre',
  'to call': 'chamar / proclamar',
  'to beat': 'estender / bater',
  'day': 'dia',
  'night': 'noite',
  'firmament': 'firmamento / expansão',
  'waters': 'águas',
  'heaven': 'céu / céus',
  'under': 'debaixo de',
  'place': 'lugar',
  'earth': 'terra',
  'gathering': 'ajuntamento',
  'seas': 'mares',
  'grass': 'erva verde / vegetação',
  'herb': 'planta / erva',
  'yielding': 'que produz',
  'seed': 'semente',
  'fruit': 'fruto',
  'tree': 'árvore',
  'after': 'conforme / segundo',
  'kind': 'sua espécie',
  'lights': 'luzeiros / luminares',
  'rule': 'governar / reger',
  'signs': 'sinais',
  'seasons': 'estações',
  'years': 'anos',
  'greater': 'maior',
  'lesser': 'menor',
  'stars': 'estrelas',
  'living': 'vivente / animada',
  'creature': 'criatura / ser vivo',
  'fowl': 'aves',
  'fly': 'voar',
  'whales': 'grandes monstros marinhos',
  'moving': 'que se move',
  'blessed': 'abençoou',
  'fruitful': 'frutífero',
  'multiply': 'multiplicar',
  'cattle': 'gado / rebanho',
  'creeping': 'répteis / animais rastejantes',
  'beast': 'animais selvagens',
  'image': 'imagem',
  'likeness': 'semelhança',
  'dominion': 'domínio / soberania',
  'fish': 'peixes',
  'male': 'macho / homem',
  'female': 'fêmea / mulher',
  'replenish': 'encher',
  'subdue': 'sujeitar / dominar',
  'behold': 'eis que',
  'given': 'dado',
  'meat': 'mantimento / alimento',
  'very': 'muito',
  'finished': 'foram acabados',
  'host': 'exército / conjunto',
  'seventh': 'sétimo',
  'ended': 'concluiu / cessou',
  'work': 'obra / trabalho',
  'rested': 'descansou (Sábado / Shabat)',
  'sanctified': 'santificou / consagrou',
  'because': 'porque',
  'generations': 'origens / genealogias',
  'plant': 'planta',
  'field': 'campo',
  'before': 'antes',
  'grow': 'brotar',
  'rain': 'chuva',
  'till': 'lavrar / cultivar',
  'mist': 'neblina / vapor',
  'watered': 'regava',
  'formed': 'formou / moldou',
  'dust': 'pó da terra',
  'ground': 'solo',
  'breathed': 'soprou',
  'nostrils': 'narinas',
  'breath': 'fôlego de vida',
  'life': 'vida',
  'soul': 'alma vivente / ser vivo',
  'planted': 'plantou',
  'garden': 'jardim',
  'eastward': 'para o oriente',
  'Eden': 'Éden (Delícia)',
  'put': 'pôs / colocou',
  'pleasant': 'agradável',
  'sight': 'à vista',
  'knowledge': 'conhecimento',
  'evil': 'mal',
  'river': 'rio',
  'went': 'saía',
  'parted': 'dividia-se',
  'four': 'quatro',
  'heads': 'braços / cabeceiras',
  'gold': 'ouro',
  'bdellium': 'bdélio',
  'onyx': 'ônix',
  'stone': 'pedra preciosa',
  'second': 'segundo',
  'third': 'terceiro',
  'fourth': 'quarto',
  'keep': 'guardar / cuidar',
  'commanded': 'ordenou',
  'freely': 'livremente',
  'eat': 'comer',
  'surely': 'certamente',
  'die': 'morrerás',
  'alone': 'só',
  'help': 'auxiliadora / ajudadora',
  'meet': 'idônea / correspondente',
  'brought': 'trouxe',
  'names': 'nomes',
  'called': 'chamou',
  'found': 'achou',
  'deep sleep': 'sono profundo',
  'slept': 'dormiu',
  'ribs': 'costelas',
  'closed': 'fechou',
  'flesh': 'carne',
  'made': 'edificou / formou',
  'woman': 'mulher',
  'bone': 'osso',
  'bones': 'meus ossos',
  'leave': 'deixará',
  'father': 'pai',
  'mother': 'mãe',
  'cleave': 'apegar-se-á',
  'wife': 'mulher / esposa',
  'one flesh': 'uma só carne',
  'naked': 'nus',
  'ashamed': 'envergonhados',
  'Christ =  anointed': 'Cristo (O Ungido / Messias)',
  'Jesus =  Jehovah is salvation': 'Jesus (Yahweh é Salvação)',
  'Dothan =  two wells': 'Dotã (dois poços)',
  'Veha\'arets': 'e a terra',
  'Tehvom': 'abismo',
  'Peney': 'face de',
  'Vayo\'mer': 'e disse',
  'Yehiy': 'haja',
  '\'vor': 'luz',
  'Vayare\'': 'e viu',
  '\'et': '[sinal do acusativo]',
  'Kiy': 'que',
  'Beyn': 'entre',
  'Vveyn': 'e entre',
  'Vayiqera\'': 'e chamou',
  'La\'vor': 'à luz',
  'Layelah': 'noite',
  'Vayehiy': 'e foi',
  '\'Erev': 'tarde',
  'Boqer': 'manhã',
  'Yom': 'dia',
  '\'Echad': 'primeiro',
  'Raqiya\'': 'firmamento',
  'Mayim': 'águas',
  'Mavdiyl': 'separador',
  'Sheniy': 'segundo',
  'Yabashah': 'porção seca',
  'Shalishiy': 'terceiro',
  'Shevi\'iy': 'sétimo',
  'Shabbat': 'Sábado (descanso sagrado)',
  'Qadash': 'santificou'
};

function cleanTranslation(word) {
  let trans = (word.translation || '').trim();
  let orig = word.original || '';
  let lemma = word.lemma || '';
  let strong = word.strong || '';

  // Direct match
  if (GLOSS_MAP[trans]) {
    return GLOSS_MAP[trans];
  }

  // Exact matches
  const lower = trans.toLowerCase();
  for (const [k, v] of Object.entries(GLOSS_MAP)) {
    if (k.toLowerCase() === lower) {
      return v;
    }
  }

  // Common patterns
  if (/^laying bare/i.test(trans)) return 'revelação / desvendamento';
  if (/^christ/i.test(trans)) return 'Cristo / Messias';
  if (/^jesus/i.test(trans)) return 'Jesus (O Salvador)';
  if (/^god/i.test(trans)) return 'Deus';
  if (/^to give/i.test(trans)) return 'dar / conceder';
  if (/^to be/i.test(trans)) return 'ser / estar';
  if (/^to show/i.test(trans)) return 'mostrar / manifestar';
  if (/^this|that/i.test(trans)) return 'o / este / aquele';
  if (/^who|which/i.test(trans)) return 'quem / o qual';
  if (/^servant/i.test(trans)) return 'servo / escravo consagrado';
  if (/^it is necessary/i.test(trans)) return 'é necessário / convém';
  if (/^to become/i.test(trans)) return 'acontecer / vir a ser';
  if (/^quickness/i.test(trans)) return 'em breve / prontamente';
  if (/^to give a sign/i.test(trans)) return 'notificar / assinalar';
  if (/^to order/i.test(trans)) return 'enviar / comissionar';
  if (/^through/i.test(trans)) return 'por meio de / através';
  if (/^angel/i.test(trans)) return 'anjo / mensageiro celestial';
  if (/^john/i.test(trans)) return 'João';
  if (/^seven/i.test(trans)) return 'sete (plenitude)';
  if (/^church/i.test(trans)) return 'igreja / assembleia de crentes';
  if (/^asia/i.test(trans)) return 'Ásia';
  if (/^grace/i.test(trans)) return 'graça / favor divino';
  if (/^peace/i.test(trans)) return 'paz (shalom)';
  if (/^spirit/i.test(trans)) return 'Espírito';
  if (/^throne/i.test(trans)) return 'trono soberano';
  if (/^witness/i.test(trans)) return 'testemunha fiel';
  if (/^faithful/i.test(trans)) return 'fiel / verdadeiro';
  if (/^firstborn/i.test(trans)) return 'primogênito';
  if (/^dead/i.test(trans)) return 'mortos';
  if (/^ruler|prince/i.test(trans)) return 'soberano / príncipe';
  if (/^king/i.test(trans)) return 'rei';
  if (/^earth/i.test(trans)) return 'terra';
  if (/^love/i.test(trans)) return 'amar / nos ama';
  if (/^washed|loosed/i.test(trans)) return 'libertou / lavou';
  if (/^sin/i.test(trans)) return 'pecados';
  if (/^blood/i.test(trans)) return 'sangue expiatório';
  if (/^kingdom/i.test(trans)) return 'reino';
  if (/^priest/i.test(trans)) return 'sacerdotes';
  if (/^glory/i.test(trans)) return 'glória';
  if (/^dominion|power/i.test(trans)) return 'domínio / soberania';
  if (/^amen/i.test(trans)) return 'amém';
  if (/^cloud/i.test(trans)) return 'nuvens';
  if (/^eye/i.test(trans)) return 'olho';
  if (/^pierced/i.test(trans)) return 'traspassaram';
  if (/^wail|lament/i.test(trans)) return 'se lamentarão';
  if (/^all/i.test(trans)) return 'todo / todos';

  // Transliteration fallbacks
  if (trans === 'Emartyresen') return 'testemunhou';
  if (trans === 'Martyrian') return 'testemunho';
  if (trans === 'Hosa') return 'tudo quanto';
  if (trans === 'Eiden') return 'viu / contemplou';
  if (trans === 'Epoiesen') return 'constituiu / fez';
  if (trans === 'Basileian') return 'reino';
  if (trans === 'Hiereis') return 'sacerdotes';
  if (trans === 'Patri') return 'Pai';
  if (trans === 'Doxa') return 'glória';
  if (trans === 'Kratos') return 'domínio';
  if (trans === 'Eis') return 'para / pelos';
  if (trans === 'Aionas' || trans === 'Aionon') return 'séculos';
  if (trans === 'Idoy') return 'eis que';
  if (trans === 'Erchetai') return 'vem';
  if (trans === 'Nephelon') return 'nuvens';
  if (trans === 'Opsetai') return 'verá';
  if (trans === 'Pas') return 'todo';
  if (trans === 'Ophthalmos') return 'olho';
  if (trans === 'Ohitines') return 'quantos';
  if (trans === 'Exekentesan') return 'traspassaram';
  if (trans === 'Kopsontai') return 'se lamentarão';
  if (trans === 'Phylai') return 'tribos';
  if (trans === 'Akoyontes') return 'ouvem';

  // If already Portuguese, keep
  if (/[áéíóúãõçê]/i.test(trans) || /\b(de|do|da|em|no|na|para|com|por|e|ou|que|o|a|os|as|um|uma|seu|sua)\b/i.test(trans)) {
    return trans;
  }

  return trans;
}

function cleanDefinition(word) {
  let def = (word.definition || '').trim();
  let orig = word.original || '';
  let lemma = word.lemma || orig;
  let strong = word.strong || '';
  let trans = word.translation || '';

  // If empty, generate faithful theological Portuguese definition
  if (!def) {
    return `Forma lexical "${lemma}" (${strong}): Vocábulo bíblico fundamental que expressa "${trans}" no texto sagrado original.`;
  }

  // If already full Portuguese and no English indicators
  if (/(\bque\b|\bpara\b|\bdo\b|\bda\b|\bou\b|\bum\b|\buma\b)/i.test(def) && 
      !/\b(who|which|that|laying bare|making naked|disclosure|to give|to show|it is necessary|royal power|a priest|for ever|the eye)\b/i.test(def)) {
    return def;
  }

  // Specific Strong definitions
  if (strong === 'G0602' || /laying bare|disclosure of truth/i.test(def)) {
    return 'Revelação divina, desvendamento de mistérios sagrados antes ocultos, manifestação gloriosa da verdade de Deus e da Pessoa de Jesus Cristo no plano da redenção.';
  }
  if (strong === 'G1096' || /to become, i.e. to come into existence/i.test(def)) {
    return 'Tornar-se, vir a ser, acontecer, nascer, cumprir-se na história por desígnio e determinação de Deus.';
  }
  if (strong === 'G1163' || /it is necessary/i.test(def)) {
    return 'É necessário, convém, determinação divina irrevogável estabelecida nos planos eternos da salvação.';
  }
  if (strong === 'G1166' || /to show, expose to the eyes/i.test(def)) {
    return 'Mostrar, tornar visível aos olhos do entendimento, expor de modo claro e evidente a revelação celeste.';
  }
  if (strong === 'G1325' || /to give, to give something to someone/i.test(def)) {
    return 'Dar, conceder por graça, outorgar de livre e soberana vontade para o bem espiritual e salvação.';
  }
  if (strong === 'G4591' || /to give a sign, to signify/i.test(def)) {
    return 'Notificar por sinais proféticos, assinalar, comunicar simbolicamente os eventos futuros sob inspiração do Espírito.';
  }
  if (strong === 'G0649' || /to order \(one\) to go/i.test(def)) {
    return 'Enviar com autoridade oficial e missão sagrada, comissionar como embaixador divino.';
  }
  if (strong === 'G3739' || /who, which, what, that/i.test(def)) {
    return 'Pronome relativo grego: que, quem, o qual, a qual, o que liga orações estabelecendo subordinação teológica.';
  }
  if (strong === 'G3588' || /this, that, these, etc\./i.test(def)) {
    return 'Artigo definido grego (ὁ, ἡ, τό). Particulariza o substantivo ou denota identidade única divina (Aquele que é).';
  }
  if (strong === 'G0846' || /himself, herself, themselves/i.test(def)) {
    return 'Pronome enfático e pessoal: ele, ela, a si mesmo, de sua própria pessoa.';
  }
  if (strong === 'G2316' || /a god or goddess/i.test(def)) {
    return 'Deus, o Criador Supremo, Único e Soberano, Senhor do cosmos e Pai celestial da humanidade.';
  }
  if (strong === 'G2424' || /Jesus =  Jehovah is salvation/i.test(def)) {
    return 'Jesus (hebraico Yeshua = Yahweh é Salvação), o Verbo encarnado, Emanuel, o Redentor do mundo.';
  }
  if (strong === 'G5547' || /Christ =  anointed/i.test(def)) {
    return 'Cristo (equivalente grego de Mashiach / Messias = O Ungido de Deus), investido como Profeta, Sacerdote e Rei eterno.';
  }
  if (strong === 'G1401' || /servant/i.test(def)) {
    return 'Servo, escravo voluntário inteiramente consagrado à obediência e ao serviço de Deus.';
  }
  if (strong === 'G5034' || /quickness, speed/i.test(def)) {
    return 'Em breve, com rapidez e certeza escatológica inadiável no plano divino.';
  }
  if (strong === 'G1223' || /through, of place, with, in/i.test(def)) {
    return 'Preposição: por meio de, através de, pela agência e intermediação direta.';
  }
  if (strong === 'G0032' || /messenger/i.test(def)) {
    return 'Anjo, mensageiro celestial enviado pelo trono de Deus para ministrar aos santos.';
  }
  if (strong === 'G2491' || /John/i.test(def)) {
    return 'João (hebraico Yohanan = Deus foi compassivo/gracioso), apóstolo amado e profeta do Apocalipse.';
  }
  if (strong === 'G3107' || /blessed/i.test(def)) {
    return 'Bem-aventurado, supremamente feliz, recipiente do favor e das promessas divinas.';
  }
  if (strong === 'G0314' || /to distinguish between, to recognise/i.test(def)) {
    return 'Ler em voz alta na congregação, discernir as Escrituras, examinar com reverência e acuidade.';
  }
  if (strong === 'G0191' || /to be endowed with the faculty of hearing/i.test(def)) {
    return 'Ouvir atentamente, acolher a mensagem no coração e obedecer com submissão à Palavra.';
  }
  if (strong === 'G3056' || /of speech, a word/i.test(def)) {
    return 'Palavra, discurso, revelação divina articulada, o Verbo eterno pelo qual tudo foi criado.';
  }
  if (strong === 'G4394' || /prophecy, a discourse/i.test(def)) {
    return 'Profecia inspirada, revelação dos desígnios soberanos de Deus para advertir e consolar a igreja.';
  }
  if (strong === 'G5083' || /to attend to carefully/i.test(def)) {
    return 'Guardar com solicitude, preservar a integridade da doutrina e praticar os mandamentos divinos.';
  }
  if (strong === 'G1125' || /to write/i.test(def)) {
    return 'Escrever, registrar de forma indelével nas Escrituras Sagradas sob a inspiração do Espírito Santo.';
  }
  if (strong === 'G2540' || /due measure, a measure of time/i.test(def)) {
    return 'Tempo oportuno, momento decisivo e determinado por Deus (kairós), época profética.';
  }
  if (strong === 'G1451' || /near, of place and position/i.test(def)) {
    return 'Próximo, iminente, às portas na cronologia profética da salvação.';
  }
  if (strong === 'G1577' || /a gathering of citizens/i.test(def)) {
    return 'Igreja (ekklēsia), congregação dos chamados por Deus para fora do mundo para serem Seu povo santo.';
  }
  if (strong === 'G5485' || /grace/i.test(def)) {
    return 'Graça divina, favor imerecido, amor salvífico e poder concedido gratuitamente ao crente.';
  }
  if (strong === 'G1515' || /peace/i.test(def)) {
    return 'Paz espiritual, reconciliação com Deus, plenitude e descanso messiânico (o Shalom bíblico).';
  }
  if (strong === 'G4151' || /spirit/i.test(def)) {
    return 'Espírito Santo, a terceira Pessoa da Divindade, fôlego de vida e agente santificador.';
  }
  if (strong === 'G2362' || /throne/i.test(def)) {
    return 'Trono celestial, assento da autoridade soberana e do governo moral de Deus sobre o universo.';
  }
  if (strong === 'G3144' || /witness/i.test(def)) {
    return 'Testemunha fiel, mártir da verdade que atesta a fidelidade de Deus mesmo perante a morte.';
  }
  if (strong === 'G4103' || /faithful/i.test(def)) {
    return 'Fiel, digno de confiança, leal à aliança e inabalável no cumprimento das promessas.';
  }
  if (strong === 'G4416' || /firstborn/i.test(def)) {
    return 'Primogênito (prototokos), Aquele que detém primazia, preeminência soberana e herança sobre toda a criação.';
  }
  if (strong === 'G0758' || /ruler/i.test(def)) {
    return 'Soberano, príncipe supremo, autoridade maior sobre todas as dinastias e impérios terrenos.';
  }
  if (strong === 'G0935' || /king/i.test(def)) {
    return 'Rei, monarca detentor do cetro de poder temporal ou celestial.';
  }
  if (strong === 'G1093' || /arable land/i.test(def)) {
    return 'A terra habitável, o mundo terreno criado por Deus e teatro do grande conflito cósmico.';
  }
  if (strong === 'G3089' || /to loose any person/i.test(def)) {
    return 'Libertar, quebrar os grilhões do pecado, absolver da condenação pela eficácia do sangue de Cristo.';
  }
  if (strong === 'G0266' || /miss the mark/i.test(def)) {
    return 'Pecado, desvio da retidão divina, transgressão da santa lei de Deus da qual Cristo nos redimiu.';
  }
  if (strong === 'G0129' || /blood/i.test(def)) {
    return 'Sangue de Jesus Cristo, sacrifício vicário no Calvário que sela a Nova Aliança e nos purifica.';
  }
  if (strong === 'G0932' || /royal power/i.test(def)) {
    return 'Reino de Deus, soberania, autoridade e esfera onde Deus reina nos corações e na história.';
  }
  if (strong === 'G2409' || /a priest/i.test(def)) {
    return 'Sacerdote, consagrado para oferecer culto e intercessão diante da presença santa de Deus.';
  }
  if (strong === 'G1391' || /opinion, judgment/i.test(def)) {
    return 'Glória, esplendor, honra sublime, manifestação visível da santidade e majestade de Deus.';
  }
  if (strong === 'G2904' || /force, strength/i.test(def)) {
    return 'Poder soberano, força e domínio eterno pertencentes exclusivamente ao Criador.';
  }
  if (strong === 'G0165' || /for ever, an unbroken age/i.test(def)) {
    return 'Séculos dos séculos, eternidade infinda, perpetuidade temporal que jamais se extingue.';
  }
  if (strong === 'G0281' || /amen/i.test(def)) {
    return 'Amém (hebraico = certamente, que assim seja), confirmação solene e irrevogável da verdade.';
  }
  if (strong === 'G3507' || /a cloud/i.test(def)) {
    return 'Nuvem de glória divina (shekinah), veículo celestial da Segunda Vinda visível de Cristo.';
  }
  if (strong === 'G3788' || /the eye/i.test(def)) {
    return 'Olho humano, percepção visual e espiritual com a qual todo ser verá o retorno glorioso do Messias.';
  }
  if (strong === 'G1574' || /to put out, dig out/i.test(def)) {
    return 'Traspassar, ferir, perfurar o Salvador no Calvário, apontando para o juízo daqueles que O rejeitaram.';
  }
  if (strong === 'G2875' || /to cut/i.test(def)) {
    return 'Lamentar amargamente, bater no peito em sinal de desespero e contrição perante o Juiz supremo.';
  }
  if (strong === 'G5443' || /a tribe/i.test(def)) {
    return 'Tribo, linhagem, famílias e povos da terra reunidos perante a glória do Filho do Homem.';
  }

  // General dictionary translation rules
  let text = def;
  text = text.replace(/\bwho, which, what, that\b/gi, 'que / o qual / aquele que');
  text = text.replace(/\bthis, that, these, etc\.\b/gi, 'o / este / aquele');
  text = text.replace(/\bto give something to someone\b/gi, 'dar algo a alguém');
  text = text.replace(/\bto give\b/gi, 'dar / conceder');
  text = text.replace(/\bto show\b/gi, 'mostrar / revelar');
  text = text.replace(/\bquickness, speed\b/gi, 'em breve / com prontidão');
  text = text.replace(/\bit is necessary\b/gi, 'é necessário / convém');
  text = text.replace(/\bto become\b/gi, 'tornar-se / vir a ser');
  text = text.replace(/\bto make\b/gi, 'fazer / criar');
  text = text.replace(/\bto write\b/gi, 'escrever / registrar');
  text = text.replace(/\broyal power\b/gi, 'reino / soberania');
  text = text.replace(/\ba priest\b/gi, 'sacerdote');
  text = text.replace(/\bfor ever\b/gi, 'para todo o sempre');
  text = text.replace(/\ba cloud\b/gi, 'uma nuvem');
  text = text.replace(/\bthe eye\b/gi, 'o olho');
  text = text.replace(/\bwhoever\b/gi, 'quem quer que');
  text = text.replace(/\bto cut\b/gi, 'lamentar-se');
  text = text.replace(/\ba tribe\b/gi, 'uma tribo');

  return `Sentido bíblico para "${lemma}" (${strong}): ${text}`;
}

// 1. Sanitize interlinearCorpus.ts
console.log('Sanitizing interlinearCorpus.ts...');
const corpusPath = path.resolve(__dirname, '../data/interlinearCorpus.ts');
let corpusText = fs.readFileSync(corpusPath, 'utf8');

// Replace all words in corpusText
let replacedCount = 0;
corpusText = corpusText.replace(/(\{\s*"id":\s*"[^"]+",[\s\S]*?"translation":\s*")([^"]+)("[\s\S]*?"definition":\s*")([^"]*)("[\s\S]*?\})/g, (full, p1, trans, p3, def, p5) => {
  const dummyWord = {
    translation: trans,
    definition: def,
    original: (full.match(/"original":\s*"([^"]+)"/) || [])[1] || '',
    lemma: (full.match(/"lemma":\s*"([^"]+)"/) || [])[1] || '',
    strong: (full.match(/"strong":\s*"([^"]+)"/) || [])[1] || ''
  };

  const newTrans = cleanTranslation(dummyWord);
  const newDef = cleanDefinition({ ...dummyWord, translation: newTrans });

  if (newTrans !== trans || newDef !== def) {
    replacedCount++;
  }

  return full
    .replace(`"translation": "${trans}"`, `"translation": "${newTrans}"`)
    .replace(`"definition": "${def}"`, `"definition": "${newDef.replace(/"/g, '\\"')}"`);
});

fs.writeFileSync(corpusPath, corpusText, 'utf8');
console.log(`Updated interlinearCorpus.ts! Replaced tokens: ${replacedCount}`);

// 2. Sanitize all 66 JSON books
console.log('Sanitizing 66 Bible JSON files...');
const bibleDir = path.resolve(__dirname, '../data/bible');
const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json'));

let totalBooksCleaned = 0;
let totalWordsCleaned = 0;

for (const file of files) {
  const filePath = path.join(bibleDir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse', file, e);
    continue;
  }

  let fileChanged = false;
  if (data.chapters) {
    for (const [chNum, verses] of Object.entries(data.chapters)) {
      if (Array.isArray(verses)) {
        for (const verse of verses) {
          if (Array.isArray(verse.words)) {
            for (const word of verse.words) {
              const origTrans = word.translation;
              const origDef = word.definition;

              word.translation = cleanTranslation(word);
              word.definition = cleanDefinition(word);

              if (word.translation !== origTrans || word.definition !== origDef) {
                fileChanged = true;
                totalWordsCleaned++;
              }
            }
          }
        }
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
    totalBooksCleaned++;
  }
}

console.log(`Cleaned ${totalBooksCleaned} books and ${totalWordsCleaned} word definitions across the Bible.`);
