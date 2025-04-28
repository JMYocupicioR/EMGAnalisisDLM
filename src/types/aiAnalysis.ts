// src/types/aiAnalysis.ts

export type AIAnalysisType = 'emg' | 'nerve_conduction' | 'general' | 'diagnostic';

export interface AIAnalysis {
  id: string;
  studyId: string;
  patientId?: string;
  type: AIAnalysisType;
  content: string;
  createdAt: string;
  updatedAt: string;
  modelInfo?: {
    model: string;
    version?: string;
    parameters?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface AIModelConfiguration {
  apiKey?: string;
  model: string;
  version?: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  additionalParams?: Record<string, any>;
}

export interface AIAnalysisRequest {
  studyData: any;
  patientData?: any;
  modelConfig?: Partial<AIModelConfiguration>;
  options?: {
    saveToDashboard?: boolean;
    includeInReport?: boolean;
    detailLevel?: 'basic' | 'intermediate' | 'detailed';
    languageStyle?: 'technical' | 'simplified' | 'patient-friendly';
  };
}

export interface AIAnalysisResult {
  analysis: AIAnalysis;
  success: boolean;
  errorMessage?: string;
  processedData?: any;
}