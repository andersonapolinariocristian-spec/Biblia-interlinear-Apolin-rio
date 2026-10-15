import React, { useState, useEffect, useRef } from 'react';
import { WordToken, Verse } from '../types/bible';
import { segmentHebrewWord, HebrewLetterSegment, getHebrewConsonants } from '../data/hebrewGrammarAnalysis';
import { audioEngine } from '../utils/audioPlayer';
import { 
  X, 
  Volume2, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Shuffle, 
  Trophy, 
  Flame, 
  Lightbulb, 
  BookOpen, 
  Play, 
  Check, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HebrewWordGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: WordToken | null;
  currentVerse?: Verse | null;
  allVerses?: Verse[];
  onSelectAnotherWord?: (token: WordToken) => void;
}

interface TileItem {
  id: string;
  char: string;
  originalIndex: number;
  segmentInfo?: HebrewLetterSegment;
}

export const HebrewWordGameModal: React.FC<HebrewWordGameModalProps> = ({
  isOpen,
  onClose,
  initialToken,
  currentVerse,
  allVerses = [],
  onSelectAnotherWord
}) => {
  // Current active word for the game
  const [currentToken, setCurrentToken] = useState<WordToken | null>(initialToken || null);
  const [verseWords, setVerseWords] = useState<WordToken[]>([]);
  const [wordIndexInVerse, setWordIndexInVerse] = useState<number>(0);

  // Game Mode: 'masoretic' (consonants + nikkud syllables) or 'consonantal' (pure base consonants)
  const [gameMode, setGameMode] = useState<'masoretic' | 'consonantal'>('masoretic');

  // Assembled and available letter tiles
  const [targetSegments, setTargetSegments] = useState<HebrewLetterSegment[]>([]);
  const [scrambledPool, setScrambledPool] = useState<TileItem[]>([]);
  const [assembledSlots, setAssembledSlots] = useState<(TileItem | null)[]>([]);

  // Feedback, hints & score state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('hebrew_game_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('hebrew_game_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Sound effects synthesizer using Web Audio API
  const playVictorySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Harmonic liturgical chime progression (C5 - E5 - G5 - C6)
      playTone(523.25, 0.0, 0.4);
      playTone(659.25, 0.12, 0.4);
      playTone(783.99, 0.24, 0.5);
      playTone(1046.50, 0.36, 0.8);
    } catch {
      // Audio context error or user has not interacted
    }
  };

  const playTileClickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }
  };

  // Sync token whenever initialToken changes
  useEffect(() => {
    if (initialToken) {
      setCurrentToken(initialToken);
    }
  }, [initialToken]);

  // Sync list of words from currentVerse
  useEffect(() => {
    if (currentVerse && currentVerse.words.length > 0) {
      setVerseWords(currentVerse.words);
      if (currentToken) {
        const idx = currentVerse.words.findIndex((w) => w.id === currentToken.id);
        setWordIndexInVerse(idx >= 0 ? idx : 0);
      } else {
        setCurrentToken(currentVerse.words[0]);
        setWordIndexInVerse(0);
      }
    }
  }, [currentVerse, currentToken?.id]);

  // Initialize or reset puzzle when currentToken or gameMode changes
  useEffect(() => {
    if (!currentToken) return;

    const segments = segmentHebrewWord(currentToken.original);
    setTargetSegments(segments);

    let itemsToScramble: TileItem[] = [];

    if (gameMode === 'masoretic') {
      itemsToScramble = segments.map((seg, idx) => ({
        id: `seg-${idx}-${seg.raw}`,
        char: seg.raw,
        originalIndex: idx,
        segmentInfo: seg
      }));
    } else {
      // Pure consonants
      const consonants = getHebrewConsonants(currentToken.original);
      itemsToScramble = consonants.map((c, idx) => ({
        id: `cons-${idx}-${c}`,
        char: c,
        originalIndex: idx
      }));
    }

    // Scramble tiles thoroughly ensuring it doesn't match original by accident if length > 1
    const shuffled = [...itemsToScramble];
    if (shuffled.length > 1) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // If shuffle happened to match target order, invert
      if (shuffled.every((s, idx) => s.originalIndex === idx)) {
        shuffled.reverse();
      }
    }

    setScrambledPool(shuffled);
    setAssembledSlots(new Array(itemsToScramble.length).fill(null));
    setIsCompleted(false);
    setIsWrong(false);
    setHintsUsed(0);
    setHintMessage(null);
  }, [currentToken, gameMode]);

  if (!isOpen || !currentToken) return null;

  // Handle clicking a tile in the scrambled bank (move to first empty slot)
  const handlePlaceTile = (tile: TileItem) => {
    if (isCompleted) return;
    playTileClickSound();

    const emptyIndex = assembledSlots.findIndex((s) => s === null);
    if (emptyIndex === -1) return;

    const newSlots = [...assembledSlots];
    newSlots[emptyIndex] = tile;
    setAssembledSlots(newSlots);

    setScrambledPool(scrambledPool.filter((t) => t.id !== tile.id));
    setIsWrong(false);

    // Auto-verify when all slots are full
    if (newSlots.every((s) => s !== null)) {
      verifyAssembly(newSlots as TileItem[]);
    }
  };

  // Handle clicking a placed tile (return to scrambled pool)
  const handleReturnTile = (index: number) => {
    if (isCompleted) return;
    const tile = assembledSlots[index];
    if (!tile) return;

    playTileClickSound();
    const newSlots = [...assembledSlots];
    newSlots[index] = null;
    setAssembledSlots(newSlots);

    setScrambledPool([...scrambledPool, tile]);
    setIsWrong(false);
  };

  // Check if assembled order matches target
  const verifyAssembly = (slots: TileItem[]) => {
    const isCorrect = slots.every((s, idx) => s.originalIndex === idx);

    if (isCorrect) {
      setIsCompleted(true);
      setIsWrong(false);
      playVictorySound();

      // Update score and streak
      const earned = Math.max(50, 100 - hintsUsed * 25);
      const newScore = score + earned;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      localStorage.setItem('hebrew_game_score', newScore.toString());
      localStorage.setItem('hebrew_game_streak', newStreak.toString());

      // Auto-pronounce completed word
      setTimeout(() => {
        audioEngine.speakHebrew(currentToken.original, currentToken.transliteration, { rate: 1.0 });
      }, 500);
    } else {
      setIsWrong(true);
    }
  };

  // Reset current puzzle
  const handleResetPuzzle = () => {
    if (!currentToken) return;
    const items = [
      ...scrambledPool,
      ...assembledSlots.filter((s): s is TileItem => s !== null)
    ];
    // Re-shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setScrambledPool(items);
    setAssembledSlots(new Array(items.length).fill(null));
    setIsWrong(false);
    setIsCompleted(false);
  };

  // Give progressive didactic hint
  const handleGiveHint = () => {
    if (isCompleted) return;
    const newHintsCount = hintsUsed + 1;
    setHintsUsed(newHintsCount);

    if (newHintsCount === 1) {
      // Hint 1: Meaning & Transliteration
      setHintMessage(
        `💡 Significado: «${currentToken.translation}» • Pronúncia: /${currentToken.transliteration}/`
      );
    } else if (newHintsCount === 2) {
      // Hint 2: First or next letter info
      const firstEmptyIdx = assembledSlots.findIndex((s) => s === null);
      if (firstEmptyIdx !== -1 && targetSegments[firstEmptyIdx]) {
        const seg = targetSegments[firstEmptyIdx];
        setHintMessage(
          `💡 A letra da posição ${firstEmptyIdx + 1} é "${seg.raw}" (${seg.phoneticBreakdown}).`
        );
      } else {
        setHintMessage(
          `💡 Dica de Leitura: O hebraico bíblico se lê da Direita para a Esquerda!`
        );
      }
    } else {
      // Hint 3+: Automatically place the next correct tile
      const firstEmptyIdx = assembledSlots.findIndex((s) => s === null);
      if (firstEmptyIdx !== -1) {
        // Find which tile belongs to firstEmptyIdx
        const correctTileInPool = scrambledPool.find((t) => t.originalIndex === firstEmptyIdx);
        if (correctTileInPool) {
          handlePlaceTile(correctTileInPool);
          setHintMessage(`✨ Letra "${correctTileInPool.char}" posicionada automaticamente!`);
        } else {
          // It might be wrongly placed in another slot
          const wrongPlacedIdx = assembledSlots.findIndex(
            (s, idx) => s && s.originalIndex === firstEmptyIdx && idx !== firstEmptyIdx
          );
          if (wrongPlacedIdx !== -1) {
            handleReturnTile(wrongPlacedIdx);
          }
        }
      }
    }
  };

  // Pronunciation handlers
  const handlePlayNormalAudio = () => {
    audioEngine.speakHebrew(currentToken.original, currentToken.transliteration, { rate: 1.0 });
  };

  const handlePlaySlowAudio = () => {
    audioEngine.speakHebrew(currentToken.original, currentToken.transliteration, { rate: 0.65 });
  };

  // Navigation between words of the verse
  const handleNextWordInVerse = () => {
    if (verseWords.length === 0) return;
    const nextIdx = (wordIndexInVerse + 1) % verseWords.length;
    setWordIndexInVerse(nextIdx);
    setCurrentToken(verseWords[nextIdx]);
    if (onSelectAnotherWord) onSelectAnotherWord(verseWords[nextIdx]);
  };

  const handlePrevWordInVerse = () => {
    if (verseWords.length === 0) return;
    const prevIdx = (wordIndexInVerse - 1 + verseWords.length) % verseWords.length;
    setWordIndexInVerse(prevIdx);
    setCurrentToken(verseWords[prevIdx]);
    if (onSelectAnotherWord) onSelectAnotherWord(verseWords[prevIdx]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0C1B2A]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1917] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Game Status */}
        <div className="px-5 py-3.5 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors"
              title="Voltar para a Bíblia"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#0C1B2A]">
                  Desafio Hebraico: Montar a Palavra
                </h2>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#7A5B00]">
                  Gênesis 1:1
                </span>
              </div>
              <p className="text-[11px] text-[#786C50]">
                Organize as letras e pontos massoréticos na ordem correta da direita para a esquerda (⟵ RTL)
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5DCBF] text-xs font-bold text-[#0C1B2A] shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>{score} pts</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs font-bold text-orange-700 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                <span>{streak}x</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Word Stepper & Pronunciation Ribbon */}
        <div className="px-5 py-2.5 bg-[#FAF6ED] border-b border-[#EDE5D2] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Word in Verse Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevWordInVerse}
              disabled={verseWords.length <= 1}
              className="p-1 rounded bg-white hover:bg-[#F2EDE1] border border-[#DFD6BD] text-[#443C28] disabled:opacity-40 transition-colors"
              title="Palavra Anterior do Versículo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#0C1B2A] px-2 py-0.5 rounded bg-white border border-[#DFD6BD]">
              Palavra {wordIndexInVerse + 1} de {verseWords.length || 7}
            </span>
            <button
              onClick={handleNextWordInVerse}
              disabled={verseWords.length <= 1}
              className="p-1 rounded bg-white hover:bg-[#F2EDE1] border border-[#DFD6BD] text-[#443C28] disabled:opacity-40 transition-colors"
              title="Próxima Palavra do Versículo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector (Massorético vs Consoantes) */}
          <div className="flex items-center gap-1 bg-[#EAE2D0] p-0.5 rounded-lg">
            <button
              onClick={() => setGameMode('masoretic')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                gameMode === 'masoretic'
                  ? 'bg-white text-[#0C1B2A] shadow-xs'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Inclui as consoantes com todos os pontos massoréticos de vogais (Niqqud)"
            >
              Com Pontos Massoréticos (Niqqud)
            </button>
            <button
              onClick={() => setGameMode('consonantal')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                gameMode === 'consonantal'
                  ? 'bg-white text-[#0C1B2A] shadow-xs'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Apenas as 22 consoantes hebraicas sem os pontos vocálicos"
            >
              Apenas Consoantes
            </button>
          </div>

          {/* Audio Buttons: Normal & Lento */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePlayNormalAudio}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-all shadow-xs"
              title="Ouvir pronúncia autêntica em velocidade normal (1.0x)"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Ouvir Normal</span>
            </button>
            <button
              onClick={handlePlaySlowAudio}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E6DFCD] hover:bg-[#DCD4BF] text-[#3E3522] font-semibold text-[11px] transition-all"
              title="Ouvir pronúncia pausada e detalhada de cada fonema (0.65x)"
            >
              <span>🐢</span>
              <span>Ouvir Lento</span>
            </button>
          </div>
        </div>

        {/* Main Game Board Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Target Word Clue & Meaning Card */}
          <div className="p-4 rounded-xl bg-white border border-[#E2D8C0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs uppercase font-sans tracking-wider text-[#786C50] font-semibold">
                  Palavra Alvo:
                </span>
                <span className="text-xs font-mono font-bold text-[#8C6D00] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#EDE5D2]">
                  {currentToken.strong}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-xl font-bold text-[#0C1B2A]">
                  «{currentToken.translation}»
                </span>
                <span className="text-sm font-serif-bible italic text-[#8C6D00]">
                  /{currentToken.transliteration}/
                </span>
              </div>
              <p className="text-xs text-[#786C50] mt-0.5 font-mono">
                {currentToken.morphology}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGiveHint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F2EDE1] text-[#7A5B00] border border-[#DFD6BD] text-xs font-semibold transition-all shadow-xs"
                title="Clique para receber uma dica pedagógica caso não saiba a resposta"
              >
                <Lightbulb className="w-4 h-4 text-[#C9A227]" />
                <span>Pedir Dica {hintsUsed > 0 ? `(${hintsUsed})` : ''}</span>
              </button>
              <button
                onClick={handleResetPuzzle}
                className="p-2 rounded-xl bg-white hover:bg-[#F2EDE1] text-[#675C44] border border-[#DFD6BD] transition-colors"
                title="Reiniciar e reembaralhar as letras"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hint Message Banner if used */}
          {hintMessage && (
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#E2D4A8] text-xs text-[#6B5200] flex items-center justify-between gap-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>{hintMessage}</span>
              </div>
              <button
                onClick={() => setHintMessage(null)}
                className="text-[#8C6D00] hover:text-[#0C1B2A] text-[11px] font-semibold"
              >
                Dispensar
              </button>
            </div>
          )}

          {/* ASSEMBLED WORD SLOTS (Right-to-Left Hebrew Order) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#786C50]">
              <span className="font-semibold flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                <span>Ordem de Montagem (Direita para a Esquerda ⟵):</span>
              </span>
              <span className="text-[11px]">
                {assembledSlots.filter((s) => s !== null).length} de {assembledSlots.length} letras posicionadas
              </span>
            </div>

            {/* Target Slots Row */}
            <div 
              dir="rtl"
              className={`p-5 rounded-2xl border-2 transition-all flex flex-wrap items-center justify-center gap-3 min-h-[110px] ${
                isCompleted 
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300' 
                  : isWrong 
                  ? 'bg-rose-50 border-rose-300 animate-shake' 
                  : 'bg-white border-[#DED4BC] shadow-inner'
              }`}
            >
              {assembledSlots.map((tile, idx) => (
                <div
                  key={`slot-${idx}`}
                  onClick={() => handleReturnTile(idx)}
                  className={`relative flex flex-col items-center justify-center w-14 h-18 sm:w-16 sm:h-20 rounded-xl transition-all cursor-pointer ${
                    tile
                      ? 'bg-[#FAF6ED] border-2 border-[#C9A227] shadow-sm hover:scale-105 hover:border-rose-400 group/tile'
                      : 'border-2 border-dashed border-[#DFD6BD] bg-[#FAF9F6]/60 hover:bg-[#FAF9F6]'
                  }`}
                  title={tile ? `Clique para remover "${tile.char}"` : `Slot #${idx + 1}`}
                >
                  {tile ? (
                    <>
                      <span className="font-hebrew text-3xl sm:text-4xl font-bold text-[#0C1B2A] leading-none select-none">
                        {tile.char}
                      </span>
                      <span className="text-[9px] font-mono text-[#8C6D00] mt-1 opacity-70 group-hover/tile:text-rose-600">
                        #{idx + 1}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-[#B8AB91] select-none">
                      #{idx + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Error banner if full but wrong */}
            {isWrong && (
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-xs text-rose-800 text-center font-medium animate-in fade-in">
                A ordem das letras ainda não está correta. Lembre-se: em hebraico a palavra começa na <strong>direita</strong>! Clique em uma letra para devolvê-la ou use a Dica.
              </div>
            )}
          </div>

          {/* SCRAMBLED LETTERS POOL (Banco de Letras Embaralhadas) */}
          {!isCompleted && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-[#786C50]">
                <span className="font-semibold flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Letras Disponíveis (Clique para colocar no próximo espaço livre):</span>
                </span>
                <span className="text-[11px] text-[#8C6D00]">
                  {scrambledPool.length} restantes
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4EFE2] border border-[#DFD6BD] flex flex-wrap items-center justify-center gap-3 min-h-[90px]">
                {scrambledPool.length > 0 ? (
                  scrambledPool.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handlePlaceTile(tile)}
                      className="flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-white hover:bg-[#FAF6ED] border-2 border-[#D8CCAF] hover:border-[#C9A227] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-2xs group/btn"
                      title={`Clique para posicionar "${tile.char}"`}
                    >
                      <span className="font-hebrew text-3xl font-bold text-[#0C1B2A] group-hover/btn:text-[#C9A227] leading-none select-none">
                        {tile.char}
                      </span>
                      {tile.segmentInfo && (
                        <span className="text-[9px] text-[#786C50] font-sans mt-0.5 max-w-[50px] truncate leading-tight">
                          {tile.segmentInfo.consonantName.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-[#786C50] italic">
                    Todas as letras foram colocadas nos espaços acima!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* VICTORY & COMPLETE EXEGESIS PANEL */}
          {isCompleted && (
            <div className="p-5 rounded-2xl bg-[#FFFDF5] border-2 border-emerald-500 shadow-md space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-800">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-emerald-900">
                      Excelente! Palavra Montada com Sucesso!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Você organizou com exatidão as letras e sinais massoréticos de <strong>«{currentToken.original}»</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-800 block">+100 Pontos</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Sequência: {streak} acertos 🔥</span>
                </div>
              </div>

              {/* Complete Masoretic & Phonetic Breakdown */}
              <div className="p-4 rounded-xl bg-white border border-[#E5DCBF] space-y-3">
                <h4 className="text-xs font-bold text-[#0C1B2A] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Análise Detalhada das Letras & Pontos Massoréticos (Niqqud)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {targetSegments.map((seg, idx) => (
                    <div 
                      key={`decomp-${idx}`}
                      className="p-2.5 rounded-lg bg-[#FAF7F0] border border-[#E5DCBF] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-hebrew text-2xl font-bold text-[#0C1B2A]">
                          {seg.raw}
                        </span>
                        <span className="text-[10px] font-mono text-[#8C6D00] bg-white px-1.5 py-0.2 rounded border border-[#EDE5D2]">
                          Posição {idx + 1}
                        </span>
                      </div>
                      <div className="font-bold text-[#0C1B2A] text-xs">
                        {seg.consonantName}
                      </div>
                      <div className="text-[11px] text-[#554A34] leading-tight">
                        {seg.vowelNames.length > 0 ? (
                          <span>Vogal: <strong>{seg.vowelNames.join(', ')}</strong></span>
                        ) : (
                          <span className="text-[#8C7E62] italic">Sem vogal (consoante pura/quiescente)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Next Word or Replay */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleResetPuzzle}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2EDE1] text-[#443C28] border border-[#DFD6BD] text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Jogar Novamente</span>
                </button>

                <button
                  onClick={handleNextWordInVerse}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Próxima Palavra do Versículo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between text-[11px] text-[#786C50]">
          <span>
            Dica Didática: Em hebraico bíblico, cada letra consonantal carrega o seu ponto massorético abaixo ou acima dela.
          </span>
          <span className="font-semibold text-[#0C1B2A]">
            Bíblia Interlinear Apolinário
          </span>
        </div>

      </div>
    </div>
  );
};
