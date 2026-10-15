import React, { useState } from 'react';
import { Verse, WordToken, ViewMode, DisplaySettings, PersonalNote } from '../types/bible';
import { audioEngine } from '../utils/audioPlayer';
import { getVerseTranslationText, WORLD_TRANSLATIONS } from '../data/translationsData';
import { Volume2, Square, Edit3, BookmarkCheck, Copy, Check, Info, HelpCircle, ArrowLeft, ArrowRight, Globe2, Sparkles } from 'lucide-react';
import { translateGlossToPortuguese } from '../utils/greekLexiconPortuguese';
import { decodeMorphology } from '../utils/morphologyDecoder';

interface VerseCardProps {
  verse: Verse;
  viewMode: ViewMode;
  settings: DisplaySettings;
  verseNotes: PersonalNote[];
  activePlayingVerse: { verseNum: number; lang: 'pt' | 'orig' } | null;
  onSetActiveAudio: (info: { verseNum: number; lang: 'pt' | 'orig' } | null) => void;
  onSelectWord: (token: WordToken) => void;
  onOpenNotesForVerse: (verse: Verse) => void;
  onOpenHebrewGuide?: () => void;
  onToggleHebrewOrder?: () => void;
  onOpenGameForWord?: (token: WordToken, verse: Verse) => void;
  onOpenGameForVerse?: (verse: Verse) => void;
  onOpenCompareTranslations?: (verse: Verse) => void;
  onOpenExegesis?: (verse: Verse) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  viewMode,
  settings,
  verseNotes,
  activePlayingVerse,
  onSetActiveAudio,
  onSelectWord,
  onOpenNotesForVerse,
  onOpenHebrewGuide,
  onToggleHebrewOrder,
  onOpenGameForWord,
  onOpenGameForVerse,
  onOpenCompareTranslations,
  onOpenExegesis
}) => {
  const [copied, setCopied] = useState(false);
  const [showNoteDetails, setShowNoteDetails] = useState(false);

  const isHebrew = verse.language === 'hebrew';
  const isPlayingPT = activePlayingVerse?.verseNum === verse.verse && activePlayingVerse?.lang === 'pt';
  const isPlayingOrig = activePlayingVerse?.verseNum === verse.verse && activePlayingVerse?.lang === 'orig';

  const isRtlTraditional = isHebrew && settings.hebrewReadingOrder === 'traditional_rtl';

  // Active translation resolution
  const activeTranslationInfo = WORLD_TRANSLATIONS.find((t) => t.id === settings.selectedTranslation) || WORLD_TRANSLATIONS[0];
  const currentTranslationText = getVerseTranslationText(verse.bookId, verse.chapter, verse.verse, verse.portuguese, settings.selectedTranslation);


  const handlePlayPortuguese = () => {
    if (isPlayingPT) {
      audioEngine.stop();
      onSetActiveAudio(null);
      return;
    }

    onSetActiveAudio({ verseNum: verse.verse, lang: 'pt' });
    audioEngine.speakPortuguese(currentTranslationText, {
      voicePreference: settings.audioVoice,
      rate: settings.audioSpeed || 1.0,
      onEnd: () => onSetActiveAudio(null),
      onError: () => onSetActiveAudio(null)
    });
  };

  const handlePlayOriginal = () => {
    if (isPlayingOrig) {
      audioEngine.stop();
      onSetActiveAudio(null);
      return;
    }

    onSetActiveAudio({ verseNum: verse.verse, lang: 'orig' });
    if (isHebrew) {
      audioEngine.speakHebrew(verse.originalFull, verse.transliterationFull, {
        voicePreference: settings.audioVoice,
        rate: settings.audioSpeed || 1.0,
        onEnd: () => onSetActiveAudio(null),
        onError: () => onSetActiveAudio(null)
      });
    } else {
      audioEngine.speakGreek(verse.originalFull, verse.transliterationFull, {
        voicePreference: settings.audioVoice,
        rate: settings.audioSpeed || 1.0,
        onEnd: () => onSetActiveAudio(null),
        onError: () => onSetActiveAudio(null)
      });
    }
  };

  const handleCopyVerse = () => {
    const text = `[${verse.bookId} ${verse.chapter}:${verse.verse} - ${activeTranslationInfo.shortName}]\nOriginal: ${verse.originalFull}\nTransliteração: ${verse.transliterationFull}\nTradução (${activeTranslationInfo.name}): ${currentTranslationText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`verse-${verse.verse}`}
      className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all space-y-4 group ${
        isPlayingPT || isPlayingOrig
          ? 'border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-md bg-[#FFFDF9]'
          : 'border-[#E2D8C0] shadow-xs hover:border-[#C9A227]/70'
      }`}
    >
      {/* Verse Index & Audio Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#F0E9DA] gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-cinzel font-bold text-sm px-2.5 py-0.5 rounded-md bg-[#0C1B2A] text-white">
            v. {verse.verse}
          </span>
          <span className="text-[#786C50] text-[11px] font-sans">
            {verse.testament === 'VT' ? 'Texto Massorético (Hebraico Bíblico)' : 'Textus Receptus / NA28 (Grego Koiné)'}
          </span>
          {isHebrew && onOpenGameForVerse && (
            <button
              onClick={() => onOpenGameForVerse(verse)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF6ED] hover:bg-[#F0E8D5] text-[#7A5B00] border border-[#E2D8C0] transition-colors"
              title="Praticar as palavras e pontos massoréticos deste versículo no Game"
            >
              <span>🎮 Jogo do Versículo</span>
            </button>
          )}
        </div>

        {/* Dedicated Audio Controls (Portuguese & Hebrew/Greek with Human Voice) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Button: Speak Portuguese */}
          <button
            onClick={handlePlayPortuguese}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
              isPlayingPT
                ? 'bg-emerald-700 text-white animate-pulse'
                : 'bg-[#F2EDE1] hover:bg-emerald-600 hover:text-white text-[#3E3522]'
            }`}
            title="Ouvir este versículo com voz humana em Português"
          >
            {isPlayingPT ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar PT</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Áudio Português</span>
              </>
            )}
          </button>

          {/* Button: Speak Hebrew / Greek */}
          <button
            onClick={handlePlayOriginal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
              isPlayingOrig
                ? 'bg-[#C9A227] text-[#0C1B2A] font-bold animate-pulse'
                : 'bg-[#F2EDE1] hover:bg-[#C9A227] hover:text-[#0C1B2A] text-[#3E3522]'
            }`}
            title={`Ouvir pronúncia autêntica em ${isHebrew ? 'Hebraico' : 'Grego'}`}
          >
            {isPlayingOrig ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Parar {isHebrew ? 'Hebraico' : 'Grego'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Áudio {isHebrew ? 'Hebraico' : 'Grego'}</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyVerse}
            title="Copiar versículo completo"
            className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Adventist Exegesis AI Trigger */}
          {onOpenExegesis && (
            <button
              onClick={() => onOpenExegesis(verse)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50/90 hover:bg-amber-100 text-[#7A5B00] border border-[#C9A227]/50 shadow-2xs transition-all cursor-pointer"
              title="Exegese Adventista por IA para este versículo (SDABC, Ellen White e Originais)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Exegese IA</span>
            </button>
          )}

          {/* Notes Trigger */}
          <button
            onClick={() => onOpenNotesForVerse(verse)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              verseNotes.length > 0
                ? 'bg-[#C9A227]/15 text-[#7A5B00] border border-[#C9A227]'
                : 'text-[#675C44] hover:bg-[#F2EDE1] hover:text-[#0C1B2A]'
            }`}
            title="Anotações pessoais para este versículo"
          >
            {verseNotes.length > 0 ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#C9A227]" />
            ) : (
              <Edit3 className="w-3.5 h-3.5" />
            )}
            <span>{verseNotes.length > 0 ? `${verseNotes.length} nota(s)` : 'Anotar'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODE 0: CLASSIC INTERLINEAR (PALAVRA SOB PALAVRA - FORMATO TRADICIONAL IMPRESSO)
          ========================================================================= */}
      {viewMode === 'classic_interlinear' && (
        <div className="space-y-4">
          {/* Hebrew Reading Direction Header */}
          {isHebrew && (
            <div className="flex flex-wrap items-center justify-between p-2 rounded-xl bg-[#FAF6ED] border border-[#EDE5D2] text-[11px] gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#0C1B2A]">
                {isRtlTraditional ? (
                  <>
                    <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                    <span>Leitura Tradicional Massorética (Direita para a Esquerda ⟵)</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Ordem Didática Ocidental (Palavra 1, 2, 3... da Esquerda para a Direita ➔)</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onToggleHebrewOrder && (
                  <button
                    onClick={onToggleHebrewOrder}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white hover:bg-[#F2EDE1] text-[#8C6D00] border border-[#DFD6BD] transition-colors cursor-pointer"
                  >
                    Alternar para {isRtlTraditional ? 'Didático (➔ LTR)' : 'Tradicional (⟵ RTL)'}
                  </button>
                )}

                {onOpenHebrewGuide && (
                  <button
                    onClick={onOpenHebrewGuide}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[#786C50] hover:text-[#0C1B2A] bg-white border border-[#DFD6BD] transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-[#C9A227]" />
                    <span>Está invertido?</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Authentic Interlinear Flow (Palavra sobre Palavra) */}
          <div
            dir={isRtlTraditional ? 'rtl' : 'ltr'}
            lang={isHebrew ? 'he' : 'el'}
            className="flex flex-wrap items-start gap-x-4 sm:gap-x-5 gap-y-4 py-2"
          >
            {verse.words.map((token, index) => (
              <div
                key={token.id}
                onClick={() => onSelectWord(token)}
                className="group/word inline-flex flex-col items-center text-center cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[#C9A227]/15 hover:ring-1 hover:ring-[#C9A227]/60 transition-all min-w-[50px]"
                title={`${token.original} (${token.transliteration}) → ${token.translation} [${token.strong}] • Toque para ver léxico`}
              >
                {/* 1. Original Word (Hebraico / Grego) */}
                <span
                  className={`font-bold leading-tight text-[#0C1B2A] group-hover/word:text-[#C9A227] transition-colors ${
                    isHebrew ? 'font-hebrew' : 'font-greek'
                  }`}
                  style={{ fontSize: `${settings.fontSizeOriginal}px` }}
                >
                  {token.original}
                </span>

                {/* 2. Transliteration (Itálico fonético logo abaixo) */}
                {settings.showTransliteration && (
                  <span className="font-serif-bible italic text-[12px] text-[#8C6D00] mt-0.5 leading-tight select-none">
                    {token.transliteration}
                  </span>
                )}

                {/* 3. Literal Portuguese Translation (Palavra em português alinhada exatamente embaixo) */}
                <span 
                  className="font-sans font-bold text-xs sm:text-[13px] text-[#1C1917] mt-1 pt-0.5 border-t border-[#DFD6BD] group-hover/word:text-[#0C1B2A] transition-colors leading-tight"
                  style={{ fontSize: `${Math.max(12, settings.fontSizePortuguese - 2)}px` }}
                >
                  {translateGlossToPortuguese(token.translation, token.original)}
                </span>

                {/* 4. Strong's Concordance Code */}
                {settings.showStrong && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-[#F2EDE1] text-[#675C44] rounded mt-1 font-semibold group-hover/word:bg-[#C9A227]/30 transition-colors">
                    {token.strong}
                  </span>
                )}

                {/* 5. Morphology Tag */}
                {settings.showMorphology && (
                  <span 
                    className="text-[9px] text-[#8C7E62] font-mono mt-0.5 leading-none max-w-[110px] truncate opacity-80"
                    title={decodeMorphology(token.morphology).summary}
                  >
                    {decodeMorphology(token.morphology).technicalCode}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Full translated verse underneath */}
          <div className="p-3.5 rounded-xl bg-[#F5EFE3] border border-[#DFD6BD] space-y-1 mt-2">
            <div className="flex flex-wrap items-center justify-between text-[10px] uppercase font-semibold text-[#786C50] gap-1">
              <span>Tradução Fluente: {activeTranslationInfo.name} ({activeTranslationInfo.shortName})</span>
              {onOpenCompareTranslations && (
                <button
                  onClick={() => onOpenCompareTranslations(verse)}
                  className="text-[10px] text-[#8C6D00] hover:text-[#0C1B2A] font-bold underline cursor-pointer flex items-center gap-1"
                  title="Comparar este versículo em todas as traduções do mundo"
                >
                  <Globe2 className="w-3 h-3 text-[#C9A227]" />
                  <span>Comparar Traduções do Mundo</span>
                </button>
              )}
            </div>
            <p
              className="font-serif-bible text-[#1C1917] leading-relaxed"
              style={{ fontSize: `${settings.fontSizePortuguese}px` }}
            >
              {currentTranslationText}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 1: COMPARATIVE SIDE-BY-SIDE (LADO A LADO)
          ========================================================================= */}
      {viewMode === 'parallel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start divide-y lg:divide-y-0 lg:divide-x divide-[#EDE5D2]">
          
          {/* Left Column: Original Hebrew / Greek & Transliteration */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isHebrew ? (
                  <>
                    <span className="flex items-center gap-1 text-[#0C1B2A] font-bold">
                      {isRtlTraditional ? (
                        <>
                          <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                          <span>Hebraico Tradicional (⟵ RTL)</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                          <span>Hebraico Didático (➔ 1, 2, 3...)</span>
                        </>
                      )}
                    </span>

                    {/* Toggle Order Button */}
                    {onToggleHebrewOrder && (
                      <button
                        onClick={onToggleHebrewOrder}
                        className="px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold bg-[#FAF6ED] hover:bg-[#F2EDE1] text-[#8C6D00] border border-[#DFD6BD] transition-colors"
                        title="Alternar entre ordem tradicional da Torá (RTL) e ordem didática ocidental"
                      >
                        Alternar
                      </button>
                    )}

                    {/* Guide Help Button */}
                    {onOpenHebrewGuide && (
                      <button
                        onClick={onOpenHebrewGuide}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans text-[#786C50] hover:text-[#0C1B2A] bg-white hover:bg-[#F2EDE1] border border-[#DFD6BD] transition-colors"
                        title="Entenda por que o Hebraico parece estar ao contrário"
                      >
                        <HelpCircle className="w-3 h-3 text-[#C9A227]" />
                        <span>Está invertido?</span>
                      </button>
                    )}
                  </>
                ) : (
                  <span>Texto Grego Koiné</span>
                )}

                {isPlayingOrig && (
                  <span className="px-1.5 py-0.2 bg-[#C9A227] text-[#0C1B2A] font-bold text-[9px] rounded-full animate-bounce">
                    Ouvindo...
                  </span>
                )}
              </div>

              <span className="italic text-[10px] lowercase text-[#C9A227]">toque nas palavras para léxico</span>
            </div>

            {/* Interactive Original Word Flow */}
            <div
              dir={isRtlTraditional ? 'rtl' : 'ltr'}
              lang={isHebrew ? 'he' : 'el'}
              className={`leading-loose tracking-wide ${
                isRtlTraditional ? 'font-hebrew text-right' : isHebrew ? 'font-hebrew text-left' : 'font-greek text-left'
              }`}
            >
              {verse.words.map((token, index) => (
                <button
                  key={token.id}
                  onClick={() => onSelectWord(token)}
                  className="inline-flex items-center gap-1 mx-1 my-0.5 px-2 py-0.5 rounded-lg hover:bg-[#C9A227]/20 hover:text-[#0C1B2A] transition-all cursor-pointer font-bold border border-transparent hover:border-[#C9A227]/40 text-[#0C1B2A]"
                  style={{ fontSize: `${settings.fontSizeOriginal}px` }}
                  title={`${token.original} (${token.transliteration}) → ${token.translation} [${token.strong}]`}
                >
                  {settings.showWordNumbers && (
                    <span className="text-[10px] font-mono font-normal text-[#8C7E62] opacity-75 self-start -mt-0.5">
                      {index + 1}
                    </span>
                  )}
                  <span>{token.original}</span>
                </button>
              ))}
            </div>

            {/* Full Phonetic Transliteration */}
            {settings.showTransliteration && (
              <div className="p-3 rounded-xl bg-[#FAF6ED] border border-[#EDE5D2] space-y-1">
                <span className="text-[10px] uppercase font-semibold text-[#8C7E62] block">
                  Transliteração Fonética (Pronúncia):
                </span>
                <p className="font-serif-bible italic text-sm text-[#8C6D00] leading-relaxed">
                  {verse.transliterationFull}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Active Translation & Theological Exegesis */}
          <div className="lg:pl-6 pt-4 lg:pt-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold gap-1">
              <span className="flex items-center gap-1.5">
                <span>Tradução: {activeTranslationInfo.name} ({activeTranslationInfo.shortName})</span>
                {isPlayingPT && (
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[9px] rounded-full animate-bounce">
                    Ouvindo...
                  </span>
                )}
              </span>

              {onOpenCompareTranslations && (
                <button
                  onClick={() => onOpenCompareTranslations(verse)}
                  className="flex items-center gap-1 text-[10px] text-[#8C6D00] hover:text-[#0C1B2A] font-bold underline cursor-pointer"
                  title="Comparar este versículo em todas as traduções do mundo"
                >
                  <Globe2 className="w-3 h-3 text-[#C9A227]" />
                  <span>Comparar Traduções ({WORLD_TRANSLATIONS.length})</span>
                </button>
              )}
            </div>

            <p
              className="font-serif-bible text-[#1C1917] leading-relaxed"
              style={{ fontSize: `${settings.fontSizePortuguese}px` }}
            >
              {currentTranslationText}
            </p>

            {/* Theological Note if available */}
            {verse.theologicalNote && (
              <div className="p-3 rounded-xl bg-[#F4EFE2] border border-[#DFD6BD] text-xs text-[#443A27] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <p className="leading-snug">{verse.theologicalNote}</p>
              </div>
            )}

            {/* Cross References */}
            {verse.crossReferences && verse.crossReferences.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[#786C50]">
                <span className="font-serif-bible italic">Referências Cruzadas:</span>
                <div className="flex flex-wrap gap-1">
                  {verse.crossReferences.map((ref) => (
                    <span
                      key={ref}
                      className="px-1.5 py-0.2 rounded bg-[#F2EDE1] text-[#0C1B2A] font-semibold text-[11px]"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          MODE 2: WORD-BY-WORD INTERLINEAR BLOCKS (INTERLINEAR MORFÊMICO)
          ========================================================================= */}
      {viewMode === 'interlinear' && (
        <div className="space-y-4">
          {/* Hebrew Reading Direction Header in Interlinear Mode */}
          {isHebrew && (
            <div className="flex flex-wrap items-center justify-between p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EDE5D2] text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0C1B2A] flex items-center gap-1.5">
                  {isRtlTraditional ? (
                    <>
                      <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                      <span>Leitura Tradicional Massorética (Direita para a Esquerda ⟵)</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Ordem Didática Ocidental (Palavra 1, 2, 3... da Esquerda para a Direita ➔)</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onToggleHebrewOrder && (
                  <button
                    onClick={onToggleHebrewOrder}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-[#F2EDE1] text-[#8C6D00] border border-[#DFD6BD] transition-colors"
                  >
                    Alternar para {isRtlTraditional ? 'Didático (➔ LTR)' : 'Tradicional (⟵ RTL)'}
                  </button>
                )}

                {onOpenHebrewGuide && (
                  <button
                    onClick={onOpenHebrewGuide}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#786C50] hover:text-[#0C1B2A] bg-white border border-[#DFD6BD] transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Está invertido?</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            dir={isRtlTraditional ? 'rtl' : 'ltr'}
            lang={isHebrew ? 'he' : 'el'}
            className="flex flex-wrap gap-2.5"
          >
            {verse.words.map((token, index) => (
              <div
                key={token.id}
                onClick={() => onSelectWord(token)}
                className="group/word p-2.5 rounded-xl bg-[#FAF7F0] border border-[#DFD6BD] hover:border-[#C9A227] hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between items-center text-center cursor-pointer min-w-[85px] max-w-[130px]"
              >
                {/* Word index badge */}
                {settings.showWordNumbers && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EAE2D0] text-[#6B5E43] mb-1">
                    #{index + 1}
                  </span>
                )}

                {/* 1. Original Script */}
                <span
                  className={`font-bold text-[#0C1B2A] leading-tight group-hover/word:text-[#C9A227] transition-colors ${
                    isHebrew ? 'font-hebrew' : 'font-greek'
                  }`}
                  style={{ fontSize: `${settings.fontSizeOriginal}px` }}
                >
                  {token.original}
                </span>

                {/* 2. Transliteration */}
                {settings.showTransliteration && (
                  <span className="font-serif-bible italic text-[12px] text-[#8C6D00] mt-1 leading-none">
                    {token.transliteration}
                  </span>
                )}

                {/* 3. Strong's Concordance code */}
                {settings.showStrong && (
                  <span className="text-[10px] font-mono px-1 py-0.2 bg-[#F0E9DA] text-[#6B5E43] rounded mt-1 font-semibold">
                    {token.strong}
                  </span>
                )}

                {/* 4. Literal Portuguese Translation */}
                <span className="text-xs font-bold text-[#1C1917] mt-1.5 border-t border-[#EDE5D2] pt-1 w-full leading-tight">
                  {translateGlossToPortuguese(token.translation, token.original)}
                </span>

                {/* 5. Morphology */}
                {settings.showMorphology && (
                  <span 
                    className="text-[9px] text-[#8C7E62] font-mono mt-0.5 leading-tight truncate max-w-full"
                    title={decodeMorphology(token.morphology).summary}
                  >
                    {decodeMorphology(token.morphology).technicalCode}
                  </span>
                )}

                {/* Quick Game Trigger for Hebrew word */}
                {isHebrew && onOpenGameForWord && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGameForWord(token, verse);
                    }}
                    className="text-[9px] text-[#8C6D00] hover:text-[#0C1B2A] font-semibold flex items-center justify-center gap-0.5 mt-1 pt-1 border-t border-[#EDE5D2] w-full transition-colors cursor-pointer"
                    title={`Montar "${token.original}" no Game Hebraico`}
                  >
                    <span>🎮 Montar</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Full translated verse underneath */}
          <div className="p-3.5 rounded-xl bg-[#F5EFE3] border border-[#DFD6BD] space-y-1">
            <div className="flex flex-wrap items-center justify-between text-[10px] uppercase font-semibold text-[#786C50] gap-1">
              <span>Tradução Ativa: {activeTranslationInfo.name} ({activeTranslationInfo.shortName})</span>
              {onOpenCompareTranslations && (
                <button
                  onClick={() => onOpenCompareTranslations(verse)}
                  className="text-[10px] text-[#8C6D00] hover:text-[#0C1B2A] font-bold underline cursor-pointer flex items-center gap-1"
                  title="Comparar este versículo em todas as traduções do mundo"
                >
                  <Globe2 className="w-3 h-3 text-[#C9A227]" />
                  <span>Comparar Traduções do Mundo</span>
                </button>
              )}
            </div>
            <p
              className="font-serif-bible text-[#1C1917] leading-relaxed"
              style={{ fontSize: `${settings.fontSizePortuguese}px` }}
            >
              {currentTranslationText}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 3: VERSE-BY-VERSE (LINHA A LINHA)
          ========================================================================= */}
      {viewMode === 'verse_by_verse' && (
        <div className="space-y-3">
          {/* Original Line */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] uppercase font-semibold text-[#786C50] block">
                {isHebrew 
                  ? (isRtlTraditional ? 'Texto Massorético Hebraico (⟵ RTL: Direita para a Esquerda)' : 'Texto Hebraico (➔ Ordem Didática: 1, 2, 3...)') 
                  : 'Texto Original Grego'}:
              </span>
              {isHebrew && onToggleHebrewOrder && (
                <button
                  onClick={onToggleHebrewOrder}
                  className="text-[10px] text-[#8C6D00] underline hover:text-[#0C1B2A]"
                >
                  Alternar ordem
                </button>
              )}
            </div>
            <p
              dir={isRtlTraditional ? 'rtl' : 'ltr'}
              lang={isHebrew ? 'he' : 'el'}
              className={`font-bold leading-relaxed text-[#0C1B2A] ${
                isRtlTraditional ? 'font-hebrew text-right' : isHebrew ? 'font-hebrew text-left' : 'font-greek text-left'
              }`}
              style={{ fontSize: `${settings.fontSizeOriginal}px` }}
            >
              {verse.originalFull}
            </p>
          </div>

          {/* Transliteration Line */}
          {settings.showTransliteration && (
            <div className="p-2.5 rounded-xl bg-[#FAF6ED] border border-[#EDE5D2]">
              <span className="text-[10px] uppercase font-semibold text-[#8C7E62] block">
                Transliteração Fonética:
              </span>
              <p className="font-serif-bible italic text-sm text-[#8C6D00] leading-relaxed">
                {verse.transliterationFull}
              </p>
            </div>
          )}

          {/* Translated Line */}
          <div>
            <div className="flex flex-wrap items-center justify-between text-[10px] uppercase font-semibold text-[#786C50] mb-0.5 gap-1">
              <span>Tradução: {activeTranslationInfo.name} ({activeTranslationInfo.shortName}):</span>
              {onOpenCompareTranslations && (
                <button
                  onClick={() => onOpenCompareTranslations(verse)}
                  className="text-[10px] text-[#8C6D00] hover:text-[#0C1B2A] font-bold underline cursor-pointer flex items-center gap-1"
                  title="Comparar este versículo em todas as traduções do mundo"
                >
                  <Globe2 className="w-3 h-3 text-[#C9A227]" />
                  <span>Comparar Traduções</span>
                </button>
              )}
            </div>
            <p
              className="font-serif-bible text-[#1C1917] leading-relaxed"
              style={{ fontSize: `${settings.fontSizePortuguese}px` }}
            >
              {currentTranslationText}
            </p>
          </div>
        </div>
      )}

      {/* Integrated Existing Notes Preview for this verse */}
      {verseNotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#F0E9DA]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#7A5B00] flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#C9A227]" />
              {verseNotes.length} anotação(ões) pessoal(is) neste versículo
            </span>
            <button
              onClick={() => setShowNoteDetails(!showNoteDetails)}
              className="text-[#0C1B2A] hover:underline font-semibold text-[11px]"
            >
              {showNoteDetails ? 'Ocultar notas' : 'Ver anotações'}
            </button>
          </div>

          {showNoteDetails && (
            <div className="mt-2 space-y-2">
              {verseNotes.map((n) => (
                <div key={n.id} className="p-3 bg-[#FAF7F0] border border-[#E5DCBF] rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0C1B2A]">{n.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#EAE2D0] font-semibold text-[#7A5B00]">
                      {n.tag}
                    </span>
                  </div>
                  <p className="text-[#332D1F] whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
