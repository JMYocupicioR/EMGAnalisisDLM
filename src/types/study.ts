export type StudyType = 'emg' | 'ncs' | 'both';

export interface Study {
  id: string;
  type: StudyType;
  date: string;
  patientId: string;
  results: {
    emg?: EMGResults;
    ncs?: NCSResults;
  };
  observations?: string;
  conclusion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EMGResults {
  muscles: {
    name: string;
    insertionalActivity: string;
    spontaneousActivity: string;
    motorUnitActionPotentials: string;
    recruitmentPattern: string;
  }[];
  summary: string;
}

export interface NCSResults {
  nerves: {
    name: string;
    latency: number;
    amplitude: number;
    velocity: number;
    distance: number;
  }[];
  summary: string;
} 