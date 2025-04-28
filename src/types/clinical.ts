export interface NerveData {
  side: 'right' | 'left';
  latency: number;
  amplitude: number;
  conductionVelocity: number;
}

export interface FWaveData {
  side: 'right' | 'left';
  latency: number;
}

export interface MuscleEvaluation {
  muscle: string;
  side: 'left' | 'right';
  mrcGrade: number;
  notes?: string;
}

export interface ClinicalFindings {
  muscleTone: {
    status: 'normal' | 'increased' | 'decreased';
    description: string;
  };
  muscleStrength: {
    affectedMuscles: MuscleEvaluation[];
  };
  reflexes: {
    biceps: 'normal' | 'increased' | 'decreased' | 'absent';
    triceps: 'normal' | 'increased' | 'decreased' | 'absent';
    patellar: 'normal' | 'increased' | 'decreased' | 'absent';
    achilles: 'normal' | 'increased' | 'decreased' | 'absent';
  };
  coordination: {
    fingerToNose: 'normal' | 'abnormal';
    heelToShin: 'normal' | 'abnormal';
    rapidAlternatingMovements: 'normal' | 'abnormal';
  };
  gait: {
    pattern: 'normal' | 'abnormal';
    description: string;
  };
}

export interface ReasonForStudy {
  weakness: {
    present: boolean;
    distribution: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
  pain: {
    present: boolean;
    type: string[];
    distribution: string[];
    intensity: number;
  };
  sensory: {
    present: boolean;
    type: string[];
    distribution: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
}

export interface ClinicalEvaluation {
  reasonForStudy: ReasonForStudy;
  clinicalFindings: ClinicalFindings;
  preliminaryDiagnosis: string;
  ncsFindings: {
    motorNerves: Record<string, NerveData>;
    sensoryNerves: Record<string, NerveData>;
    fWaves: Record<string, FWaveData>;
  };
  emgFindings: {
    muscles: Record<string, {
      side: 'left' | 'right';
      insertionalActivity: 'normal' | 'increased' | 'decreased';
      spontaneousActivity: {
        fibrillations: 'absent' | 'present' | 'increased';
        positiveWaves: 'absent' | 'present' | 'increased';
        fasciculations: 'absent' | 'present' | 'increased';
      };
      mupAnalysis: {
        duration: number;
        amplitude: number;
        polyphasia: 'normal' | 'increased';
        recruitment: 'normal' | 'reduced' | 'early';
      };
      associatedNerves: string[];
      associatedRoots: string[];
    }>;
  };
  specialStudies: any[];
  studyIndications: string[];
  recommendedProtocol: 'NCS' | 'NCS_EMG';
  patientId: string;
  date: string;
  examiner: string;
  clinicalHistory: string;
  physicalExamination: string;
  recommendations: string;
}

export interface NCSResults {
  motor: {
    latency: number;
    amplitude: number;
    conductionVelocity: number;
    fWave: {
      latency: number;
      persistence: number;
    };
  };
  sensory: {
    latency: number;
    amplitude: number;
    conductionVelocity: number;
  };
}

export interface NerveConductionData {
  latency: number;
  amplitude: number;
  conductionVelocity?: number;
  notes?: string;
}

export interface EMGResults {
  muscles: Record<string, MuscleEMGData>;
  ncsResults?: Record<string, NerveConductionData>;
  interpretation?: EMGInterpretation;
  analysisDate: string;
  reviewedBy: string;
  recommendedFollowUp?: string;
  rawWaveData?: RawEMGData[];
}

export interface MuscleEMGData {
  muscle: string;
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: 'absent' | '+1' | '+2' | '+3' | '+4';
    positiveWaves: 'absent' | '+1' | '+2' | '+3' | '+4';
    fasciculations: 'absent' | '+1' | '+2' | '+3' | '+4';
    complexRepetitiveDischarges?: 'absent' | 'present';
    myotonicDischarges?: 'absent' | 'present';
  };
  motorUnitPotentials: {
    duration: { value: number; percentOfNormal?: number; };
    amplitude: { value: number; percentOfNormal?: number; };
    phases: number;
    stability?: 'stable' | 'unstable';
  };
  recruitment: {
    pattern: 'normal' | 'reduced' | 'early' | 'absent';
    ratioToAmplitude?: number;
  };
  interference?: {
    pattern: 'full' | 'reduced' | 'discrete' | 'single';
  };
  associatedNerves?: string[];
  associatedRoots?: string[];
  notes?: string;
}

export interface EMGInterpretation {
  patternType: 'normal' | 'neuropathic' | 'myopathic' | 'mixed' | 'non-specific';
  patternSubtype?: string;
  distribution: 'focal' | 'multifocal' | 'diffuse' | 'proximal' | 'distal' | 'generalized';
  laterality: 'unilateral' | 'bilateral' | 'asymmetric bilateral';
  chronicity: 'acute' | 'subacute' | 'chronic' | 'acute on chronic';
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  suggestedDiagnoses: {
    diagnosisId: string;
    confidence: number;
    matchingCriteria: string[];
  }[];
  abnormalMuscles: string[];
  normalMuscles: string[];
  notes: string;
}

export interface RawEMGData {
  muscleId: string;
  timePoints: number[];
  amplitudePoints: number[];
  samplingRate: number;
  duration: number;
  triggerPoints?: number[];
}

export interface DiagnosticCriteria {
  canSkipEMG: boolean;
  reasons: string[];
  requiresEMG: boolean;
  emgReasons: string[];
}

export interface IntegratedDiagnosis {
  clinicalCorrelation: string;
  lesionType: 'axonal' | 'demyelinating' | 'mixed';
  pathologyType: 'neuropathic' | 'myopathic' | 'mixed';
  severity: 'mild' | 'moderate' | 'severe';
  chronicity: 'acute' | 'subacute' | 'chronic';
  distribution: string[];
  finalDiagnosis: string;
  recommendations: string[];
  emgPattern?: {
    type: 'normal' | 'neuropathic' | 'myopathic' | 'mixed' | 'non-specific';
    distribution: string;
    chronicity: string;
    severity: string;
    suggestedDiagnoses: string[];
  };
  ncsPattern?: {
    type: 'normal' | 'axonal' | 'demyelinating' | 'mixed';
    distribution: string;
    severity: string;
    suggestedDiagnoses: string[];
  };
  prognosis?: string;
  followUpRecommendations?: string;
  referringPhysicianNotes?: string;
} 