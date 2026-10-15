import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types/bible';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const ALLOWED_ROLES: UserProfile['role'][] = [
  'Estudante', 'Teólogo', 'Pastor', 'Líder', 'Membro',
];

export function profileFromSupabaseUser(user: User): UserProfile {
  const metadata = user.user_metadata ?? {};
  const candidateRole = metadata.role as UserProfile['role'] | undefined;

  return {
    id: user.id,
    email: user.email ?? '',
    name: typeof metadata.full_name === 'string' && metadata.full_name.trim()
      ? metadata.full_name.trim()
      : (user.email?.split('@')[0] || 'Estudante da Bíblia'),
    role: candidateRole && ALLOWED_ROLES.includes(candidateRole) ? candidateRole : 'Estudante',
    createdAt: user.created_at,
    // Never derive paid access from user-editable metadata or browser storage.
    isPro: false,
    plan: 'free',
  };
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('O Supabase ainda não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de implantação.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.user || !data.session) {
    throw new Error('Não foi possível iniciar a sessão. Verifique seu e-mail e senha.');
  }
  return profileFromSupabaseUser(data.user);
}

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
  role: UserProfile['role'];
}) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('O Supabase ainda não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de implantação.');
  }
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        full_name: input.name.trim(),
        // This is display metadata only; never use it to authorize privileged actions.
        role: input.role,
      },
    },
  });
  if (error) throw error;
  if (data.session && data.user) {
    return { user: profileFromSupabaseUser(data.user), confirmationRequired: false };
  }
  return { user: null, confirmationRequired: true };
}

export async function requestPasswordReset(email: string) {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('O Supabase ainda não está configurado.');
  }
  const redirectTo = typeof window !== 'undefined'
    ? new URL(window.location.pathname, window.location.origin).toString()
    : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    redirectTo ? { redirectTo } : undefined,
  );
  if (error) throw error;
}

export async function signOutUser() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getSupabaseClient() {
  return supabase;
}
