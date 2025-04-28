import * as React from 'react';
import DiagnosticSelector from '../components/DiagnosticSelector';
import StudyProtocol from '../components/StudyProtocol';
import DiagnosticAnalysis from '../components/DiagnosticAnalysis';
import PatientInfoForm from '../components/PatientInfoForm';
import { useAppStore } from '../store/appStore';

interface PatientInfo {
  // Define la estructura de los datos del paciente
  [key: string]: any;
}

interface StudyData {
  // Define la estructura de los datos del estudio
  [key: string]: any;
}

const NewStudyPage: React.FC = () => {
  const { setStudyStep, setPatientInfo, setSelectedDiagnosis, setStudyData } = useAppStore();
  const [step, setStep] = React.useState<'patient' | 'diagnosis' | 'protocol' | 'analysis'>('patient');
  const [patientInfo, setPatientInfoLocal] = React.useState<PatientInfo | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosisLocal] = React.useState<string | null>(null);
  const [studyData, setStudyDataLocal] = React.useState<StudyData>({});
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  const handlePatientInfoSubmit = (info: PatientInfo) => {
    setPatientInfoLocal(info);
    setPatientInfo(info);
    setShowSuccess(true);
  };
  
  const handleContinue = () => {
    setShowSuccess(false);
    setStep('diagnosis');
    setStudyStep('diagnosis');
  };
  
  const handleDiagnosisSelect = (diagnosisId: string) => {
    setSelectedDiagnosisLocal(diagnosisId);
    setSelectedDiagnosis(diagnosisId);
    setStep('protocol');
    setStudyStep('protocol');
  };
  
  const handleProtocolComplete = (data: StudyData) => {
    setStudyDataLocal(data);
    setStudyData(data);
    setStep('analysis');
    setStudyStep('analysis');
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {step === 'patient' && (
        <div>
          <PatientInfoForm onSubmit={handlePatientInfoSubmit} />
          {showSuccess && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continuar al Diagnóstico
              </button>
            </div>
          )}
        </div>
      )}
      
      {step === 'diagnosis' && (
        <DiagnosticSelector onSelect={handleDiagnosisSelect} />
      )}
      
      {step === 'protocol' && selectedDiagnosis && (
        <StudyProtocol 
          diagnosisId={selectedDiagnosis} 
          onDataCollected={handleProtocolComplete}
        />
      )}
      
      {step === 'analysis' && (
        <DiagnosticAnalysis 
          studyData={studyData}
          initialDiagnosis={selectedDiagnosis}
        />
      )}
      
      {/* Barra de navegación de pasos */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between">
          <button 
            onClick={() => {
              if (step === 'diagnosis') {
                setStep('patient');
                setStudyStep('patient');
              }
              if (step === 'protocol') {
                setStep('diagnosis');
                setStudyStep('diagnosis');
              }
              if (step === 'analysis') {
                setStep('protocol');
                setStudyStep('protocol');
              }
            }}
            disabled={step === 'patient'}
            className={`px-4 py-2 rounded ${step === 'patient' ? 'bg-gray-200 text-gray-500' : 'bg-gray-500 text-white hover:bg-gray-600'}`}
          >
            Atrás
          </button>
          
          <div className="flex space-x-1">
            <div className={`w-3 h-3 rounded-full ${step === 'patient' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'diagnosis' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'protocol' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'analysis' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>

          <button
            onClick={() => {
              if (step === 'patient') {
                setStep('diagnosis');
                setStudyStep('diagnosis');
              } else if (step === 'diagnosis' && selectedDiagnosis) {
                setStep('protocol');
                setStudyStep('protocol');
              } else if (step === 'protocol' && studyData) {
                setStep('analysis');
                setStudyStep('analysis');
              }
            }}
            disabled={
              (step === 'diagnosis' && !selectedDiagnosis) ||
              (step === 'protocol' && !studyData) ||
              step === 'analysis'
            }
            className={`px-4 py-2 rounded ${
              (step === 'diagnosis' && !selectedDiagnosis) ||
              (step === 'protocol' && !studyData) ||
              step === 'analysis'
                ? 'bg-gray-200 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewStudyPage;