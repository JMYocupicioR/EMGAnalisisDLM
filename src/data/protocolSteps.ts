import MedianMotorTest from '../components/testSteps/MedianMotorTest';
import MedianSensoryTest from '../components/testSteps/MedianSensoryTest';
import UlnarMotorTest from '../components/testSteps/UlnarMotorTest';
import UlnarSensoryTest from '../components/testSteps/UlnarSensoryTest';
import RadialSensoryTest from '../components/testSteps/RadialSensoryTest';
import CombinedIndexCalculator from '../components/testSteps/CombinedIndexCalculator';
import FResponseTest from '../components/testSteps/FResponseTest';
import EMGTest from '../components/testSteps/EMGTest';
import EMGC6C7Test from '../components/testSteps/EMGC6C7Test';

export const protocolSteps = {
  medianSensory: {
    id: 'medianSensory',
    name: 'Neuroconducción Sensitiva del Nervio Mediano',
    description: 'Evalúa la latencia y amplitud del potencial sensitivo del nervio mediano en el dedo índice',
    component: MedianSensoryTest,
    referenceValues: {
      latency: { min: 2.5, max: 3.5 },
      amplitude: { min: 20, max: 50 }
    }
  },
  medianMotor: {
    id: 'medianMotor',
    name: 'Neuroconducción Motora del Nervio Mediano',
    description: 'Evalúa la latencia distal, amplitud y velocidad de conducción motora en el abductor corto del pulgar',
    component: MedianMotorTest,
    referenceValues: {
      latency: { min: 2.8, max: 4.2 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 49, max: 65 },
      fResponse: { min: 24, max: 31 }
    }
  },
  ulnarMotor: {
    id: 'ulnarMotor',
    name: 'Neuroconducción Motora del Nervio Cubital',
    description: 'Evalúa la latencia distal, amplitud y velocidad de conducción motora en el abductor del dedo meñique',
    component: UlnarMotorTest,
    referenceValues: {
      latency: { min: 2.0, max: 3.6 },
      amplitude: { min: 4.0, max: 20.0 },
      velocity: { min: 49, max: 65 },
      fResponse: { min: 24, max: 31 }
    }
  },
  ulnarSensory: {
    id: 'ulnarSensory',
    name: 'Neuroconducción Sensitiva del Nervio Cubital',
    description: 'Evalúa la latencia y amplitud del potencial sensitivo del nervio cubital en el dedo meñique',
    component: UlnarSensoryTest,
    referenceValues: {
      latency: { min: 2.0, max: 3.0 },
      amplitude: { min: 10, max: 50 }
    }
  },
  radialSensory: {
    id: 'radialSensory',
    name: 'Neuroconducción Sensitiva del Nervio Radial',
    description: 'Evalúa la latencia y amplitud del potencial sensitivo del nervio radial en la tabaquera anatómica',
    component: RadialSensoryTest,
    referenceValues: {
      latency: { min: 2.0, max: 3.0 },
      amplitude: { min: 15, max: 60 }
    }
  },
  combinedIndex: {
    id: 'combinedIndex',
    name: 'Índice Sensorial Combinado (Robinson)',
    description: 'Calcula el índice sensorial combinado: PALMDIFF + RINGDIFF + THUMBDIFF',
    component: CombinedIndexCalculator,
    referenceValues: {
      combinedIndex: { max: 0.9 }
    }
  },
  fResponses: {
    id: 'fResponses',
    name: 'Respuestas F Mediano/Cubital',
    description: 'Evalúa y compara las respuestas F de los nervios mediano y cubital',
    component: FResponseTest,
    referenceValues: {
      fResponseDiff: { max: 2.0 }
    }
  },
  emgAbductor: {
    id: 'emgAbductor',
    name: 'EMG Abductor Corto del Pulgar',
    description: 'Electomiografía del abductor corto del pulgar para evaluar lesión axonal motora',
    component: EMGTest,
    isOptional: true,
    condition: 'medianMotor.amplitude < 4.0'
  },
  emgC6C7: {
    id: 'emgC6C7',
    name: 'EMG músculos C6-C7',
    description: 'Electomiografía de dos músculos inervados por C6-C7 para excluir radiculopatía cervical',
    component: EMGC6C7Test,
    isOptional: true,
    condition: 'abnormalFindings > 0'
  }
};