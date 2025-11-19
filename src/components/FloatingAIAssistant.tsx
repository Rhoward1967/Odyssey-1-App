import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Maximize2, MessageSquare, Minimize2, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FloatingAIAssistantProps {
  personality?: 'helpful' | 'professional' | 'friendly';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export default function FloatingAIAssistant({ 
  personality = 'helpful',
  position = 'bottom-right'
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Position classes based on prop
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual AI API call
      // For now, simulating a response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getPersonalityResponse(inputValue, personality),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalityResponse = (input: string, type: string): string => {
    // Simple response generator based on personality
    const responses = {
      helpful: `I'd be happy to help you with that! Let me look into: "${input}"`,
      professional: `Thank you for your inquiry. I'll assist you with: "${input}"`,
      friendly: `Hey! That's a great question about "${input}"! Let me help you out! 😊`,
    };
    return responses[type as keyof typeof responses] || responses.helpful;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 transition-all duration-300`}>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card 
          className={`
            shadow-2xl border-2 backdrop-blur-sm bg-background/95
            transition-all duration-300 ease-in-out
            ${isMinimized 
              ? 'w-80 h-16' 
              : 'w-96 h-[600px] flex flex-col'
            }
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">
                      Hi! I'm your AI assistant.
                      <br />
                      How can I help you today?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-lg p-3 text-sm
                            ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-muted text-foreground'
                            }
                          `}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 text-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100" />
                            <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
