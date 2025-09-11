import React from 'react';
import { IconButton } from '@grafana/ui';

interface Props {
  content: string;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export const CopyButton: React.FC<Props> = ({ content, index, copiedIndex, onCopy }) => (
  <IconButton
    name={copiedIndex === index ? 'check' : 'copy'}
    tooltip={copiedIndex === index ? 'Copied!' : 'Copy'}
    aria-label="Copy message"
    onClick={() => onCopy(content, index)}
    style={{ position: 'absolute', top: 4, right: -28 }}
  />
);
