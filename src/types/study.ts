import { StudyType } from './index';

export interface Study {
  id: string;
  type: StudyType;
  date: string;
  patientId: string;
  results: {
    emg?: EMGResults[];
    ncs?: NCSResults[];
  };
  observations?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

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

// Estado vacío para inicializar el formulario
export const emptyStudy: Study = {
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
}; 