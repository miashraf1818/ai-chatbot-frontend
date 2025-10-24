import React, { useState } from 'react';
import './MessageActions.css';
import toast from 'react-hot-toast';


function MessageActions({ message, onCopy, onRegenerate, onFeedback }) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('✓ Copied to clipboard!', {
      duration: 2000,
      position: 'bottom-right',
    });
    if (onCopy) onCopy();
  };

  return (
    <div 
      className="message-actions-wrapper"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showActions && (
        <div className={`message-actions ${message.type === 'user' ? 'user-actions' : 'bot-actions'}`}>
          <button 
            className="action-btn copy-btn" 
            onClick={handleCopy}
            title="Copy message"
          >
            {copied ? '✓' : '📋'}
          </button>
          
          {message.type === 'bot' && (
            <>
              <button 
                className="action-btn thumbs-up-btn" 
                onClick={() => onFeedback && onFeedback('positive')}
                title="Helpful"
              >
                👍
              </button>
              <button 
                className="action-btn thumbs-down-btn" 
                onClick={() => onFeedback && onFeedback('negative')}
                title="Not helpful"
              >
                👎
              </button>
              <button 
                className="action-btn regenerate-btn" 
                onClick={() => onRegenerate && onRegenerate()}
                title="Regenerate response"
              >
                🔄
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageActions;
