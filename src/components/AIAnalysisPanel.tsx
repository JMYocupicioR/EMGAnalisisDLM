// src/components/AIAnalysisPanel.tsx
import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Save, Download } from 'lucide-react';
import { getAIAnalysis, saveAIAnalysis, getAIAnalysisHistory } from '../services/aiAnalysisService';
import { Study } from '../types';

interface AIAnalysisPanelProps {
  study: Study;
  patientInfo?: any;
  onSave?: (analysisText: string) => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ study, patientInfo, onSave }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<{timestamp: string, content: string} | null>(null);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);
  
  // Verificar si hay análisis previos al cargar el componente
  useEffect(() => {
    if (study.id) {
      const prevAnalysis = getAIAnalysisHistory(study.id);
      if (prevAnalysis) {
        setPreviousAnalysis(prevAnalysis);
      }
    }
  }, [study.id]);
  
  const handleRequestAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getAIAnalysis(study, patientInfo);
      setAnalysis(result);
      
      // Guardar el análisis si tiene ID de estudio
      if (study.id) {
        saveAIAnalysis(study.id, result);
        // Actualizar el historial de análisis
        setPreviousAnalysis({
          timestamp: new Date().toISOString(),
          content: result
        });
      }
    } catch (err) {
      setError(`Error al obtener análisis: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAnalysis = () => {
    if (onSave) {
      onSave(analysis);
    }
  };
  
  const handleExportAnalysis = () => {
    // Crear un blob con el texto del análisis
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Crear un enlace y simular clic para descargar
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-ia-${study.nerve}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          Análisis de IA
        </h3>
        
        {previousAnalysis && (
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showPrevious ? 'Ocultar análisis anterior' : 'Ver análisis anterior'}
          </button>
        )}
      </div>
      
      {previousAnalysis && showPrevious && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border text-sm">
          <div className="text-xs text-gray-500 mb-2">
            Análisis generado el {formatTimestamp(previousAnalysis.timestamp)}
          </div>
          <div className="whitespace-pre-wrap">{previousAnalysis.content}</div>
        </div>
      )}
      
      {!analysis && !isLoading && (
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            El análisis de IA utiliza modelos de lenguaje avanzados para proporcionar una interpretación detallada de los resultados del estudio.
          </p>
          
          <button
            onClick={handleRequestAnalysis}
            className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center"
          >
            <Brain className="h-5 w-5 mr-2" />
            Solicitar análisis de IA
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Generando análisis inteligente...</p>
          <p className="text-sm text-gray-500 mt-2">Esto puede tomar hasta 30 segundos</p>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {analysis && !isLoading && (
        <div>
          <div className="border rounded-md p-4 mb-4 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap">{analysis}</div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSaveAnalysis}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar en informe
            </button>
            
            <button
              onClick={handleExportAnalysis}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar análisis
            </button>
            
            <button
              onClick={handleRequestAnalysis}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar nuevo análisis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;