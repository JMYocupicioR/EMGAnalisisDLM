import { EMGResults, EMGInterpretation } from '../types/clinical';
import { diagnosticPatterns } from '../data/diagnosticPatterns';

interface PatternScore {
  id: string;
  score: number;
  matchingCriteria: string[];
}

export class EMGPatternAnalyzer {
  /**
   * Analiza los resultados EMG para identificar patrones diagnósticos específicos
   */
  static analyzeForSpecificPatterns(emgResults: EMGResults): PatternScore[] {
    const patternScores: PatternScore[] = [];
    
    // Evaluar cada patrón diagnóstico definido
    for (const [patternId, pattern] of Object.entries(diagnosticPatterns)) {
      const matchingCriteria: string[] = [];
      let score = 0;
      let totalWeight = 0;
      
      // Evaluar cada criterio del patrón
      for (const finding of pattern.keyFindings) {
        const weight = finding.importance === 'high' ? 3 : 
                      finding.importance === 'medium' ? 2 : 1;
        totalWeight += weight;
        
        // Verificar si el criterio está presente en los resultados EMG
        if (this.findingIsPresent(finding, emgResults)) {
          score += weight;
          matchingCriteria.push(finding.parameter);
        }
      }
      
      // Calcular puntuación final (ponderada)
      const normalizedScore = totalWeight > 0 ? score / totalWeight : 0;
      
      patternScores.push({
        id: patternId,
        score: normalizedScore,
        matchingCriteria
      });
    }
    
    // Ordenar por puntuación descendente
    return patternScores.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Verifica si un hallazgo específico está presente en los resultados EMG
   */
  private static findingIsPresent(finding: any, emgResults: EMGResults): boolean {
    const { parameter, condition } = finding;
    
    // Implementar lógica para verificar diferentes tipos de parámetros
    // Por ejemplo:
    
    // Verificar patrones de actividad espontánea
    if (parameter.includes('fibrillations') || 
        parameter.includes('positiveWaves') || 
        parameter.includes('fasciculations')) {
      return this.evaluateSpontaneousActivity(parameter, condition, emgResults);
    }
    
    // Verificar características de PUMs
    if (parameter.includes('duration') || 
        parameter.includes('amplitude') || 
        parameter.includes('phases')) {
      return this.evaluateMUPs(parameter, condition, emgResults);
    }
    
    // Verificar patrón de reclutamiento
    if (parameter.includes('recruitment')) {
      return this.evaluateRecruitment(parameter, condition, emgResults);
    }
    
    // Verificar latencias y amplitudes en NCS
    if (parameter.includes('latency') || parameter.includes('amplitude')) {
      return this.evaluateNCS(parameter, condition, emgResults);
    }
    
    // Verificar distribución
    if (parameter === 'distribution') {
      return this.evaluateDistribution(condition, emgResults);
    }
    
    // Verificar cronicidad
    if (parameter === 'chronicity') {
      return this.evaluateChronicity(condition, emgResults);
    }
    
    // Para otros parámetros, implementar lógica específica
    return false;
  }
  
  private static evaluateSpontaneousActivity(parameter: string, condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de actividad espontánea
    let matchCount = 0;
    let totalCount = 0;
    
    Object.values(emgResults.muscles).forEach(muscle => {
      totalCount++;
      
      if (parameter.includes('fibrillations') && 
          this.compareValue(muscle.spontaneousActivity.fibrillations, condition)) {
        matchCount++;
      }
      
      if (parameter.includes('positiveWaves') && 
          this.compareValue(muscle.spontaneousActivity.positiveWaves, condition)) {
        matchCount++;
      }
      
      if (parameter.includes('fasciculations') && 
          this.compareValue(muscle.spontaneousActivity.fasciculations, condition)) {
        matchCount++;
      }
    });
    
    // Determinar si hay suficientes coincidencias (e.g., más del 30% de los músculos)
    return matchCount / totalCount >= 0.3;
  }
  
  private static evaluateMUPs(parameter: string, condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de características de PUMs
    let matchCount = 0;
    let totalCount = 0;
    
    Object.values(emgResults.muscles).forEach(muscle => {
      totalCount++;
      
      if (parameter.includes('duration') && 
          this.compareValue(muscle.motorUnitPotentials.duration.value.toString(), condition)) {
        matchCount++;
      }
      
      if (parameter.includes('amplitude') && 
          this.compareValue(muscle.motorUnitPotentials.amplitude.value.toString(), condition)) {
        matchCount++;
      }
      
      if (parameter.includes('phases') && 
          this.compareValue(muscle.motorUnitPotentials.phases.toString(), condition)) {
        matchCount++;
      }
      
      if (parameter.includes('stability') && 
          this.compareValue(muscle.motorUnitPotentials.stability || '', condition)) {
        matchCount++;
      }
    });
    
    // Determinar si hay suficientes coincidencias
    return matchCount / totalCount >= 0.3;
  }
  
  private static evaluateRecruitment(parameter: string, condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de patrón de reclutamiento
    let matchCount = 0;
    let totalCount = 0;
    
    Object.values(emgResults.muscles).forEach(muscle => {
      totalCount++;
      
      if (this.compareValue(muscle.recruitment.pattern, condition)) {
        matchCount++;
      }
    });
    
    // Determinar si hay suficientes coincidencias
    return matchCount / totalCount >= 0.3;
  }
  
  private static evaluateNCS(parameter: string, condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de estudios de conducción nerviosa
    if (!emgResults.ncsResults) return false;
    
    const [nerve, measurement] = parameter.split('.');
    const nerveData = emgResults.ncsResults[nerve];
    
    if (!nerveData) return false;
    
    return this.compareValue(nerveData[measurement].toString(), condition);
  }
  
  private static evaluateDistribution(condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de distribución
    const abnormalMuscles = Object.entries(emgResults.muscles)
      .filter(([_, muscle]) => this.isMuscleAbnormal(muscle))
      .map(([id]) => id);
    
    const totalMuscles = Object.keys(emgResults.muscles).length;
    const abnormalPercentage = abnormalMuscles.length / totalMuscles;
    
    switch (condition) {
      case 'focal':
        return abnormalMuscles.length === 1;
      case 'multifocal':
        return abnormalMuscles.length > 1 && abnormalMuscles.length <= 3;
      case 'diffuse':
        return abnormalPercentage > 0.3 && abnormalPercentage < 0.7;
      case 'generalized':
        return abnormalPercentage >= 0.7;
      case 'proximal':
        return this.isProximalDistribution(abnormalMuscles);
      case 'distal':
        return this.isDistalDistribution(abnormalMuscles);
      default:
        return false;
    }
  }
  
  private static evaluateChronicity(condition: string, emgResults: EMGResults): boolean {
    // Implementar evaluación de cronicidad
    const hasFibrillations = Object.values(emgResults.muscles).some(muscle => 
      muscle.spontaneousActivity.fibrillations === 'present'
    );
    
    const hasChronicChanges = Object.values(emgResults.muscles).some(muscle =>
      muscle.motorUnitPotentials.duration.value > 12 &&
      muscle.motorUnitPotentials.amplitude.value > 6000
    );
    
    switch (condition) {
      case 'acute':
        return hasFibrillations && !hasChronicChanges;
      case 'chronic':
        return !hasFibrillations && hasChronicChanges;
      case 'acute on chronic':
        return hasFibrillations && hasChronicChanges;
      case 'progressive':
        return hasFibrillations && hasChronicChanges;
      default:
        return false;
    }
  }
  
  private static isMuscleAbnormal(muscle: any): boolean {
    return (
      muscle.spontaneousActivity.fibrillations === 'present' ||
      muscle.spontaneousActivity.positiveWaves === 'present' ||
      muscle.motorUnitPotentials.duration.value > 10 ||
      muscle.motorUnitPotentials.amplitude.value > 5000 ||
      muscle.recruitment.pattern === 'reduced'
    );
  }
  
  private static isProximalDistribution(muscleIds: string[]): boolean {
    const proximalMuscles = [
      'deltoid', 'biceps_brachii', 'triceps_brachii',
      'iliopsoas', 'quadriceps', 'hamstrings'
    ];
    
    return muscleIds.every(id => proximalMuscles.includes(id));
  }
  
  private static isDistalDistribution(muscleIds: string[]): boolean {
    const distalMuscles = [
      'abductor_pollicis_brevis', 'first_dorsal_interosseous',
      'abductor_hallucis', 'extensor_digitorum_brevis'
    ];
    
    return muscleIds.every(id => distalMuscles.includes(id));
  }
  
  /**
   * Compara un valor con una condición (e.g., ">10", "<5", "=normal")
   */
  private static compareValue(value: string, condition: string): boolean {
    // Si la condición es una comparación numérica
    if (condition.startsWith('>') || condition.startsWith('<') || condition.startsWith('=')) {
      const operator = condition[0];
      const targetValue = parseFloat(condition.substring(1));
      const actualValue = parseFloat(value);
      
      if (isNaN(actualValue)) return false;
      
      switch (operator) {
        case '>': return actualValue > targetValue;
        case '<': return actualValue < targetValue;
        case '=': return actualValue === targetValue;
        default: return false;
      }
    }
    
    // Si la condición es un valor categórico
    return value === condition || 
           (condition === 'present' && value !== 'absent') ||
           (condition === 'absent' && value === 'absent') ||
           (condition === 'increased' && (value === 'increased' || value === '+2' || value === '+3' || value === '+4')) ||
           (condition === 'decreased' && value === 'decreased');
  }
  
  /**
   * Genera descripción textual de la interpretación de un patrón específico
   */
  static generatePatternDescription(patternId: string, matchingCriteria: string[], severity: string): string {
    const pattern = diagnosticPatterns[patternId];
    if (!pattern) return '';
    
    let description = `Los hallazgos electromiográficos son ${
      matchingCriteria.length > pattern.keyFindings.length / 2 ? 'muy compatibles' : 'sugestivos'
    } con ${pattern.name}, `;
    
    description += `una ${pattern.description}, de ${severity}.`;
    
    return description;
  }
} 