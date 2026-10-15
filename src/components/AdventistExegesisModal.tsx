import React, { useState, useEffect } from 'react';
import { Book, Verse } from '../types/bible';
import { AdventistExegesisData, generateAdventistExegesisFallback } from '../utils/adventistExegesisFallback';
import { audioEngine } from '../utils/audioPlayer';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  Square, 
  Copy, 
  Check, 
  Bookmark, 
  RefreshCw, 
  Share2, 
  Flame, 
  FileText, 
  Languages, 
  Scroll, 
  Layers, 
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Lightbulb
} from 'lucide-react';

interface AdventistExegesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: Book;
  currentChapter: number;
  activeVerse?: Verse | null;
  allVerses: Verse[];
  onSaveToNotes?: (title: string, content: string, verseNum: number) => void;
}

type TabType = 'overview' | 'sdabc' | 'egw' | 'languages' | 'doctrines' | 'application';

export const AdventistExegesisModal: React.FC<AdventistExegesisModalProps> = ({
  isOpen,
  onClose,
  currentBook,
  currentChapter,
  activeVerse,
  allVerses,
  onSaveToNotes
}) => {
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(activeVerse?.verse || 1);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState<boolean>(false);
  const [exegesisData, setExegesisData] = useState<AdventistExegesisData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<string>('completa');

  // Update selected verse when modal opens or activeVerse changes
  useEffect(() => {
    if (activeVerse) {
      setSelectedVerseNum(activeVerse.verse);
    } else {
      setSelectedVerseNum(1);
    }
  }, [activeVerse, isOpen]);

  // Current selected verse object
  const currentSelectedVerse = allVerses.find((v) => v.verse === selectedVerseNum) || allVerses[0];

  // Fetch or generate Adventist exegesis
  const fetchExegesis = async (verseNum: number, mode: string = selectedMode) => {
    const verseObj = allVerses.find((v) => v.verse === verseNum) || allVerses[0];
    if (!verseObj) return;

    setLoading(true);
    setErrorMsg(null);
    setNoteSaved(false);

    try {
      const response = await fetch('/api/exegesis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book: currentBook.name,
          bookId: currentBook.id,
          chapter: currentChapter,
          verse: verseObj.verse,
          verseText: verseObj.portuguese,
          originalText: verseObj.originalFull,
          transliteration: verseObj.transliterationFull,
          testament: currentBook.testament,
          mode
        })
      });

      if (!response.ok) {
        throw new Error(`Erro de rede: ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setExegesisData(resJson.data);
      } else {
        throw new Error(resJson.error || 'Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.warn('Fallback to local Adventist knowledge engine:', err);
      // Fallback guarantees 100% availability
      const fallback = generateAdventistExegesisFallback({
        book: currentBook.name,
        bookId: currentBook.id,
        chapter: currentChapter,
        verse: verseObj.verse,
        verseText: verseObj.portuguese,
        originalText: verseObj.originalFull,
        transliteration: verseObj.transliterationFull,
        testament: currentBook.testament
      });
      setExegesisData(fallback);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when modal opens or verse changes
  useEffect(() => {
    if (isOpen) {
      fetchExegesis(selectedVerseNum, selectedMode);
    } else {
      audioEngine.stop();
      setIsPlayingAudio(false);
    }
  }, [isOpen, selectedVerseNum, currentBook.id, currentChapter]);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!exegesisData) return;
    navigator.clipboard.writeText(exegesisData.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToPersonalNotes = () => {
    if (!exegesisData || !onSaveToNotes) return;
    const title = `Exegese Adventista: ${exegesisData.reference}`;
    const content = `${exegesisData.title}\n\n${exegesisData.summary}\n\n[SDABC - ${exegesisData.sdabcCommentary.volume}]\n${exegesisData.sdabcCommentary.verseByVerseAnalysis}\n\n[Espírito de Profecia - ${exegesisData.spiritOfProphecy.primaryBook}]\n${exegesisData.spiritOfProphecy.quotesAndInsights}\n\n[Aplicação Espiritual]\n${exegesisData.homileticalAndPastoralApplication.spiritualLesson}`;
    
    onSaveToNotes(title, content, selectedVerseNum);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      audioEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    if (!exegesisData) return;

    const speechText = `${exegesisData.reference}. ${exegesisData.title}. ${exegesisData.summary}. Segundo o Comentário Bíblico Adventista: ${exegesisData.sdabcCommentary.verseByVerseAnalysis.slice(0, 300)}. No Espírito de Profecia, Ellen White declara: ${exegesisData.spiritOfProphecy.quotesAndInsights.slice(0, 250)}. Aplicação prática: ${exegesisData.homileticalAndPastoralApplication.spiritualLesson}`;

    setIsPlayingAudio(true);
    audioEngine.speakPortuguese(speechText, {
      voicePreference: 'Fenrir', // Reverent deep biblical narrator voice
      rate: 0.95,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#FBF9F5] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#DFD6BD] flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-[#0C1B2A] via-[#162A45] to-[#0C1B2A] text-white p-4 sm:p-5 border-b border-[#C9A227]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/20 border border-[#C9A227] flex items-center justify-center text-[#F3E5AB] shrink-0 shadow-xs">
              <Scroll className="w-5 h-5 text-[#F3E5AB]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-[#F3E5AB]">
                  Exegese Adventista por IA
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C9A227]/25 text-[#F3E5AB] border border-[#C9A227]/50 font-semibold">
                  SDABC & Espírito de Profecia
                </span>
              </div>
              <p className="text-xs text-white/80 font-sans mt-0.5">
                Fundamentada no Comentário Bíblico Adventista (Vols. 1-7), Ellen G. White, BRI e Idiomas Originais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Audio Narrator Button */}
            <button
              onClick={handleToggleAudio}
              disabled={loading || !exegesisData}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-amber-500 text-[#0C1B2A] shadow-md animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
              title={isPlayingAudio ? "Pausar leitura da exegese" : "Ouvir síntese da exegese narrada"}
            >
              {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'Parar Áudio' : 'Ouvir Exegese'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Verse Selector & Subheader */}
        <div className="bg-[#F2EDE1] px-4 py-2.5 border-b border-[#DFD6BD] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#554C37] uppercase tracking-wider text-[11px]">Passagem:</span>
            <span className="font-serif-bible text-sm font-bold text-[#0C1B2A]">
              {currentBook.name} {currentChapter}
            </span>
            <span className="text-[#8C7A5B]">·</span>
            <label className="flex items-center gap-1.5">
              <span className="text-[#554C37]">Versículo:</span>
              <select
                value={selectedVerseNum}
                onChange={(e) => setSelectedVerseNum(Number(e.target.value))}
                className="bg-white border border-[#DFD6BD] rounded-md px-2 py-1 font-semibold text-[#0C1B2A] focus:outline-hidden focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                {allVerses.map((v) => (
                  <option key={v.verse} value={v.verse}>
                    Versículo {v.verse}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                fetchExegesis(selectedVerseNum, e.target.value);
              }}
              className="bg-white border border-[#DFD6BD] rounded-md px-2 py-1 text-xs text-[#0C1B2A] font-medium cursor-pointer"
            >
              <option value="completa">Exegese Teológica Completa</option>
              <option value="sdabc">Foco no SDABC (Vols 1-7)</option>
              <option value="espirito_profecia">Foco no Espírito de Profecia (EGW)</option>
              <option value="linguistica">Línguas Originais (Hebraico/Grego)</option>
              <option value="grande_conflito_santuario">Grande Conflito & Santuário</option>
              <option value="pastoral">Aplicação Prática e Homilética</option>
            </select>

            <button
              onClick={() => fetchExegesis(selectedVerseNum, selectedMode)}
              disabled={loading}
              className="p-1.5 text-[#554C37] hover:text-[#0C1B2A] hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Recarregar / atualizar exegese"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C9A227]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Selected Verse Banner */}
        {currentSelectedVerse && (
          <div className="bg-[#FAF7F0] px-4 py-2 border-b border-[#E7DFC6] text-xs">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span className="font-bold text-[#8C6D1F] shrink-0 font-cinzel">
                {currentBook.name} {currentChapter}:{currentSelectedVerse.verse}
              </span>
              <p className="text-[#332E22] italic font-serif leading-relaxed line-clamp-2">
                "{currentSelectedVerse.portuguese}"
              </p>
            </div>
            {currentSelectedVerse.originalFull && (
              <div className="mt-1 text-[11px] font-mono text-[#786C50] flex items-center gap-2 truncate">
                <span className="font-serif-bible text-sm text-[#0C1B2A]">{currentSelectedVerse.originalFull}</span>
                <span className="text-[#8C7A5B]">({currentSelectedVerse.transliterationFull})</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-[#F5EFE1] border-b border-[#DFD6BD] px-2 sm:px-4 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Síntese & Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('sdabc')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sdabc'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#2A4D69]" />
            <span>Comentário SDABC</span>
          </button>

          <button
            onClick={() => setActiveTab('egw')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'egw'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Espírito de Profecia</span>
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'languages'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-[#4B779A]" />
            <span>Originais Hebraico/Grego</span>
          </button>

          <button
            onClick={() => setActiveTab('doctrines')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'doctrines'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>Grande Conflito & Teologia</span>
          </button>

          <button
            onClick={() => setActiveTab('application')}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'application'
                ? 'border-[#C9A227] text-[#0C1B2A] bg-white rounded-t-lg'
                : 'border-transparent text-[#6B5E43] hover:text-[#0C1B2A]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6D1F]" />
            <span>Aplicação & Esboço</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-[#C9A227]/30 border-t-[#C9A227] animate-spin" />
                <Sparkles className="w-5 h-5 text-[#C9A227] absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="font-cinzel font-semibold text-sm text-[#0C1B2A]">
                Consultando o Comentário Bíblico Adventista e Documentos Históricos...
              </p>
              <p className="text-xs text-[#786C50] max-w-md">
                Examinando a sintaxe dos originais, volumes do SDABC, manuscritos bíblicos e escritos inspirados de Ellen G. White.
              </p>
            </div>
          ) : exegesisData ? (
            <>
              {/* Tab: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#DFD6BD] shadow-xs">
                    <span className="text-[11px] font-bold text-[#8C6D1F] tracking-wider uppercase">Título do Estudo</span>
                    <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0C1B2A] mt-1 leading-snug">
                      {exegesisData.title}
                    </h3>
                    <p className="text-sm font-sans text-[#332E22] mt-3 leading-relaxed whitespace-pre-line">
                      {exegesisData.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[#DFD6BD] shadow-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <Scroll className="w-4 h-4 text-[#8C6D1F]" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#0C1B2A]">
                          Contexto Histórico & Cultural
                        </h4>
                      </div>
                      <p className="text-xs text-[#443C28] leading-relaxed">
                        {exegesisData.historicalCulturalContext}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#DFD6BD] shadow-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-[#2A4D69]" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#0C1B2A]">
                          Pilares no Grande Conflito
                        </h4>
                      </div>
                      <p className="text-xs text-[#443C28] leading-relaxed">
                        {exegesisData.theologicalPillars.greatControversyFocus}
                      </p>
                    </div>
                  </div>

                  {/* Highlights Summary Box */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Síntese Teológica Adventista
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        {exegesisData.theologicalPillars.doctrineHarmony}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: SDABC Commentary */}
              {activeTab === 'sdabc' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-5 rounded-xl border border-[#DFD6BD] shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#EAE2CE] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#2A4D69]" />
                        <h3 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                          {exegesisData.sdabcCommentary.volume}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-[#8C6D1F] bg-[#FAF6ED] px-2.5 py-1 rounded-md border border-[#E2D8C0]">
                        Comentário Adventista Oficial
                      </span>
                    </div>

                    <div className="text-sm text-[#2E2819] font-sans leading-relaxed whitespace-pre-line space-y-3">
                      <p>{exegesisData.sdabcCommentary.verseByVerseAnalysis}</p>
                    </div>

                    {exegesisData.sdabcCommentary.textualNuances && (
                      <div className="mt-4 pt-3 border-t border-[#EAE2CE] text-xs text-[#6B5E43] bg-[#FAF7F0] p-3 rounded-lg">
                        <span className="font-bold text-[#443C28] block mb-1">Notas Críticas & Variantes Textuais:</span>
                        <p>{exegesisData.sdabcCommentary.textualNuances}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Ellen G. White / Spirit of Prophecy */}
              {activeTab === 'egw' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-5 rounded-xl border border-[#DFD6BD] shadow-xs">
                    <div className="flex items-center gap-2 border-b border-[#EAE2CE] pb-3 mb-3">
                      <Flame className="w-5 h-5 text-amber-600" />
                      <div>
                        <h3 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                          Espírito de Profecia (Ellen G. White)
                        </h3>
                        <span className="text-xs text-[#8C6D1F] font-semibold">
                          Obra de Referência: {exegesisData.spiritOfProphecy.primaryBook}
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50/60 border-l-4 border-[#C9A227] p-4 rounded-r-lg my-3">
                      <p className="text-sm font-serif italic text-[#332A18] leading-relaxed">
                        {exegesisData.spiritOfProphecy.quotesAndInsights}
                      </p>
                    </div>

                    <div className="mt-4 text-xs text-[#443C28] space-y-2">
                      <h4 className="font-bold uppercase tracking-wider text-[#0C1B2A]">
                        Harmonização & Iluminação do Texto Bíblico:
                      </h4>
                      <p className="leading-relaxed">
                        {exegesisData.spiritOfProphecy.theologicalHarmonization}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Original Languages */}
              {activeTab === 'languages' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-5 rounded-xl border border-[#DFD6BD] shadow-xs">
                    <div className="flex items-center gap-2 border-b border-[#EAE2CE] pb-3 mb-3">
                      <Languages className="w-5 h-5 text-[#2A4D69]" />
                      <h3 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                        Análise Exegética dos Idiomas Originais ({currentBook.testament === 'VT' ? 'Hebraico Massorético' : 'Grego Koiné'})
                      </h3>
                    </div>

                    {exegesisData.originalLanguageAnalysis.keyWords.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {exegesisData.originalLanguageAnalysis.keyWords.map((item, idx) => (
                          <div 
                            key={idx}
                            className="p-3.5 rounded-lg border border-[#E7DFC6] bg-[#FAF8F3] hover:border-[#C9A227] transition-colors"
                          >
                            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#DFD6BD]/60 pb-2 mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-serif-bible text-xl font-bold text-[#0C1B2A]">
                                  {item.word}
                                </span>
                                <span className="font-mono text-xs font-semibold text-[#8C6D1F]">
                                  ({item.transliteration})
                                </span>
                                {item.strongNumber && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#DFD6BD] text-[#443C28]">
                                    {item.strongNumber}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#786C50] font-sans">
                                {item.morphology}
                              </span>
                            </div>

                            <div className="text-xs space-y-1.5 text-[#3A3324]">
                              <p>
                                <strong className="text-[#0C1B2A]">Significado: </strong>
                                {item.meaning}
                              </p>
                              <p>
                                <strong className="text-[#8C6D1F]">Importância Teológica Adventista: </strong>
                                {item.theologicalSignificance}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#786C50]">Nenhuma palavra-chave detalhada para este versículo.</p>
                    )}

                    {exegesisData.originalLanguageAnalysis.grammaticalNotes && (
                      <div className="mt-4 p-3 bg-[#FAF7F0] rounded-lg border border-[#E2D8C0] text-xs text-[#443C28]">
                        <span className="font-bold block mb-1 text-[#0C1B2A]">Notas Gramaticais e Sintáticas:</span>
                        <p>{exegesisData.originalLanguageAnalysis.grammaticalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Doctrines & Great Controversy */}
              {activeTab === 'doctrines' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-5 rounded-xl border border-[#DFD6BD] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#EAE2CE] pb-3">
                      <Shield className="w-5 h-5 text-[#1B4D3E]" />
                      <h3 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                        Pilares Teológicos & Escatologia Adventista
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-[#FAF7F0] border border-[#E7DFC6] rounded-lg">
                        <span className="text-[11px] font-bold text-[#8C6D1F] uppercase tracking-wide block mb-1">
                          O Grande Conflito Cósmico
                        </span>
                        <p className="text-xs text-[#332E22] leading-relaxed">
                          {exegesisData.theologicalPillars.greatControversyFocus}
                        </p>
                      </div>

                      {exegesisData.theologicalPillars.sanctuaryOrProphecy && (
                        <div className="p-3.5 bg-[#FAF7F0] border border-[#E7DFC6] rounded-lg">
                          <span className="text-[11px] font-bold text-[#2A4D69] uppercase tracking-wide block mb-1">
                            Santuário Celestial / Aliança / Profecia
                          </span>
                          <p className="text-xs text-[#332E22] leading-relaxed">
                            {exegesisData.theologicalPillars.sanctuaryOrProphecy}
                          </p>
                        </div>
                      )}

                      <div className="p-3.5 bg-[#FAF7F0] border border-[#E7DFC6] rounded-lg">
                        <span className="text-[11px] font-bold text-[#1B4D3E] uppercase tracking-wide block mb-1">
                          Harmonia com as 28 Crenças Fundamentais
                        </span>
                        <p className="text-xs text-[#332E22] leading-relaxed">
                          {exegesisData.theologicalPillars.doctrineHarmony}
                        </p>
                      </div>
                    </div>

                    {/* Cross References */}
                    {exegesisData.crossReferences.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[#EAE2CE]">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C1B2A] mb-2.5">
                          Harmonia Bíblica (A Bíblia Interpreta a Si Mesma)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {exegesisData.crossReferences.map((cr, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border border-[#DFD6BD] bg-[#FAF8F3] text-xs">
                              <span className="font-bold text-[#8C6D1F] block">{cr.passage}</span>
                              <span className="text-[#554C37] text-[11px]">{cr.explanation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Homiletics & Practical Application */}
              {activeTab === 'application' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-white p-5 rounded-xl border border-[#DFD6BD] shadow-xs space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#EAE2CE] pb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8C6D1F]" />
                      <h3 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                        Aplicação Pastoral, Homilética & Escola Sabatina
                      </h3>
                    </div>

                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block mb-1">
                        Lição Espiritual Central
                      </span>
                      <p className="text-sm font-sans text-amber-950 leading-relaxed">
                        {exegesisData.homileticalAndPastoralApplication.spiritualLesson}
                      </p>
                    </div>

                    {exegesisData.homileticalAndPastoralApplication.sermonOutlineOrStudyPoints?.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-[#0C1B2A] uppercase tracking-wide block mb-2">
                          Esboço de Estudo Bíblico ou Pregação
                        </span>
                        <div className="space-y-2">
                          {exegesisData.homileticalAndPastoralApplication.sermonOutlineOrStudyPoints.map((pt, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FAF8F3] border border-[#DFD6BD] text-xs text-[#332E22]">
                              <span className="w-5 h-5 rounded-full bg-[#C9A227]/20 text-[#8C6D1F] font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3.5 bg-[#FAF7F0] border-l-4 border-[#1B4D3E] rounded-r-lg text-xs text-[#2A2417]">
                      <span className="font-bold text-[#1B4D3E] uppercase block mb-1">Chamado à Fé & Consagração:</span>
                      <p className="italic leading-relaxed">
                        {exegesisData.homileticalAndPastoralApplication.devotionalCall}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-xs text-[#786C50]">
              Nenhum dado exegético disponível.
            </div>
          )}
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="bg-[#F2EDE1] p-3 sm:p-4 border-t border-[#DFD6BD] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#6B5E43] flex items-center gap-2">
            <span>Bíblia Interlinear Apolinário</span>
            <span>•</span>
            <span>SDABC Vols 1-7 • EGW • BRI</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Save to Personal Notes */}
            {onSaveToNotes && (
              <button
                onClick={handleSaveToPersonalNotes}
                disabled={!exegesisData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DFD6BD] hover:bg-[#FAF6ED] text-[#0C1B2A] text-xs font-semibold transition-colors cursor-pointer"
                title="Salvar esta exegese nas suas anotações pessoais"
              >
                {noteSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-[#C9A227]" />}
                <span>{noteSaved ? 'Salvo nas Notas!' : 'Salvar nas Notas'}</span>
              </button>
            )}

            {/* Copy Full Markdown */}
            <button
              onClick={handleCopyMarkdown}
              disabled={!exegesisData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C1B2A] hover:bg-[#162A45] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Copiar relatório completo em Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Exegese'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
