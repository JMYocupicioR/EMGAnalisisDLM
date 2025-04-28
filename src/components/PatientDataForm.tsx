import React, { useState, useEffect } from 'react';
import { Patient } from '../types/patient';
import { databaseService } from '../services/databaseService';
import { v4 as uuidv4 } from 'uuid';

interface PatientDataFormProps {
  onSubmit: (data: Patient) => void;
  initialData?: Partial<Patient>;
}

const PatientDataForm: React.FC<PatientDataFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Patient>({
    id: initialData?.id || uuidv4(),
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    sex: initialData?.sex || 'male',
    contact: {
      phone: initialData?.contact?.phone || '',
      email: initialData?.contact?.email || '',
      address: initialData?.contact?.address || '',
    },
    medicalHistory: {
      previousDiseases: initialData?.medicalHistory?.previousDiseases || [],
      surgeries: initialData?.medicalHistory?.surgeries || [],
      currentMedications: initialData?.medicalHistory?.currentMedications || [],
      allergies: initialData?.medicalHistory?.allergies || [],
      familyHistory: initialData?.medicalHistory?.familyHistory || '',
    },
    mainDiagnosis: initialData?.mainDiagnosis || '',
    consultReason: initialData?.consultReason || '',
    additionalNotes: initialData?.additionalNotes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.id) {
      loadPatientData(initialData.id);
    }
  }, [initialData?.id]);

  const loadPatientData = async (id: string) => {
    try {
      const patient = await databaseService.getPatient(id);
      if (patient) {
        setFormData(patient);
      }
    } catch (err) {
      setError('Error al cargar los datos del paciente');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validación básica
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        setError('Por favor complete todos los campos requeridos');
        return;
      }

      // Guardar en la base de datos
      await databaseService.savePatient(formData);
      
      // Notificar éxito
      setSuccess('Datos del paciente guardados exitosamente');
      
      // No llamamos a onSubmit aquí, lo haremos cuando el usuario haga clic en continuar
    } catch (err) {
      setError('Error al guardar los datos del paciente');
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
      <h2 className="text-xl font-semibold text-gray-200 mb-6">Datos del Paciente</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 text-green-200 rounded-lg">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sexo *
            </label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">Datos de Contacto</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="contact.email"
                value={formData.contact.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="contact.address"
                value={formData.contact.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200">Antecedentes Médicos</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Motivo de Consulta *
            </label>
            <textarea
              name="consultReason"
              value={formData.consultReason}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Antecedentes Familiares
            </label>
            <textarea
              name="medicalHistory.familyHistory"
              value={formData.medicalHistory.familyHistory}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar Datos
          </button>
          {success && (
            <button
              type="button"
              onClick={() => onSubmit(formData)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientDataForm; 