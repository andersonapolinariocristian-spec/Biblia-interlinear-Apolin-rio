# Configuração da autenticação Supabase

## 1. Variáveis de ambiente

Configure estas variáveis no ambiente em que o Vite é compilado (local, hospedagem ou pipeline de CI):

- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: chave publicável/anon do projeto Supabase.

Copie `.env.example` para `.env.local` no desenvolvimento e substitua os valores de exemplo. Não envie `.env.local` ao Git. Nunca use a chave `service_role` em variáveis `VITE_*`, código React ou navegador. A chave publicável/anon pode aparecer no cliente; a proteção depende das políticas RLS.

Depois de adicionar a dependência, execute `npm install` e `npm run build`.

## 2. Banco de dados

No painel Supabase, abra SQL Editor e execute o arquivo:

`supabase/migrations/202610150001_secure_profiles.sql`

Ele cria perfis, políticas Row Level Security (RLS), tabela de permissões Pro e resgate de cupons no servidor. Não habilite políticas de escrita pública nas tabelas de cupons ou assinaturas.

## 3. Autenticação por e-mail

No painel Supabase:

1. Authentication → Providers → Email: habilite e-mail/senha.
2. Authentication → URL Configuration: defina o Site URL para a URL HTTPS real do aplicativo.
3. Adicione a URL de produção e a URL local de desenvolvimento à lista de Redirect URLs permitidas.
4. Configure o modelo de e-mail de confirmação e recuperação de senha.

O cadastro pode exigir confirmação de e-mail, dependendo da configuração do projeto. O link de recuperação retorna à aplicação e dispara o fluxo de nova senha.

## 4. Cupons promocionais

Os códigos antigos embutidos no frontend foram removidos. Para criar um cupom, insira o código e as regras na tabela `public.voucher_codes` usando uma sessão administrativa confiável no Supabase. Não exponha credenciais administrativas no cliente. Cada cupom permite uma quantidade limitada de resgates, e a função `redeem_voucher` grava a permissão no banco.

Exemplo administrativo (execute somente no SQL Editor, substituindo valores):
```sql
insert into public.voucher_codes (code, plan, enabled, max_redemptions)
values ('SEU-CODIGO-UNICO', 'annual', true, 1);
```

## 5. Limites importantes

- O fluxo de compra Google Play ainda não foi integrado com validação de recibos. Por segurança, o aplicativo não libera Pro nem simula uma compra até existir integração real.
- O frontend lê a permissão Pro da tabela `subscription_entitlements`; a autorização de qualquer endpoint que forneça conteúdo pago também precisa validar a sessão e a permissão no servidor.
- Os perfis teológicos são informações de exibição, não cargos administrativos.
- Após configurar as variáveis, aplique a migração e teste cadastro, confirmação de e-mail, login, recuperação de senha, logout e resgate de cupom antes de publicar.
