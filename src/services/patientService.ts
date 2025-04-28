import { Patient } from '../types/patient';
import { storageService } from './unifiedStorageService';

/**
 * Almacena temporalmente un paciente en localStorage
 */
export const saveTemporaryPatient = (patient: Partial<Patient>): void => {
  storageService.saveTemporaryPatient(patient);
};

/**
 * Obtiene el paciente temporal
 */
export const getTemporaryPatient = (): Partial<Patient> | null => {
  return storageService.getTemporaryPatient();
};

/**
 * Limpia el paciente temporal
 */
export const clearTemporaryPatient = (): void => {
  storageService.clearTemporaryPatient();
};

/**
 * Guarda un paciente de forma permanente
 */
export const savePatient = async (patient: Patient): Promise<Patient> => {
  return storageService.savePatient(patient);
};

/**
 * Obtiene todos los pacientes
 */
export const getAllPatients = (): Patient[] => {
  return storageService.getAllPatients();
}; 