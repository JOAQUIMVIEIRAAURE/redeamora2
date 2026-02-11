

## Plano de Implementacao - 3 Melhorias

Este plano cobre tres grandes melhorias: exibicao de lideres nos dashboards, nova aba DADOS, e ranking de membros.

---

### PARTE 1: Exibir Lideres Vinculados nos Dashboards

**Situacao atual:** Os hooks `useCelulas`, `useCoordenacoes` e `useRedes` ja buscam `leadership_couple` com nomes dos conjuges. Os dashboards de Coordenador e Lider de Rede ja exibem cards de lideranca. O dashboard de Lider de Celula nao mostra o casal lider no card da celula.

**Mudancas:**

1. **CellLeaderDashboard.tsx** - Adicionar nome do casal lider em cada card de celula (abaixo do nome da celula), usando os dados de `celula.leadership_couple` que ja vem do hook.

2. **CoordinatorDashboard.tsx** - Na tabela de celulas (aba Relatorios), adicionar coluna "Lideres" exibindo o casal lider de cada celula.

3. **AdminDashboard.tsx** - Na tabela por Rede, ja mostra dados agregados. Adicionar indicacao do lider de rede em cada linha (buscando de `redes` data).

**Nenhuma mudanca de banco de dados necessaria** - os dados ja existem e sao buscados.

---

### PARTE 2: Nova Aba "DADOS" (Central de Relatorios e Inteligencia)

**Arquitetura:** Criar uma nova pagina `/dados` como modulo separado, acessivel a todos os papeis (com filtros de escopo conforme hierarquia).

**Arquivos a criar:**

1. **src/pages/Dados.tsx** - Pagina principal com:
   - Header com filtros cascata: Periodo (obrigatorio), Rede, Coordenacao, Celula, Lider
   - Cards de KPIs: Total celulas ativas, Total membros, Total visitantes no periodo, Total relatorios enviados, Crescimento vs periodo anterior
   - Tabs com visoes por hierarquia:
     - **Por Rede**: tabela com rede, qtd coordenacoes, qtd celulas, membros, visitantes, relatorios enviados, % envio
     - **Por Coordenacao**: tabela com coordenacao, rede vinculada, mesmos indicadores
     - **Por Celula**: tabela com celula, coordenacao, casal lider, membros, visitantes, relatorios
     - **Por Lider**: tabela com casal lider, celula, frequencia de envio, media de visitantes
     - **Relatorios Detalhados**: lista filtravel de todos os relatorios com clique para detalhes
     - **Multiplicacoes**: registros de multiplicacao no periodo filtrado
     - **Ranking de Membros**: ranking por tempo de igreja + marcos espirituais
   - Botao de exportar CSV/Excel do conjunto filtrado

2. **src/hooks/useDadosReports.ts** - Hook customizado que:
   - Busca relatorios com joins completos (redes -> coordenacoes -> celulas -> weekly_reports)
   - Calcula agregacoes por escopo (rede/coordenacao/celula/lider)
   - Calcula % de envio (celulas que enviaram vs total de celulas)
   - Calcula crescimento comparativo

3. **src/hooks/useMemberRanking.ts** - Hook para ranking de membros:
   - Busca todos os membros ativos com `joined_church_at` e marcos espirituais
   - Calcula pontuacao: tempo de igreja (em meses) + bonus por marco completado (batismo, encontro, renovo, etc.)
   - Ordena por pontuacao decrescente
   - Permite filtro por celula/coordenacao

**Arquivos a modificar:**

4. **src/App.tsx** - Adicionar rota `/dados`
5. **src/components/layout/AppSidebar.tsx** - Adicionar item "Dados" no menu (icone Database), visivel para todos os papeis

**Nenhuma mudanca de banco de dados necessaria** - todos os dados ja existem nas tabelas atuais. As agregacoes serao feitas no lado do cliente usando os hooks existentes.

---

### PARTE 3: Ranking de Membros

**Integrado na aba DADOS (tab "Ranking")**

**Logica de pontuacao:**

- **Tempo de igreja**: baseado em `profiles.joined_church_at`. Cada mes completo = 1 ponto
- **Marcos espirituais** (7 marcos, cada um = 10 pontos):
  - Batismo (batismo)
  - Encontro com Deus (encontro_com_deus)
  - Renovo (renovo)
  - Encontro de Casais (encontro_de_casais)
  - Curso Lidere (curso_lidere)
  - Discipulado (is_discipulado)
  - Lider em Treinamento (is_lider_em_treinamento)
- **Pontuacao maxima de marcos**: 70 pontos
- **Exibicao**: Tabela com posicao, nome, celula, tempo de igreja, marcos completados (badges visuais), pontuacao total

**Filtros do ranking:**
- Por celula, coordenacao ou rede
- Ordenacao: por pontuacao total, por tempo, ou por marcos

---

### Resumo Tecnico

| Item | Arquivos Novos | Arquivos Editados | Migracao DB |
|------|---------------|-------------------|-------------|
| Lideres nos Dashboards | 0 | 3 | Nao |
| Aba DADOS | 3 | 2 | Nao |
| Ranking Membros | 1 (hook) | 0 (integrado na aba DADOS) | Nao |

**Total: 4 arquivos novos, 5 arquivos editados, 0 migracoes de banco.**

### Ordem de Implementacao

1. Atualizar dashboards com lideres visíveis (rapido, dados ja existem)
2. Criar hooks de dados/ranking
3. Criar pagina DADOS com todas as tabs
4. Adicionar rota e menu

