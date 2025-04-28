import React, { useState } from 'react';
import { diagnosticPatterns } from '../data/diagnosticPatterns';
import { protocolSteps } from '../data/protocolSteps';
import { AlertTriangle } from 'lucide-react';

interface StudyProtocolProps {
  diagnosisId: string;
  onDataCollected: (data: any) => void;
}

const StudyProtocol: React.FC<StudyProtocolProps> = ({ diagnosisId, onDataCollected }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedData, setCollectedData] = useState<Record<string, any>>({});

  // Error handling for invalid or missing diagnosisId
  if (!diagnosisId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Error</h2>
        </div>
        <p className="text-gray-600">
          No se ha seleccionado un diagnóstico. Por favor, seleccione un diagnóstico para continuar.
        </p>
      </div>
    );
  }

  const diagnosis = diagnosticPatterns[diagnosisId];
  
  // Error handling for invalid diagnosis
  if (!diagnosis) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Error</h2>
        </div>
        <p className="text-gray-600">
          El diagnóstico seleccionado no es válido. Por favor, seleccione un diagnóstico válido.
        </p>
      </div>
    );
  }

  // Error handling for missing protocol steps
  if (!diagnosis.protocolSteps || diagnosis.protocolSteps.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center text-yellow-600 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Protocolo no disponible</h2>
        </div>
        <p className="text-gray-600">
          No hay pasos de protocolo definidos para este diagnóstico. Por favor, seleccione otro diagnóstico o contacte al administrador.
        </p>
      </div>
    );
  }

  const protocol = diagnosis.protocolSteps.map(stepId => {
    const step = protocolSteps[stepId];
    if (!step) {
      console.warn(`Paso de protocolo "${stepId}" no encontrado`);
      return null;
    }
    return step;
  }).filter(Boolean);

  // Error handling for invalid protocol steps
  if (protocol.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center text-yellow-600 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Error en el protocolo</h2>
        </div>
        <p className="text-gray-600">
          Los pasos del protocolo son inválidos. Por favor, contacte al administrador.
        </p>
      </div>
    );
  }

  const handleStepCompletion = (stepData: any) => {
    const updatedData = { ...collectedData, ...stepData };
    setCollectedData(updatedData);
    
    if (currentStep < protocol.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDataCollected(updatedData);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Protocolo para: {diagnosis.name}</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / protocol.length) * 100}%` }}
            />
          </div>
          <span className="ml-2 text-sm font-medium">
            {currentStep + 1} de {protocol.length}
          </span>
        </div>
      </div>
      
      {protocol[currentStep] && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">{protocol[currentStep].name}</h3>
          <p className="text-gray-600 mb-4">{protocol[currentStep].description}</p>
          
          {protocol[currentStep].component && React.createElement(
            protocol[currentStep].component, 
            { 
              onComplete: handleStepCompletion,
              referenceValues: protocol[currentStep].referenceValues
            }
          )}
        </div>
      )}
    </div>
  );
};

export default StudyProtocol;