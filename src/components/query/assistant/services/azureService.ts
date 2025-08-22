export async function fetchSqlFromAzure(userQuery: string, systemPrompt: string): Promise<string> {
  const endpoint = process.env.REACT_APP_AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.REACT_APP_AZURE_OPENAI_API_VERSION;
  const apiKey = process.env.REACT_APP_AZURE_OPENAI_KEY;

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
    throw new Error(`Azure OpenAI request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() ?? 'No response';
}
