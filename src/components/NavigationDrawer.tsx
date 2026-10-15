import React, { useState } from 'react';
import { Book } from '../types/bible';
import { BIBLE_BOOKS, BOOK_CATEGORIES } from '../data/bibleBooks';
import { X, Search, Sparkles, BookOpen } from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  currentBook: Book;
  currentChapter: number;
  onClose: () => void;
  onSelectChapter: (book: Book, chapter: number) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  currentBook,
  currentChapter,
  onClose,
  onSelectChapter
}) => {
  const [testament, setTestament] = useState<'VT' | 'NT'>(currentBook.testament);
  const [selectedBook, setSelectedBook] = useState<Book>(currentBook);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter books according to testament, category, and search query
  const filteredBooks = BIBLE_BOOKS.filter((b) => {
    if (b.testament !== testament) return false;
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchAbbr = b.abbreviation.toLowerCase().includes(q);
      const matchOrig = b.originalName.toLowerCase().includes(q);
      const matchTrans = b.transliteratedName.toLowerCase().includes(q);
      return matchName || matchAbbr || matchOrig || matchTrans;
    }
    return true;
  });

  const categories = testament === 'VT' ? BOOK_CATEGORIES.VT : BOOK_CATEGORIES.NT;

  const keyStudyChapters: Record<string, number[]> = {
    GEN: [1, 2, 3],
    EXO: [3, 20],
    DEU: [6],
    PSA: [1, 23, 121],
    ISA: [9, 53],
    PRO: [3],
    MAT: [1, 5, 6, 28],
    JHN: [1, 3, 14],
    ROM: [1, 8, 12],
    '1CO': [13],
    EPH: [2],
    PHP: [2],
    HEB: [11],
    REV: [1, 21]
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-center items-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#C9A227]" />
            <h2 className="font-cinzel text-lg font-bold text-[#0C1B2A] tracking-wide">
              Navegação Canônica da Bíblia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Testament Switcher & Search Bar */}
        <div className="p-4 sm:p-6 pb-2 border-b border-[#EDE5D2] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Testament Tabs */}
            <div className="flex bg-[#EAE2D0] p-1 rounded-xl">
              <button
                onClick={() => {
                  setTestament('VT');
                  setSelectedCategory('ALL');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  testament === 'VT'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                Antigo Testamento (39 Livros • Hebraico)
              </button>
              <button
                onClick={() => {
                  setTestament('NT');
                  setSelectedCategory('ALL');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  testament === 'NT'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                Novo Testamento (27 Livros • Grego)
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-[#8C7E62] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar livro (ex: Gênesis, Sl, João)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#DFD6BD] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 text-[#0C1B2A]"
              />
            </div>
          </div>

          {/* Canonical Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0C1B2A] text-white font-medium'
                  : 'text-[#675C44] hover:bg-[#EAE2D0]'
              }`}
            >
              Todos os Livros
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#0C1B2A] text-white font-medium'
                    : 'text-[#675C44] hover:bg-[#EAE2D0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Split between Book Selector & Chapter Selector */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#EDE5D2]">
          
          {/* Books Grid Column (Left) */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto max-h-[55vh]">
            <span className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold mb-3 block">
              1. Selecione o Livro ({filteredBooks.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook.id === book.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`p-2.5 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                        : 'bg-[#F5EFE3] hover:bg-white border-[#E2D8C0] text-[#332D1F]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif-bible font-bold text-sm text-[#0C1B2A] leading-tight">
                        {book.name}
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-1 py-0.5 rounded bg-[#E4DBC7] text-[#554A34]">
                        {book.abbreviation}
                      </span>
                    </div>
                    
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className={`text-[12px] ${book.language === 'hebrew' ? 'font-hebrew text-[#7A3E26]' : 'font-greek text-[#2A4D69]'}`}>
                        {book.originalName}
                      </span>
                      <span className="text-[10px] text-[#786C50] font-sans">
                        {book.totalChapters} cap.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapters Grid Column (Right) */}
          <div className="md:col-span-5 p-4 sm:p-5 overflow-y-auto max-h-[55vh] bg-[#FAF7F0]">
            <div className="mb-3">
              <span className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold block">
                2. Selecione o Capítulo
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-cinzel font-bold text-base text-[#0C1B2A]">
                  {selectedBook.name} ({selectedBook.transliteratedName})
                </span>
                <span className="text-xs text-[#786C50]">
                  {selectedBook.language === 'hebrew' ? 'Hebraico' : 'Grego'}
                </span>
              </div>
              <p className="text-xs text-[#6B5E43] mt-0.5 italic">
                {selectedBook.description}
              </p>
            </div>

            {/* Chapters Number Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 mt-4">
              {Array.from({ length: selectedBook.totalChapters }, (_, i) => i + 1).map((chNum) => {
                const isCurrent = selectedBook.id === currentBook.id && chNum === currentChapter;
                const isKeyStudy = keyStudyChapters[selectedBook.id]?.includes(chNum);

                return (
                  <button
                    key={chNum}
                    onClick={() => {
                      onSelectChapter(selectedBook, chNum);
                      onClose();
                    }}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all relative flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'bg-[#0C1B2A] text-white shadow-md'
                        : isKeyStudy
                        ? 'bg-[#EAE0C4] hover:bg-[#C9A227] text-[#0C1B2A] hover:text-white border border-[#C9A227]'
                        : 'bg-white hover:bg-[#EAE2D0] text-[#332D1F] border border-[#E2D8C0]'
                    }`}
                  >
                    <span>{chNum}</span>
                    {isKeyStudy && (
                      <Sparkles className="w-2.5 h-2.5 text-[#A67C00] -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Key study chapters legend */}
            <div className="mt-5 p-3 rounded-xl bg-[#F0E8D5] border border-[#DDD3BC] text-[11px] text-[#554A34] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span>
                Capítulos com destaque contêm análise morfêmica palavra por palavra completa.
              </span>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between text-xs text-[#675C44]">
          <div>
            Total de 66 Livros Canônicos · Velho e Novo Testamento
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#DFD6BD] rounded-lg text-[#0C1B2A] font-medium hover:bg-[#EAE2D0]"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
