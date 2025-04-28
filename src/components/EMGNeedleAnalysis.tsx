import React from 'react';
import type { EMGResults } from '../types/clinical';
import { ClinicalService } from '../services/clinicalService';

interface EMGNeedleAnalysisProps {
  onComplete: (data: EMGResults) => void;
}

const EMGNeedleAnalysis: React.FC<EMGNeedleAnalysisProps> = ({ onComplete }: EMGNeedleAnalysisProps) => {
  const [formData, setFormData] = React.useState<EMGResults>({
    insertionalActivity: '',
    spontaneousActivity: {
      fibrillations: false,
      positiveWaves: false,
      fasciculations: false
    },
    motorUnitPotentials: {
      amplitude: 0,
      duration: 0,
      polyphasia: 0
    },
    recruitmentPattern: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      ClinicalService.validateEMGResults(formData);
      onComplete(formData);
    } catch (error) {
      console.error('Error en la validación:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name.includes('.')) {
      const [section, subsection, field] = name.split('.');
      setFormData((prev: EMGResults) => {
        const newData = { ...prev };
        if (section === 'spontaneousActivity') {
          newData.spontaneousActivity = {
            ...prev.spontaneousActivity,
            [field]: type === 'checkbox' ? checked : value
          };
        } else if (section === 'motorUnitPotentials') {
          newData.motorUnitPotentials = {
            ...prev.motorUnitPotentials,
            [field]: parseFloat(value)
          };
        } else {
          newData[section as keyof EMGResults] = value;
        }
        return newData;
      });
    } else {
      setFormData((prev: EMGResults) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Evaluación de Electromiografía con Aguja</h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Actividad de Inserción */}
        <section className="space-y-4">
          <h4 className="text-lg font-medium text-gray-200">Actividad de Inserción</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descripción
            </label>
            <select
              name="insertionalActivity"
              value={formData.insertionalActivity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="aumentada">Aumentada</option>
              <option value="disminuida">Disminuida</option>
              <option value="ausente">Ausente</option>
            </select>
          </div>
        </section>

        {/* Actividad Espontánea */}
        <section className="space-y-4">
          <h4 className="text-lg font-medium text-gray-200">Actividad Espontánea</h4>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="spontaneousActivity.fibrillations"
                checked={formData.spontaneousActivity.fibrillations}
                onChange={handleChange}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-200">Fibrilaciones</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="spontaneousActivity.positiveWaves"
                checked={formData.spontaneousActivity.positiveWaves}
                onChange={handleChange}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-200">Ondas Positivas</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="spontaneousActivity.fasciculations"
                checked={formData.spontaneousActivity.fasciculations}
                onChange={handleChange}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-200">Fasciculaciones</span>
            </label>
          </div>
        </section>

        {/* Potenciales de Unidad Motora */}
        <section className="space-y-4">
          <h4 className="text-lg font-medium text-gray-200">Potenciales de Unidad Motora</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amplitud (μV)
              </label>
              <input
                type="number"
                name="motorUnitPotentials.amplitude"
                value={formData.motorUnitPotentials.amplitude}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Duración (ms)
              </label>
              <input
                type="number"
                name="motorUnitPotentials.duration"
                value={formData.motorUnitPotentials.duration}
                onChange={handleChange}
                step="0.1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Polifasia (%)
              </label>
              <input
                type="number"
                name="motorUnitPotentials.polyphasia"
                value={formData.motorUnitPotentials.polyphasia}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Patrón de Reclutamiento */}
        <section className="space-y-4">
          <h4 className="text-lg font-medium text-gray-200">Patrón de Reclutamiento</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descripción
            </label>
            <select
              name="recruitmentPattern"
              value={formData.recruitmentPattern}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione...</option>
              <option value="normal">Normal</option>
              <option value="reducido">Reducido</option>
              <option value="precoz">Precoz</option>
              <option value="discreto">Discreto</option>
            </select>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Guardar Evaluación
          </button>
        </div>
      </form>
    </div>
  );
};

export default EMGNeedleAnalysis; 