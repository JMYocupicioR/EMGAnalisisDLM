import { Patient } from '../types/patient';
import { Study, StudyType } from '../types/study';
import { PatientStudy } from '../types/patientStudy';
import { storageService } from './unifiedStorageService';

/**
 * Guarda un estudio asociado a un paciente
 */
export const savePatientStudy = async (
  patient: Patient, 
  studyType: StudyType, 
  studyData: Study, 
  observations?: string,
  conclusion?: string,
  aiEmgAnalysis?: string
): Promise<PatientStudy> => {
  return storageService.savePatientStudy(
    patient,
    studyType,
    studyData,
    observations,
    conclusion,
    aiEmgAnalysis
  );
};

/**
 * Obtiene todos los estudios de pacientes
 */
export const getAllPatientStudies = (): PatientStudy[] => {
  return storageService.getAllPatientStudies();
};

/**
 * Actualiza un estudio existente
 */
export const updatePatientStudy = async (studyId: string, updates: Partial<PatientStudy>): Promise<PatientStudy | null> => {
  const allStudies = storageService.getAllPatientStudies();
  const studyIndex = allStudies.findIndex(study => study.id === studyId);
  
  if (studyIndex === -1) {
    return null;
  }
  
  const updatedStudy = {
    ...allStudies[studyIndex],
    ...updates,
    timestamp: new Date().toISOString()
  };
  
  await storageService.savePatientStudy(
    { id: updatedStudy.patientId } as Patient, // Solo necesitamos el ID del paciente
    updatedStudy.studyType,
    updatedStudy.studyData,
    updatedStudy.observations,
    updatedStudy.conclusion,
    updatedStudy.aiAnalysis?.emgAnalysis?.content
  );
  
  return updatedStudy;
};

/**
 * Elimina un estudio
 */
export const deletePatientStudy = (studyId: string): boolean => {
  const allStudies = storageService.getAllPatientStudies();
  const filteredStudies = allStudies.filter(study => study.id !== studyId);
  
  if (filteredStudies.length === allStudies.length) {
    return false;
  }
  
  // Actualizar los estudios usando el servicio unificado
  filteredStudies.forEach(study => {
    storageService.savePatientStudy(
      { id: study.patientId } as Patient,
      study.studyType,
      study.studyData,
      study.observations,
      study.conclusion,
      study.aiAnalysis?.emgAnalysis?.content
    );
  });
  
  return true;
};

/**
 * Añade o actualiza análisis de IA para un estudio existente
 */
export const addAIAnalysisToStudy = async (
  studyId: string, 
  emgAnalysis: string, 
  modelVersion: string = 'gpt-4'
): Promise<PatientStudy | null> => {
  const allStudies = storageService.getAllPatientStudies();
  const studyIndex = allStudies.findIndex(study => study.id === studyId);
  
  if (studyIndex === -1) {
    return null;
  }
  
  const study = allStudies[studyIndex];
  
  return updatePatientStudy(studyId, {
    ...study,
    aiAnalysis: {
      emgAnalysis: {
        id: crypto.randomUUID(),
        studyId: studyId,
        content: emgAnalysis,
        timestamp: new Date().toISOString(),
        modelVersion: modelVersion
      }
    }
  });
}; 