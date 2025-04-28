export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  clinicalHistory: string;
}

export interface PhysicalExam {
  muscularTone: {
    description: string;
    location: string[];
    severity: 'normal' | 'increased' | 'decreased';
  };
  muscularStrength: {
    description: string;
    affectedMuscles: {
      muscle: string;
      mrcGrade: number; // 0-5 MRC scale
    }[];
  };
  sensitivity: {
    touch: boolean;
    pain: boolean;
    temperature: boolean;
    vibration: boolean;
    position: boolean;
    affectedAreas: string[];
  };
  reflexes: {
    location: string;
    grade: number; // 0-4 scale
  }[];
}

export interface NCSTest {
  id: string;
  date: string;
  type: 'motor' | 'sensory';
  nerve: string;
  side: 'left' | 'right';
  measurements: {
    latency: number;
    amplitude: number;
    velocity: number;
  };
}

export interface EMGTest {
  id: string;
  date: string;
  muscle: string;
  side: 'left' | 'right';
  insertionActivity: 'normal' | 'increased' | 'decreased';
  spontaneousPotentials: {
    fibrillations: number;
    positiveWaves: number;
    fasciculations: boolean;
  };
  motorUnitPotentials: {
    amplitude: number;
    duration: number;
    phases: number;
    recruitment: 'normal' | 'reduced' | 'early' | 'absent';
    interferencePattern: 'complete' | 'reduced' | 'discrete';
  };
}

export interface CTSTest {
  id: string;
  date: string;
  // Sensory Studies
  sensoryMedian: {
    latencyD2: number;  // ms
    latencyD3: number;  // ms
    latencyD4: number;  // ms
    latencyD1: number;  // ms
    palmLatency: number; // ms
    conductionVelocity: number; // m/s
    amplitude: number;  // μV
  };
  sensoryUlnar: {
    latencyD4: number;  // ms
    conductionVelocity: number;
    amplitude: number;
  };
  sensoryRadial: {
    latencyD1: number;  // ms
    conductionVelocity: number;
    amplitude: number;
  };
  // Motor Studies
  motorMedian: {
    distalLatency: number;  // ms
    amplitude: number;      // mV
    conductionVelocity: number;
    lumbricalLatency: number;  // ms
  };
  motorUlnar: {
    interosseousLatency: number;  // ms
    amplitude: number;
  };
  // EMG Studies (optional)
  emgAPB?: {
    fibrillations: 0 | 1 | 2 | 3 | 4;
    positiveWaves: 0 | 1 | 2 | 3 | 4;
    recruitment: 'normal' | 'reduced' | 'discrete' | 'absent';
  };
}

export interface CTSAnalysisResult {
  severity: 'normal' | 'minimal' | 'mild' | 'moderate' | 'severe' | 'very_severe';
  abnormalCriteria: string[];
  sensoryFindings: {
    isAbnormal: boolean;
    details: string[];
  };
  motorFindings: {
    isAbnormal: boolean;
    details: string[];
  };
  axonalDamage: {
    present: boolean;
    details: string[];
  };
  recommendations: string[];
  conclusion: string;
}

export interface NerveMeasurement {
  id: string;
  date: string;
  type: 'motor' | 'sensory';
  nerve: string;
  side: 'left' | 'right';
  distalLatency: number;
  amplitude: number;
  conductionVelocity: number;
  temperature: number;
}

export interface NerveReference {
  name: string;
  latency: { min: number; max: number };
  velocity: { min: number; max: number };
  amplitude: { min: number; max: number };
}

export interface AnalysisResult {
  type: 'axonal' | 'demyelinating' | 'mixed';
  distribution: 'focal' | 'multifocal' | 'diffuse';
  severity: 'mild' | 'moderate' | 'severe';
  suggestedDiagnosis: string[];
  findings: string[];
  recommendations: string[];
  date: string;
  ctsAnalysis?: CTSAnalysisResult;
}

export interface NCSTestResult {
  nerve: string;
  type: 'motor' | 'sensory';
  status: 'normal' | 'abnormal';
  findings: string[];
}

export interface EMGTestResult {
  muscle: string;
  status: 'normal' | 'abnormal';
  findings: string[];
}

export interface DiagnosticResult {
  ncsResults: NCSTestResult[];
  emgResults: EMGTestResult[] | null;
  finalDiagnosis: string;
}

export type DiagnosticMode = 'NCS_ONLY' | 'NCS_EMG'; 