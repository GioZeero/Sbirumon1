
import type { Timestamp } from "firebase/firestore";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: Date;
  };
  unreadBy?: {
    [key: string]: boolean;
  };
}

export interface Message {
  id: string;
  chatId: string;
  sender: string;
  recipient: string;
  text: string;
  timestamp: Date;
}

// Version of the data stored in Firestore, using server timestamps
export interface MessageDb {
  sender: string;
  recipient: string;
  text: string;
  timestamp: Timestamp;
}
