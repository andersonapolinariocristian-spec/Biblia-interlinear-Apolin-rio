import React, { useState } from 'react';
import { performAdvancedSearch, SearchResult } from '../data/bibleEngine';
import { Book } from '../types/bible';
import { Search, X, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (book: Book, chapter: number, verseNum: number) => void;
}

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'VT' | 'NT'>('ALL');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  if (!isOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    const res = performAdvancedSearch(query, testamentFilter);
    setResults(res);
    setHasSearched(true);
  };

  const handleQuickSuggestion = (term: string) => {
    setQuery(term);
    const res = performAdvancedSearch(term, testamentFilter);
    setResults(res);
    setHasSearched(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-3xl rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#C9A227]" />
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#0C1B2A]">
                Busca Avançada Teológica
              </h2>
              <p className="text-[11px] text-[#786C50]">
                Pesquise por termos em Português, Hebraico, Grego, Transliteração ou Concordância de Strong
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

        {/* Search Input & Testament Filter */}
        <div className="p-5 border-b border-[#EDE5D2] bg-[#FAF6ED] space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8C7E62] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Ex: princípio, logos, בְּרֵאשִׁית, shalom, H7225, G3056..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DFD6BD] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 text-[#0C1B2A]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0C1B2A] text-white font-semibold rounded-xl text-xs hover:bg-[#1A334F] shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Pesquisar</span>
            </button>
          </form>

          {/* Testament Segmented Control */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex bg-[#EAE2D0] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setTestamentFilter('ALL');
                  if (query) setResults(performAdvancedSearch(query, 'ALL'));
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  testamentFilter === 'ALL'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                Ambos os Testamentos
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestamentFilter('VT');
                  if (query) setResults(performAdvancedSearch(query, 'VT'));
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  testamentFilter === 'VT'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                VT (Hebraico)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTestamentFilter('NT');
                  if (query) setResults(performAdvancedSearch(query, 'NT'));
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  testamentFilter === 'NT'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                NT (Grego)
              </button>
            </div>

            {/* Quick suggested theological terms */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-[#786C50]">
              <span className="font-serif-bible italic">Sugestões:</span>
              <button
                onClick={() => handleQuickSuggestion('princípio')}
                className="px-2 py-0.5 rounded bg-white border border-[#E2D8C0] hover:border-[#C9A227] text-[#0C1B2A]"
              >
                princípio
              </button>
              <button
                onClick={() => handleQuickSuggestion('logos')}
                className="px-2 py-0.5 rounded bg-white border border-[#E2D8C0] hover:border-[#C9A227] text-[#0C1B2A]"
              >
                logos (λόγος)
              </button>
              <button
                onClick={() => handleQuickSuggestion('bereshit')}
                className="px-2 py-0.5 rounded bg-white border border-[#E2D8C0] hover:border-[#C9A227] text-[#0C1B2A]"
              >
                bereshit (בְּרֵאשִׁית)
              </button>
              <button
                onClick={() => handleQuickSuggestion('agape')}
                className="px-2 py-0.5 rounded bg-white border border-[#E2D8C0] hover:border-[#C9A227] text-[#0C1B2A]"
              >
                agape (ἀγάπη)
              </button>
              <button
                onClick={() => handleQuickSuggestion('H3068')}
                className="px-2 py-0.5 rounded bg-white border border-[#E2D8C0] hover:border-[#C9A227] text-[#0C1B2A]"
              >
                H3068 (YHWH)
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {hasSearched && results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-[#554A34]">
                Nenhum resultado encontrado para «{query}»
              </p>
              <p className="text-xs text-[#8C7E62] mt-1">
                Tente buscar pela raiz transliterada (ex: "elohim", "theos") ou em português (ex: "luz", "pastor").
              </p>
            </div>
          ) : results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={`${item.verse.bookId}-${item.verse.chapter}-${item.verse.verse}-${idx}`}
                className="p-4 rounded-xl bg-white border border-[#E2D8C0] hover:border-[#C9A227] shadow-2xs transition-all space-y-2 group cursor-pointer"
                onClick={() => {
                  onSelectResult(item.book, item.verse.chapter, item.verse.verse);
                  onClose();
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#C9A227]" />
                    <span className="font-cinzel font-bold text-sm text-[#0C1B2A]">
                      {item.book.name} {item.verse.chapter}:{item.verse.verse}
                    </span>
                    <span className="text-[11px] font-mono text-[#786C50]">
                      ({item.book.originalName})
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F2EDE1] text-[#7A5B00] border border-[#E5DCBF]">
                    Correspondência em {item.matchType === 'portuguese' ? 'Português' : item.matchType === 'original' ? 'Texto Original' : item.matchType === 'transliteration' ? 'Transliteração' : "Concordância Strong"}
                  </span>
                </div>

                {/* Original Hebrew/Greek text */}
                <div
                  dir={item.verse.language === 'hebrew' ? 'rtl' : 'ltr'}
                  lang={item.verse.language === 'hebrew' ? 'he' : 'el'}
                  className={`text-base font-semibold leading-relaxed text-[#1C1917] ${
                    item.verse.language === 'hebrew' ? 'font-hebrew text-right' : 'font-greek text-left'
                  }`}
                >
                  {item.verse.originalFull}
                </div>

                {/* Transliteration */}
                <div className="text-xs font-serif-bible italic text-[#C9A227]">
                  {item.verse.transliterationFull}
                </div>

                {/* Portuguese Translation */}
                <div className="text-xs font-sans text-[#443C28] leading-relaxed pt-1 border-t border-[#F5EFE3]">
                  {item.verse.portuguese}
                </div>

                <div className="flex items-center justify-end text-[11px] font-semibold text-[#0C1B2A] group-hover:text-[#C9A227] transition-colors pt-1">
                  <span>Abrir no Estudo Interlinear</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-6">
              <Sparkles className="w-8 h-8 text-[#C9A227]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#554A34]">
                Pesquisa Bilíngue Pronta
              </p>
              <p className="text-xs text-[#8C7E62] max-w-sm mx-auto mt-1">
                Digite um versículo, palavra em português, termo transliterado ou em alfabeto original para localizar com rapidez em toda a Bíblia Interlinear.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between text-xs text-[#675C44]">
          <span>
            {results.length > 0 ? `${results.length} versículos localizados` : 'Mecanismo de Busca Ativo'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#DFD6BD] rounded-lg text-[#0C1B2A] font-medium hover:bg-[#FAF6ED]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
