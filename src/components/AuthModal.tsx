import React, { useState } from 'react';
import { UserProfile } from '../types/bible';
import { getOfficialLogoUrl } from '../utils/logoManager';
import { Sparkles, Mail, Lock, User, BookOpen, ShieldCheck, ArrowRight, LogIn, UserPlus, CheckCircle2, Globe2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserProfile) => void;
}

const AUTH_STORAGE_KEY = 'apolinario_bible_user_session_v1';

export function loadStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Estudante');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (password.length < 4) {
      setError('A senha deve conter pelo menos 4 caracteres.');
      return;
    }

    // Create or login user session
    const user: UserProfile = {
      id: `user_${Date.now()}`,
      name: isRegister ? name.trim() : (cleanEmail.split('@')[0] || 'Estudante da Bíblia'),
      email: cleanEmail,
      role: isRegister ? role : 'Estudante',
      createdAt: new Date().toISOString()
    };

    saveStoredUser(user);
    onLoginSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0C1B2A]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-[#FBF9F5] border-2 border-[#C9A227] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col text-[#1C1917] relative">
        
        {/* Decorative Header Banner */}
        <div className="bg-gradient-to-br from-[#0C1B2A] via-[#1A2E40] to-[#0C1B2A] px-6 pt-8 pb-10 text-center relative overflow-hidden border-b-2 border-[#C9A227]">
          {/* Background glowing light effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#C9A227]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#C9A227]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#C9A227] shadow-lg bg-[#0C1B2A] p-1 mb-3 flex items-center justify-center">
              <img 
                src={getOfficialLogoUrl()} 
                alt="Logotipo Oficial" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Logotipo.png';
                }}
              />
            </div>

            <h1 className="font-cinzel text-lg sm:text-xl font-bold text-[#F3E5AB] tracking-wide">
              BÍBLIA INTERLINEAR APOLINÁRIO
            </h1>
            <p className="text-xs text-amber-200/80 font-sans tracking-wider uppercase mt-1">
              Estudo Exegético Hebraico & Grego
            </p>
          </div>
        </div>

        {/* Auth Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D8C0] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C9A227]" />
              <span className="font-bold text-sm text-[#0C1B2A]">
                {isRegister ? 'Criar Nova Conta' : 'Acessar sua Conta'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs font-semibold text-[#8C6D00] hover:underline cursor-pointer"
            >
              {isRegister ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2 animate-shake">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Pastor João Silva"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">
                Senha Segura
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7E62] absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#786C50]">
                  Perfil Teológico
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2D8C0] text-xs text-[#0C1B2A] focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                >
                  <option value="Estudante">Estudante da Bíblia</option>
                  <option value="Teólogo">Teólogo / Acadêmico</option>
                  <option value="Pastor">Pastor / Ministro</option>
                  <option value="Líder">Líder de Escola Bíblica</option>
                  <option value="Membro">Membro</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#0C1B2A] to-[#1A334F] hover:from-[#1A334F] hover:to-[#0C1B2A] text-[#F3E5AB] font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#C9A227]/40"
            >
              {isRegister ? (
                <>
                  <UserPlus className="w-4 h-4 text-[#C9A227]" />
                  <span>Cadastrar e Entrar</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#C9A227]" />
                  <span>Entrar no Aplicativo</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#F2EDE1] px-6 py-3 border-t border-[#E2D8C0] text-center text-[10px] text-[#786C50] flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Seus dados e notas pessoais são salvos de forma segura no dispositivo.</span>
        </div>

      </div>
    </div>
  );
};
