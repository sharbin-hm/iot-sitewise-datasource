import React from 'react';
import { Button, Input, Spinner } from '@grafana/ui';

interface Props {
  query: string;
  setQuery: (val: string) => void;
  onSend: () => void;
  loading: boolean;
}

export const ChatInput: React.FC<Props> = ({ query, setQuery, onSend, loading }) => {
  return (
    <div style={{ display: 'flex', padding: 8, gap: 8 }}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        placeholder="Type your question..."
        style={{ flex: 1 }}
        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
      />
      <Button onClick={onSend} disabled={loading}>
        {loading ? <Spinner /> : 'Send'}
      </Button>
    </div>
  );
};
