
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp, orderBy, limit, runTransaction } from 'firebase/firestore';
import type { Chat, Message, MessageDb } from '@/types/messaging';
import type { Fighter } from '@/types/battle';

// --- Funzioni di Ricerca e Recupero ---

export async function searchUsers(searchTerm: string, currentUser: string): Promise<Pick<Fighter, 'trainerName'>[]> {
  if (!searchTerm) return [];
  const playersRef = collection(db, "players");
  const q = query(
    playersRef, 
    where("trainerName", ">=", searchTerm), 
    where("trainerName", "<=", searchTerm + '\uf8ff'),
    limit(10)
  );
  
  const querySnapshot = await getDocs(q);
  const users = querySnapshot.docs
    .map(doc => ({ trainerName: doc.data().trainerName as string }))
    .filter(user => user.trainerName !== currentUser);
    
  return users;
}

export async function getChats(trainerName: string): Promise<Chat[]> {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", trainerName));
  const querySnapshot = await getDocs(q);

  const chats: Chat[] = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      participants: data.participants,
      lastMessage: data.lastMessage ? {
        ...data.lastMessage,
        timestamp: data.lastMessage.timestamp.toDate(),
      } : undefined,
      unreadBy: data.unreadBy || {},
    };
  }).sort((a, b) => {
    const timeA = a.lastMessage?.timestamp.getTime() ?? 0;
    const timeB = b.lastMessage?.timestamp.getTime() ?? 0;
    return timeB - timeA;
  });

  return chats;
}

export async function getMessages(chatId: string): Promise<Message[]> {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data() as MessageDb;
        return {
            id: doc.id,
            chatId: chatId,
            ...data,
            timestamp: data.timestamp.toDate(),
        }
    });
}

// --- Funzioni di Scrittura e Aggiornamento ---

export async function sendMessage(chatId: string, sender: string, recipient: string, text: string): Promise<{ success: boolean }> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');
    
    const messageData = {
        sender,
        recipient,
        text,
        timestamp: serverTimestamp(),
    };
    
    const chatData = {
        participants: [sender, recipient],
        lastMessage: {
            text,
            sender,
            timestamp: serverTimestamp(),
        },
        unreadBy: {
            [recipient]: true,
        },
    };

    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
        // Create or update the chat document
        transaction.set(chatRef, chatData, { merge: true });
        
        // Add the new message to the subcollection
        transaction.set(doc(messagesRef), messageData);
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false };
  }
}


export async function markChatAsRead(chatId: string, trainerName: string): Promise<void> {
  const chatRef = doc(db, 'chats', chatId);
  await setDoc(chatRef, {
    unreadBy: {
      [trainerName]: false
    }
  }, { merge: true });
}

export async function hasUnreadMessages(trainerName: string): Promise<boolean> {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', trainerName),
    where(`unreadBy.${trainerName}`, '==', true)
  );

  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}
