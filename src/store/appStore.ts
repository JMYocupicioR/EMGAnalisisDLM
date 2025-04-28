// src/store/appStore.ts
import { create } from 'zustand';
import { StudyType } from '../types';

// Define las vistas principales de la aplicación
export type ViewMode = 'home' | 'new-study' | 'individual-study' | 'history' | 'patients';

// Definir los pasos del estudio
export type StudyStep = 'patient' | 'diagnosis' | 'protocol' | 'analysis';

// Definir la interfaz del estado global
interface AppState {
  // Navegación principal
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  
  // Para estudios individuales
  selectedStudy: StudyType | null;
  setSelectedStudy: (study: StudyType | null) => void;
  
  // Para estudios completos
  studyStep: StudyStep;
  setStudyStep: (step: StudyStep) => void;
  patientInfo: any;
  setPatientInfo: (info: any) => void;
  selectedDiagnosis: string | null;
  setSelectedDiagnosis: (diagnosis: string | null) => void;
  studyData: any;
  setStudyData: (data: any) => void;
  
  // Función para restablecer todos los datos del estudio
  resetStudyData: () => void;
  
  // Navegación del flujo de trabajo
  goToNextStudyStep: () => void;
  goToPreviousStudyStep: () => void;
  
  // Funciones de utilidad para la navegación
  startNewStudy: () => void;
  navigateBack: () => void;
}

// Crear la tienda
export const useAppStore = create<AppState>((set) => ({
  // Estado inicial
  currentView: 'home',
  selectedStudy: null,
  studyStep: 'patient',
  patientInfo: null,
  selectedDiagnosis: null,
  studyData: {},
  
  // Acciones para modificar el estado
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedStudy: (study) => set({ selectedStudy: study }),
  setStudyStep: (step) => set({ studyStep: step }),
  setPatientInfo: (info) => set({ patientInfo: info }),
  setSelectedDiagnosis: (diagnosis) => set({ selectedDiagnosis: diagnosis }),
  setStudyData: (data) => set((state) => ({ studyData: { ...state.studyData, ...data } })),
  
  // Restablecer datos del estudio
  resetStudyData: () => set({
    studyStep: 'patient',
    patientInfo: null,
    selectedDiagnosis: null,
    studyData: {}
  }),
  
  // Navegación del flujo de estudio
  goToNextStudyStep: () => set((state) => {
    const currentStep = state.studyStep;
    let nextStep: StudyStep = currentStep;
    
    switch (currentStep) {
      case 'patient':
        nextStep = 'diagnosis';
        break;
      case 'diagnosis':
        nextStep = 'protocol';
        break;
      case 'protocol':
        nextStep = 'analysis';
        break;
      // No hay siguiente paso después de 'analysis'
      default:
        break;
    }
    
    return { studyStep: nextStep };
  }),
  
  goToPreviousStudyStep: () => set((state) => {
    const currentStep = state.studyStep;
    let prevStep: StudyStep = currentStep;
    
    switch (currentStep) {
      case 'diagnosis':
        prevStep = 'patient';
        break;
      case 'protocol':
        prevStep = 'diagnosis';
        break;
      case 'analysis':
        prevStep = 'protocol';
        break;
      // No hay paso anterior a 'patient'
      default:
        break;
    }
    
    return { studyStep: prevStep };
  }),
  
  // Funciones de utilidad para la navegación
  startNewStudy: () => set({
    currentView: 'new-study',
    studyStep: 'patient',
    patientInfo: null,
    selectedDiagnosis: null,
    studyData: {}
  }),
  
  navigateBack: () => set((state) => {
    if (state.currentView === 'new-study') {
      switch (state.studyStep) {
        case 'diagnosis':
          return { studyStep: 'patient' };
        case 'protocol':
          return { studyStep: 'diagnosis' };
        case 'analysis':
          return { studyStep: 'protocol' };
        case 'patient':
          return { currentView: 'home' };
        default:
          return {};
      }
    } else if (state.currentView === 'individual-study' || state.currentView === 'history' || state.currentView === 'patients') {
      return { currentView: 'home', selectedStudy: null };
    }
    
    return {};
  })
}));