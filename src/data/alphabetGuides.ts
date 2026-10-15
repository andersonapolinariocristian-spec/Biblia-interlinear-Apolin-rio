export interface AlphabetLetter {
  letter: string;
  finalForm?: string;
  name: string;
  transliteration: string;
  numericalValue: number;
  phoneticSound: string;
  example: string;
}

export const HEBREW_ALPHABET: AlphabetLetter[] = [
  { letter: 'א', name: 'Alef', transliteration: 'ʾ (mudo/aspiração)', numericalValue: 1, phoneticSound: 'Som gutural suave ou consoante muda com vogal', example: 'אֱלֹהִים (Elohim)' },
  { letter: 'ב', name: 'Bet / Vet', transliteration: 'B / V', numericalValue: 2, phoneticSound: 'Com dagesh: B. Sem dagesh: V.', example: 'בְּרֵאשִׁית (Bereshit)' },
  { letter: 'ג', name: 'Gimel', transliteration: 'G', numericalValue: 3, phoneticSound: 'G como em "gato"', example: 'גַּם (Gam)' },
  { letter: 'ד', name: 'Dalet', transliteration: 'D', numericalValue: 4, phoneticSound: 'D como em "dado"', example: 'דָּוִד (David)' },
  { letter: 'ה', name: 'He', transliteration: 'H', numericalValue: 5, phoneticSound: 'H aspirado como no inglês "house"', example: 'הַשָּׁמַיִם (Hashamayim)' },
  { letter: 'ו', name: 'Vav', transliteration: 'V (ou vogal O/U)', numericalValue: 6, phoneticSound: 'V consonantal ou holam / shuruk vocálico', example: 'וַיֹּאמֶר (Vayomer)' },
  { letter: 'ז', name: 'Zayin', transliteration: 'Z', numericalValue: 7, phoneticSound: 'Z como em "zebra"', example: 'זָכָר (Zakhar)' },
  { letter: 'ח', name: 'Chet', transliteration: 'Ch / Ḥ', numericalValue: 8, phoneticSound: 'Gutural rascante forte, como "j" em espanhol', example: 'חֶסֶד (Chesed)' },
  { letter: 'ט', name: 'Tet', transliteration: 'T', numericalValue: 9, phoneticSound: 'T enfático como em "terra"', example: 'טוֹב (Tov)' },
  { letter: 'י', name: 'Yod', transliteration: 'Y / I', numericalValue: 10, phoneticSound: 'Semivogal i como em "iogurte"', example: 'יְהוָה (YHWH)' },
  { letter: 'כ', finalForm: 'ך', name: 'Khaf / Chaf', transliteration: 'K / Kh', numericalValue: 20, phoneticSound: 'Com dagesh: K. Sem dagesh ou final: Kh gutural', example: 'כִּי (Ki)' },
  { letter: 'ל', name: 'Lamed', transliteration: 'L', numericalValue: 30, phoneticSound: 'L suave como em "luz"', example: 'לֵב (Lev)' },
  { letter: 'מ', finalForm: 'ם', name: 'Mem', transliteration: 'M', numericalValue: 40, phoneticSound: 'M bilabial como em "mãe"', example: 'מִזְמוֹר (Mizmor)' },
  { letter: 'נ', finalForm: 'ן', name: 'Nun', transliteration: 'N', numericalValue: 50, phoneticSound: 'N alveolar como em "navio"', example: 'נֶפֶשׁ (Nefesh)' },
  { letter: 'ס', name: 'Samekh', transliteration: 'S', numericalValue: 60, phoneticSound: 'S sibilante como em "sapo"', example: 'סוּס (Sus)' },
  { letter: 'ע', name: 'Ayin', transliteration: 'ʿ (gutural profundo)', numericalValue: 70, phoneticSound: 'Constrição laríngea profunda no fundo da garganta', example: 'עַל (Al)' },
  { letter: 'פ', finalForm: 'ף', name: 'Pe / Fe', transliteration: 'P / F', numericalValue: 80, phoneticSound: 'Com dagesh: P. Sem dagesh: F', example: 'פָּנִים (Panim)' },
  { letter: 'צ', finalForm: 'ץ', name: 'Tsadi', transliteration: 'Ts / Tz', numericalValue: 90, phoneticSound: 'Ts como em "tsunami" ou "pizza"', example: 'צֶלֶם (Tselem)' },
  { letter: 'ק', name: 'Qof', transliteration: 'Q / K', numericalValue: 100, phoneticSound: 'Q velar posterior forte', example: 'קָדוֹשׁ (Kadosh)' },
  { letter: 'ר', name: 'Resh', transliteration: 'R', numericalValue: 200, phoneticSound: 'R alveolar suave como em "caro"', example: 'רָעָה (Raah)' },
  { letter: 'ש', name: 'Shin / Sin', transliteration: 'Sh / S', numericalValue: 300, phoneticSound: 'Ponto à direita: Sh ("chá"). Ponto à esquerda: S', example: 'שָׁלוֹם (Shalom)' },
  { letter: 'ת', name: 'Tav', transliteration: 'T', numericalValue: 400, phoneticSound: 'T firme, última letra do alfabeto', example: 'תּוֹרָה (Torah)' }
];

export const GREEK_ALPHABET: AlphabetLetter[] = [
  { letter: 'Α α', name: 'Alfa', transliteration: 'a', numericalValue: 1, phoneticSound: 'A aberto como em "pai"', example: 'ἀγάπη (agápē)' },
  { letter: 'Β β', name: 'Beta', transliteration: 'b', numericalValue: 2, phoneticSound: 'B labial clássico ou V sonoro', example: 'βασιλεία (basileía)' },
  { letter: 'Γ γ', name: 'Gama', transliteration: 'g', numericalValue: 3, phoneticSound: 'G como em "glória"; antes de velar tem som "ng"', example: 'γράφω (gráphō)' },
  { letter: 'Δ δ', name: 'Delta', transliteration: 'd', numericalValue: 4, phoneticSound: 'D dental como em "Deus"', example: 'δόξα (dóxa)' },
  { letter: 'Ε ε', name: 'Épsilon', transliteration: 'e', numericalValue: 5, phoneticSound: 'E breve e aberto como em "pé"', example: 'εἰρήνη (eirēnē)' },
  { letter: 'Ζ ζ', name: 'Zeta', transliteration: 'z', numericalValue: 7, phoneticSound: 'Z sonoro ou dz como em "zelo"', example: 'ζωή (zōē)' },
  { letter: 'Η η', name: 'Eta', transliteration: 'ē', numericalValue: 8, phoneticSound: 'E longo e fechado como em "mesa"', example: 'ἡμέρα (hēmera)' },
  { letter: 'Θ θ', name: 'Teta', transliteration: 'th', numericalValue: 9, phoneticSound: 'T aspirado ou th interdental inglês como "think"', example: 'θεός (theós)' },
  { letter: 'Ι ι', name: 'Iota', transliteration: 'i', numericalValue: 10, phoneticSound: 'I agudo como em "vida"', example: 'Ἰησοῦς (Iēsoús)' },
  { letter: 'Κ κ', name: 'Capa', transliteration: 'k', numericalValue: 20, phoneticSound: 'C / K duro como em "casa"', example: 'κόσμος (kósmos)' },
  { letter: 'Λ λ', name: 'Lambda', transliteration: 'l', numericalValue: 30, phoneticSound: 'L límpido como em "luz"', example: 'λόγος (lógos)' },
  { letter: 'Μ μ', name: 'Mi', transliteration: 'm', numericalValue: 40, phoneticSound: 'M bilabial como em "mestre"', example: 'μακάριος (makários)' },
  { letter: 'Ν ν', name: 'Ni', transliteration: 'n', numericalValue: 50, phoneticSound: 'N nasal como em "novo"', example: 'νόμος (nómos)' },
  { letter: 'Ξ ξ', name: 'Xi', transliteration: 'x / ks', numericalValue: 60, phoneticSound: 'X / Ks como em "táxi"', example: 'ξένος (xénos)' },
  { letter: 'Ο ο', name: 'Ômicron', transliteration: 'o', numericalValue: 70, phoneticSound: 'O breve e aberto como em "sol"', example: 'οὐρανός (ouranós)' },
  { letter: 'Π π', name: 'Pi', transliteration: 'p', numericalValue: 80, phoneticSound: 'P labial como em "paz"', example: 'πνεῦμα (pneúma)' },
  { letter: 'Ρ ρ', name: 'Rô', transliteration: 'r', numericalValue: 100, phoneticSound: 'R vibrante como em "rio"', example: 'ῥῆμα (rhēma)' },
  { letter: 'Σ σ / ς', name: 'Sigma', transliteration: 's', numericalValue: 200, phoneticSound: 'S sibilante (ς usado apenas no fim da palavra)', example: 'σωτηρία (sōtēría)' },
  { letter: 'Τ τ', name: 'Tau', transliteration: 't', numericalValue: 300, phoneticSound: 'T oclusivo como em "tempo"', example: 'τέλος (télos)' },
  { letter: 'Υ υ', name: 'Ípsilon', transliteration: 'y / u', numericalValue: 400, phoneticSound: 'U francês (bico nos lábios com som de i)', example: 'υἱός (hyiós)' },
  { letter: 'Φ φ', name: 'Fi', transliteration: 'ph / f', numericalValue: 500, phoneticSound: 'F labiodental ou p aspirado', example: 'φῶς (phōs)' },
  { letter: 'Χ χ', name: 'Qui', transliteration: 'ch / kh', numericalValue: 600, phoneticSound: 'Kh gutural aspirado como no alemão "Bach"', example: 'χάρις (cháris)' },
  { letter: 'Ψ ψ', name: 'Psi', transliteration: 'ps', numericalValue: 700, phoneticSound: 'Ps duplo como em "psicologia"', example: 'ψυχή (psychē)' },
  { letter: 'Ω ω', name: 'Ômega', transliteration: 'ō', numericalValue: 800, phoneticSound: 'O longo e pleno, última letra do alfabeto', example: 'Ὦ (Ōmega)' }
];
