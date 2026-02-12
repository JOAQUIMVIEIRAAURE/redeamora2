## Plano: Aba Organograma + Seed de Dados

### Estado Atual do Banco

A estrutura de tabelas ja existe (redes, coordenacoes, supervisores, celulas, leadership_couples, profiles). Nao e necessario criar novas tabelas nem migracoes de schema.

Dados atuais:

- Rede "Rede Amor a 2" existe (sem lider vinculado)
- Coordenacoes existentes: ACELERE (Davidson), COORDECAO TESTE (Thomas & Dani), RECOMECO (Renato & Fabiana)
- Faltam: Ilimitada, Porcao Dobrada, Consolidacao
- Faltam profiles: Kleber, Kesia, Cassia, Paulo Vittor, Francielly, Arlam, Isabela

---

### FASE 1: Seed de Dados (SQL inserts)

**1.1 Criar profiles faltantes**

Inserir na tabela `profiles` (com user_id uuid gerado):

- Kleber, Kesia, Cassia, Paulo Vittor, Francielly

**1.2 Criar leadership_couples**

- Kleber & Kesia (lideres da rede)
- Davidson & Cassia (Aceleracao)
- Paulo Vittor & Francielly (Porcao Dobrada)
- Thomas & Dani (Consolidacao)

**1.3 Atualizar Rede**

- Vincular leadership_couple de Kleber & Kesia na rede "Rede Amor a 2"

**1.4 Criar/Atualizar Coordenacoes**

- Renomear "ACELERE" para "Aceleração" e vincular couple Davidson & Cassia
- Criar "Ilimitada" com couple Kleber & Kesia
- Criar "Porção Dobrada" com couple Paulo Vittor & Francielly
- Criar "Consolidação" com couple Arlam & Isabela
- Manter "RECOMECO" com couple Renato & Fabiana (ja existe)

---

### FASE 2: Pagina Organograma (Front-end)

**Novo arquivo: `src/pages/Organograma.tsx**`

Pagina com layout AppLayout contendo:

- PageHeader com titulo "Organograma" e icone GitBranch
- Filtro de busca por nome (coordenacao/supervisor/celula)
- Arvore hierarquica renderizada com CSS puro (sem biblioteca externa)

**Novo arquivo: `src/components/organograma/OrgTree.tsx**`

Componente principal da arvore:

- No raiz: Rede (Kleber & Kesia)
- Nivel 2: Coordenacoes (com casal coordenador)
- Nivel 3: Supervisores (quando existirem)
- Nivel 4: Celulas (com casal lider)

Cada no e um card escuro com:

- Titulo do nivel (badge dourado)
- Nome da unidade
- Nome do casal lider
- Contador de subordinados
- Borda lateral dourada

Conexoes entre nos: linhas SVG ou CSS borders

**Novo arquivo: `src/components/organograma/OrgNode.tsx**`

Card individual do no com:

- Layout compacto e premium
- Hover com glow dourado
- Expandir/colapsar filhos

**Novo arquivo: `src/hooks/useOrganograma.ts**`

Hook que busca todos os dados necessarios (redes, coordenacoes, supervisores, celulas) e monta a estrutura de arvore hierarquica.

**Responsividade:**

- Desktop: arvore horizontal com scroll
- Mobile: layout vertical tipo accordion (collapsible por nivel)

---

### FASE 3: Rota e Navegacao

**Arquivo: `src/App.tsx**`

- Adicionar rota `/organograma` com RoleProtectedRoute

**Arquivo: `src/components/layout/AppSidebar.tsx**`

- Adicionar item "Organograma" no menu principal (icone GitBranch)
- Visivel para todos os papeis

---

### FASE 4: Permissoes de Visibilidade

O organograma respeita as regras existentes:

- Admin e Lider de Rede: veem tudo
- Coordenador: ve apenas sua coordenacao e abaixo
- Supervisor: ve apenas sua supervisao e abaixo
- Lider de Celula: ve apenas sua celula

A filtragem sera feita no front-end com base no `selectedRole` do RoleContext (mesmo padrao do sistema atual).

---

### Resumo de Arquivos


| Arquivo                                  | Acao                         |
| ---------------------------------------- | ---------------------------- |
| `src/pages/Organograma.tsx`              | Novo                         |
| `src/components/organograma/OrgTree.tsx` | Novo                         |
| `src/components/organograma/OrgNode.tsx` | Novo                         |
| `src/hooks/useOrganograma.ts`            | Novo                         |
| `src/App.tsx`                            | Editar (adicionar rota)      |
| `src/components/layout/AppSidebar.tsx`   | Editar (adicionar menu item) |


**Seed:** Insercoes via ferramenta de dados (profiles, leadership_couples, coordenacoes, atualizacao da rede).

**0 migracoes de schema** (tabelas ja existem).