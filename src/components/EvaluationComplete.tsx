import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { ReportData } from '../types/report';
import { ReportService } from '../services/reportService';
import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';

const EvaluationComplete: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const evaluationData = location.state?.evaluationData as ClinicalEvaluationFormData;
    if (evaluationData) {
      const generatedReport = ReportService.generateReport(evaluationData);
      setReport(generatedReport);
      setLoading(false);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-gray-800 rounded-xl shadow-lg text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-300 mb-8">
            No se encontraron datos de evaluación para generar el reporte.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al Inicio
          </button>
          <div className="flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-400" />
            <span className="text-xl font-bold">Reporte de Evaluación</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{report.patientInfo.name}</h2>
              <p className="text-gray-400">ID: {report.patientInfo.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">Fecha: {new Date(report.patientInfo.date).toLocaleDateString()}</p>
              <p className="text-gray-400">Generado: {new Date(report.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4">Hallazgos Principales</h3>
            <div className="space-y-4">
              {report.summary.mainFindings.map((finding, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-2" />
                  <p className="text-gray-300">{finding}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Sugerencias Diagnósticas</h3>
            <div className="space-y-4">
              {report.summary.diagnosticSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-1 mr-2" />
                  <p className="text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Próximos Pasos</h3>
            <div className="space-y-4">
              {report.summary.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-400 mt-1 mr-2" />
                  <p className="text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Imprimir Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationComplete; 