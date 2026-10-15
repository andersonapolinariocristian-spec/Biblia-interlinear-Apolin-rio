/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Verse, ViewMode, DisplaySettings, PersonalNote, WordToken, UserProfile } from './types/bible';
import { BIBLE_BOOKS } from './data/bibleBooks';
import { 
  getVersesForChapter, 
  loadChapterVerses,
  loadPersonalNotes, 
  savePersonalNotes, 
  loadSettings, 
  saveSettings 
} from './data/bibleEngine';
import { Header } from './components/Header';
import { ComparativeView } from './components/ComparativeView';
import { NavigationDrawer } from './components/NavigationDrawer';
import { WordLexiconModal } from './components/WordLexiconModal';
import { NotesDrawer } from './components/NotesDrawer';
import { AdvancedSearchModal } from './components/AdvancedSearchModal';
import { AlphabetModal } from './components/AlphabetModal';
import { SettingsModal } from './components/SettingsModal';
import { HebrewReadingGuideModal } from './components/HebrewReadingGuideModal';
import { HebrewWordGameModal } from './components/HebrewWordGameModal';
import { TranslationsModal } from './components/TranslationsModal';
import { ShareAndInstallModal } from './components/ShareAndInstallModal';
import { AdventistExegesisModal } from './components/AdventistExegesisModal';
import { CanonicalAuditModal } from './components/CanonicalAuditModal';
import { AuthModal } from './components/AuthModal';
import { PasswordRecoveryModal } from './components/PasswordRecoveryModal';
import { getSupabaseClient, profileFromSupabaseUser } from './services/authService';
import { SubscriptionModal } from './components/SubscriptionModal';
import { isUserPro } from './services/billingService';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const { isFullscreen, toggleFullscreen } = usePWAInstall();

  // Navigation State: default to Genesis (GEN) chapter 1
  const [currentBook, setCurrentBook] = useState<Book>(() => {
    return BIBLE_BOOKS.find((b) => b.id === 'GEN') || BIBLE_BOOKS[0];
  });
  const [currentChapter, setCurrentChapter] = useState<number>(1);

  // Display Settings & Personal Notes (persisted in localStorage)
  const [settings, setSettings] = useState<DisplaySettings>(() => loadSettings());
  const [notes, setNotes] = useState<PersonalNote[]>(() => loadPersonalNotes());

  // View Mode: 'classic_interlinear' (Palavra sob Palavra) or settings default
  const [viewMode, setViewMode] = useState<ViewMode>(() => settings.defaultViewMode || 'classic_interlinear');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(true);
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);

  // Restore only a verified Supabase session; never trust a profile cached in localStorage.
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setCurrentUser(null);
      setIsAuthOpen(true);
      return;
    }
    let active = true;
    client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session?.user) {
        setCurrentUser(null);
        setIsAuthOpen(true);
      } else {
        setCurrentUser(profileFromSupabaseUser(data.session.user));
        setIsAuthOpen(false);
      }
    }).catch(() => {
      if (active) setIsAuthOpen(true);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryOpen(true);
        setIsAuthOpen(false);
      }
      if (!active) return;
      setCurrentUser(session?.user ? profileFromSupabaseUser(session.user) : null);
      setIsAuthOpen(!session?.user);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Modal Dialogs State
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAlphabetOpen, setIsAlphabetOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHebrewGuideOpen, setIsHebrewGuideOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // World Translations Comparison Modal State
  const [isTranslationsOpen, setIsTranslationsOpen] = useState(false);
  const [compareVerse, setCompareVerse] = useState<Verse | null>(null);

  // Adventist AI Exegesis Modal State
  const [isExegesisOpen, setIsExegesisOpen] = useState(false);
  const [exegesisVerse, setExegesisVerse] = useState<Verse | null>(null);

  const handleOpenExegesis = (verse?: Verse) => {
    setExegesisVerse(verse || verses[0] || null);
    setIsExegesisOpen(true);
  };

  // Hebrew Word Assembly Game State
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [gameToken, setGameToken] = useState<WordToken | null>(null);
  const [gameVerse, setGameVerse] = useState<Verse | null>(null);

  // Selected word token for Lexicon Modal
  const [selectedWord, setSelectedWord] = useState<WordToken | null>(null);

  // Active verse for creating a note
  const [activeVerseForNote, setActiveVerseForNote] = useState<Verse | null>(null);

  const handleOpenGameForWord = (token: WordToken, verse?: Verse) => {
    setGameToken(token);
    setGameVerse(verse || verses.find((v) => v.words.some((w) => w.id === token.id)) || verses[0] || null);
    setIsGameOpen(true);
  };

  const handleOpenGameForVerse = (verse: Verse) => {
    setGameVerse(verse);
    setGameToken(verse.words[0] || null);
    setIsGameOpen(true);
  };

  const handleOpenHebrewGame = () => {
    setGameVerse(verses[0] || null);
    setGameToken(verses[0]?.words[0] || null);
    setIsGameOpen(true);
  };

  const handleOpenTranslations = (verse?: Verse) => {
    setCompareVerse(verse || verses[0] || null);
    setIsTranslationsOpen(true);
  };

  const handleSelectPrimaryTranslation = (translationId: string) => {
    setSettings((prev) => ({ ...prev, selectedTranslation: translationId }));
  };

  // Save notes whenever they change
  useEffect(() => {
    savePersonalNotes(notes);
  }, [notes]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Verses for current book and chapter with instant sync fallback + full canonical async loading
  const [verses, setVerses] = useState<Verse[]>(() => getVersesForChapter(currentBook.id, currentChapter));

  useEffect(() => {
    let active = true;
    const initial = getVersesForChapter(currentBook.id, currentChapter);
    setVerses(initial);

    loadChapterVerses(currentBook.id, currentChapter).then((canonicalVerses) => {
      if (active && canonicalVerses && canonicalVerses.length > 0) {
        setVerses(canonicalVerses);
      }
    });

    return () => {
      active = false;
    };
  }, [currentBook.id, currentChapter]);

  // Handlers for Chapter navigation
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.totalChapters) {
      setCurrentChapter((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectChapter = (book: Book, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Notes operations
  const handleSaveNote = (
    noteData: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>,
    noteId?: string
  ) => {
    const now = new Date().toISOString();
    if (noteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, ...noteData, updatedAt: now } : n
        )
      );
    } else {
      const newNote: PersonalNote = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenNotesForVerse = (verse: Verse) => {
    setActiveVerseForNote(verse);
    setIsNotesOpen(true);
  };

  // Search Jump handler
  const handleSelectSearchResult = (book: Book, chapter: number, verseNum: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setTimeout(() => {
      const elem = document.getElementById(`verse-${verseNum}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elem.classList.add('ring-2', 'ring-[#C9A227]');
        setTimeout(() => {
          elem.classList.remove('ring-2', 'ring-[#C9A227]');
        }, 2500);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] flex flex-col font-sans-ui selection:bg-[#E9D8A6] selection:text-[#0C1B2A]">
      {/* Top Header Bar */}
      <Header
        currentBook={currentBook}
        currentChapter={currentChapter}
        totalChapters={currentBook.totalChapters}
        viewMode={viewMode}
        notesCount={notes.length}
        onSelectViewMode={setViewMode}
        onOpenNavigation={() => setIsNavOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotes={() => {
          setActiveVerseForNote(null);
          setIsNotesOpen(true);
        }}
        onOpenAlphabet={() => setIsAlphabetOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onOpenHebrewGuide={() => setIsHebrewGuideOpen(true)}
        onOpenHebrewGame={handleOpenHebrewGame}
        onOpenTranslations={() => handleOpenTranslations()}
        activeTranslationId={settings.selectedTranslation}
        onOpenShare={() => setIsShareOpen(true)}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenExegesis={() => handleOpenExegesis()}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        isPro={isUserPro(currentUser)}
      />

      {/* Main Comparative Bible View */}
      <main className="flex-1">
        <ComparativeView
          currentBook={currentBook}
          currentChapter={currentChapter}
          totalChapters={currentBook.totalChapters}
          verses={verses}
          viewMode={viewMode}
          settings={settings}
          notes={notes}
          onSelectWord={(token) => setSelectedWord(token)}
          onOpenNotesForVerse={handleOpenNotesForVerse}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onOpenHebrewGuide={() => setIsHebrewGuideOpen(true)}
          onUpdateSettings={setSettings}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGameForWord={handleOpenGameForWord}
          onOpenGameForVerse={handleOpenGameForVerse}
          onOpenHebrewGame={handleOpenHebrewGame}
          onOpenCompareTranslations={(verse) => handleOpenTranslations(verse)}
          onOpenExegesis={handleOpenExegesis}
        />
      </main>

      {/* Footer */}
      <footer className="bg-[#F2EDE1] border-t border-[#DFD6BD] py-8 text-xs text-[#6B5E43]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-sm text-[#0C1B2A]">
              BÍBLIA INTERLINEAR APOLINÁRIO
            </span>
            <span>·</span>
            <button
              onClick={() => setIsAuditOpen(true)}
              className="text-[#8C6D00] hover:text-[#0C1B2A] hover:underline cursor-pointer transition-colors"
              title="Verificar conformidade dos 66 livros"
            >
              Auditoria dos 66 Livros
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-center sm:text-right">
            <span>Velho Testamento Hebraico • Novo Testamento Grego</span>
            <span>·</span>
            <button
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF6ED] hover:bg-[#EAE2CE] text-[#0C1B2A] font-semibold border border-[#DED4BC] transition-colors cursor-pointer text-xs"
              title="Abrir link de tela cheia ou baixar aplicativo PWA"
            >
              <span>📲</span>
              <span>Tela Inteira / Baixar PWA</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NavigationDrawer
        isOpen={isNavOpen}
        currentBook={currentBook}
        currentChapter={currentChapter}
        onClose={() => setIsNavOpen(false)}
        onSelectChapter={handleSelectChapter}
      />

      <WordLexiconModal
        token={selectedWord}
        language={currentBook.language}
        onClose={() => setSelectedWord(null)}
        onAddNoteForWord={(wordText, strong) => {
          setActiveVerseForNote(verses[0] || null);
          setIsNotesOpen(true);
        }}
        onOpenGameForWord={(token) => {
          setSelectedWord(null);
          handleOpenGameForWord(token);
        }}
      />

      <NotesDrawer
        isOpen={isNotesOpen}
        notes={notes}
        currentBook={currentBook}
        currentChapter={currentChapter}
        activeVerseForNote={activeVerseForNote}
        onClose={() => {
          setIsNotesOpen(false);
          setActiveVerseForNote(null);
        }}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
        onJumpToVerse={(bId, ch, v) => {
          const book = BIBLE_BOOKS.find((b) => b.id === bId);
          if (book) handleSelectSearchResult(book, ch, v);
        }}
      />

      <AdvancedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      <AlphabetModal
        isOpen={isAlphabetOpen}
        onClose={() => setIsAlphabetOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={setSettings}
        onOpenTranslationsModal={() => handleOpenTranslations()}
        onOpenShareModal={() => setIsShareOpen(true)}
        currentUser={currentUser}
        onOpenSubscriptionModal={() => setIsSubscriptionOpen(true)}
      />

      <HebrewReadingGuideModal
        isOpen={isHebrewGuideOpen}
        onClose={() => setIsHebrewGuideOpen(false)}
        currentOrder={settings.hebrewReadingOrder}
        onSelectOrder={(order) => {
          setSettings({ ...settings, hebrewReadingOrder: order });
        }}
      />

      {/* Hebrew Word Assembly Learning Game Modal Arena */}
      <HebrewWordGameModal
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        initialToken={gameToken}
        currentVerse={gameVerse}
        allVerses={verses}
        onSelectAnotherWord={(token) => setGameToken(token)}
      />

      {/* World Translations & Multilingual Parallel Versions Modal */}
      <TranslationsModal
        isOpen={isTranslationsOpen}
        onClose={() => setIsTranslationsOpen(false)}
        activeVerse={compareVerse || verses[0]}
        settings={settings}
        onSelectPrimaryTranslation={handleSelectPrimaryTranslation}
      />

      {/* Share Fullscreen Link & PWA Installation Modal */}
      <ShareAndInstallModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Adventist AI Exegesis Modal */}
      <AdventistExegesisModal
        isOpen={isExegesisOpen}
        onClose={() => {
          setIsExegesisOpen(false);
          setExegesisVerse(null);
        }}
        currentBook={currentBook}
        currentChapter={currentChapter}
        activeVerse={exegesisVerse}
        allVerses={verses}
        onSaveToNotes={(title, content, verseNum) => {
          handleSaveNote({
            verseKey: `${currentBook.id}:${currentChapter}:${verseNum}`,
            bookName: currentBook.name,
            chapter: currentChapter,
            verse: verseNum,
            title,
            content,
            tag: 'Exegese'
          });
        }}
      />

      {/* Modern Authentication / Login / Register Modal */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryOpen}
        onComplete={() => {
          setIsPasswordRecoveryOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {/* Google Play Billing & Pro Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      {/* Canonical 66-Book Linguistic & Theological Audit Modal */}
      <CanonicalAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        onSelectBook={(bookId) => {
          const b = BIBLE_BOOKS.find((x) => x.id === bookId);
          if (b) {
            handleSelectChapter(b, 1);
          }
        }}
      />
    </div>
  );
}
