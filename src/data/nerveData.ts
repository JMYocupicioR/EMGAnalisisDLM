import { NerveData } from '../types/emg';

export const nerveDatabase: NerveData[] = [
  {
    id: 'median_motor',
    name: 'Mediano Motor',
    referenceValues: {
      latency: { min: 2.5, max: 4.2 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 48, max: 60 }
    }
  },
  {
    id: 'ulnar_motor',
    name: 'Cubital Motor',
    referenceValues: {
      latency: { min: 2.5, max: 4.2 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 48, max: 60 }
    }
  },
  {
    id: 'peroneal',
    name: 'Peroneo',
    referenceValues: {
      latency: { min: 3.0, max: 5.0 },
      amplitude: { min: 2.0, max: 10.0 },
      velocity: { min: 40, max: 55 }
    }
  },
  {
    id: 'tibial',
    name: 'Tibial',
    referenceValues: {
      latency: { min: 3.0, max: 5.0 },
      amplitude: { min: 2.0, max: 10.0 },
      velocity: { min: 40, max: 55 }
    }
  },
  {
    id: 'median_sensory',
    name: 'Mediano Sensitivo',
    referenceValues: {
      latency: { min: 1.5, max: 3.0 },
      amplitude: { min: 10.0, max: 50.0 },
      velocity: { min: 50, max: 65 }
    }
  },
  {
    id: 'ulnar_sensory',
    name: 'Cubital Sensitivo',
    referenceValues: {
      latency: { min: 1.5, max: 3.0 },
      amplitude: { min: 10.0, max: 50.0 },
      velocity: { min: 50, max: 65 }
    }
  },
  {
    id: 'sural',
    name: 'Sural',
    referenceValues: {
      latency: { min: 2.0, max: 4.0 },
      amplitude: { min: 5.0, max: 30.0 },
      velocity: { min: 40, max: 55 }
    }
  }
]; 