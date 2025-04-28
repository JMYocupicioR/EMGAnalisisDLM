import * as React from 'react';
import { Activity, Save, AlertTriangle, FileText, PlusCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { analyzeNerveConduction } from '../utils/analysis';
import DiagnosticPatterns from './DiagnosticPatterns';
import AIAnalysisPanel from './AIAnalysisPanel';
import TrendChart from './TrendChart';
import { saveStudy, getStudies, deleteStudy, saveToLocalStorage, getFromLocalStorage } from '../services/storage';
import type { NerveMeasurement, AnalysisResult, Study, Side } from '../types';
import { nerveReferences } from '../utils/analysis';
import { nerveDatabase, NerveData } from '../data/nerveData';

interface NeuroConductionFormProps {
  onSave: (data: AnalysisResult) => void;
}

interface AnalysisResult {
  nerve: string;
  side: 'right' | 'left';
  measurements: {
    latency: string;
    amplitude: string;
    velocity: string;
    fResponse?: string;
  };
  pattern: string;
  findings: string[];
  commonPathologies: string[];
}

const NeuroConductionForm: React.FC<NeuroConductionFormProps> = ({ onSave }) => {
  // Estados para el formulario
  const [selectedNerve, setSelectedNerve] = React.useState<string | null>(null);
  const [selectedSide, setSelectedSide] = React.useState<'left' | 'right' | 'bilateral'>('bilateral');
  const [questionnaireType, setQuestionnaireType] = React.useState<'NCS' | 'NCS_EMG'>('NCS');
  const [measurements, setMeasurements] = React.useState<NerveMeasurement>({
    nerve: '',
    latency: 0,
    velocity: 0,
    amplitude: 0
  });
  
  // Estados para resultados y UI
  const [studies, setStudies] = React.useState<Study[]>([]);
  const [analysisResult, setAnalysisResult] = React.useState<any>(null);
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<string>('');
  const [emgData, setEmgData] = React.useState<any>({
    insertionalActivity: '',
    spontaneousActivity: {
      fibrillations: false,
      positiveWaves: false,
      fasciculations: false
    },
    motorUnitPotentials: {
      amplitude: 0,
      duration: 0,
      polyphasia: 0
    },
    recruitmentPattern: ''
  });
  
  React.useEffect(() => {
    const loadStudies = async () => {
      try {
        const storedStudies = await getStudies();
        setStudies(storedStudies);
      } catch (error) {
        console.error('Error al cargar estudios:', error);
        // Fallback to localStorage
        const localStudies = getFromLocalStorage();
        setStudies(localStudies);
      }
    };

    loadStudies();
  }, []);
  
  // Manejadores de eventos
  const handleNerveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nerveId = e.target.value;
    setSelectedNerve(nerveId);
    setMeasurements({
      nerve: nerveId,
      latency: 0,
      velocity: 0,
      amplitude: 0
    });
    setValidationErrors({});
  };
  
  const handleSideChange = (side: Side): void => {
    setSelectedSide(side);
  };
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    // Ensure the value is a valid number, defaulting to 0 if invalid
    const numValue = value === '' ? 0 : parseFloat(value);
    
    // Only update if we have a valid number or empty string
    if (!isNaN(numValue) || value === '') {
      setMeasurements((prev: NerveMeasurement) => ({
        ...prev,
        [name]: numValue
      }));
      
      // Reset validation errors for this field
      if (validationErrors[name]) {
        const newErrors = { ...validationErrors };
        delete newErrors[name];
        setValidationErrors(newErrors);
      }
    }
  };
  
  const handleEMGChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const [section, field] = name.split('.');
      setEmgData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: checkbox.checked
        }
      }));
    } else {
      setEmgData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedNerve) {
      errors.nerve = 'Debe seleccionar un nervio';
    }
    
    if (measurements.latency <= 0) {
      errors.latency = 'La latencia debe ser mayor a 0';
    }
    
    if (measurements.amplitude <= 0) {
      errors.amplitude = 'La amplitud debe ser mayor a 0';
    }
    
    if (measurements.velocity <= 0) {
      errors.velocity = 'La velocidad debe ser mayor a 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const nerve = nerveDatabase.find(n => n.id === selectedNerve);
      if (!nerve) return;

      const result = analyzeNerveConduction(selectedNerve, measurements);
      setAnalysisResult(result);
      setShowAnalysis(true);

      const { pattern, findings } = analyzePattern(nerve);
      
      const analysisData = {
        nerve: nerve.name,
        side: selectedSide,
        measurements,
        pattern,
        findings,
        commonPathologies: nerve.commonPathologies,
        type: questionnaireType,
        ...(questionnaireType === 'NCS_EMG' && {
          emgData: {
            insertionalActivity: emgData.insertionalActivity,
            spontaneousActivity: emgData.spontaneousActivity,
            motorUnitPotentials: emgData.motorUnitPotentials,
            recruitmentPattern: emgData.recruitmentPattern
          }
        })
      };

      onSave(analysisData);
      setAnalysis(JSON.stringify(analysisData, null, 2));
    } catch (error) {
      console.error('Error en el análisis:', error);
      setValidationErrors({
        form: 'Ocurrió un error durante el análisis. Verifique los datos ingresados.'
      });
    }
  };
  
  const handleSaveStudy = async (): Promise<void> => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    
    try {
      const newStudy: Study = {
        id: crypto.randomUUID(),
        nerve: selectedNerve,
        side: selectedSide,
        measurements: { ...measurements },
        interpretation: analysisResult.interpretation,
        status: analysisResult.status,
        timestamp: new Date().toISOString()
      };
      
      await saveStudy(newStudy);
      setStudies((prev: Study[]) => [newStudy, ...prev]);
      saveToLocalStorage([newStudy, ...studies]);
      
      // Solo reiniciar el estado de guardado
      setIsSaving(false);
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      setIsSaving(false);
    }
  };
  
  const handleDeleteStudy = async (id: string): Promise<void> => {
    try {
      await deleteStudy(id);
      setStudies((prev: Study[]) => prev.filter((study: Study) => study.id !== id));
      saveToLocalStorage(studies.filter(study => study.id !== id));
    } catch (error) {
      console.error('Error al eliminar el estudio:', error);
      setValidationErrors({
        form: 'Error al eliminar el estudio. Por favor, intente nuevamente.'
      });
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  const getRangeString = (min: number, max: number): string => {
    return `${min}-${max}`;
  };
  
  const getSelectedNerveInfo = (): NerveData | undefined => {
    return nerveDatabase.find(nerve => nerve.id === selectedNerve);
  };
  
  const validateParameter = (parameter: string, value: number, nerveInfo: NerveData | undefined): boolean => {
    if (!nerveInfo) return false;
    
    const { referenceValues } = nerveInfo;
    const range = {
      latency: getRangeString(referenceValues.latency.min, referenceValues.latency.max),
      amplitude: getRangeString(referenceValues.amplitude.min, referenceValues.amplitude.max),
      velocity: getRangeString(referenceValues.velocity.min, referenceValues.velocity.max)
    }[parameter];

    if (!range) return false;
    
    const [min, max] = range.split('-').map(parseFloat);
    return value < min || value > max;
  };
  
  const analyzePattern = (nerve: NerveData) => {
    const { latency, amplitude, velocity } = measurements;
    const lat = parseFloat(latency);
    const amp = parseFloat(amplitude);
    const vel = parseFloat(velocity);

    let pattern = '';
    let findings: string[] = [];

    // Análisis de patrones desmielinizantes
    if (lat > nerve.referenceValues.latency.max && 
        vel < nerve.referenceValues.velocity.min && 
        amp >= nerve.referenceValues.amplitude.min * 0.8) {
      pattern = 'desmielinizante';
      findings = nerve.diagnosticPatterns.demyelinating;
    }
    // Análisis de patrones axonales
    else if (amp < nerve.referenceValues.amplitude.min * 0.8 && 
             lat <= nerve.referenceValues.latency.max * 1.2 && 
             vel >= nerve.referenceValues.velocity.min * 0.8) {
      pattern = 'axonal';
      findings = nerve.diagnosticPatterns.axonal;
    }
    // Análisis de patrones mixtos
    else if (lat > nerve.referenceValues.latency.max * 1.2 && 
             amp < nerve.referenceValues.amplitude.min * 0.8 && 
             vel < nerve.referenceValues.velocity.min * 0.8) {
      pattern = 'mixto';
      findings = nerve.diagnosticPatterns.mixed;
    }

    return {
      pattern,
      findings
    };
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Análisis de Neuroconducciones y EMG</h2>
      
      {!showAnalysis ? (
        <form onSubmit={handleAnalyze} className="space-y-6">
          {validationErrors.form && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{validationErrors.form}</span>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Tipo de Estudio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccione el tipo de estudio <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setQuestionnaireType('NCS')}
                    className={`px-4 py-2 rounded-md ${
                      questionnaireType === 'NCS'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Solo Neuroconducciones
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuestionnaireType('NCS_EMG')}
                    className={`px-4 py-2 rounded-md ${
                      questionnaireType === 'NCS_EMG'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Neuroconducciones + EMG
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nervio a evaluar <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedNerve}
                  onChange={handleNerveChange}
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.nerve ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  <option value="">Seleccionar nervio</option>
                  <optgroup label="Nervios Mixtos">
                    {nerveDatabase
                      .filter(nerve => nerve.type === 'mixed')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(nerve => (
                        <option key={nerve.id} value={nerve.id}>
                          {nerve.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Nervios Motores">
                    {nerveDatabase
                      .filter(nerve => nerve.type === 'motor')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(nerve => (
                        <option key={nerve.id} value={nerve.id}>
                          {nerve.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Nervios Sensitivos">
                    {nerveDatabase
                      .filter(nerve => nerve.type === 'sensory')
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(nerve => (
                        <option key={nerve.id} value={nerve.id}>
                          {nerve.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                {validationErrors.nerve && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nerve}</p>
                )}
                
                {selectedNerve && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Rangos de referencia:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Latencia: {getSelectedNerveInfo()?.referenceValues.latency.min}-{getSelectedNerveInfo()?.referenceValues.latency.max} ms</li>
                      <li>Amplitud: {getSelectedNerveInfo()?.referenceValues.amplitude.min}-{getSelectedNerveInfo()?.referenceValues.amplitude.max} mV</li>
                      <li>Velocidad: {getSelectedNerveInfo()?.referenceValues.velocity.min}-{getSelectedNerveInfo()?.referenceValues.velocity.max} m/s</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lado <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleSideChange('left')}
                    className={`px-4 py-2 rounded-md ${
                      selectedSide === 'left'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Izquierdo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSideChange('right')}
                    className={`px-4 py-2 rounded-md ${
                      selectedSide === 'right'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    Derecho
                  </button>
                </div>
              </div>
            </div>
            
            {selectedNerve && (
              <>
                <h3 className="text-lg font-medium mb-4">Mediciones</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latencia (ms) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="latency"
                      step="0.1"
                      value={measurements.latency || ''}
                      onChange={handleMeasurementChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.latency 
                          ? 'border-red-500 bg-red-50' 
                          : validateParameter('latency', measurements.latency, getSelectedNerveInfo()) && measurements.latency > 0
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.latency ? (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.latency}</p>
                    ) : (
                      validateParameter('latency', measurements.latency, getSelectedNerveInfo()) && measurements.latency > 0 && (
                        <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                      )
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amplitud (mV) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amplitude"
                      step="0.1"
                      value={measurements.amplitude || ''}
                      onChange={handleMeasurementChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.amplitude 
                          ? 'border-red-500 bg-red-50' 
                          : validateParameter('amplitude', measurements.amplitude, getSelectedNerveInfo()) && measurements.amplitude > 0
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.amplitude ? (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.amplitude}</p>
                    ) : (
                      validateParameter('amplitude', measurements.amplitude, getSelectedNerveInfo()) && measurements.amplitude > 0 && (
                        <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                      )
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Velocidad de Conducción (m/s) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="velocity"
                      step="0.1"
                      value={measurements.velocity || ''}
                      onChange={handleMeasurementChange}
                      className={`w-full p-2 border rounded-md ${
                        validationErrors.velocity 
                          ? 'border-red-500 bg-red-50' 
                          : validateParameter('velocity', measurements.velocity, getSelectedNerveInfo()) && measurements.velocity > 0
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.velocity ? (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.velocity}</p>
                    ) : (
                      validateParameter('velocity', measurements.velocity, getSelectedNerveInfo()) && measurements.velocity > 0 && (
                        <p className="mt-1 text-sm text-yellow-600">Valor fuera del rango de referencia</p>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Sección de EMG - Solo visible si se selecciona NCS_EMG */}
            {questionnaireType === 'NCS_EMG' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                <h3 className="text-lg font-medium mb-4">Datos de Electromiografía</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Actividad de Inserción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actividad de Inserción
                    </label>
                    <select
                      name="emgData.insertionalActivity"
                      value={emgData.insertionalActivity}
                      onChange={handleEMGChange}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Seleccione...</option>
                      <option value="normal">Normal</option>
                      <option value="aumentada">Aumentada</option>
                      <option value="disminuida">Disminuida</option>
                      <option value="ausente">Ausente</option>
                    </select>
                  </div>

                  {/* Actividad Espontánea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actividad Espontánea
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emgData.spontaneousActivity.fibrillations"
                          checked={emgData.spontaneousActivity.fibrillations}
                          onChange={handleEMGChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm"
                        />
                        <span className="ml-2">Fibrilaciones</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emgData.spontaneousActivity.positiveWaves"
                          checked={emgData.spontaneousActivity.positiveWaves}
                          onChange={handleEMGChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm"
                        />
                        <span className="ml-2">Ondas Positivas</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="emgData.spontaneousActivity.fasciculations"
                          checked={emgData.spontaneousActivity.fasciculations}
                          onChange={handleEMGChange}
                          className="rounded border-gray-300 text-blue-600 shadow-sm"
                        />
                        <span className="ml-2">Fasciculaciones</span>
                      </label>
                    </div>
                  </div>

                  {/* Potenciales de Unidad Motora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Potenciales de Unidad Motora
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          name="emgData.motorUnitPotentials.amplitude"
                          value={emgData.motorUnitPotentials.amplitude}
                          onChange={handleEMGChange}
                          placeholder="Amplitud (μV)"
                          className="w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="emgData.motorUnitPotentials.duration"
                          value={emgData.motorUnitPotentials.duration}
                          onChange={handleEMGChange}
                          placeholder="Duración (ms)"
                          className="w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="emgData.motorUnitPotentials.polyphasia"
                          value={emgData.motorUnitPotentials.polyphasia}
                          onChange={handleEMGChange}
                          placeholder="Polifasia (%)"
                          className="w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Patrón de Reclutamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patrón de Reclutamiento
                    </label>
                    <select
                      name="emgData.recruitmentPattern"
                      value={emgData.recruitmentPattern}
                      onChange={handleEMGChange}
                      className="w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="">Seleccione...</option>
                      <option value="normal">Normal</option>
                      <option value="reducido">Reducido</option>
                      <option value="aumentado">Aumentado</option>
                      <option value="precoz">Precoz</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!selectedNerve}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Activity className="mr-2 h-5 w-5" />
                Analizar Resultados
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Análisis de {getSelectedNerveInfo()?.name} ({
                selectedSide === 'left' ? 'Izquierdo' : 
                selectedSide === 'right' ? 'Derecho' : 'Bilateral'
              })
            </h3>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAnalysis(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Volver
              </button>
              
              <button
                onClick={handleSaveStudy}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              >
                {isSaving ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Estudio
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Resultados de Neuroconducción */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Interpretación</h4>
              <div className={`p-4 rounded-lg ${
                analysisResult?.status === 'normal' ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <ul className="space-y-1">
                  {analysisResult?.interpretation.map((item: string, index: number) => (
                    <li key={index} className="text-gray-800">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resultados de EMG */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resultados de EMG</h4>
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Actividad de Inserción:</p>
                    <p>{emgData.insertionalActivity || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Actividad Espontánea:</p>
                    <ul className="list-disc pl-5">
                      {emgData.spontaneousActivity.fibrillations && <li>Fibrilaciones</li>}
                      {emgData.spontaneousActivity.positiveWaves && <li>Ondas Positivas</li>}
                      {emgData.spontaneousActivity.fasciculations && <li>Fasciculaciones</li>}
                      {!emgData.spontaneousActivity.fibrillations && 
                       !emgData.spontaneousActivity.positiveWaves && 
                       !emgData.spontaneousActivity.fasciculations && 
                       <li>No se observa actividad espontánea anormal</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Potenciales de Unidad Motora:</p>
                    <ul className="list-disc pl-5">
                      <li>Amplitud: {emgData.motorUnitPotentials.amplitude} μV</li>
                      <li>Duración: {emgData.motorUnitPotentials.duration} ms</li>
                      <li>Polifasia: {emgData.motorUnitPotentials.polyphasia}%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Patrón de Reclutamiento:</p>
                    <p>{emgData.recruitmentPattern || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Conclusión</h4>
              <p className="text-gray-800">
                {analysisResult?.status === 'normal' ? (
                  <span>Los parámetros de conducción del {getSelectedNerveInfo()?.name} se encuentran dentro de los rangos de normalidad.</span>
                ) : (
                  <span>Se observan alteraciones en los parámetros de conducción del {getSelectedNerveInfo()?.name} que sugieren un posible cuadro patológico.</span>
                )}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Observaciones médicas</h4>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Ingrese sus observaciones clínicas o notas adicionales aquí..."
              ></textarea>
            </div>
          </div>
        </div>
      )}
      
      {/* Estudios anteriores */}
      {studies.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Estudios Realizados</h3>
          <div className="space-y-4">
            {studies.map((study: Study) => (
              <div
                key={study.id}
                className={`p-4 rounded-lg border ${
                  study.status === 'normal' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getSelectedNerveInfo()?.name} - Lado {
                        selectedSide === 'left' ? 'Izquierdo' : 
                        selectedSide === 'right' ? 'Derecho' : 'Bilateral'
                      }
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(study.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteStudy(study.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {study.interpretation.map((line: string, index: number) => (
                    <p key={index} className="text-sm text-gray-700">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-gray-500">Mediciones: </span>
                  <span className="text-gray-700">
                    Latencia: {study.measurements.latency}ms, 
                    Amplitud: {study.measurements.amplitude}mV, 
                    Velocidad: {study.measurements.velocity}m/s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sección educativa */}
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium">Recursos para interpretación</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información general */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información sobre las Neuroconducciones
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Las pruebas de neuroconducción son procedimientos utilizados para evaluar el funcionamiento de los nervios periféricos. Miden la velocidad y fuerza con la que las señales eléctricas viajan a través de los nervios.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Latencia:</strong> Tiempo que tarda un impulso nervioso en viajar desde el punto de estimulación hasta el punto de registro (ms).<br />
              <strong>Amplitud:</strong> Tamaño de la respuesta eléctrica, indica la cantidad de fibras nerviosas funcionantes (mV o μV).<br />
              <strong>Velocidad de conducción:</strong> Rapidez con la que se transmite el impulso nervioso (m/s).
            </p>
            
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-800">
              <p className="font-medium">Valores de referencia importantes:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>La velocidad de conducción normal en extremidades superiores es generalmente &gt;50 m/s</li>
                <li>La velocidad de conducción normal en extremidades inferiores es generalmente &gt;40 m/s</li>
                <li>Una diferencia lado-lado &gt;10% debe considerarse significativa</li>
                <li>La temperatura del miembro afecta significativamente los valores (debe mantenerse &gt;32°C)</li>
              </ul>
            </div>
          </div>
          
          {/* Patrones diagnósticos */}
          <DiagnosticPatterns />
        </div>
      </div>

      {analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium text-gray-900">Resultados del Análisis</h3>
          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default NeuroConductionForm;