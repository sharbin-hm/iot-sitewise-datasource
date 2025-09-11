import React, { useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

// Inject CSS once per page
const useChatMarkdownStyles = () => {
  useEffect(() => {
    if (document.getElementById('chat-markdown-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'chat-markdown-styles';
    style.innerHTML = `
      .chat-code-block {
        background: #1e1e1e;
        padding: 8px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 0.9em;
        margin: 0;
      }
      .chat-code-inline {
        background: rgba(255, 255, 255, 0.15);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
      }
      .chat-link {
        color: #4ea1ff;
        text-decoration: underline;
      }
      p {
        margin: 0;
      }
      ul, ol {
        margin: 4px 0 4px 20px;
        padding-left: 20px;
        word-break: break-word;
        line-height: 1.4;
      }
      li {
        margin-bottom: 2px;
      }
    `;
    document.head.appendChild(style);
  }, []);
};

// Markdown renderer overrides
const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isBlock = Boolean(className);
    return isBlock ? (
      <pre className="chat-code-block">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="chat-code-inline" {...props}>
        {children}
      </code>
    );
  },
  a: ({ children, ...props }) => (
    <a {...props} className="chat-link" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  useChatMarkdownStyles();
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
};
