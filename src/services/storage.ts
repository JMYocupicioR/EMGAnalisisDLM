import type { Study } from '../types/study';
import { storageService } from './unifiedStorageService';

const API_BASE_URL = '/api/studies';

/**
 * Guarda un estudio tanto en la API como localmente
 */
export const saveStudy = async (study: Study): Promise<void> => {
  try {
    // Intentar guardar en la API primero
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(study),
    });

    if (!response.ok) {
      throw new Error('Error al guardar el estudio en la API');
    }

    // Si la API responde correctamente, guardar localmente
    await storageService.saveStudy(study);
  } catch (error) {
    // Si falla la API, guardar solo localmente
    console.warn('Error al guardar en la API, guardando localmente:', error);
    await storageService.saveStudy(study);
  }
};

/**
 * Obtiene estudios, intentando primero la API y usando datos locales como respaldo
 */
export const getStudies = async (): Promise<Study[]> => {
  try {
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error('Error al obtener los estudios de la API');
    }
    
    const studies = await response.json();
    
    // Sincronizar con almacenamiento local
    studies.forEach(study => storageService.saveStudy(study));
    
    return studies;
  } catch (error) {
    console.warn('Error al obtener de la API, usando datos locales:', error);
    return storageService.getAllStudies();
  }
};

/**
 * Elimina un estudio tanto de la API como localmente
 */
export const deleteStudy = async (id: string): Promise<void> => {
  try {
    // Intentar eliminar de la API primero
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el estudio de la API');
    }

    // Si la API responde correctamente, eliminar localmente
    const allStudies = storageService.getAllStudies();
    const filteredStudies = allStudies.filter(study => study.id !== id);
    filteredStudies.forEach(study => storageService.saveStudy(study));
  } catch (error) {
    // Si falla la API, eliminar solo localmente
    console.warn('Error al eliminar de la API, eliminando localmente:', error);
    const allStudies = storageService.getAllStudies();
    const filteredStudies = allStudies.filter(study => study.id !== id);
    filteredStudies.forEach(study => storageService.saveStudy(study));
  }
};

/**
 * Obtiene estudios solo del almacenamiento local
 */
export const getFromLocalStorage = (): Study[] => {
  return storageService.getAllStudies();
}; 