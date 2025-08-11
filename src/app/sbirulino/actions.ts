'use server';

import { updatePlayerNameInRepository } from '@/lib/fighter-repository';

export async function updateCreatureName(trainerName: string, newName: string): Promise<{ success: boolean; message: string }> {
  if (!newName || newName.trim().length < 3 || newName.trim().length > 15) {
    return { success: false, message: 'Il nome deve avere tra 3 e 15 caratteri.' };
  }
  try {
    await updatePlayerNameInRepository(trainerName, newName.trim());
    return { success: true, message: 'Nome aggiornato con successo!' };
  } catch (error) {
    console.error('Failed to update creature name:', error);
    return { success: false, message: 'Errore durante l\'aggiornamento del nome.' };
  }
}
