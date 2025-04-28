import { ClinicalEvaluationFormData } from './clinicalEvaluation';

export interface AnalysisResult {
  category: string;
  subcategory: string;
  confidence: number;
  findings: {
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    relevance: 'high' | 'medium' | 'low';
  }[];
  recommendations: string[];
}

export interface ReportData {
  patientInfo: {
    id: string;
    name: string;
    date: string;
  };
  evaluationData: ClinicalEvaluationFormData;
  analysis: AnalysisResult;
  summary: {
    mainFindings: string[];
    diagnosticSuggestions: string[];
    nextSteps: string[];
  };
  timestamp: string;
} 
