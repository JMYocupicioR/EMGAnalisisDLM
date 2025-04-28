// Implementación de Zustand para la gestión del estado de estudios
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyType } from '../types';

interface StudyState {
  selectedStudy: StudyType | null;
  currentView: string;
  patientInfo: any;
  selectedDiagnosis: string | null;
  studyData: Record<string, any>;
  studyStep: string;
  
  setSelectedStudy: (study: StudyType | null) => void;
  setCurrentView: (view: string) => void;
  setPatientInfo: (info: any) => void;
  setSelectedDiagnosis: (diagnosis: string | null) => void;
  setStudyData: (data: Record<string, any>) => void;
  setStudyStep: (step: string) => void;
  resetStudy: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      selectedStudy: null,
      currentView: 'home',
      patientInfo: null,
      selectedDiagnosis: null,
      studyData: {},
      studyStep: 'patient',
      
      setSelectedStudy: (study) => set({ selectedStudy: study }),
      setCurrentView: (view) => set({ currentView: view }),
      setPatientInfo: (info) => set({ patientInfo: info }),
      setSelectedDiagnosis: (diagnosis) => set({ selectedDiagnosis: diagnosis }),
      setStudyData: (data) => set({ studyData: data }),
      setStudyStep: (step) => set({ studyStep: step }),
      resetStudy: () => set({ 
        patientInfo: null, 
        selectedDiagnosis: null, 
        studyData: {}, 
        studyStep: 'patient' 
      })
    }),
    {
      name: 'study-storage',
    }
  )
);