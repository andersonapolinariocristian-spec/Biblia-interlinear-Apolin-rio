import React, { useState, useEffect, useRef } from 'react';
import { Book, Verse, ViewMode, DisplaySettings, PersonalNote, WordToken } from '../types/bible';
import { VerseCard } from './VerseCard';
import { audioEngine } from '../utils/audioPlayer';
import { getVerseTranslationText, WORLD_TRANSLATIONS } from '../data/translationsData';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  Play, 
  Square, 
  Volume2, 
  Sparkles,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Lock,
  Globe2
} from 'lucide-react';

interface ComparativeViewProps {
  currentBook: Book;
  currentChapter: number;
  totalChapters: number;
  verses: Verse[];
  viewMode: ViewMode;
  settings: DisplaySettings;
  notes: PersonalNote[];
  onSelectWord: (token: WordToken) => void;
  onOpenNotesForVerse: (verse: Verse) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onOpenHebrewGuide?: () => void;
  onUpdateSettings?: (newSettings: DisplaySettings) => void;
  onOpenSettings?: () => void;
  onOpenGameForWord?: (token: WordToken, verse: Verse) => void;
  onOpenGameForVerse?: (verse: Verse) => void;
  onOpenHebrewGame?: () => void;
  onOpenCompareTranslations?: (verse?: Verse) => void;
  onOpenExegesis?: (verse?: Verse) => void;
}

export const ComparativeView: React.FC<ComparativeViewProps> = ({
  currentBook,
  currentChapter,
  totalChapters,
  verses,
  viewMode,
  settings,
  notes,
  onSelectWord,
  onOpenNotesForVerse,
  onPrevChapter,
  onNextChapter,
  onOpenHebrewGuide,
  onUpdateSettings,
  onOpenSettings,
  onOpenGameForWord,
  onOpenGameForVerse,
  onOpenHebrewGame,
  onOpenCompareTranslations,
  onOpenExegesis
}) => {
  const isHebrew = currentBook.language === 'hebrew';
  const activeTranslation = WORLD_TRANSLATIONS.find((t) => t.id === settings.selectedTranslation) || WORLD_TRANSLATIONS[0];

  // Audio Playback state for active verse
  const [activeAudio, setActiveAudio] = useState<{ verseNum: number; lang: 'pt' | 'orig' } | null>(null);

  // Continuous chapter playback state
  const [isChapterPlaying, setIsChapterPlaying] = useState<boolean>(false);
  const [chapterAudioLang, setChapterAudioLang] = useState<'pt' | 'orig' | null>(null);
  const isPlayingRef = useRef(false);

  // Stop audio if chapter changes
  useEffect(() => {
    audioEngine.stop();
    setActiveAudio(null);
    setIsChapterPlaying(false);
    setChapterAudioLang(null);
    isPlayingRef.current = false;
  }, [currentBook.id, currentChapter]);

  const handleToggleHebrewOrder = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        hebrewReadingOrder: settings.hebrewReadingOrder === 'traditional_rtl' ? 'didactic_ltr' : 'traditional_rtl'
      });
    }
  };

  const handleJumpToVerse = (verseNum: number) => {
    const elem = document.getElementById(`verse-${verseNum}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.classList.add('ring-2', 'ring-[#C9A227]');
      setTimeout(() => {
        elem.classList.remove('ring-2', 'ring-[#C9A227]');
      }, 2000);
    }
  };

  // Continuous chapter audio player
  const playChapterSequentially = (startIndex: number, lang: 'pt' | 'orig') => {
    if (!isPlayingRef.current || startIndex >= verses.length) {
      setIsChapterPlaying(false);
      setChapterAudioLang(null);
      setActiveAudio(null);
      isPlayingRef.current = false;
      return;
    }

    const currentV = verses[startIndex];
    setActiveAudio({ verseNum: currentV.verse, lang });

    // Scroll verse into view gently
    const elem = document.getElementById(`verse-${currentV.verse}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Prefetch upcoming verse in background for instantaneous transition with identical voice
    if (startIndex + 1 < verses.length) {
      const nextV = verses[startIndex + 1];
      if (lang === 'pt') {
        audioEngine.prefetch(nextV.portuguese, 'pt', settings.audioVoice);
      } else if (isHebrew) {
        audioEngine.prefetch(nextV.originalFull, 'he', settings.audioVoice);
      } else {
        audioEngine.prefetch(nextV.originalFull, 'el', settings.audioVoice);
      }
    }

    const onFinish = () => {
      if (isPlayingRef.current) {
        // Play next verse after slight breath
        setTimeout(() => {
          playChapterSequentially(startIndex + 1, lang);
        }, 300);
      }
    };

    if (lang === 'pt') {
      const textToSpeak = getVerseTranslationText(currentV.bookId, currentV.chapter, currentV.verse, currentV.portuguese, settings.selectedTranslation);
      audioEngine.speakPortuguese(textToSpeak, {
        voicePreference: settings.audioVoice,
        rate: settings.audioSpeed || 1.0,
        onEnd: onFinish,
        onError: onFinish
      });
    } else {
      if (isHebrew) {
        audioEngine.speakHebrew(currentV.originalFull, currentV.transliterationFull, {
          voicePreference: settings.audioVoice,
          rate: settings.audioSpeed || 1.0,
          onEnd: onFinish,
          onError: onFinish
        });
      } else {
        audioEngine.speakGreek(currentV.originalFull, currentV.transliterationFull, {
          voicePreference: settings.audioVoice,
          rate: settings.audioSpeed || 1.0,
          onEnd: onFinish,
          onError: onFinish
        });
      }
    }
  };

  const handleStartChapterAudio = (lang: 'pt' | 'orig') => {
    if (isChapterPlaying && chapterAudioLang === lang) {
      audioEngine.stop();
      setIsChapterPlaying(false);
      setChapterAudioLang(null);
      setActiveAudio(null);
      isPlayingRef.current = false;
      return;
    }

    audioEngine.stop();
    setIsChapterPlaying(true);
    setChapterAudioLang(lang);
    isPlayingRef.current = true;
    playChapterSequentially(0, lang);
  };

  const handleStopAllAudio = () => {
    audioEngine.stop();
    setIsChapterPlaying(false);
    setChapterAudioLang(null);
    setActiveAudio(null);
    isPlayingRef.current = false;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
      
      {/* Chapter Hero Banner: Compact, sacred and elegant */}
      <div className="relative p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#F5EFE3] via-[#FAF7F0] to-[#EFE8D6] border border-[#DFD6BD] shadow-xs overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#8C6D00] uppercase tracking-wider">
              <span>{currentBook.category}</span>
              <span>·</span>
              <span>{currentBook.testament === 'VT' ? 'Antigo Testamento' : 'Novo Testamento'}</span>
            </div>

            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#0C1B2A] tracking-tight">
                {currentBook.name} {currentChapter}
              </h1>
              <span
                dir={isHebrew ? 'rtl' : 'ltr'}
                lang={isHebrew ? 'he' : 'el'}
                className={`text-xl sm:text-2xl font-bold ${
                  isHebrew ? 'font-hebrew text-[#7A3E26]' : 'font-greek text-[#2A4D69]'
                }`}
              >
                {currentBook.originalName}
              </span>
              <span className="font-serif-bible italic text-xs sm:text-sm text-[#8C7E62]">
                ({currentBook.transliteratedName})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#554A34] max-w-2xl font-sans leading-relaxed">
              {currentBook.description}
            </p>
          </div>

          {/* Hebrew Reading Direction Toggle Badge (if Old Testament) */}
          {isHebrew && (
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
              <button
                onClick={handleToggleHebrewOrder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F2EDE1] text-[#0C1B2A] border border-[#DFD6BD] shadow-2xs transition-all cursor-pointer"
                title="Alternar entre ordem tradicional da Torá (RTL) e ordem didática ocidental (LTR)"
              >
                {settings.hebrewReadingOrder === 'traditional_rtl' ? (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Modo Tradicional (⟵ RTL)</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                    <span>Modo Didático (1 ➔ 2 ➔ 3)</span>
                  </>
                )}
              </button>

              {onOpenHebrewGuide && (
                <button
                  onClick={onOpenHebrewGuide}
                  className="p-1.5 rounded-xl text-[#8C6D00] hover:text-[#0C1B2A] bg-[#FFFBF0] hover:bg-[#F5EFE3] border border-[#E8DEC3] transition-colors cursor-pointer"
                  title="Entenda a ordem de leitura do hebraico bíblico"
                >
                  <HelpCircle className="w-4 h-4 text-[#C9A227]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Decorative Watermark Emblem Icon */}
        <div className="absolute right-[-15px] bottom-[-20px] opacity-5 pointer-events-none">
          <BookOpen className="w-44 h-44 text-[#0C1B2A]" />
        </div>
      </div>

      {/* Chapter Verses Audio & Quick Navigation Ribbon */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-[#DFD6BD] shadow-2xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#0C1B2A] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Capítulo Completo: {verses.length} versículos (1 a {verses.length})</span>
          </div>

          {/* Audio Player Controls for Chapter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Play Portuguese */}
            <button
              onClick={() => handleStartChapterAudio('pt')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isChapterPlaying && chapterAudioLang === 'pt'
                  ? 'bg-emerald-700 text-white animate-pulse shadow-xs'
                  : 'bg-[#F2EDE1] text-[#332D1F] hover:bg-emerald-600 hover:text-white'
              }`}
              title="Ouvir todo o capítulo lido em Português"
            >
              {isChapterPlaying && chapterAudioLang === 'pt' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar (PT)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ouvir Capítulo (PT)</span>
                </>
              )}
            </button>

            {/* Play Hebrew / Greek */}
            <button
              onClick={() => handleStartChapterAudio('orig')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isChapterPlaying && chapterAudioLang === 'orig'
                  ? 'bg-[#C9A227] text-[#0C1B2A] font-bold animate-pulse shadow-xs'
                  : 'bg-[#F2EDE1] text-[#332D1F] hover:bg-[#C9A227] hover:text-[#0C1B2A]'
              }`}
              title={`Ouvir todo o capítulo lido em ${isHebrew ? 'Hebraico' : 'Grego'}`}
            >
              {isChapterPlaying && chapterAudioLang === 'orig' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pausar ({isHebrew ? 'HE' : 'GR'})</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Ouvir ({isHebrew ? 'Hebraico' : 'Grego'})</span>
                </>
              )}
            </button>

            {/* Stop Any Audio */}
            {(isChapterPlaying || activeAudio) && (
              <button
                onClick={handleStopAllAudio}
                className="px-2 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Parar reprodução de áudio"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Parar</span>
              </button>
            )}

            {/* Voice Pill & Settings Trigger */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FAF6ED] hover:bg-[#F0E9DA] border border-[#E0D5BC] text-[#554A34] text-[11px] font-semibold transition-colors cursor-pointer"
                title="Voz padrão bloqueada para toda a Bíblia. Clique para ajustar velocidade."
              >
                <Lock className="w-3 h-3 text-[#C9A227]" />
                <span className="font-mono">{settings.audioVoice}</span>
                <span className="text-[#8C6D00] font-mono">({settings.audioSpeed || 1.0}x)</span>
              </button>
            )}

            {/* Adventist Exegesis Trigger */}
            {onOpenExegesis && (
              <button
                onClick={() => onOpenExegesis(verses[0])}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-[#C9A227] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                title="Exegese Bíblica Adventista do Capítulo (SDABC, Ellen White e Originais)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="font-cinzel font-bold">Exegese Adventista (IA)</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Verse Jump Numbers */}
        <div className="pt-2 border-t border-[#F0E8D5]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-[#786C50] font-sans shrink-0 mr-1">
              Saltar para:
            </span>
            {verses.map((v) => (
              <button
                key={v.verse}
                onClick={() => handleJumpToVerse(v.verse)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all shrink-0 ${
                  activeAudio?.verseNum === v.verse
                    ? 'bg-[#C9A227] text-[#0C1B2A] ring-2 ring-[#C9A227]/40 scale-105'
                    : 'bg-[#F5EFE3] hover:bg-[#0C1B2A] hover:text-white text-[#443C28]'
                }`}
                title={`Ir para o versículo ${v.verse}`}
              >
                v.{v.verse}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verses Flow Container: ALL VERSES OF THE CHAPTER */}
      <div className="space-y-6">
        {verses.map((verse) => {
          const verseNotes = notes.filter(
            (n) => n.bookName === currentBook.name && n.chapter === currentChapter && n.verse === verse.verse
          );

          return (
            <VerseCard
              key={`${verse.bookId}-${verse.chapter}-${verse.verse}`}
              verse={verse}
              viewMode={viewMode}
              settings={settings}
              verseNotes={verseNotes}
              activePlayingVerse={activeAudio}
              onSetActiveAudio={setActiveAudio}
              onSelectWord={onSelectWord}
              onOpenNotesForVerse={onOpenNotesForVerse}
              onOpenHebrewGuide={onOpenHebrewGuide}
              onToggleHebrewOrder={handleToggleHebrewOrder}
              onOpenGameForWord={onOpenGameForWord}
              onOpenGameForVerse={onOpenGameForVerse}
              onOpenCompareTranslations={onOpenCompareTranslations}
              onOpenExegesis={onOpenExegesis}
            />
          );
        })}
      </div>

      {/* Chapter Bottom Navigation Stepper */}
      <div className="pt-6 border-t border-[#DFD6BD] flex items-center justify-between text-xs">
        <button
          onClick={onPrevChapter}
          disabled={currentChapter <= 1}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DFD6BD] rounded-xl font-semibold text-[#0C1B2A] hover:bg-[#FAF6ED] disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Capítulo Anterior</span>
        </button>

        <span className="text-xs font-serif-bible italic text-[#786C50]">
          Bíblia Interlinear Apolinário · Texto Canônico Integral (Capítulo {currentChapter} Completo)
        </span>

        <button
          onClick={onNextChapter}
          disabled={currentChapter >= totalChapters}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DFD6BD] rounded-xl font-semibold text-[#0C1B2A] hover:bg-[#FAF6ED] disabled:opacity-30 transition-all"
        >
          <span>Próximo Capítulo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default ComparativeView;
