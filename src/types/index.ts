export type StudyType = 'neuroconduction' | 'myography' | 'special';

export type Side = 'left' | 'right' | 'both';

export interface NerveMeasurement {
  nerve: string;
  latency: number;
  amplitude: number;
  velocity: number;
  fResponse?: number;
}

export interface PendingStudy {
  id: string;
  nerve: string;
  side: Side;
  measurements: NerveMeasurement;
}

export interface Study {
  id: string;
  nerve: string;
  side: Side;
  measurements: NerveMeasurement;
  interpretation: string[];
  status: 'normal' | 'abnormal';
  timestamp: string;
}

export interface StudyData {
  sides: {
    left?: NerveMeasurement;
    right?: NerveMeasurement;
  };
  notes?: string;
}

export interface NerveReference {
  name: string;
  latency: { min: number; max: number };
  velocity: { min: number; max: number };
  amplitude: { min: number; max: number };
}

export interface AnalysisResult {
  nerve: string;
  measurements: NerveMeasurement;
  interpretation: string[];
  status: 'normal' | 'abnormal';
}

// Tipos para el módulo de pacientes
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
  medicalHistory?: {
    previousDiseases: string[];
    surgeries: string[];
    currentMedications: string[];
    allergies: string[];
    familyHistory?: string;
  };
  mainDiagnosis?: string;
  consultReason?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para estudios de pacientes
export interface PatientStudy {
  id: string;
  patientId: string;
  studyType: StudyType;
  timestamp: string;
  data: StudyData;
  results: any;
  conclusion?: string;
}