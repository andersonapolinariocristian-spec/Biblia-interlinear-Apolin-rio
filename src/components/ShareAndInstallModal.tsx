import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Laptop, 
  Apple, 
  CheckCircle2, 
  Sparkles,
  Info,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getOfficialLogoUrl } from '../utils/logoManager';

interface ShareAndInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAndInstallModal: React.FC<ShareAndInstallModalProps> = ({ isOpen, onClose }) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isIframe, 
    isFullscreen, 
    install, 
    toggleFullscreen,
    appUrl 
  } = usePWAInstall();

  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'share' | 'pwa' | 'qrcode'>('share');
  const [displayUrl, setDisplayUrl] = useState<string>(appUrl);

  useEffect(() => {
    if (appUrl) {
      setDisplayUrl(appUrl);
    }
  }, [appUrl]);

  useEffect(() => {
    if (isOpen && displayUrl) {
      QRCode.toDataURL(displayUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0C1B2A',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeDataUrl(url);
      }).catch(err => {
        console.error('Error generating QR Code:', err);
      });
    }
  }, [isOpen, displayUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(displayUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = displayUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bíblia Interlinear Apolinário',
          text: 'Estudo bíblico exegético em Hebraico Massorético, Grego Koiné, Português, áudio e jogos.',
          url: displayUrl
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopy();
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (displayUrl) {
      // Direct navigation to open PWA host
      window.open(displayUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-[#FBF9F5] border-2 border-[#C9A227]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0C1B2A] to-[#1E293B] text-white flex items-center justify-between border-b border-[#C9A227]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C9A227] bg-[#0C1B2A] flex items-center justify-center p-0.5 shrink-0">
              <img 
                src={getOfficialLogoUrl()} 
                alt="Logotipo Oficial Bíblia Interlinear Apolinário" 
                className="w-full h-full object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logotipo.png';
                }}
              />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-[#F3E5AB]">
                Tela Cheia & Baixar App (PWA)
              </h2>
              <p className="text-xs text-gray-300 font-sans">
                Acesse em Tela Cheia, Compartilhe e Instale no Dispositivo
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DFD6BD] bg-[#F2EDE1] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'share' 
                ? 'border-[#C9A227] text-[#0C1B2A] bg-[#FBF9F5]' 
                : 'border-transparent text-[#786C50] hover:text-[#0C1B2A]'
            }`}
          >
            <Maximize2 className="w-4 h-4 text-[#C9A227]" />
            <span>Tela Cheia & Link</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pwa' 
                ? 'border-[#C9A227] text-[#0C1B2A] bg-[#FBF9F5]' 
                : 'border-transparent text-[#786C50] hover:text-[#0C1B2A]'
            }`}
          >
            <Download className="w-4 h-4 text-[#C9A227]" />
            <span>Baixar PWA</span>
          </button>

          <button
            onClick={() => setActiveTab('qrcode')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'qrcode' 
                ? 'border-[#C9A227] text-[#0C1B2A] bg-[#FBF9F5]' 
                : 'border-transparent text-[#786C50] hover:text-[#0C1B2A]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#C9A227]" />
            <span>QR Code Celular</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: FULLSCREEN & SHARE */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Immediate 1-Click Native Fullscreen (Always Works, No External URL Required) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0C1B2A] to-[#1E293B] text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3E5AB] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                    Opção Recomendada: Tela Cheia Imediata
                  </span>
                  <span className="text-[10px] bg-[#C9A227]/30 text-[#F3E5AB] font-semibold px-2 py-0.5 rounded-full">
                    Sem erro de link
                  </span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed">
                  Para estudar sem distrações, você pode expandir a Bíblia para preencher 100% do seu monitor agora mesmo, sem precisar abrir outra aba ou carregar links externos:
                </p>

                <button
                  onClick={toggleFullscreen}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#C9A227] hover:bg-[#b5901f] text-[#0C1B2A] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-5 h-5" />
                      <span>Sair da Tela Cheia</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-5 h-5" />
                      <span>Ativar Modo Tela Cheia Imediato</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Direct Link Card */}
              <div className="p-4 rounded-xl bg-white border border-[#DFD6BD] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0C1B2A] uppercase tracking-wider flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-[#C9A227]" />
                    Link Dinâmico da Sessão Atual
                  </span>
                  <span className="text-[11px] bg-[#E9D8A6]/40 text-[#786C50] font-medium px-2 py-0.5 rounded-full">
                    Ativo Agora
                  </span>
                </div>

                <p className="text-xs text-[#6B5E43]">
                  Este é o link direto e real detectado do seu navegador:
                </p>

                {/* URL Display Box */}
                <div className="flex items-center gap-2 bg-[#F6F3EB] p-2.5 rounded-lg border border-[#DFD6BD] text-xs font-mono text-[#0C1B2A] break-all select-all">
                  <span className="flex-1 font-medium">{displayUrl || 'Carregando URL...'}</span>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-[#C9A227] text-[#0C1B2A] hover:bg-[#b5901f]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Link Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link Real</span>
                      </>
                    )}
                  </button>

                  <a
                    href={displayUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#0C1B2A] text-white hover:bg-[#152a40] transition-all shadow-xs cursor-pointer text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-[#F3E5AB]" />
                    <span>Abrir em Nova Aba</span>
                  </a>
                </div>
              </div>

              {/* Troubleshooting Note about AI Studio links */}
              {isIframe && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Por que um link externo pode dar erro?</span>
                    <span className="leading-relaxed block text-amber-800">
                      Os links gerados em ambientes de teste do AI Studio são protegidos pela conta Google do desenvolvedor. Se você tentar abrir em uma janela anônima ou compartilhar com terceiros que não tenham acesso, o Google bloqueará o acesso.
                      <br />
                      <strong>Dica:</strong> No topo da tela do AI Studio, use o botão nativo <strong>"Abrir em nova janela" (ícone de quadrado com seta)</strong> para abrir o preview fora do editor sem qualquer erro!
                    </span>
                  </div>
                </div>
              )}

              {/* Native Mobile Share */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-[#DFD6BD] bg-white hover:bg-[#F2EDE1] text-xs font-semibold text-[#0C1B2A] transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Compartilhar via WhatsApp ou Apps do Sistema</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: PWA INSTALLATION */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-emerald-900">
                    Aplicativo Já Instalado!
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Você já está executando a Bíblia Interlinear Apolinário no modo aplicativo autônomo (PWA) de alta performance.
                  </p>
                </div>
              ) : (
                <>
                  {/* One-Click Install Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#0C1B2A] to-[#1E293B] text-white shadow-md space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#F3E5AB]">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-cinzel font-bold text-sm sm:text-base text-[#F3E5AB]">
                          Instalar no Computador ou Celular
                        </h3>
                        <p className="text-xs text-gray-300">
                          Acesse como um aplicativo nativo, sem barra de URL e com ícone na tela inicial.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#C9A227] hover:bg-[#b5901f] text-[#0C1B2A] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isInstallable 
                          ? 'Instalar Aplicativo Agora' 
                          : isIframe 
                            ? 'Abrir em Nova Aba para Instalar' 
                            : 'Instalar Aplicativo'}
                      </span>
                    </button>
                  </div>

                  {/* Guides for different OS */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-[#0C1B2A] uppercase tracking-wide">
                      Passo a Passo por Dispositivo:
                    </h4>

                    {/* Android & Google Chrome / Edge */}
                    <div className="p-3 rounded-xl bg-white border border-[#DFD6BD] text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-[#0C1B2A]">
                        <Laptop className="w-4 h-4 text-[#C9A227]" />
                        <span>Google Chrome / Microsoft Edge / Android</span>
                      </div>
                      <p className="text-[#6B5E43] leading-relaxed">
                        1. Abra a aplicação no Chrome ou Edge.<br/>
                        2. Clique no ícone de instalação <span className="font-semibold text-[#0C1B2A]">⊕ (Instalar App)</span> na barra de endereços do topo.<br/>
                        3. Ou abra o menu de 3 pontinhos <span className="font-semibold text-[#0C1B2A]">⋮</span> e selecione <span className="font-semibold text-[#0C1B2A]">"Instalar Bíblia Interlinear Apolinário"</span>.
                      </p>
                    </div>

                    {/* Apple iOS Safari */}
                    <div className="p-3 rounded-xl bg-white border border-[#DFD6BD] text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-semibold text-[#0C1B2A]">
                        <Apple className="w-4 h-4 text-[#C9A227]" />
                        <span>iPhone / iPad (iOS Safari)</span>
                      </div>
                      <p className="text-[#6B5E43] leading-relaxed">
                        1. Abra no navegador Safari do iPhone/iPad.<br/>
                        2. Toque no botão central de <span className="font-semibold text-[#0C1B2A]">Compartilhar</span> (ícone quadrado com seta para cima ⎋).<br/>
                        3. Role a lista e toque em <span className="font-semibold text-[#0C1B2A]">"Adicionar à Tela de Início" (Add to Home Screen)</span>.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* PWA Advantages */}
              <div className="p-3 rounded-xl bg-[#F2EDE1] border border-[#DFD6BD] text-xs space-y-2">
                <span className="font-bold text-[#0C1B2A] block">
                  Vantagens do Aplicativo PWA:
                </span>
                <ul className="space-y-1 text-[#6B5E43] list-disc list-inside">
                  <li>Inicia instantaneamente direto do ícone na sua área de trabalho.</li>
                  <li>Funciona com caching offline das escrituras e fontes.</li>
                  <li>Tela inteira pura, sem poluição visual do navegador.</li>
                  <li>Leve e não consome memória de lojas de aplicativos.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: QR CODE */}
          {activeTab === 'qrcode' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[#6B5E43]">
                Aponte a câmera do seu celular para o QR Code abaixo para carregar o aplicativo e adicioná-lo à tela de início:
              </p>

              {/* QR Code Container */}
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#C9A227] shadow-lg">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code Bíblia Interlinear" 
                    className="w-56 h-56 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-gray-400">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="text-xs font-semibold text-[#0C1B2A]">
                  Bíblia Interlinear Apolinário
                </div>
                <div className="text-[11px] font-mono text-[#786C50] break-all bg-[#F2EDE1] p-2 rounded-lg border border-[#DFD6BD]">
                  {displayUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0C1B2A] bg-[#F2EDE1] hover:bg-[#E7DFC6] border border-[#DFD6BD] rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#C9A227]" />}
                  <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#F2EDE1] border-t border-[#DFD6BD] flex items-center justify-between text-xs">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 text-[#554C37] hover:text-[#0C1B2A] font-semibold cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#C9A227]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#C9A227]" />}
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Alternar Tela Cheia'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0C1B2A] text-white hover:bg-[#1a2e42] font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
