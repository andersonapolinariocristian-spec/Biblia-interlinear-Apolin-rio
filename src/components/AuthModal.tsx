import React, { useState } from 'react';
import type { UserProfile } from '../types/bible';
import { getOfficialLogoUrl } from '../utils/logoManager';
import { Sparkles, Mail, Lock, User, BookOpen, ShieldCheck, LogIn, UserPlus, LoaderCircle, KeyRound } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { requestPasswordReset, signInWithPassword, signUpWithPassword } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Estudante');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || (!isResetMode && !password)) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Informe seu nome completo.');
      return;
    }
    if (isRegister && password.length < 8) {
      setError('Use uma senha com pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      if (isResetMode) {
        await requestPasswordReset(cleanEmail);
        setNotice('Se houver uma conta com esse e-mail, você receberá instruções para redefinir a senha. Confira também o spam.');
      } else if (isRegister) {
        const result = await signUpWithPassword({ name, email: cleanEmail, password, role });
        if (result.user) {
          onLoginSuccess(result.user);
        } else {
          setNotice('Cadastro recebido! Confirme seu e-mail pelo link enviado antes de entrar.');
          setIsRegister(false);
        }
      } else {
        const user = await signInWithPassword(cleanEmail, password);
        onLoginSuccess(user);
      }
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível concluir a operação.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const title = isResetMode ? 'Redefinir senha' : isRegister ? 'Criar Nova Conta' : 'Acessar sua Conta';

  return (
    <div className="fixed inset-0 z-50 bg-[#0C1B2A]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#FBF9F5] border-2 border-[#C9A227] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1C1917] relative">
        <div className="bg-gradient-to-br from-[#0C1B2A] via-[#1A2E40] to-[#0C1B2A] px-6 pt-8 pb-10 text-center relative overflow-hidden border-b-2 border-[#C9A227]">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#C9A227] shadow-lg bg-[#0C1B2A] p-1 mb-3 flex items-center justify-center">
              <img src={getOfficialLogoUrl()} alt="Logotipo Oficial" className="w-full h-full object-cover rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = '/Logotipo.png'; }} />
            </div>
            <h1 className="font-cinzel text-lg sm:text-xl font-bold text-[#F3E5AB] tracking-wide">BÍBLIA INTERLINEAR APOLINÁRIO</h1>
            <p className="text-xs text-amber-200/80 font-sans tracking-wider uppercase mt-1">Estudo Exegético Hebraico & Grego</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D8C0] pb-3 gap-3">
            <div className="flex items-center gap-2">
              {isResetMode ? <KeyRound className="w-4 h-4 text-[#C9A227]" /> : <BookOpen className="w-4 h-4 text-[#C9A227]" />}
              <span className="font-bold text-sm text-[#0C1B2A]">{title}</span>
            </div>
            <button type="button" disabled={isLoading} onClick={() => { setIsResetMode(!isResetMode); setError(null); setNotice(null); }} className="text-xs font-semibold text-[#8C6D00] hover:underline disabled:opacity-50">
              {isResetMode ? 'Voltar ao login' : 'Esqueci a senha'}
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs">
              O login seguro ainda não está configurado neste ambiente. O administrador precisa definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
            </div>
          )}
          {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">⚠️ {error}</div>}
          {notice && <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">{notice}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && !isResetMode && (
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">Nome Completo</label>
                <div className="relative"><User className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" autoComplete="name" required className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">E-mail de Acesso</label>
              <div className="relative"><Mail className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" autoComplete="email" required className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
              </div>
            </div>
            {!isResetMode && <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">Senha</label>
              <div className="relative"><Lock className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 8 : undefined} required className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
              </div>
            </div>}
            {isRegister && !isResetMode && <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">Perfil Teológico</label>
              <select value={role} onChange={(e) => setRole(e.target.value as UserProfile['role'])} className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]">
                <option value="Estudante">Estudante da Bíblia</option><option value="Teólogo">Teólogo / Acadêmico</option><option value="Pastor">Pastor / Ministro</option><option value="Líder">Líder de Escola Bíblica</option><option value="Membro">Membro</option>
              </select>
            </div>}
            <button type="submit" disabled={isLoading || !isSupabaseConfigured} className="w-full py-3 bg-gradient-to-r from-[#0C1B2A] to-[#1A334F] hover:from-[#1A334F] hover:to-[#0C1B2A] disabled:opacity-50 text-[#F3E5AB] font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all border border-[#C9A227]/40">
              {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : isRegister ? <UserPlus className="w-4 h-4 text-[#C9A227]" /> : isResetMode ? <KeyRound className="w-4 h-4 text-[#C9A227]" /> : <LogIn className="w-4 h-4 text-[#C9A227]" />}
              <span>{isLoading ? 'Aguarde...' : isResetMode ? 'Enviar instruções' : isRegister ? 'Cadastrar conta' : 'Entrar no aplicativo'}</span>
            </button>
          </form>
          {!isResetMode && <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); setNotice(null); }} className="w-full text-xs font-semibold text-[#8C6D00] hover:underline">
            {isRegister ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>}
        </div>
        <div className="bg-[#F2EDE1] px-6 py-3 border-t border-[#E2D8C0] text-center text-[10px] text-[#786C50] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Autenticação protegida pelo Supabase. Sua senha não é armazenada pelo aplicativo.</span>
        </div>
      </div>
    </div>
  );
};
