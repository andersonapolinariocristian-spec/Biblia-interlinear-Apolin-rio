/**
 * Google Play Billing & Subscription Service (TWA / Web / PWA)
 * Supports Google Play Digital Goods API (window.getDigitalGoodsService)
 * and secure local license/coupon redemption.
 */

import { UserProfile, SubscriptionPlan } from '../types/bible';
import { getSupabaseClient } from './authService';

export interface PricingPlan {
  id: string;
  sku: string; // Play Store Product / Subscription ID
  name: string;
  badge?: string;
  price: string;
  originalPrice?: string;
  interval: string;
  periodText: string;
  features: string[];
  popular?: boolean;
}

export const PLAY_STORE_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    sku: 'apolinario_sub_monthly',
    name: 'Plano Mensal Pro',
    price: 'R$ 14,90',
    interval: 'mês',
    periodText: 'Cobrado mensalmente • Cancele quando quiser',
    features: [
      'Exegese Adventista com IA Ilimitada',
      'Áudio Neural com dicção humana em toda a Bíblia',
      'Concordância Léxica Strong & Morfologia Completa',
      'Modo Estudo Comparativo com 8 Versões Mundiais',
      'Uso 100% Offline via PWA'
    ]
  },
  {
    id: 'annual',
    sku: 'apolinario_sub_annual',
    name: 'Plano Anual Premium',
    badge: 'Mais Escolhido • 50% OFF',
    price: 'R$ 89,90',
    originalPrice: 'R$ 178,80',
    interval: 'ano',
    periodText: 'Equivale a apenas R$ 7,49/mês • 1 ano completo',
    features: [
      'Tudo do Plano Mensal incluído',
      'Economia de mais de 50% no ano',
      'Arena do Jogo de Montagem de Vocábulos Hebraicos',
      'Sincronização ilimitada de Anotações Pessoais',
      'Emblema Dourado de Teólogo / Pastor no perfil',
      'Suporte prioritário e novas versões antecipadas'
    ],
    popular: true
  },
  {
    id: 'lifetime',
    sku: 'apolinario_inapp_lifetime',
    name: 'Acesso Vitalício Único',
    badge: 'Pagamento Único',
    price: 'R$ 149,90',
    originalPrice: 'R$ 299,00',
    interval: 'vitalício',
    periodText: 'Pague uma única vez • Acesso para sempre sem mensalidades',
    features: [
      'Acesso eterno a todas as ferramentas e futuros livros',
      'Sem renovações ou cobranças futuras',
      'Todas as atualizações de recursos e traduções inclusas',
      'Acesso em múltiplos dispositivos (celular, tablet e PC)',
      'Certificado de Apoiador Master da Obra Teológica'
    ]
  }
];

/**
 * Check if the Digital Goods API is available (Google Play Store TWA environment)
 */
export async function isGooglePlayBillingAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'getDigitalGoodsService' in window;
}

/**
 * Initiate checkout for a subscription plan via Google Play or Web fallback
 */
export async function purchasePlan(
  _plan: PricingPlan,
  _currentUser: UserProfile | null
): Promise<{ success: boolean; message: string; updatedUser?: UserProfile }> {
  // Never unlock paid access in the browser. A verified Play Store purchase flow
  // and server-side receipt validation must be configured before this is enabled.
  return {
    success: false,
    message: 'A cobrança segura ainda não está integrada. Nenhum valor foi cobrado e o acesso Pro não foi alterado. Entre em contato com o suporte.'
  };
}

/**
 * Redeem a voucher through a server-side Postgres function. Voucher values and
 * entitlement changes must never be trusted from client-side constants/storage.
 */
export async function redeemVoucherCode(
  rawCode: string,
  currentUser: UserProfile | null
): Promise<{ success: boolean; message: string; updatedUser?: UserProfile }> {
  if (!currentUser) {
    return { success: false, message: 'Entre na sua conta antes de resgatar um cupom.' };
  }
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { success: false, message: 'Por favor, digite o código do cupom ou chave de ativação.' };
  }
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não configurado. O cupom não foi resgatado.' };
  }
  const { data, error } = await client.rpc('redeem_voucher', { p_code: code });
  if (error) {
    return { success: false, message: 'Não foi possível validar o cupom. Verifique a configuração do banco ou contate o suporte.' };
  }
  const result = data as { success?: boolean; message?: string; plan?: SubscriptionPlan; expires_at?: string } | null;
  if (!result?.success) {
    return { success: false, message: result?.message || 'Código inválido, expirado ou já utilizado.' };
  }
  return {
    success: true,
    message: result.message || 'Cupom validado. O acesso será atualizado pela conta.',
    updatedUser: {
      ...currentUser,
      // This is only a display hint. Authorization must check the database entitlement.
      isPro: true,
      plan: result.plan || 'free',
      proExpiresAt: result.expires_at,
    }
  };
}

/**
 * Check if the user currently holds active Pro access
 */
export function isUserPro(user: UserProfile | null): boolean {
  if (!user) return false;
  // Until the server-backed entitlement is loaded, fail closed.
  if (!user.isPro) return false;
  if (!user.proExpiresAt) return true;

  try {
    const expiry = new Date(user.proExpiresAt).getTime();
    return expiry > Date.now();
  } catch {
    return false;
  }
}
