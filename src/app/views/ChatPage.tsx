
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
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatId = [trainerName, recipientName].sort().join('_');

    const fetchMessages = useCallback(async () => {
        const fetchedMessages = await getMessages(chatId);
        setMessages(fetchedMessages);
        await markChatAsRead(chatId, trainerName);
        setIsLoading(false);
    }, [chatId, trainerName]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const textToSend = newMessage;
        setNewMessage('');
        
        await sendMessage(chatId, trainerName, recipientName, textToSend);
        fetchMessages(); // Refetch messages immediately after sending
    };

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative">
            <header className="w-full p-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <div className="max-w-xl mx-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => onNavigate('messages_hub')}>
                        <ChevronLeftCircle className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-headline text-primary flex-grow truncate">{recipientName}</h1>
                </div>
            </header>
            
            <div className="flex-grow w-full max-w-xl flex flex-col">
                <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={cn("flex", msg.sender === trainerName ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-xs md:max-w-md p-3 rounded-lg",
                                        msg.sender === trainerName 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-secondary text-secondary-foreground"
                                    )}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="sticky bottom-0 p-2 border-t bg-background">
                    <div className="flex items-center gap-2 max-w-xl mx-auto">
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Scrivi un messaggio..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
