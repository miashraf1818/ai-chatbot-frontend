import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import './MessageContent.css';

// Import Prism themes
import 'prismjs/themes/prism-tomorrow.css';
// Import only common languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';

function MessageContent({ content, intent, confidence, type }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      Prism.highlightAll();
    } catch (error) {
      console.error('Prism highlighting error:', error);
    }
  }, [content]);

  const copyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // 🆕 ERROR BOUNDARY - If anything fails, show plain text
  try {
    return (
      <div className="message-content-wrapper">
        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                try {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  return !inline && match ? (
                    <div className="code-block">
                      <div className="code-header">
                        <span className="code-language">{match[1]}</span>
                        <button 
                          className="copy-btn-code"
                          onClick={() => copyCode(codeString)}
                        >
                          {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                      <pre className={`language-${match[1]}`}>
                        <code className={`language-${match[1]}`} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                } catch (error) {
                  console.error('Code block error:', error);
                  return <code className="inline-code">{children}</code>;
                }
              },
              p({ children }) {
                return <p className="markdown-paragraph">{children}</p>;
              },
              a({ href, children }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                    {children} 🔗
                  </a>
                );
              },
              ul({ children }) {
                return <ul className="markdown-list">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="markdown-ordered-list">{children}</ol>;
              },
              blockquote({ children }) {
                return <blockquote className="markdown-quote">{children}</blockquote>;
              },
            }}
          >
            {content || 'No content'}
          </ReactMarkdown>
        </div>

        {intent && confidence && (
          <div className="message-meta">
            <span className="intent-badge">{intent}</span>
            <span className="confidence-badge">{(confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // 🆕 FALLBACK - If ReactMarkdown crashes, show plain text
    console.error('❌ MessageContent crashed:', error);
    return (
      <div className="message-content-wrapper">
        <div className="markdown-content">
          <p className="markdown-paragraph">{content || 'Error displaying message'}</p>
        </div>
        {intent && confidence && (
          <div className="message-meta">
            <span className="intent-badge">{intent}</span>
            <span className="confidence-badge">{(confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    );
  }
}

export default MessageContent;
