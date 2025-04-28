// src/components/patients/PatientForm.tsx
import React, { useState, useEffect } from 'react';
import { Patient, emptyPatient, MedicalHistory, Sex, commonNeuromusculardiseases } from '../../types/patient';
import { saveTemporaryPatient, getTemporaryPatient, clearTemporaryPatient, savePatient } from '../../services/patientService';
import { AlertTriangle, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface PatientFormProps {
  existingPatient?: Patient;
  onSave?: (patient: Patient) => void;
  onCancel?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ 
  existingPatient, 
  onSave, 
  onCancel 
}) => {
  const [patient, setPatient] = useState<Patient>(existingPatient || { ...emptyPatient });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [newDisease, setNewDisease] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [showDiseaseOptions, setShowDiseaseOptions] = useState(false);
  const [filteredDiseases, setFilteredDiseases] = useState(commonNeuromusculardiseases);

  // Cargar datos temporales si existen
  useEffect(() => {
    if (!existingPatient) {
      const tempData = getTemporaryPatient();
      if (tempData) {
        setPatient(prev => ({ ...prev, ...tempData }));
      }
    }
  }, [existingPatient]);

  // Guardar automáticamente datos temporales cuando se modifica el formulario
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!existingPatient) {
        saveTemporaryPatient(patient);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [patient, existingPatient]);

  // Actualizar enfermedades filtradas cuando cambia el input
  useEffect(() => {
    if (diseaseInput.trim()) {
      const filtered = commonNeuromusculardiseases.filter(
        disease => disease.toLowerCase().includes(diseaseInput.toLowerCase())
      );
      setFilteredDiseases(filtered);
    } else {
      setFilteredDiseases(commonNeuromusculardiseases);
    }
  }, [diseaseInput]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPatient(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof Patient],
          [child]: value
        }
      }));
    } else {
      setPatient(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error si el campo se completa
    if (errors[name] && value.trim()) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSexChange = (sex: Sex) => {
    setPatient(prev => ({ ...prev, sex }));
  };

  const handleAddDisease = () => {
    if (newDisease.trim()) {
      setPatient(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          previousDiseases: [...prev.medicalHistory.previousDiseases, newDisease.trim()]
        }
      }));
      setNewDisease('');
    }
  };

  const handleDiseaseSelect = (disease: string) => {
    setPatient(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        previousDiseases: [...prev.medicalHistory.previousDiseases, disease]
      }
    }));
    setDiseaseInput('');
    setShowDiseaseOptions(false);
  };

  const handleRemoveDisease = (index: number) => {
    setPatient(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        previousDiseases: prev.medicalHistory.previousDiseases.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddSurgery = () => {
    if (newSurgery.trim()) {
      setPatient(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          surgeries: [...prev.medicalHistory.surgeries, newSurgery.trim()]
        }
      }));
      setNewSurgery('');
    }
  };

  const handleRemoveSurgery = (index: number) => {
    setPatient(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        surgeries: prev.medicalHistory.surgeries.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setPatient(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          currentMedications: [...prev.medicalHistory.currentMedications, newMedication.trim()]
        }
      }));
      setNewMedication('');
    }
  };

  const handleRemoveMedication = (index: number) => {
    setPatient(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        currentMedications: prev.medicalHistory.currentMedications.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setPatient(prev => ({
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          allergies: [...prev.medicalHistory.allergies, newAllergy.trim()]
        }
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setPatient(prev => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        allergies: prev.medicalHistory.allergies.filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!patient.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }
    
    if (!patient.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }
    
    if (!patient.dateOfBirth) {
      newErrors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(patient.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'La fecha de nacimiento no puede ser futura';
      }
    }
    
    if (!patient.contact.phone.trim()) {
      newErrors['contact.phone'] = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s()-]{7,15}$/.test(patient.contact.phone)) {
      newErrors['contact.phone'] = 'Formato de teléfono inválido';
    }
    
    if (patient.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.contact.email)) {
      newErrors['contact.email'] = 'Formato de email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const savedPatient = savePatient(patient);
      clearTemporaryPatient();
      
      if (onSave) {
        onSave(savedPatient);
      }
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      alert('Ocurrió un error al guardar el paciente. Por favor, intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const calculateAge = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {existingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información personal */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                name="firstName"
                value={patient.firstName}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido*
              </label>
              <input
                type="text"
                name="lastName"
                value={patient.lastName}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID del Paciente (Si aplica)
              </label>
              <input
                type="text"
                name="patientId"
                value={patient.patientId || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento*
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={patient.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full rounded-md border ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
                />
                {patient.dateOfBirth && (
                  <div className="flex items-center bg-gray-100 px-3 rounded">
                    <span className="text-sm text-gray-600">
                      {calculateAge(patient.dateOfBirth)}
                    </span>
                  </div>
                )}
              </div>
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo*
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleSexChange('male')}
                  className={`px-4 py-2 rounded-md ${
                    patient.sex === 'male'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => handleSexChange('female')}
                  className={`px-4 py-2 rounded-md ${
                    patient.sex === 'female'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Femenino
                </button>
                <button
                  type="button"
                  onClick={() => handleSexChange('other')}
                  className={`px-4 py-2 rounded-md ${
                    patient.sex === 'other'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Otro
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información de contacto */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono*
              </label>
              <input
                type="tel"
                name="contact.phone"
                value={patient.contact.phone}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors['contact.phone'] ? 'border-red-500' : 'border-gray-300'
                } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors['contact.phone'] && (
                <p className="mt-1 text-sm text-red-600">{errors['contact.phone']}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="contact.email"
                value={patient.contact.email || ''}
                onChange={handleChange}
                className={`w-full rounded-md border ${
                  errors['contact.email'] ? 'border-red-500' : 'border-gray-300'
                } p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors['contact.email'] && (
                <p className="mt-1 text-sm text-red-600">{errors['contact.email']}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="contact.address"
                value={patient.contact.address || ''}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Historial médico */}
        <div className="bg-gray-50 p-4 rounded-md">
          <button
            type="button"
            className="flex w-full justify-between items-center text-lg font-medium text-left focus:outline-none"
            onClick={() => setShowMedicalHistory(!showMedicalHistory)}
          >
            <span>Historial Médico</span>
            {showMedicalHistory ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {showMedicalHistory && (
            <div className="mt-4 space-y-6">
              {/* Enfermedades previas */}
              <div>
                <h4 className="text-md font-medium mb-2">Enfermedades Previas Relevantes</h4>
                
                <div className="relative mb-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={diseaseInput}
                      onChange={(e) => {
                        setDiseaseInput(e.target.value);
                        setShowDiseaseOptions(e.target.value.trim() !== '');
                      }}
                      onFocus={() => setShowDiseaseOptions(diseaseInput.trim() !== '')}
                      placeholder="Buscar o añadir enfermedad"
                      className="flex-1 rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (diseaseInput.trim()) {
                          handleDiseaseSelect(diseaseInput);
                        }
                      }}
                      className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {showDiseaseOptions && filteredDiseases.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto border border-gray-200">
                      {filteredDiseases.map((disease, idx) => (
                        <li
                          key={idx}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleDiseaseSelect(disease)}
                        >
                          {disease}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                {patient.medicalHistory.previousDiseases.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {patient.medicalHistory.previousDiseases.map((disease, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200"
                      >
                        <span>{disease}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDisease(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No se han añadido enfermedades previas</p>
                )}
              </div>
              
              {/* Cirugías */}
              <div>
                <h4 className="text-md font-medium mb-2">Cirugías Previas</h4>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newSurgery}
                    onChange={(e) => setNewSurgery(e.target.value)}
                    placeholder="Añadir cirugía"
                    className="flex-1 rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSurgery}
                    className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {patient.medicalHistory.surgeries.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {patient.medicalHistory.surgeries.map((surgery, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200"
                      >
                        <span>{surgery}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSurgery(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No se han añadido cirugías</p>
                )}
              </div>
              
              {/* Medicaciones actuales */}
              <div>
                <h4 className="text-md font-medium mb-2">Medicación Actual</h4>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Añadir medicación"
                    className="flex-1 rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {patient.medicalHistory.currentMedications.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {patient.medicalHistory.currentMedications.map((medication, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200"
                      >
                        <span>{medication}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No se han añadido medicaciones</p>
                )}
              </div>
              
              {/* Alergias */}
              <div>
                <h4 className="text-md font-medium mb-2">Alergias</h4>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Añadir alergia"
                    className="flex-1 rounded-l-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="bg-blue-500 text-white px-3 rounded-r-md hover:bg-blue-600"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {patient.medicalHistory.allergies.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {patient.medicalHistory.allergies.map((allergy, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200"
                      >
                        <span>{allergy}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAllergy(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">No se han añadido alergias</p>
                )}
              </div>
              
              {/* Historia familiar */}
              <div>
                <h4 className="text-md font-medium mb-2">Historia Familiar</h4>
                <textarea
                  name="medicalHistory.familyHistory"
                  value={patient.medicalHistory.familyHistory || ''}
                  onChange={handleChange}
                  placeholder="Información sobre enfermedades familiares relevantes"
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Motivo de consulta y diagnóstico */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Motivo de Consulta y Diagnóstico</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de la Consulta
              </label>
              <textarea
                name="consultReason"
                value={patient.consultReason || ''}
                onChange={handleChange}
                placeholder="Describa el motivo por el cual el paciente acude a realizarse el estudio"
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnóstico Principal
              </label>
              <textarea
                name="mainDiagnosis"
                value={patient.mainDiagnosis || ''}
                onChange={handleChange}
                placeholder="Diagnóstico principal o presuntivo"
                className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        {/* Notas adicionales */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium mb-4">Notas Adicionales</h3>
          
          <textarea
            name="additionalNotes"
            value={patient.additionalNotes || ''}
            onChange={handleChange}
            placeholder="Cualquier información adicional relevante para el estudio"
            className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
          />
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {submitting ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Paciente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;