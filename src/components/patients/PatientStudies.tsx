// src/components/patients/PatientStudies.tsx
import React, { useState, useEffect } from 'react';
import { Patient } from '../../types/patient';
import { PatientStudy, getPatientStudies } from '../../services/patientStudyService';
import { Activity, Brain, FileText, Download, Trash2, Eye } from 'lucide-react';

interface PatientStudiesProps {
  patient: Patient;
  onViewStudy?: (study: PatientStudy) => void;
}

const PatientStudies: React.FC<PatientStudiesProps> = ({
  patient,
  onViewStudy
}) => {
  const [studies, setStudies] = useState<PatientStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudies();
  }, [patient]);

  const loadStudies = () => {
    setIsLoading(true);
    const patientStudies = getPatientStudies(patient.id);
    setStudies(patientStudies);
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const getStudyTypeIcon = (studyType: string) => {
    switch (studyType) {
      case 'neuroconduction':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'myography':
        return <Brain className="h-5 w-5 text-indigo-500" />;
      case 'special':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStudyTypeName = (studyType: string) => {
    switch (studyType) {
      case 'neuroconduction':
        return 'Neuroconducciones';
      case 'myography':
        return 'Miografía de Aguja';
      case 'special':
        return 'Estudios Especiales';
      default:
        return 'Estudio';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Cargando estudios...</p>
      </div>
    );
  }

  if (studies.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-2">No hay estudios registrados para este paciente</p>
        <p className="text-sm text-gray-500">
          Cuando realice estudios para este paciente, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Estudios Realizados</h2>
      
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {studies.map((study) => (
            <li key={study.id}>
              <div className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStudyTypeIcon(study.studyType)}
                      <p className="ml-2 truncate text-sm font-medium text-gray-900">
                        {getStudyTypeName(study.studyType)}
                      </p>
                    </div>
                    <div className="ml-2 flex flex-shrink-0 space-x-2">
                      <button
                        onClick={() => onViewStudy && onViewStudy(study)}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 hover:bg-blue-200"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          // Implementar descarga de informe
                          console.log('Descargar informe:', study.id);
                        }}
                        className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 hover:bg-green-200"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Informe
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Fecha: {formatDate(study.timestamp)}
                      </p>
                    </div>
                  </div>
                  {study.conclusion && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 font-medium">Conclusión:</p>
                      <p className="text-sm text-gray-500 mt-1">{study.conclusion}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientStudies;