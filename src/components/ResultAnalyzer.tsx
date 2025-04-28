// src/components/ResultAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Brain, 
  RefreshCw, 
  Download, 
  Save, 
  AlertTriangle,
  ArrowLeft,
  Check,
  Edit2,
  Eye
} from 'lucide-react';
import { Study } from '../types';
import { Patient } from '../types/patient';
import { analyzeNerveConduction } from '../utils/analysis';
import { getPatientById } from '../services/patientService';
import { savePatientStudy, getPatientStudyById, updatePatientStudy } from '../services/patientStudyService';
import EMGAIAnalysisPanel from './EMGAIAnalysisPanel';

interface ResultAnalyzerProps {
  studyData: any;
  initialDiagnosis: string;
  patientInfo?: any;
  patientId?: string;
  studyId?: string;
  onSaveComplete?: () => void;
  onBack?: () => void;
}

const ResultAnalyzer: React.FC<ResultAnalyzerProps> = ({
  studyData,
  initialDiagnosis,
  patientInfo,
  patientId,
  studyId,
  onSaveComplete,
  onBack,
}) => {
  // Estados del componente
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [conclusion, setConclusion] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [existingStudy, setExistingStudy] = useState<any>(null);
  const [reportMode, setReportMode] = useState<'edit' | 'view'>('view');
  const [emgAnalysis, setEmgAnalysis] = useState<any>(null);

  // Cargar datos del paciente y estudio existente si se proporcionan IDs
  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        const patientData = getPatientById(patientId);
        if (patientData) {
          setPatient(patientData);
        }
      }
    };

    const loadExistingStudy = async () => {
      if (studyId) {
        const study = getPatientStudyById(studyId);
        if (study) {
          setExistingStudy(study);
          setObservations(study.observations || '');
          setConclusion(study.conclusion || '');
          if (study.aiAnalysis?.emgAnalysis?.content) {
            setAiAnalysis(study.aiAnalysis.emgAnalysis.content);
          }
          if (study.emgData) {
            setEmgAnalysis(study.emgData);
          }
        }
      }
    };

    loadPatient();
    loadExistingStudy();
  }, [patientId, studyId]);

  // Analizar datos para diagnóstico cuando cambien los datos del estudio
  useEffect(() => {
    if (studyData && initialDiagnosis) {
      const results = analyzeNerveConduction(studyData, initialDiagnosis);
      setDiagnosticResults(results);
      
      // Generar conclusión automática basada en los resultados
      const autoConclusion = generateAutoConclusion(results);
      if (!conclusion) {
        setConclusion(autoConclusion);
      }

      // Analizar datos de EMG si están presentes
      if (studyData.emgData) {
        const emgResults = analyzeEMGData(studyData.emgData);
        setEmgAnalysis(emgResults);
      }
    }
  }, [studyData, initialDiagnosis]);

  // Generar contenido del reporte cuando cambien los resultados o textos
  useEffect(() => {
    if (diagnosticResults) {
      const reportText = generateReport();
      setReportContent(reportText);
    }
  }, [diagnosticResults, observations, conclusion, aiAnalysis, emgAnalysis]);

  // Generar una conclusión automática basada en los resultados del análisis
  const generateAutoConclusion = (results: any): string => {
    if (!results) return '';
    
    const primaryDiagnosis = results.primary;
    const probability = primaryDiagnosis.probability;
    
    let conclusion = '';
    
    if (probability > 0.7) {
      conclusion = `Estudio ANORMAL, compatible con ${primaryDiagnosis.name}. `;
      conclusion += `Se observan los siguientes hallazgos: ${primaryDiagnosis.keyFindings
        .filter((f: any) => f.abnormal)
        .map((f: any) => f.description)
        .join('; ')}.`;
    } else if (probability > 0.3) {
      conclusion = `Estudio con POSIBLES ANORMALIDADES, sugestivo de ${primaryDiagnosis.name}. `;
      conclusion += `Se observan los siguientes hallazgos: ${primaryDiagnosis.keyFindings
        .filter((f: any) => f.abnormal)
        .map((f: any) => f.description)
        .join('; ')}.`;
    } else {
      conclusion = 'Estudio NORMAL. No se observan alteraciones significativas en los parámetros evaluados.';
    }
    
    return conclusion;
  };

  // Analizar datos de EMG
  const analyzeEMGData = (emgData: any): any => {
    const analysis = {
      insertionalActivity: {
        value: emgData.insertionalActivity,
        interpretation: interpretInsertionalActivity(emgData.insertionalActivity)
      },
      spontaneousActivity: {
        findings: Object.entries(emgData.spontaneousActivity)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        interpretation: interpretSpontaneousActivity(emgData.spontaneousActivity)
      },
      motorUnitPotentials: {
        amplitude: interpretAmplitude(emgData.motorUnitPotentials.amplitude),
        duration: interpretDuration(emgData.motorUnitPotentials.duration),
        polyphasia: interpretPolyphasia(emgData.motorUnitPotentials.polyphasia)
      },
      recruitmentPattern: {
        value: emgData.recruitmentPattern,
        interpretation: interpretRecruitmentPattern(emgData.recruitmentPattern)
      }
    };

    return analysis;
  };

  // Funciones auxiliares para interpretación de EMG
  const interpretInsertionalActivity = (value: string): string => {
    switch (value) {
      case 'normal': return 'Actividad de inserción normal';
      case 'aumentada': return 'Actividad de inserción aumentada, sugestivo de irritabilidad muscular';
      case 'disminuida': return 'Actividad de inserción disminuida, sugestivo de atrofia muscular';
      case 'ausente': return 'Actividad de inserción ausente, sugestivo de fibrosis muscular';
      default: return 'No especificado';
    }
  };

  const interpretSpontaneousActivity = (activity: any): string => {
    const findings = [];
    if (activity.fibrillations) findings.push('fibrilaciones');
    if (activity.positiveWaves) findings.push('ondas positivas');
    if (activity.fasciculations) findings.push('fasciculaciones');

    if (findings.length === 0) {
      return 'No se observa actividad espontánea anormal';
    }

    return `Se observa actividad espontánea anormal con ${findings.join(', ')}`;
  };

  const interpretAmplitude = (value: number): string => {
    if (value > 5000) return 'Amplitud aumentada, sugestivo de reinervación';
    if (value < 200) return 'Amplitud disminuida, sugestivo de pérdida de unidades motoras';
    return 'Amplitud normal';
  };

  const interpretDuration = (value: number): string => {
    if (value > 15) return 'Duración aumentada, sugestivo de reinervación';
    if (value < 5) return 'Duración disminuida, sugestivo de pérdida de unidades motoras';
    return 'Duración normal';
  };

  const interpretPolyphasia = (value: number): string => {
    if (value > 20) return 'Polifasia aumentada, sugestivo de reinervación';
    return 'Polifasia normal';
  };

  const interpretRecruitmentPattern = (value: string): string => {
    switch (value) {
      case 'normal': return 'Patrón de reclutamiento normal';
      case 'reducido': return 'Patrón de reclutamiento reducido, sugestivo de pérdida de unidades motoras';
      case 'aumentado': return 'Patrón de reclutamiento aumentado, sugestivo de debilidad muscular';
      case 'precoz': return 'Patrón de reclutamiento precoz, sugestivo de miopatía';
      default: return 'No especificado';
    }
  };

  // Generar el reporte completo
  const generateReport = (): string => {
    if (!diagnosticResults) return '';

    const today = new Date().toLocaleDateString();
    const patientName = patient 
      ? `${patient.firstName} ${patient.lastName}` 
      : patientInfo?.name || 'No especificado';
    
    return `# REPORTE DE ELECTRONEUROMIOGRAFÍA

## DATOS DEL PACIENTE
- **Nombre:** ${patientName}
- **Fecha del estudio:** ${today}
- **Diagnóstico presuntivo:** ${diagnosticResults.primary.name}

## RESULTADOS DEL ESTUDIO

${formatStudyResults()}

${emgAnalysis ? formatEMGResults() : ''}

## CONCLUSIÓN
${conclusion}

${aiAnalysis ? '## ANÁLISIS ESPECIALIZADO POR IA\n' + aiAnalysis : ''}

${observations ? '## OBSERVACIONES\n' + observations : ''}
`;
  };

  // Formatear los resultados del estudio para el reporte
  const formatStudyResults = (): string => {
    let results = '';

    // Neuroconducciones motoras
    if (studyData.motor) {
      results += '### Neuroconducciones Motoras\n\n';
      results += `- Latencia: ${studyData.motor.latency} ms\n`;
      results += `- Amplitud: ${studyData.motor.amplitude} mV\n`;
      results += `- Velocidad de conducción: ${studyData.motor.velocity} m/s\n\n`;
    }

    // Neuroconducciones sensitivas
    if (studyData.sensory) {
      results += '### Neuroconducciones Sensitivas\n\n';
      results += `- Latencia: ${studyData.sensory.latency} ms\n`;
      results += `- Amplitud: ${studyData.sensory.amplitude} µV\n`;
      results += `- Velocidad de conducción: ${studyData.sensory.velocity} m/s\n\n`;
    }

    // Respuestas F
    if (studyData.fResponse) {
      results += '### Respuestas F\n\n';
      results += `- Latencia F Mediano: ${studyData.fResponse.medianF} ms\n`;
      results += `- Latencia F Cubital: ${studyData.fResponse.ulnarF} ms\n`;
      results += `- Diferencia: ${studyData.fResponse.difference} ms\n\n`;
    }

    return results;
  };

  // Formatear resultados de EMG para el reporte
  const formatEMGResults = (): string => {
    if (!emgAnalysis) return '';

    return `## ELECTROMIOGRAFÍA DE AGUJA

### Actividad de Inserción
${emgAnalysis.insertionalActivity.interpretation}

### Actividad Espontánea
${emgAnalysis.spontaneousActivity.interpretation}

### Potenciales de Unidad Motora
- Amplitud: ${emgAnalysis.motorUnitPotentials.amplitude}
- Duración: ${emgAnalysis.motorUnitPotentials.duration}
- Polifasia: ${emgAnalysis.motorUnitPotentials.polyphasia}

### Patrón de Reclutamiento
${emgAnalysis.recruitmentPattern.interpretation}
`;
  };

  // Guardar el análisis de IA cuando se reciba del panel de IA
  const handleAiAnalysisSave = (analysisText: string) => {
    setAiAnalysis(analysisText);
  };

  // Guardar el estudio completo
  const handleSaveStudy = async () => {
    if (!patientId && !patient) {
      setSaveError('No se puede guardar el estudio sin datos del paciente.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const patientToUse = patient || await getPatientById(patientId!);
      
      if (!patientToUse) {
        throw new Error('No se encontró información del paciente.');
      }

      // Crear objeto para el estudio
      const studyToSave: Study = {
        id: existingStudy?.id || crypto.randomUUID(),
        nerve: diagnosticResults.primary.name,
        side: 'bilateral', // Este valor debería determinarse por los datos del estudio
        measurements: studyData,
        interpretation: diagnosticResults.primary.keyFindings.map((f: any) => f.description),
        status: diagnosticResults.primary.probability > 0.5 ? 'abnormal' : 'normal',
        timestamp: new Date().toISOString()
      };

      // Si ya existe un estudio, actualizarlo
      if (existingStudy) {
        await updatePatientStudy(existingStudy.id, {
          studyData: studyToSave,
          observations,
          conclusion,
          aiAnalysis: aiAnalysis ? {
            emgAnalysis: {
              id: existingStudy.aiAnalysis?.emgAnalysis?.id || crypto.randomUUID(),
              studyId: existingStudy.id,
              content: aiAnalysis,
              timestamp: new Date().toISOString(),
              modelVersion: 'ai-model-v1'
            }
          } : undefined
        });
      } else {
        // Si es un nuevo estudio, guardarlo
        await savePatientStudy(
          patientToUse,
          'neuroconduction',
          studyToSave,
          observations,
          conclusion,
          aiAnalysis
        );
      }

      setSaveSuccess(true);

      // Notificar al componente padre
      if (onSaveComplete) {
        setTimeout(() => {
          onSaveComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      setSaveError(`Error al guardar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar la impresión del reporte
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Reporte de Electroneuromiografía</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { text-align: center; }
            h2 { margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            h3 { margin-top: 15px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div id="report">
            ${reportContent.replace(/\n/g, '<br>').replace(/#{1,3}\s(.*?)$/gm, (match, group) => 
              match.startsWith('### ') 
                ? `<h3>${group}</h3>` 
                : match.startsWith('## ') 
                  ? `<h2>${group}</h2>` 
                  : `<h1>${group}</h1>`
            )}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Descargar el reporte como un archivo de texto
  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-enmg-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Si no hay resultados, mostrar indicador de carga
  if (!diagnosticResults) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Analizando datos del estudio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" />
          Volver
        </button>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Análisis de Resultados</h2>
        
        <div className="flex space-x-3">
          <button
            onClick={handlePrintReport}
            className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 flex items-center"
          >
            <FileText className="mr-2 h-4 w-4" />
            Imprimir
          </button>
          
          <button
            onClick={handleDownloadReport}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </button>
          
          {(patientId || patient) && (
            <button
              onClick={handleSaveStudy}
              disabled={isSaving}
              className={`px-3 py-2 rounded-md flex items-center ${
                isSaving ? 'bg-gray-400 text-gray-200' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Estudio
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mt-2 p-2 bg-green-50 text-green-800 rounded-md flex items-center">
          <Check className="h-4 w-4 mr-2" />
          Estudio guardado correctamente
        </div>
      )}

      {saveError && (
        <div className="mt-2 p-2 bg-red-50 text-red-800 rounded-md flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {saveError}
        </div>
      )}

      <div className="mt-6">
        {reportMode === 'view' ? (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: reportContent.replace(/\n/g, '<br>') }} />
          </div>
        ) : (
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            className="w-full h-96 p-4 border rounded-md font-mono text-sm"
          />
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => setReportMode(reportMode === 'view' ? 'edit' : 'view')}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          {reportMode === 'view' ? (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Reporte
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Ver Reporte
            </>
          )}
        </button>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium flex items-center">
            <Brain className="h-5 w-5 text-purple-600 mr-2" />
            Análisis Especializado por IA
          </h3>
          
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            {showAiPanel ? 'Ocultar panel de IA' : 'Mostrar panel de IA'}
          </button>
        </div>
        
        {showAiPanel ? (
          <EMGAIAnalysisPanel
            emgData={studyData}
            patientData={{
              age: patientInfo?.age || (patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : undefined),
              gender: patientInfo?.gender || patient?.sex,
              medicalHistory: patientInfo?.relevantHistory || 
                (patient?.medicalHistory?.previousDiseases?.join(', ') || undefined)
            }}
            studyId={existingStudy?.id || 'temp-' + crypto.randomUUID()}
            onSave={handleAiAnalysisSave}
          />
        ) : aiAnalysis ? (
          <div className="border rounded-md p-4">
            <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </div>
            <button
              onClick={() => setShowAiPanel(true)}
              className="mt-3 text-sm text-purple-600 hover:text-purple-800"
            >
              Editar análisis de IA
            </button>
          </div>
        ) : (
          <div className="p-4 border rounded-md bg-gray-50 text-center">
            <p className="text-gray-500">Haga clic en "Mostrar panel de IA" para generar un análisis especializado de electromiografía utilizando inteligencia artificial.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Función auxiliar para calcular la edad a partir de la fecha de nacimiento
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default ResultAnalyzer;