-- Criar bucket para fotos das células
INSERT INTO storage.buckets (id, name, public)
VALUES ('celula-photos', 'celula-photos', true);

-- Política para visualização pública das fotos
CREATE POLICY "Celula photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'celula-photos');

-- Política para upload de fotos (qualquer usuário autenticado ou não - ambiente controlado)
CREATE POLICY "Anyone can upload celula photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'celula-photos');

-- Política para deletar fotos
CREATE POLICY "Anyone can delete celula photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'celula-photos');

-- Adicionar campo de foto na tabela de relatórios semanais
ALTER TABLE public.weekly_reports
ADD COLUMN photo_url TEXT;