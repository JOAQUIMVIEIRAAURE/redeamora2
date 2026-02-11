

## Correção da Rolagem no Dashboard do Líder de Célula

### Problema

O `DialogContent` do modal de detalhes da célula tem `max-h-[90vh]` mas nenhuma propriedade de overflow, impedindo a rolagem quando o conteúdo excede a altura da tela.

### Solução

Ajuste mínimo em **um único arquivo**: `src/components/dashboard/CelulaDetailsDialog.tsx`

### Mudanças

1. **Linha 192** - Adicionar `overflow-y-auto` ao `DialogContent`:
   - De: `className="max-w-4xl max-h-[90vh]"`
   - Para: `className="max-w-4xl max-h-[90vh] overflow-y-auto"`

2. **Linha 232** - Remover `max-h-[60vh]` do `ScrollArea` da aba "Relatório" para evitar dupla restrição de altura. O scroll do DialogContent pai já cuida da rolagem:
   - De: `className="max-h-[60vh] pr-4"`
   - Para: `className="pr-4"`

Isso garante que:
- A barra de rolagem aparece apenas quando necessário
- Funciona em mobile e desktop
- Nenhuma alteração visual além do comportamento de scroll
- As outras abas (Histórico, Fotos, Membros, Casais) também se beneficiam da correção

### Detalhes Técnicos

O `DialogContent` do Radix UI usa `position: fixed` com `translate`, o que cria um contexto de formatação onde `overflow: hidden` é o padrão. Adicionar `overflow-y: auto` resolve sem afetar o posicionamento ou animações do dialog.
