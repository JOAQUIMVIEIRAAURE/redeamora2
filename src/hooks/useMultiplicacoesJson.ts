import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MultiplicacaoNode {
  id: string; // ID da célula
  parentId: string | null; // ID da célula mãe
  multiplicationDate?: string;
  notes?: string;
  children?: MultiplicacaoNode[];
}

const BUCKET_NAME = 'casais-photos'; // Usando bucket existente para garantir acesso
const FILE_PATH = 'system/multiplicacoes-tree.json';

export function useMultiplicacoesJson() {
  const [treeData, setTreeData] = useState<Record<string, MultiplicacaoNode>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTree = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(FILE_PATH);

      if (error) {
        if (error.message.includes('not found')) {
          // Arquivo ainda não existe, iniciar vazio
          setTreeData({});
          return;
        }
        throw error;
      }

      const text = await data.text();
      setTreeData(JSON.parse(text));
    } catch (error) {
      console.error('Erro ao carregar árvore:', error);
      // Não mostrar erro para usuário se for apenas "arquivo não existe"
    } finally {
      setIsLoading(false);
    }
  };

  const saveTree = async (newData: Record<string, MultiplicacaoNode>) => {
    try {
      const blob = new Blob([JSON.stringify(newData, null, 2)], { type: 'application/json' });
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(FILE_PATH, blob, { upsert: true });

      if (error) throw error;

      setTreeData(newData);
      toast({ title: 'Alterações salvas com sucesso!' });
      return true;
    } catch (error) {
      console.error('Erro ao salvar árvore:', error);
      toast({ 
        title: 'Erro ao salvar', 
        description: 'Verifique sua conexão e tente novamente.', 
        variant: 'destructive' 
      });
      return false;
    }
  };

  const addMultiplicacao = async (celulaId: string, parentId: string, date: string, notes?: string) => {
    const newTree = { ...treeData };
    
    // Atualiza ou cria o nó da célula filha
    newTree[celulaId] = {
      id: celulaId,
      parentId,
      multiplicationDate: date,
      notes
    };

    // Garante que o pai existe no registro (mesmo que sem pai definido)
    if (!newTree[parentId]) {
      newTree[parentId] = {
        id: parentId,
        parentId: null
      };
    }

    await saveTree(newTree);
  };

  const removeMultiplicacao = async (celulaId: string) => {
    const newTree = { ...treeData };
    if (newTree[celulaId]) {
      // Apenas remove o vínculo de pai, mantendo o nó
      newTree[celulaId] = {
        ...newTree[celulaId],
        parentId: null,
        multiplicationDate: undefined
      };
      await saveTree(newTree);
    }
  };

  // Carrega dados ao iniciar o hook (opcional, pode ser chamado manualmente no componente)
  if (Object.keys(treeData).length === 0 && isLoading) {
    loadTree();
  }

  return {
    treeData,
    isLoading,
    loadTree,
    addMultiplicacao,
    removeMultiplicacao
  };
}
