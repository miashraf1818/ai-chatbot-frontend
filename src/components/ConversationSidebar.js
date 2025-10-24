import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConversationSidebar.css';

const API_URL = 'http://localhost:8000/api/chatbot';

function ConversationSidebar({ isOpen, onToggle, currentConversationId, onSelectConversation, onNewChat }) {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/conversations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/search/?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
    }
  };

  const exportConversation = async (convId, format) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/conversations/${convId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const conv = response.data;
      let content = '';

      if (format === 'txt') {
        content = `${conv.title}\n${'='.repeat(50)}\n\n`;
        conv.messages.forEach(msg => {
          content += `[${msg.message_type.toUpperCase()}] ${new Date(msg.timestamp).toLocaleString()}\n`;
          content += `${msg.content}\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conv.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const displayList = isSearching ? searchResults : conversations;

  return (
    <div className={`conversation-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>💬 Conversations</h2>
        <button className="close-btn" onClick={onToggle}>✕</button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search conversations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setIsSearching(false);
            }}
          >
            ✕
          </button>
        )}
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        ➕ New Chat
      </button>

      <div className="conversations-list">
        {displayList.length === 0 ? (
          <div className="no-conversations">
            {isSearching ? '🔍 No results found' : '💭 No conversations yet'}
          </div>
        ) : (
          displayList.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => {
                onSelectConversation(conv.id);
                setSearchQuery('');
                setIsSearching(false);
              }}
            >
              <div className="conversation-header-row">
                <div className="conversation-title">{conv.title}</div>
                <button 
                  className="export-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportConversation(conv.id, 'txt');
                  }}
                  title="Export conversation"
                >
                  📥
                </button>
              </div>
              <div className="conversation-preview">
                {conv.matched_message || `${conv.message_count} messages`}
              </div>
              <div className="conversation-date">
                {new Date(conv.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationSidebar;
