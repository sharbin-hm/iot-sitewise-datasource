import { fetchSqlFromAzure } from './azureService';
import { fetchSqlFromBedrock } from './bedrockService';
import { fetchSqlWithGrafana } from './grafanaLlmService';

export type Provider = 'azure' | 'bedrock' | 'grafanaLLM';
export type ProviderFn = (q: string, p: string) => Promise<string>;

export const providers: Record<Provider, ProviderFn> = {
  azure: fetchSqlFromAzure,
  bedrock: fetchSqlFromBedrock,
  grafanaLLM: fetchSqlWithGrafana,
};
