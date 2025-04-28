import { useState, useEffect } from "react";
import { storageService } from "../services/unifiedStorageService";
import { validationService } from "../services/validationService";
import { v4 as uuidv4 } from "uuid";
import { Patient } from "../types/patient";
import { emptyPatient } from "../types/patient";

interface PatientDataFormProps {
  onSubmit: (patient: Patient) => void;
  initialData?: Partial<Patient>;
}

const PatientDataForm = ({ onSubmit, initialData }: PatientDataFormProps) => {
  const [formData, setFormData] = useState<Patient>({
    ...emptyPatient,
    ...initialData,
    id: initialData?.id || uuidv4(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyPatient,
        ...initialData,
        id: initialData.id || uuidv4(),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.startsWith('contact.')) {
        const field = name.split('.')[1];
        return {
          ...prev,
          contact: {
            ...prev.contact,
            [field]: value
          }
        };
      } else if (name.startsWith('medicalHistory.')) {
        const field = name.split('.')[1];
        // Handle array fields
        if (['previousDiseases', 'surgeries', 'currentMedications', 'allergies'].includes(field)) {
          return {
            ...prev,
            medicalHistory: {
              ...prev.medicalHistory,
              [field]: value.split(',').map(item => item.trim()).filter(item => item !== '')
            }
          };
        }
        // Handle string fields
        return {
          ...prev,
          medicalHistory: {
            ...prev.medicalHistory,
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      validationService.validatePatient(formData);
      const savedPatient = await storageService.savePatient(formData);
      onSubmit(savedPatient);
      setErrors({});
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ [error.name]: error.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
          Fecha de Nacimiento
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
          Sexo
        </label>
        <select
          id="sex"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="tel"
          id="contact.phone"
          name="contact.phone"
          value={formData.contact.phone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors['contact.phone'] && <p className="mt-1 text-sm text-red-600">{errors['contact.phone']}</p>}
      </div>

      <div>
        <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="contact.email"
          name="contact.email"
          value={formData.contact.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="contact.address" className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          id="contact.address"
          name="contact.address"
          value={formData.contact.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory.previousDiseases" className="block text-sm font-medium text-gray-700">
          Enfermedades Previas
        </label>
        <textarea
          id="medicalHistory.previousDiseases"
          name="medicalHistory.previousDiseases"
          value={formData.medicalHistory.previousDiseases.join(', ')}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory.surgeries" className="block text-sm font-medium text-gray-700">
          Cirugías
        </label>
        <textarea
          id="medicalHistory.surgeries"
          name="medicalHistory.surgeries"
          value={formData.medicalHistory.surgeries.join(', ')}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory.currentMedications" className="block text-sm font-medium text-gray-700">
          Medicamentos Actuales
        </label>
        <textarea
          id="medicalHistory.currentMedications"
          name="medicalHistory.currentMedications"
          value={formData.medicalHistory.currentMedications.join(', ')}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory.allergies" className="block text-sm font-medium text-gray-700">
          Alergias
        </label>
        <textarea
          id="medicalHistory.allergies"
          name="medicalHistory.allergies"
          value={formData.medicalHistory.allergies.join(', ')}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory.familyHistory" className="block text-sm font-medium text-gray-700">
          Historia Familiar
        </label>
        <textarea
          id="medicalHistory.familyHistory"
          name="medicalHistory.familyHistory"
          value={formData.medicalHistory.familyHistory}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="mainDiagnosis" className="block text-sm font-medium text-gray-700">
          Diagnóstico Principal
        </label>
        <input
          type="text"
          id="mainDiagnosis"
          name="mainDiagnosis"
          value={formData.mainDiagnosis}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="consultReason" className="block text-sm font-medium text-gray-700">
          Motivo de Consulta
        </label>
        <textarea
          id="consultReason"
          name="consultReason"
          value={formData.consultReason}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
          Notas Adicionales
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default PatientDataForm; 