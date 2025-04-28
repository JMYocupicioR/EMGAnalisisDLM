// src/utils/analysis.ts

import type { 
  NerveMeasurement, 
  AnalysisResult, 
  NerveReference, 
  CTSTest, 
  CTSAnalysisResult,
  NCSTest,
  EMGTest
} from '../types/diagnostic';
import { analyzeCTS } from './ctsAnalyzer';

// Valores de referencia para cada nervio
export const nerveReferences: Record<string, NerveReference> = {
  median: {
    name: 'Median Nerve',
    latency: { min: 2.5, max: 4.5 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 4.0, max: 20.0 }
  },
  ulnar: {
    name: 'Ulnar Nerve',
    latency: { min: 2.0, max: 4.0 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 4.0, max: 20.0 }
  },
  peroneal: {
    name: 'Peroneal Nerve',
    latency: { min: 3.0, max: 5.5 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 2.0, max: 10.0 }
  },
  tibial: {
    name: 'Tibial Nerve',
    latency: { min: 3.5, max: 6.0 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 3.0, max: 15.0 }
  },
  sural: {
    name: 'Sural Nerve',
    latency: { min: 2.5, max: 4.0 },
    velocity: { min: 40, max: 60 },
    amplitude: { min: 10.0, max: 50.0 }
  },
  radial: {
    name: 'Radial Nerve',
    latency: { min: 2.5, max: 4.5 },
    velocity: { min: 45, max: 65 },
    amplitude: { min: 5.0, max: 25.0 }
  }
};

/**
 * Analiza un parámetro específico de la neuroconducción y genera un mensaje interpretativo
 */
function analyzeParameter(
  parameter: keyof NerveMeasurement,
  value: number,
  referenceRange: { min: number; max: number }
): { message: string; abnormal: boolean } {
  switch (parameter) {
    case 'latency':
      if (value > referenceRange.max) {
        return { 
          message: `Latencia prolongada (${value} ms): posible neuropatía desmielinizante.`, 
          abnormal: true 
        };
      } else if (value < referenceRange.min) {
        return { 
          message: `Latencia reducida (${value} ms): hallazgo inusual, posible hiperexcitabilidad.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Latencia normal (${value} ms).`, 
          abnormal: false 
        };
      }
    case 'velocity':
      if (value < referenceRange.min) {
        return { 
          message: `Velocidad reducida (${value} m/s): indicativo de neuropatía desmielinizante.`, 
          abnormal: true 
        };
      } else if (value > referenceRange.max) {
        return { 
          message: `Velocidad aumentada (${value} m/s): hallazgo inusual.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Velocidad de conducción normal (${value} m/s).`, 
          abnormal: false 
        };
      }
    case 'amplitude':
      if (value < referenceRange.min) {
        return { 
          message: `Amplitud reducida (${value} mV): posible neuropatía axonal o bloqueo de conducción.`, 
          abnormal: true 
        };
      } else if (value > referenceRange.max) {
        return { 
          message: `Amplitud aumentada (${value} mV): posible síndrome de hiperexcitabilidad.`, 
          abnormal: true 
        };
      } else {
        return { 
          message: `Amplitud normal (${value} mV).`, 
          abnormal: false 
        };
      }
    default:
      return { message: 'Parámetro desconocido.', abnormal: false };
  }
}

interface NCSTestResult {
  nerve: string;
  type: 'motor' | 'sensory';
  status: 'normal' | 'abnormal';
  findings: string[];
}

interface EMGTestResult {
  muscle: string;
  status: 'normal' | 'abnormal';
  findings: string[];
}

interface DiagnosticResult {
  ncsResults: NCSTestResult[];
  emgResults: EMGTestResult[] | null;
  finalDiagnosis: string;
}

export function analyzeNerveConduction(nerve: string, test: NCSTest): NCSTestResult {
  const result: NCSTestResult = {
    nerve,
    type: test.type,
    status: 'normal',
    findings: []
  };

  // Análisis de latencia
  if (test.measurements.latency > 4.0) {
    result.status = 'abnormal';
    result.findings.push('Latencia prolongada');
  }

  // Análisis de amplitud
  if (test.type === 'motor' && test.measurements.amplitude < 4.0) {
    result.status = 'abnormal';
    result.findings.push('Amplitud reducida (posible desmielinización)');
  } else if (test.type === 'sensory' && test.measurements.amplitude < 10) {
    result.status = 'abnormal';
    result.findings.push('Amplitud reducida (posible axonal)');
  }

  // Análisis de velocidad de conducción
  if (test.measurements.velocity < 40) {
    result.status = 'abnormal';
    result.findings.push('Velocidad de conducción reducida');
  }

  return result;
}

export function analyzeEMGResults(emgTests: EMGTest[]): EMGTestResult[] {
  return emgTests.map(test => {
    const result: EMGTestResult = {
      muscle: test.muscle,
      status: 'normal',
      findings: []
    };

    // Análisis de actividad espontánea
    if (test.spontaneousPotentials.fibrillations > 0 || 
        test.spontaneousPotentials.positiveWaves > 0) {
      result.status = 'abnormal';
      result.findings.push('Actividad espontánea anormal presente');
    }

    // Análisis de reclutamiento
    if (test.motorUnitPotentials.recruitment === 'reduced') {
      result.status = 'abnormal';
      result.findings.push('Reclutamiento reducido');
    } else if (test.motorUnitPotentials.recruitment === 'early') {
      result.status = 'abnormal';
      result.findings.push('Reclutamiento precoz');
    }

    return result;
  });
}

export function generateFinalDiagnosis(ncsResults: NCSTestResult[], emgResults: EMGTestResult[] | null): string {
  const abnormalNCS = ncsResults.filter(result => result.status === 'abnormal');
  const abnormalEMG = emgResults?.filter(result => result.status === 'abnormal') || [];

  if (abnormalNCS.length === 0 && abnormalEMG.length === 0) {
    return 'Estudios electrofisiológicos normales';
  }

  const findings: string[] = [];

  // Análisis de patrones NCS
  const demyelinatingPattern = abnormalNCS.some(result => 
    result.findings.includes('Velocidad de conducción reducida') ||
    result.findings.includes('Latencia prolongada')
  );

  const axonalPattern = abnormalNCS.some(result => 
    result.findings.includes('Amplitud reducida')
  );

  if (demyelinatingPattern) {
    findings.push('Patrón desmielinizante');
  }
  if (axonalPattern) {
    findings.push('Patrón axonal');
  }

  // Análisis de patrones EMG
  if (abnormalEMG.length > 0) {
    findings.push('Compromiso muscular');
  }

  return `Estudios electrofisiológicos anormales: ${findings.join(', ')}`;
}

export function canSkipEMG(ncsTests: NCSTest[], patient: any): boolean {
  if (!ncsTests || ncsTests.length === 0) return false;

  const normalTests = ncsTests.filter(test => {
    const result = analyzeNerveConduction(test.nerve, test);
    return result.status === 'normal';
  });

  return normalTests.length === ncsTests.length;
}