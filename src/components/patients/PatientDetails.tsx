// src/components/patients/PatientDetails.tsx
import React, { useState } from 'react';
import { Patient } from '../../types/patient';
import { PatientStudy } from '../../services/patientStudyService';
import PatientStudies from './PatientStudies';
import { Edit, ChevronLeft, Activity } from 'lucide-react';

interface PatientDetailsProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
  onStartStudy: (patient: Patient) => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onBack,
  onEdit,
  onStartStudy
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  const [selectedStudy, setSelectedStudy] = useState<PatientStudy | null>(null);

  const handleViewStudy = (study: PatientStudy) => {
    setSelectedStudy(study);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver a la lista
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(patient)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </button>
          
          <button
            onClick={() => onStartStudy(patient)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <Activity className="mr-2 h-4 w-4" />
            Iniciar Estudio ENMG
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {patient.lastName}, {patient.firstName}
        </h1>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          {patient.patientId && (
            <span className="mr-3">ID: {patient.patientId}</span>
          )}
          <span className="mr-3">
            {patient.sex === 'male' ? 'Masculino' : patient.sex === 'female' ? 'Femenino' : 'Otro'}
          </span>
          <span>
            {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)})
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Información de Contacto</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Teléfono:</span>
                  <span className="text-base text-gray-900">{patient.contact.phone}</span>
                </div>
                
                {patient.contact.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Email:</span>
                    <span className="text-base text-gray-900">{patient.contact.email}</span>
                  </div>
                )}
                
                {patient.contact.address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Dirección:</span>
                    <span className="text-base text-gray-900">{patient.contact.address}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
          
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Consulta</h2>
            <div className="bg-gray-50 rounded-md p-4">
              {patient.consultReason ? (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500 block mb-1">Motivo de consulta:</span>
                  <div className="text-base text-gray-900 whitespace-pre-line">
                    {patient.consultReason}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">No se ha registrado motivo de consulta</p>
              )}
              
              {patient.mainDiagnosis && (
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-1">Diagnóstico principal:</span>
                  <div className="text-base text-gray-900 whitespace-pre-line">
                    {patient.mainDiagnosis}
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {patient.additionalNotes && (
            <section className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Notas Adicionales</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="text-base text-gray-900 whitespace-pre-line">
                  {patient.additionalNotes}
                </div>
              </div>
            </section>
          )}
        </div>
        
        <div>
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Historial Médico</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Enfermedades previas:</span>
                  {patient.medicalHistory.previousDiseases.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-base text-gray-900">
                      {patient.medicalHistory.previousDiseases.map((disease, idx) => (
                        <li key={idx}>{disease}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No se han registrado enfermedades previas</p>
                  )}
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Cirugías:</span>
                  {patient.medicalHistory.surgeries.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-base text-gray-900">
                      {patient.medicalHistory.surgeries.map((surgery, idx) => (
                        <li key={idx}>{surgery}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No se han registrado cirugías</p>
                  )}
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Medicación actual:</span>
                  {patient.medicalHistory.currentMedications.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-base text-gray-900">
                      {patient.medicalHistory.currentMedications.map((medication, idx) => (
                        <li key={idx}>{medication}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No se ha registrado medicación actual</p>
                  )}
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 block mb-2">Alergias:</span>
                  {patient.medicalHistory.allergies.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-base text-gray-900">
                      {patient.medicalHistory.allergies.map((allergy, idx) => (
                        <li key={idx}>{allergy}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No se han registrado alergias</p>
                  )}
                </div>
                
                {patient.medicalHistory.familyHistory && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 block mb-2">Historia familiar:</span>
                    <div className="text-base text-gray-900 whitespace-pre-line">
                      {patient.medicalHistory.familyHistory}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">Información de Registro</h2>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Fecha de registro:</span>
                  <span className="text-base text-gray-900">{formatDate(patient.createdAt)}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500 block">Última actualización:</span>
                  <span className="text-base text-gray-900">{formatDate(patient.updatedAt)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Sección de estudios del paciente */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <PatientStudies 
          patient={patient} 
          onViewStudy={handleViewStudy} 
        />
      </div>
      
      {/* Modal para ver detalles del estudio */}
      {selectedStudy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles del Estudio: {selectedStudy.studyType === 'neuroconduction' 
                  ? 'Neuroconducciones' 
                  : selectedStudy.studyType === 'myography' 
                    ? 'Miografía de Aguja' 
                    : 'Estudios Especiales'}
              </h3>
              <button
                onClick={() => setSelectedStudy(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Fecha: {new Date(selectedStudy.timestamp).toLocaleString()}
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Resultados del Estudio</h4>
              {/* Aquí mostrarías los detalles específicos según el tipo de estudio */}
              <pre className="text-sm overflow-x-auto bg-gray-50 p-3 rounded">
                {JSON.stringify(selectedStudy.studyData, null, 2)}
              </pre>
            </div>
            
            {selectedStudy.observations && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedStudy.observations}
                </p>
              </div>
            )}
            
            {selectedStudy.conclusion && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Conclusión</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedStudy.conclusion}
                </p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedStudy(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;