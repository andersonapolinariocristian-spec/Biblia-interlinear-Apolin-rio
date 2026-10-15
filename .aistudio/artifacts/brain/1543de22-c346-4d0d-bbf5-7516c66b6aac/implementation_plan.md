# Tradução Exegética dos 66 Livros da Bíblia & Painel de Auditoria Canônica

Este plano detalha a reformulação completa do sistema léxico e morfológico do aplicativo, garantindo que todas as palavras, lemas e análises morfológicas dos 66 livros bíblicos (do Gênesis ao Apocalipse) sejam exibidos em português culto com sentido teológico exegético real, sem repetições genéricas ou textos residuais em inglês, além de disponibilizar um painel interativo de auditoria canônica.

---

## User Review & Decisões Confirmadas

> [!IMPORTANT]
> As decisões abaixo foram confirmadas pelo usuário na etapa de alinhamento e regem toda a arquitetura:

- **Sentido das Palavras e Lema**: Apresentação exegética completa em português, incluindo forma lexical base, raiz hebraica/grega e sentido teológico contextualizado no cânon sagrado, eliminando qualquer texto residual em inglês.
- **Visualização da Morfologia**: Painel de decodificação gramatical aberto por padrão no modal léxico, com explicações didáticas em português para cada classe morfológica (casos, tempos verbais, modos, vozes, gênero e número).
- **Ferramenta de Auditoria Canônica**: Inclusão de um painel interativo de auditoria no aplicativo para inspecionar e comprovar em tempo real a cobertura e integridade linguística dos 66 livros bíblicos.

---

## 1. Visão Geral & Conceito Central

- **O que faz**: Transforma o aplicativo em uma plataforma de estudo bíblico interlinear 100% em português. Ao clicar em qualquer vocábulo do Antigo Testamento (Hebraico) ou Novo Testamento (Grego), o leitor recebe o significado exegético real daquela palavra específica, sua raiz etimológica, aplicação teológica e análise gramatical detalhada sem termos técnicos herméticos em inglês.
- **Público-alvo**: Estudantes da Bíblia, pastores, teólogos, seminaristas e membros leigos que buscam profundidade textual nas línguas originais sem barreiras de idioma.
- **Valor Principal**: Eliminação de fallbacks padronizados repetitivos ("Representa uma palavra fundamental...") e remoção de definições em inglês (como em Apocalipse e cartas paulinas), substituindo-os por um dicionário exegético contextual e gramatical nativo em português.

---

## 2. Experiência do Usuário & Design Visual

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CABECALHO DO APLICATIVO                         │
│  [Logo / Brasão]  Bíblia Interlinear  [Auditoria dos 66 Livros] [Menu] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
    ┌───────────────────────────┐         ┌──────────────────────────────┐
    │    MODAL LÉXICO-EXEGÉTICO │         │ PAINEL DE AUDITORIA CANÔNICA │
    │ ───────────────────────── │         │ ──────────────────────────── │
    │ • Vocábulo Original & Áudio│         │ • 66 Livros Validados (VT/NT)│
    │ • Sentido no Versículo    │         │ • Indicador de Português:100%│
    │ • Lema & Raiz Exegética   │         │ • Testador por Livro / Cap.  │
    │ • Morfologia Didática     │         │ • Tabela de Amostragem Léxica│
    │   (Aberta por Padrão)     │         │ • Relatório de Conformidade  │
    │ • Significado Teológico   │         └──────────────────────────────┘
    └───────────────────────────┘
```

### A. Modal de Análise Léxica (`WordLexiconModal`)
- **Abertura Imediata da Morfologia**: A seção de decodificação gramatical agora é exibida por padrão com as tags em português (Ex.: *Verbo Aoristo Ativo Indicativo, 3ª Pessoa Singular*), com cada código Robinson/Gramcord acompanhado de um card explicativo.
- **Tradução Exegética do Lema**: Exibição da forma lematizada com significado detalhado, campo semântico bíblico e distinção exegética (ex.: *ἀποκάλυψις* = revelação divina de mistérios antes ocultos; *δέω* = necessidade divina irrevogável nos desígnios escatológicos; *ποιέω* = agir criador e soberano).
- **Adequação Tipográfica e Cores**: Tipografia serifada clássica para os textos sagrados, paleta quente de pergaminho (`#FAF6ED`, `#F4EFE2`, ouro envelhecido `#C9A227` e azul marinho régio `#0C1B2A`), sem tags ou pílulas genéricas.

### B. Painel de Auditoria Canônica dos 66 Livros (`AuditModal`)
- **Card Resumo de Conformidade**:
  - 39 Livros do Antigo Testamento (Hebraico/Aramaico): Integridade de lemas e morfologia massorética.
  - 27 Livros do Novo Testamento (Grego Koiné): Integridade léxica Robinson/Strong em português.
  - 0% de ocorrências residuais em inglês.
- **Navegador e Inspetor Rápido**: Permite escolher qualquer um dos 66 livros (ex.: Apocalipse, Gênesis, Isaías, Romanos) e inspecionar imediatamente uma amostragem de palavras e versículos para validação instantânea pelo usuário.

---

## 3. Decisões de Produto & Arquitetura Técnica

### Decisão 1: Expansão do Motor Léxico e Fim dos Fallbacks Repetitivos
- **Abordagem**: Criar um motor léxico português robusto em `src/utils/greekLexiconPortuguese.ts` e `src/data/lexiconDictionary.ts` com cobertura exegética extensiva para o vocabulário hebraico e grego dos 66 livros. Para palavras sem verbete extenso individual, gerar síntese etimológica dinâmica baseada no lema, classe gramatical e tradução do versículo, eliminando textos genéricos repetitivos.
- **Por que**: Cada vocábulo da Escritura possui nuances únicas; um texto estático genérico empobrece a exegese e confunde o leitor.

### Decisão 2: Morfologia Expandida por Padrão
- **Abordagem**: Configurar `showMorphologyExplainer` como ativo por padrão no modal, traduzindo todas as siglas morfológicas para descrições teológicas claras (Ex.: Caso Genitivo = posse, procedência ou relacionamento de subordinação sagrada).
- **Por que**: Atende diretamente à resposta do usuário, proporcionando valor pedagógico imediato a cada clique.

### Decisão 3: Painel de Auditoria Integrado
- **Abordagem**: Implementar um componente `CanonicalAuditModal` acessível diretamente pelo cabeçalho superior e menu lateral. A ferramenta realiza uma varredura em tempo real nos dados dos 66 livros do diretório `src/data/bible/*.json`, gerando estatísticas de cobertura, ausência de termos em inglês e garantia de completude.

---

## 4. Estratégia de Verificação

1. **Auditoria de Apocalipse (REV.json)**:
   - Inspecionar capítulos 1 a 22 de Apocalipse no aplicativo.
   - Clicar em palavras-chave (como *ἀποκάλυψις*, *ἔδωκεν*, *δεῖ*, *ἐσήμανεν*, *μαρτυρίαν*, *νεκρῶν*, *βασιλέων*) e verificar que todos os lemas, sentidos e morfologias estão 100% em português culto.
2. **Auditoria dos Demais Livros do Cânon (VT e NT)**:
   - Testar Gênesis 1 (Hebraico), Salmos 23, Isaías 53, Mateus 1, João 1 e Romanos 8.
   - Confirmar que nenhuma palavra exibe a frase genérica repetitiva anterior.
3. **Validação do Painel de Auditoria**:
   - Abrir o Painel de Auditoria na interface e rodar o diagnóstico completo dos 66 livros bíblicos.
4. **Compilação**:
   - Executar `compile_applet` para assegurar que não há quebras de tipagem TypeScript ou erros de build.
