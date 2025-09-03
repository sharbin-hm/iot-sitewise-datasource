import { getDataSourceSrv } from '@grafana/runtime';

// ------------------
// Core request
// ------------------
async function callAIResource(resource: string, payload: Record<string, any>, dsName?: string) {
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

// ------------------
// Types
// ------------------
export type Provider = 'azure' | 'bedrock' | 'grafanaLLM' | 'generic';
export type Mode = 'sql' | 'chat';

// ------------------
// Helpers
// ------------------
function getResource(provider: Provider, mode: Mode): string {
  if (provider === 'generic' || provider === 'grafanaLLM') {
    return `ai-${mode}`; // maps both to core Grafana resources
  }
  return `${provider}-ai-${mode}`; // e.g. azure-ai-sql, bedrock-ai-chat
}

// ------------------
// Main entrypoint
// ------------------
export async function fetchAI(
  provider: Provider,
  mode: Mode,
  userQuery: string,
  secondArg: string, // schema (for sql) OR systemPrompt (for chat)
  dsName?: string
) {
  const resource = getResource(provider, mode);

  const payload =
    mode === 'sql' ? { prompt: userQuery, schema: secondArg } : { prompt: userQuery, systemPrompt: secondArg };

  return callAIResource(resource, payload, dsName);
}
