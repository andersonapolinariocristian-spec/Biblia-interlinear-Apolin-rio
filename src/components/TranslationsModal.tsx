import React, { useState } from 'react';
import { Verse, DisplaySettings } from '../types/bible';
import { WORLD_TRANSLATIONS, getAllTranslationsForVerse, BibleTranslationInfo } from '../data/translationsData';
import { audioEngine } from '../utils/audioPlayer';
import { 
  X, 
  Search, 
  Globe2, 
  Check, 
  Volume2, 
  Copy, 
  Star, 
  BookOpen, 
  Sparkles, 
  Info,
  ChevronRight
} from 'lucide-react';

interface TranslationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVerse?: Verse | null;
  settings: DisplaySettings;
  onSelectPrimaryTranslation: (translationId: string) => void;
}

export const TranslationsModal: React.FC<TranslationsModalProps> = ({
  isOpen,
  onClose,
  activeVerse,
  settings,
  onSelectPrimaryTranslation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<'all' | 'pt' | 'en' | 'es' | 'la' | 'other'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const bookId = activeVerse ? activeVerse.bookId : 'GEN';
  const chapter = activeVerse ? activeVerse.chapter : 1;
  const currentVerseNum = activeVerse ? activeVerse.verse : 1;
  const defaultPortuguese = activeVerse ? activeVerse.portuguese : 'No princípio, criou Deus os céus e a terra.';
  const originalFull = activeVerse ? activeVerse.originalFull : 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃';

  // Get all translation texts for the active verse
  const allTranslationsWithText = getAllTranslationsForVerse(bookId, chapter, currentVerseNum, defaultPortuguese, originalFull);


  // Filter based on language tab and search term
  const filteredTranslations = allTranslationsWithText.filter(({ info, text }) => {
    // Language filter
    if (selectedLanguageFilter === 'pt' && info.languageCode !== 'pt') return false;
    if (selectedLanguageFilter === 'en' && info.languageCode !== 'en') return false;
    if (selectedLanguageFilter === 'es' && info.languageCode !== 'es') return false;
    if (selectedLanguageFilter === 'la' && info.languageCode !== 'la' && info.languageCode !== 'el') return false;
    if (selectedLanguageFilter === 'other' && ['pt', 'en', 'es', 'la', 'el'].includes(info.languageCode)) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = info.name.toLowerCase().includes(q);
      const matchShort = info.shortName.toLowerCase().includes(q);
      const matchLang = info.language.toLowerCase().includes(q);
      const matchText = text.toLowerCase().includes(q);
      return matchName || matchShort || matchLang || matchText;
    }
    return true;
  });

  const handleCopy = (id: string, text: string, info: BibleTranslationInfo) => {
    const citation = `[${info.shortName} - ${info.name}] ${text}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakTranslation = (text: string, langCode: string) => {
    if (langCode === 'pt') {
      audioEngine.speakPortuguese(text);
    } else if (langCode === 'he') {
      audioEngine.speakHebrew(text, '');
    } else if (langCode === 'el') {
      audioEngine.speakGreek(text, '');
    } else {
      // In browser speech
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode === 'en' ? 'en-US' : langCode === 'es' ? 'es-ES' : langCode === 'fr' ? 'fr-FR' : langCode === 'de' ? 'de-DE' : 'it-IT';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const activeTranslationInfo = WORLD_TRANSLATIONS.find((t) => t.id === settings.selectedTranslation) || WORLD_TRANSLATIONS[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0C1B2A]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1917] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-[#E2D8C0] text-[#0C1B2A] shadow-2xs">
              <Globe2 className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-[#0C1B2A]">
                  Traduções Bíblicas do Mundo & Versões Paralelas
                </h2>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#C9A227]/20 text-[#7A5B00]">
                  {WORLD_TRANSLATIONS.length} Versões Disponíveis
                </span>
              </div>
              <p className="text-[11px] text-[#786C50]">
                Compare o versículo com as principais traduções históricas, literais e dinâmicas mundiais
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Translation Indicator */}
        <div className="px-5 py-2.5 bg-[#FAF6ED] border-b border-[#EDE5D2] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#786C50] font-semibold">Tradução Principal Ativa:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#C9A227] font-bold text-[#0C1B2A] flex items-center gap-1.5 shadow-2xs">
              <span>{activeTranslationInfo.flag}</span>
              <span>{activeTranslationInfo.name} ({activeTranslationInfo.shortName})</span>
            </span>
          </div>

          {activeVerse && (
            <div className="flex items-center gap-1.5 font-cinzel text-xs text-[#8C6D00] font-bold">
              <span>Comparando:</span>
              <span className="bg-white px-2 py-0.5 rounded border border-[#DFD6BD] text-[#0C1B2A]">
                v. {activeVerse.verse}
              </span>
            </div>
          )}
        </div>

        {/* Search & Language Filter Toolbar */}
        <div className="p-4 bg-white border-b border-[#EDE5D2] space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#8C7E62] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tradução por nome (ex: NVI, King James, Vulgata, Espanhol)..."
                className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-[#FAF7F0] border border-[#DFD6BD] text-xs text-[#1C1917] focus:outline-none focus:border-[#C9A227] focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7E62] hover:text-[#0C1B2A]"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-[#F2EDE1] p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'pt', label: '🇧🇷 Português' },
                { id: 'en', label: '🇬🇧 Inglês' },
                { id: 'es', label: '🇪🇸 Espanhol' },
                { id: 'la', label: '🏛️ Latim / Clássicas' },
                { id: 'other', label: '🌍 Outras' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLanguageFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedLanguageFilter === tab.id
                      ? 'bg-white text-[#0C1B2A] shadow-xs'
                      : 'text-[#675C44] hover:text-[#0C1B2A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Translation Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredTranslations.length > 0 ? (
            filteredTranslations.map(({ info, text }) => {
              const isSelected = settings.selectedTranslation === info.id;

              return (
                <div
                  key={info.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    isSelected
                      ? 'bg-[#FFFDF7] border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                      : 'bg-white border-[#E2D8C0] hover:border-[#C9A227]/60'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{info.flag}</span>
                      <span className="font-bold text-sm text-[#0C1B2A]">
                        {info.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FAF6ED] border border-[#E5DCBF] text-[#7A5B00]">
                        {info.shortName}
                      </span>
                      <span className="text-[11px] text-[#786C50]">
                        ({info.year})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        info.type === 'Formal / Literal'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : info.type === 'Histórica'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : info.type === 'Língua Original'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {info.type}
                      </span>

                      {/* Set as Primary Translation Button */}
                      <button
                        onClick={() => onSelectPrimaryTranslation(info.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#F2EDE1] hover:bg-[#C9A227] hover:text-[#0C1B2A] text-[#443C28]'
                        }`}
                        title="Definir esta como a tradução padrão exibida em toda a Bíblia"
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tradução Ativa</span>
                          </>
                        ) : (
                          <>
                            <Star className="w-3.5 h-3.5" />
                            <span>Usar na Bíblia</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Verse Text in this Translation */}
                  <p className="font-serif-bible text-base text-[#1C1917] leading-relaxed pl-1 border-l-2 border-[#E5DCBF]">
                    «{text}»
                  </p>

                  {/* Description & Action Footer */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0E9DA] text-[#786C50]">
                    <span className="text-[11px] text-[#786C50] max-w-[80%] leading-snug">
                      {info.description}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSpeakTranslation(text, info.languageCode)}
                        className="p-1 rounded text-[#786C50] hover:text-[#0C1B2A] hover:bg-[#F2EDE1]"
                        title="Ouvir leitura deste versículo nesta tradução"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopy(info.id, text, info)}
                        className="p-1 rounded text-[#786C50] hover:text-[#0C1B2A] hover:bg-[#F2EDE1]"
                        title="Copiar versículo com citação da versão"
                      >
                        {copiedId === info.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-[#DFD6BD] text-xs text-[#786C50]">
              Nenhuma tradução encontrada para o termo "{searchTerm}". Tente buscar por "ARA", "NVI", "KJV", "Vulgata" ou selecione outra aba de idioma.
            </div>
          )}
        </div>

        {/* Explanatory Footer */}
        <div className="px-5 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#786C50]">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
            <span>
              <strong>Equivalência Formal (Literal)</strong> preserva cada palavra e forma gramatical original. <strong>Equivalência Dinâmica</strong> prioriza a clareza do pensamento.
            </span>
          </div>
          <span className="font-semibold text-[#0C1B2A]">
            Bíblia Interlinear Apolinário
          </span>
        </div>

      </div>
    </div>
  );
};
