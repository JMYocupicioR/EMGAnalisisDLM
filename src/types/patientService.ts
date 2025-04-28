// src/services/patientService.ts
import { Patient } from '../types/patient';

const STORAGE_KEY = 'emg_patients';

/**
 * Almacena temporalmente un paciente en localStorage
 */
export const saveTemporaryPatient = (patient: Partial<Patient>): void => {
  localStorage.setItem('emg_temp_patient', JSON.stringify(patient));
};

/**
 * Recupera un paciente guardado temporalmente
 */
export const getTemporaryPatient = (): Partial<Patient> | null => {
  const tempPatient = localStorage.getItem('emg_temp_patient');
  return tempPatient ? JSON.parse(tempPatient) : null;
};

/**
 * Elimina los datos temporales del paciente
 */
export const clearTemporaryPatient = (): void => {
  localStorage.removeItem('emg_temp_patient');
};

/**
 * Guarda un paciente de forma permanente
 */
export const savePatient = (patient: Patient): Patient => {
  const patients = getAllPatients();
  
  // Si el paciente no tiene ID, generar uno
  if (!patient.id) {
    patient.id = crypto.randomUUID();
  }
  
  // Establecer fechas de creación/actualización
  const now = new Date().toISOString();
  if (!patient.createdAt) {
    patient.createdAt = now;
  }
  patient.updatedAt = now;
  
  // Añadir/Actualizar paciente
  const existingIndex = patients.findIndex(p => p.id === patient.id);
  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
  } else {
    patients.push(patient);
  }
  
  // Guardar todos los pacientes
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  
  return patient;
};

/**
 * Obtiene todos los pacientes
 */
export const getAllPatients = (): Patient[] => {
  const patientsJson = localStorage.getItem(STORAGE_KEY);
  return patientsJson ? JSON.parse(patientsJson) : [];
};

/**
 * Obtiene un paciente por su ID
 */
export const getPatientById = (id: string): Patient | undefined => {
  const patients = getAllPatients();
  return patients.find(patient => patient.id === id);
};

/**
 * Busca pacientes según un término de búsqueda
 * Busca en nombre, apellido, ID de paciente o diagnóstico principal
 */
export const searchPatients = (searchTerm: string): Patient[] => {
  if (!searchTerm.trim()) return getAllPatients();
  
  const patients = getAllPatients();
  const term = searchTerm.toLowerCase();
  
  return patients.filter(patient => 
    patient.firstName.toLowerCase().includes(term) ||
    patient.lastName.toLowerCase().includes(term) ||
    (patient.patientId && patient.patientId.toLowerCase().includes(term)) ||
    (patient.mainDiagnosis && patient.mainDiagnosis.toLowerCase().includes(term))
  );
};

/**
 * Elimina un paciente
 */
export const deletePatient = (id: string): void => {
  const patients = getAllPatients();
  const updatedPatients = patients.filter(patient => patient.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
};

/**
 * En una aplicación real, aquí implementaríamos métodos para 
 * sincronización con un backend (cuando haya conexión disponible)
 */