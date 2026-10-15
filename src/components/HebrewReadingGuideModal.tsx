import React from 'react';
import { X, ArrowLeft, ArrowRight, HelpCircle, Check, BookOpen, Layers } from 'lucide-react';
import { HebrewReadingOrder } from '../types/bible';

interface HebrewReadingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrder: HebrewReadingOrder;
  onSelectOrder: (order: HebrewReadingOrder) => void;
}

export const HebrewReadingGuideModal: React.FC<HebrewReadingGuideModalProps> = ({
  isOpen,
  onClose,
  currentOrder,
  onSelectOrder
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#C9A227]/20 text-[#8C6D00]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#0C1B2A]">
                O Hebraico está ao contrário?
              </h2>
              <p className="text-xs text-[#786C50]">
                Compreendendo o fluxo de leitura semítica vs. ordem ocidental interlinear
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

        <div className="p-6 space-y-6 text-sm">
          {/* Main Direct Answer Callout */}
          <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#E9DFBE] space-y-2">
            <span className="font-bold text-[#8C6D00] text-sm uppercase tracking-wide flex items-center gap-2">
              <span>✦ Resposta Exegética:</span>
            </span>
            <p className="text-[#3E3522] leading-relaxed">
              <strong>Não está ao contrário!</strong> Nos textos em Hebraico Bíblico, a escrita é milenarmente feita e lida da <strong>DIREITA para a ESQUERDA (⟵ RTL)</strong>.
            </p>
            <p className="text-[#554A34] text-xs leading-relaxed">
              Como em Português lemos da <em>esquerda para a direita (➔ LTR)</em>, o nosso cérebro bate o olho primeiro no lado esquerdo da linha, onde está a <strong>última palavra</strong> do versículo, dando a impressão óptica de que o texto está invertido.
            </p>
          </div>

          {/* Visual Diagram: Gênesis 1:1 Passo a Passo */}
          <div className="space-y-3">
            <h3 className="font-cinzel text-sm font-bold text-[#0C1B2A] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A227]" />
              <span>Diagrama Prático: Gênesis 1:1 no Original Hebraico</span>
            </h3>

            {/* RTL Diagram */}
            <div className="p-4 rounded-xl bg-white border border-[#DFD6BD] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#786C50] font-semibold border-b border-[#F0E9DA] pb-2">
                <span className="flex items-center gap-1 text-[#8C6D00]">
                  <ArrowLeft className="w-4 h-4 animate-pulse" />
                  <span>Fluxo Autêntico da Torá: Começa na Direita ⟵</span>
                </span>
                <span className="font-mono text-[11px] text-[#A69777]">Direção Massorética</span>
              </div>

              {/* The Words Box Displayed in Authentic Right-to-Left order */}
              <div className="grid grid-cols-5 gap-2 text-center" dir="rtl">
                <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#C9A227] shadow-xs">
                  <span className="block text-[10px] font-bold text-[#8C6D00]">① Início (Direita)</span>
                  <span className="font-hebrew text-lg font-bold text-[#0C1B2A] block my-0.5">בְּרֵאשִׁית</span>
                  <span className="block text-[11px] font-serif-bible italic text-[#786C50]">Bereshít</span>
                  <span className="block text-[10px] font-bold text-emerald-800">"No princípio"</span>
                </div>

                <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#DFD6BD]">
                  <span className="block text-[10px] font-semibold text-[#786C50]">② Palavra 2</span>
                  <span className="font-hebrew text-lg font-bold text-[#0C1B2A] block my-0.5">בָּרָא</span>
                  <span className="block text-[11px] font-serif-bible italic text-[#786C50]">bará</span>
                  <span className="block text-[10px] font-bold text-emerald-800">"criou"</span>
                </div>

                <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#DFD6BD]">
                  <span className="block text-[10px] font-semibold text-[#786C50]">③ Palavra 3</span>
                  <span className="font-hebrew text-lg font-bold text-[#0C1B2A] block my-0.5">אֱלֹהִים</span>
                  <span className="block text-[11px] font-serif-bible italic text-[#786C50]">Elohím</span>
                  <span className="block text-[10px] font-bold text-emerald-800">"Deus"</span>
                </div>

                <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#DFD6BD]">
                  <span className="block text-[10px] font-semibold text-[#786C50]">④ Palavra 4</span>
                  <span className="font-hebrew text-lg font-bold text-[#0C1B2A] block my-0.5">אֵת הַשָּׁמַיִם</span>
                  <span className="block text-[11px] font-serif-bible italic text-[#786C50]">hashamáyim</span>
                  <span className="block text-[10px] font-bold text-emerald-800">"os céus"</span>
                </div>

                <div className="p-2 rounded-lg bg-[#FAF7F0] border border-[#DFD6BD]">
                  <span className="block text-[10px] font-bold text-[#7A3E26]">⑤ Fim (Esquerda)</span>
                  <span className="font-hebrew text-lg font-bold text-[#0C1B2A] block my-0.5">וְאֵת הָאָרֶץ</span>
                  <span className="block text-[11px] font-serif-bible italic text-[#786C50]">ve'ét ha'árets</span>
                  <span className="block text-[10px] font-bold text-emerald-800">"e a terra."</span>
                </div>
              </div>

              <p className="text-[11px] text-[#786C50] italic text-center pt-1">
                Note que a palavra <strong>בְּרֵאשִׁית (No princípio)</strong> está na <strong>DIREITA</strong>, e a palavra <strong>הָאָרֶץ (a terra)</strong> termina na <strong>ESQUERDA</strong>.
              </p>
            </div>
          </div>

          {/* Escolha o Modo de Visualização que você prefere */}
          <div className="space-y-3 pt-2 border-t border-[#EDE5D2]">
            <h3 className="font-cinzel text-sm font-bold text-[#0C1B2A]">
              Como você prefere visualizar o Hebraico no aplicativo?
            </h3>
            <p className="text-xs text-[#6B5E43]">
              Desenvolvemos 2 modos dedicados para atender tanto quem está iniciando seus estudos quanto teólogos experientes:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Didactic LTR */}
              <button
                type="button"
                onClick={() => onSelectOrder('didactic_ltr')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  currentOrder === 'didactic_ltr'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-sm'
                    : 'bg-[#FAF7F0] border-[#DFD6BD] hover:bg-white text-[#443C28]'
                }`}
              >
                {currentOrder === 'didactic_ltr' && (
                  <span className="absolute top-3 right-3 p-1 rounded-full bg-[#C9A227] text-[#0C1B2A]">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-[#C9A227]" />
                  <span className="font-bold text-xs text-[#0C1B2A]">
                    Ordem Didática Ocidental (1 ➔ 2 ➔ 3)
                  </span>
                </div>
                <p className="text-xs text-[#6B5E43] leading-relaxed">
                  <strong>Recomendado para iniciantes:</strong> As palavras hebraicas são ordenadas da esquerda para a direita (Palavra 1, Palavra 2...). Cada termo hebraico fica perfeitamente alinhado acima de sua tradução em português.
                </p>
              </button>

              {/* Option 2: Traditional RTL */}
              <button
                type="button"
                onClick={() => onSelectOrder('traditional_rtl')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  currentOrder === 'traditional_rtl'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/40 shadow-sm'
                    : 'bg-[#FAF7F0] border-[#DFD6BD] hover:bg-white text-[#443C28]'
                }`}
              >
                {currentOrder === 'traditional_rtl' && (
                  <span className="absolute top-3 right-3 p-1 rounded-full bg-[#C9A227] text-[#0C1B2A]">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeft className="w-4 h-4 text-[#7A3E26]" />
                  <span className="font-bold text-xs text-[#0C1B2A]">
                    Texto Massorético Tradicional (⟵ RTL)
                  </span>
                </div>
                <p className="text-xs text-[#6B5E43] leading-relaxed">
                  <strong>Padrão da Torá e Manuscritos:</strong> O fluxo textual corre da direita para a esquerda exatamente como nas sinagogas e edições acadêmicas de Stuttgart (BHS).
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between">
          <span className="text-xs text-[#786C50]">
            Modo ativo: <strong>{currentOrder === 'didactic_ltr' ? 'Ordem Didática (1 ➔ 2 ➔ 3)' : 'Texto Tradicional (⟵ RTL)'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0C1B2A] text-white text-xs font-semibold hover:bg-[#1E3A5F] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
