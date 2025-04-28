import React, { useState } from 'react';

const EMGTest = ({ onComplete }) => {
  const [values, setValues] = useState({
    insertionActivity: '',
    restActivity: '',
    motorUnitPotentials: '',
    recruitmentPattern: '',
    patientEffort: ''
  });
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete({
      emg: { ...values }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actividad de Inserción
          </label>
          <select
            name="insertionActivity"
            value={values.insertionActivity}
            onChange={handleChange}
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
            name="restActivity"
            value={values.restActivity}
            onChange={handleChange}
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
            name="motorUnitPotentials"
            value={values.motorUnitPotentials}
            onChange={handleChange}
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
            name="recruitmentPattern"
            value={values.recruitmentPattern}
            onChange={handleChange}
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
            name="patientEffort"
            value={values.patientEffort}
            onChange={handleChange}
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

export default EMGTest;