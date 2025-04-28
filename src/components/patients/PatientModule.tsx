// src/components/patients/PatientModule.tsx
import React, { useState } from 'react';
import { Patient } from '../../types/patient';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import PatientDetails from './PatientDetails';

type ViewMode = 'list' | 'new' | 'edit' | 'details';

interface PatientModuleProps {
  onStartStudyWithPatient: (patient: Patient) => void;
}

const PatientModule: React.FC<PatientModuleProps> = ({ onStartStudyWithPatient }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setViewMode('new');
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('edit');
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  const handlePatientSaved = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  const handleCancel = () => {
    setViewMode('list');
  };

  const handleStartStudy = (patient: Patient) => {
    onStartStudyWithPatient(patient);
  };

  // Renderizar componente según el modo de vista
  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <PatientList
            onNewPatient={handleNewPatient}
            onEditPatient={handleEditPatient}
            onSelectPatient={handleSelectPatient}
          />
        );
      case 'new':
        return (
          <PatientForm
            onSave={handlePatientSaved}
            onCancel={handleCancel}
          />
        );
      case 'edit':
        return (
          <PatientForm
            existingPatient={selectedPatient!}
            onSave={handlePatientSaved}
            onCancel={handleCancel}
          />
        );
      case 'details':
        return (
          <PatientDetails
            patient={selectedPatient!}
            onBack={handleCancel}
            onEdit={handleEditPatient}
            onStartStudy={handleStartStudy}
          />
        );
      default:
        return <PatientList 
          onNewPatient={handleNewPatient}
          onEditPatient={handleEditPatient}
          onSelectPatient={handleSelectPatient}
        />;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  );
};

export default PatientModule;