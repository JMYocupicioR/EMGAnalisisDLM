import React, { useState } from 'react';

interface SpecialStudy {
  type: string;
  description: string;
  results: string;
  date: string;
}

interface SpecialStudiesFormProps {
  studies: SpecialStudy[];
  onChange: (studies: SpecialStudy[]) => void;
}

const SpecialStudiesForm: React.FC<SpecialStudiesFormProps> = ({ studies, onChange }) => {
  const [newStudy, setNewStudy] = useState<SpecialStudy>({
    type: '',
    description: '',
    results: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddStudy = () => {
    if (newStudy.type && newStudy.description) {
      onChange([...studies, newStudy]);
      setNewStudy({
        type: '',
        description: '',
        results: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleRemoveStudy = (index: number) => {
    const updatedStudies = studies.filter((_, i) => i !== index);
    onChange(updatedStudies);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Estudios Especiales</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Estudio</label>
          <input
            type="text"
            value={newStudy.type}
            onChange={(e) => setNewStudy({ ...newStudy, type: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ej: RMN, TAC, etc."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            value={newStudy.date}
            onChange={(e) => setNewStudy({ ...newStudy, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          value={newStudy.description}
          onChange={(e) => setNewStudy({ ...newStudy, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Descripción detallada del estudio"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resultados</label>
        <textarea
          value={newStudy.results}
          onChange={(e) => setNewStudy({ ...newStudy, results: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Resultados del estudio"
        />
      </div>

      <button
        type="button"
        onClick={handleAddStudy}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Agregar Estudio
      </button>

      {studies.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="text-md font-semibold">Estudios Agregados</h4>
          {studies.map((study, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{study.type}</h5>
                  <p className="text-sm text-gray-500">{study.date}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStudy(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm">{study.description}</p>
                <p className="text-sm mt-2 font-medium">Resultados:</p>
                <p className="text-sm">{study.results}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpecialStudiesForm;