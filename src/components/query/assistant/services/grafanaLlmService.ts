import { openai } from '@grafana/llm';

export async function fetchSqlWithGrafana(userQuery: string, systemPrompt: string): Promise<string> {
  const enabled = await openai.enabled();
  if (!enabled) {
    throw new Error('Grafana LLM provider is not enabled in the Grafana LLM App settings.');
  }

  const result = await openai.chatCompletions({
    // model: 'base', // optional, defaults to "base" in Azure/OpenAI settings
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ],
    max_tokens: 500,
    temperature: 0,
  });

  return result?.choices?.[0]?.message?.content?.trim() ?? 'No response';
}
