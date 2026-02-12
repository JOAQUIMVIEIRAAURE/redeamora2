

## Plano de Redesign - Identidade Visual "Ano da Santidade 2026"

Transformacao completa do sistema para tema escuro premium com destaques em dourado, mantendo toda a estrutura funcional intacta.

---

### FASE 1: Design System (Paleta Escura + Dourado)

**Arquivo: `src/index.css`**

Substituir TODA a paleta de cores (`:root` e `.dark`) por uma unica paleta escura. O sistema nao tera mais modo claro -- sera exclusivamente escuro.

Cores principais (convertidas para HSL):
- `--background`: #0B0B0D → `240 12% 4%`
- `--foreground`: #F5F5F5 → `0 0% 96%`
- `--card`: #1B1E24 → `220 14% 12%`
- `--card-foreground`: #F5F5F5
- `--popover`: #14161B → `225 14% 10%`
- `--primary`: #D89A3C (dourado) → `37 65% 54%`
- `--primary-foreground`: #0B0B0D
- `--secondary`: #14161B
- `--secondary-foreground`: #B5B5B5 → `0 0% 71%`
- `--muted`: #14161B
- `--muted-foreground`: #B5B5B5
- `--accent`: dourado com baixa opacidade → `37 30% 16%`
- `--accent-foreground`: #D89A3C
- `--border`: `220 10% 18%`
- `--input`: `220 10% 18%`
- `--ring`: #D89A3C
- `--destructive`: vermelho discreto
- `--success`: verde esmeralda discreto
- `--warning`: dourado mais claro

Sidebar:
- `--sidebar-background`: `220 14% 8%`
- `--sidebar-foreground`: #F5F5F5
- `--sidebar-primary`: #D89A3C
- `--sidebar-accent`: `37 30% 14%`
- `--sidebar-border`: `220 10% 15%`

Remover bloco `.dark` (nao necessario, tudo e escuro).

Adicionar classes utilitarias:
- `.glow-gold` - box-shadow dourado sutil no hover
- `.glass-card` - atualizar para fundo escuro translucido com borda dourada/15%
- `.card-hover:hover` - adicionar glow dourado sutil
- `.gold-gradient` - gradiente de texto dourado para titulos de destaque

**Arquivo: `tailwind.config.ts`**

- Remover `darkMode: ["class"]` (nao aplicavel)
- Manter cores `success` e `warning` atualizadas
- Adicionar keyframe `glow-pulse` para efeito sutil em elementos destaque

---

### FASE 2: Componentes Base (Adaptar ao tema escuro)

**Arquivo: `src/components/ui/stat-card.tsx`**

- Background do icone: usar `bg-primary/10` (dourado translucido)
- Icone: `text-primary` (dourado)
- Valor: `text-foreground` (branco)
- Label: `text-muted-foreground` (cinza claro)
- Hover: adicionar glow dourado sutil via `card-hover`

**Arquivo: `src/components/ui/page-header.tsx`**

- Icone container: `bg-primary/10` com icone `text-primary` (dourado)
- Titulo: branco
- Subtitulo: `text-muted-foreground`

**Arquivo: `src/components/ui/empty-state.tsx`**

- Icone container: `bg-muted` (escuro)
- Borda: `border-dashed border-border`

**Arquivo: `src/components/ui/data-table.tsx`**

- Header da tabela: `bg-card` com texto muted
- Hover nas linhas: `hover:bg-primary/5` (glow dourado muito sutil)

**Arquivo: `src/components/ui/card.tsx`**

- Nenhuma mudanca estrutural necessaria (herda das CSS variables)

---

### FASE 3: Tela Home (Selecao de Papel)

**Arquivo: `src/pages/Home.tsx`**

- Background: gradiente escuro (`from-background via-card to-background`)
- Logo container: `bg-primary/15` com icone dourado
- Titulo "Igreja do Amor": branco com possivel detalhe dourado
- Subtitulo "Rede Amor a 2": `text-muted-foreground`
- Cards de role: fundo `bg-card`, borda `border-border`, hover com glow dourado
- Icone container no hover: `bg-primary text-primary-foreground` (dourado solido)
- Botoes: primary dourado, outline com borda dourada
- Rodape: texto muted

---

### FASE 4: Layout e Sidebar

**Arquivo: `src/components/layout/AppSidebar.tsx`**

- Sidebar com fundo escuro profundo (via CSS variable `--sidebar-background`)
- Logo area: icone dourado, texto branco
- Menu items ativos: borda lateral dourada (`border-l-2 border-primary`) + fundo `bg-primary/10`
- Items inativos: hover com `bg-sidebar-accent`
- Footer: avatar com borda dourada sutil
- Separadores: `border-sidebar-border`

**Arquivo: `src/components/layout/AppLayout.tsx`**

- Header/topbar: fundo escuro (`bg-background/90`) com blur
- Separador: `border-border/30`

---

### FASE 5: Dashboards

**Todos os dashboards** herdam automaticamente as novas cores via CSS variables. Ajustes especificos:

**5.1 CellLeaderDashboard.tsx**
- Cards de celula: `bg-card`, borda lateral `border-l-primary` (dourada)
- Casal lider: texto dourado sutil
- Busca: input escuro com borda

**5.2 CoordinatorDashboard.tsx**
- Card de lideranca: borda lateral dourada
- Badges de status: dourado para positivo, vermelho discreto para negativo
- Tabelas: header escuro, hover dourado sutil

**5.3 SupervisorDashboard.tsx**
- Cards de selecao: `bg-card`
- Historico: borda `border-l-success` (realizada) ou `border-l-destructive` (nao realizada)
- Badge "Realizada": usando cores success/destructive atualizadas

**5.4 NetworkLeaderDashboard.tsx**
- StatCards: icones dourados
- Collapsible: borda lateral dourada
- Tabs: estilo escuro com indicador dourado

**5.5 AdminDashboard.tsx**
- Grid de stats: icones dourados
- Tabela por Rede: badges com dourado/verde/vermelho por faixa
- Total geral: fundo `bg-primary/10`

---

### FASE 6: Central de Dados (Dados.tsx)

- Filtros: container `bg-card`
- KPI cards: icones dourados
- Tabs: indicador dourado
- Tabelas: header `bg-card`, hover `bg-primary/5`
- Ranking Top 3: medalhas com fundo dourado (`bg-primary/10`, `bg-primary/5`)
- Badges de milestones: cores diferenciadas em tons escuros
- Badges de % envio: dourado para bom, vermelho para baixo

---

### FASE 7: Modal de Relatorio (CelulaDetailsDialog.tsx)

- Dialog: fundo `bg-popover` (escuro)
- Tabs: indicador dourado
- Inputs: fundo escuro com borda `border-input`
- Botao enviar: dourado solido `bg-primary`

---

### Resumo Tecnico

| Item | Arquivos Editados |
|------|-------------------|
| Design System | 2 (index.css, tailwind.config.ts) |
| Componentes Base | 4 (stat-card, page-header, empty-state, data-table) |
| Tela Home | 1 |
| Layout/Sidebar | 2 |
| Dashboards (5) | 5 |
| Central de Dados | 1 |
| Modal Relatorio | 1 |
| **Total** | **16 arquivos editados** |

**0 arquivos novos. 0 migracoes de banco.**

A maior parte da transformacao acontece em `src/index.css` (paleta de cores). Os demais arquivos recebem ajustes pontuais de classes para garantir que icones, bordas e destaques usem a cor dourada (`text-primary`, `border-l-primary`, `bg-primary/10`).

### Ordem de implementacao

1. Design System (index.css + tailwind.config.ts) -- transforma tudo de uma vez
2. Componentes base (ajustes de classes para dourado)
3. Layout e Sidebar
4. Home
5. Dashboards
6. Central de Dados
7. Modal de Relatorio

