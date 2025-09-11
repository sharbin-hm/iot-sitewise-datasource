import React from 'react';
import { Message } from './types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CopyButton } from './CopyButton';

interface Props {
  message: Message;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const ChatMessage: React.FC<Props> = ({ message, index, copiedIndex, onCopy }) => {
  const isUser = message.role === 'user';

  return (
    <div style={styles.container(isUser)}>
      <MarkdownRenderer content={message.content} />
      {!isUser && <CopyButton content={message.content} index={index} copiedIndex={copiedIndex} onCopy={onCopy} />}
    </div>
  );
};

export const styles = {
  container: (isUser: boolean): React.CSSProperties => ({
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    background: isUser ? 'var(--chat-bg-user, #3d71d9)' : 'var(--chat-bg-assistant, #22252b)',
    color: 'var(--chat-text, #fff)',
    padding: '12px',
    borderRadius: 12,
    maxWidth: '70%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),
};
