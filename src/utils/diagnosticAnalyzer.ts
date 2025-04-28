import { 
  NCSTest, 
  EMGTest, 
  Patient, 
  DiagnosticResult 
} from '../types/diagnostic';

export class DiagnosticAnalyzer {
  static canSkipEMG(ncsTests: NCSTest[], patient: Patient): boolean {
    return (
      this.isPureSensoryNeuropathy(ncsTests, patient) ||
      this.isTypicalBilateralPattern(ncsTests) ||
      this.isMildCTS(ncsTests) ||
      this.isFocalNeuropathyWithoutWeakness(ncsTests, patient)
    );
  }

  private static isPureSensoryNeuropathy(ncsTests: NCSTest[], patient: Patient): boolean {
    const hasSensoryAbnormalities = ncsTests
      .filter(test => test.type === 'sensory')
      .some(test => this.isSensoryAbnormal(test));

    const hasMotorInvolvement = patient.physicalExam.muscularStrength.affectedMuscles.length > 0;

    return hasSensoryAbnormalities && !hasMotorInvolvement;
  }

  private static isTypicalBilateralPattern(ncsTests: NCSTest[]): boolean {
    const leftTests = ncsTests.filter(test => test.side === 'left');
    const rightTests = ncsTests.filter(test => test.side === 'right');

    if (leftTests.length !== rightTests.length) return false;

    return leftTests.every(leftTest => {
      const rightTest = rightTests.find(
        right => right.nerve === leftTest.nerve && right.type === leftTest.type
      );
      if (!rightTest) return false;

      return this.areTestResultsSimilar(leftTest, rightTest);
    });
  }

  private static isMildCTS(ncsTests: NCSTest[]): boolean {
    const medianSensory = ncsTests.find(
      test => test.type === 'sensory' && test.nerve === 'median'
    );
    const medianMotor = ncsTests.find(
      test => test.type === 'motor' && test.nerve === 'median'
    );

    if (!medianSensory || !medianMotor) return false;

    // Criterios para STC leve
    const hasSensoryAbnormality = medianSensory.distalLatency > 3.5;
    const hasNormalMotor = medianMotor.distalLatency <= 4.5;
    const hasNormalAmplitude = medianMotor.amplitude >= 4.0;

    return hasSensoryAbnormality && hasNormalMotor && hasNormalAmplitude;
  }

  private static isFocalNeuropathyWithoutWeakness(ncsTests: NCSTest[], patient: Patient): boolean {
    const hasLocalizedNCSAbnormality = this.hasLocalizedNCSAbnormality(ncsTests);
    const hasNoWeakness = patient.physicalExam.muscularStrength.affectedMuscles.length === 0;

    return hasLocalizedNCSAbnormality && hasNoWeakness;
  }

  private static isSensoryAbnormal(test: NCSTest): boolean {
    // Criterios generales para anormalidad sensitiva
    return (
      test.amplitude < 10 || // μV
      test.conductionVelocity < 50 || // m/s
      test.distalLatency > 3.5 // ms
    );
  }

  private static areTestResultsSimilar(test1: NCSTest, test2: NCSTest): boolean {
    const amplitudeDiff = Math.abs(test1.amplitude - test2.amplitude);
    const velocityDiff = Math.abs(test1.conductionVelocity - test2.conductionVelocity);
    const latencyDiff = Math.abs(test1.distalLatency - test2.distalLatency);

    return (
      amplitudeDiff < test1.amplitude * 0.2 && // 20% diferencia máxima
      velocityDiff < 10 && // 10 m/s diferencia máxima
      latencyDiff < 0.5 // 0.5 ms diferencia máxima
    );
  }

  private static hasLocalizedNCSAbnormality(ncsTests: NCSTest[]): boolean {
    const abnormalTests = ncsTests.filter(test => 
      this.isSensoryAbnormal(test) || this.isMotorAbnormal(test)
    );

    if (abnormalTests.length === 0) return false;

    const affectedNerves = new Set(abnormalTests.map(test => test.nerve));
    return affectedNerves.size === 1; // Solo un nervio afectado
  }

  private static isMotorAbnormal(test: NCSTest): boolean {
    return (
      test.amplitude < 4 || // mV
      test.conductionVelocity < 50 || // m/s
      test.distalLatency > 4.5 // ms
    );
  }

  static analyzeResults(ncsTests: NCSTest[], emgTests: EMGTest[] | null): DiagnosticResult {
    const type = this.determineType(ncsTests, emgTests);
    const distribution = this.determineDistribution(ncsTests, emgTests);
    const severity = this.determineSeverity(ncsTests, emgTests);
    
    return {
      type,
      distribution,
      severity,
      suggestedDiagnosis: this.suggestDiagnosis(type, distribution, severity),
      findings: this.generateFindings(ncsTests, emgTests),
      recommendations: this.generateRecommendations(type, severity),
      date: new Date().toISOString()
    };
  }

  private static determineType(ncsTests: NCSTest[], emgTests: EMGTest[] | null): DiagnosticResult['type'] {
    const hasAxonal = this.hasAxonalFeatures(ncsTests, emgTests);
    const hasDemyelinating = this.hasDemyelinatingFeatures(ncsTests);

    if (hasAxonal && hasDemyelinating) return 'mixed';
    if (hasAxonal) return 'axonal';
    return 'demyelinating';
  }

  private static hasAxonalFeatures(ncsTests: NCSTest[], emgTests: EMGTest[] | null): boolean {
    const hasReducedAmplitudes = ncsTests.some(test => 
      (test.type === 'motor' && test.amplitude < 4) ||
      (test.type === 'sensory' && test.amplitude < 10)
    );

    const hasActiveDegeneration = emgTests?.some(test => 
      test.spontaneousPotentials.fibrillations > 0 ||
      test.spontaneousPotentials.positiveWaves > 0
    );

    return hasReducedAmplitudes || !!hasActiveDegeneration;
  }

  private static hasDemyelinatingFeatures(ncsTests: NCSTest[]): boolean {
    return ncsTests.some(test => {
      if (test.type === 'motor') {
        return (
          test.conductionVelocity < 38 || // Reducción significativa de la velocidad
          test.distalLatency > 6.5 || // Latencia distal prolongada
          (test.fWave && test.fWave > 35) // Latencia F prolongada
        );
      }
      return false;
    });
  }

  private static determineDistribution(ncsTests: NCSTest[], emgTests: EMGTest[] | null): DiagnosticResult['distribution'] {
    const affectedNerves = new Set(ncsTests.filter(test => 
      this.isSensoryAbnormal(test) || this.isMotorAbnormal(test)
    ).map(test => test.nerve));

    if (affectedNerves.size === 1) return 'focal';
    if (this.hasSymmetricPattern(ncsTests)) return 'diffuse';
    return 'multifocal';
  }

  private static hasSymmetricPattern(ncsTests: NCSTest[]): boolean {
    const pairedTests = this.getPairedTests(ncsTests);
    return pairedTests.every(pair => this.areTestResultsSimilar(pair[0], pair[1]));
  }

  private static getPairedTests(ncsTests: NCSTest[]): [NCSTest, NCSTest][] {
    const pairs: [NCSTest, NCSTest][] = [];
    const leftTests = ncsTests.filter(test => test.side === 'left');
    
    leftTests.forEach(leftTest => {
      const rightTest = ncsTests.find(test => 
        test.side === 'right' && 
        test.nerve === leftTest.nerve && 
        test.type === leftTest.type
      );
      if (rightTest) {
        pairs.push([leftTest, rightTest]);
      }
    });

    return pairs;
  }

  private static determineSeverity(ncsTests: NCSTest[], emgTests: EMGTest[] | null): DiagnosticResult['severity'] {
    const ncsScore = this.calculateNCSScore(ncsTests);
    const emgScore = emgTests ? this.calculateEMGScore(emgTests) : 0;
    const totalScore = ncsScore + emgScore;

    if (totalScore > 7) return 'severe';
    if (totalScore > 4) return 'moderate';
    return 'mild';
  }

  private static calculateNCSScore(ncsTests: NCSTest[]): number {
    return ncsTests.reduce((score, test) => {
      if (test.type === 'motor') {
        if (test.amplitude < 1) return score + 3;
        if (test.amplitude < 4) return score + 2;
        if (test.conductionVelocity < 38) return score + 2;
      } else {
        if (test.amplitude < 5) return score + 2;
        if (test.amplitude < 10) return score + 1;
      }
      return score;
    }, 0);
  }

  private static calculateEMGScore(emgTests: EMGTest[]): number {
    return emgTests.reduce((score, test) => {
      if (test.spontaneousPotentials.fibrillations > 2) return score + 2;
      if (test.motorUnitPotentials.recruitment === 'absent') return score + 3;
      if (test.motorUnitPotentials.recruitment === 'reduced') return score + 1;
      return score;
    }, 0);
  }

  private static suggestDiagnosis(
    type: DiagnosticResult['type'],
    distribution: DiagnosticResult['distribution'],
    severity: DiagnosticResult['severity']
  ): string[] {
    const suggestions: string[] = [];

    if (distribution === 'focal') {
      suggestions.push('Considerar síndrome de atrapamiento');
      suggestions.push('Evaluar neuropatía por compresión');
    } else if (distribution === 'diffuse' && type === 'demyelinating') {
      suggestions.push('Considerar polineuropatía desmielinizante');
      if (severity === 'severe') {
        suggestions.push('Descartar CIDP');
      }
    } else if (distribution === 'diffuse' && type === 'axonal') {
      suggestions.push('Considerar polineuropatía axonal');
      suggestions.push('Evaluar causas metabólicas (diabetes)');
      suggestions.push('Evaluar causas tóxicas');
    }

    return suggestions;
  }

  private static generateFindings(ncsTests: NCSTest[], emgTests: EMGTest[] | null): string[] {
    const findings: string[] = [];

    // Analizar hallazgos de NCS
    const abnormalNCS = ncsTests.filter(test => 
      this.isSensoryAbnormal(test) || this.isMotorAbnormal(test)
    );

    if (abnormalNCS.length > 0) {
      findings.push('Alteraciones en estudios de conducción nerviosa:');
      abnormalNCS.forEach(test => {
        findings.push(`- ${test.nerve} (${test.type}): ${this.describeAbnormalities(test)}`);
      });
    }

    // Analizar hallazgos de EMG si están disponibles
    if (emgTests && emgTests.length > 0) {
      const abnormalEMG = emgTests.filter(test => 
        test.spontaneousPotentials.fibrillations > 0 ||
        test.spontaneousPotentials.positiveWaves > 0 ||
        test.motorUnitPotentials.recruitment !== 'normal'
      );

      if (abnormalEMG.length > 0) {
        findings.push('\nHallazgos electromiográficos:');
        abnormalEMG.forEach(test => {
          findings.push(`- ${test.muscle}: ${this.describeEMGAbnormalities(test)}`);
        });
      }
    }

    return findings;
  }

  private static describeAbnormalities(test: NCSTest): string {
    const abnormalities: string[] = [];

    if (test.type === 'motor') {
      if (test.amplitude < 4) abnormalities.push('amplitud reducida');
      if (test.conductionVelocity < 50) abnormalities.push('velocidad de conducción disminuida');
      if (test.distalLatency > 4.5) abnormalities.push('latencia distal prolongada');
    } else {
      if (test.amplitude < 10) abnormalities.push('amplitud reducida');
      if (test.conductionVelocity < 50) abnormalities.push('velocidad de conducción disminuida');
      if (test.distalLatency > 3.5) abnormalities.push('latencia distal prolongada');
    }

    return abnormalities.join(', ');
  }

  private static describeEMGAbnormalities(test: EMGTest): string {
    const abnormalities: string[] = [];

    if (test.spontaneousPotentials.fibrillations > 0) {
      abnormalities.push(`fibrilaciones (${test.spontaneousPotentials.fibrillations}/4)`);
    }
    if (test.spontaneousPotentials.positiveWaves > 0) {
      abnormalities.push(`ondas positivas (${test.spontaneousPotentials.positiveWaves}/4)`);
    }
    if (test.motorUnitPotentials.recruitment !== 'normal') {
      abnormalities.push(`reclutamiento ${test.motorUnitPotentials.recruitment}`);
    }

    return abnormalities.join(', ');
  }

  private static generateRecommendations(
    type: DiagnosticResult['type'],
    severity: DiagnosticResult['severity']
  ): string[] {
    const recommendations: string[] = [];

    if (severity === 'severe') {
      recommendations.push('Se recomienda evaluación neurológica urgente');
    }

    switch (type) {
      case 'demyelinating':
        recommendations.push('Considerar estudios de autoinmunidad');
        recommendations.push('Evaluar necesidad de tratamiento inmunomodulador');
        break;
      case 'axonal':
        recommendations.push('Realizar screening metabólico completo');
        recommendations.push('Evaluar exposición a tóxicos');
        break;
      case 'mixed':
        recommendations.push('Se sugiere estudio etiológico completo');
        recommendations.push('Considerar biopsia de nervio si etiología no clara');
        break;
    }

    if (severity !== 'mild') {
      recommendations.push('Seguimiento periódico para monitorizar progresión');
    }

    return recommendations;
  }
}