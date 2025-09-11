import React, { useState, useRef, useEffect } from 'react';
import { Alert, Button, IconButton, Input, Spinner, RadioButtonGroup } from '@grafana/ui';
import { buildSqlAssistantPrompt } from './utils/promptGenerator';
import { fetchAI, Provider, Mode } from './services';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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

  const chatRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
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
  };

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="ai-assistant" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header + controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8 }}>
        <h4 style={{ margin: 0 }}>AI Assistant</h4>
        <div style={{ display: 'flex', gap: 8 }}>
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
              { label: 'Grafana LLM', value: 'llm' },
              { label: 'Bedrock (Backend)', value: 'backend' },
            ]}
            value={provider}
            onChange={(v) => setProvider(v as Provider)}
          />
        </div>
      </div>

      {/* Chat Window */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderRadius: 8,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#007bff' : '#22252b',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 12,
              maxWidth: '70%',
              position: 'relative',
            }}
          >
            {m.content}
            {m.role === 'assistant' && (
              <IconButton
                name={copiedIndex === i ? 'check' : 'copy'}
                tooltip={copiedIndex === i ? 'Copied!' : 'Copy'}
                onClick={() => handleCopy(m.content, i)}
                style={{ position: 'absolute', top: 4, right: -28 }}
              />
            )}
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#888' }}>
            <Spinner inline={true} /> AI is typing...
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert title="Error" severity="error" style={{ margin: 8 }}>
          {error}
        </Alert>
      )}

      {/* Input Box */}
      <div style={{ display: 'flex', padding: 8, gap: 8 }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Type your question..."
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <Button onClick={handleSend} disabled={loading}>
          {loading ? <Spinner /> : 'Send'}
        </Button>
      </div>
    </div>
  );
}
