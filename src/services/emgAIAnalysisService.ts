// src/services/emgAIAnalysisService.ts
import { Study } from '../types';
import { AIAnalysis, AIAnalysisRequest, AIAnalysisResult } from '../types/aiAnalysis';
import { saveAIAnalysis, getLatestAIAnalysisForStudy, deleteAIAnalysesForStudy } from './aiAnalysisStorageService';

// Configuración para la API de OpenAI
const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

// Configuración por defecto del modelo
const DEFAULT_MODEL_CONFIG = {
  model: 'gpt-4-turbo',
  temperature: 0.2,
  maxTokens: 1500
};

/**
 * Solicita un análisis especializado de electromiografía usando IA
 */
export async function getEMGAnalysis(
  emgData: any, 
  patientData: { 
    age?: number; 
    gender?: string; 
    muscleType?: string; 
    fitnessLevel?: string;
    medicalHistory?: string;
  },
  options?: {
    saveAnalysis?: boolean;
    patientId?: string;
    modelOverrides?: Partial<typeof DEFAULT_MODEL_CONFIG>;
  }
): Promise<string> {
  try {
    // Si no hay clave API configurada, mostrar mensaje instructivo
    if (!API_KEY) {
      return "Para usar el análisis de IA, configure su clave API en las variables de entorno.";
    }
    
    // Preparar el prompt especializado en EMG
    const prompt = prepareEMGPrompt(emgData, patientData);
    
    // Realizar la solicitud a la API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: options?.modelOverrides?.model || DEFAULT_MODEL_CONFIG.model,
        messages: [
          {
            role: "system",
            content: `Eres un neurofisiólogo especializado en electromiografía con más de 20 años de experiencia clínica. Tu tarea es analizar datos de EMG y proporcionar una interpretación médica profesional y detallada siguiendo estándares clínicos.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options?.modelOverrides?.temperature || DEFAULT_MODEL_CONFIG.temperature,
        max_tokens: options?.modelOverrides?.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al conectar con la API de IA');
    }
    
    const analysisContent = data.choices[0].message.content;
    
    // Si se solicita guardar el análisis
    if (options?.saveAnalysis && emgData.id) {
      const aiAnalysis: Partial<AIAnalysis> = {
        studyId: emgData.id,
        patientId: options.patientId,
        type: 'emg',
        content: analysisContent,
        modelInfo: {
          model: options?.modelOverrides?.model || DEFAULT_MODEL_CONFIG.model,
          version: '1.0',
          parameters: {
            temperature: options?.modelOverrides?.temperature || DEFAULT_MODEL_CONFIG.temperature,
            maxTokens: options?.modelOverrides?.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens
          }
        },
        metadata: {
          dataType: 'emg',
          promptLength: prompt.length,
          responseLength: analysisContent.length,
          timestamp: new Date().toISOString()
        }
      };
      
      saveAIAnalysis(aiAnalysis);
    }
    
    return analysisContent;
  } catch (error) {
    console.error('Error en análisis EMG por IA:', error);
    return `Error al realizar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
}

/**
 * Analiza datos de EMG mediante IA para una solicitud estructurada
 */
export async function analyzeEMGData(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  try {
    const studyId = typeof request.studyData.id === 'string' ? request.studyData.id : 
                   (request.studyData.studyId || crypto.randomUUID());
    
    // Preparar el prompt según el tipo de dato
    const prompt = prepareEMGPrompt(request.studyData, request.patientData || {});
    
    // Configurar parámetros del modelo
    const modelConfig = {
      model: request.modelConfig?.model || DEFAULT_MODEL_CONFIG.model,
      temperature: request.modelConfig?.temperature || DEFAULT_MODEL_CONFIG.temperature,
      maxTokens: request.modelConfig?.maxTokens || DEFAULT_MODEL_CONFIG.maxTokens,
      endpoint: request.modelConfig?.endpoint || API_URL
    };
    
    // Realizar la solicitud a la API
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelConfig.model,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(request.options?.detailLevel || 'detailed', 
                                    request.options?.languageStyle || 'technical')
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al conectar con la API de IA');
    }
    
    const analysisContent = data.choices[0].message.content;
    
    // Crear objeto de análisis
    const analysis: AIAnalysis = {
      id: crypto.randomUUID(),
      studyId: studyId,
      patientId: request.patientData?.patientId,
      type: 'emg',
      content: analysisContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelInfo: {
        model: modelConfig.model,
        version: request.modelConfig?.version || '1.0',
        parameters: {
          temperature: modelConfig.temperature,
          maxTokens: modelConfig.maxTokens
        }
      },
      metadata: {
        detailLevel: request.options?.detailLevel || 'detailed',
        languageStyle: request.options?.languageStyle || 'technical',
        promptLength: prompt.length,
        responseLength: analysisContent.length
      }
    };
    
    // Guardar análisis si se requiere
    if (request.options?.saveToDashboard !== false) {
      saveAIAnalysis(analysis);
    }
    
    return {
      analysis,
      success: true,
      processedData: {
        summary: extractSummary(analysisContent),
        keyPoints: extractKeyPoints(analysisContent)
      }
    };
  } catch (error) {
    console.error('Error en análisis avanzado de EMG:', error);
    
    return {
      analysis: {
        id: crypto.randomUUID(),
        studyId: request.studyData.id || request.studyData.studyId || '',
        type: 'emg',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      success: false,
      errorMessage: `Error al realizar el análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Prepara el prompt especializado en EMG para la IA
 */
function prepareEMGPrompt(emgData: any, patientData: any): string {
  let prompt = `Analiza los siguientes datos electromiográficos y genera un informe detallado profesional:\n\n`;
  
  // Datos del paciente
  prompt += `## DATOS DEL PACIENTE\n`;
  prompt += `- Edad: ${patientData.age || 'No especificada'} años\n`;
  prompt += `- Sexo: ${patientData.gender || 'No especificado'}\n`;
  prompt += `- Tipo de músculo evaluado: ${patientData.muscleType || 'No especificado'}\n`;
  prompt += `- Condición física general: ${patientData.fitnessLevel || 'No especificada'}\n`;
  
  if (patientData.medicalHistory) {
    prompt += `- Historia médica relevante: ${patientData.medicalHistory}\n`;
  }
  
  prompt += `\n## DATOS EMG REGISTRADOS\n`;
  
  // Formatear datos de EMG
  if (emgData.results) {
    // Si es un formato de resultados estructurado
    Object.entries(emgData.results).forEach(([key, value]: [string, any]) => {
      prompt += `- ${key}: ${JSON.stringify(value)}\n`;
    });
  } else if (emgData.measurements) {
    // Si tiene el formato de mediciones
    prompt += `- Amplitud: ${emgData.measurements.amplitude} ${emgData.measurements.amplitudeUnit || 'mV'}\n`;
    
    if (emgData.measurements.frequency) {
      prompt += `- Frecuencia: ${emgData.measurements.frequency} Hz\n`;
    }
    
    if (emgData.measurements.duration) {
      prompt += `- Duración: ${emgData.measurements.duration} ms\n`;
    }
    
    if (emgData.measurements.recruitmentPattern) {
      prompt += `- Patrón de reclutamiento: ${emgData.measurements.recruitmentPattern}\n`;
    }
    
    if (emgData.measurements.interference) {
      prompt += `- Patrón de interferencia: ${emgData.measurements.interference}\n`;
    }
  } else {
    // Formato genérico para cualquier tipo de datos
    Object.entries(emgData).forEach(([key, value]: [string, any]) => {
      if (typeof value !== 'object') {
        prompt += `- ${key}: ${value}\n`;
      } else if (value !== null) {
        prompt += `- ${key}: ${JSON.stringify(value)}\n`;
      }
    });
  }
  
  // Instrucciones específicas para el análisis
  prompt += `\nAnálisis solicitado: Por favor analiza los datos electromiográficos proporcionados y genera un informe detallado que incluya:\n\n`;
  prompt += `1. Evaluación cuantitativa de la actividad muscular registrada:\n`;
  prompt += `   - Amplitud de las señales EMG\n`;
  prompt += `   - Frecuencia de las contracciones\n`;
  prompt += `   - Patrones de activación muscular\n`;
  prompt += `   - Fatiga muscular (si es observable)\n\n`;
  
  prompt += `2. Comparación con valores de referencia normales para:\n`;
  prompt += `   - Edad del paciente\n`;
  prompt += `   - Tipo de músculo evaluado\n`;
  prompt += `   - Condición física general\n\n`;
  
  prompt += `3. Identificación de:\n`;
  prompt += `   - Anomalías en los patrones de activación\n`;
  prompt += `   - Posibles disfunciones neuromusculares\n`;
  prompt += `   - Asimetrías entre grupos musculares\n\n`;
  
  prompt += `4. Conclusiones clínicas que incluyan:\n`;
  prompt += `   - Interpretación de los hallazgos principales\n`;
  prompt += `   - Recomendaciones específicas basadas en los resultados\n`;
  prompt += `   - Sugerencias para seguimiento o evaluaciones adicionales\n\n`;
  
  prompt += `Presenta tu análisis en formato técnico-médico, utilizando terminología profesional y respaldando tus conclusiones con los datos observados.`;
  
  return prompt;
}

/**
 * Obtiene el prompt de sistema según el nivel de detalle y estilo requerido
 */
function getSystemPrompt(detailLevel: 'basic' | 'intermediate' | 'detailed', 
                        languageStyle: 'technical' | 'simplified' | 'patient-friendly'): string {
  let basePrompt = 'Eres un neurofisiólogo especializado en electromiografía con más de 20 años de experiencia clínica. ';
  
  // Ajustar según nivel de detalle
  if (detailLevel === 'basic') {
    basePrompt += 'Proporciona un análisis conciso y directo, centrándote solo en los hallazgos más relevantes. ';
  } else if (detailLevel === 'intermediate') {
    basePrompt += 'Proporciona un análisis equilibrado con los hallazgos clave y sus implicaciones principales. ';
  } else {
    basePrompt += 'Proporciona un análisis exhaustivo y detallado, cubriendo todos los aspectos relevantes de los datos. ';
  }
  
  // Ajustar según estilo de lenguaje
  if (languageStyle === 'technical') {
    basePrompt += 'Utiliza terminología médica técnica apropiada para profesionales de la salud.';
  } else if (languageStyle === 'simplified') {
    basePrompt += 'Utiliza lenguaje técnico pero incluye explicaciones claras para profesionales no especializados en neurofisiología.';
  } else {
    basePrompt += 'Utiliza lenguaje accesible con mínimo de jerga técnica, apropiado para pacientes o familiares sin formación médica.';
  }
  
  return basePrompt;
}

/**
 * Extrae un resumen a partir del análisis completo
 */
function extractSummary(analysisText: string): string {
  // Buscar secciones de conclusiones o resumen
  const conclusionMatch = analysisText.match(/(?:##?\s*Conclusi[óo]n[:\s]*)([^#]+)/i);
  if (conclusionMatch && conclusionMatch[1]) {
    return conclusionMatch[1].trim().split('\n').slice(0, 3).join('\n');
  }
  
  // Si no hay sección de conclusión, intentar con el primer párrafo
  const paragraphs = analysisText.split('\n\n');
  for (const paragraph of paragraphs) {
    if (paragraph.length > 100 && !paragraph.startsWith('#')) {
      return paragraph.trim();
    }
  }
  
  // Si todo falla, devolver los primeros 200 caracteres
  return analysisText.substring(0, 200) + '...';
}

/**
 * Extrae puntos clave del análisis
 */
function extractKeyPoints(analysisText: string): string[] {
  const keyPoints: string[] = [];
  
  // Buscar listas con viñetas
  const bulletPoints = analysisText.match(/(?:^|\n)[-*•]\s*(.+?)(?=\n|$)/g);
  if (bulletPoints) {
    return bulletPoints.map(point => 
      point.replace(/^[-*•\s]+/, '').trim()
    ).filter(point => point.length > 10).slice(0, 5);
  }
  
  // Buscar frases que comienzan con "Se observa", "Se identifica", etc.
  const observations = analysisText.match(/(?:^|\n)(?:Se\s+(?:observa|identifica|detecta|encuentra|nota)|Los\s+resultados\s+(?:muestran|indican)|El\s+análisis\s+(?:revela|muestra)).+?(?=\n|$)/gi);
  if (observations) {
    return observations.map(obs => obs.trim()).slice(0, 5);
  }
  
  // Si no se encontraron puntos clave, devolver array vacío
  return keyPoints;
}

/**
 * Guarda un análisis EMG por IA
 */
export function saveEMGAnalysis(studyId: string, analysisContent: string): void {
  const analysis: Partial<AIAnalysis> = {
    studyId,
    type: 'emg',
    content: analysisContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    modelInfo: {
      model: DEFAULT_MODEL_CONFIG.model,
      version: '1.0'
    }
  };
  
  saveAIAnalysis(analysis);
}

/**
 * Obtiene análisis EMG previos por IA
 */
export function getEMGAnalysisHistory(studyId: string): { timestamp: string, content: string } | null {
  const latestAnalysis = getLatestAIAnalysisForStudy(studyId);
  
  if (!latestAnalysis) return null;
  
  return {
    timestamp: latestAnalysis.updatedAt,
    content: latestAnalysis.content
  };
}

/**
 * Elimina todos los análisis de EMG por IA para un estudio
 */
export function clearEMGAnalyses(studyId: string): boolean {
  const deletedCount = deleteAIAnalysesForStudy(studyId);
  return deletedCount > 0;
}