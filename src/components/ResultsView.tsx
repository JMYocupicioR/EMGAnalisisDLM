import React from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { AnalysisResult, Study } from '../types';

interface ResultsViewProps {
  analysisResult: AnalysisResult | null;
  currentStudy: Study | null;
  isLoading: boolean;
  error: string | null;
}

const ResultsView: React.FC<ResultsViewProps> = ({
  analysisResult,
  currentStudy,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="animate-spin h-8 w-8 text-blue-600 mr-2" />
        <span className="text-gray-600">Analizando resultados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-red-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
        <span className="text-red-600">{error}</span>
      </div>
    );
  }

  if (!analysisResult || !currentStudy) {
    return (
      <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
        <span className="text-yellow-600">No hay resultados disponibles</span>
      </div>
    );
  }

  const { status, interpretation, suggestedDiagnosis, findings, recommendations } = analysisResult;

  return (
    <div className="space-y-6">
      {/* Estado del análisis */}
      <div className={`p-4 rounded-lg ${
        status === 'normal' ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center">
          {status === 'normal' ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <span className={`font-medium ${
            status === 'normal' ? 'text-green-700' : 'text-yellow-700'
          }`}>
            {status === 'normal' ? 'Resultados Normales' : 'Resultados Anormales'}
          </span>
        </div>
      </div>

      {/* Interpretación */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-2">Interpretación</h3>
        <ul className="space-y-1">
          {Array.isArray(interpretation) && interpretation.map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>

      {/* Diagnóstico sugerido */}
      {Array.isArray(suggestedDiagnosis) && suggestedDiagnosis.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">Diagnóstico Sugerido</h3>
          <ul className="space-y-1">
            {suggestedDiagnosis.map((diagnosis, index) => (
              <li key={index} className="text-gray-700">{diagnosis}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hallazgos */}
      {Array.isArray(findings) && findings.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">Hallazgos</h3>
          <ul className="space-y-1">
            {findings.map((finding, index) => (
              <li key={index} className="text-gray-700">{finding}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendaciones */}
      {Array.isArray(recommendations) && recommendations.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">Recomendaciones</h3>
          <ul className="space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mediciones */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-900 mb-2">Mediciones</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="block text-sm text-gray-500">Latencia</span>
            <span className="text-lg font-medium text-gray-900">
              {currentStudy.measurements.latency} ms
            </span>
          </div>
          <div>
            <span className="block text-sm text-gray-500">Amplitud</span>
            <span className="text-lg font-medium text-gray-900">
              {currentStudy.measurements.amplitude} mV
            </span>
          </div>
          <div>
            <span className="block text-sm text-gray-500">Velocidad</span>
            <span className="text-lg font-medium text-gray-900">
              {currentStudy.measurements.velocity} m/s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView; 