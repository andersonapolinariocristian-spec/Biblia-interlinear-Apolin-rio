import React from 'react';
import { Book, ViewMode } from '../types/bible';
import { WORLD_TRANSLATIONS } from '../data/translationsData';
import { 
  Search, 
  BookOpen, 
  Columns, 
  Layers, 
  AlignLeft, 
  Edit3, 
  Settings, 
  Languages, 
  ChevronLeft, 
  ChevronRight,
  Globe2,
  ChevronDown,
  Share2,
  Maximize2,
  Minimize2,
  Sparkles,
  Scroll,
  Rows,
  Crown,
  LogOut
} from 'lucide-react';
import { getOfficialLogoUrl } from '../utils/logoManager';

interface HeaderProps {
  currentBook: Book;
  currentChapter: number;
  totalChapters: number;
  viewMode: ViewMode;
  notesCount: number;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenNavigation: () => void;
  onOpenSearch: () => void;
  onOpenNotes: () => void;
  onOpenAlphabet: () => void;
  onOpenSettings: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onOpenHebrewGuide?: () => void;
  onOpenHebrewGame?: () => void;
  onOpenTranslations?: () => void;
  activeTranslationId?: string;
  onOpenShare?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  onOpenExegesis?: () => void;
  onOpenSubscription?: () => void;
  isPro?: boolean;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBook,
  currentChapter,
  totalChapters,
  viewMode,
  notesCount,
  onSelectViewMode,
  onOpenNavigation,
  onOpenSearch,
  onOpenNotes,
  onOpenAlphabet,
  onOpenSettings,
  onPrevChapter,
  onNextChapter,
  onOpenHebrewGame,
  onOpenTranslations,
  activeTranslationId,
  onOpenShare,
  onToggleFullscreen,
  isFullscreen,
  onOpenExegesis,
  onOpenSubscription,
  isPro,
  onSignOut
}) => {
  const activeTrans = WORLD_TRANSLATIONS.find((t) => t.id === activeTranslationId) || WORLD_TRANSLATIONS[0];
  const [logoUrl, setLogoUrl] = React.useState<string>(() => getOfficialLogoUrl());

  React.useEffect(() => {
    const handleSyncLogo = () => {
      setLogoUrl(getOfficialLogoUrl());
    };
    window.addEventListener('logo-updated', handleSyncLogo);
    window.addEventListener('storage', handleSyncLogo);
    return () => {
      window.removeEventListener('logo-updated', handleSyncLogo);
      window.removeEventListener('storage', handleSyncLogo);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E7DFC6] shadow-xs">
      {/* Primary Top Bar: Clean, balanced, never overflows */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Identity with Apolinário Official Logo */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 min-w-0 group" 
            onClick={onOpenNavigation}
            title="Bíblia Interlinear Apolinário • Clique para alternar livro e capítulo"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#C9A227] shadow-xs shrink-0 bg-[#0C1B2A] group-hover:border-amber-400 transition-colors">
              <img 
                src={logoUrl} 
                alt="Logotipo Oficial Bíblia Interlinear Apolinário" 
                className="w-full h-full object-cover scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logotipo.png';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-cinzel text-xs sm:text-sm lg:text-base font-bold tracking-wide text-[#0C1B2A] leading-tight truncate">
                BÍBLIA INTERLINEAR APOLINÁRIO
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-medium truncate flex items-center gap-1">
                <span>{currentBook.testament === 'VT' ? 'Antigo Testamento • Hebraico' : 'Novo Testamento • Grego'}</span>
              </span>
            </div>
          </div>

          {/* Center: Fluid Chapter Stepper & Book Picker Button */}
          <div className="hidden md:flex items-center gap-1 bg-[#F2EDE1] p-0.5 rounded-xl border border-[#DFD6BD] shrink-0">
            <button
              onClick={onPrevChapter}
              disabled={currentChapter <= 1}
              title="Capítulo Anterior"
              className="p-1.5 rounded-lg text-[#554C37] hover:text-[#0C1B2A] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNavigation}
              className="px-3 py-1 text-xs font-semibold text-[#0C1B2A] hover:bg-white rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              title="Clique para navegar livros e capítulos"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="font-serif-bible text-sm sm:text-base font-semibold">{currentBook.name} {currentChapter}</span>
              <span className="text-[11px] font-mono text-[#786C50]">({currentBook.originalName})</span>
            </button>

            <button
              onClick={onNextChapter}
              disabled={currentChapter >= totalChapters}
              title="Próximo Capítulo"
              className="p-1.5 rounded-lg text-[#554C37] hover:text-[#0C1B2A] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Zone: Clean, Organized, Uncluttered Action Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onSignOut && (
              <button onClick={onSignOut} className="p-1.5 sm:p-2 text-[#554C37] hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer" title="Sair da conta" aria-label="Sair da conta">
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {/* Pro Subscription / Plan Button */}
            {onOpenSubscription && (
              <button
                onClick={onOpenSubscription}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-lg border shadow-2xs transition-all cursor-pointer ${
                  isPro
                    ? 'bg-[#C9A227]/20 text-[#7A5B00] border-[#C9A227] hover:bg-[#C9A227]/30'
                    : 'bg-gradient-to-r from-[#C9A227] to-[#E5BE4A] text-[#0C1B2A] border-[#ECC867] hover:brightness-110'
                }`}
                title={isPro ? 'Plano Pro Ativo • Ver Detalhes' : 'Assine o Plano Pro (Google Play)'}
              >
                <Crown className={`w-3.5 h-3.5 ${isPro ? 'fill-[#C9A227] text-[#C9A227]' : 'fill-[#0C1B2A] text-[#0C1B2A]'}`} />
                <span className="font-serif text-[11px] sm:text-xs">
                  {isPro ? 'PRO' : 'Seja Pro'}
                </span>
              </button>
            )}

            {/* AI Adventist Exegesis Button */}
            {onOpenExegesis && (
              <button
                onClick={onOpenExegesis}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-[#0C1B2A] bg-amber-50 hover:bg-amber-100/90 rounded-lg border border-[#C9A227] shadow-2xs transition-all cursor-pointer group"
                title="Exegese Bíblica por IA (Comentário Adventista SDABC, Ellen White e Originais)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227] group-hover:rotate-12 transition-transform" />
                <span className="font-cinzel text-xs font-bold text-[#8C6D1F]">Exegese IA</span>
              </button>
            )}

            {/* World Translations Quick Selector */}
            {onOpenTranslations && (
              <button
                onClick={onOpenTranslations}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-[#DFD6BD] bg-white transition-all shadow-2xs cursor-pointer"
                title={`Tradução: ${activeTrans.name} (${activeTrans.shortName}). Clique para alternar.`}
              >
                <Globe2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="text-xs">{activeTrans.flag}</span>
                <span className="font-mono text-[11px] hidden md:inline">{activeTrans.shortName}</span>
                <ChevronDown className="w-3 h-3 text-[#786C50]" />
              </button>
            )}

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-[#443C28] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-transparent hover:border-[#DFD6BD] transition-colors cursor-pointer"
              title="Busca avançada (Português, Hebraico, Grego, Strong's)"
            >
              <Search className="w-4 h-4 text-[#C9A227]" />
            </button>

            {/* Alphabet / Lexicon Guide */}
            <button
              onClick={onOpenAlphabet}
              className="p-1.5 sm:p-2 text-[#443C28] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-transparent hover:border-[#DFD6BD] transition-colors cursor-pointer"
              title="Alfabetos Hebraico e Grego com léxico e pronúncia"
            >
              <Languages className="w-4 h-4 text-[#2A4D69]" />
            </button>

            {/* Hebrew Learning Game (if OT / Hebrew) */}
            {currentBook.language === 'hebrew' && onOpenHebrewGame && (
              <button
                onClick={onOpenHebrewGame}
                className="p-1.5 sm:p-2 text-[#7A5B00] hover:text-[#0C1B2A] bg-[#FAF6ED] hover:bg-[#F2EDE1] rounded-lg border border-[#E5DCBF] transition-all shadow-2xs cursor-pointer"
                title="Desafio Hebraico: Montar palavras e pontos massoréticos"
              >
                <span className="text-sm leading-none">🎮</span>
              </button>
            )}

            {/* Notes System */}
            <button
              onClick={onOpenNotes}
              className="relative p-1.5 sm:p-2 text-[#443C28] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-transparent hover:border-[#DFD6BD] transition-colors cursor-pointer"
              title="Notas de Estudo"
            >
              <Edit3 className="w-4 h-4 text-[#7A3E26]" />
              {notesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-[#C9A227] text-[#0C1B2A] shadow-xs">
                  {notesCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 text-[#554C37] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-transparent hover:border-[#DFD6BD] transition-colors cursor-pointer"
              title="Preferências de leitura, fontes, voz e logotipo"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 sm:p-2 text-[#554C37] hover:text-[#0C1B2A] hover:bg-[#F2EDE1] rounded-lg border border-transparent hover:border-[#DFD6BD] transition-colors cursor-pointer"
                title={isFullscreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia (F11)'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-[#C9A227]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[#554C37]" />
                )}
              </button>
            )}

            {/* Share / PWA Download Button */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="p-1.5 sm:px-2.5 sm:py-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#0C1B2A] bg-[#C9A227]/20 hover:bg-[#C9A227]/35 border border-[#C9A227] rounded-lg transition-all shadow-2xs cursor-pointer"
                title="Compartilhar Link ou Baixar Aplicativo (PWA)"
              >
                <Share2 className="w-3.5 h-3.5 text-[#8C6D00]" />
                <span className="hidden xl:inline text-[11px]">Compartilhar</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Sub-Bar: Clean, single row for View Mode & Chapter Navigator */}
        <div className="flex items-center justify-between py-1.5 border-t border-[#EDE5D2] text-xs gap-2">
          {/* Mobile Chapter Picker (visible only on small screens) */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={onPrevChapter}
              disabled={currentChapter <= 1}
              className="p-1 rounded text-[#554C37] hover:bg-[#F2EDE1] disabled:opacity-30 cursor-pointer"
              title="Capítulo Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNavigation}
              className="font-serif-bible font-bold text-xs sm:text-sm text-[#0C1B2A] px-2 py-0.5 rounded hover:bg-[#F2EDE1] cursor-pointer"
            >
              {currentBook.name} {currentChapter}
            </button>
            <button
              onClick={onNextChapter}
              disabled={currentChapter >= totalChapters}
              className="p-1 rounded text-[#554C37] hover:bg-[#F2EDE1] disabled:opacity-30 cursor-pointer"
              title="Próximo Capítulo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop Language / Testament Indicator */}
          <div className="hidden md:flex items-center gap-2 text-[#786C50] text-[11px]">
            <span className="font-serif-bible italic">Texto Base:</span>
            <span className="font-semibold text-[#0C1B2A]">
              {currentBook.language === 'hebrew' ? 'Texto Massorético Hebraico (com Niqqud)' : 'Texto Receptus / NA28 Grego'}
            </span>
          </div>

          {/* Comparative View Mode Switcher: 4 distinct viewing styles */}
          <div className="flex items-center gap-0.5 bg-[#F2EDE1] p-0.5 rounded-lg border border-[#DFD6BD] ml-auto overflow-x-auto max-w-full">
            <button
              onClick={() => onSelectViewMode('classic_interlinear')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                viewMode === 'classic_interlinear'
                  ? 'bg-white text-[#0C1B2A] shadow-xs font-semibold ring-1 ring-[#C9A227]/40'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Palavra sob Palavra: O formato tradicional das Bíblias interlineares impressas"
            >
              <Rows className="w-3 h-3 text-[#C9A227]" />
              <span>Palavra sob Palavra</span>
            </button>

            <button
              onClick={() => onSelectViewMode('parallel')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                viewMode === 'parallel'
                  ? 'bg-white text-[#0C1B2A] shadow-xs font-semibold ring-1 ring-[#C9A227]/40'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Modo Lado a Lado: Original Transliterado de um lado, Tradução do outro"
            >
              <Columns className="w-3 h-3 text-[#C9A227]" />
              <span>Lado a Lado</span>
            </button>

            <button
              onClick={() => onSelectViewMode('interlinear')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                viewMode === 'interlinear'
                  ? 'bg-white text-[#0C1B2A] shadow-xs font-semibold ring-1 ring-[#C9A227]/40'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Cartões / Blocos: Palavra por palavra em fichas morfológicas"
            >
              <Layers className="w-3 h-3 text-[#2A4D69]" />
              <span>Blocos</span>
            </button>

            <button
              onClick={() => onSelectViewMode('verse_by_verse')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                viewMode === 'verse_by_verse'
                  ? 'bg-white text-[#0C1B2A] shadow-xs font-semibold ring-1 ring-[#C9A227]/40'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
              title="Linha a Linha: Texto contínuo linha após linha"
            >
              <AlignLeft className="w-3 h-3 text-[#7A3E26]" />
              <span>Linha a Linha</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
