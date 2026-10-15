export type Language = 'hebrew' | 'greek';
export type Testament = 'VT' | 'NT';

export interface WordToken {
  id: string;
  original: string; // Hebrew with Niqqud or Greek with polytonic accents
  transliteration: string; // Phonetic transliteration into Latin alphabet
  translation: string; // Literal Portuguese gloss
  strong: string; // e.g. H7225, G3056
  morphology: string; // e.g. Prep + Subst. Fem., V-Qal-Pf-3ms, etc.
  lemma?: string; // Dictionary base form
  definition?: string; // Extended lexical entry
}

export interface Verse {
  bookId: string;
  chapter: number;
  verse: number;
  testament: Testament;
  language: Language;
  words: WordToken[];
  originalFull: string;
  transliterationFull: string;
  portuguese: string;
  crossReferences?: string[];
  theologicalNote?: string;
}

export interface Book {
  id: string;
  name: string;
  originalName: string;
  transliteratedName: string;
  testament: Testament;
  language: Language;
  category: string;
  totalChapters: number;
  abbreviation: string;
  description: string;
}

export interface PersonalNote {
  id: string;
  verseKey: string; // "BOOK:CHAP:VER" e.g. "GEN:1:1"
  bookName: string;
  chapter: number;
  verse: number;
  title: string;
  content: string;
  tag: 'Exegese' | 'Teologia' | 'Hermenêutica' | 'Pregação' | 'Devocional' | 'Gramática';
  updatedAt: string;
  createdAt: string;
}

export type ViewMode = 'classic_interlinear' | 'parallel' | 'interlinear' | 'verse_by_verse';

export type HebrewReadingOrder = 'traditional_rtl' | 'didactic_ltr';

export interface DisplaySettings {
  showTransliteration: boolean;
  showStrong: boolean;
  showMorphology: boolean;
  showWordNumbers: boolean;
  hebrewReadingOrder: HebrewReadingOrder;
  fontSizeOriginal: number; // in px or rem scale
  fontSizePortuguese: number;
  theme: 'parchment' | 'dark' | 'clean';
  audioVoice: 'Puck' | 'Fenrir' | 'Kore' | 'Aoede' | 'Zephyr' | 'Charon';
  audioSpeed: number; // 0.8, 0.9, 1.0, 1.1, 1.2
  lockGenesisVoice: boolean; // Padronizar a voz de Gênesis 1:1 (Puck) para toda a Bíblia
  selectedTranslation: string; // Ex: 'ARA', 'ARC', 'NVI', 'KJV', 'VULG', etc.
  defaultViewMode?: ViewMode;
}

export type SubscriptionPlan = 'free' | 'monthly' | 'annual' | 'lifetime';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'Estudante' | 'Teólogo' | 'Pastor' | 'Líder' | 'Membro';
  createdAt: string;
  isPro?: boolean;
  plan?: SubscriptionPlan;
  proExpiresAt?: string;
}
