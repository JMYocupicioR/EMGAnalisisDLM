import React from 'react';
import { ClinicalEvaluation } from '../types/clinicalEvaluation';

interface ReportGeneratorProps {
  evaluationData: ClinicalEvaluation;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ evaluationData }) => {
  const generateNerveReport = () => {
    const { motor, sensory } = evaluationData.ncsFindings;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Estudio de Conducción Nerviosa</h3>
        
        {/* Nervios Motores */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Nervios Motores</h4>
          {Object.entries(motor).map(([nerveName, data]) => (
            <div key={nerveName} className="border p-3 rounded-lg mb-2">
              <h5 className="font-medium">{nerveName}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Lado:</span> {data.side}
                </div>
                <div>
                  <span className="text-gray-600">Latencia Distal:</span> {data.distalLatency} ms
                </div>
                <div>
                  <span className="text-gray-600">Amplitud:</span> {data.amplitude} mV
                </div>
                <div>
                  <span className="text-gray-600">Velocidad:</span> {data.velocity} m/s
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nervios Sensitivos */}
        <div>
          <h4 className="font-medium mb-2">Nervios Sensitivos</h4>
          {Object.entries(sensory).map(([nerveName, data]) => (
            <div key={nerveName} className="border p-3 rounded-lg mb-2">
              <h5 className="font-medium">{nerveName}</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Lado:</span> {data.side}
                </div>
                <div>
                  <span className="text-gray-600">Amplitud:</span> {data.amplitude} μV
                </div>
                <div>
                  <span className="text-gray-600">Velocidad:</span> {data.velocity} m/s
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const generateMuscleReport = () => {
    const { muscles } = evaluationData.emgFindings;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Estudio de Electromiografía</h3>
        
        {Object.entries(muscles).map(([muscleName, data]) => (
          <div key={muscleName} className="border p-3 rounded-lg mb-4">
            <h4 className="font-medium mb-2">{muscleName} ({data.side})</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Actividad de Inserción */}
              <div>
                <h5 className="font-medium mb-1">Actividad de Inserción</h5>
                <p className="text-sm">{data.insertionalActivity}</p>
              </div>

              {/* Actividad Espontánea */}
              <div>
                <h5 className="font-medium mb-1">Actividad Espontánea</h5>
                <div className="text-sm">
                  <p>Fibrilaciones: {data.spontaneousActivity.fibrillations}</p>
                  <p>Ondas Positivas: {data.spontaneousActivity.positiveWaves}</p>
                  <p>Fasciculaciones: {data.spontaneousActivity.fasciculations}</p>
                </div>
              </div>

              {/* Análisis de MUP */}
              <div>
                <h5 className="font-medium mb-1">Análisis de MUP</h5>
                <div className="text-sm">
                  <p>Duración: {data.mupAnalysis.duration} ms</p>
                  <p>Amplitud: {data.mupAnalysis.amplitude} mV</p>
                  <p>Polifasia: {data.mupAnalysis.polyphasia}</p>
                  <p>Reclutamiento: {data.mupAnalysis.recruitment}</p>
                </div>
              </div>

              {/* Nervios y Raíces Asociados */}
              <div>
                <h5 className="font-medium mb-1">Nervios y Raíces</h5>
                <div className="text-sm">
                  <p>Nervios: {data.associatedNerves?.join(', ')}</p>
                  <p>Raíces: {data.associatedRoots?.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const generateInterpretation = () => {
    // Aquí se puede implementar lógica para generar una interpretación automática
    // basada en los hallazgos de nervios y músculos
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Interpretación</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">
            {/* Aquí iría la interpretación generada */}
            La interpretación se generará automáticamente basada en los hallazgos.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Reporte de Electromiografía</h2>
      
      {/* Información del Paciente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Información del Paciente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm">
              <span className="font-medium">Nombre:</span> {evaluationData.patientInfo.name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Edad:</span> {evaluationData.patientInfo.age}
            </p>
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">ID:</span> {evaluationData.patientInfo.id}
            </p>
            <p className="text-sm">
              <span className="font-medium">Fecha:</span> {evaluationData.patientInfo.date}
            </p>
          </div>
        </div>
      </div>

      {/* Razón del Estudio */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Razón del Estudio</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.reasonsForStudy}</p>
        </div>
      </div>

      {/* Hallazgos Clínicos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Hallazgos Clínicos</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.clinicalFindings}</p>
        </div>
      </div>

      {/* Reportes de Nervios y Músculos */}
      {generateNerveReport()}
      {generateMuscleReport()}

      {/* Interpretación */}
      {generateInterpretation()}

      {/* Diagnóstico */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Diagnóstico</h3>
        <div className="border p-3 rounded-lg">
          <p className="text-sm">{evaluationData.diagnosis}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 