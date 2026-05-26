import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';
import { apiFetch } from '@/api/client';
import type { ChatMessage } from '@/types';

const ChatInterface = () => {
  const { currentUser } = useAuth();
  const { entries } = useMood();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadChatHistory = useCallback(async () => {
    if (!currentUser) {
      setIsLoadingHistory(false);
      return;
    }
    try {
      const data = await apiFetch<ChatMessage[]>('/chat/history');
      if (data.length > 0) {
        setMessages(data);
      } else {
        const name = currentUser.user_metadata?.first_name || 'there';
        setMessages([
          {
            id: 'welcome',
            user_id: currentUser.id,
            role: 'assistant',
            content: `Hello ${name}! I'm Calmobot, your AI wellness companion. I can see your mood history and provide personalized support based on your wellness journey. How are you feeling today?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load chat history.', variant: 'destructive' });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const saveMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'user_id'>) => {
    if (!currentUser) return;
    try {
      await apiFetch('/chat/history', {
        method: 'POST',
        body: JSON.stringify(message),
      });
    } catch {
      // Silently fail saving; chat still works
    }
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: currentUser?.id ?? '',
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    await saveMessage({ role: userMessage.role, content: userMessage.content, timestamp: userMessage.timestamp });

    try {
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const userData = currentUser
        ? {
            firstName: currentUser.user_metadata?.first_name,
            lastName: currentUser.user_metadata?.last_name,
          }
        : null;

      const recentMoodEntries = entries.slice(0, 5).map((entry) => ({
        mood: entry.mood,
        description: entry.description,
        sentiment: entry.sentiment,
        score: entry.score,
        timestamp: entry.timestamp,
        insights: entry.insights,
      }));

      const data = await apiFetch<{ message: string }>('/chat/calmobot', {
        method: 'POST',
        body: JSON.stringify({
          messages: conversationHistory,
          userData,
          moodEntries: recentMoodEntries,
        }),
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: currentUser?.id ?? '',
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveMessage({ role: assistantMessage.role, content: assistantMessage.content, timestamp: assistantMessage.timestamp });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive',
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

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim().startsWith('*') && !line.trim().startsWith('**')) {
        return (
          <div key={index} className="ml-4 mb-1">
            <span className="mr-2">•</span>
            {formatTextWithBold(line.trim().substring(1).trim())}
          </div>
        );
      }
      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={index} className="ml-4 mb-1">
            {formatTextWithBold(line.trim())}
          </div>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <div key={index} className="mb-2">
          {formatTextWithBold(line)}
        </div>
      );
    });
  };

  const formatTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-[600px] bg-white dark:bg-slate-text/90 rounded-lg shadow-lg items-center justify-center" role="status" aria-live="polite">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <p className="mt-4 text-slate-text dark:text-mint-mist">Loading your chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-text/90 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-leaf-green rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-leaf-green text-white' : 'bg-gray-100 dark:bg-slate-text/50'}`}>
              <CardContent className="p-3">
                <div className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-slate-text dark:text-mint-mist'}`}>
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-slate-text/50 dark:text-mint-mist/50'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
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
          <div className="flex gap-3 justify-start" role="status" aria-live="polite">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-leaf-green rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <Card className="bg-gray-100 dark:bg-slate-text/50">
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-leaf-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-slate-text/30 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share your thoughts or ask for wellness advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} className="bg-leaf-green hover:bg-leaf-green/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
