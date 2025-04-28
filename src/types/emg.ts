export interface EMGResults {
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: boolean;
    positiveWaves: boolean;
    fasciculations: boolean;
  };
  motorUnitPotentials: {
    duration: number;
    amplitude: number;
    polyphasia: number;
  };
  recruitmentPattern: 'normal' | 'reduced' | 'early';
}

export interface NerveData {
  id: string;
  name: string;
  referenceValues: {
    latency: {
      min: number;
      max: number;
    };
    amplitude: {
      min: number;
      max: number;
    };
    velocity: {
      min: number;
      max: number;
    };
  };
}

export interface FWaveData {
  latency: number;
  persistence: number;
  chronodispersion: number;
}

export interface NCSResults {
  motorNerves: {
    [key: string]: {
      right: NerveData;
      left: NerveData;
    };
  };
  sensoryNerves: {
    [key: string]: {
      right: NerveData;
      left: NerveData;
    };
  };
  fWaves: {
    [key: string]: {
      right: FWaveData;
      left: FWaveData;
    };
  };
} 