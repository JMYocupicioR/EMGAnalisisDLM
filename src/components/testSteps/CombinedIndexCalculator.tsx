import React, { useState } from 'react';

const CombinedIndexCalculator = ({ onComplete, referenceValues }) => {
  const [values, setValues] = useState({
    palmDiff: '',
    ringDiff: '',
    thumbDiff: ''
  });
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const combinedIndex = parseFloat(values.palmDiff) + 
                         parseFloat(values.ringDiff) + 
                         parseFloat(values.thumbDiff);
    
    onComplete({
      combinedIndex: {
        value: combinedIndex,
        components: { ...values }
      }
    });
  };
  
  const isCombinedIndexAbnormal = () => {
    const sum = parseFloat(values.palmDiff || '0') + 
                parseFloat(values.ringDiff || '0') + 
                parseFloat(values.thumbDiff || '0');
    return sum > referenceValues.combinedIndex.max;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diferencia Palmar (PALMDIFF)
          </label>
          <input
            type="number"
            step="0.1"
            name="palmDiff"
            value={values.palmDiff}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diferencia en Dedo Anular (RINGDIFF)
          </label>
          <input
            type="number"
            step="0.1"
            name="ringDiff"
            value={values.ringDiff}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diferencia en Pulgar (THUMBDIFF)
          </label>
          <input
            type="number"
            step="0.1"
            name="thumbDiff"
            value={values.thumbDiff}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>
      
      {isCombinedIndexAbnormal() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            El índice combinado es mayor que {referenceValues.combinedIndex.max}, 
            lo cual sugiere una posible neuropatía del nervio mediano.
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calcular y Continuar
        </button>
      </div>
    </form>
  );
};

export default CombinedIndexCalculator;