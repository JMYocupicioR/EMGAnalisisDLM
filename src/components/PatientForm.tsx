import React, { useState } from 'react';
import { Patient } from '../types/diagnostic';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { muscleDatabase } from '../data/muscleData';

const PatientForm: React.FC = () => {
  const setPatient = useDiagnosticStore(state => state.setPatient);
  
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedSide, setSelectedSide] = useState<'right' | 'left'>('right');
  const [muscleStrength, setMuscleStrength] = useState<number>(5);
  
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    name: '',
    age: 0,
    gender: 'male',
    clinicalHistory: {
      mainSymptom: '',
      symptoms: [],
      onset: '',
      progression: ''
    },
    physicalExam: {
      muscularTone: {
        description: '',
        location: [],
        severity: 'normal'
      },
      muscularStrength: {
        description: '',
        affectedMuscles: []
      },
      sensitivity: {
        touch: true,
        pain: true,
        temperature: true,
        vibration: true,
        position: true,
        affectedAreas: []
      },
      reflexes: []
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPatient({
      ...formData,
      id: crypto.randomUUID()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSymptomAdd = (symptom: string) => {
    if (symptom.trim()) {
      setFormData(prev => ({
        ...prev,
        clinicalHistory: {
          ...prev.clinicalHistory,
          symptoms: [...prev.clinicalHistory.symptoms, symptom.trim()]
        }
      }));
    }
  };

  const handleAddMuscle = () => {
    if (selectedMuscle && muscleStrength >= 0 && muscleStrength <= 5) {
      setFormData((prev: Omit<Patient, 'id'>) => ({
        ...prev,
        physicalExam: {
          ...prev.physicalExam,
          muscularStrength: {
            ...prev.physicalExam.muscularStrength,
            affectedMuscles: [
              ...prev.physicalExam.muscularStrength.affectedMuscles,
              {
                muscle: `${selectedMuscle} (${selectedSide === 'right' ? 'Derecho' : 'Izquierdo'})`,
                mrcGrade: muscleStrength
              }
            ]
          }
        }
      }));
      setSelectedMuscle('');
      setMuscleStrength(5);
    }
  };

  const handleRemoveMuscle = (index: number) => {
    setFormData((prev: Omit<Patient, 'id'>) => ({
      ...prev,
      physicalExam: {
        ...prev.physicalExam,
        muscularStrength: {
          ...prev.physicalExam.muscularStrength,
          affectedMuscles: prev.physicalExam.muscularStrength.affectedMuscles.filter((_: any, i: number) => i !== index)
        }
      }
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Información del Paciente</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre completo
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Edad
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              max="120"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Género
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>

        {/* Historia Clínica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Historia Clínica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Síntoma Principal
            </label>
            <textarea
              name="clinicalHistory.mainSymptom"
              value={formData.clinicalHistory.mainSymptom}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inicio de los Síntomas
            </label>
            <input
              type="text"
              name="clinicalHistory.onset"
              value={formData.clinicalHistory.onset}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Progresión
            </label>
            <select
              name="clinicalHistory.progression"
              value={formData.clinicalHistory.progression}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seleccione...</option>
              <option value="acute">Aguda (&lt; 4 semanas)</option>
              <option value="subacute">Subaguda (4-8 semanas)</option>
              <option value="chronic">Crónica (&gt; 8 semanas)</option>
            </select>
          </div>
        </div>

        {/* Examen Físico */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Examen Físico</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tono Muscular
            </label>
            <select
              name="physicalExam.muscularTone.severity"
              value={formData.physicalExam.muscularTone.severity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="increased">Aumentado</option>
              <option value="decreased">Disminuido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción del Tono Muscular
            </label>
            <textarea
              name="physicalExam.muscularTone.description"
              value={formData.physicalExam.muscularTone.description}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Fuerza Muscular */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Fuerza Muscular</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Músculo</label>
                <select
                  value={selectedMuscle}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMuscle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Seleccione un músculo</option>
                  {muscleDatabase.map((muscle: { name: string; associatedNerves: string[]; associatedRoots: string[] }) => (
                    <option key={muscle.name} value={muscle.name}>
                      {muscle.name} ({muscle.associatedNerves.join(', ')} - {muscle.associatedRoots.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lado</label>
                <select
                  value={selectedSide}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSide(e.target.value as 'right' | 'left')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="right">Derecho</option>
                  <option value="left">Izquierdo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fuerza (Escala MRC 0-5)
                  <span className="text-xs text-gray-500 ml-1">(Escala de Daniels)</span>
                </label>
                <input
                  type="number"
                  value={muscleStrength}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMuscleStrength(Number(e.target.value))}
                  min="0"
                  max="5"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMuscle}
              disabled={!selectedMuscle}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Agregar Músculo
            </button>

            {/* Lista de músculos evaluados */}
            {formData.physicalExam.muscularStrength.affectedMuscles.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Músculos Evaluados</h5>
                <div className="space-y-2">
                  {formData.physicalExam.muscularStrength.affectedMuscles.map((muscle, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{muscle.muscle}: {muscle.mrcGrade}/5</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMuscle(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continuar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;