import { Study } from './study';
import { StudyType } from './index';

export interface AIAnalysis {
  emgAnalysis?: {
    id: string;
    studyId: string;
    content: string;
    timestamp: string;
    modelVersion: string;
  };
}

export interface PatientStudy {
  id: string;
  patientId: string;
  patientName: string;
  studyType: StudyType;
  studyData: Study;
  timestamp: string;
  observations?: string;
  conclusion?: string;
  aiAnalysis?: AIAnalysis;
}

// Estado vacío para inicializar el formulario
export const emptyPatientStudy: PatientStudy = {
  id: '',
  patientId: '',
  patientName: '',
  studyType: 'emg',
  studyData: {
    id: '',
    type: 'emg',
    date: new Date().toISOString(),
    patientId: '',
    results: {
      emg: [],
      ncs: []
    },
    observations: '',
    conclusion: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  timestamp: new Date().toISOString(),
  observations: '',
  conclusion: ''
}; 