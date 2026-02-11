

## Plano de Implementacao - 3 Melhorias

### 1. Exportacao Excel Profissional (src/utils/exportReports.ts)

Reescrever a funcao `exportToExcel` em `src/utils/exportReports.ts` para gerar um arquivo multi-abas completo. A funcao recebera dados adicionais (redes, supervisores, membros, ranking) alem dos ja existentes.

**Novo parametro da funcao:**
A interface `ExportData` sera expandida para incluir: `redes`, `members`, `supervisores`, `ranking`, `byRede`, `byCoordenacao`, `byCelula`, `byLider` (agregacoes do hook `useDadosReports`).

**Abas do Excel:**

| Aba | Conteudo |
|-----|---------|
| RESUMO | KPIs consolidados, periodo, data geracao, totais por categoria, ranking de coordenacoes |
| POR REDE | Rede, Lider de Rede, Coordenacoes, Celulas, Membros, Visitantes, Relatorios, % Envio |
| POR COORDENACAO | Coordenacao, Rede, Coordenador (casal), Celulas, Membros, Visitantes, Relatorios, % Envio |
| POR CELULA | Celula, Coordenacao, Rede, Lider (casal), Membros, Visitantes, Relatorios |
| POR LIDER | Casal Lider, Celula, Coordenacao, Relatorios, Media Visitantes, Membros |
| RELATORIOS | Data, Celula, Coordenacao, Rede, Lideres, Membros Presentes, Lideres Treino, Discipulados, Visitantes, Criancas, Total, Observacoes |
| DADOS BRUTOS | Manter a aba atual com auto-filtro para tabelas dinamicas |

**Recursos do Excel:**
- Auto-filtro em todas as abas tabulares (cabecalho na linha 1)
- Larguras de coluna otimizadas
- Congelamento de cabecalho (`!freeze` via `ws['!freeze']` -- nota: xlsx nao suporta freeze nativamente, usaremos `!autofilter` que ja existe)

**Chamada atualizada em `Dados.tsx`:** O `handleExportCSV` passara todos os dados agregados para a nova funcao.

### 2. Permissoes da Aba DADOS

**Arquivo:** `src/components/layout/AppSidebar.tsx`

Ocultar o item "Dados" do menu para `supervisor` e `celula_leader`. Apenas `admin`, `rede_leader` e `coordenador` verao o item.

Logica: usar `useRole()` no sidebar para verificar se `isAdmin || isRedeLeader || isCoordenador` antes de incluir "Dados" nos items de navegacao.

**Arquivo:** `src/pages/Dados.tsx`

Adicionar verificacao de role no topo. Se o papel for `supervisor` ou `celula_leader`, redirecionar para `/dashboard`.

Nota sobre "filtros obrigatorios por role": Como o sistema usa selecao manual de papel (sem autenticacao real vinculada a escopos), a filtragem por rede/coordenacao do usuario nao e aplicavel automaticamente. A restricao sera feita pela ocultacao do menu e redirect na pagina. Se futuramente houver autenticacao com escopo, os filtros podem ser aplicados.

### 3. Casal Coordenador no Dashboard do Lider de Rede

**Arquivo:** `src/components/dashboard/NetworkLeaderDashboard.tsx`

No bloco onde renderiza os cards de coordenacao (linhas ~355-380), o `reportsByCoordenacao` agrupa por `coordId` mas nao inclui o `leadership_couple`. A solucao:

- Buscar o objeto `Coordenacao` correspondente ao `coordId` a partir de `coordenacoes` (que ja vem do hook `useCoordenacoes` e ja inclui `leadership_couple`).
- Adicionar uma linha abaixo do `CardTitle` com o nome do casal coordenador usando `getCoupleDisplayName`.

Mudanca minima: 1 import + ~3 linhas de codigo no card.

---

### Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/utils/exportReports.ts` | Reescrever com 6 abas profissionais |
| `src/pages/Dados.tsx` | Atualizar `handleExportCSV` + adicionar redirect por role |
| `src/components/layout/AppSidebar.tsx` | Condicionar "Dados" no menu por role |
| `src/components/dashboard/NetworkLeaderDashboard.tsx` | Adicionar casal coordenador nos cards |

Total: 4 arquivos editados, 0 arquivos novos, 0 migracoes de banco.

