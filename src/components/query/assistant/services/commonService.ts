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
  switch (provider) {
    case 'azure':
    case 'bedrock':
      return `${provider}-ai-${mode}`;
    case 'generic':
    case 'grafanaLLM':
    default:
      return `ai-${mode}`; // maps to core Grafana resources
  }
}

// ------------------
// Main entrypoint
// ------------------
export async function fetchAI(
  provider: Provider,
  mode: Mode,
  userQuery: string,
  context: string, // schema (for SQL) OR systemPrompt (for Chat)
  dsName?: string
) {
  const resource = getResource(provider, mode);

  const payload = { prompt: userQuery, context: context };

  const res = await callAIResource(resource, payload, dsName);

  // enforce unified contract
  if (!res.success) {
    throw new Error(res.error || 'Unknown error');
  }

  return res.data; // always { mode, prompt, response }
}
