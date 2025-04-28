import { create } from 'zustand';
import { 
  Patient, 
  NCSTest, 
  EMGTest, 
  DiagnosticResult, 
  DiagnosticMode 
} from '../types/diagnostic';

interface DiagnosticStore {
  // State
  patient: Patient | null;
  ncsTests: NCSTest[];
  emgTests: EMGTest[];
  currentMode: DiagnosticMode;
  diagnosticResult: DiagnosticResult | null;

  // Actions
  setPatient: (patient: Patient) => void;
  addNCSTest: (test: NCSTest) => void;
  updateNCSTest: (id: string, test: Partial<NCSTest>) => void;
  removeNCSTest: (id: string) => void;
  
  addEMGTest: (test: EMGTest) => void;
  updateEMGTest: (id: string, test: Partial<EMGTest>) => void;
  removeEMGTest: (id: string) => void;
  
  setMode: (mode: DiagnosticMode) => void;
  setDiagnosticResult: (result: DiagnosticResult) => void;
  
  // Reset
  resetStore: () => void;
}

const initialState = {
  patient: null,
  ncsTests: [],
  emgTests: [],
  currentMode: 'NCS_EMG' as DiagnosticMode,
  diagnosticResult: null,
};

export const useDiagnosticStore = create<DiagnosticStore>((set) => ({
  ...initialState,

  setPatient: (patient) => set({ patient }),
  
  addNCSTest: (test) => 
    set((state) => ({ ncsTests: [...state.ncsTests, test] })),
  
  updateNCSTest: (id, updatedTest) =>
    set((state) => ({
      ncsTests: state.ncsTests.map((test) =>
        test.id === id ? { ...test, ...updatedTest } : test
      ),
    })),
  
  removeNCSTest: (id) =>
    set((state) => ({
      ncsTests: state.ncsTests.filter((test) => test.id !== id),
    })),
  
  addEMGTest: (test) =>
    set((state) => ({ emgTests: [...state.emgTests, test] })),
  
  updateEMGTest: (id, updatedTest) =>
    set((state) => ({
      emgTests: state.emgTests.map((test) =>
        test.id === id ? { ...test, ...updatedTest } : test
      ),
    })),
  
  removeEMGTest: (id) =>
    set((state) => ({
      emgTests: state.emgTests.filter((test) => test.id !== id),
    })),
  
  setMode: (mode) => set({ currentMode: mode }),
  
  setDiagnosticResult: (result) => set({ diagnosticResult: result }),
  
  resetStore: () => set(initialState),
})); 