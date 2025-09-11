import React from 'react';
import { IconButton } from '@grafana/ui';
import { Message } from './types';

interface Props {
  message: Message;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const ChatMessage: React.FC<Props> = ({ message, index, copiedIndex, onCopy }) => {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        background: isUser ? '#3d71d9' : '#22252b',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: 12,
        maxWidth: '70%',
        position: 'relative',
      }}
    >
      {message.content}
      {!isUser && (
        <IconButton
          name={copiedIndex === index ? 'check' : 'copy'}
          tooltip={copiedIndex === index ? 'Copied!' : 'Copy'}
          onClick={() => onCopy(message.content, index)}
          style={{ position: 'absolute', top: 4, right: -28 }}
        />
      )}
    </div>
  );
};
