import React, { useState } from 'react';

const UlnarSensoryTest = ({ onComplete, referenceValues }) => {
  const [values, setValues] = useState({
    latency: '',
    amplitude: ''
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
      ulnarSensory: {
        latency: parseFloat(values.latency),
        amplitude: parseFloat(values.amplitude)
      }
    });
  };
  
  const isLatencyAbnormal = values.latency && (
    parseFloat(values.latency) < referenceValues.latency.min || 
    parseFloat(values.latency) > referenceValues.latency.max
  );
  
  const isAmplitudeAbnormal = values.amplitude && (
    parseFloat(values.amplitude) < referenceValues.amplitude.min || 
    parseFloat(values.amplitude) > referenceValues.amplitude.max
  );
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latencia (ms)
          </label>
          <input
            type="number"
            step="0.1"
            name="latency"
            value={values.latency}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isLatencyAbnormal ? 'border-red-500 bg-red-50' : ''}`}
            required
          />
          {isLatencyAbnormal && (
            <p className="text-sm text-red-600 mt-1">
              Valor fuera del rango normal ({referenceValues.latency.min}-{referenceValues.latency.max} ms)
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amplitud (µV)
          </label>
          <input
            type="number"
            step="0.1"
            name="amplitude"
            value={values.amplitude}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isAmplitudeAbnormal ? 'border-red-500 bg-red-50' : ''}`}
            required
          />
          {isAmplitudeAbnormal && (
            <p className="text-sm text-red-600 mt-1">
              Valor fuera del rango normal ({referenceValues.amplitude.min}-{referenceValues.amplitude.max} µV)
            </p>
          )}
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

export default UlnarSensoryTest;