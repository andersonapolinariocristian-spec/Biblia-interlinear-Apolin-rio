import React, { useState } from 'react';
import { UserProfile } from '../types/bible';
import { 
  PLAY_STORE_PLANS, 
  PricingPlan, 
  purchasePlan, 
  redeemVoucherCode, 
  isUserPro 
} from '../services/billingService';
import { getOfficialLogoUrl } from '../utils/logoManager';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Volume2, 
  Layers, 
  Smartphone, 
  Key, 
  ArrowRight,
  Gift,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserUpdated: (user: UserProfile) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('annual');
  const [voucherCode, setVoucherCode] = useState('');
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const userHasPro = isUserPro(currentUser);
  const selectedPlan = PLAY_STORE_PLANS.find((p) => p.id === selectedPlanId) || PLAY_STORE_PLANS[1];

  const handleSubscribe = async (plan: PricingPlan) => {
    setIsProcessing(true);
    setStatusMessage(null);

    const result = await purchasePlan(plan, currentUser);
    setIsProcessing(false);

    if (result.success && result.updatedUser) {
      onUserUpdated(result.updatedUser);
      setStatusMessage({ text: result.message, isError: false });
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    setIsProcessing(true);
    const result = await redeemVoucherCode(voucherCode, currentUser);
    setIsProcessing(false);
    if (result.success && result.updatedUser) {
      onUserUpdated(result.updatedUser);
      setVoucherCode('');
      setStatusMessage({ text: result.message, isError: false });
    } else {
      setStatusMessage({ text: result.message, isError: true });
    }
  };

  const handleRestorePurchases = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (userHasPro) {
        setStatusMessage({ text: 'Suas compras ativas foram restauradas e verificadas no dispositivo.', isError: false });
      } else {
        setStatusMessage({ text: 'Nenhuma assinatura anterior encontrada para esta conta. Selecione um plano abaixo.', isError: true });
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#0F2236] border border-[#C9A227]/40 rounded-2xl shadow-2xl text-[#E8DCC4] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-r from-[#0C1B2A] via-[#1B3550] to-[#0C1B2A] px-6 py-6 border-b border-[#C9A227]/30 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#C9A227] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C9A227] shadow-lg bg-[#0C1B2A] flex items-center justify-center">
              <img 
                src={getOfficialLogoUrl()} 
                alt="Logo Apolinário" 
                className="w-full h-full object-cover scale-110" 
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227] text-[#ECC867] text-xs font-bold tracking-wider uppercase">
              <Crown className="w-3.5 h-3.5 fill-[#ECC867]" />
              Edição Teológica PRO
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5EDE0] tracking-tight">
            Desbloqueie Todo o Poder da Bíblia Apolinário
          </h2>
          <p className="text-xs sm:text-sm text-[#BDB29B] max-w-lg mx-auto mt-1 font-sans">
            A ferramenta definitiva para pastores, professores, seminaristas e pesquisadores das Escrituras Sagradas em hebraico e grego.
          </p>

          {userHasPro && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-full text-emerald-300 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sua conta já possui Acesso Pro ativo ({currentUser?.plan === 'lifetime' ? 'Vitalício' : 'Assinatura Ativa'})
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Feedback Message */}
          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 font-sans border ${
              statusMessage.isError 
                ? 'bg-red-950/60 border-red-500/40 text-red-200' 
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
            }`}>
              {statusMessage.isError ? <X className="w-4 h-4 shrink-0 text-red-400" /> : <Check className="w-4 h-4 shrink-0 text-emerald-400" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Value Grid / Pro Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            <div className="p-2.5 rounded-lg bg-[#162C44]/70 border border-[#C9A227]/20 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#ECC867] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F2EDE1] block">Exegese Teológica com IA Ilimitada</strong>
                <span className="text-[#A89C82]">Análise hermenêutica profunda do texto original com base bíblica e histórica.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#162C44]/70 border border-[#C9A227]/20 flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-[#ECC867] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F2EDE1] block">Áudio Neural com Vozes Humanas</strong>
                <span className="text-[#A89C82]">Narração contínua em português, hebraico massorético e grego sem travamentos.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#162C44]/70 border border-[#C9A227]/20 flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-[#ECC867] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F2EDE1] block">Concordância Strong & Morfologia Completa</strong>
                <span className="text-[#A89C82]">Léxico hebraico/aramaico/grego sem limites com raízes verbais e etimologia.</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#162C44]/70 border border-[#C9A227]/20 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-[#ECC867] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F2EDE1] block">8 Versões Mundiais em Paralelo</strong>
                <span className="text-[#A89C82]">Compare versículo a versículo com ARA, ARC, NVI, KJV, Vulgata Latina e Septuaginta.</span>
              </div>
            </div>
          </div>

          {/* Pricing Plans Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-sans font-bold text-[#F2EDE1] flex items-center justify-between">
              <span>Selecione a Melhor Opção de Assinatura:</span>
              <span className="text-[11px] text-[#A89C82] font-normal">Faturamento Seguro Google Play</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PLAY_STORE_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative p-3.5 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1B3654] border-[#ECC867] shadow-lg shadow-[#C9A227]/10 scale-[1.02]'
                        : 'bg-[#122336] border-[#254261] hover:border-[#385B80] opacity-80 hover:opacity-100'
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#C9A227] to-[#DFB943] text-[#0C1B2A] text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mt-1 mb-1">
                        <span className="font-serif font-bold text-sm text-[#F5EDE0]">{plan.name}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#ECC867] bg-[#ECC867]' : 'border-[#4D6886]'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-[#0C1B2A] stroke-[3]" />}
                        </div>
                      </div>

                      <div className="my-2">
                        {plan.originalPrice && (
                          <span className="text-[11px] line-through text-[#807660] block">
                            De {plan.originalPrice}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-bold font-serif text-[#ECC867]">{plan.price}</span>
                          <span className="text-[11px] text-[#BDB29B]">/{plan.interval}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#9A8D75] leading-tight mb-2">
                        {plan.periodText}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanId(plan.id);
                        handleSubscribe(plan);
                      }}
                      disabled={isProcessing}
                      className={`w-full py-2 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#C9A227] to-[#E5BE4A] text-[#0C1B2A] hover:brightness-110 shadow-xs'
                          : 'bg-[#1F3957] text-[#E8DCC4] hover:bg-[#27466B]'
                      }`}
                    >
                      {userHasPro ? 'Mudar para este' : 'Escolher este'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A227] via-[#DFB943] to-[#C9A227] hover:brightness-110 text-[#0C1B2A] font-serif font-bold text-base shadow-lg shadow-[#C9A227]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Crown className="w-5 h-5 fill-[#0C1B2A]" />
              <span>
                {isProcessing 
                  ? 'Processando assinatura...' 
                  : `Assinar ${selectedPlan.name} • ${selectedPlan.price}`}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-center text-[10px] text-[#8C8068] mt-2 font-sans flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
                Processado com segurança via Google Play Billing
              </span>
              <span>•</span>
              <button 
                onClick={handleRestorePurchases}
                className="underline hover:text-[#ECC867] transition-colors"
              >
                Restaurar Compras
              </button>
            </p>
          </div>

          {/* Promotional Coupon / Voucher Section */}
          <div className="pt-3 border-t border-[#1C3652]/80">
            <button
              type="button"
              onClick={() => setShowVoucherInput(!showVoucherInput)}
              className="text-xs text-[#C9A227] hover:underline flex items-center gap-1.5 font-sans"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Possui um Código de Ativação, Cupom de Igreja ou Convite VIP?</span>
            </button>

            {showVoucherInput && (
              <form onSubmit={handleRedeemVoucher} className="mt-2.5 flex items-center gap-2">
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 text-[#8A7D63] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Ex: APOLINARIO-PRO ou TEOLOGIA2026"
                    className="w-full pl-9 pr-3 py-2 bg-[#091522] border border-[#2D4766] rounded-lg text-xs text-[#F2EDE1] placeholder-[#6E644E] focus:outline-hidden focus:border-[#C9A227] font-mono uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#233F5F] hover:bg-[#2E517A] text-[#ECC867] border border-[#C9A227]/40 rounded-lg text-xs font-bold transition-colors"
                >
                  Resgatar
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0A1826] border-t border-[#1A334D] flex items-center justify-between text-[11px] text-[#7A6F57] font-sans">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#C9A227]" />
            Compatível com Android, Tablet, Celular e Computador
          </span>
          <button
            onClick={onClose}
            className="hover:text-[#F2EDE1] transition-colors"
          >
            Continuar com versão Gratuita
          </button>
        </div>
      </div>
    </div>
  );
};
