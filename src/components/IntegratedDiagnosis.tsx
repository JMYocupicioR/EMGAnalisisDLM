import React from 'react';
import { IntegratedDiagnosis as IntegratedDiagnosisType } from '../types/clinical';

interface IntegratedDiagnosisProps {
  diagnosis: IntegratedDiagnosisType;
}

const IntegratedDiagnosis: React.FC<IntegratedDiagnosisProps> = ({ diagnosis }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'severe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChronicityText = (chronicity: string) => {
    switch (chronicity) {
      case 'acute':
        return 'Aguda (< 4 semanas)';
      case 'subacute':
        return 'Subaguda (4-8 semanas)';
      case 'chronic':
        return 'Crónica (> 8 semanas)';
      default:
        return chronicity;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico Integrado</h1>
      
      <div className="space-y-8">
        {/* Correlación Clínica */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Correlación Clínica</h2>
          <p className="text-gray-700">{diagnosis.clinicalCorrelation}</p>
        </section>

        {/* Características de la Lesión */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Características de la Lesión</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700">Tipo de Lesión</h3>
              <p className="text-gray-600 capitalize">{diagnosis.lesionType}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700">Tipo de Patología</h3>
              <p className="text-gray-600 capitalize">{diagnosis.pathologyType}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700">Severidad</h3>
              <p className={`capitalize ${getSeverityColor(diagnosis.severity)}`}>
                {diagnosis.severity}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700">Cronicidad</h3>
              <p className="text-gray-600">{getChronicityText(diagnosis.chronicity)}</p>
            </div>
          </div>
        </section>

        {/* Distribución */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Distribución</h2>
          <div className="space-y-2">
            {diagnosis.distribution.map((area, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-600">{area}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Diagnóstico Final */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Diagnóstico Final</h2>
          <p className="text-gray-700 font-medium">{diagnosis.finalDiagnosis}</p>
        </section>

        {/* Recomendaciones */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
          <ul className="list-disc list-inside space-y-2">
            {diagnosis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default IntegratedDiagnosis; 