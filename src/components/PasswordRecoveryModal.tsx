import React, { useState } from 'react';
import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';
import { getSupabaseClient } from '../services/authService';

interface Props { isOpen: boolean; onComplete: () => void; }

export function PasswordRecoveryModal({ isOpen, onComplete }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!isOpen) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Use uma senha com pelo menos 8 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas não são iguais.'); return; }
    const client = getSupabaseClient();
    if (!client) { setError('Supabase não configurado.'); return; }
    setBusy(true);
    try {
      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;
      await client.auth.signOut();
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally { setBusy(false); }
  }

  return <div className="fixed inset-0 z-[60] bg-[#0C1B2A]/90 backdrop-blur-md flex items-center justify-center p-4">
    <div className="bg-[#FBF9F5] border-2 border-[#C9A227] w-full max-w-md rounded-3xl shadow-2xl p-7 text-[#1C1917]">
      <div className="flex items-center gap-3 mb-5"><KeyRound className="w-6 h-6 text-[#8C6D00]" /><h2 className="font-bold text-lg text-[#0C1B2A]">Criar nova senha</h2></div>
      <p className="text-sm mb-5 text-[#6B5E43]">Escolha uma senha nova para sua conta.</p>
      {error && <p role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-bold">Nova senha<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full p-3 rounded-xl border border-[#E2D8C0] bg-white" /></label>
        <label className="block text-xs font-bold">Confirme a nova senha<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 w-full p-3 rounded-xl border border-[#E2D8C0] bg-white" /></label>
        <button disabled={busy} className="w-full p-3 rounded-xl bg-[#0C1B2A] text-[#F3E5AB] font-bold flex justify-center items-center gap-2 disabled:opacity-50">{busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}Salvar nova senha</button>
      </form>
    </div>
  </div>;
}
