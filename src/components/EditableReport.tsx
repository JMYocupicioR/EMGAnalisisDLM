import React, { useState } from 'react';
import { Patient } from '../types/patient';
import { ClinicalEvaluationFormData } from '../types/clinicalEvaluation';

interface EditableReportProps {
  data: ClinicalEvaluationFormData;
  onSave: (data: ClinicalEvaluationFormData) => void;
}

const EditableReport: React.FC<EditableReportProps> = ({ data, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-200">Reporte Clínico</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Información del Paciente */}
        <section>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Información del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input
                type="text"
                name="patientData.firstName"
                value={editedData.patientData?.firstName || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
              <input
                type="text"
                name="patientData.lastName"
                value={editedData.patientData?.lastName || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              />
            </div>
          </div>
        </section>

        {/* Historia Clínica */}
        <section>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Historia Clínica</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Motivo de Consulta</label>
            <textarea
              name="patientData.consultReason"
              value={editedData.patientData?.consultReason || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              rows={3}
            />
          </div>
        </section>

        {/* Examen Físico */}
        <section>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Examen Físico</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tono Muscular</label>
            <textarea
              name="clinicalFindings.muscleTone.description"
              value={editedData.clinicalFindings.muscleTone.description}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              rows={3}
            />
          </div>
        </section>

        {/* Diagnóstico */}
        <section>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Diagnóstico</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Diagnóstico Preliminar</label>
            <textarea
              name="preliminaryDiagnosis"
              value={editedData.preliminaryDiagnosis}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              rows={3}
            />
          </div>
        </section>

        {/* Recomendaciones */}
        <section>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Recomendaciones</h3>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Recomendaciones</label>
            <textarea
              name="recommendations"
              value={editedData.recommendations}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-200 rounded-md"
              rows={3}
            />
          </div>
        </section>

        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableReport; 