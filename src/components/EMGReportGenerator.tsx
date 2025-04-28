import React from 'react';
import { EMGResults, EMGInterpretation, MuscleEMGData, NerveConductionData } from '../types/clinical';
import { EMGPatternAnalyzer } from '../utils/emgPatternAnalyzer';
import { diagnosticPatterns } from '../data/diagnosticPatterns';

interface EMGReportGeneratorProps {
  emgResults: EMGResults;
  interpretation?: EMGInterpretation;
  patientData: {
    id: string;
    name: string;
    dateOfBirth: string;
    gender: string;
  };
}

interface SuggestedDiagnosis {
  diagnosisId: string;
  confidence: number;
}

const EMGReportGenerator: React.FC<EMGReportGeneratorProps> = ({
  emgResults,
  interpretation,
  patientData
}) => {
  // Generar el texto del reporte
  const generateReportText = () => {
    let reportText = `REPORTE DE ELECTROMIOGRAFÍA\n\n`;
    reportText += `Paciente: ${patientData.name}\n`;
    reportText += `ID: ${patientData.id}\n`;
    reportText += `Edad: ${calculateAge(patientData.dateOfBirth)} años\n`;
    reportText += `Género: ${patientData.gender}\n`;
    reportText += `Fecha del estudio: ${emgResults.analysisDate}\n\n`;
    
    // Resultados de NCS si están disponibles
    if (emgResults.ncsResults && Object.keys(emgResults.ncsResults).length > 0) {
      reportText += `ESTUDIOS DE CONDUCCIÓN NERVIOSA:\n\n`;
      
      Object.entries(emgResults.ncsResults).forEach(([nerveId, nerveData]) => {
        const ncsData = nerveData as NerveConductionData;
        reportText += `Nervio: ${nerveId}\n`;
        reportText += `  - Latencia: ${ncsData.latency}ms\n`;
        reportText += `  - Amplitud: ${ncsData.amplitude}µV\n`;
        if (ncsData.conductionVelocity) {
          reportText += `  - Velocidad de conducción: ${ncsData.conductionVelocity}m/s\n`;
        }
        reportText += `\n`;
      });
    }
    
    reportText += `RESULTADOS EMG:\n\n`;
    
    // Detalles de cada músculo estudiado
    Object.entries(emgResults.muscles).forEach(([muscleId, muscleData]) => {
      const emgData = muscleData as MuscleEMGData;
      reportText += `Músculo: ${emgData.muscle} (${emgData.side})\n`;
      reportText += `Actividad de inserción: ${emgData.insertionalActivity}\n`;
      reportText += `Actividad espontánea:\n`;
      reportText += `  - Fibrilaciones: ${emgData.spontaneousActivity.fibrillations}\n`;
      reportText += `  - Ondas positivas: ${emgData.spontaneousActivity.positiveWaves}\n`;
      reportText += `  - Fasciculaciones: ${emgData.spontaneousActivity.fasciculations}\n`;
      
      if (emgData.spontaneousActivity.complexRepetitiveDischarges) {
        reportText += `  - Descargas repetitivas complejas: ${emgData.spontaneousActivity.complexRepetitiveDischarges}\n`;
      }
      
      if (emgData.spontaneousActivity.myotonicDischarges) {
        reportText += `  - Descargas miotónicas: ${emgData.spontaneousActivity.myotonicDischarges}\n`;
      }
      
      reportText += `Potenciales de unidad motora:\n`;
      reportText += `  - Duración: ${emgData.motorUnitPotentials.duration.value}ms`;
      if (emgData.motorUnitPotentials.duration.percentOfNormal) {
        reportText += ` (${emgData.motorUnitPotentials.duration.percentOfNormal}% de lo normal)`;
      }
      reportText += `\n`;
      
      reportText += `  - Amplitud: ${emgData.motorUnitPotentials.amplitude.value}µV`;
      if (emgData.motorUnitPotentials.amplitude.percentOfNormal) {
        reportText += ` (${emgData.motorUnitPotentials.amplitude.percentOfNormal}% de lo normal)`;
      }
      reportText += `\n`;
      
      reportText += `  - Fases: ${emgData.motorUnitPotentials.phases}\n`;
      if (emgData.motorUnitPotentials.stability) {
        reportText += `  - Estabilidad: ${emgData.motorUnitPotentials.stability}\n`;
      }
      
      reportText += `Reclutamiento: ${emgData.recruitment.pattern}\n`;
      if (emgData.recruitment.ratioToAmplitude) {
        reportText += `  - Relación amplitud: ${emgData.recruitment.ratioToAmplitude}\n`;
      }
      
      if (emgData.interference) {
        reportText += `Interferencia: ${emgData.interference.pattern}\n`;
      }
      
      if (emgData.associatedNerves?.length) {
        reportText += `Nervios asociados: ${emgData.associatedNerves.join(', ')}\n`;
      }
      
      if (emgData.associatedRoots?.length) {
        reportText += `Raíces asociadas: ${emgData.associatedRoots.join(', ')}\n`;
      }
      
      if (emgData.notes) {
        reportText += `Notas: ${emgData.notes}\n`;
      }
      
      reportText += `\n`;
    });
    
    // Interpretación si está disponible
    if (interpretation) {
      reportText += `INTERPRETACIÓN:\n\n`;
      reportText += `Patrón: ${interpretPatternType(interpretation.patternType)}\n`;
      reportText += `Distribución: ${interpretDistribution(interpretation.distribution)}\n`;
      reportText += `Lateralidad: ${interpretLaterality(interpretation.laterality)}\n`;
      reportText += `Cronicidad: ${interpretation.chronicity}\n`;
      reportText += `Severidad: ${interpretSeverity(interpretation.severity)}\n\n`;
      
      if (interpretation.suggestedDiagnoses.length > 0) {
        reportText += `DIAGNÓSTICOS SUGERIDOS:\n`;
        interpretation.suggestedDiagnoses.forEach((diagnosis, index) => {
          const diagPattern = diagnosticPatterns[diagnosis.diagnosisId];
          if (diagPattern) {
            reportText += `${index + 1}. ${diagPattern.name} (${Math.round(diagnosis.confidence * 100)}%)\n`;
            reportText += `   Descripción: ${diagPattern.description}\n`;
          }
        });
      }
      
      reportText += `\nNotas: ${interpretation.notes}\n`;
    }
    
    return reportText;
  };
  
  const reportText = generateReportText();
  
  // Funciones auxiliares para interpretación de terminología
  const interpretPatternType = (patternType: EMGInterpretation['patternType']): string => {
    const patternTranslations = {
      'neuropathic': 'neuropático',
      'myopathic': 'miopático',
      'mixed': 'mixto (neuropático y miopático)',
      'non-specific': 'con alteraciones inespecíficas',
      'normal': 'normal'
    };
    return patternTranslations[patternType] || patternType;
  };
  
  const interpretSeverity = (severity: EMGInterpretation['severity']): string => {
    const severityTranslations = {
      'minimal': 'intensidad mínima',
      'mild': 'leve intensidad',
      'moderate': 'moderada intensidad',
      'severe': 'severa intensidad'
    };
    return severityTranslations[severity] || severity;
  };
  
  const interpretDistribution = (distribution: EMGInterpretation['distribution']): string => {
    const distributionTranslations = {
      'focal': 'focal',
      'multifocal': 'multifocal',
      'diffuse': 'difusa',
      'proximal': 'predominantemente proximal',
      'distal': 'predominantemente distal',
      'generalized': 'generalizada'
    };
    return distributionTranslations[distribution] || distribution;
  };
  
  const interpretLaterality = (laterality: EMGInterpretation['laterality']): string => {
    const lateralityTranslations = {
      'unilateral': 'unilateral',
      'bilateral': 'bilateral simétrica',
      'asymmetric bilateral': 'bilateral asimétrica'
    };
    return lateralityTranslations[laterality] || laterality;
  };
  
  // Calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Renderizar el informe
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Reporte EMG</h2>
        <div className="space-x-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Imprimir
          </button>
          <button
            onClick={() => {
              const blob = new Blob([reportText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `EMG_Reporte_${patientData.id}_${new Date().toISOString().split('T')[0]}.md`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Descargar
          </button>
        </div>
      </div>
      
      <div className="overflow-auto my-4 p-4 bg-gray-50 rounded border" style={{ maxHeight: '70vh' }}>
        <pre className="whitespace-pre-wrap font-sans text-sm">{reportText}</pre>
      </div>
      
      {interpretation && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Resumen del análisis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-medium">Patrón EMG</h4>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  interpretation.patternType === 'neuropathic' ? 'bg-red-500' :
                  interpretation.patternType === 'myopathic' ? 'bg-blue-500' :
                  interpretation.patternType === 'mixed' ? 'bg-purple-500' :
                  interpretation.patternType === 'non-specific' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span>{interpretPatternType(interpretation.patternType)}</span>
              </div>
              
              <div className="mt-2">
                <span className="text-sm text-gray-600">Severidad:</span>
                <span className="ml-2 font-medium">{interpretSeverity(interpretation.severity)}</span>
              </div>
              
              <div className="mt-2">
                <span className="text-sm text-gray-600">Cronicidad:</span>
                <span className="ml-2 font-medium">{interpretation.chronicity}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-medium">Distribución</h4>
              <div className="mt-2">
                <span className="text-sm text-gray-600">Patrón:</span>
                <span className="ml-2 font-medium">{interpretDistribution(interpretation.distribution)}</span>
              </div>
              
              <div className="mt-2">
                <span className="text-sm text-gray-600">Lateralidad:</span>
                <span className="ml-2 font-medium">{interpretLaterality(interpretation.laterality)}</span>
              </div>
              
              <div className="mt-2">
                <span className="text-sm text-gray-600">Músculos anormales:</span>
                <span className="ml-2 font-medium">{interpretation.abnormalMuscles.length}</span>
                <span className="ml-1 text-sm text-gray-600">de</span>
                <span className="ml-1 font-medium">{interpretation.abnormalMuscles.length + interpretation.normalMuscles.length}</span>
              </div>
            </div>
          </div>
          
          {/* Resultados de NCS si están disponibles */}
          {emgResults.ncsResults && Object.keys(emgResults.ncsResults).length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Resumen de Estudios de Conducción Nerviosa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(emgResults.ncsResults).map(([nerveId, nerveData]) => {
                  const ncsData = nerveData as NerveConductionData;
                  return (
                    <div key={nerveId} className="bg-gray-50 p-4 rounded border">
                      <h5 className="font-medium">{nerveId}</h5>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Latencia:</span>
                          <span className="font-medium">{ncsData.latency}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Amplitud:</span>
                          <span className="font-medium">{ncsData.amplitude}µV</span>
                        </div>
                        {ncsData.conductionVelocity && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Velocidad de conducción:</span>
                            <span className="font-medium">{ncsData.conductionVelocity}m/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Gráfico visual de los resultados */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Visualización de resultados</h4>
            <div className="h-64 bg-gray-50 p-4 rounded border">
              {/* Aquí se podría implementar un gráfico usando recharts u otra librería */}
              <div className="h-full flex items-center justify-center text-gray-500">
                Visualización gráfica de los resultados EMG
              </div>
            </div>
          </div>
          
          {/* Diagnósticos sugeridos */}
          {interpretation.suggestedDiagnoses.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Diagnósticos sugeridos</h4>
              <div className="space-y-3">
                {interpretation.suggestedDiagnoses.slice(0, 3).map((diagnosis: SuggestedDiagnosis, index: number) => {
                  const diagPattern = diagnosticPatterns[diagnosis.diagnosisId];
                  if (!diagPattern) return null;
                  
                  const confidence = Math.round(diagnosis.confidence * 100);
                  
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">{diagPattern.name}</h5>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                confidence > 70 ? 'bg-green-600' :
                                confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${confidence}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium">{confidence}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{diagPattern.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EMGReportGenerator; 