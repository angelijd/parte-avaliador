const SYSTEM_PROMPT = `Você é um avaliador do framework PARTE para prompts de IA.

PARTE:
- P (Papel): quem a IA deve ser
- A (Ação): verbo claro do que fazer
- R (Resultado): contexto e o que o usuário espera
- T (Tom): como quer soar
- E (Exclusões): o que NÃO deve aparecer

Retorne APENAS JSON válido, sem markdown.

{
  "nota": "bom" | "mediano" | "melhorar",
  "partes": {
    "P": { "status": "presente" | "parcial" | "ausente", "encontrado": "trecho ou vazio" },
    "A": { "status": "presente" | "parcial" | "ausente", "encontrado": "trecho ou vazio" },
    "R": { "status": "presente" | "parcial" | "ausente", "encontrado": "trecho ou vazio" },
    "T": { "status": "presente" | "parcial" | "ausente", "encontrado": "trecho ou vazio" },
    "E": { "status": "presente" | "parcial" | "ausente", "encontrado": "trecho ou vazio" }
  },
  "melhorias": [
    { "parte": "P"|"A"|"R"|"T"|"E", "sugestao": "sugestão objetiva em 1-2 linhas" }
  ],
  "prompt_melhorado": "versão melhorada com as sugestões aplicadas"
}

Regras:
- "bom": 4-5 partes presentes
- "mediano": 2-3 partes (ou parciais)
- "melhorar": 0-1 parte presente
- Máximo 2 melhorias, priorizando ausentes mais impactantes
- Público leigo — seja direto e prático`;

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key não configurada" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const { prompt } = body;
  if (!prompt || prompt.trim().length < 10) {
    return new Response(JSON.stringify({ error: "Prompt muito curto" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Avalie: "${prompt}"` }],
    }),
  });

  const data = await response.json();
  const text = data.content?.find((b) => b.type === "text")?.text || "";

  let parsed;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return new Response(JSON.stringify({ error: "Falha ao processar resposta da IA" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  return new Response(JSON.stringify(parsed), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const config = { path: "/api/avaliar" };
