import { fetchSqlFromAzure } from './azureServiceBE';
import { fetchSqlFromBedrock } from './bedrockService';
import { fetchSqlWithGrafana } from './grafanaLlmService';

export type Provider = 'azure' | 'bedrock' | 'grafanaLLM';
export type ProviderFn = (...args: string[]) => Promise<string>;

export const providers: Record<Provider, ProviderFn> = {
  azure: fetchSqlFromAzure,
  bedrock: fetchSqlFromBedrock,
  grafanaLLM: fetchSqlWithGrafana,
};
