import React, { useState } from 'react';

const EMGC6C7Test = ({ onComplete }) => {
  const [muscles, setMuscles] = useState([
    {
      name: '',
      side: 'right',
      insertionActivity: '',
      restActivity: '',
      motorUnitPotentials: '',
      recruitmentPattern: '',
      patientEffort: ''
    },
    {
      name: '',
      side: 'right',
      insertionActivity: '',
      restActivity: '',
      motorUnitPotentials: '',
      recruitmentPattern: '',
      patientEffort: ''
    }
  ]);
  
  const handleChange = (index, field, value) => {
    const updatedMuscles = [...muscles];
    updatedMuscles[index] = {
      ...updatedMuscles[index],
      [field]: value
    };
    setMuscles(updatedMuscles);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      emgC6C7: muscles
    });
  };
  
  const muscleOptions = [
    'Bíceps braquial',
    'Braquiorradial',
    'Pronador redondo',
    'Tríceps (cabeza lateral)',
    'Extensor común de los dedos',
    'Flexor radial del carpo'
  ];
  
  return (
    <form onSubmit={handleSubmit}>
      {muscles.map((muscle, index) => (
        <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            Músculo {index + 1}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Músculo
              </label>
              <select
                value={muscle.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar músculo</option>
                {muscleOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lado
              </label>
              <select
                value={muscle.side}
                onChange={(e) => handleChange(index, 'side', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="right">Derecho</option>
                <option value="left">Izquierdo</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actividad de Inserción
              </label>
              <select
                value={muscle.insertionActivity}
                onChange={(e) => handleChange(index, 'insertionActivity', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar</option>
                <option value="normal">Normal</option>
                <option value="increased">Aumentada</option>
                <option value="decreased">Disminuida</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actividad en Reposo
              </label>
              <select
                value={muscle.restActivity}
                onChange={(e) => handleChange(index, 'restActivity', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar</option>
                <option value="normal">Silencio eléctrico normal</option>
                <option value="fibrillation">Fibrilaciones</option>
                <option value="positive_waves">Ondas positivas agudas</option>
                <option value="fasciculation">Fasciculaciones</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potenciales de Unidad Motora
              </label>
              <select
                value={muscle.motorUnitPotentials}
                onChange={(e) => handleChange(index, 'motorUnitPotentials', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar</option>
                <option value="normal">Normales</option>
                <option value="increased_amplitude">Amplitud aumentada</option>
                <option value="increased_duration">Duración aumentada</option>
                <option value="polyphasic">Polifásicos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patrón de Reclutamiento
              </label>
              <select
                value={muscle.recruitmentPattern}
                onChange={(e) => handleChange(index, 'recruitmentPattern', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar</option>
                <option value="normal">Normal</option>
                <option value="reduced">Reducido</option>
                <option value="early">Precoz</option>
                <option value="discrete">Discreto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Esfuerzo del Paciente
              </label>
              <select
                value={muscle.patientEffort}
                onChange={(e) => handleChange(index, 'patientEffort', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Seleccionar</option>
                <option value="good">Bueno</option>
                <option value="moderate">Moderado</option>
                <option value="poor">Pobre</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continuar
        </button>
      </div>
    </form>
  );
};

export default EMGC6C7Test;