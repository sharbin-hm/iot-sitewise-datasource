import { fetchSqlFromAzure } from './azure';
import { fetchSqlFromBedrock } from './bedrock';
import { fetchSqlWithGrafana } from './grafanallm';
import { callAIResource } from './backend';

// ------------------
// Types
// ------------------
export type Provider = 'azure' | 'bedrock' | 'backend' | 'llm';
export type Mode = 'sql' | 'chat';

// ------------------
// Main entrypoint
// ------------------
export async function fetchAI(
  provider: Provider,
  mode: Mode,
  userQuery: string,
  context: string, // schema (for SQL) OR systemPrompt (for Chat)
  dsName?: string
): Promise<string> {
  switch (provider) {
    case 'azure':
      if (mode === 'sql' || mode === 'chat') {
        return fetchSqlFromAzure(userQuery, context);
      }
      break;

    case 'bedrock':
      if (mode === 'sql' || mode === 'chat') {
        return fetchSqlFromBedrock(userQuery, context);
      }
      break;

    case 'llm':
      if (mode === 'sql' || mode === 'chat') {
        return fetchSqlWithGrafana(userQuery, context);
      }
      break;

    case 'backend': {
      const res = await callAIResource('ai', { prompt: userQuery, context }, dsName);
      if (!res.success) {
        throw new Error(res.error || 'Unknown backend error');
      }
      return res.data.response;
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  throw new Error(`Unsupported mode "${mode}" for provider "${provider}"`);
}
