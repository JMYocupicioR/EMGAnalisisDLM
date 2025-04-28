// src/components/DiagnosticAnalysis.tsx
import React, { useState, useEffect } from 'react';
import { Printer, Edit2, FileText, Check, Save, ArrowLeft, Brain } from 'lucide-react';
import { analyzeNerveConduction } from '../utils/analysis';
import { savePatientStudy } from '../services/patientStudyService';
import { Patient } from '../types/patient';
import { Study } from '../types';
import EMGAIAnalysisPanel from './EMGAIAnalysisPanel';

interface DiagnosticAnalysisProps {
  studyData: any;
  initialDiagnosis: string;
  patientInfo: any;
  patient?: Patient;
  onSaveComplete?: () => void;
  onBack?: () => void;
}

const DiagnosticAnalysis: React.FC<DiagnosticAnalysisProps> = ({ 
  studyData, 
  initialDiagnosis, 
  patientInfo, 
  patient,
  onSaveComplete,
  onBack
}) => {
  // Estados del componente
  const [showReport, setShowReport] = useState(false);
  const [editingReport, setEditingReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [studyName, setStudyName] = useState('Estudio ENMG');
  const [observations, setObservations] = useState('');
  
  // Estados para análisis de IA
  const [showEmgAiAnalysis, setShowEmgAiAnalysis] = useState<boolean>(false);
  const [emgAiAnalysis, setEmgAiAnalysis] = useState<string>('');
  
  // Resultados del análisis
  const [results, setResults] = useState<any>(null);

  // Analizar datos al cargar el componente
  useEffect(() => {
    if (studyData && initialDiagnosis) {
      const analysisResults = analyzeNerveConduction(studyData, initialDiagnosis);
      setResults(analysisResults);
    }
  }, [studyData, initialDiagnosis]);
  
  // Generar texto del reporte cuando los resultados cambian
  useEffect(() => {
    if (results) {
      const generatedText = generateReportText();
      setReportText(generatedText);
    }
  }, [results, patientInfo, observations, emgAiAnalysis]);
  
  // Manejador para guardar el análisis EMG de IA
  const handleSaveEMGAIAnalysis = (analysisText: string) => {
    setEmgAiAnalysis(analysisText);
    // Incorporar el análisis a las observaciones o conclusión
    const formattedAnalysis = 
      "\n\n===== ANÁLISIS ESPECIALIZADO EMG - IA =====\n\n" + 
      analysisText + 
      "\n\n====================================";
      
    setObservations(prev => prev + formattedAnalysis);
  };
  
  // Añadir una función para extraer datos del paciente para IA
  const getPatientDataForAI = () => {
    return {
      age: patientInfo?.age || calculateAge(patient?.dateOfBirth),
      gender: patientInfo?.gender || patient?.sex,
      muscleType: studyData.muscleType || 'No especificado',
      fitnessLevel: patientInfo?.fitnessLevel || 'No especificado',
      medicalHistory: patientInfo?.relevantHistory || 
        (patient?.medicalHistory?.previousDiseases?.join(', ') || 'No especificado')
    };
  };
  
  // Función auxiliar para obtener valores de referencia
  const getRefValue = (test: string, parameter: string): string => {
    // Estos valores deberían venir de una base de datos de referencia
    const refValues: {[key: string]: {[key: string]: string}} = {
      MedianMotor: {
        latency: '2.5-4.5 ms',
        amplitude: '4.0-20.0 mV',
        velocity: '45-65 m/s'
      },
      MedianSensory: {
        latency: '2.5-3.5 ms',
        amplitude: '20-50 µV',
        velocity: '45-65 m/s'
      },
      UlnarMotor: {
        latency: '2.0-4.0 ms',
        amplitude: '4.0-20.0 mV',
        velocity: '45-65 m/s'
      }
      // Añadir más valores de referencia según sea necesario
    };
    
    for (const key in refValues) {
      if (test.includes(key)) {
        return refValues[key][parameter] || 'No disponible';
      }
    }
    return 'No disponible';
  };
  
  // Generar el texto del reporte automáticamente basado en los datos
  const generateReportText = (): string => {
    const today = new Date().toLocaleDateString();
    
    // Formato del reporte
    const report = `
# REPORTE DE ELECTROMIOGRAFÍA: ${studyName}

## DATOS DEL PACIENTE
- **Nombre:** ${patientInfo?.name || patient?.firstName + ' ' + patient?.lastName || 'No especificado'}
- **Sexo:** ${getGenderText()}
- **Edad:** ${patientInfo?.age || calculateAge(patient?.dateOfBirth) || 'No especificada'} años
- **Fecha del estudio:** ${today}
- **Médico solicitante:** No especificado
- **Diagnóstico de referencia:** ${results.primary.name}

## HISTORIA CLÍNICA BREVE
- **Motivo de referencia:** ${patientInfo?.chiefComplaint || patient?.consultReason || 'No especificado'}
- **Antecedentes relevantes:** ${patientInfo?.relevantHistory || formatMedicalHistory() || 'No especificados'}
- **Medicamentos actuales:** ${patientInfo?.currentMedications || formatMedications() || 'No especificados'}

## NEUROCONDUCCIONES

${formatNeuroConductionData()}

${studyData.emgData ? formatEMGData() : '## ELECTROMIOGRAFÍA DE AGUJA\nNo se realizó estudio de electromiografía de aguja.\n'}

## CONCLUSIÓN Y DIAGNÓSTICO ELECTROFISIOLÓGICO

Estudio de electroneurografía ${results.primary.probability > 0.7 ? 'ANORMAL' : 'con POSIBLES ANORMALIDADES'}, con hallazgos electrofisiológicos ${
    results.primary.probability > 0.7 
      ? `compatibles con ${results.primary.name}.` 
      : `sugestivos de posible ${results.primary.name}, aunque los hallazgos no son concluyentes.`
}

${formatAbnormalFindings()}

${formatDifferentialDiagnoses()}

${emgAiAnalysis ? '## ANÁLISIS ESPECIALIZADO DE EMG POR IA\n\n' + emgAiAnalysis : ''}

## OBSERVACIONES
${observations}

## NOTAS TÉCNICAS
Estudio realizado con equipo de electromiografía digital, utilizando técnicas estándar para neuroconducciones motoras y sensitivas.
`;

    return report;
  };
  
  // Funciones auxiliares para formatear datos
  const getGenderText = (): string => {
    if (patientInfo?.gender) {
      return patientInfo.gender === 'male' ? 'Masculino' : 
             patientInfo.gender === 'female' ? 'Femenino' : 'No especificado';
    } else if (patient?.sex) {
      return patient.sex === 'male' ? 'Masculino' : 
             patient.sex === 'female' ? 'Femenino' : 'Otro';
    }
    return 'No especificado';
  };
  
  const calculateAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };
  
  const formatMedicalHistory = (): string => {
    if (!patient?.medicalHistory) return '';
    
    const diseases = patient.medicalHistory.previousDiseases;
    if (diseases.length === 0) return '';
    
    return diseases.join(', ');
  };
  
  const formatMedications = (): string => {
    if (!patient?.medicalHistory) return '';
    
    const medications = patient.medicalHistory.currentMedications;
    if (medications.length === 0) return '';
    
    return medications.join(', ');
  };
  
  const formatNeuroConductionData = (): string => {
    return Object.entries(studyData)
      .filter(([key]) => key.includes('Motor') || key.includes('Sensory'))
      .map(([test, data]) => {
        const isMotor = test.includes('Motor');
        const testData = data as any;
        return `### ${test.replace('Test', '')}
- **Tipo:** ${isMotor ? 'Motor' : 'Sensitivo'}
- **Latencia:** ${testData.latency} ms${isMotor ? ` (Valor normal: ${getRefValue(test, 'latency')})` : ''}
- **Amplitud:** ${testData.amplitude} ${isMotor ? 'mV' : 'µV'} (Valor normal: ${getRefValue(test, 'amplitude')})
- **Velocidad de conducción:** ${testData.velocity || 'No medida'} m/s${testData.velocity ? ` (Valor normal: ${getRefValue(test, 'velocity')})` : ''}
`;
      }).join('\n');
  };
  
  const formatEMGData = (): string => {
    if (!studyData.emgData || !Array.isArray(studyData.emgData)) {
      return '';
    }
    
    return `
## ELECTROMIOGRAFÍA DE AGUJA

${studyData.emgData.map((muscle: any) => `
### ${muscle.name} (${muscle.side})
- **Actividad de inserción:** ${muscle.insertionActivity}
- **Actividad en reposo:** ${muscle.restActivity || 'No se observa actividad anormal'}
- **Potenciales de unidad motora:** ${muscle.motorUnitPotentials || 'Normales'}
- **Patrón de reclutamiento:** ${muscle.recruitmentPattern || 'Normal'}
- **Esfuerzo del paciente:** ${muscle.patientEffort || 'Adecuado'}
`).join('\n')}
`;
  };
  
  const formatAbnormalFindings = (): string => {
    const abnormalFindings = results.primary.keyFindings.filter((f: any) => f.abnormal);
    
    if (abnormalFindings.length > 0) {
      return `Se observan los siguientes hallazgos anormales:\n${abnormalFindings.map((f: any) => `- ${f.description}`).join('\n')}`;
    }
    
    return 'No se observan alteraciones significativas en los parámetros evaluados.';
  };
  
  const formatDifferentialDiagnoses = (): string => {
    if (results.differentials.length > 0) {
      return `\nDiagnósticos diferenciales a considerar:\n${results.differentials.map((d: any) => `- ${d.name} (${Math.round(d.probability * 100)}% de probabilidad)`).join('\n')}`;
    }
    
    return '';
  };
  
  // Manejadores de eventos
  const handleGenerateReport = () => {
    setShowReport(true);
  };
  
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>Reporte de Electromiografía</title>
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
            ${reportText.replace(/\n/g, '<br>').replace(/#{1,3}\s(.*?)$/gm, (match, group) => 
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
  
  const handleSaveStudy = async () => {
    if (!patient) {
      setSaveError('No se puede guardar el estudio sin datos del paciente.');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Convertir los datos para guardarlos como estudio
      const studyToSave: Study = {
        id: crypto.randomUUID(),
        nerve: results.primary.name,
        side: 'bilateral', // Este valor debería venir de los datos del estudio
        measurements: studyData,
        interpretation: results.primary.keyFindings.map((f: any) => f.description),
        status: results.primary.probability > 0.7 ? 'abnormal' : 'normal',
        timestamp: new Date().toISOString()
      };
      
      // Guardar en el servicio de estudios
      await savePatientStudy(
        patient, 
        'neuroconduction', 
        studyToSave, 
        observations,
        formatAbnormalFindings() + '\n' + formatDifferentialDiagnoses(),
        emgAiAnalysis // Pasar el análisis EMG por IA
      );
      
      setSaveSuccess(true);
      
      // Notificar al componente padre si existe el callback
      if (onSaveComplete) {
        setTimeout(() => {
          onSaveComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      setSaveError('Ocurrió un error al guardar el estudio. Por favor, intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Si no hay resultados, mostrar un indicador de carga
  if (!results) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Analizando datos...</p>
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
      
      {!showReport ? (
        <>
          <h2 className="text-xl font-bold mb-4">Análisis Diagnóstico</h2>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-medium">Diagnóstico Principal</h3>
              <div className="flex items-center">
                <label className="text-sm mr-2">Nombre del estudio:</label>
                <input
                  type="text"
                  value={studyName}
                  onChange={(e) => setStudyName(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${results.primary.probability > 0.7 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{results.primary.name}</p>
                  <p className="text-sm text-gray-600">
                    Probabilidad: {Math.round(results.primary.probability * 100)}%
                  </p>
                </div>
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#eee"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={results.primary.probability > 0.7 ? "#4ade80" : "#facc15"}
                      strokeWidth="3"
                      strokeDasharray={`${results.primary.probability * 100}, 100`}
                    />
                    <text x="18" y="20.5" className="text-3xl" textAnchor="middle" fill="#666">
                      {Math.round(results.primary.probability * 100)}%
                    </text>
                  </svg>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium mb-1">Hallazgos clave:</h4>
                <ul className="list-disc pl-5">
                  {results.primary.keyFindings.map((finding: any, index: number) => (
                    <li 
                      key={index} 
                      className={`text-sm ${finding.abnormal ? 'text-red-600 font-medium' : 'text-gray-700'}`}
                    >
                      {finding.description}
                      {finding.abnormal && <span className="ml-1">*</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Diagnósticos Diferenciales</h3>
            <div className="space-y-3">
              {results.differentials.length > 0 ? (
                results.differentials.map((diagnosis: any, index: number) => (
                  <div key={index} className="p-3 border rounded bg-gray-50">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{diagnosis.name}</p>
                      <p className="text-sm">
                        Probabilidad: {Math.round(diagnosis.probability * 100)}%
                      </p>
                    </div>
                    {diagnosis.reason && (
                      <p className="text-sm text-gray-600 mt-1">{diagnosis.reason}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No se encontraron diagnósticos diferenciales relevantes.</p>
              )}
            </div>
          </div>
          
          {/* Sección de Análisis EMG Especializado */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                Análisis Especializado EMG
              </h3>
              <button
                onClick={() => setShowEmgAiAnalysis(!showEmgAiAnalysis)}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                {showEmgAiAnalysis ? 'Ocultar análisis especializado' : 'Mostrar análisis especializado'}
              </button>
            </div>
            
            {showEmgAiAnalysis && (
              <EMGAIAnalysisPanel 
                emgData={studyData}
                patientData={getPatientDataForAI()}
                studyId={crypto.randomUUID()} // O usar un ID real si está disponible
                onSave={handleSaveEMGAIAnalysis}
              />
            )}
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Observaciones</h3>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Añada observaciones clínicas relevantes..."
              className="w-full border rounded p-3 min-h-[100px]"
            />
          </div>
          
          <div className="mt-8 flex justify-between">
            <div>
              {patient && (
                <button
                  onClick={handleSaveStudy}
                  disabled={isSaving}
                  className={`px-6 py-3 rounded flex items-center mr-4 ${
                    isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isSaving ? 'Guardando...' : 'Guardar en historial'}
                </button>
              )}
              
              {saveSuccess && (
                <span className="text-green-600 inline-flex items-center ml-3">
                  <Check className="h-4 w-4 mr-1" /> Guardado correctamente
                </span>
              )}
              
              {saveError && (
                <span className="text-red-600 inline-flex items-center ml-3">
                  {saveError}
                </span>
              )}
            </div>
            
            <button
              onClick={handleGenerateReport}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <FileText className="mr-2 h-5 w-5" />
              Ver Reporte
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Reporte de Electromiografía</h2>
            <div className="space-x-2">
              {editingReport ? (
                <button
                  onClick={() => setEditingReport(false)}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <Check className="mr-1 h-4 w-4" />
                  Guardar cambios
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditingReport(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={handlePrintReport}
                    className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 flex items-center"
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Imprimir
                  </button>
                </>
              )}
              <button
                onClick={() => setShowReport(false)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Volver al Análisis
              </button>
            </div>
          </div>
          
          {editingReport ? (
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full h-screen-3/4 p-4 border rounded font-mono text-sm"
              style={{ minHeight: '70vh' }}
            />
          ) : (
            <div className="bg-gray-50 p-4 rounded border overflow-auto" style={{ maxHeight: '70vh' }}>
              <pre className="whitespace-pre-wrap font-sans">{reportText}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DiagnosticAnalysis;