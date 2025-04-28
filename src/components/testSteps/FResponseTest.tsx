import React, { useState } from 'react';

const FResponseTest = ({ onComplete, referenceValues }) => {
  const [values, setValues] = useState({
    medianF: '',
    ulnarF: ''
  });
  
  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const fResponseDiff = Math.abs(
      parseFloat(values.medianF) - parseFloat(values.ulnarF)
    );
    
    onComplete({
      fResponse: {
        medianF: parseFloat(values.medianF),
        ulnarF: parseFloat(values.ulnarF),
        difference: fResponseDiff
      }
    });
  };
  
  const isDifferenceAbnormal = () => {
    if (!values.medianF || !values.ulnarF) return false;
    const diff = Math.abs(parseFloat(values.medianF) - parseFloat(values.ulnarF));
    return diff > referenceValues.fResponseDiff.max;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latencia F Mediano (ms)
          </label>
          <input
            type="number"
            step="0.1"
            name="medianF"
            value={values.medianF}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latencia F Cubital (ms)
          </label>
          <input
            type="number"
            step="0.1"
            name="ulnarF"
            value={values.ulnarF}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>
      
      {isDifferenceAbnormal() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            La diferencia entre las latencias F es mayor que {referenceValues.fResponseDiff.max} ms, 
            lo cual puede indicar una neuropatía focal.
          </p>
        </div>
      )}
      
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

export default FResponseTest;