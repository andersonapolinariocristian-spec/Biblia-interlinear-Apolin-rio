import React, { useState } from 'react';
import { PersonalNote, Verse, Book } from '../types/bible';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Download, 
  Search, 
  Tag, 
  FileText, 
  BookMarked 
} from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  notes: PersonalNote[];
  currentBook: Book;
  currentChapter: number;
  activeVerseForNote?: Verse | null;
  onClose: () => void;
  onSaveNote: (note: Omit<PersonalNote, 'id' | 'createdAt' | 'updatedAt'>, noteId?: string) => void;
  onDeleteNote: (id: string) => void;
  onJumpToVerse?: (bookId: string, chapter: number, verse: number) => void;
}

const NOTE_TAGS: PersonalNote['tag'][] = [
  'Exegese',
  'Teologia',
  'Hermenêutica',
  'Pregação',
  'Devocional',
  'Gramática'
];

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  notes,
  currentBook,
  currentChapter,
  activeVerseForNote,
  onClose,
  onSaveNote,
  onDeleteNote,
  onJumpToVerse
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'current_chapter' | 'all'>('current_chapter');

  // Form states
  const [formVerse, setFormVerse] = useState<number>(activeVerseForNote ? activeVerseForNote.verse : 1);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formTag, setFormTag] = useState<PersonalNote['tag']>('Exegese');

  if (!isOpen) return null;

  const currentChapterNotes = notes.filter(
    (n) => n.bookName === currentBook.name && n.chapter === currentChapter
  );

  const displayedNotes = notes.filter((n) => {
    if (scopeFilter === 'current_chapter') {
      if (n.bookName !== currentBook.name || n.chapter !== currentChapter) return false;
    }
    if (selectedTagFilter !== 'ALL' && n.tag !== selectedTagFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.verseKey.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartCreate = (verseNum?: number) => {
    setIsCreating(true);
    setEditingNoteId(null);
    setFormVerse(verseNum || (activeVerseForNote ? activeVerseForNote.verse : 1));
    setFormTitle('');
    setFormContent('');
    setFormTag('Exegese');
  };

  const handleStartEdit = (note: PersonalNote) => {
    setEditingNoteId(note.id);
    setIsCreating(false);
    setFormVerse(note.verse);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormTag(note.tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) return;

    const verseKey = `${currentBook.id}:${currentChapter}:${formVerse}`;
    onSaveNote(
      {
        verseKey,
        bookName: currentBook.name,
        chapter: currentChapter,
        verse: formVerse,
        title: formTitle.trim() || `Nota em ${currentBook.name} ${currentChapter}:${formVerse}`,
        content: formContent.trim(),
        tag: formTag
      },
      editingNoteId || undefined
    );

    setIsCreating(false);
    setEditingNoteId(null);
  };

  const handleExportNotes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `notas_biblia_apolinario_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#FBF9F5] h-full shadow-2xl border-l border-[#DED4BC] flex flex-col text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#C9A227]" />
            <div>
              <h2 className="font-cinzel text-base font-bold text-[#0C1B2A]">
                Notas Pessoais de Estudo
              </h2>
              <p className="text-[11px] text-[#786C50]">
                Integradas por versículo · Salvas automaticamente
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

        {/* Filter & Scope Controls */}
        <div className="p-4 bg-[#FAF6ED] border-b border-[#EDE5D2] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex bg-[#EAE2D0] p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setScopeFilter('current_chapter')}
                className={`px-3 py-1 rounded-md transition-all ${
                  scopeFilter === 'current_chapter'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                {currentBook.name} {currentChapter} ({currentChapterNotes.length})
              </button>
              <button
                onClick={() => setScopeFilter('all')}
                className={`px-3 py-1 rounded-md transition-all ${
                  scopeFilter === 'all'
                    ? 'bg-white text-[#0C1B2A] shadow-xs'
                    : 'text-[#675C44] hover:text-[#0C1B2A]'
                }`}
              >
                Todas as Notas ({notes.length})
              </button>
            </div>

            <button
              onClick={() => handleStartCreate()}
              className="flex items-center gap-1 px-3 py-1 bg-[#0C1B2A] text-white rounded-lg text-xs font-semibold hover:bg-[#1A334F] shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Nova Nota</span>
            </button>
          </div>

          {/* Search in Notes */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C7E62] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar em suas anotações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DFD6BD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A227] text-[#0C1B2A]"
            />
          </div>

          {/* Tag Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
            <button
              onClick={() => setSelectedTagFilter('ALL')}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                selectedTagFilter === 'ALL'
                  ? 'bg-[#C9A227] text-[#0C1B2A] font-bold'
                  : 'bg-[#EAE2D0] text-[#554A34]'
              }`}
            >
              Todas
            </button>
            {NOTE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                  selectedTagFilter === tag
                    ? 'bg-[#0C1B2A] text-white font-semibold'
                    : 'bg-[#EAE2D0] text-[#554A34] hover:bg-[#DFD6BD]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Note Editor Form (When Creating or Editing) */}
        {(isCreating || editingNoteId) && (
          <form onSubmit={handleSubmit} className="p-4 bg-white border-b-2 border-[#C9A227] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0C1B2A] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C9A227]" />
                {editingNoteId ? 'Editar Nota' : 'Nova Anotação'} em {currentBook.name} {currentChapter}:
                <select
                  value={formVerse}
                  onChange={(e) => setFormVerse(Number(e.target.value))}
                  className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-[#F2EDE1] rounded border border-[#DED4BC]"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>v. {v}</option>
                  ))}
                </select>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingNoteId(null);
                }}
                className="text-xs text-[#786C50] hover:text-red-600"
              >
                Cancelar
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Título da anotação teológica..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-[#DED4BC] rounded-lg bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <textarea
                rows={4}
                placeholder="Escreva sua exegese, significado do vocábulo, aplicação hermenêutica ou reflexão espiritual..."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#DED4BC] rounded-lg bg-[#FAF7F0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C9A227] leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#786C50]">Categoria:</span>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value as PersonalNote['tag'])}
                  className="text-xs px-2 py-1 bg-[#FAF7F0] border border-[#DED4BC] rounded-md font-medium"
                >
                  {NOTE_TAGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1 px-3 py-1.5 bg-[#0C1B2A] text-white rounded-lg text-xs font-semibold hover:bg-[#1A334F] transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Salvar Nota</span>
              </button>
            </div>
          </form>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedNotes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-10 h-10 text-[#C9A227]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#554A34]">
                Nenhuma nota encontrada
              </p>
              <p className="text-xs text-[#8C7E62] max-w-xs mx-auto mt-1">
                Adicione reflexões teológicas clicando em "Nova Nota" ou diretamente no ícone de anotação ao lado de qualquer versículo.
              </p>
              <button
                onClick={() => handleStartCreate()}
                className="mt-4 px-4 py-1.5 bg-[#EAE0C4] text-[#0C1B2A] rounded-lg text-xs font-semibold hover:bg-[#C9A227] hover:text-white transition-colors"
              >
                Criar Primeira Nota
              </button>
            </div>
          ) : (
            displayedNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-white border border-[#E2D8C0] shadow-2xs hover:border-[#C9A227] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0C1B2A] font-cinzel">
                        {note.bookName} {note.chapter}:{note.verse}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#F2EDE1] text-[#7A5B00] border border-[#E5DCBF]">
                        {note.tag}
                      </span>
                    </div>
                    {note.title && (
                      <h4 className="font-semibold text-xs text-[#2C2518] mt-1">
                        {note.title}
                      </h4>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 text-[#786C50] hover:text-[#0C1B2A] rounded"
                      title="Editar nota"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-[#786C50] hover:text-red-600 rounded"
                      title="Excluir nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#3A3222] leading-relaxed whitespace-pre-wrap font-sans">
                  {note.content}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#F5EFE3] text-[10px] text-[#8C7E62]">
                  <span>{new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                  {onJumpToVerse && (
                    <button
                      onClick={() => {
                        const parts = note.verseKey.split(':');
                        if (parts.length === 3) {
                          onJumpToVerse(parts[0], Number(parts[1]), Number(parts[2]));
                          onClose();
                        }
                      }}
                      className="text-[#0C1B2A] hover:underline font-semibold"
                    >
                      Ver no Texto →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between text-xs">
          <span className="text-[#675C44]">
            {notes.length} anotações registradas
          </span>
          <button
            onClick={handleExportNotes}
            disabled={notes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFD6BD] rounded-lg text-xs font-medium text-[#0C1B2A] hover:bg-[#FAF6ED] disabled:opacity-40 transition-colors"
            title="Exportar todas as anotações em formato JSON para backup"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Exportar Backup</span>
          </button>
        </div>

      </div>
    </div>
  );
};
