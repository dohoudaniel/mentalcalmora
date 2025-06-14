
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (currentUser) {
      loadChatHistory();
    } else {
      // Show welcome message for non-authenticated users
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hello! I'm Calmobot, your AI wellness companion. I'm here to help you understand your moods, provide emotional support, and offer wellness advice. How are you feeling today?",
        timestamp: new Date()
      }]);
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  const loadChatHistory = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.length > 0) {
        const chatHistory = data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(chatHistory);
      } else {
        // Show welcome message for new users
        setMessages([{
          id: '1',
          role: 'assistant',
          content: "Hello! I'm Calmobot, your AI wellness companion. I'm here to help you understand your moods, provide emotional support, and offer wellness advice. How are you feeling today?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveMessageToDatabase = async (message: Message) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: currentUser.id,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString()
        });

      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Function to format AI response text
  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle bullet points
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="ml-4 mb-1">
              <span className="mr-2">•</span>
              {line.trim().substring(1).trim()}
            </div>
          );
        }
        // Handle numbered lists
        if (line.trim().match(/^\d+\./)) {
          return (
            <div key={index} className="ml-4 mb-1">
              {line.trim()}
            </div>
          );
        }
        // Handle bold text (**text**)
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Handle empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraph
        return (
          <div key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        );
      });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Save user message to database
    if (currentUser) {
      await saveMessageToDatabase(userMessage);
    }

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('calmobot-chat', {
        body: { messages: conversationHistory }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      if (currentUser) {
        await saveMessageToDatabase(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-[600px] bg-white dark:bg-slate-text/90 rounded-lg shadow-lg items-center justify-center">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="mt-4 text-slate-text dark:text-mint-mist">Loading your chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-text/90 rounded-lg shadow-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-leaf-green rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            
            <Card className={`max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-leaf-green text-white' 
                : 'bg-gray-100 dark:bg-slate-text/50'
            }`}>
              <CardContent className="p-3">
                <div className={`text-sm ${
                  message.role === 'user' 
                    ? 'text-white' 
                    : 'text-slate-text dark:text-mint-mist'
                }`}>
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' 
                    ? 'text-white/70' 
                    : 'text-slate-text/50 dark:text-mint-mist/50'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>
            
            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-sky-blue rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-leaf-green rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <Card className="bg-gray-100 dark:bg-slate-text/50">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-text/30 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts or ask for wellness advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-leaf-green hover:bg-leaf-green/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
