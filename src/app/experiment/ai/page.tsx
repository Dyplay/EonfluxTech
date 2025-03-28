'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiRefreshCw, FiTrash2, FiChevronRight, FiPlus, FiMessageSquare, FiMenu, FiX, FiEdit2, FiCopy, FiCheck, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import ReactMarkdown from 'react-markdown';
import copy from 'copy-to-clipboard';
import Image from 'next/image';
import 'prismjs/themes/prism-tomorrow.css'; // Import a Prism theme for code highlighting
import CodeHighlighter, { highlightCode } from '@/components/CodeHighlighter';

// Add a language color map for visual indicators
const languageColors: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#007acc',
  python: '#3776ab',
  java: '#b07219',
  csharp: '#178600',
  cpp: '#f34b7d',
  php: '#4F5D95',
  ruby: '#CC342D',
  go: '#00ADD8',
  rust: '#DEA584',
  html: '#e34c26',
  css: '#563d7c',
  bash: '#4EAA25',
  json: '#292929',
  swift: '#ffac45',
  kotlin: '#A97BFF',
  dart: '#00B4AB',
  sql: '#e38c00',
  default: '#607d8b'
};

// Enhanced code block component with copy functionality
const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    copy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Get language color, default if not found
  const langColor = languageColors[language.toLowerCase()] || languageColors.default;
  
  return (
    <div className="code-block-wrapper my-3 rounded-md overflow-hidden border border-gray-700">
      <div className="code-header flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: langColor }}
          />
          <span className="text-xs font-mono">{language}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="p-1 hover:bg-gray-700 rounded-md transition-colors"
          title="Copy code"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      </div>
      <pre className={`language-${language} p-4 bg-gray-900 overflow-auto text-sm whitespace-pre-wrap`}>
        <code className={`language-${language}`}>
          {value}
        </code>
      </pre>
    </div>
  );
};

// Simple function to format message content with code highlighting
const formatMessage = (content: string) => {
  return (
    <div className="message-content">
      <ReactMarkdown
        components={{
          code: ({className, children}) => {
            // Check if it's a code block (surrounded by ```)
            const match = /language-(\w+)/.exec(className || '');
            const isCodeBlock = match && match[1];
            
            if (isCodeBlock) {
              // Convert children to string and clean up
              const codeString = String(children).replace(/\n$/, '');
              
              return (
                <CodeBlock 
                  language={match[1]} 
                  value={codeString}
                />
              );
            }
            
            // Inline code
            return (
              <code className="px-1 py-0.5 rounded bg-gray-800 text-gray-200 text-sm font-mono">
                {children}
              </code>
            );
          },
          p: ({children}) => <p className="mb-2">{children}</p>,
          ul: ({children}) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
          li: ({children}) => <li className="mb-1">{children}</li>,
          h1: ({children}) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
          h3: ({children}) => <h3 className="text-md font-bold mb-2">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date | string;
}

interface Chat {
  $id: string;
  title: string;
  userId: string;
  messages: string; // JSON stringified messages
  lastUpdated: string;
  createdAt: string;
}

// Add a responsive hook to detect mobile views
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return isMobile;
};

export default function AIExperiment() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add a new state to track scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/login?returnTo=${returnTo}`);
    }
  }, [loading, user, router]);

  // Fetch user's chats
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        setIsLoadingChats(true);
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'ai',
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('lastUpdated')
          ]
        );
        
        setChats(response.documents as unknown as Chat[]);
        
        // If there are chats, set the active chat to the most recent one
        if (response.documents.length > 0) {
          const mostRecentChat = response.documents[0];
          setActiveChat(mostRecentChat.$id);
          loadChat(mostRecentChat as unknown as Chat);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchChats();
  }, [user]);

  // Load a specific chat
  const loadChat = (chat: Chat) => {
    try {
      console.log('Loading chat:', chat.$id, 'with messages type:', typeof chat.messages, 'content:', chat.messages);
      
      // Handle empty message array
      if (!chat.messages || (typeof chat.messages === 'string' && (chat.messages === "[]" || chat.messages === ""))) {
        console.log('Empty message array found, initializing with empty array');
        setMessages([]);
        setActiveChat(chat.$id);
        return;
      }
      
      let messagesArray;
      // Handle both string and array formats for backward compatibility
      if (typeof chat.messages === 'string') {
        try {
          console.log('Parsing messages from string:', chat.messages);
          messagesArray = JSON.parse(chat.messages);
          console.log('Parsed messages:', messagesArray);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          messagesArray = [];
        }
      } else if (Array.isArray(chat.messages)) {
        messagesArray = chat.messages;
      } else {
        console.error('Messages is neither string nor array:', chat.messages);
        messagesArray = [];
      }
      
      // Ensure messagesArray is an array and has the correct format
      if (Array.isArray(messagesArray)) {
        // Make sure each message has the required properties
        const validMessages = messagesArray.map(msg => ({
          id: msg.id || Date.now().toString(),
          content: msg.content || "",
          role: msg.role || "assistant",
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        
        console.log('Loaded valid messages:', validMessages.length);
        setMessages(validMessages);
        setActiveChat(chat.$id);
        
        // Scroll to bottom after loading messages
        setTimeout(scrollToBottom, 100);
      } else {
        console.error('Parsed messages is not an array:', messagesArray);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error in loadChat function:', error);
      setMessages([]);
    }
  };

  // Create a new chat
  const createNewChat = async () => {
    if (!user) return;

    try {
      setIsLoadingChats(true);
      
      // Create a new chat document
      const newChat = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'ai',
        ID.unique(),
        {
          userId: user.$id,
          title: 'New Conversation',
          messages: JSON.stringify([]), // Empty array as JSON string
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      );
      
      // Update the chats list
      setChats(prevChats => [newChat as unknown as Chat, ...prevChats]);
      
      // Set the new chat as active
      setActiveChat(newChat.$id);
      setMessages([]);
      
      console.log('Created new chat with ID:', newChat.$id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'ai',
        chatId
      );
      
      // Update the chats list
      setChats(prevChats => prevChats.filter(chat => chat.$id !== chatId));
      
      // If the deleted chat was active, set the most recent chat as active or clear messages
      if (activeChat === chatId) {
        const remainingChats = chats.filter(chat => chat.$id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChat(remainingChats[0].$id);
          loadChat(remainingChats[0]);
        } else {
          setActiveChat(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Update chat title
  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'ai',
        chatId,
        {
          title
        }
      );
      
      // Update the chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.$id === chatId ? { ...chat, title } : chat
        )
      );
      
      setEditingTitle(null);
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  // Save messages to the active chat
  const saveMessages = async (newMessages: Message[]) => {
    if (!activeChat || !user) return;

    try {
      // Prepare messages for storage - making sure timestamps are strings
      const serializableMessages = newMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
      }));
      
      console.log('Saving messages to chat:', activeChat, 'Count:', serializableMessages.length);
      console.log('Message content being saved:', JSON.stringify(serializableMessages));
      
      try {
        const result = await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'ai',
          activeChat,
          {
            messages: JSON.stringify(serializableMessages), // Store as a JSON string
            lastUpdated: new Date().toISOString()
          }
        );
        console.log('Messages saved successfully:', result);
        
        // Double-check saved data
        const updatedChat = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'ai',
          activeChat
        );
        console.log('Verified saved chat data:', updatedChat);
      } catch (saveError) {
        console.error('Error updating document:', saveError);
        throw saveError;
      }
      
      // Update the chats list for proper ordering
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.$id === activeChat) {
            return { 
              ...chat, 
              messages: JSON.stringify(serializableMessages), // Update with the JSON string
              lastUpdated: new Date().toISOString() 
            };
          }
          return chat;
        });
        
        // Sort by lastUpdated
        return updatedChats.sort((a, b) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Only scroll if there are messages
    if (messages.length > 0) {
    scrollToBottom();
      
      // Highlight code blocks after messages update
      highlightCode();
    }
  }, [messages]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setScrollPosition(scrollTop);
        
        // Check if user is at bottom (with a small buffer)
        const isBottom = scrollHeight - scrollTop - clientHeight < 20;
        setIsAtBottom(isBottom);
      }
    };
    
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If no active chat, create one
    if (!activeChat && user) {
      try {
        setIsLoadingChats(true);
        const newChat = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'ai',
          ID.unique(),
          {
            userId: user.$id,
            title: input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : ''),
            messages: JSON.stringify([]), // Empty array as JSON string
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        );
        
        console.log('Created new chat for message:', newChat.$id);
        setChats(prevChats => [newChat as unknown as Chat, ...prevChats]);
        setActiveChat(newChat.$id);
        setIsLoadingChats(false);
      } catch (error) {
        console.error('Error creating chat before sending message:', error);
        setIsLoadingChats(false);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    console.log('Sending user message to chat:', activeChat, userMessage);
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Scroll immediately after adding the user message
    setTimeout(scrollToBottom, 50);

    try {
      // Format previous messages for context (limit to last 10 for efficiency)
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Make API call to AI backend with chat history for context
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.$id,
          chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || "I'm an AI assistant. This is a demo response.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
      
      // Update chat title if it's the first message
      if (updatedMessages.length === 1 && activeChat) {
        const title = input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '');
        updateChatTitle(activeChat, title);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response in case of error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (activeChat) {
      console.log('Clearing messages for chat:', activeChat);
      const emptyMessages: Message[] = [];
      setMessages(emptyMessages);
      saveMessages(emptyMessages);
    } else {
      console.log('No active chat to clear');
    setMessages([]);
    }
  };

  // Effect to fetch current chat when activeChat changes
  useEffect(() => {
    if (!activeChat || !user) return;
    
    const fetchCurrentChat = async () => {
      try {
        console.log('Fetching current chat:', activeChat);
        const chatDoc = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'ai',
          activeChat
        );
        
        if (chatDoc) {
          console.log('Got chat document:', chatDoc);
          loadChat(chatDoc as unknown as Chat);
        }
      } catch (error) {
        console.error('Error fetching active chat:', error);
      }
    };
    
    // Only fetch if we haven't already loaded messages for this chat
    if (messages.length === 0) {
      fetchCurrentChat();
    } else {
      console.log('Skipping fetch as messages are already loaded:', messages.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat, user?.$id]);

  // In the component body
  const isMobile = useIsMobile();

  return (
    <div className={`h-screen overflow-hidden ${
      isMobile 
        ? 'bg-[#13111c] text-slate-200' 
        : 'bg-gradient-to-b from-background to-background/90'
      } ${isMobile ? 'flex flex-col' : 'flex flex-row'}`}>
      
      {/* Add CodeHighlighter component */}
      <CodeHighlighter />
      
      {/* Mobile Header - Only shown on mobile */}
      {isMobile && (
        <div className="flex items-center justify-between p-3 border-b border-slate-800">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md bg-slate-800/80"
          >
            <FiMenu className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="font-semibold text-lg">NEXUS AI</h1>
          <button
            onClick={createNewChat}
            className="p-2 rounded-md bg-primary/20 text-primary"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Sidebar */}
      <motion.div 
        initial={{ x: isSidebarOpen ? 0 : -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className={`${isMobile ? 'w-full' : 'w-72'} max-w-[280px] border-r border-border/30 ${
          isMobile ? 'bg-[#13111c]/95' : 'bg-card/80'
        } backdrop-blur-sm h-screen flex-shrink-0 flex flex-col z-40 ${
          isMobile ? 'fixed' : 'relative'
        } left-0 top-0`}
      >
        {/* Sidebar header - hide on mobile */}
        {!isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
              <FiCpu className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">NEXUS AI</h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-accent/50 rounded-md"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Mobile Sidebar Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-slate-800/30">
            <h2 className="font-semibold text-slate-100">Conversations</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-md text-slate-300"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* New Chat button - styled differently for mobile */}
        <div className="p-3">
          <button
            onClick={createNewChat}
            disabled={isLoadingChats}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-md ${
              isMobile 
                ? 'bg-primary/20 hover:bg-primary/30 text-primary' 
                : 'bg-primary/10 hover:bg-primary/20 text-primary'
            } font-medium transition-colors`}
          >
            <FiPlus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingChats ? (
            <div className="flex flex-col items-center justify-center h-32">
              <FiRefreshCw className="animate-spin w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center p-4">
              <span className="text-sm text-muted-foreground">No chats yet</span>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat.$id} className="relative group">
                <button
                  onClick={() => {
                    setActiveChat(chat.$id);
                    loadChat(chat);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-2 p-2 rounded-md ${
                    activeChat === chat.$id 
                      ? isMobile 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-primary/10 text-primary' 
                      : isMobile 
                        ? 'hover:bg-slate-800 text-slate-300' 
                        : 'hover:bg-accent'
                  } transition-colors truncate text-sm`}
                >
                  <FiMessageSquare className={`w-4 h-4 flex-shrink-0 ${
                    activeChat === chat.$id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className="truncate">
                    {editingTitle === chat.$id ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            updateChatTitle(chat.$id, newTitle);
                          } else if (e.key === 'Escape') {
                            setEditingTitle(null);
                          }
                        }}
                        onBlur={() => {
                          if (newTitle.trim()) {
                            updateChatTitle(chat.$id, newTitle);
                          } else {
                            setEditingTitle(null);
                          }
                        }}
                        autoFocus
                        className={`w-full bg-transparent border-none focus:outline-none focus:ring-0 ${
                          isMobile ? 'text-primary' : 'text-primary'
                        }`}
                      />
                    ) : (
                      chat.title || 'New Conversation'
                    )}
                  </span>
                </button>
                <div className={`absolute right-1 top-1 ${
                  activeChat === chat.$id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } transition-opacity flex gap-1`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTitle(chat.$id);
                      setNewTitle(chat.title);
                    }}
                    className={`p-1 rounded-md ${
                      isMobile 
                        ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                        : 'hover:bg-accent/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FiEdit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this chat?')) {
                        deleteChat(chat.$id);
                      }
                    }}
                    className={`p-1 rounded-md ${
                      isMobile 
                        ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' 
                        : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                    }`}
                  >
                    <FiTrash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* User section at bottom of sidebar */}
        <div className={`p-3 border-t ${
          isMobile ? 'border-slate-800/50' : 'border-border/30'
        } flex items-center gap-2`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
            {user?.prefs?.avatar ? (
              <Image 
                src={user.prefs.avatar} 
                alt={user.name || 'User'} 
                width={32} 
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <FiUser className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user?.email || 'Loading...'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dark overlay when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-30" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area - use different styles for mobile */}
      <div className={`flex-1 h-screen flex flex-col overflow-hidden relative max-w-full ${
        isMobile ? 'pb-16' : ''
      }`}>
        {/* Mobile chat list view - only shown when there are no messages on mobile */}
        {isMobile && messages.length === 0 && (
          <div className="p-2 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <div className="bg-primary/15 p-5 rounded-xl mb-4 flex items-center justify-center">
                <FiCpu className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-lg font-medium text-center mb-4">How can I help you today?</h2>
              
              <div className="grid grid-cols-1 gap-2 mb-6">
                {[
                  "How do I create a React component?",
                  "Explain Next.js server components",
                  "What's a good UI pattern for forms?",
                  "Help me organize my project structure"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => {
                        handleSubmit(new Event('click') as any);
                      }, 100);
                    }}
                    className="flex items-center justify-between text-left p-3 rounded-xl border border-slate-700/80 hover:border-primary/30 hover:bg-slate-800/50 transition-colors text-sm text-slate-300"
                  >
                    <span className="line-clamp-1">{suggestion}</span>
                    <FiChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
              
              {chats.length > 0 && (
                <>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Recent chats</h3>
                  <div className="space-y-1">
                    {chats.slice(0, 5).map((chat) => (
                      <button
                        key={chat.$id}
                        onClick={() => {
                          setActiveChat(chat.$id);
                          databases.getDocument(
                            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                            'ai',
                            chat.$id
                          )
                          .then(document => {
                            loadChat(document as unknown as Chat);
                          });
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-md text-left text-slate-300 hover:bg-slate-800/50"
                      >
                        <FiMessageSquare className="w-4 h-4 text-slate-400" />
                        <span className="text-sm truncate">{chat.title || 'New Conversation'}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Desktop empty state */}
        {!isMobile && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-[60vh] px-4"
          >
            <div className="bg-primary/10 p-6 rounded-full mb-6">
              <FiCpu className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Meet NEXUS</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Your AI assistant for web development, UI/UX design, and project management. Ask me anything about Next.js, React, or modern web development!
            </p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {[
                "How do I create a React component?",
                "Explain Next.js server components",
                "What's a good UI pattern for forms?",
                "Help me organize my project structure"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="flex items-center justify-between text-left p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm">{suggestion}</span>
                  <FiChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
              </motion.div>
        )}

        {/* Message Container - conditional styling for mobile */}
        {messages.length > 0 && (
          <>
            {/* Mobile chat header with actions */}
            {isMobile && (
              <div className="p-2 flex justify-end">
                <button
                  onClick={clearChat}
                  className="p-2 bg-slate-800/80 hover:bg-red-900/20 rounded-full transition-colors border border-slate-700/50"
                  title="Clear chat"
                >
                  <FiTrash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            )}
            
            {/* Desktop chat actions */}
            {!isMobile && messages.length > 0 && (
              <div className="absolute top-4 right-4 z-30">
                <button
                  onClick={clearChat}
                  className="p-2 bg-card/80 backdrop-blur-sm hover:bg-destructive/10 rounded-full transition-colors border border-border/50 shadow-sm"
                  title="Clear chat"
                >
                  <FiTrash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            )}
            
            <div 
              ref={chatContainerRef}
              className={`flex-grow overflow-y-auto overflow-x-hidden ${
                isMobile 
                  ? 'p-2 pb-20' 
                  : 'p-4 pb-28'
              } scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent`}
            >
              <div className="container max-w-4xl mx-auto">
                <AnimatePresence>
                  {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-2 mb-4 ${
                    message.role === 'assistant' ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  <div
                        className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                          message.role === 'assistant' 
                            ? 'bg-primary/15 text-primary ring-1 ring-primary/25' 
                            : isMobile ? 'bg-slate-700 ring-1 ring-slate-600' : 'bg-secondary/70 ring-1 ring-border/50'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                          <FiCpu className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : user?.prefs?.avatar ? (
                          <Image 
                            src={user.prefs.avatar} 
                            alt={user.name || 'User'} 
                            width={36} 
                            height={36} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
                            {user?.name?.[0] || 'U'}
                      </span>
                    )}
                  </div>
                  <div
                        className={`${isMobile ? 'p-2.5' : 'p-4'} rounded-lg ${isMobile ? 'max-w-[85%]' : 'max-w-[80%]'} shadow-sm ${
                      message.role === 'assistant'
                            ? isMobile 
                              ? 'bg-slate-800/90 border border-slate-700/50 text-sm text-slate-300' 
                              : 'bg-card border border-border/50 text-base'
                            : isMobile 
                              ? 'bg-primary/80 text-primary-foreground text-sm' 
                              : 'bg-primary text-primary-foreground text-base'
                        }`}
                      >
                        {formatMessage(message.content)}
                  </div>
                </motion.div>
                  ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 items-start mb-4`}
              >
                      <div className={`${isMobile ? 'w-7 h-7' : 'w-9 h-9'} rounded-full bg-primary/15 text-primary ring-1 ring-primary/25 flex items-center justify-center`}>
                        <FiRefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />
                </div>
                      <div className={`${isMobile ? 'p-2.5' : 'p-4'} rounded-lg ${
                        isMobile ? 'bg-slate-800/90 border border-slate-700/50' : 'bg-card border border-border/50'
                      } shadow-sm`}>
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>
          </>
        )}

        {/* Input Bar - different styling for mobile */}
        <div 
          style={{ 
            height: "80px", 
            borderTop: "1px solid var(--border-color)", 
            backgroundColor: "var(--card-color)",
            position: "sticky",
            bottom: "80px", // Added space below to move it up
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: "-10px" // Negative margin to pull it up
          }} 
          className={`bg-card/95 rounded-t-xl mx-4 z-50 ${
            isMobile 
              ? 'bg-[#13111c] border-t border-slate-800 py-2 px-2' 
              : 'bg-card/95 rounded-t-xl mx-4 pb-2 pt-2'
          }`}
        >
          <div className={`container mx-auto ${isMobile ? 'max-w-full' : 'max-w-4xl px-4'}`}>
            <form onSubmit={handleSubmit} className="flex items-center">
              <div className="w-full relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              rows={1}
                  style={{ 
                    resize: 'none',
                    height: input.split('\n').length > 1 ? 'auto' : (isMobile ? '40px' : '45px')
                  }}
                  className={`w-full px-3 pr-10 py-2 rounded-full ${
                    isMobile 
                      ? 'bg-slate-800 border-slate-700 text-sm text-slate-200 placeholder-slate-500 h-6' 
                      : 'bg-background/80 border-border/50 text-base'
                  } border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/80 shadow-md overflow-hidden`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
                <div className="absolute inset-y-0 right-1 flex items-center">
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <FiSend className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}