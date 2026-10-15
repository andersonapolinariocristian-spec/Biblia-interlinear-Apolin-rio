import React, { useState } from 'react';
import { DisplaySettings, UserProfile } from '../types/bible';
import { audioEngine } from '../utils/audioPlayer';
import { WORLD_TRANSLATIONS } from '../data/translationsData';
import { X, Sliders, Type, Eye, Volume2, ArrowLeft, ArrowRight, Play, Square, Sparkles, Lock, Check, Globe2, Share2, Download, Upload, Image as ImageIcon, BookOpen, Crown } from 'lucide-react';
import { getOfficialLogoUrl, uploadOfficialLogoFile } from '../utils/logoManager';
import officialLogo from '../assets/images/Logotipo.png';

interface SettingsModalProps {
  isOpen: boolean;
  settings: DisplaySettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: DisplaySettings) => void;
  onOpenTranslationsModal?: () => void;
  onOpenShareModal?: () => void;
  currentUser?: UserProfile | null;
  onOpenSubscriptionModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onOpenTranslationsModal,
  onOpenShareModal,
  currentUser,
  onOpenSubscriptionModal
}) => {
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const [logoCacheKey, setLogoCacheKey] = useState<number>(Date.now());

  if (!isOpen) return null;

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setLogoMessage(null);
    try {
      const result = await uploadOfficialLogoFile(file);
      if (result.success) {
        setLogoMessage('Logotipo.png original gravado com sucesso com 100% dos pixels preservados!');
        setLogoCacheKey(Date.now());
      } else {
        setLogoMessage(result.message || 'Erro ao salvar logotipo.');
      }
    } catch (err: any) {
      setLogoMessage(err.message || 'Erro ao processar imagem.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const update = (partial: Partial<DisplaySettings>) => {
    onUpdateSettings({ ...settings, ...partial });
  };

  const handleTestVoice = async (voiceId: any) => {
    if (testingVoice === voiceId) {
      audioEngine.stop();
      setTestingVoice(null);
      return;
    }

    setTestingVoice(voiceId);
    await audioEngine.testVoice(voiceId, () => {
      setTestingVoice(null);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FBF9F5] border border-[#DED4BC] w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F2EDE1] border-b border-[#DED4BC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C9A227]" />
            <h2 className="font-cinzel text-base font-bold text-[#0C1B2A]">
              Preferências de Leitura Teológica & Áudio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#675C44] hover:text-[#0C1B2A] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto">
          
          {/* Subscription & Account Status Banner (Google Play) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0C1B2A] to-[#172D45] border border-[#C9A227]/40 shadow-xs text-[#E8DCC4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A227]/20 border border-[#C9A227] flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-[#ECC867] fill-[#ECC867]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-bold text-sm text-[#F5EDE0]">
                    {currentUser?.isPro ? 'Plano Teológico PRO Ativo' : 'Edição Gratuita (Básica)'}
                  </h4>
                  {currentUser?.isPro && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                      {currentUser?.plan === 'lifetime' ? 'VITALÍCIO' : 'ASSINANTE'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#A89C82] mt-0.5">
                  {currentUser?.isPro
                    ? 'Você tem acesso ilimitado à Exegese IA, Áudios Neurais contínuos e Concordância Strong expandida.'
                    : 'Desbloqueie Exegese IA ilimitada, Áudios Neurais humanos e Strong completo via Google Play.'}
                </p>
              </div>
            </div>

            {onOpenSubscriptionModal && (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A227] to-[#DFB943] hover:brightness-110 text-[#0C1B2A] font-serif font-bold text-xs shrink-0 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Crown className="w-3.5 h-3.5 fill-[#0C1B2A]" />
                <span>{currentUser?.isPro ? 'Gerenciar Assinatura' : 'Ver Planos Pro 👑'}</span>
              </button>
            )}
          </div>

          {/* Hebrew Reading Order (Novo recurso chave) */}
          <div className="space-y-3">
            <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Ordem de Visualização do Hebraico</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => update({ hebrewReadingOrder: 'didactic_ltr' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.hebrewReadingOrder === 'didactic_ltr'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Ordem Didática (1 ➔ 2 ➔ 3)</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Palavras dispostas da esquerda para a direita, alinhando cada termo hebraico acima de sua tradução em português.
                </span>
              </button>

              <button
                type="button"
                onClick={() => update({ hebrewReadingOrder: 'traditional_rtl' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.hebrewReadingOrder === 'traditional_rtl'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <ArrowLeft className="w-3.5 h-3.5 text-[#7A3E26]" />
                  <span>Massorético Tradicional (⟵ RTL)</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Leitura autêntica da direita para a esquerda exatamente como nos manuscritos e pergaminhos da Torá.
                </span>
              </button>
            </div>
          </div>

          {/* Modo de Visualização Interlinear */}
          <div className="space-y-3 pt-2 border-t border-[#EDE5D2]">
            <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Modo de Visualização Interlinear</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => update({ defaultViewMode: 'classic_interlinear' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  (settings.defaultViewMode || 'classic_interlinear') === 'classic_interlinear'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <span className="text-[#C9A227] font-serif text-sm">📖</span>
                  <span>Palavra sob Palavra (Clássica)</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Como nas Bíblias interlineares impressas: cada palavra original tem a tradução exatamente embaixo dela.
                </span>
              </button>

              <button
                type="button"
                onClick={() => update({ defaultViewMode: 'parallel' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.defaultViewMode === 'parallel'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <span className="text-[#C9A227] font-serif text-sm">📑</span>
                  <span>Lado a Lado (Comparativo)</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Texto original hebraico/grego de um lado e tradução fluente com exegese do outro.
                </span>
              </button>

              <button
                type="button"
                onClick={() => update({ defaultViewMode: 'interlinear' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.defaultViewMode === 'interlinear'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <span className="text-[#2A4D69] font-serif text-sm">🗂️</span>
                  <span>Blocos / Cartões Léxicos</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Fichas individuais destacadas com caixas, números e morfologia detalhada.
                </span>
              </button>

              <button
                type="button"
                onClick={() => update({ defaultViewMode: 'verse_by_verse' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.defaultViewMode === 'verse_by_verse'
                    ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                    : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0C1B2A] text-xs mb-1">
                  <span className="text-[#7A3E26] font-serif text-sm">📄</span>
                  <span>Linha a Linha (Contínuo)</span>
                </div>
                <span className="text-[11px] text-[#6B5E43] leading-tight block">
                  Versículo corrido no original, seguido de transliteração e tradução contínua.
                </span>
              </button>
            </div>
          </div>

          {/* Tradução Bíblica Principal */}
          <div className="space-y-3 pt-2 border-t border-[#EDE5D2]">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Tradução Bíblica Principal ({WORLD_TRANSLATIONS.length} Versões Mundiais)</span>
              </div>
              {onOpenTranslationsModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTranslationsModal();
                  }}
                  className="text-[11px] text-[#8C6D00] hover:text-[#0C1B2A] font-bold underline cursor-pointer"
                >
                  Ver Todas & Comparar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WORLD_TRANSLATIONS.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => update({ selectedTranslation: t.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.selectedTranslation === t.id
                      ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                      : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-[#0C1B2A]">{t.shortName}</span>
                    <span className="text-xs">{t.flag}</span>
                  </div>
                  <span className="text-[10px] text-[#786C50] block truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-[#EDE5D2]">
            <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Camadas Interlineares Visíveis</span>
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2D8C0] cursor-pointer hover:border-[#C9A227] transition-all">
              <div>
                <span className="font-semibold text-[#0C1B2A] block text-xs">
                  Numeração das Palavras (#1, #2, #3...)
                </span>
                <span className="text-[11px] text-[#786C50]">
                  Exibir índice da posição de cada palavra no versículo para evitar confusão de ordem
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showWordNumbers}
                onChange={(e) => update({ showWordNumbers: e.target.checked })}
                className="w-4 h-4 accent-[#0C1B2A] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2D8C0] cursor-pointer hover:border-[#C9A227] transition-all">
              <div>
                <span className="font-semibold text-[#0C1B2A] block text-xs">
                  Transliteração Fonética
                </span>
                <span className="text-[11px] text-[#786C50]">
                  Exibir pronúncia em caracteres latinos sob o texto bíblico
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showTransliteration}
                onChange={(e) => update({ showTransliteration: e.target.checked })}
                className="w-4 h-4 accent-[#0C1B2A] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2D8C0] cursor-pointer hover:border-[#C9A227] transition-all">
              <div>
                <span className="font-semibold text-[#0C1B2A] block text-xs">
                  Códigos de Concordância Strong
                </span>
                <span className="text-[11px] text-[#786C50]">
                  Exibir numeração lexical (H/G) para estudo em dicionários
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showStrong}
                onChange={(e) => update({ showStrong: e.target.checked })}
                className="w-4 h-4 accent-[#0C1B2A] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E2D8C0] cursor-pointer hover:border-[#C9A227] transition-all">
              <div>
                <span className="font-semibold text-[#0C1B2A] block text-xs">
                  Morfologia Gramatical
                </span>
                <span className="text-[11px] text-[#786C50]">
                  Exibir classe gramatical detalhada em cada token
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showMorphology}
                onChange={(e) => update({ showMorphology: e.target.checked })}
                className="w-4 h-4 accent-[#0C1B2A] rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Voice Selection (Voz Humana IA de Estúdio) */}
          <div className="space-y-3 pt-2 border-t border-[#EDE5D2]">
            {/* Box de Padronização para Toda a Bíblia */}
            <div className="p-3.5 rounded-xl bg-[#FFFDF7] border-2 border-[#C9A227] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#C9A227]" />
                  <span className="font-bold text-[#0C1B2A] text-xs">
                    Padrão de Toda a Bíblia: Mesma Voz de Gênesis 1:1
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Fixada em Toda a Bíblia
                </span>
              </div>
              <p className="text-[11px] text-[#554A34] leading-relaxed">
                Toda a Bíblia (do Gênesis ao Apocalipse) está travada para utilizar <strong>somente esta leitura humana perfeita (Puck)</strong> com a mesma entonação, prosódia e reverência, sem mudar de voz.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Voz Narradora Ativa (Gemini IA)</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                Voz Humana Real
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'Puck', label: 'Puck (Recomendada)', desc: 'Voz humana extremamente expressiva, natural, articulada e fluida' },
                { id: 'Fenrir', label: 'Fenrir', desc: 'Voz masculina solene, profunda e reverente de narrador bíblico' },
                { id: 'Kore', label: 'Kore', desc: 'Voz feminina clara, calorosa, doce e acolhedora' },
                { id: 'Aoede', label: 'Aoede', desc: 'Voz feminina serena, melódica e contemplativa' },
                { id: 'Zephyr', label: 'Zephyr', desc: 'Voz suave, equilibrada com cadência natural e tranquila' },
                { id: 'Charon', label: 'Charon', desc: 'Voz masculina grave, firme e pausada para estudo exegético' }
              ].map((v) => (
                <div
                  key={v.id}
                  onClick={() => update({ audioVoice: v.id as any })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    settings.audioVoice === v.id
                      ? 'bg-white border-[#C9A227] ring-2 ring-[#C9A227]/30 shadow-xs'
                      : 'bg-[#FAF7F0] border-[#E2D8C0] hover:bg-white text-[#443C28]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0C1B2A] block text-xs">
                        {v.label}
                      </span>
                      {settings.audioVoice === v.id && (
                        <span className="text-[9px] font-bold text-[#C9A227] bg-[#FAF6ED] px-1.5 py-0.2 rounded border border-[#C9A227]">
                          Ativa
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#786C50] block mt-0.5 leading-tight">
                      {v.desc}
                    </span>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#F0E9DA] flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestVoice(v.id);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        testingVoice === v.id
                          ? 'bg-[#C9A227] text-[#0C1B2A] animate-pulse'
                          : 'bg-[#EDE5D2] hover:bg-[#C9A227] hover:text-[#0C1B2A] text-[#4A3F29]'
                      }`}
                      title="Ouvir uma amostra desta voz"
                    >
                      {testingVoice === v.id ? (
                        <>
                          <Square className="w-2.5 h-2.5 fill-current" />
                          <span>Parar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Ouvir Amostra</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Audio Speed Slider */}
            <div className="p-3 rounded-xl bg-white border border-[#E2D8C0] mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-[#0C1B2A]">
                  Velocidade da Voz de Narração
                </span>
                <span className="font-mono text-[#786C50] font-bold">{settings.audioSpeed || 1.0}x</span>
              </div>
              <input
                type="range"
                min={0.8}
                max={1.2}
                step={0.1}
                value={settings.audioSpeed || 1.0}
                onChange={(e) => update({ audioSpeed: Number(e.target.value) })}
                className="w-full accent-[#0C1B2A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C7E62] mt-0.5 font-mono">
                <span>0.8x (Pausado)</span>
                <span>1.0x (Natural)</span>
                <span>1.2x (Ágil)</span>
              </div>
            </div>
          </div>

          {/* Typography Sizes */}
          <div className="space-y-4 pt-2 border-t border-[#EDE5D2]">
            <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Dimensionamento de Fontes</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-[#0C1B2A]">
                  Tamanho da Fonte Original (Hebraico / Grego)
                </span>
                <span className="font-mono text-[#786C50]">{settings.fontSizeOriginal}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={34}
                step={2}
                value={settings.fontSizeOriginal}
                onChange={(e) => update({ fontSizeOriginal: Number(e.target.value) })}
                className="w-full accent-[#0C1B2A] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-[#0C1B2A]">
                  Tamanho da Fonte em Português
                </span>
                <span className="font-mono text-[#786C50]">{settings.fontSizePortuguese}px</span>
              </div>
              <input
                type="range"
                min={13}
                max={22}
                step={1}
                value={settings.fontSizePortuguese}
                onChange={(e) => update({ fontSizePortuguese: Number(e.target.value) })}
                className="w-full accent-[#0C1B2A] cursor-pointer"
              />
            </div>
          </div>

          {/* Logotipo Oficial Bíblia Apolinário */}
          <div className="pt-2 border-t border-[#EDE5D2] space-y-3">
            <div className="text-[11px] font-sans text-[#786C50] tracking-wider uppercase font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Logotipo Oficial do Aplicativo</span>
              </span>
              <span className="text-[10px] font-mono bg-[#0C1B2A] px-2 py-0.5 rounded text-[#F3E5AB]">
                Logotipo.png
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E2D8C0] flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#C9A227] shadow-xs bg-[#0C1B2A] shrink-0">
                <img 
                  src={getOfficialLogoUrl()}
                  alt="Logotipo Oficial Bíblia Interlinear Apolinário" 
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/Logotipo.png';
                  }}
                />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="font-bold text-[#0C1B2A] text-xs flex items-center gap-2">
                  <span>Logotipo Oficial Definitivo</span>
                  <span className="text-[10px] bg-[#E8F5E9] text-[#1E5F2B] font-semibold px-2 py-0.5 rounded border border-[#A5D6A7]">
                    Ativo • 100% dos pixels
                  </span>
                </div>
                <div className="text-[11px] text-[#6B5E43] mt-0.5 leading-snug">
                  Arquivo original <code className="font-mono text-[#0C1B2A]">Logotipo.png</code> configurado permanentemente na aplicação e no PWA com fidelidade absoluta de pixels.
                </div>

                {logoMessage && (
                  <div className="mt-2 text-[11px] text-[#1E5F2B] font-medium bg-[#E8F5E9] p-1.5 rounded border border-[#A5D6A7]">
                    {logoMessage}
                  </div>
                )}
              </div>

              <label className="cursor-pointer px-3.5 py-2 bg-[#0C1B2A] hover:bg-[#1A334F] text-[#F3E5AB] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs">
                <Upload className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>{uploadingLogo ? 'Gravando...' : 'Carregar Logotipo.png'}</span>
                <input 
                  type="file" 
                  accept="image/png,image/*" 
                  onChange={handleUploadLogo} 
                  disabled={uploadingLogo}
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Fullscreen & PWA Download / Share Section */}
          <div className="pt-2 border-t border-[#EDE5D2]">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0C1B2A] to-[#1E293B] text-white flex items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="font-cinzel text-xs font-bold text-[#F3E5AB] flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                  Tela Cheia & Aplicativo (PWA)
                </span>
                <span className="text-[11px] text-gray-300 block mt-0.5">
                  Compartilhe o link de tela cheia sem bordas ou instale no celular/PC.
                </span>
              </div>
              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenShareModal();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#b5901f] text-[#0C1B2A] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Acessar</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F2EDE1] border-t border-[#DED4BC] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0C1B2A] text-white rounded-lg font-semibold hover:bg-[#1A334F] transition-colors"
          >
            Concluído
          </button>
        </div>

      </div>
    </div>
  );
};
