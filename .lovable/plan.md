

## Plano de Redesign UI/UX - Igreja do Amor / Rede Amoradores

O sistema ja usa Tailwind CSS + shadcn/ui (Radix). O redesign sera feito ajustando o Design System (CSS variables), refinando componentes existentes e aplicando melhorias consistentes em todas as telas prioritarias, sem quebrar funcionalidades.

---

### FASE 1: Design System (Fundacao Visual)

**Arquivo: `src/index.css`**

Atualizar as CSS variables para uma paleta mais sofisticada:
- Manter vermelho como primary, porem com tom mais elegante (menos saturado, mais quente)
- Adicionar variavel `--success` (verde suave para badges positivos)
- Adicionar variavel `--warning` (amarelo para alertas)
- Aumentar `--radius` para `0.75rem` (bordas mais suaves)
- Ajustar `--card` para um tom levemente diferente do background (profundidade sutil)
- Sombra padrao nos cards via classe utilitaria
- Sidebar com gradiente sutil ao inves de cor solida

Adicionar classes utilitarias globais:
- `.card-hover` - transicao suave de shadow + translate
- `.glass-card` - efeito glassmorphism sutil para cards de destaque
- Tipografia: garantir `font-smoothing` e line-height confortavel

**Arquivo: `tailwind.config.ts`**
- Adicionar cores `success` e `warning` no extend
- Adicionar keyframe `fade-in` para transicoes suaves

---

### FASE 2: Componentes Base (Reutilizaveis)

**Novo arquivo: `src/components/ui/stat-card.tsx`**

Card padronizado para KPIs usado em TODOS os dashboards. Props: `icon`, `label`, `value`, `subtitle`, `trend` (opcional). Layout:
- Icone em circulo com background accent suave
- Valor grande e bold
- Label em muted pequeno
- Trend badge opcional (verde/vermelho)

**Novo arquivo: `src/components/ui/page-header.tsx`**

Header de pagina padronizado. Props: `title`, `subtitle`, `icon`, `actions` (ReactNode). Layout:
- Titulo H1 com icone
- Subtitulo muted
- Acoes alinhadas a direita
- Separador visual sutil abaixo

**Novo arquivo: `src/components/ui/empty-state.tsx`**

Estado vazio padronizado. Props: `icon`, `title`, `description`, `action` (botao opcional). Layout:
- Icone grande, muted, centralizado
- Texto acolhedor
- CTA sugerido

**Novo arquivo: `src/components/ui/data-table.tsx`**

Wrapper para tabelas com: cabecalho sticky, hover nas linhas, bordas arredondadas no container, e estado vazio integrado.

---

### FASE 3: Tela Home (Selecao de Papel)

**Arquivo: `src/pages/Home.tsx`**

- Atualizar nome para "Igreja do Amor - Rede Amoradores"
- Substituir emoji por icone SVG de coracao estilizado
- Cards com efeito hover mais premium (shadow-lg + scale sutil)
- Gradiente de fundo mais refinado (de rose-50 para warm-gray)
- Botoes com estilo consistente (remover classes hardcoded de cor, usar variants)
- Tipografia: titulo maior (text-4xl), subtitulo com tracking mais aberto

---

### FASE 4: Layout e Sidebar

**Arquivo: `src/components/layout/AppSidebar.tsx`**

- Sidebar com background gradiente (em vez de cor solida)
- Logo area com separador mais elegante
- Items do menu com border-radius maior e padding mais generoso
- Estado ativo com indicador lateral (barra vertical colorida)
- Footer com design mais clean
- Melhorar tap targets no mobile (min 44px)

**Arquivo: `src/components/layout/AppLayout.tsx`**

- Header mais clean com shadow sutil ao scroll
- Melhorar espacamento do main content (padding responsivo)

---

### FASE 5: Dashboards (Telas Prioritarias)

**5.1 Dashboard Lider de Celula (`CellLeaderDashboard.tsx`)**
- Usar componente `PageHeader` no topo
- Cards de celula com design premium: borda lateral colorida, hover mais suave, informacoes do casal lider com Avatar pequeno
- Empty state com componente `EmptyState`
- Barra de busca com estilo mais refinado (background sutil, icone integrado)

**5.2 Dashboard Coordenador (`CoordinatorDashboard.tsx`)**
- Usar `PageHeader` e `StatCard` para KPIs
- Card de lideranca com layout horizontal mais elegante (Avatar maior, badge de role)
- Tabela de celulas usando `DataTable` wrapper
- Tabs com estilo mais clean (sem borda pesada)
- Melhorar espacamento entre secoes

**5.3 Dashboard Supervisor (`SupervisorDashboard.tsx`)**
- Usar `PageHeader` e selectors com design mais limpo
- Cards de selecao (Coordenacao/Supervisor) com icone no header
- Historico de supervisoes: cards com borda lateral de status (verde=realizada, vermelho=nao)
- Empty states padronizados
- Botao "Nova Supervisao" mais proeminente

**5.4 Dashboard Lider de Rede (`NetworkLeaderDashboard.tsx`)**
- Usar `PageHeader` e `StatCard`
- Card de lideranca com design premium
- Collapsible de coordenacoes com animacao mais suave
- Tabelas internas com design mais clean
- Tabs com icones mais discretos

**5.5 Dashboard Admin (`AdminDashboard.tsx`)**
- Usar `PageHeader` e `StatCard` para KPIs
- Grid de stats com layout 5 colunas mais equilibrado
- Tabela por Rede com design premium (hover, badges coloridos por faixa de %)

---

### FASE 6: Central de Dados (`Dados.tsx`)

- Usar `PageHeader` com titulo "Central de Dados" e icone
- Filtros em container com background card, bordas suaves, layout mais limpo
- KPI cards usando `StatCard`
- Tabs com design clean e responsivo
- Tabelas com `DataTable` wrapper
- Ranking: medalhas visuais (ouro/prata/bronze) nos 3 primeiros
- Badges de milestones com cores diferenciadas
- Melhorar espacamento e alinhamento geral

---

### FASE 7: Modal de Relatorio (`CelulaDetailsDialog.tsx`)

- Tabs com design mais limpo dentro do modal
- Formulario com blocos visuais separados (secao Presenca, secao Observacoes)
- Inputs com labels mais claras e spacing uniforme
- Botao "Enviar Relatorio" com destaque visual (primary, full-width, com icone)
- Manter fix de overflow-y-auto

---

### Resumo Tecnico

| Item | Arquivos Novos | Arquivos Editados |
|------|---------------|-------------------|
| Design System | 0 | 2 (index.css, tailwind.config.ts) |
| Componentes Base | 4 | 0 |
| Tela Home | 0 | 1 |
| Layout/Sidebar | 0 | 2 |
| Dashboards (5) | 0 | 5 |
| Central de Dados | 0 | 1 |
| Modal Relatorio | 0 | 1 |
| **Total** | **4 novos** | **12 editados** |

**Nenhuma migracao de banco de dados necessaria.**

### Principios aplicados em todas as mudancas

- Espacamento baseado em grid de 8px
- Transicoes suaves (150-250ms) em hovers e expansoes
- Skeleton loading onde aplicavel
- Contraste WCAG AA garantido
- Tap targets minimos de 44px no mobile
- Remocao de `src/App.css` (nao utilizado pelo sistema)

### Ordem de implementacao

1. Design System (CSS + Tailwind config)
2. Componentes base (StatCard, PageHeader, EmptyState, DataTable)
3. Layout e Sidebar
4. Home
5. Dashboards (todos)
6. Central de Dados
7. Modal de Relatorio

