import React, { useState } from 'react';
import { HEBREW_ALPHABET, GREEK_ALPHABET } from '../data/alphabetGuides';
import { audioEngine } from '../utils/audioPlayer';
import { X, Languages, Volume2 } from 'lucide-react';

interface AlphabetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlphabetModal: React.FC<AlphabetModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'hebrew' | 'greek'>('hebrew');

  if (!isOpen) return null;

  const handleSpeakLetter = (text: string, transliteration: string, lang: 'hebrew' | 'greek') => {
    if (lang === 'hebrew') {
      audioEngine.speakHebrew(text, transliteration);
    } else {
      audioEngine.speakGreek(text, transliteration);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-[#C9A227]" />
            <div>
              <h2 className="font-cinzel text-lg font-bold text-[#0C1B2A]">
                Guia dos Alfabetos Bíblicos & Transliteração
              </h2>
              <p className="text-[11px] text-[#786C50]">
                Tabela de pronúncia, transliteração oficial e valores numéricos (Gematria)
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

        {/* Tab Switcher */}
        <div className="px-6 py-3 border-b border-[#EDE5D2] bg-[#FAF6ED] flex items-center gap-2">
          <div className="flex bg-[#EAE2D0] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('hebrew')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'hebrew'
                  ? 'bg-white text-[#0C1B2A] shadow-xs'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
            >
              Alfabeto Hebraico (Alef-Bet • 22 Consoantes)
            </button>
            <button
              onClick={() => setActiveTab('greek')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'greek'
                  ? 'bg-white text-[#0C1B2A] shadow-xs'
                  : 'text-[#675C44] hover:text-[#0C1B2A]'
              }`}
            >
              Alfabeto Grego (Alfa ao Ômega • 24 Letras)
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'hebrew' ? (
            <div>
              <div className="mb-4 p-3 rounded-xl bg-[#F0E8D5] border border-[#DFD6BD] text-xs text-[#554A34]">
                <span className="font-semibold text-[#0C1B2A]">Nota sobre o Hebraico Bíblico:</span> O hebraico é lido da direita para a esquerda (RTL). É composto por 22 consoantes (sendo 5 com forma final / sofit: ך, ם, ן, ף, ץ). Os pontos e traços abaixo e acima das letras são os sinais massoréticos de vogais (Niqqud).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {HEBREW_ALPHABET.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 bg-white border border-[#E2D8C0] rounded-xl hover:border-[#C9A227] transition-all flex items-start gap-3 shadow-2xs"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#FAF6ED] border border-[#E5DCBF] shrink-0">
                      <span className="font-hebrew text-2xl font-bold text-[#0C1B2A] hebrew-text">
                        {item.letter}
                        {item.finalForm ? ` (${item.finalForm})` : ''}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0C1B2A] font-cinzel text-sm">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F2EDE1] text-[#7A5B00] rounded">
                            Nº {item.numericalValue}
                          </span>
                          <button
                            onClick={() => handleSpeakLetter(item.name, item.transliteration, 'hebrew')}
                            className="p-1 rounded text-[#786C50] hover:text-[#0C1B2A]"
                            title="Ouvir som"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] font-serif-bible italic text-[#C9A227]">
                        Transliteração: {item.transliteration}
                      </div>

                      <div className="text-[11px] text-[#554A34] mt-0.5 leading-snug">
                        {item.phoneticSound}
                      </div>

                      <div className="text-[10px] text-[#786C50] mt-1 font-hebrew">
                        Exemplo: <span className="font-bold text-[#0C1B2A]">{item.example}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 rounded-xl bg-[#F0E8D5] border border-[#DFD6BD] text-xs text-[#554A34]">
                <span className="font-semibold text-[#0C1B2A]">Nota sobre o Grego Koiné:</span> O grego koiné é a língua oficial de composição de todo o Novo Testamento, lido da esquerda para a direita (LTR). A letra Sigma (Σ σ) usa a grafia ς quando ocorre no final de uma palavra.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {GREEK_ALPHABET.map((item) => (
                  <div
                    key={item.name}
                    className="p-3 bg-white border border-[#E2D8C0] rounded-xl hover:border-[#C9A227] transition-all flex items-start gap-3 shadow-2xs"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#FAF6ED] border border-[#E5DCBF] shrink-0">
                      <span className="font-greek text-xl font-bold text-[#0C1B2A]">
                        {item.letter}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0C1B2A] font-cinzel text-sm">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F2EDE1] text-[#2A4D69] rounded">
                            Nº {item.numericalValue}
                          </span>
                          <button
                            onClick={() => handleSpeakLetter(item.name, item.transliteration, 'greek')}
                            className="p-1 rounded text-[#786C50] hover:text-[#0C1B2A]"
                            title="Ouvir som"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] font-serif-bible italic text-[#2A4D69]">
                        Transliteração: {item.transliteration}
                      </div>

                      <div className="text-[11px] text-[#554A34] mt-0.5 leading-snug">
                        {item.phoneticSound}
                      </div>

                      <div className="text-[10px] text-[#786C50] mt-1 font-greek">
                        Exemplo: <span className="font-bold text-[#0C1B2A]">{item.example}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-between text-xs text-[#675C44]">
          <span>Sistema de Transliteração Fonética Padronizado</span>
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

export default AlphabetModal;
