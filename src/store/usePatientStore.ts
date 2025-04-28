// Implementación de Zustand para la gestión del estado de pacientes
import { create } from 'zustand';
import { Patient } from '../types/patient';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  viewMode: 'list' | 'new' | 'edit' | 'details';
  searchTerm: string;
  isLoading: boolean;
  
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setViewMode: (mode: 'list' | 'new' | 'edit' | 'details') => void;
  setSearchTerm: (term: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  selectedPatient: null,
  viewMode: 'list',
  searchTerm: '',
  isLoading: false,
  
  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setIsLoading: (loading) => set({ isLoading: loading })
}));