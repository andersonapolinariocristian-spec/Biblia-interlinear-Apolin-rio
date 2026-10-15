import React, { useState } from 'react';
import { WordToken, Language } from '../types/bible';
import { audioEngine } from '../utils/audioPlayer';
import { decodeMorphology } from '../utils/morphologyDecoder';
import { translateGlossToPortuguese, getRichPortugueseLexicon } from '../utils/greekLexiconPortuguese';
import { 
  X, 
  Volume2, 
  Copy, 
  Check, 
  Bookmark, 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';

interface WordLexiconModalProps {
  token: WordToken | null;
  language: Language;
  onClose: () => void;
  onAddNoteForWord?: (wordText: string, strong: string) => void;
  onOpenGameForWord?: (token: WordToken) => void;
}

export const WordLexiconModal: React.FC<WordLexiconModalProps> = ({
  token,
  language,
  onClose,
  onAddNoteForWord,
  onOpenGameForWord
}) => {
  const [copied, setCopied] = useState(false);
  // Default open as confirmed by user in planning interview
  const [showMorphologyExplainer, setShowMorphologyExplainer] = useState(true);

  if (!token) return null;

  const ptTranslation = translateGlossToPortuguese(token.translation, token.original, token.lemma);
  const decodedMorph = decodeMorphology(token.morphology);
  const lexicon = getRichPortugueseLexicon(token, language);

  const handleSpeakOriginal = () => {
    if (language === 'hebrew') {
      audioEngine.speakHebrew(token.original, token.transliteration);
    } else {
      audioEngine.speakGreek(token.original, token.transliteration);
    }
  };

  const handleSpeakPortuguese = () => {
    audioEngine.speakPortuguese(ptTranslation);
  };

  const handleCopy = () => {
    const textToCopy = `${token.original} (${token.transliteration}) - Strong ${token.strong}: «${ptTranslation}». Lema: ${token.lemma || lexicon.root}. Morfologia: ${decodedMorph.summary} [${decodedMorph.technicalCode}]. Definição: ${lexicon.definition}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-[#1C1917] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold">
              Análise Léxica & Morfológica Exegética
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C9A227]/20 text-[#7A5B00] border border-[#C9A227]/30">
              {token.strong}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors cursor-pointer"
            title="Fechar análise"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Showcase Hero */}
        <div className="p-5 bg-gradient-to-b from-[#FAF6ED] to-[#FBF9F5] border-b border-[#EDE5D2] text-center shrink-0">
          <div className="flex items-center justify-center gap-3">
            <span
              dir={language === 'hebrew' ? 'rtl' : 'ltr'}
              lang={language === 'hebrew' ? 'he' : 'el'}
              className={`text-4xl sm:text-5xl font-bold tracking-tight text-[#0C1B2A] ${
                language === 'hebrew' ? 'font-hebrew' : 'font-greek'
              }`}
            >
              {token.original}
            </span>
            <button
              onClick={handleSpeakOriginal}
              title={`Ouvir pronúncia original em ${language === 'hebrew' ? 'Hebraico' : 'Grego'}`}
              className="p-2 rounded-full bg-[#EAE0C4] text-[#0C1B2A] hover:bg-[#C9A227] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-1.5 text-base font-serif-bible italic text-[#C9A227] font-semibold">
            /{token.transliteration}/
          </div>

          {/* Portuguese Literal Meaning */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <h3 className="text-xl sm:text-2xl font-serif-bible font-bold text-[#0C1B2A] tracking-wide">
              «{ptTranslation}»
            </h3>
            <button
              onClick={handleSpeakPortuguese}
              title="Ouvir em Português"
              className="p-1.5 rounded-full text-[#786C50] hover:text-[#0C1B2A] hover:bg-[#EFE7D2] transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Decoded Human Morphology Header */}
          <div className="mt-2.5 inline-flex flex-col items-center gap-1 max-w-full">
            <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-[#523F14] font-medium flex items-center gap-1.5 flex-wrap justify-center">
              <span className="font-semibold">{decodedMorph.summary}</span>
              <span className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-[#7A5B00] border border-amber-300 shadow-2xs">
                {decodedMorph.technicalCode}
              </span>
            </div>

            {/* Toggle Button for Grammatical Breakdown */}
            <button
              type="button"
              onClick={() => setShowMorphologyExplainer(!showMorphologyExplainer)}
              className="mt-1 text-[11px] text-[#8C6D1F] hover:text-[#0C1B2A] flex items-center gap-1 font-sans underline cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-[#C9A227]" />
              <span>{showMorphologyExplainer ? 'Ocultar decodificação gramatical' : `Ver detalhes da sigla (${decodedMorph.technicalCode})`}</span>
              {showMorphologyExplainer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Scrollable Body: Morphology Explainer + Detailed Lexicon */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Morphology Explainer Box (Open by default) */}
          {showMorphologyExplainer && (
            <div className="p-4 rounded-xl bg-[#F4EFE2] border border-[#DFD6BD] text-xs text-[#332D1F] space-y-2.5">
              <div className="flex items-center justify-between font-bold text-[#0C1B2A]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Decodificação Morfológica Didática em Português:</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white border border-[#DFD6BD] text-[#7A5B00]">
                  {language === 'hebrew' ? 'Gramática Hebraica' : 'Padrão Robinson/Grego'}
                </span>
              </div>

              <p className="text-[11px] text-[#6B5E43] leading-relaxed">
                Cada termo foi catalogado com precisão gramatical para revelar a função sintática e a ênfase teológica no texto bíblico:
              </p>

              <div className="grid grid-cols-1 gap-1.5 font-sans">
                {decodedMorph.segments.length > 0 ? (
                  decodedMorph.segments.map((seg, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white border border-[#DFD6BD] flex items-start gap-2 shadow-2xs">
                      <span className="px-1.5 py-0.5 rounded bg-[#FAF6ED] border border-[#C9A227]/40 font-mono text-[10px] font-bold text-[#7A5B00] shrink-0 mt-0.5">
                        {seg.code}
                      </span>
                      <div>
                        <strong className="text-[#0C1B2A] text-xs block">
                          {seg.category}: {seg.name}
                        </strong>
                        <span className="text-[11px] text-[#665A42] leading-tight block">
                          {seg.description}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 rounded-lg bg-white border border-[#DFD6BD] text-[11px] text-[#665A42]">
                    {decodedMorph.detailedText || 'Classificação morfológica e gramatical canônica.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Game Challenge Banner if Hebrew */}
          {language === 'hebrew' && onOpenGameForWord && (
            <div className="p-3 rounded-xl bg-[#FAF6ED] border border-[#EDE5D2] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#554A34]">
                <span className="text-base">🎮</span>
                <span className="font-medium">Soletrar e fixar vocabulário hebraico:</span>
              </div>
              <button
                onClick={() => {
                  onOpenGameForWord(token);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#C9A227] hover:bg-[#B8921F] text-[#0C1B2A] rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Abrir o jogo pedagógico para organizar as letras desta palavra"
              >
                <span>Jogar Desafio</span>
              </button>
            </div>
          )}

          {/* Exegetical Definition Section */}
          <div className="p-4 rounded-xl bg-white border border-[#E5DCBF] shadow-xs">
            <h4 className="text-xs font-semibold text-[#786C50] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#C9A227]" />
              Definição Léxica Expandida (Concordância de Strong)
            </h4>
            <p className="text-[#2C2518] leading-relaxed font-serif-bible text-base">
              {lexicon.definition}
            </p>
          </div>

          {/* Theological & Hermeneutical Usage */}
          <div className="p-4 rounded-xl bg-[#F4EFE2] border border-[#DFD6BD]">
            <h4 className="text-xs font-semibold text-[#8C6D00] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Sentido Teológico & Hermenêutico
            </h4>
            <p className="text-[#332D1F] text-xs leading-relaxed">
              {lexicon.theologicalUsage}
            </p>
          </div>

          {/* Root, Lemma & Biblical Occurrences */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
            <div className="p-3 rounded-xl bg-white border border-[#E5DCBF]">
              <span className="text-[#786C50] block text-[10px] uppercase font-semibold">Forma Lexical Base / Raiz</span>
              <span 
                dir={language === 'hebrew' ? 'rtl' : 'ltr'} 
                className={`font-semibold text-[#0C1B2A] text-sm block mt-0.5 ${language === 'hebrew' ? 'font-hebrew text-base' : 'font-greek'}`}
              >
                {token.lemma || lexicon.root}
              </span>
              <span className="text-[10px] text-[#8C7A58] block mt-0.5">
                Raiz etimológica original
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E5DCBF]">
              <span className="text-[#786C50] block text-[10px] uppercase font-semibold">Ocorrências Bíblicas</span>
              <span className="font-semibold text-[#0C1B2A] text-sm block mt-0.5">
                {lexicon.occurrences} vezes
              </span>
              <span className="text-[10px] text-[#8C7A58] block mt-0.5">
                No {language === 'hebrew' ? 'Antigo Testamento' : 'Novo Testamento'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFD6BD] rounded-lg text-xs font-medium text-[#0C1B2A] hover:bg-[#FAF6ED] transition-colors cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#786C50]" />}
            <span>{copied ? 'Copiado!' : 'Copiar Dados Léxicos'}</span>
          </button>

          {onAddNoteForWord && (
            <button
              onClick={() => {
                onAddNoteForWord(token.original, token.strong);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1B2A] text-[#FAF6ED] rounded-lg text-xs font-medium hover:bg-[#152D47] transition-colors cursor-pointer shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Anotar Vocábulo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
