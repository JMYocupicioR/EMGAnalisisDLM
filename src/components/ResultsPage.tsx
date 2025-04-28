import React, { useState } from 'react';
import { EMGResults, NCSResults, NerveData, FWaveData } from '../types/emg';
import { AlertCircle } from 'lucide-react';

interface ResultsPageProps {
  emgResults: EMGResults | null;
  ncsResults: NCSResults | null;
  onSave: (emgResults: EMGResults | null, ncsResults: NCSResults | null) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ emgResults, ncsResults, onSave }) => {
  const [activeTab, setActiveTab] = useState<'emg' | 'ncs'>('emg');
  const [editedEmgResults, setEditedEmgResults] = useState<EMGResults | null>(emgResults);
  const [editedNcsResults, setEditedNcsResults] = useState<NCSResults | null>(ncsResults);

  const handleEmgChange = (field: string, value: any) => {
    if (editedEmgResults) {
      setEditedEmgResults({
        ...editedEmgResults,
        [field]: value
      });
    }
  };

  const handleNcsChange = (type: 'motor' | 'sensory' | 'fWaves', nerveId: string, side: 'right' | 'left', field: string, value: number) => {
    if (editedNcsResults) {
      setEditedNcsResults({
        ...editedNcsResults,
        [`${type}Nerves`]: {
          ...editedNcsResults[`${type}Nerves`],
          [nerveId]: {
            ...editedNcsResults[`${type}Nerves`][nerveId],
            [side]: {
              ...editedNcsResults[`${type}Nerves`][nerveId][side],
              [field]: value
            }
          }
        }
      });
    }
  };

  const renderEMGResults = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Actividad de Inserción</h3>
        <select
          value={editedEmgResults?.insertionalActivity || 'normal'}
          onChange={(e) => handleEmgChange('insertionalActivity', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
        >
          <option value="normal">Normal</option>
          <option value="increased">Aumentada</option>
          <option value="decreased">Disminuida</option>
        </select>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Actividad Espontánea</h3>
        <div className="space-y-4">
          {['fibrillations', 'positiveWaves', 'fasciculations'].map((activity) => (
            <div key={activity} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editedEmgResults?.spontaneousActivity[activity as keyof typeof editedEmgResults.spontaneousActivity] || false}
                onChange={(e) => handleEmgChange('spontaneousActivity', {
                  ...editedEmgResults?.spontaneousActivity,
                  [activity]: e.target.checked
                })}
                className="rounded border-gray-700 bg-gray-800 text-blue-500"
              />
              <span className="text-gray-200 capitalize">{activity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Potenciales de Unidad Motora</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['duration', 'amplitude', 'polyphasia'].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-300 mb-1 capitalize">{field}</label>
              <input
                type="number"
                value={editedEmgResults?.motorUnitPotentials[field as keyof typeof editedEmgResults.motorUnitPotentials] || 0}
                onChange={(e) => handleEmgChange('motorUnitPotentials', {
                  ...editedEmgResults?.motorUnitPotentials,
                  [field]: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Patrón de Reclutamiento</h3>
        <select
          value={editedEmgResults?.recruitmentPattern || 'normal'}
          onChange={(e) => handleEmgChange('recruitmentPattern', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
        >
          <option value="normal">Normal</option>
          <option value="reduced">Reducido</option>
          <option value="early">Temprano</option>
        </select>
      </div>
    </div>
  );

  const renderNCSResults = () => (
    <div className="space-y-6">
      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Nervios Motores</h3>
        <div className="space-y-4">
          {Object.entries(editedNcsResults?.motorNerves || {}).map(([nerveId, nerve]) => (
            <div key={nerveId} className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-200 mb-4">{nerveId}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['right', 'left'].map((side) => (
                  <div key={side} className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-300">Lado {side === 'right' ? 'Derecho' : 'Izquierdo'}</h5>
                    <div className="grid grid-cols-1 gap-4">
                      {['latency', 'amplitude', 'velocity'].map((field) => (
                        <div key={field}>
                          <label className="block text-sm text-gray-300 mb-1 capitalize">{field}</label>
                          <input
                            type="number"
                            value={nerve[side as 'right' | 'left'][field as keyof NerveData] || 0}
                            onChange={(e) => handleNcsChange('motor', nerveId, side as 'right' | 'left', field, Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Nervios Sensitivos</h3>
        <div className="space-y-4">
          {Object.entries(editedNcsResults?.sensoryNerves || {}).map(([nerveId, nerve]) => (
            <div key={nerveId} className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-200 mb-4">{nerveId}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['right', 'left'].map((side) => (
                  <div key={side} className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-300">Lado {side === 'right' ? 'Derecho' : 'Izquierdo'}</h5>
                    <div className="grid grid-cols-1 gap-4">
                      {['latency', 'amplitude', 'velocity'].map((field) => (
                        <div key={field}>
                          <label className="block text-sm text-gray-300 mb-1 capitalize">{field}</label>
                          <input
                            type="number"
                            value={nerve[side as 'right' | 'left'][field as keyof NerveData] || 0}
                            onChange={(e) => handleNcsChange('sensory', nerveId, side as 'right' | 'left', field, Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Ondas F</h3>
        <div className="space-y-4">
          {Object.entries(editedNcsResults?.fWaves || {}).map(([nerveId, fWave]) => (
            <div key={nerveId} className="bg-gray-700/50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-200 mb-4">{nerveId}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['right', 'left'].map((side) => (
                  <div key={side} className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-300">Lado {side === 'right' ? 'Derecho' : 'Izquierdo'}</h5>
                    <div className="grid grid-cols-1 gap-4">
                      {['latency', 'persistence', 'chronodispersion'].map((field) => (
                        <div key={field}>
                          <label className="block text-sm text-gray-300 mb-1 capitalize">{field}</label>
                          <input
                            type="number"
                            value={fWave[side as 'right' | 'left'][field as keyof FWaveData] || 0}
                            onChange={(e) => handleNcsChange('fWaves', nerveId, side as 'right' | 'left', field, Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('emg')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'emg'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          EMG
        </button>
        <button
          onClick={() => setActiveTab('ncs')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'ncs'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          NCS
        </button>
      </div>

      {activeTab === 'emg' ? renderEMGResults() : renderNCSResults()}

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onSave(editedEmgResults, editedNcsResults)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Guardar Resultados
        </button>
      </div>
    </div>
  );
};

export default ResultsPage; 