import { CTSTest, CTSAnalysisResult } from '../types/diagnostic';

const THRESHOLDS = {
  SENSORY: {
    PEAK_LATENCY: 3.5, // ms
    LATENCY_DIFFERENCE: 0.4, // ms
    PALM_WRIST_LATENCY: 2.2, // ms
    CONDUCTION_VELOCITY: 49, // m/s
  },
  MOTOR: {
    DISTAL_LATENCY: 4.2, // ms
    LUMBRICAL_INTEROSSEI_DIFF: 0.5, // ms
  },
  AMPLITUDE: {
    SNAP_REDUCTION: 50, // % reduction from normal
    CMAP_REDUCTION: 50, // % reduction from normal
  }
};

function analyzeSensoryFindings(test: CTSTest) {
  const findings: string[] = [];
  let isAbnormal = false;

  // Check D2/D3 peak latency
  if (test.sensoryMedian.latencyD2 > THRESHOLDS.SENSORY.PEAK_LATENCY) {
    findings.push(`Latencia pico D2 prolongada (${test.sensoryMedian.latencyD2.toFixed(1)} ms)`);
    isAbnormal = true;
  }
  if (test.sensoryMedian.latencyD3 > THRESHOLDS.SENSORY.PEAK_LATENCY) {
    findings.push(`Latencia pico D3 prolongada (${test.sensoryMedian.latencyD3.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  // Compare D4 latencies (median vs ulnar)
  const d4Difference = test.sensoryMedian.latencyD4 - test.sensoryUlnar.latencyD4;
  if (d4Difference > THRESHOLDS.SENSORY.LATENCY_DIFFERENCE) {
    findings.push(`Diferencia de latencia D4 mediano-cubital anormal (${d4Difference.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  // Compare D1 latencies (median vs radial)
  const d1Difference = test.sensoryMedian.latencyD1 - test.sensoryRadial.latencyD1;
  if (d1Difference > THRESHOLDS.SENSORY.LATENCY_DIFFERENCE) {
    findings.push(`Diferencia de latencia D1 mediano-radial anormal (${d1Difference.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  // Check palm-to-wrist latency
  if (test.sensoryMedian.palmLatency > THRESHOLDS.SENSORY.PALM_WRIST_LATENCY) {
    findings.push(`Latencia palma-muñeca prolongada (${test.sensoryMedian.palmLatency.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  // Check conduction velocity
  if (test.sensoryMedian.conductionVelocity < THRESHOLDS.SENSORY.CONDUCTION_VELOCITY) {
    findings.push(`Velocidad de conducción sensitiva reducida (${test.sensoryMedian.conductionVelocity.toFixed(1)} m/s)`);
    isAbnormal = true;
  }

  return { isAbnormal, findings };
}

function analyzeMotorFindings(test: CTSTest) {
  const findings: string[] = [];
  let isAbnormal = false;

  // Check motor distal latency
  if (test.motorMedian.distalLatency > THRESHOLDS.MOTOR.DISTAL_LATENCY) {
    findings.push(`Latencia motora distal prolongada (${test.motorMedian.distalLatency.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  // Compare lumbrical vs interossei latencies
  const lumbricalDiff = test.motorMedian.lumbricalLatency - test.motorUlnar.interosseousLatency;
  if (lumbricalDiff > THRESHOLDS.MOTOR.LUMBRICAL_INTEROSSEI_DIFF) {
    findings.push(`Diferencia lumbrical-interóseo anormal (${lumbricalDiff.toFixed(1)} ms)`);
    isAbnormal = true;
  }

  return { isAbnormal, findings };
}

function checkAxonalDamage(test: CTSTest) {
  const findings: string[] = [];
  let present = false;

  // Check for severely reduced or absent SNAP
  if (test.sensoryMedian.amplitude < 2.0) {
    findings.push(`SNAP del mediano severamente reducido (${test.sensoryMedian.amplitude.toFixed(1)} μV)`);
    present = true;
  }

  // Check for severely reduced or absent CMAP
  if (test.motorMedian.amplitude < 4.0) {
    findings.push(`CMAP del mediano reducido (${test.motorMedian.amplitude.toFixed(1)} mV)`);
    present = true;
  }

  // Check EMG findings if available
  if (test.emgAPB) {
    const { fibrillations, positiveWaves } = test.emgAPB;
    if (fibrillations > 0 || positiveWaves > 0) {
      findings.push(`Signos de denervación en APB (Fibrilaciones: ${fibrillations}/4, Ondas positivas: ${positiveWaves}/4)`);
      present = true;
    }
  }

  return { present, findings };
}

function determineSeverity(test: CTSTest, sensoryAbnormal: boolean, motorAbnormal: boolean, axonalDamage: boolean): CTSAnalysisResult['severity'] {
  if (!sensoryAbnormal && !motorAbnormal) return 'normal';
  
  if (test.emgAPB && test.sensoryMedian.amplitude === 0 && test.motorMedian.amplitude === 0 &&
      (test.emgAPB.fibrillations > 0 || test.emgAPB.positiveWaves > 0)) {
    return 'very_severe';
  }
  
  if (test.sensoryMedian.amplitude === 0 && test.motorMedian.distalLatency > THRESHOLDS.MOTOR.DISTAL_LATENCY) {
    return 'severe';
  }
  
  if (sensoryAbnormal && motorAbnormal) return 'moderate';
  
  if (sensoryAbnormal && !motorAbnormal) return 'mild';
  
  return 'minimal';
}

function generateRecommendations(severity: CTSAnalysisResult['severity']): string[] {
  const recommendations: string[] = [];
  
  switch (severity) {
    case 'normal':
      recommendations.push('No se requieren medidas específicas para STC.');
      break;
    case 'minimal':
    case 'mild':
      recommendations.push('Se sugiere tratamiento conservador:');
      recommendations.push('- Férula nocturna');
      recommendations.push('- Modificación de actividades');
      recommendations.push('- Considerar terapia física');
      break;
    case 'moderate':
      recommendations.push('Se sugiere:');
      recommendations.push('- Tratamiento conservador agresivo');
      recommendations.push('- Considerar infiltración local con corticoides');
      recommendations.push('- Valoración por cirugía si no hay mejoría en 6-8 semanas');
      break;
    case 'severe':
    case 'very_severe':
      recommendations.push('Se recomienda:');
      recommendations.push('- Evaluación quirúrgica prioritaria');
      recommendations.push('- Liberación del túnel carpiano');
      recommendations.push('- Seguimiento post-quirúrgico con rehabilitación');
      break;
  }
  
  return recommendations;
}

export function analyzeCTS(test: CTSTest): CTSAnalysisResult {
  // Analyze each component
  const sensoryResults = analyzeSensoryFindings(test);
  const motorResults = analyzeMotorFindings(test);
  const axonalResults = checkAxonalDamage(test);
  
  // Determine severity
  const severity = determineSeverity(
    test,
    sensoryResults.isAbnormal,
    motorResults.isAbnormal,
    axonalResults.present
  );
  
  // Generate recommendations
  const recommendations = generateRecommendations(severity);
  
  // Count abnormal criteria
  const abnormalCriteria: string[] = [];
  if (sensoryResults.isAbnormal) {
    abnormalCriteria.push('Alteraciones sensitivas');
  }
  if (motorResults.isAbnormal) {
    abnormalCriteria.push('Alteraciones motoras');
  }
  if (axonalResults.present) {
    abnormalCriteria.push('Daño axonal');
  }
  
  // Generate conclusion
  let conclusion = '';
  if (abnormalCriteria.length >= 2) {
    conclusion = `Hallazgos electrofisiológicos compatibles con Síndrome del Túnel Carpiano de grado ${severity}. `;
    if (axonalResults.present) {
      conclusion += 'Se evidencia daño axonal. ';
    }
  } else if (abnormalCriteria.length === 1) {
    conclusion = `Hallazgos sugestivos de Síndrome del Túnel Carpiano incipiente. Se recomienda correlación clínica. `;
  } else {
    conclusion = 'No se encuentran alteraciones electrofisiológicas significativas que sugieran Síndrome del Túnel Carpiano. ';
  }
  
  return {
    severity,
    abnormalCriteria,
    sensoryFindings: {
      isAbnormal: sensoryResults.isAbnormal,
      details: sensoryResults.findings
    },
    motorFindings: {
      isAbnormal: motorResults.isAbnormal,
      details: motorResults.findings
    },
    axonalDamage: {
      present: axonalResults.present,
      details: axonalResults.findings
    },
    recommendations,
    conclusion
  };
} 