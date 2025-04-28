import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';
import { AnalysisResult, ReportData } from '../types/report';

export class ReportService {
  static analyzeData(data: ClinicalEvaluationFormData): AnalysisResult {
    const analysis: AnalysisResult = {
      category: '',
      subcategory: '',
      confidence: 0,
      findings: [],
      recommendations: []
    };

    // Análisis de debilidad
    if (data.reasonForStudy.weakness.present) {
      analysis.findings.push({
        description: `Debilidad ${data.reasonForStudy.weakness.distribution.join(', ')}`,
        severity: data.reasonForStudy.weakness.severity,
        relevance: 'high'
      });
    }

    // Análisis de parestesias
    if (data.reasonForStudy.paresthesias.present) {
      analysis.findings.push({
        description: `Parestesias: ${data.reasonForStudy.paresthesias.characteristics.join(', ')}`,
        severity: 'moderate',
        relevance: 'high'
      });
    }

    // Análisis de dolor
    if (data.reasonForStudy.pain.present) {
      analysis.findings.push({
        description: `Dolor ${data.reasonForStudy.pain.type.join(', ')}`,
        severity: data.reasonForStudy.pain.intensity > 7 ? 'severe' : data.reasonForStudy.pain.intensity > 4 ? 'moderate' : 'mild',
        relevance: 'high'
      });
    }

    // Análisis de alteraciones sensitivas
    if (data.reasonForStudy.sensory.present) {
      analysis.findings.push({
        description: `Alteraciones sensitivas: ${data.reasonForStudy.sensory.type.join(', ')}`,
        severity: data.reasonForStudy.sensory.severity,
        relevance: 'high'
      });
    }

    // Generar recomendaciones basadas en los hallazgos
    if (analysis.findings.length > 0) {
      analysis.recommendations.push(
        'Realizar estudios electrofisiológicos completos',
        'Considerar estudios de imagen según hallazgos clínicos',
        'Seguimiento clínico en 1 mes'
      );
    }

    // Determinar categoría y subcategoría
    if (data.reasonForStudy.weakness.present && data.reasonForStudy.sensory.present) {
      analysis.category = 'Polineuropatía';
      analysis.subcategory = 'Mixta';
      analysis.confidence = 0.8;
    } else if (data.reasonForStudy.weakness.present) {
      analysis.category = 'Mononeuropatía';
      analysis.subcategory = 'Motora';
      analysis.confidence = 0.7;
    } else if (data.reasonForStudy.sensory.present) {
      analysis.category = 'Mononeuropatía';
      analysis.subcategory = 'Sensitiva';
      analysis.confidence = 0.7;
    }

    return analysis;
  }

  static generateReport(data: ClinicalEvaluationFormData): ReportData {
    const analysis = this.analyzeData(data);
    
    return {
      patientInfo: {
        id: data.patientId,
        name: data.patientData ? `${data.patientData.firstName} ${data.patientData.lastName}` : 'No disponible',
        date: data.date
      },
      evaluationData: data,
      analysis,
      summary: {
        mainFindings: analysis.findings.map(f => f.description),
        diagnosticSuggestions: [
          `${analysis.category} ${analysis.subcategory}`,
          `Confianza diagnóstica: ${(analysis.confidence * 100).toFixed(0)}%`
        ],
        nextSteps: analysis.recommendations
      },
      timestamp: new Date().toISOString()
    };
  }
} 