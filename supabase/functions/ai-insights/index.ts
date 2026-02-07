import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ReportData {
  celula_name: string;
  coordenacao_name: string;
  reports: {
    meeting_date: string;
    members_present: number;
    leaders_in_training: number;
    discipleships: number;
    visitors: number;
    children: number;
  }[];
}

interface InsightRequest {
  type: 'growth_analysis' | 'executive_summary';
  data: ReportData[];
  period: string;
  context?: string; // e.g., "coordenacao", "rede", "all"
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, data, period, context }: InsightRequest = await req.json();

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum dado fornecido para análise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data summary for the AI
    const dataSummary = data.map(d => {
      const totalReports = d.reports.length;
      const avgMembers = totalReports > 0 
        ? Math.round(d.reports.reduce((sum, r) => sum + r.members_present, 0) / totalReports)
        : 0;
      const avgVisitors = totalReports > 0
        ? Math.round(d.reports.reduce((sum, r) => sum + r.visitors, 0) / totalReports)
        : 0;
      const avgDiscipleships = totalReports > 0
        ? Math.round(d.reports.reduce((sum, r) => sum + r.discipleships, 0) / totalReports)
        : 0;
      
      // Calculate growth trend
      let trend = 'estável';
      if (d.reports.length >= 2) {
        const firstHalf = d.reports.slice(0, Math.floor(d.reports.length / 2));
        const secondHalf = d.reports.slice(Math.floor(d.reports.length / 2));
        const avgFirst = firstHalf.reduce((s, r) => s + r.members_present, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((s, r) => s + r.members_present, 0) / secondHalf.length;
        if (avgSecond > avgFirst * 1.1) trend = 'crescimento';
        else if (avgSecond < avgFirst * 0.9) trend = 'queda';
      }

      return {
        celula: d.celula_name,
        coordenacao: d.coordenacao_name,
        totalRelatorios: totalReports,
        mediaMembrosPorReuniao: avgMembers,
        mediaVisitantes: avgVisitors,
        mediaDiscipulados: avgDiscipleships,
        tendencia: trend,
      };
    });

    // Build prompt based on type
    let systemPrompt: string;
    let userPrompt: string;

    if (type === 'growth_analysis') {
      systemPrompt = `Você é um consultor especialista em crescimento de células e grupos pequenos de igrejas. 
Analise os dados fornecidos e forneça insights acionáveis para melhorar o desempenho.
Responda sempre em português brasileiro.
Seja direto, prático e específico nas recomendações.
Use formatação markdown com títulos, listas e destaques.`;

      userPrompt = `Analise os seguintes dados de células no período de ${period}:

${JSON.stringify(dataSummary, null, 2)}

Por favor, forneça:
1. **Destaques Positivos**: Células com bom desempenho e o que estão fazendo certo
2. **Pontos de Atenção**: Células que precisam de suporte e por quê
3. **Recomendações Práticas**: 3-5 ações específicas para melhorar os resultados
4. **Indicadores a Monitorar**: Métricas chave para acompanhar nas próximas semanas`;

    } else {
      systemPrompt = `Você é um assistente executivo especializado em gerar resumos concisos para liderança de igrejas.
Crie resumos executivos claros e objetivos baseados nos dados fornecidos.
Responda sempre em português brasileiro.
Use formatação markdown com seções bem definidas.`;

      userPrompt = `Gere um resumo executivo dos seguintes dados de células no período de ${period}:

${JSON.stringify(dataSummary, null, 2)}

O resumo deve incluir:
1. **Visão Geral**: Números totais e médias consolidadas
2. **Performance**: Células de destaque e células que precisam de atenção
3. **Tendências**: Crescimento, estagnação ou declínio geral
4. **Próximos Passos**: 2-3 recomendações prioritárias para a liderança`;
    }

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA esgotados. Adicione créditos para continuar.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    return new Response(
      JSON.stringify({ 
        insight: content,
        type,
        period,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
