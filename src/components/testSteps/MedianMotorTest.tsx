import React, { useState } from 'react';

const MedianMotorTest = ({ onComplete, referenceValues }) => {
  const [values, setValues] = useState({
    latency: '',
    amplitude: '',
    velocity: ''
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
      medianMotor: {
        latency: parseFloat(values.latency),
        amplitude: parseFloat(values.amplitude),
        velocity: parseFloat(values.velocity)
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

  const isVelocityAbnormal = values.velocity && (
    parseFloat(values.velocity) < referenceValues.velocity.min || 
    parseFloat(values.velocity) > referenceValues.velocity.max
  );
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            Amplitud (mV)
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
              Valor fuera del rango normal ({referenceValues.amplitude.min}-{referenceValues.amplitude.max} mV)
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Velocidad (m/s)
          </label>
          <input
            type="number"
            step="0.1"
            name="velocity"
            value={values.velocity}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${isVelocityAbnormal ? 'border-red-500 bg-red-50' : ''}`}
            required
          />
          {isVelocityAbnormal && (
            <p className="text-sm text-red-600 mt-1">
              Valor fuera del rango normal ({referenceValues.velocity.min}-{referenceValues.velocity.max} m/s)
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

export default MedianMotorTest;