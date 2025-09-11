import React, { useRef, useEffect } from 'react';
import { Spinner } from '@grafana/ui';
import { Message } from './types';
import { ChatMessage } from './ChatMessage';

interface Props {
  messages: Message[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  loading: boolean;
}

export const ChatWindow: React.FC<Props> = ({ messages, copiedIndex, onCopy, loading }) => {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div
      ref={chatRef}
      style={{
        overflowY: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderRadius: 8,
        maxHeight: '400px',
      }}
    >
      {messages.map((m, i) => (
        <ChatMessage key={i} message={m} index={i} copiedIndex={copiedIndex} onCopy={onCopy} />
      ))}
      {loading && (
        <div style={{ alignSelf: 'flex-start', color: '#888' }}>
          <Spinner inline={true} /> AI is typing...
        </div>
      )}
    </div>
  );
};
