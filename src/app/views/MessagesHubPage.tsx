
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@/types/messaging';
import { getChats, searchUsers } from '@/app/messaging/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronLeftCircle, Search, MessageSquarePlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { View } from './types';
import { useDebounce } from 'use-debounce';

interface MessagesHubPageProps {
  onNavigate: (view: View, data?: any) => void;
  trainerName: string;
}

export const MessagesHubPage = ({ onNavigate, trainerName }: MessagesHubPageProps) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ trainerName: string }[]>([]);
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        const userChats = await getChats(trainerName);
        setChats(userChats);
        setIsLoading(false);
    }, [trainerName]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchQuery.trim().length > 1) {
                setIsSearching(true);
                const results = await searchUsers(debouncedSearchQuery, trainerName);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        };
        performSearch();
    }, [debouncedSearchQuery, trainerName]);

    const getChatId = (otherUser: string) => {
        return [trainerName, otherUser].sort().join('_');
    };
    
    const handleNewChat = (recipient: string) => {
        onNavigate('chat', { recipient });
    };

    return (
        <div className="min-h-screen flex flex-col items-center text-foreground relative pb-4">
            <header className="w-full p-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => onNavigate('trainer')}>
                        <ChevronLeftCircle className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-headline text-primary flex-grow">Messaggi</h1>
                </div>
            </header>
            <main className="w-full max-w-xl p-4 flex-grow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Cerca allenatori..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {searchQuery.trim().length > 0 ? (
                     <Card className="mt-2">
                        <CardContent className="p-2">
                            {isSearching ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : (
                                searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <Button key={user.trainerName} variant="ghost" className="w-full justify-start gap-2" onClick={() => handleNewChat(user.trainerName)}>
                                            <MessageSquarePlus className="h-5 w-5 text-primary" />
                                            {user.trainerName}
                                        </Button>
                                    ))
                                ) : <p className="text-center text-sm text-muted-foreground p-4">Nessun utente trovato.</p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <ScrollArea className="h-[calc(100vh-150px)] mt-4">
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
                        ) : chats.length > 0 ? (
                            <div className="space-y-2">
                                {chats.map(chat => {
                                    const otherParticipant = chat.participants.find(p => p !== trainerName) || 'Sconosciuto';
                                    const isUnread = chat.unreadBy?.[trainerName];
                                    return (
                                        <Card key={chat.id} className="cursor-pointer hover:bg-accent/10" onClick={() => handleNewChat(otherParticipant)}>
                                            <CardContent className="p-3 flex items-center gap-3">
                                                {isUnread && <div className="h-2.5 w-2.5 rounded-full bg-destructive flex-shrink-0" />}
                                                <div className="flex-grow overflow-hidden">
                                                    <p className="font-bold truncate">{otherParticipant}</p>
                                                    {chat.lastMessage && (
                                                         <p className="text-sm text-muted-foreground truncate">
                                                            {chat.lastMessage.sender === trainerName && "Tu: "}
                                                            {chat.lastMessage.text}
                                                         </p>
                                                    )}
                                                </div>
                                                {chat.lastMessage && (
                                                    <p className="text-xs text-muted-foreground flex-shrink-0">
                                                        {formatDistanceToNow(chat.lastMessage.timestamp, { addSuffix: true, locale: it })}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground">Nessuna chat ancora.</p>
                                <p className="text-sm text-muted-foreground">Cerca un allenatore per iniziare!</p>
                            </div>
                        )}
                    </ScrollArea>
                )}
            </main>
        </div>
    );
};
