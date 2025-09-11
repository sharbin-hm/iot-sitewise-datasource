import React, { useState, useCallback } from 'react';
import { Alert, RadioButtonGroup } from '@grafana/ui';
import { buildSqlAssistantPrompt } from './utils/promptGenerator';
import { fetchAI } from './services';
import { Provider, Mode, Message } from './types';
import { providerOptions, modeOptions } from './constants';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';

export default function AIAssistant(props: any) {
  const {
    datasource: { name },
  } = props;

  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [provider, setProvider] = useState<Provider>('backend');
  const [mode, setMode] = useState<Mode>('sql');

  const handleSend = useCallback(async () => {
    if (!query.trim()) {
      return;
    }

    const newUserMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, newUserMessage]);
    setQuery('');
    setLoading(true);
    setError(null);

    try {
      const prompt = mode === 'sql' ? buildSqlAssistantPrompt() : 'You are a helpful assistant';
      const response = await fetchAI(provider, mode, query, prompt, name);

      const newAssistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [query, provider, mode, name]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }, []);

  return (
    <div className="ai-assistant" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
        <h4 style={{ margin: 0 }}>AI Assistant</h4>
        <div style={{ display: 'flex', gap: 8 }}>
          <RadioButtonGroup options={modeOptions} value={mode} onChange={(v) => setMode(v as Mode)} />
          <RadioButtonGroup options={providerOptions} value={provider} onChange={(v) => setProvider(v as Provider)} />
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow messages={messages} copiedIndex={copiedIndex} onCopy={handleCopy} loading={loading} />

      {/* Error */}
      {error && (
        <Alert title="Error" severity="error" style={{ margin: 8 }}>
          {error}
        </Alert>
      )}

      {/* Input */}
      <ChatInput query={query} setQuery={setQuery} onSend={handleSend} loading={loading} />
    </div>
  );
}
