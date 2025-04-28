import React from 'react';
import { diagnosticCategories } from '../data/diagnosticCategories';

const DiagnosticSelector = ({ onSelect }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Selección de Diagnóstico Presuntivo</h2>
      
      {diagnosticCategories.map(category => (
        <div key={category.id} className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{category.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {category.diagnoses.map(diagnosis => (
              <button
                key={diagnosis.id}
                onClick={() => onSelect(diagnosis.id)}
                className="text-left p-3 border rounded hover:bg-blue-50 transition-colors"
              >
                {diagnosis.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiagnosticSelector;