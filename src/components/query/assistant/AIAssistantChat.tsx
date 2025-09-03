import React, { useState } from 'react';
import { Alert, Button, IconButton, Input, Spinner, TextArea, RadioButtonGroup } from '@grafana/ui';
import { buildSqlAssistantPrompt } from './utils/promptGenerator';
import { fetchAI, Provider, Mode } from './services/commonService';

export default function AIAssistant(props: any) {
  const {
    datasource: { name },
  } = props;

  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [provider, setProvider] = useState<Provider>('azure');
  const [mode, setMode] = useState<Mode>('sql');

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult('');

      const prompt = mode === 'sql' ? buildSqlAssistantPrompt() : 'You are a helpful assistant';
      const response = await fetchAI(provider, mode, query, prompt, name);

      // unified backend response
      setResult(response?.response ?? response?.sql ?? JSON.stringify(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4 style={{ margin: 0 }}>AI Assistant</h4>
        <RadioButtonGroup
          options={[
            { label: 'SQL', value: 'sql' },
            { label: 'Chat', value: 'chat' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
        <RadioButtonGroup
          options={[
            { label: 'Azure OpenAI', value: 'azure' },
            { label: 'AWS Bedrock', value: 'bedrock' },
            { label: 'Grafana LLM', value: 'grafanaLLM' },
          ]}
          value={provider}
          onChange={(v) => setProvider(v as Provider)}
        />
      </div>

      {/* Query input + Generate button */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Ask me something..."
          style={{ flex: 1 }}
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? <Spinner /> : 'Generate'}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert title="Error" severity="error">
          {error}
        </Alert>
      )}

      {/* Result with copy button */}
      {result && (
        <div style={{ position: 'relative' }}>
          <TextArea value={result} rows={6} readOnly />
          <IconButton
            name={copied ? 'check' : 'copy'}
            tooltip={copied ? 'Copied!' : 'Copy to clipboard'}
            onClick={handleCopy}
            style={{ position: 'absolute', top: 4, right: 4 }}
          />
        </div>
      )}
    </div>
  );
}
