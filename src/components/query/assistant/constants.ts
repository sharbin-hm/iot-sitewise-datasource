import { Provider, Mode } from './types';

export const providerOptions: Array<{ label: string; value: Provider }> = [
  { label: 'Grafana LLM', value: 'llm' },
  { label: 'Bedrock (Backend)', value: 'backend' },
];

export const modeOptions: Array<{ label: string; value: Mode }> = [
  { label: 'SQL', value: 'sql' },
  { label: 'Chat', value: 'chat' },
];
