import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import ConversationSidebar from './components/ConversationSidebar';
import StatsHeader from './components/StatsHeader';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MessageContent from './components/MessageContent';
import MessageActions from './components/MessageActions';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TimeDisplay from './components/TimeDisplay';
import toast, { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';  // 🆕 NEW


const API_URL = 'http://localhost:8000/api/chatbot';


function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('landing'); // 🆕 CHANGED: Start with landing
  const messagesEndRef = useRef(null);
  
  const { user, logout, isAuthenticated } = useAuth();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // 🆕 NEW: Auto-redirect if already logged in
  // Auto-redirect when authentication changes
useEffect(() => {
  if (isAuthenticated) {
    if (currentView !== 'chat' && currentView !== 'admin') {
      setCurrentView('chat');
    }
    setShowAuth(false);
  }
}, [isAuthenticated]);  // ✅ ONLY depend on isAuthenticated
// ✅ ADD currentView here
  


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearChat();
        toast.success('⌨️ Keyboard shortcut: Clear chat', {
          duration: 1500,
          position: 'bottom-right',
        });
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sidebarOpen]);


  const handleFeedback = async (messageId, feedbackType) => {
    if (!messageId) return;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://localhost:8000/api/analytics/feedback/', {
        message_id: messageId,
        feedback_type: feedbackType
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success(feedbackType === 'positive' ? '👍 Thanks for feedback!' : '👎 Feedback received', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast.error('Failed to save feedback', {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };


  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
  
    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Adding user message:', userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('📋 Messages after user:', newMessages);
      return newMessages;
    });
    
    setInputMessage('');
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem('access_token');
      const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };
  
      const response = await axios.post(`${API_URL}/chat/`, {
        message: inputMessage,
        conversation_id: conversationId
      }, { headers });
  
      console.log('✅ FULL RESPONSE:', response.data);  // ✅ INSIDE try block
  
      if (response.data.success) {
        if (!conversationId) {
          setConversationId(response.data.conversation_id);
        }
  
        const botMessage = {
          type: 'bot',
          content: response.data.bot_message.content,
          intent: response.data.bot_message.intent,
          confidence: response.data.bot_message.confidence,
          timestamp: response.data.bot_message.timestamp,
          id: response.data.bot_message.id
        };
  
        console.log('✅ BOT MESSAGE:', botMessage);
        console.log('📝 Adding bot message to state...');
        
        setMessages(prev => {
          const newMessages = [...prev, botMessage];
          console.log('📋 Messages after bot:', newMessages);
          console.log('📋 Total messages now:', newMessages.length);
          return newMessages;
        });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      const errorMessage = {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    toast.success('🧹 Chat cleared!', {
      duration: 2000,
      position: 'bottom-right',
    });
  };  


  const handleNewChat = () => {
    clearChat();
  };


  const handleSelectConversation = async (convId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/conversations/${convId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        setConversationId(convId);
        
        const loadedMessages = response.data.messages.map(msg => ({
          type: msg.message_type,
          content: msg.content,
          intent: msg.intent,
          confidence: msg.confidence,
          timestamp: msg.timestamp,
          id: msg.id
        }));
        
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };


  const handleLogout = () => {
    logout();
    clearChat();
    setSidebarOpen(false);
    setCurrentView('landing'); // 🆕 CHANGED: Go to landing on logout
  };


  // 🆕 NEW: Show Landing Page
  if (currentView === 'landing' && !isAuthenticated) {
    return (
      <div className="App">
        <div className="background-animation"></div>
        <LandingPage 
          onGetStarted={() => {
            setCurrentView('auth');
            setShowAuth(true);
            setAuthMode('register');
          }}
          onSignIn={() => {
            setCurrentView('auth');
            setShowAuth(true);
            setAuthMode('login');
          }}
        />
      </div>
    );
  }


  // Show Auth
  if (showAuth || currentView === 'auth') {
    return (
      <div className="App">
        <div className="background-animation"></div>
        {authMode === 'login' ? (
          <Login
            onSwitchToRegister={() => setAuthMode('register')}
            onSuccess={() => {
              setShowAuth(false);
              setCurrentView('chat');
              setAuthMode('login');
            }}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setAuthMode('login')}
            onSuccess={() => {
              setShowAuth(false);
              setCurrentView('chat');
              setAuthMode('login');
            }}
          />
        )}
      </div>
    );
  }


  // Show Admin Dashboard
  if (currentView === 'admin') {
    return (
      <div className="App">
        <div className="background-animation"></div>
        <Toaster />
        <AdminDashboard />
        <button 
          className="back-to-chat-btn"
          onClick={() => setCurrentView('chat')}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          ← Back to Chat
        </button>
      </div>
    );
  }


  // CHAT VIEW
  return (
    <div className="App">
      <div className="background-animation"></div>
      <Toaster />
      <ConversationSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />

      <div className="chat-container">
        <div className="chat-header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              ☰
            </button>
            <h1>AI Chatbot</h1>
            {user && <span className="user-badge">Hi, {user.first_name || user.username}!</span>}
          </div>
          <div className="header-right">
            {user && user.is_staff && (
              <button 
                className="admin-btn" 
                onClick={() => setCurrentView('admin')}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginRight: '12px'
                }}
              >
                🔧 Admin
              </button>
            )}
            <button className="clear-btn" onClick={clearChat}>Clear Chat</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <StatsHeader />
        <AnalyticsDashboard />

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-hero">
                <div className="welcome-icon">🤖</div>
                <h2 className="welcome-title">
                  Hi {user?.first_name || user?.username || 'there'}! 👋
                </h2>
                <p className="welcome-subtitle">
                  I'm your AI assistant powered by Google Gemini. How can I help you today?
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">💡</div>
                  <h3>Smart Answers</h3>
                  <p>Get instant, intelligent responses to your questions</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎓</div>
                  <h3>Learn & Grow</h3>
                  <p>Educational content and explanations tailored for you</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🚀</div>
                  <h3>24/7 Available</h3>
                  <p>Always here to help, anytime you need assistance</p>
                </div>
              </div>

              <div className="suggestions-section">
                <p className="suggestions-title">✨ Try asking me:</p>
                <div className="suggestions">
                  <button className="suggestion-btn" onClick={() => setInputMessage("Explain quantum computing")}>
                    <span className="suggestion-icon">🔬</span>
                    <span>Explain quantum computing</span>
                  </button>
                  <button className="suggestion-btn" onClick={() => setInputMessage("Write a Python function")}>
                    <span className="suggestion-icon">💻</span>
                    <span>Write a Python function</span>
                  </button>
                  <button className="suggestion-btn" onClick={() => setInputMessage("Tell me a joke")}>
                    <span className="suggestion-icon">😄</span>
                    <span>Tell me a joke</span>
                  </button>
                  <button className="suggestion-btn" onClick={() => setInputMessage("Help me learn React")}>
                    <span className="suggestion-icon">⚛️</span>
                    <span>Help me learn React</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}-message`}>
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <MessageActions
                  message={message}
                  onCopy={() => console.log('Copied:', message.content)}
                  onRegenerate={() => console.log('Regenerate:', index)}
                  onFeedback={(type) => handleFeedback(message.id, type)}
                />
                <TimeDisplay timestamp={message.timestamp} />
                <MessageContent
                  content={message.content}
                  intent={message.intent}
                  confidence={message.confidence}
                  type={message.type}
                />
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="loading-text">AI is thinking...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="input-container" onSubmit={sendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}


function App() {
  return (
    <GoogleOAuthProvider clientId="89771009227-e4ca190m73gj3nkb4qboeqovauno5koi.apps.googleusercontent.com">
      <AuthProvider>
        <ChatApp />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
