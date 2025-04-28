export * from './patient';
export * from './study';
export * from './patientStudy';

// Tipos comunes
export type StudyType = 'emg' | 'nerve_conduction' | 'other';

// Interfaces de resultados
export interface EMGResults {
  muscle: string;
  side: 'left' | 'right';
  insertionalActivity: string;
  spontaneousActivity: string;
  motorUnitActionPotentials: {
    amplitude: number;
    duration: number;
    polyphasia: number;
  };
  recruitment: string;
  interferencePattern: string;
}

export interface NCSResults {
  nerve: string;
  side: 'left' | 'right';
  latency: number;
  amplitude: number;
  velocity: number;
  distance: number;
  temperature: number;
}

// Interfaces de análisis
export interface AnalysisResult {
  id: string;
  studyId: string;
  type: StudyType;
  findings: {
    emg?: EMGResults[];
    ncs?: NCSResults[];
  };
  interpretation: string;
  recommendations: string[];
  timestamp: string;
} 