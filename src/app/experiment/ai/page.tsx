'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiRefreshCw, FiTrash2, FiChevronRight, FiPlus, FiMessageSquare, FiMenu, FiX, FiEdit2, FiCopy, FiCheck, FiUser, FiImage, FiZap, FiSettings, FiUpload, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { databases, ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import ReactMarkdown from 'react-markdown';
import copy from 'copy-to-clipboard';
import Image from 'next/image';
import 'prismjs/themes/prism-tomorrow.css'; // Import a Prism theme for code highlighting
import CodeHighlighter, { highlightCode } from '@/components/CodeHighlighter';
import UploadModal from '@/components/UploadModal';
import saveAs from 'file-saver';

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
  imageUrl?: string;
  isGeneratingImage?: boolean;
  uploadedImageUrl?: string;
  generatedImageUrl?: string;
}

interface Chat {
  $id: string;
  title: string;
  userId: string;
  messages: string; // JSON stringified messages
  lastUpdated: string;
  createdAt: string;
}

// Add a responsive hook to detect mobile views - defined outside component
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if device is mobile
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
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

// ClientOnly component to handle hydration safely
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return <>{children}</>;
};

// Mobile warning component
const MobileWarning = () => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-[#13111c] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
        <FiCpu className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Desktop Only Feature</h1>
      <p className="text-slate-300 mb-6 max-w-sm">
        We're sorry, but our AI Experience is optimized for desktop devices.
        Please visit this page on a computer for the full experience.
      </p>
      <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-800/50 p-4 mb-6">
        <div className="flex items-center gap-3 text-left mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <FiAlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-slate-300">
            The AI features require a larger screen for optimal experience.
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push('/')}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Return to Homepage
      </button>
    </div>
  );
};

export default function AIExperiment() {
  // All hooks at the top level
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
  const [selectedModel, setSelectedModel] = useState<string>('nexus-default');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showImageCommandHint, setShowImageCommandHint] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, chatId: string, title: string} | null>(null);
  // Use the mobile hook
  const isMobileCheck = useIsMobile();

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
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          imageUrl: msg.imageUrl || undefined,
          uploadedImageUrl: msg.uploadedImageUrl || undefined,
          isGeneratingImage: msg.isGeneratingImage || undefined
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
      
      // Close the confirmation dialog
      setDeleteConfirmation(null);
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
      // Prepare messages for storage - making sure timestamps are strings and including image URLs
      const serializableMessages = newMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
        imageUrl: msg.imageUrl || undefined,
        uploadedImageUrl: msg.uploadedImageUrl || undefined,
        isGeneratingImage: msg.isGeneratingImage || undefined
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

  // Model options with their display names and capabilities
  const modelOptions = [
    { id: 'nexus-default', name: 'Nexus Default', hasImageCapability: false },
    { id: 'nexus-image', name: 'Nexus Image', hasImageCapability: true },
  ];

  // Get the currently selected model
  const currentModel = modelOptions.find(model => model.id === selectedModel) || modelOptions[0];

  // Function to generate an image using DALL-E 3
  const generateImage = async (prompt: string) => {
    if (!activeChat || !user) return null;
    
    try {
      setIsGeneratingImage(true);
      
      // Create a temporary message to show loading state
      const tempImageId = Date.now().toString();
      const tempUserMessage: Message = {
        id: tempImageId,
        content: prompt,
        role: 'user',
        timestamp: new Date(),
      };
      
      const tempImageMessage: Message = {
        id: tempImageId + '-image',
        content: 'Generating image...',
        role: 'assistant',
        timestamp: new Date(),
        isGeneratingImage: true,
      };
      
      // Add these messages to the UI
      const updatedMessages = [...messages, tempUserMessage, tempImageMessage];
      setMessages(updatedMessages);
      
      // Scroll to bottom to show loading state
      setTimeout(scrollToBottom, 50);
      
      // Make the API call to generate image
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userId: user.$id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error types
        let errorMessage = "Sorry, I couldn't generate that image. Please try again with a different prompt.";
        
        if (data.errorType === "content_policy") {
          errorMessage = data.error || "Your image couldn't be generated due to content policy restrictions. Please try a different prompt that doesn't reference brands, celebrities, or potentially sensitive content.";
        } else if (data.errorType === "rate_limit") {
          errorMessage = data.error || "We've reached our limit for image generation. Please try again later.";
        }
        
        // Update with appropriate error message
        const finalMessages = updatedMessages.map(msg => 
          msg.id === tempImageMessage.id 
            ? {
                ...msg,
                content: errorMessage,
                isGeneratingImage: false,
              }
            : msg
        );
        
        setMessages(finalMessages);
        saveMessages(finalMessages);
        return null;
      }
      
      // Update the message with the generated image
      const finalMessages = updatedMessages.map(msg => 
        msg.id === tempImageMessage.id 
          ? {
              ...msg,
              content: `Image generated for prompt: "${prompt}"`,
              imageUrl: data.imageUrl,
              isGeneratingImage: false,
            }
          : msg
      );
      
      setMessages(finalMessages);
      saveMessages(finalMessages);
      return data.imageUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Update with error message
      const errorMessages = messages.map(msg => 
        msg.isGeneratingImage 
          ? {
              ...msg,
              content: "Sorry, I couldn't generate that image. Please try again with a different prompt.",
              isGeneratingImage: false,
            }
          : msg
      );
      
      setMessages(errorMessages);
      saveMessages(errorMessages);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Handle upload success
  const handleUploadSuccess = (imageUrl: string) => {
    if (!activeChat) return;
    
    // Create messages for the uploaded image
    const tempImageId = Date.now().toString();
    const tempUserMessage: Message = {
      id: tempImageId,
      content: 'Uploaded an image',
      role: 'user',
      timestamp: new Date(),
    };
    
    const imageMessage: Message = {
      id: tempImageId + '-upload',
      content: 'Image uploaded successfully',
      role: 'assistant',
      timestamp: new Date(),
      uploadedImageUrl: imageUrl,
    };
    
    // Add these messages to the UI
    const updatedMessages = [...messages, tempUserMessage, imageMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    
    // Scroll to bottom to show the new messages
    setTimeout(scrollToBottom, 50);
  };
  
  // Handle upload error
  const handleUploadError = (error: string) => {
    // Show error message
    const errorMessage: Message = {
      id: Date.now().toString(),
      content: `Image upload failed: ${error}`,
      role: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([...messages, errorMessage]);
  };
  
  // Update the handleFileSelect to open the modal
  const handleFileSelect = () => {
    setIsUploadModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isGeneratingImage) return;

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
      // Check if this is an image generation request and using Nexus Image model
      if (currentModel.hasImageCapability && input.trim().toLowerCase().startsWith('/image')) {
        const imagePrompt = input.trim().substring(7); // Remove "/image " prefix
        
        if (imagePrompt) {
          await generateImage(imagePrompt);
        } else {
          // Add a help message if no prompt was provided
          const helpMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "Please provide a description after /image to generate an image. For example: /image a beautiful mountain landscape",
            role: 'assistant',
            timestamp: new Date(),
          };
          
          const finalMessages = [...updatedMessages, helpMessage];
          setMessages(finalMessages);
          saveMessages(finalMessages);
        }
        
        setIsLoading(false);
        return;
      }

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
          model: selectedModel,
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

  // Watch for /image command to show autocomplete hint
  useEffect(() => {
    if (currentModel.hasImageCapability && input.startsWith('/i')) {
      if (input === '/i' || input.startsWith('/im')) {
        setShowImageCommandHint(true);
      } else {
        setShowImageCommandHint(false);
      }
    } else {
      setShowImageCommandHint(false);
    }
  }, [input, currentModel.hasImageCapability]);

  // Allow tab completion for /image command
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && showImageCommandHint) {
      e.preventDefault();
      setInput('/image ');
      // Focus remains on the input and cursor is at the end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Place cursor at the end of the input
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      }, 10);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Updated download function using FileSaver with proxy route
  const downloadImage = (imageUrl: string, fileName: string = 'nexus-image') => {
    // Show download progress notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.zIndex = '9999';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    notification.textContent = 'Downloading image...';
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);

    // Create a proxy URL to bypass CORS restrictions
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    
    // Use the proxy URL for fetching
    fetch(proxyUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Use FileSaver to save the blob
        saveAs(blob, `${fileName}-${Date.now()}.png`);
        
        // Update notification to success
        notification.textContent = 'Image downloaded successfully!';
        notification.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
        
        // Remove notification after delay
        setTimeout(() => {
          notification.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 2000);
      })
      .catch(error => {
        console.error('Error downloading image:', error);
        
        // Update notification to error
        notification.textContent = 'Download failed. Trying alternate method...';
        notification.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
        
        // Fallback method - open in new tab
        try {
          // Open the proxy URL in a new tab instead of the direct URL
          window.open(proxyUrl, '_blank');
          
          // Update notification
          setTimeout(() => {
            notification.textContent = 'Image opened in new tab';
            notification.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
            
            // Remove notification
            setTimeout(() => {
              notification.style.opacity = '0';
              setTimeout(() => {
                document.body.removeChild(notification);
              }, 300);
            }, 2000);
          }, 1000);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          notification.textContent = 'All download methods failed';
          
          // Remove notification
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 2000);
        }
      });
  };

  // Return the component UI with ClientOnly for mobile detection
  return (
    <>
      <ClientOnly>
        {isMobileCheck ? (
          <MobileWarning />
        ) : (
          <div className={`h-screen overflow-hidden bg-gradient-to-b from-background to-background/90 flex flex-row`}>
            {/* Main content for desktop */}
            {/* Upload Modal */}
            <UploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            
            {/* Add CodeHighlighter component */}
            <CodeHighlighter />
            
            {/* Sidebar */}
            <motion.div 
              initial={{ x: isSidebarOpen ? 0 : -280 }}
              animate={{ x: isSidebarOpen ? 0 : -280 }}
              transition={{ duration: 0.3 }}
              className="w-72 max-w-[280px] border-r border-border/30 bg-card/80 backdrop-blur-sm h-screen flex-shrink-0 flex flex-col z-40 relative"
            >
              {/* Sidebar header */}
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
              
              {/* Model Selector */}
              <div className="px-3 pt-2">
                <div className="flex flex-col gap-1 mb-2">
                  <label className="text-xs text-muted-foreground">Model</label>
                  <div className="relative">
                    <button
                      onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-md bg-primary/10 text-primary"
                    >
                      <div className="flex items-center">
                        {currentModel.hasImageCapability ? (
                          <FiImage className="mr-2 h-4 w-4" />
                        ) : (
                          <FiZap className="mr-2 h-4 w-4" />
                        )}
                        <span>{currentModel.name}</span>
                      </div>
                      <FiChevronRight className={`w-4 h-4 transition-transform ${isModelMenuOpen ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {isModelMenuOpen && (
                      <div className="absolute left-0 right-0 mt-1 rounded-md shadow-lg bg-card/95 backdrop-blur-md ring-1 ring-border z-50 border border-border/30 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-background/80 z-0"></div>
                        <div className="py-1 relative z-10" role="menu" aria-orientation="vertical">
                          {modelOptions.map(model => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model.id);
                                setIsModelMenuOpen(false);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                selectedModel === model.id
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-accent/80'
                              }`}
                              role="menuitem"
                            >
                              {model.hasImageCapability ? (
                                <FiImage className="mr-2 h-4 w-4" />
                              ) : (
                                <FiZap className="mr-2 h-4 w-4" />
                              )}
                              {model.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* New Chat button */}
              <div className="p-3">
                <button
                  onClick={createNewChat}
                  disabled={isLoadingChats}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  New Chat
                </button>
              </div>
              
              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
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
                        }}
                        className={`w-full text-left flex items-center gap-2 p-2 rounded-md ${
                          activeChat === chat.$id
                            ? 'bg-primary/10 text-primary' 
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
                              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-primary"
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
                          className="p-1 rounded-md hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                        >
                          <FiEdit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmation({
                              isOpen: true,
                              chatId: chat.$id,
                              title: chat.title || 'New Conversation'
                            });
                          }}
                          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* User section at bottom of sidebar */}
              <div className="p-3 border-t border-border/30 flex items-center gap-2">
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
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative">
              {/* Chat header for desktop */}
              {activeChat && (
                <div className="flex items-center justify-between p-3 border-b border-border/30 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="p-1.5 hover:bg-accent/50 rounded-md lg:hidden"
                    >
                      <FiMenu className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="w-4 h-4 text-primary" />
                      <h2 className="font-medium">
                        {chats.find(c => c.$id === activeChat)?.title || 'New Chat'}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearChat}
                      className="p-1.5 hover:bg-destructive/10 rounded-md text-destructive/90"
                      title="Clear chat"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {(!activeChat || messages.length === 0) && (
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
              
              {/* Messages container */}
              {activeChat && messages.length > 0 && (
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 pb-28 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
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
                          {/* Avatar */}
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={{
                              backgroundColor: message.role === 'assistant' ? 'rgba(var(--primary), 0.15)' : 'rgba(var(--secondary), 0.7)',
                              color: message.role === 'assistant' ? 'rgb(var(--primary))' : undefined,
                              boxShadow: message.role === 'assistant' ? '0 0 0 1px rgba(var(--primary), 0.25)' : '0 0 0 1px rgba(var(--border), 0.5)'
                            }}
                          >
                            {message.role === 'assistant' ? (
                              <FiCpu className="w-4 h-4" />
                            ) : user?.prefs?.avatar ? (
                              <Image 
                                src={user.prefs.avatar} 
                                alt={user.name || 'User'} 
                                width={36} 
                                height={36} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {user?.name?.[0] || 'U'}
                              </span>
                            )}
                          </div>
                          <div
                            className="p-4 rounded-lg max-w-[80%] shadow-sm"
                            style={{
                              backgroundColor: message.role === 'assistant' ? 'var(--card)' : 'rgb(var(--primary))',
                              borderColor: message.role === 'assistant' ? 'rgba(var(--border), 0.5)' : undefined,
                              borderWidth: message.role === 'assistant' ? '1px' : undefined,
                              color: message.role === 'assistant' ? undefined : 'rgb(var(--primary-foreground))'
                            }}
                          >
                            {message.isGeneratingImage ? (
                              <div className="flex flex-col items-center justify-center">
                                <div className="mb-3 text-center">Generating image...</div>
                                <div className="w-full aspect-square max-w-sm mx-auto bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden relative">
                                  {/* Modern wave animation */}
                                  <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-slate-800/20 to-purple-500/10"></div>
                                    <div className="absolute h-[500%] w-[500%] -top-[200%] -left-[200%] animate-slow-spin z-0 opacity-30">
                                      <div className="absolute top-0 left-0 right-0 bottom-0 m-auto w-full h-full rounded-[40%] bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-purple-500/20 blur-3xl"></div>
                                    </div>
                                  </div>
                                  
                                  {/* Center content */}
                                  <div className="relative z-10 flex flex-col items-center bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl">
                                    <svg className="animate-bounce-slow w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 4V4C8.13401 4 5 7.13401 5 11V16.8294C5 16.9404 5.09488 17.0294 5.20323 17.0114C5.74527 16.9328 6.59845 16.7382 7.25246 16.386C7.91801 16.0255 8.4004 15.367 8.4004 14.0896C8.4004 13.5607 8.82366 13.1374 9.3526 13.1374H14.6474C15.1763 13.1374 15.5996 13.5607 15.5996 14.0896C15.5996 15.367 16.082 16.0255 16.7475 16.386C17.4016 16.7382 18.2547 16.9328 18.7968 17.0114C18.9051 17.0294 19 16.9404 19 16.8294V11C19 7.13401 15.866 4 12 4Z" stroke="currentColor" strokeWidth="1" />
                                      <path d="M14 19.5C14 20.3284 13.1046 21 12 21C10.8954 21 10 20.3284 10 19.5C10 18.6716 10.8954 18 12 18C13.1046 18 14 18.6716 14 19.5Z" fill="currentColor" />
                                    </svg>
                                    
                                    <div className="flex space-x-1 mb-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150"></div>
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-300"></div>
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-500"></div>
                                    </div>
                                    <div className="text-sm text-slate-300">Creating your vision with DALL-E 3</div>
                                  </div>
                                </div>
                              </div>
                            ) : message.imageUrl || message.generatedImageUrl ? (
                              <div className="flex flex-col space-y-2">
                                <div>{formatMessage(message.content)}</div>
                                <div className="w-full rounded-lg overflow-hidden border border-slate-700 relative group">
                                  <Image
                                    src={message.imageUrl || message.generatedImageUrl || ''} 
                                    alt="Generated image"
                                    width={500} 
                                    height={500} 
                                    className="w-full h-auto object-cover"
                                  />
                                  <button 
                                    onClick={() => downloadImage(message.imageUrl || message.generatedImageUrl || '', 'nexus-image')}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    title="Download image"
                                  >
                                    <FiDownload className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : message.uploadedImageUrl ? (
                              <div className="flex flex-col space-y-2">
                                <div>{formatMessage(message.content)}</div>
                                <div className="w-full rounded-lg overflow-hidden border border-slate-700 relative group">
                                  <Image
                                    src={message.uploadedImageUrl}
                                    alt="Uploaded image"
                                    width={500} 
                                    height={500} 
                                    className="w-full h-auto object-cover"
                                  />
                                  <button 
                                    onClick={() => downloadImage(message.uploadedImageUrl || '', 'uploaded-image')}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    title="Download image"
                                  >
                                    <FiDownload className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              formatMessage(message.content)
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && !isGeneratingImage && currentModel.id === selectedModel && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 items-start mb-4"
                        >
                          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary ring-1 ring-primary/25 flex items-center justify-center">
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          </div>
                          <div className="p-4 rounded-lg bg-card border border-border/50 shadow-sm">
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
              )}
              
              {/* Input Bar */}
              <div className="bg-card/95 rounded-t-xl mx-4 pb-2 pt-2 z-50">
                <div className="container mx-auto max-w-4xl px-4">
                  <form onSubmit={handleSubmit} className="flex items-center">
                    <div className="w-full relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        style={{ 
                          resize: 'none',
                          height: input.split('\n').length > 1 ? 'auto' : '45px'
                        }}
                        className="w-full pl-3 pr-10 py-2 rounded-full bg-background/80 border-border/50 border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/80 shadow-md overflow-hidden"
                      />
                      
                      {/* Command hint dropdown */}
                      {showImageCommandHint && (
                        <div className="absolute bottom-full mb-1 left-0 w-48 bg-background rounded-md shadow-lg border border-border p-1 text-sm">
                          <button
                            onClick={() => {
                              setInput('/image ');
                              setShowImageCommandHint(false);
                              inputRef.current?.focus();
                            }}
                            className="flex items-center gap-2 w-full p-2 hover:bg-accent/70 rounded"
                          >
                            <FiImage className="text-primary w-4 h-4" />
                            <span className="font-mono text-xs">/image</span>
                            <span className="text-muted-foreground text-xs ml-auto">- Generate image</span>
                          </button>
                        </div>
                      )}
                      
                      <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                        {currentModel.hasImageCapability && (
                          <button
                            type="button"
                            onClick={handleFileSelect}
                            className="p-2 rounded-full hover:bg-accent/80 text-muted-foreground hover:text-foreground transition-colors"
                            title="Upload image"
                          >
                            <FiUpload className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isLoading || !input.trim()}
                          className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
                        >
                          {isLoading ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiSend className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="max-w-md w-full rounded-lg shadow-xl bg-card border border-border backdrop-blur-md"
                     style={{ 
                      background: 'linear-gradient(to bottom right, rgba(36, 36, 54, 0.95), rgba(28, 28, 42, 0.9))',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-full bg-destructive/10">
                        <FiAlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Delete Conversation</h3>
                    </div>
                    <p className="mb-6 text-muted-foreground">
                      Are you sure you want to delete "<span className="font-medium">{deleteConfirmation?.title}</span>"? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setDeleteConfirmation(null)}
                        className="px-4 py-2 rounded-md bg-muted text-foreground hover:opacity-90 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteConfirmation && deleteChat(deleteConfirmation.chatId)}
                        className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ClientOnly>
    </>
  );
}