'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function submitFeedback(feedbackText: string, trainerName: string | null): Promise<{ success: boolean; message: string }> {
  if (!feedbackText || feedbackText.trim().length === 0) {
    return { success: false, message: 'Il feedback non può essere vuoto.' };
  }
  if (feedbackText.trim().length > 2000) {
    return { success: false, message: 'Il feedback non può superare i 2000 caratteri.' };
  }

  try {
    await addDoc(collection(db, 'feedback'), {
      text: feedbackText.trim(),
      trainerName: trainerName || 'N/A',
      createdAt: serverTimestamp(),
    });
    return { success: true, message: 'Feedback inviato con successo! Grazie.' };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, message: 'Si è verificato un errore durante l\'invio del feedback.' };
  }
}
