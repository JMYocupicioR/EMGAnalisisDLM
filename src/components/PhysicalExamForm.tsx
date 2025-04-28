import React, { useState, useEffect } from 'react';
import { muscleDatabase } from '../data/muscleData';

interface MuscleEvaluation {
  muscle: string;
  side: 'left' | 'right';
  mrcGrade: number;
  notes?: string;
}

interface PhysicalExamData {
  muscleTone: {
    status: 'normal' | 'increased' | 'decreased';
    description: string;
  };
  muscleStrength: {
    affectedMuscles: MuscleEvaluation[];
  };
  reflexes: {
    biceps: 'normal' | 'increased' | 'decreased' | 'absent';
    triceps: 'normal' | 'increased' | 'decreased' | 'absent';
    patellar: 'normal' | 'increased' | 'decreased' | 'absent';
    achilles: 'normal' | 'increased' | 'decreased' | 'absent';
  };
  coordination: {
    fingerToNose: 'normal' | 'abnormal';
    heelToShin: 'normal' | 'abnormal';
    rapidAlternatingMovements: 'normal' | 'abnormal';
  };
  gait: {
    pattern: 'normal' | 'abnormal';
    description: string;
  };
}

interface PhysicalExamFormProps {
  initialData?: Partial<PhysicalExamData>;
  onSubmit: (data: PhysicalExamData) => void;
  onCancel?: () => void;
}

const PhysicalExamForm: React.FC<PhysicalExamFormProps> = ({ 
  initialData = {}, 
  onSubmit,
  onCancel 
}) => {
  const [formData, setFormData] = useState<PhysicalExamData>({
    muscleTone: {
      status: 'normal',
      description: ''
    },
    muscleStrength: {
      affectedMuscles: []
    },
    reflexes: {
      biceps: 'normal',
      triceps: 'normal',
      patellar: 'normal',
      achilles: 'normal'
    },
    coordination: {
      fingerToNose: 'normal',
      heelToShin: 'normal',
      rapidAlternatingMovements: 'normal'
    },
    gait: {
      pattern: 'normal',
      description: ''
    },
    ...initialData
  });

  // Efecto para actualizar el estado cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedSide, setSelectedSide] = useState<'left' | 'right'>('right');
  const [mrcGrade, setMrcGrade] = useState<number>(5);
  const [muscleNotes, setMuscleNotes] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Agrupar músculos por región
  const musclesByRegion = muscleDatabase.reduce((acc, muscle) => {
    if (!acc[muscle.region]) {
      acc[muscle.region] = [];
    }
    acc[muscle.region].push(muscle);
    return acc;
  }, {} as Record<string, typeof muscleDatabase>);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof PhysicalExamData],
        [field]: value
      }
    }));
  };

  const handleAddMuscle = () => {
    if (!selectedMuscle) {
      setValidationErrors(prev => ({ ...prev, muscle: 'Seleccione un músculo' }));
      return;
    }

    if (mrcGrade < 0 || mrcGrade > 5) {
      setValidationErrors(prev => ({ ...prev, mrcGrade: 'La escala MRC debe estar entre 0 y 5' }));
      return;
    }

    const newMuscle: MuscleEvaluation = {
      muscle: selectedMuscle,
      side: selectedSide,
      mrcGrade,
      notes: muscleNotes
    };

    setFormData(prev => ({
      ...prev,
      muscleStrength: {
        ...prev.muscleStrength,
        affectedMuscles: [...prev.muscleStrength.affectedMuscles, newMuscle]
      }
    }));

    // Reset form
    setSelectedMuscle('');
    setMrcGrade(5);
    setMuscleNotes('');
    setValidationErrors({});
  };

  const handleRemoveMuscle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      muscleStrength: {
        ...prev.muscleStrength,
        affectedMuscles: prev.muscleStrength.affectedMuscles.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que al menos se haya evaluado un músculo
    if (formData.muscleStrength.affectedMuscles.length === 0) {
      setValidationErrors(prev => ({ ...prev, muscleStrength: 'Debe evaluar al menos un músculo' }));
      return;
    }

    // Validar que se haya descrito el tono muscular
    if (!formData.muscleTone.description) {
      setValidationErrors(prev => ({ ...prev, muscleTone: 'Debe describir el tono muscular' }));
      return;
    }

    // Validar que se haya descrito la marcha si es anormal
    if (formData.gait.pattern === 'abnormal' && !formData.gait.description) {
      setValidationErrors(prev => ({ ...prev, gait: 'Debe describir las características de la marcha anormal' }));
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tono Muscular */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Tono Muscular</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Estado</label>
            <select
              name="muscleTone.status"
              value={formData.muscleTone.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="increased">Aumentado</option>
              <option value="decreased">Disminuido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Descripción</label>
            <textarea
              name="muscleTone.description"
              value={formData.muscleTone.description}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describa las características del tono muscular..."
            />
          </div>
        </div>
      </div>

      {/* Fuerza Muscular */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Fuerza Muscular</h3>
        
        {/* Selector de Músculos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Músculo</label>
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccione un músculo</option>
              {Object.entries(musclesByRegion).map(([region, muscles]) => (
                <optgroup key={region} label={region.toUpperCase()}>
                  {muscles.map(muscle => (
                    <option key={muscle.name} value={muscle.name}>
                      {muscle.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {validationErrors.muscle && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.muscle}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Lado</label>
            <select
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value as 'left' | 'right')}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="right">Derecho</option>
              <option value="left">Izquierdo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Escala MRC (0-5)
              <span className="text-xs text-gray-400 ml-1">(Escala de Daniels)</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="5"
                value={mrcGrade}
                onChange={(e) => setMrcGrade(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-sm font-medium text-gray-200">{mrcGrade}/5</span>
            </div>
            {validationErrors.mrcGrade && (
              <p className="mt-1 text-sm text-red-400">{validationErrors.mrcGrade}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300">Notas</label>
          <textarea
            value={muscleNotes}
            onChange={(e) => setMuscleNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Agregue notas sobre la evaluación del músculo..."
          />
        </div>

        <button
          type="button"
          onClick={handleAddMuscle}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Agregar Músculo
        </button>

        {/* Lista de Músculos Evaluados */}
        {formData.muscleStrength.affectedMuscles.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Músculos Evaluados</h4>
            <div className="space-y-2">
              {formData.muscleStrength.affectedMuscles.map((muscle, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div>
                    <p className="font-medium text-gray-200">{muscle.muscle} ({muscle.side === 'right' ? 'Derecho' : 'Izquierdo'})</p>
                    <p className="text-sm text-gray-400">MRC: {muscle.mrcGrade}/5</p>
                    {muscle.notes && (
                      <p className="text-sm text-gray-400 mt-1">{muscle.notes}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMuscle(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reflejos */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Reflejos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.reflexes).map(([reflex, value]) => (
            <div key={reflex}>
              <label className="block text-sm font-medium text-gray-300">
                {reflex.charAt(0).toUpperCase() + reflex.slice(1)}
              </label>
              <select
                name={`reflexes.${reflex}`}
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="increased">Aumentado</option>
                <option value="decreased">Disminuido</option>
                <option value="absent">Ausente</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Coordinación */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Coordinación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(formData.coordination).map(([test, value]) => (
            <div key={test}>
              <label className="block text-sm font-medium text-gray-300">
                {test.split(/(?=[A-Z])/).join(' ')}
              </label>
              <select
                name={`coordination.${test}`}
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="abnormal">Anormal</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Marcha */}
      <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Marcha</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Patrón</label>
            <select
              name="gait.pattern"
              value={formData.gait.pattern}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="abnormal">Anormal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Descripción</label>
            <textarea
              name="gait.description"
              value={formData.gait.description}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describa las características de la marcha..."
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-700 bg-gray-800 py-2 px-4 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default PhysicalExamForm; 