// src/services/aiAnalysisStorageService.ts
import { Study } from '../types';

const STORAGE_KEY = 'emg_ai_analyses';

/**
 * Tipo para los análisis de IA generados
 */
export interface AIAnalysis {
  id: string;
  studyId: string;
  patientId?: string;
  type: 'emg' | 'nerve_conduction' | 'general';
  content: string;
  createdAt: string;
  updatedAt: string;
  modelInfo?: {
    model: string;
    version?: string;
    parameters?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

/**
 * Guarda un nuevo análisis de IA o actualiza uno existente
 */
export function saveAIAnalysis(analysis: Partial<AIAnalysis>): AIAnalysis {
  // Obtener los análisis existentes
  const analyses = getAllAIAnalyses();
  
  // Preparar el nuevo análisis con valores por defecto para campos requeridos
  const now = new Date().toISOString();
  const newAnalysis: AIAnalysis = {
    id: analysis.id || crypto.randomUUID(),
    studyId: analysis.studyId || '',
    type: analysis.type || 'general',
    content: analysis.content || '',
    createdAt: analysis.createdAt || now,
    updatedAt: now,
    ...analysis
  };
  
  // Verificar si ya existe un análisis para este estudio
  const existingIndex = analyses.findIndex(a => a.id === newAnalysis.id);
  
  if (existingIndex >= 0) {
    // Actualizar el análisis existente
    analyses[existingIndex] = {
      ...analyses[existingIndex],
      ...newAnalysis,
      updatedAt: now
    };
  } else {
    // Añadir el nuevo análisis
    analyses.push(newAnalysis);
  }
  
  // Guardar los análisis actualizados
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  
  return newAnalysis;
}

/**
 * Obtiene todos los análisis de IA almacenados
 */
export function getAllAIAnalyses(): AIAnalysis[] {
  const analyses = localStorage.getItem(STORAGE_KEY);
  return analyses ? JSON.parse(analyses) : [];
}

/**
 * Obtiene los análisis de IA para un estudio específico
 */
export function getAIAnalysesForStudy(studyId: string): AIAnalysis[] {
  const allAnalyses = getAllAIAnalyses();
  return allAnalyses.filter(analysis => analysis.studyId === studyId);
}

/**
 * Obtiene un análisis de IA específico por su ID
 */
export function getAIAnalysisById(analysisId: string): AIAnalysis | undefined {
  const allAnalyses = getAllAIAnalyses();
  return allAnalyses.find(analysis => analysis.id === analysisId);
}

/**
 * Obtiene el análisis de IA más reciente para un estudio
 */
export function getLatestAIAnalysisForStudy(studyId: string): AIAnalysis | undefined {
  const studyAnalyses = getAIAnalysesForStudy(studyId);
  if (studyAnalyses.length === 0) return undefined;
  
  // Ordenar por fecha de actualización (más reciente primero)
  return studyAnalyses.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

/**
 * Elimina un análisis de IA específico
 */
export function deleteAIAnalysis(analysisId: string): boolean {
  const analyses = getAllAIAnalyses();
  const filteredAnalyses = analyses.filter(analysis => analysis.id !== analysisId);
  
  if (filteredAnalyses.length === analyses.length) {
    return false; // No se encontró el análisis
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAnalyses));
  return true;
}

/**
 * Elimina todos los análisis de IA para un estudio específico
 */
export function deleteAIAnalysesForStudy(studyId: string): number {
  const analyses = getAllAIAnalyses();
  const initialCount = analyses.length;
  const filteredAnalyses = analyses.filter(analysis => analysis.studyId !== studyId);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAnalyses));
  return initialCount - filteredAnalyses.length;
}

/**
 * Obtiene análisis agrupados por tipo para un paciente específico
 */
export function getAIAnalysesByPatient(patientId: string): Record<string, AIAnalysis[]> {
  const analyses = getAllAIAnalyses();
  const patientAnalyses = analyses.filter(analysis => analysis.patientId === patientId);
  
  // Agrupar por tipo
  return patientAnalyses.reduce((grouped, analysis) => {
    if (!grouped[analysis.type]) {
      grouped[analysis.type] = [];
    }
    grouped[analysis.type].push(analysis);
    return grouped;
  }, {} as Record<string, AIAnalysis[]>);
}

/**
 * Exporta todos los análisis de IA para un paciente como un archivo JSON
 */
export function exportPatientAIAnalyses(patientId: string): string {
  const patientAnalyses = getAllAIAnalyses().filter(
    analysis => analysis.patientId === patientId
  );
  
  return JSON.stringify({
    patientId,
    exportDate: new Date().toISOString(),
    analyses: patientAnalyses
  }, null, 2);
}

/**
 * Importa análisis de IA desde un archivo JSON
 */
export function importAIAnalyses(jsonData: string): number {
  try {
    const importedData = JSON.parse(jsonData);
    
    if (!importedData.analyses || !Array.isArray(importedData.analyses)) {
      throw new Error('Formato de datos inválido');
    }
    
    // Obtener análisis existentes
    const existingAnalyses = getAllAIAnalyses();
    
    // Procesar cada análisis importado
    let importCount = 0;
    importedData.analyses.forEach((analysis: AIAnalysis) => {
      // Verificar si el análisis ya existe
      const existingIndex = existingAnalyses.findIndex(a => a.id === analysis.id);
      
      if (existingIndex >= 0) {
        // Actualizar si ya existe
        existingAnalyses[existingIndex] = analysis;
      } else {
        // Añadir si es nuevo
        existingAnalyses.push(analysis);
        importCount++;
      }
    });
    
    // Guardar los análisis actualizados
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingAnalyses));
    
    return importCount;
  } catch (error) {
    console.error('Error al importar análisis:', error);
    throw new Error('Error al importar análisis de IA');
  }
}

/**
 * Comprueba si existe un análisis para un estudio
 */
export function hasAIAnalysisForStudy(studyId: string): boolean {
  return getAIAnalysesForStudy(studyId).length > 0;
}