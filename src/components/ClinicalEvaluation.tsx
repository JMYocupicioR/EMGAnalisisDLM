import * as React from 'react';
import type { ClinicalEvaluation, NerveData, FWaveData } from '../types/clinical';
import { ClinicalService } from '../services/clinicalService';
import { muscleDatabase } from '../data/muscleData';
import { diagnosticCategories } from '../data/diagnosticCategories';
import { nerveDatabase } from '../data/nerveData';
import SpecialStudiesForm from './SpecialStudiesForm';
import PhysicalExamForm from './PhysicalExamForm';
import ReportGenerator from './ReportGenerator';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { ClinicalEvaluationFormData, ValidationErrors } from '../types/clinicalEvaluation';
import EMGNeedleAnalysis from './EMGNeedleAnalysis';
import InfoLog from './InfoLog';
import { EMGResults } from '../types/emg';
import { LogEntry } from '../types/log';
import PatientDataForm from './PatientDataForm';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import EvaluationComplete from './components/EvaluationComplete';

interface SelectedNerves {
  motor: string[];
  sensory: string[];
}

interface SelectedSides {
  [key: string]: 'left' | 'right';
}

interface SelectedMuscles {
  [muscleName: string]: {
    left: boolean;
    right: boolean;
  };
}

interface MuscleEvaluation {
  side: 'left' | 'right';
  insertionalActivity: 'normal' | 'increased' | 'decreased';
  spontaneousActivity: {
    fibrillations: 'absent' | 'present' | 'increased';
    positiveWaves: 'absent' | 'present' | 'increased';
    fasciculations: 'absent' | 'present' | 'increased';
  };
  mupAnalysis: {
    duration: number;
    amplitude: number;
    polyphasia: 'normal' | 'increased';
    recruitment: 'normal' | 'reduced' | 'early';
  };
  associatedNerves?: string[];
  associatedRoots?: string[];
}

interface EMGFindings {
  muscles: {
    [muscleName: string]: MuscleEvaluation;
  };
}

interface NCSFindings {
  motorNerves: {
    [nerveKey: string]: NerveData;
  };
  sensoryNerves: {
    [nerveKey: string]: NerveData;
  };
  fWaves: {
    [nerveKey: string]: FWaveData;
  };
}

interface ClinicalEvaluationProps {
  patientId: string;
  onSubmit: (data: ClinicalEvaluationFormData) => void;
}

const ClinicalEvaluation: React.FC<ClinicalEvaluationProps> = ({ patientId, onSubmit }: ClinicalEvaluationProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const totalSteps = 5;
  
  // Cargar datos iniciales desde localStorage o crear nuevo estado
  const [formData, setFormData] = React.useState<ClinicalEvaluationFormData>(() => {
    const savedData = localStorage.getItem(`clinicalEvaluationData_${patientId}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      patientData: null,
      reasonForStudy: {
        weakness: {
          present: false,
          distribution: [],
          severity: 'mild',
          progression: '',
          onset: '',
          evolution: '',
          associatedSymptoms: []
        },
        paresthesias: {
          present: false,
          distribution: [],
          characteristics: [],
          duration: '',
          frequency: '',
          triggers: [],
          alleviatingFactors: []
        },
        pain: {
          present: false,
          type: [],
          distribution: [],
          intensity: 0,
          onset: '',
          evolution: '',
          triggers: [],
          alleviatingFactors: []
        },
        sensory: {
          present: false,
          type: [],
          distribution: [],
          severity: 'mild',
          onset: '',
          evolution: '',
          associatedSymptoms: []
        }
      },
      clinicalFindings: {
        muscleTone: {
          status: '',
          description: '',
        },
        muscleStrength: {
          affectedMuscles: [],
        },
        reflexes: {
          biceps: '',
          triceps: '',
          patellar: '',
          achilles: '',
        },
        coordination: {
          fingerToNose: '',
          heelToShin: '',
          rapidAlternatingMovements: '',
        },
        gait: {
          pattern: '',
          description: '',
        },
      },
      preliminaryDiagnosis: '',
      ncsFindings: null,
      emgFindings: null,
      specialStudies: [],
      studyIndications: [],
      recommendedProtocol: 'NCS',
      patientId,
      date: new Date().toISOString().split('T')[0],
      examiner: '',
      clinicalHistory: '',
      physicalExamination: '',
      recommendations: '',
      emgPattern: '',
    };
  });

  // Función para guardar datos en localStorage
  const saveFormData = (data: ClinicalEvaluationFormData) => {
    localStorage.setItem(`clinicalEvaluationData_${patientId}`, JSON.stringify(data));
  };

  // Actualizar localStorage cada vez que cambie formData
  React.useEffect(() => {
    saveFormData(formData);
  }, [formData]);

  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [selectedNerves, setSelectedNerves] = React.useState<SelectedNerves>({
    motor: [],
    sensory: []
  });
  const [selectedSides, setSelectedSides] = React.useState<SelectedSides>({});
  const [selectedMuscles, setSelectedMuscles] = React.useState<SelectedMuscles>({});
  const [showReport, setShowReport] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string>('');
  const [showNerveQuestionnaire, setShowNerveQuestionnaire] = React.useState(false);
  const [showEMGForm, setShowEMGForm] = React.useState(false);
  const [emgData, setEmgData] = React.useState<EMGResults | null>(null);
  const [logEntries, setLogEntries] = React.useState<LogEntry[]>([]);
  const [isFormComplete, setIsFormComplete] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Add initial log entry when component mounts
  React.useEffect(() => {
    addLogEntry('Inicio de evaluación clínica', 'info');
  }, []);

  const addLogEntry = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogEntries((prev: LogEntry[]) => [...prev, { timestamp, message, type }]);
  };

  const handleEMGComplete = (data: EMGResults) => {
    setEmgData(data);
    addLogEntry('Estudio EMG completado', 'success');
    setFormData((prev: ClinicalEvaluationFormData) => ({
      ...prev,
      emgFindings: {
        muscles: {
          'default': {
            side: 'right',
            insertionalActivity: data.insertionalActivity as 'normal' | 'increased' | 'decreased',
            spontaneousActivity: {
              fibrillations: data.spontaneousActivity.fibrillations ? 'present' : 'absent',
              positiveWaves: data.spontaneousActivity.positiveWaves ? 'present' : 'absent',
              fasciculations: data.spontaneousActivity.fasciculations ? 'present' : 'absent'
            },
            mupAnalysis: {
              duration: data.motorUnitPotentials.duration,
              amplitude: data.motorUnitPotentials.amplitude,
              polyphasia: data.motorUnitPotentials.polyphasia > 20 ? 'increased' : 'normal',
              recruitment: data.recruitmentPattern as 'normal' | 'reduced' | 'early'
            },
            associatedNerves: [],
            associatedRoots: []
          }
        }
      }
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'recommendedProtocol') {
      setShowEMGForm(value === 'NCS_EMG');
      addLogEntry(`Protocolo seleccionado: ${value}`, 'info');
      if (value !== 'NCS_EMG') {
        setEmgData(null);
        setFormData(prev => ({
          ...prev,
          emgFindings: null
        }));
      }
    }

    // Add log entries for significant form changes
    if (name.includes('reasonForStudy')) {
      const field = name.split('.')[2];
      if (field === 'present' && checked) {
        const symptom = name.split('.')[1];
        addLogEntry(`Síntoma reportado: ${symptom}`, 'info');
      }
    }

    if (name === 'preliminaryDiagnosis') {
      addLogEntry('Diagnóstico preliminar actualizado', 'info');
    }

    setFormData((prev: ClinicalEvaluationFormData): ClinicalEvaluationFormData => {
      const keys = name.split('.');
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      if (type === 'checkbox') {
        current[lastKey] = checked;
      } else if (type === 'number') {
        current[lastKey] = Number(value);
      } else {
        current[lastKey] = value;
      }

      return newData;
    });
  };

  const distributionOptions = [
    { value: 'localized', label: 'Localizado' },
    { value: 'dermatomal', label: 'Dermatomal' },
    { value: 'nerve_territory', label: 'Territorio Nervioso' },
    { value: 'generalized', label: 'Generalizado' },
    { value: 'upper_limb', label: 'Miembro Superior' },
    { value: 'lower_limb', label: 'Miembro Inferior' },
    { value: 'bilateral', label: 'Bilateral' },
    { value: 'unilateral', label: 'Unilateral' }
  ] as const;

  const paresthesiaCharacteristics = [
    { value: 'tingling', label: 'Hormigueo' },
    { value: 'burning', label: 'Quemazón' },
    { value: 'numbness', label: 'Adormecimiento' },
    { value: 'prickling', label: 'Punzadas' },
    { value: 'electric_shocks', label: 'Descargas Eléctricas' }
  ] as const;

  const painTypes = [
    { value: 'acute', label: 'Agudo' },
    { value: 'chronic', label: 'Crónico' },
    { value: 'burning', label: 'Quemazón' },
    { value: 'stabbing', label: 'Punzante' },
    { value: 'throbbing', label: 'Pulsátil' },
    { value: 'radiating', label: 'Irradiado' }
  ] as const;

  const sensoryTypes = [
    { value: 'hypoesthesia', label: 'Hipoestesia' },
    { value: 'hyperesthesia', label: 'Hiperestesia' },
    { value: 'paresthesia', label: 'Parestesias' },
    { value: 'dysesthesia', label: 'Disestesias' },
    { value: 'allodynia', label: 'Alodinia' }
  ] as const;

  const severityOptions = [
    { value: 'mild', label: 'Leve' },
    { value: 'moderate', label: 'Moderado' },
    { value: 'severe', label: 'Severo' }
  ] as const;

  const handleArrayChange = (name: string, value: string, checked: boolean): void => {
    setFormData((prev: ClinicalEvaluationFormData) => {
      const path = name.split('.');
      const lastKey = path.pop()!;
      let current: any = prev;
      
      for (const key of path) {
        current = current[key];
      }
      
      const currentArray = current[lastKey] as string[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      
      return {
        ...prev,
        [path[0]]: {
          ...prev[path[0]],
          [path[1]]: {
            ...prev[path[0]][path[1]],
            [lastKey]: newArray
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentStep === totalSteps) {
        if (validateForm()) {
          // Generate final report
          const finalReport = generatePreliminaryReport(formData);
          addLogEntry('Reporte final generado', 'info');
          
          // Save final data
          saveFormData(formData);
          addLogEntry('Datos guardados exitosamente', 'success');
          
          // Submit to parent component
          if (typeof onSubmit === 'function') {
            await onSubmit(formData);
            addLogEntry('Evaluación clínica completada exitosamente', 'success');
            
            // Set form as complete
            setIsFormComplete(true);
            
            // Clear saved data
            localStorage.removeItem(`clinicalEvaluationData_${patientId}`);
            
            // Use React Router navigation
            navigate('/evaluation-complete');
          } else {
            throw new Error('onSubmit no es una función válida');
          }
        } else {
          addLogEntry('Error en la validación del formulario', 'error');
        }
      } else {
        // Save intermediate data
        saveFormData(formData);
        setCurrentStep(currentStep + 1);
        addLogEntry(`Avanzando al paso ${currentStep + 1} de ${totalSteps}`, 'info');
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      addLogEntry('Error al procesar el formulario', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      // Guardar datos antes de retroceder
      saveFormData(formData);
      setCurrentStep(currentStep - 1);
      addLogEntry(`Retrocediendo al paso ${currentStep - 1} de ${totalSteps}`, 'info');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validación para el paso 2 (examen físico)
    if (currentStep === 2) {
      if (!formData.clinicalFindings.muscleTone.status) {
        newErrors.muscleTone = 'El tono muscular es requerido';
        addLogEntry('Error: Tono muscular no especificado', 'error');
      }
      if (!formData.clinicalFindings.muscleStrength.affectedMuscles.length) {
        newErrors.muscleStrength = 'Debe especificar al menos un músculo afectado';
        addLogEntry('Error: No se especificaron músculos afectados', 'error');
      }
      if (!formData.clinicalFindings.reflexes.biceps || 
          !formData.clinicalFindings.reflexes.triceps || 
          !formData.clinicalFindings.reflexes.patellar || 
          !formData.clinicalFindings.reflexes.achilles) {
        newErrors.reflexes = 'Todos los reflejos deben ser evaluados';
        addLogEntry('Error: Reflejos incompletos', 'error');
      }
    }

    // Validación para el paso final
    if (currentStep === 4) {
      if (!formData.examiner) {
        newErrors.examiner = 'El examinador es requerido';
        addLogEntry('Error: Examinador no especificado', 'error');
      }
      if (!formData.clinicalHistory) {
        newErrors.clinicalHistory = 'La historia clínica es requerida';
        addLogEntry('Error: Historia clínica incompleta', 'error');
      }
      if (!formData.physicalExamination) {
        newErrors.physicalExamination = 'El examen físico es requerido';
        addLogEntry('Error: Examen físico incompleto', 'error');
      }
      if (!formData.preliminaryDiagnosis) {
        newErrors.preliminaryDiagnosis = 'El diagnóstico preliminar es requerido';
        addLogEntry('Error: Diagnóstico preliminar no especificado', 'error');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para analizar el patrón de electromiografía
  const analyzeEMGPattern = (data: ClinicalEvaluationFormData) => {
    const pattern = {
      weakness: {
        distribution: data.reasonForStudy.weakness.distribution,
        severity: data.reasonForStudy.weakness.severity,
        progression: data.reasonForStudy.weakness.progression
      },
      paresthesias: {
        distribution: data.reasonForStudy.paresthesias.distribution,
        characteristics: data.reasonForStudy.paresthesias.characteristics,
        duration: data.reasonForStudy.paresthesias.duration
      },
      pain: {
        type: data.reasonForStudy.pain.type,
        distribution: data.reasonForStudy.pain.distribution,
        intensity: data.reasonForStudy.pain.intensity
      },
      sensory: {
        type: data.reasonForStudy.sensory.type,
        distribution: data.reasonForStudy.sensory.distribution,
        severity: data.reasonForStudy.sensory.severity
      }
    };

    return pattern;
  };

  // Función para generar el reporte preliminar
  const generatePreliminaryReport = (data: ClinicalEvaluationFormData) => {
    const report = {
      patientInfo: {
        id: data.patientData?.id || data.patientId,
        name: data.patientData ? `${data.patientData.firstName} ${data.patientData.lastName}` : 'No disponible',
        dateOfBirth: data.patientData?.dateOfBirth || 'No disponible',
        sex: data.patientData?.sex || 'No disponible',
        contact: data.patientData?.contact || {
          phone: 'No disponible',
          email: 'No disponible',
          address: 'No disponible'
        }
      },
      clinicalHistory: {
        consultReason: data.patientData?.consultReason || 'No disponible',
        familyHistory: data.patientData?.medicalHistory?.familyHistory || 'No disponible',
        symptoms: {
          weakness: data.reasonForStudy.weakness.present ? {
            distribution: data.reasonForStudy.weakness.distribution.join(', '),
            severity: data.reasonForStudy.weakness.severity,
            progression: data.reasonForStudy.weakness.progression
          } : null,
          paresthesias: data.reasonForStudy.paresthesias.present ? {
            distribution: data.reasonForStudy.paresthesias.distribution.join(', '),
            characteristics: data.reasonForStudy.paresthesias.characteristics.join(', '),
            duration: data.reasonForStudy.paresthesias.duration
          } : null,
          pain: data.reasonForStudy.pain.present ? {
            type: data.reasonForStudy.pain.type.join(', '),
            distribution: data.reasonForStudy.pain.distribution.join(', '),
            intensity: data.reasonForStudy.pain.intensity
          } : null,
          sensory: data.reasonForStudy.sensory.present ? {
            type: data.reasonForStudy.sensory.type.join(', '),
            distribution: data.reasonForStudy.sensory.distribution.join(', '),
            severity: data.reasonForStudy.sensory.severity
          } : null
        }
      },
      physicalExamination: {
        muscleTone: {
          status: data.clinicalFindings.muscleTone.status,
          description: data.clinicalFindings.muscleTone.description
        },
        muscleStrength: {
          affectedMuscles: data.clinicalFindings.muscleStrength.affectedMuscles.map(muscle => ({
            muscle: muscle.muscle,
            side: muscle.side === 'right' ? 'Derecho' : 'Izquierdo',
            mrcGrade: muscle.mrcGrade,
            notes: muscle.notes
          }))
        },
        reflexes: {
          biceps: data.clinicalFindings.reflexes.biceps,
          triceps: data.clinicalFindings.reflexes.triceps,
          patellar: data.clinicalFindings.reflexes.patellar,
          achilles: data.clinicalFindings.reflexes.achilles
        },
        coordination: {
          fingerToNose: data.clinicalFindings.coordination.fingerToNose,
          heelToShin: data.clinicalFindings.coordination.heelToShin,
          rapidAlternatingMovements: data.clinicalFindings.coordination.rapidAlternatingMovements
        },
        gait: {
          pattern: data.clinicalFindings.gait.pattern,
          description: data.clinicalFindings.gait.description
        }
      },
      studies: {
        ncs: data.ncsFindings,
        emg: data.emgFindings,
        specialStudies: data.specialStudies
      },
      diagnosis: {
        preliminary: data.preliminaryDiagnosis,
        emgPattern: data.emgPattern
      },
      recommendations: data.recommendations,
      examiner: data.examiner,
      date: data.date
    };

    return report;
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setShowNerveQuestionnaire(false);
    addLogEntry(`Categoría diagnóstica seleccionada: ${category}`, 'info');
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);
    setShowNerveQuestionnaire(true);
    addLogEntry(`Subcategoría seleccionada: ${subcategory}`, 'info');
  };

  const getRelevantNerves = () => {
    if (!selectedCategory || !selectedSubcategory) return [];

    const nerves = {
      motor: [] as any[],
      sensory: [] as any[]
    };

    switch (selectedCategory) {
      case 'mononeuropatias':
        if (selectedSubcategory === 'upperLimb') {
          nerves.motor = nerveDatabase.filter(nerve => 
            ['median_motor', 'ulnar_motor', 'radial'].includes(nerve.id)
          );
          nerves.sensory = nerveDatabase.filter(nerve => 
            ['median_sensory', 'ulnar_sensory'].includes(nerve.id)
          );
        } else if (selectedSubcategory === 'lowerLimb') {
          nerves.motor = nerveDatabase.filter(nerve => 
            ['peroneal', 'tibial', 'femoral'].includes(nerve.id)
          );
          nerves.sensory = nerveDatabase.filter(nerve => 
            ['sural'].includes(nerve.id)
          );
        }
        break;
      case 'polineuropatias':
        nerves.motor = nerveDatabase.filter(nerve => 
          ['median_motor', 'ulnar_motor', 'peroneal', 'tibial'].includes(nerve.id)
        );
        nerves.sensory = nerveDatabase.filter(nerve => 
          ['median_sensory', 'ulnar_sensory', 'sural'].includes(nerve.id)
        );
        break;
      case 'radiculopatias':
        if (selectedSubcategory === 'cervical') {
          nerves.motor = nerveDatabase.filter(nerve => 
            ['median_motor', 'ulnar_motor', 'radial'].includes(nerve.id)
          );
          nerves.sensory = nerveDatabase.filter(nerve => 
            ['median_sensory', 'ulnar_sensory'].includes(nerve.id)
          );
        } else if (selectedSubcategory === 'lumbar') {
          nerves.motor = nerveDatabase.filter(nerve => 
            ['peroneal', 'tibial'].includes(nerve.id)
          );
          nerves.sensory = nerveDatabase.filter(nerve => 
            ['sural'].includes(nerve.id)
          );
        }
        break;
    }
    return nerves;
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center ${
              index < currentStep - 1 ? 'text-blue-400' : 'text-gray-500'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index < currentStep
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-gray-800 text-gray-400 border-gray-700'
              }`}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`w-full h-1 mx-2 ${
                  index < currentStep - 1 ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between px-2">
        <span className="text-sm font-medium text-gray-300">Datos del Paciente</span>
        <span className="text-sm font-medium text-gray-300">Evaluación Inicial</span>
        <span className="text-sm font-medium text-gray-300">Examen Físico</span>
        <span className="text-sm font-medium text-gray-300">Estudios</span>
        <span className="text-sm font-medium text-gray-300">Diagnóstico</span>
      </div>
    </div>
  );

  const handlePatientDataSubmit = (patientData: Patient) => {
    setFormData(prev => ({
      ...prev,
      patientData,
      patientId: patientData.id
    }));
    setCurrentStep(1);
  };

  const renderStep0 = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Datos del Paciente</h3>
      <PatientDataForm onSubmit={handlePatientDataSubmit} />
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-200">Motivo del Estudio</h3>
      
      {/* Debilidad */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="reasonForStudy.weakness.present"
            checked={formData.reasonForStudy.weakness.present}
            onChange={handleChange}
            className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-200">Debilidad</span>
        </div>
        {formData.reasonForStudy.weakness.present && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Distribución
              </label>
              <select
                name="reasonForStudy.weakness.distribution"
                value={formData.reasonForStudy.weakness.distribution[0] || ''}
                onChange={(e) => handleArrayChange('reasonForStudy.weakness.distribution', e.target.value, true)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              >
                <option value="">Seleccione una opción</option>
                {distributionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Severidad
              </label>
              <select
                name="reasonForStudy.weakness.severity"
                value={formData.reasonForStudy.weakness.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Inicio
              </label>
              <input
                type="text"
                name="reasonForStudy.weakness.onset"
                value={formData.reasonForStudy.weakness.onset}
                onChange={handleChange}
                placeholder="Describa el inicio de los síntomas"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Evolución
              </label>
              <input
                type="text"
                name="reasonForStudy.weakness.evolution"
                value={formData.reasonForStudy.weakness.evolution}
                onChange={handleChange}
                placeholder="Describa la evolución de los síntomas"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Parestesias */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="reasonForStudy.paresthesias.present"
            checked={formData.reasonForStudy.paresthesias.present}
            onChange={handleChange}
            className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-200">Parestesias</span>
        </div>
        {formData.reasonForStudy.paresthesias.present && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Características
              </label>
              <div className="space-y-2">
                {paresthesiaCharacteristics.map(char => (
                  <label key={char.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.reasonForStudy.paresthesias.characteristics.includes(char.value)}
                      onChange={(e) => handleArrayChange('reasonForStudy.paresthesias.characteristics', char.value, e.target.checked)}
                      className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-200">{char.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frecuencia
              </label>
              <input
                type="text"
                name="reasonForStudy.paresthesias.frequency"
                value={formData.reasonForStudy.paresthesias.frequency}
                onChange={handleChange}
                placeholder="Describa la frecuencia de los síntomas"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dolor */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="reasonForStudy.pain.present"
            checked={formData.reasonForStudy.pain.present}
            onChange={handleChange}
            className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-200">Dolor</span>
        </div>
        {formData.reasonForStudy.pain.present && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo de Dolor
              </label>
              <div className="space-y-2">
                {painTypes.map(type => (
                  <label key={type.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.reasonForStudy.pain.type.includes(type.value)}
                      onChange={(e) => handleArrayChange('reasonForStudy.pain.type', type.value, e.target.checked)}
                      className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-200">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Intensidad (0-10)
              </label>
              <input
                type="number"
                name="reasonForStudy.pain.intensity"
                value={formData.reasonForStudy.pain.intensity}
                onChange={handleChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Alteraciones Sensitivas */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="reasonForStudy.sensory.present"
            checked={formData.reasonForStudy.sensory.present}
            onChange={handleChange}
            className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-200">Alteraciones Sensitivas</span>
        </div>
        {formData.reasonForStudy.sensory.present && (
          <div className="pl-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tipo
              </label>
              <div className="space-y-2">
                {sensoryTypes.map(type => (
                  <label key={type.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.reasonForStudy.sensory.type.includes(type.value)}
                      onChange={(e) => handleArrayChange('reasonForStudy.sensory.type', type.value, e.target.checked)}
                      className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-200">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Severidad
              </label>
              <select
                name="reasonForStudy.sensory.severity"
                value={formData.reasonForStudy.sensory.severity}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Examen Físico</h3>
      <PhysicalExamForm
        initialData={formData.clinicalFindings}
        onSubmit={(data: ClinicalEvaluationFormData['clinicalFindings']) => {
          addLogEntry('Datos del examen físico actualizados', 'info');
          setFormData((prev: ClinicalEvaluationFormData) => ({ 
            ...prev, 
            clinicalFindings: data,
            physicalExamination: generatePreliminaryReport({ ...prev, clinicalFindings: data }).physicalExamination
          }));
          // Guardar datos inmediatamente después de actualizar
          localStorage.setItem('clinicalEvaluationData', JSON.stringify({
            ...formData,
            clinicalFindings: data,
            physicalExamination: generatePreliminaryReport({ ...formData, clinicalFindings: data }).physicalExamination
          }));
        }}
        onCancel={() => {
          addLogEntry('Examen físico cancelado', 'warning');
        }}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Estudios Electrofisiológicos</h3>
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h4 className="text-lg font-medium text-gray-200 mb-4">Selección de Protocolo</h4>
        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="recommendedProtocol"
                value="NCS"
                checked={formData.recommendedProtocol === 'NCS'}
                onChange={handleChange}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span>Solo NCS</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="recommendedProtocol"
                value="NCS_EMG"
                checked={formData.recommendedProtocol === 'NCS_EMG'}
                onChange={handleChange}
                className="rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500"
              />
              <span>NCS y EMG</span>
            </label>
          </div>
        </div>
      </div>

      {showEMGForm && (
        <div className="mt-8">
          <EMGNeedleAnalysis onComplete={handleEMGComplete} />
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-200 mb-6">Diagnóstico y Recomendaciones</h3>
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <div className="mb-4">
          <label htmlFor="diagnosticCategory" className="block text-sm font-medium text-gray-300 mb-1">
            Categoría Diagnóstica *
          </label>
          <select
            id="diagnosticCategory"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione una categoría</option>
            {diagnosticCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {selectedCategory && (
          <div className="mb-4">
            <label htmlFor="diagnosticSubcategory" className="block text-sm font-medium text-gray-300 mb-1">
              Subcategoría *
            </label>
            <select
              id="diagnosticSubcategory"
              value={selectedSubcategory}
              onChange={handleSubcategoryChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione una subcategoría</option>
              {diagnosticCategories
                .find(cat => cat.id === selectedCategory)
                ?.subcategories.map(subcat => (
                  <option key={subcat.id} value={subcat.id}>
                    {subcat.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {showNerveQuestionnaire && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Estudio de Neuroconducción</h4>
            
            {/* Nervios Motores */}
            <div className="mb-8">
              <h5 className="text-md font-medium text-gray-200 mb-4">Nervios Motores</h5>
              <div className="space-y-4">
                {getRelevantNerves().motor.map(nerve => (
                  <div key={nerve.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-200 mb-2">{nerve.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lado Derecho */}
                      <div className="space-y-4">
                        <h6 className="text-sm font-medium text-gray-300">Lado Derecho</h6>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Latencia (ms)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.latency.min}-${nerve.referenceValues.latency.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Amplitud (mV)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.amplitude.min}-${nerve.referenceValues.amplitude.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Velocidad (m/s)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.velocity.min}-${nerve.referenceValues.velocity.max}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lado Izquierdo */}
                      <div className="space-y-4">
                        <h6 className="text-sm font-medium text-gray-300">Lado Izquierdo</h6>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Latencia (ms)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.latency.min}-${nerve.referenceValues.latency.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Amplitud (mV)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.amplitude.min}-${nerve.referenceValues.amplitude.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Velocidad (m/s)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.velocity.min}-${nerve.referenceValues.velocity.max}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nervios Sensitivos */}
            <div>
              <h5 className="text-md font-medium text-gray-200 mb-4">Nervios Sensitivos</h5>
              <div className="space-y-4">
                {getRelevantNerves().sensory.map(nerve => (
                  <div key={nerve.id} className="bg-gray-700/50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-200 mb-2">{nerve.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lado Derecho */}
                      <div className="space-y-4">
                        <h6 className="text-sm font-medium text-gray-300">Lado Derecho</h6>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Latencia (ms)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.latency.min}-${nerve.referenceValues.latency.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Amplitud (μV)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.amplitude.min}-${nerve.referenceValues.amplitude.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Velocidad (m/s)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.velocity.min}-${nerve.referenceValues.velocity.max}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lado Izquierdo */}
                      <div className="space-y-4">
                        <h6 className="text-sm font-medium text-gray-300">Lado Izquierdo</h6>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Latencia (ms)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.latency.min}-${nerve.referenceValues.latency.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Amplitud (μV)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.amplitude.min}-${nerve.referenceValues.amplitude.max}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Velocidad (m/s)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
                              placeholder={`${nerve.referenceValues.velocity.min}-${nerve.referenceValues.velocity.max}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="preliminaryDiagnosis" className="block text-sm font-medium text-gray-300 mb-1">
            Diagnóstico Preliminar *
          </label>
          <textarea
            id="preliminaryDiagnosis"
            name="preliminaryDiagnosis"
            value={formData.preliminaryDiagnosis}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-gray-200 ${
              errors.preliminaryDiagnosis ? 'border-red-500' : 'border-gray-700'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
            required
          />
          {errors.preliminaryDiagnosis && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.preliminaryDiagnosis}
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <label htmlFor="recommendations" className="block text-sm font-medium text-gray-300 mb-1">
            Recomendaciones
          </label>
          <textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  // Add loading state to the submit button
  const renderSubmitButton = () => (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center ml-auto ${
        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
      }`}
    >
      {isSubmitting ? (
        <>
          <span className="mr-2">Procesando...</span>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </>
      ) : (
        <>
          {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </>
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 pb-64">
      <form onSubmit={handleSubmit} className="space-y-8">
        {renderProgressBar()}
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 mr-2 transform rotate-180" />
              Anterior
            </button>
          )}
          
          {renderSubmitButton()}
        </div>
      </form>

      {showReport && (
        <ReportGenerator evaluationData={formData} />
      )}
      <div className="fixed bottom-0 left-0 right-0 h-40">
        <InfoLog entries={logEntries} />
      </div>
    </div>
  );
};

export default ClinicalEvaluation;