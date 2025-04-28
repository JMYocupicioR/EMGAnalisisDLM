import { ClinicalEvaluation, NCSResults, EMGResults, DiagnosticCriteria, IntegratedDiagnosis } from '../types/clinical';
import { clinicalEvaluationSchema, ncsResultsSchema, emgResultsSchema, diagnosticCriteriaSchema, integratedDiagnosisSchema } from '../schemas/clinical';

export class ClinicalService {
  static validateClinicalEvaluation(data: ClinicalEvaluation) {
    // Validar datos básicos
    if (!data.preliminaryDiagnosis) {
      throw new Error('El diagnóstico preliminar es requerido');
    }

    // Validar datos del examen físico
    if (data.clinicalFindings) {
      const { muscleTone, muscleStrength, reflexes, coordination, gait } = data.clinicalFindings;

      // Validar tono muscular
      if (!muscleTone || !['normal', 'increased', 'decreased'].includes(muscleTone.status)) {
        throw new Error('Estado del tono muscular inválido');
      }

      // Validar fuerza muscular
      if (muscleStrength && muscleStrength.affectedMuscles) {
        for (const muscle of muscleStrength.affectedMuscles) {
          if (muscle.mrcGrade < 0 || muscle.mrcGrade > 5) {
            throw new Error(`Grado MRC inválido para el músculo ${muscle.muscle}`);
          }
        }
      }

      // Validar reflejos
      if (reflexes) {
        const validReflexValues = ['normal', 'increased', 'decreased', 'absent'];
        for (const [reflex, value] of Object.entries(reflexes)) {
          if (!validReflexValues.includes(value)) {
            throw new Error(`Valor inválido para el reflejo ${reflex}`);
          }
        }
      }

      // Validar coordinación
      if (coordination) {
        const validCoordinationValues = ['normal', 'abnormal'];
        for (const [test, value] of Object.entries(coordination)) {
          if (!validCoordinationValues.includes(value)) {
            throw new Error(`Valor inválido para la prueba de coordinación ${test}`);
          }
        }
      }

      // Validar marcha
      if (gait) {
        if (!['normal', 'abnormal'].includes(gait.pattern)) {
          throw new Error('Patrón de marcha inválido');
        }
      }
    }
  }

  static validateNCSResults(data: NCSResults) {
    return ncsResultsSchema.parse(data);
  }

  static validateEMGResults(data: EMGResults): void {
    if (!data.insertionalActivity) {
      throw new Error('La actividad de inserción es requerida');
    }

    if (!data.recruitmentPattern) {
      throw new Error('El patrón de reclutamiento es requerido');
    }

    if (data.motorUnitPotentials.amplitude < 0) {
      throw new Error('La amplitud no puede ser negativa');
    }

    if (data.motorUnitPotentials.duration < 0) {
      throw new Error('La duración no puede ser negativa');
    }

    if (data.motorUnitPotentials.polyphasia < 0 || data.motorUnitPotentials.polyphasia > 100) {
      throw new Error('La polifasia debe estar entre 0 y 100%');
    }
  }

  static evaluateDiagnosticCriteria(clinicalData: ClinicalEvaluation): DiagnosticCriteria {
    const criteria: DiagnosticCriteria = {
      canSkipEMG: false,
      reasons: [],
      requiresEMG: false,
      emgReasons: []
    };

    // Criterios para saltar EMG
    if (this.isPureSensoryNeuropathy(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Neuropatía sensitiva pura sin debilidad');
    }

    if (this.isTypicalBilateralPattern(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Patrón típico bilateral de polineuropatía distal simétrica');
    }

    if (this.isMildModerateCTS(clinicalData)) {
      criteria.canSkipEMG = true;
      criteria.reasons.push('Síndrome del túnel del carpo leve/moderado sin datos axonales');
    }

    // Criterios que requieren EMG
    if (this.hasMuscleWeakness(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Presencia de debilidad muscular');
    }

    if (this.suspectedRadiculopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de radiculopatía');
    }

    if (this.suspectedPlexopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de plexopatía');
    }

    if (this.suspectedMyopathy(clinicalData)) {
      criteria.requiresEMG = true;
      criteria.emgReasons.push('Sospecha de miopatía');
    }

    return criteria;
  }

  private static isPureSensoryNeuropathy(data: ClinicalEvaluation): boolean {
    return (
      data.reasonForStudy.sensory.present &&
      !data.reasonForStudy.weakness.present &&
      data.clinicalFindings.muscleStrength.affectedMuscles.length === 0
    );
  }

  private static isTypicalBilateralPattern(data: ClinicalEvaluation): boolean {
    const { weakness, sensory } = data.reasonForStudy;
    return (
      (weakness.present || sensory.present) &&
      weakness.distribution.every(d => d.includes('distal')) &&
      sensory.distribution.every(d => d.includes('distal'))
    );
  }

  private static isMildModerateCTS(data: ClinicalEvaluation): boolean {
    return (
      data.preliminaryDiagnosis.toLowerCase().includes('síndrome del túnel del carpo') &&
      !data.reasonForStudy.weakness.present &&
      data.clinicalFindings.muscleStrength.affectedMuscles.length === 0
    );
  }

  private static hasMuscleWeakness(data: ClinicalEvaluation): boolean {
    return (
      data.reasonForStudy.weakness.present ||
      data.clinicalFindings.muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5)
    );
  }

  private static suspectedRadiculopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength, reflexes } = data.clinicalFindings;
    return (
      muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5) &&
      Object.values(reflexes).some(r => r !== 'normal')
    );
  }

  private static suspectedPlexopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength } = data.clinicalFindings;
    const affectedMuscles = muscleStrength.affectedMuscles;
    
    // Verificar si hay debilidad en músculos inervados por diferentes raíces
    const muscleRoots = new Set();
    affectedMuscles.forEach(m => {
      const muscleData = muscleDatabase.find(md => md.name === m.muscle);
      if (muscleData) {
        muscleData.associatedRoots.forEach(root => muscleRoots.add(root));
      }
    });

    return muscleRoots.size > 1;
  }

  private static suspectedMyopathy(data: ClinicalEvaluation): boolean {
    const { muscleStrength, reflexes } = data.clinicalFindings;
    return (
      muscleStrength.affectedMuscles.some(m => m.mrcGrade < 5) &&
      Object.values(reflexes).every(r => r === 'normal')
    );
  }

  static generateIntegratedDiagnosis(
    clinicalData: ClinicalEvaluation,
    ncsData: NCSResults,
    emgData?: EMGResults
  ): IntegratedDiagnosis {
    const diagnosis: IntegratedDiagnosis = {
      clinicalCorrelation: '',
      lesionType: 'mixed',
      pathologyType: 'mixed',
      severity: 'moderate',
      chronicity: 'chronic',
      distribution: [],
      finalDiagnosis: '',
      recommendations: []
    };

    // Análisis de tipo de lesión
    if (this.isAxonalInjury(ncsData)) {
      diagnosis.lesionType = 'axonal';
    } else if (this.isDemyelinatingInjury(ncsData)) {
      diagnosis.lesionType = 'demyelinating';
    }

    // Análisis de tipo de patología
    if (emgData) {
      if (this.isNeuropathicPattern(emgData)) {
        diagnosis.pathologyType = 'neuropathic';
      } else if (this.isMyopathicPattern(emgData)) {
        diagnosis.pathologyType = 'myopathic';
      }
    }

    // Determinar severidad
    diagnosis.severity = this.determineSeverity(clinicalData, ncsData, emgData);

    // Determinar cronicidad
    diagnosis.chronicity = this.determineChronicity(clinicalData);

    // Generar diagnóstico final
    diagnosis.finalDiagnosis = this.generateFinalDiagnosis(diagnosis);

    // Generar recomendaciones
    diagnosis.recommendations = this.generateRecommendations(diagnosis);

    return diagnosis;
  }

  private static isAxonalInjury(ncsData: NCSResults): boolean {
    return (
      ncsData.motor.amplitude < 50 ||
      ncsData.sensory.amplitude < 10
    );
  }

  private static isDemyelinatingInjury(ncsData: NCSResults): boolean {
    return (
      ncsData.motor.conductionVelocity < 40 ||
      ncsData.sensory.conductionVelocity < 40
    );
  }

  private static isNeuropathicPattern(emgData: EMGResults): boolean {
    return (
      emgData.spontaneousActivity.fibrillations ||
      emgData.spontaneousActivity.positiveWaves ||
      emgData.motorUnitPotentials.amplitude > 1000
    );
  }

  private static isMyopathicPattern(emgData: EMGResults): boolean {
    return (
      emgData.motorUnitPotentials.amplitude < 500 &&
      emgData.motorUnitPotentials.duration < 5 &&
      emgData.motorUnitPotentials.polyphasia > 20
    );
  }

  private static determineSeverity(
    clinicalData: ClinicalEvaluation,
    ncsData: NCSResults,
    emgData?: EMGResults
  ): 'mild' | 'moderate' | 'severe' {
    // Implementar lógica de severidad basada en datos clínicos y electrofisiológicos
    return 'moderate';
  }

  private static determineChronicity(
    clinicalData: ClinicalEvaluation
  ): 'acute' | 'subacute' | 'chronic' {
    // Implementar lógica de cronicidad basada en datos clínicos
    return 'chronic';
  }

  private static generateFinalDiagnosis(diagnosis: IntegratedDiagnosis): string {
    // Implementar lógica para generar diagnóstico final
    return 'Diagnóstico pendiente';
  }

  private static generateRecommendations(diagnosis: IntegratedDiagnosis): string[] {
    // Implementar lógica para generar recomendaciones
    return ['Seguimiento clínico', 'Estudios complementarios según evolución'];
  }
} 