import { getDataSourceSrv } from '@grafana/runtime';

async function callAIResource(resource: 'ai-chat' | 'ai-sql', payload: Record<string, any>, dsName?: string) {
  let ds;
  try {
    ds = await getDataSourceSrv().get(dsName);
  } catch (err) {
    throw new Error(`Datasource not found: ${dsName} — ${err}`);
  }

  let response: Response;
  try {
    response = await fetch(`/api/datasources/${ds.id}/resources/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(`Network error: ${err}`);
  }

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }
}

// Convenience wrappers
export async function fetchSqlFromAzure(userQuery: string, systemPrompt: string, dsName?: string) {
  return callAIResource('ai-chat', { prompt: userQuery, systemPrompt }, dsName);
}

export async function fetchAISQL(userQuery: string, schema: string, dsName?: string) {
  return callAIResource('ai-sql', { prompt: userQuery, schema }, dsName);
}
