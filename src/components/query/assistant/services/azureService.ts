import { endpoint, deployment, apiKey, apiVersion } from './credentials';

export async function fetchSqlFromAzure(userQuery: string, systemPrompt: string): Promise<string> {
  if (!endpoint || !deployment || !apiVersion || !apiKey) {
    throw new Error('Azure OpenAI environment variables are missing.');
  }

  const response = await fetch(
    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        max_completion_tokens: 500,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure OpenAI request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() ?? 'No response';
}
