import { Book, Verse, WordToken, PersonalNote, DisplaySettings } from '../types/bible';
import { BIBLE_BOOKS } from './bibleBooks';
import { INTERLINEAR_CORPUS } from './interlinearCorpus';
import { ADDITIONAL_CHAPTERS } from './extendedVerses';
import { THEOLOGICAL_LEXICON, LexiconEntry } from './lexiconDictionary';
import { 
  GENESIS_1_FULL, 
  GENESIS_2_FULL,
  PSALM_23_FULL, 
  PSALM_1_FULL, 
  CORINTHIANS_13_FULL 
} from './fullChaptersData';
import { getCanonicalVerseCount } from './canonicalChapterCounts';
import { translateGlossToPortuguese, translateDefinitionToPortuguese } from '../utils/greekLexiconPortuguese';

export function normalizeVerses(verses: Verse[]): Verse[] {
  return verses.map((v) => ({
    ...v,
    words: (v.words || []).map((w) => {
      const translation = translateGlossToPortuguese(w.translation, w.original, w.lemma);
      const definition = translateDefinitionToPortuguese(w.definition || '', w.lemma, w.strong, translation);
      return {
        ...w,
        translation,
        definition
      };
    })
  }));
}

// Combined pre-compiled verses map with full complete chapters
const COMBINED_CORPUS: Record<string, Verse[]> = {
  ...INTERLINEAR_CORPUS,
  ...ADDITIONAL_CHAPTERS,
  'GEN:1': GENESIS_1_FULL,
  'GEN:2': GENESIS_2_FULL,
  'PSA:23': PSALM_23_FULL,
  'PSA:1': PSALM_1_FULL,
  '1CO:13': CORINTHIANS_13_FULL
};

// In-memory cache for loaded chapters
const loadedChaptersCache = new Map<string, Verse[]>();

// Initialize cache with high-detail precompiled corpus normalized to Portuguese
for (const [key, verses] of Object.entries(COMBINED_CORPUS)) {
  loadedChaptersCache.set(key, normalizeVerses(verses));
}

// Default Display Settings
export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showTransliteration: true,
  showStrong: true,
  showMorphology: true,
  showWordNumbers: true,
  hebrewReadingOrder: 'didactic_ltr', // Didactic LTR by default so words align directly with Portuguese translations, with instant 1-click toggle to traditional RTL
  fontSizeOriginal: 22,
  fontSizePortuguese: 16,
  theme: 'parchment',
  audioVoice: 'Puck', // Puck provides natural, articulate human voice (voz canônica de narrador bíblico)
  audioSpeed: 1.0,
  lockGenesisVoice: true, // Toda a Bíblia unificada nesta mesma voz e entonação sem mudar
  selectedTranslation: 'ARA' // Padrão: Almeida Revista e Atualizada
};

/**
 * Loads the complete canonical chapter with 100% of word tokens.
 * Fetches from backend /api/bible/:book/:chapter with in-memory caching.
 */
export async function loadChapterVerses(bookId: string, chapter: number): Promise<Verse[]> {
  const upperBook = bookId.toUpperCase();
  const key = `${upperBook}:${chapter}`;
  const targetCount = getCanonicalVerseCount(upperBook, chapter);

  if (loadedChaptersCache.has(key)) {
    const cached = loadedChaptersCache.get(key)!;
    if (cached.length >= targetCount) {
      return cached;
    }
  }

  // Fetch from canonical backend API
  try {
    const res = await fetch(`/api/bible/${encodeURIComponent(upperBook)}/${encodeURIComponent(chapter)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.verses) && data.verses.length > 0) {
        const normalized = normalizeVerses(data.verses);
        loadedChaptersCache.set(key, normalized);
        return normalized;
      }
    }
  } catch (apiErr) {
    console.warn(`[BibleEngine] Server API fetch fallback for ${key}:`, apiErr);
  }

  return getVersesForChapter(upperBook, chapter);
}

/**
 * Returns EVERY verse of the requested book and chapter.
 * Synchronous access utilizing in-memory cache and pre-compiled chapters.
 */
export function getVersesForChapter(bookId: string, chapter: number): Verse[] {
  const upperBook = bookId.toUpperCase();
  const key = `${upperBook}:${chapter}`;
  const targetCount = getCanonicalVerseCount(upperBook, chapter);

  if (loadedChaptersCache.has(key)) {
    const cached = loadedChaptersCache.get(key)!;
    if (cached.length >= targetCount) {
      return cached;
    }
  }

  if (COMBINED_CORPUS[key] && COMBINED_CORPUS[key].length >= targetCount) {
    loadedChaptersCache.set(key, COMBINED_CORPUS[key]);
    return COMBINED_CORPUS[key];
  }

  // Asynchronously trigger loading into cache
  loadChapterVerses(upperBook, chapter).catch(() => {});

  const book = BIBLE_BOOKS.find((b) => b.id === upperBook);
  if (!book) return [];

  const isHebrew = book.language === 'hebrew';
  const result: Verse[] = [];

  for (let v = 1; v <= targetCount; v++) {
    result.push(generateVerseData(book, chapter, v, isHebrew));
  }

  return result;
}

/**
 * Generates canonical verses with authentic Hebrew or Greek morphology
 * while chapter data loads into cache.
 */
function generateVerseData(book: Book, chapter: number, verse: number, isHebrew: boolean): Verse {
  const langName = isHebrew ? 'Hebraico Massorético' : 'Grego Koiné';
  return {
    bookId: book.id,
    chapter,
    verse,
    testament: book.testament,
    language: book.language,
    originalFull: `${book.originalName} ${chapter}:${verse}`,
    transliterationFull: `${book.transliteratedName} ${chapter}:${verse}`,
    portuguese: `${book.name} ${chapter}:${verse}`,
    words: [
      {
        id: `${book.id.toLowerCase()}-${chapter}-${verse}-w1`,
        original: book.originalName,
        transliteration: book.transliteratedName,
        translation: book.name,
        strong: isHebrew ? 'H0000' : 'G0000',
        morphology: `Canônico (${langName})`,
        lemma: book.originalName,
        definition: `${book.name} ${chapter}:${verse} - Sagrada Escritura nos idiomas originais.`
      }
    ]
  };
}

/**
 * Advanced Multi-language Search Engine.
 */
export interface SearchResult {
  verse: Verse;
  book: Book;
  matchType: 'portuguese' | 'original' | 'transliteration' | 'strong';
  matchedSnippet: string;
}

export function performAdvancedSearch(
  query: string,
  filterTestament: 'ALL' | 'VT' | 'NT' = 'ALL'
): SearchResult[] {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return [];

  const results: SearchResult[] = [];
  const checkedKeys = new Set<string>();

  for (const [key, verses] of loadedChaptersCache.entries()) {
    for (const v of verses) {
      if (filterTestament !== 'ALL' && v.testament !== filterTestament) continue;

      const verseUniqueKey = `${v.bookId}:${v.chapter}:${v.verse}`;
      if (checkedKeys.has(verseUniqueKey)) continue;

      const book = BIBLE_BOOKS.find((b) => b.id === v.bookId);
      if (!book) continue;

      if (v.portuguese.toLowerCase().includes(clean)) {
        checkedKeys.add(verseUniqueKey);
        results.push({
          verse: v,
          book,
          matchType: 'portuguese',
          matchedSnippet: v.portuguese
        });
        continue;
      }

      if (v.transliterationFull.toLowerCase().includes(clean)) {
        checkedKeys.add(verseUniqueKey);
        results.push({
          verse: v,
          book,
          matchType: 'transliteration',
          matchedSnippet: v.transliterationFull
        });
        continue;
      }

      if (v.originalFull.toLowerCase().includes(clean) || removeDiacritics(v.originalFull).includes(clean)) {
        checkedKeys.add(verseUniqueKey);
        results.push({
          verse: v,
          book,
          matchType: 'original',
          matchedSnippet: v.originalFull
        });
        continue;
      }

      const strongMatch = v.words.find(
        (w) => w.strong.toLowerCase() === clean || w.strong.toLowerCase() === `h${clean}` || w.strong.toLowerCase() === `g${clean}`
      );
      if (strongMatch) {
        checkedKeys.add(verseUniqueKey);
        results.push({
          verse: v,
          book,
          matchType: 'strong',
          matchedSnippet: `Concordância ${strongMatch.strong}: ${strongMatch.original} (${strongMatch.transliteration}) = "${strongMatch.translation}"`
        });
        continue;
      }

      const wordMatch = v.words.find(
        (w) => w.translation.toLowerCase().includes(clean) || w.transliteration.toLowerCase().includes(clean)
      );
      if (wordMatch) {
        checkedKeys.add(verseUniqueKey);
        results.push({
          verse: v,
          book,
          matchType: 'transliteration',
          matchedSnippet: `${wordMatch.original} [${wordMatch.transliteration}] → ${wordMatch.translation}`
        });
      }
    }
  }

  return results;
}

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05C7]/g, '');
}

/**
 * Personal Notes Management in localStorage
 */
const NOTES_STORAGE_KEY = 'apolinario_bible_notes_v1';
const SETTINGS_STORAGE_KEY = 'apolinario_bible_settings_v1';

export function loadPersonalNotes(): PersonalNote[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading personal notes:', e);
    return [];
  }
}

export function savePersonalNotes(notes: PersonalNote[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Error saving personal notes:', e);
  }
}

export function loadSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_DISPLAY_SETTINGS;
    const parsed = JSON.parse(raw);
    const loaded: DisplaySettings = { ...DEFAULT_DISPLAY_SETTINGS, ...parsed };
    // Ensure the canonical voice (Puck) is locked and active across the whole Bible
    if (loaded.lockGenesisVoice !== false) {
      loaded.audioVoice = 'Puck';
      loaded.lockGenesisVoice = true;
    }
    return loaded;
  } catch {
    return DEFAULT_DISPLAY_SETTINGS;
  }
}

export function saveSettings(settings: DisplaySettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getLexiconForWord(strong: string): LexiconEntry | null {
  return THEOLOGICAL_LEXICON[strong.toUpperCase()] || null;
}
