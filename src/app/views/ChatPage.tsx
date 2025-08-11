
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '@/types/messaging';
import { getMessages, sendMessage, markChatAsRead } from '@/app/messaging/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronLeftCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View } from './types';

interface ChatPageProps {
  onNavigate: (view: View) => void;
  trainerName: string;
  recipientName: string;
}

export const ChatPage = ({ onNavigate, trainerName, recipientName }: ChatPageProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const viewportRef = useRef<HTMLDivElement>(null);

    const chatId = [trainerName, recipientName].sort().join('_');

    const fetchMessages = useCallback(async () => {
        const fetchedMessages = await getMessages(chatId);
        setMessages(fetchedMessages);
        await markChatAsRead(chatId, trainerName);
        setIsLoading(false);
    }, [chatId, trainerName]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling every 3 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToSend = newMessage.trim();
        if (textToSend === '') return;

        setNewMessage('');
        
        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            chatId: chatId,
            sender: trainerName,
            recipient: recipientName,
            text: textToSend,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, optimisticMessage]);

        const result = await sendMessage(chatId, trainerName, recipientName, textToSend);

        if (!result.success) {
            // Revert optimistic update on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            setNewMessage(textToSend); // Restore message in input
        }
        
        // Let the polling handle the final state
        await fetchMessages(); 
    };

    return (
        <div className="min-h-screen h-screen flex flex-col items-center text-foreground relative">
            <header className="w-full p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <div className="max-w-xl mx-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => onNavigate('messages_hub')}>
                        <ChevronLeftCircle className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-headline text-primary flex-grow truncate">{recipientName}</h1>
                </div>
            </header>
            
            <ScrollArea className="flex-grow w-full" viewportRef={viewportRef}>
                <div className="max-w-xl mx-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={cn("flex", msg.sender === trainerName ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-xs md:max-w-md p-3 rounded-2xl",
                                        msg.sender === trainerName 
                                            ? "bg-primary text-primary-foreground rounded-br-lg" 
                                            : "bg-secondary text-secondary-foreground rounded-bl-lg"
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            <footer className="sticky bottom-0 w-full bg-background border-t">
                <form onSubmit={handleSendMessage} className="p-2">
                    <div className="flex items-center gap-2 max-w-xl mx-auto">
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Scrivi un messaggio..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </footer>
        </div>
    );
};
