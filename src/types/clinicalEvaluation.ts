import { Patient } from './patient';

export interface ValidationErrors {
  [key: string]: string;
}

export interface ClinicalEvaluationFormData {
  patientData: Patient | null;
  reasonForStudy: {
    weakness: {
      present: boolean;
      distribution: string[];
      severity: 'mild' | 'moderate' | 'severe';
      progression: string;
      onset: string;
      evolution: string;
      associatedSymptoms: string[];
    };
    paresthesias: {
      present: boolean;
      distribution: string[];
      characteristics: string[];
      duration: string;
      frequency: string;
      triggers: string[];
      alleviatingFactors: string[];
    };
    pain: {
      present: boolean;
      type: string[];
      distribution: string[];
      intensity: number;
      onset: string;
      evolution: string;
      triggers: string[];
      alleviatingFactors: string[];
    };
    sensory: {
      present: boolean;
      type: string[];
      distribution: string[];
      severity: 'mild' | 'moderate' | 'severe';
      onset: string;
      evolution: string;
      associatedSymptoms: string[];
    };
  };
  clinicalFindings: {
    muscleTone: {
      status: string;
      description: string;
    };
    muscleStrength: {
      affectedMuscles: Array<{
        muscle: string;
        side: 'left' | 'right';
        mrcGrade: number;
        notes?: string;
      }>;
    };
    reflexes: {
      biceps: string;
      triceps: string;
      patellar: string;
      achilles: string;
    };
    coordination: {
      fingerToNose: string;
      heelToShin: string;
      rapidAlternatingMovements: string;
    };
    gait: {
      pattern: string;
      description: string;
    };
  };
  preliminaryDiagnosis: string;
  ncsFindings: any; // TODO: Definir tipo específico
  emgFindings: any; // TODO: Definir tipo específico
  specialStudies: any[];
  studyIndications: string[];
  recommendedProtocol: 'NCS' | 'NCS_EMG';
  patientId: string;
  date: string;
  examiner: string;
  clinicalHistory: string;
  physicalExamination: string;
  recommendations: string;
  emgPattern: string;
}

export interface ClinicalEvaluation {
  patientInfo: {
    name: string;
    age: number;
    id: string;
    date: string;
  };
  reasonsForStudy: string;
  clinicalFindings: string;
  ncsFindings: {
    motor: {
      [nerveName: string]: {
        side: 'left' | 'right';
        distalLatency: number;
        amplitude: number;
        velocity: number;
      };
    };
    sensory: {
      [nerveName: string]: {
        side: 'left' | 'right';
        amplitude: number;
        velocity: number;
      };
    };
  };
  emgFindings: {
    muscles: {
      [muscleName: string]: {
        side: 'left' | 'right';
        insertionalActivity: string;
        spontaneousActivity: {
          fibrillations: string;
          positiveWaves: string;
          fasciculations: string;
        };
        mupAnalysis: {
          duration: number;
          amplitude: number;
          polyphasia: string;
          recruitment: string;
        };
        associatedNerves?: string[];
        associatedRoots?: string[];
      };
    };
  };
  diagnosis: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medicalHistory: string;
  medications: string[];
  allergies: string[];
} 