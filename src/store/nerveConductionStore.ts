import { create } from 'zustand';
import { NerveMeasurement, AnalysisResult, Study, PendingStudy, Side } from '../types';
import { analyzeNerveConduction } from '../utils/analysis';

interface NerveConductionState {
  // Estado del formulario
  nerve: string;
  side: Side;
  measurements: NerveMeasurement;
  
  // Estudios
  pendingStudies: PendingStudy[];
  studies: Study[];
  
  // UI
  error: string | null;
  isLoading: boolean;
  
  // Acciones
  setNerve: (nerve: string) => void;
  setSide: (side: Side) => void;
  setMeasurements: (measurements: NerveMeasurement) => void;
  setPendingStudies: (studies: PendingStudy[]) => void;
  setStudies: (studies: Study[]) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  // Métodos compuestos
  addNerve: () => void;
  removePendingStudy: (id: string) => void;
  analyzeAllStudies: () => Promise<void>;
  deleteStudy: (id: string) => void;
  
  // Persistencia (opcional - para implementación futura)
  loadStudiesFromStorage: () => void;
  saveStudiesToStorage: () => void;
}

export const useNerveConductionStore = create<NerveConductionState>((set, get) => ({
  // Estado inicial
  nerve: '',
  side: 'left',
  measurements: {
    latency: 0,
    velocity: 0,
    amplitude: 0
  },
  pendingStudies: [],
  studies: [],
  error: null,
  isLoading: false,
  
  // Acciones básicas
  setNerve: (nerve) => set({ nerve }),
  setSide: (side) => set({ side }),
  setMeasurements: (measurements) => set({ measurements }),
  setPendingStudies: (pendingStudies) => set({ pendingStudies }),
  setStudies: (studies) => set({ studies }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Método para agregar un nuevo nervio pendiente de análisis
  addNerve: () => {
    const { nerve, side, measurements } = get();
    
    const newPendingStudy: PendingStudy = {
      id: crypto.randomUUID(),
      nerve,
      side,
      measurements: { ...measurements }
    };
    
    set((state) => ({
      pendingStudies: [...state.pendingStudies, newPendingStudy],
      // Resetear el formulario para el siguiente nervio
      nerve: '',
      measurements: { latency: 0, velocity: 0, amplitude: 0 }
    }));
  },
  
  // Eliminar un estudio pendiente
  removePendingStudy: (id) => {
    set((state) => ({
      pendingStudies: state.pendingStudies.filter(study => study.id !== id)
    }));
  },
  
  // Analizar todos los estudios pendientes
  analyzeAllStudies: async () => {
    const { pendingStudies } = get();
    
    if (pendingStudies.length === 0) {
      set({ error: 'No hay nervios para analizar.' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const newStudies = await Promise.all(
        pendingStudies.map(async (pending) => {
          const analysisResult = await analyzeNerveConduction(pending.nerve, pending.measurements);
          return {
            id: pending.id,
            nerve: analysisResult.nerve,
            side: pending.side,
            measurements: analysisResult.measurements,
            interpretation: analysisResult.interpretation,
            status: analysisResult.status,
            timestamp: new Date().toISOString()
          };
        })
      );
      
      set((state) => ({
        studies: [...newStudies, ...state.studies],
        pendingStudies: []
      }));
      
      // Guardar en almacenamiento local
      get().saveStudiesToStorage();
    } catch (err) {
      set({ error: 'Ocurrió un error durante el análisis. Intente nuevamente.' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Eliminar un estudio analizado
  deleteStudy: (id) => {
    set((state) => ({
      studies: state.studies.filter(study => study.id !== id)
    }));
    
    // Actualizar el almacenamiento local
    get().saveStudiesToStorage();
  },
  
  // Persistencia en localStorage
  loadStudiesFromStorage: () => {
    try {
      const savedStudies = localStorage.getItem('emg_nerve_studies');
      if (savedStudies) {
        set({ studies: JSON.parse(savedStudies) });
      }
    } catch (error) {
      console.error('Error al cargar estudios desde localStorage:', error);
    }
  },
  
  saveStudiesToStorage: () => {
    try {
      const { studies } = get();
      localStorage.setItem('emg_nerve_studies', JSON.stringify(studies));
    } catch (error) {
      console.error('Error al guardar estudios en localStorage:', error);
    }
  }
}));

// Cargar estudios guardados cuando se importa la tienda
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador, no durante SSR
  useNerveConductionStore.getState().loadStudiesFromStorage();
}