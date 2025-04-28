import { Patient, Study, PatientStudy } from '../types';
import { emptyPatient } from '../types/patient';

export class ValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  public validatePatient(patient: Partial<Patient>): void {
    if (!patient.firstName?.trim()) {
      throw new ValidationError('El nombre es requerido', 'firstName');
    }
    if (!patient.lastName?.trim()) {
      throw new ValidationError('El apellido es requerido', 'lastName');
    }
    if (!patient.dateOfBirth) {
      throw new ValidationError('La fecha de nacimiento es requerida', 'dateOfBirth');
    }
    if (patient.dateOfBirth && new Date(patient.dateOfBirth) > new Date()) {
      throw new ValidationError('La fecha de nacimiento no puede ser futura', 'dateOfBirth');
    }
    if (!patient.contact?.phone?.trim()) {
      throw new ValidationError('El teléfono es requerido', 'contact.phone');
    }
  }

  public validateStudy(study: Partial<Study>): void {
    if (!study.type) {
      throw new ValidationError('El tipo de estudio es requerido', 'type');
    }
    if (!study.date) {
      throw new ValidationError('La fecha del estudio es requerida', 'date');
    }
    if (study.date && new Date(study.date) > new Date()) {
      throw new ValidationError('La fecha del estudio no puede ser futura', 'date');
    }
    if (!study.patientId) {
      throw new ValidationError('El ID del paciente es requerido', 'patientId');
    }
  }

  public validatePatientStudy(patientStudy: Partial<PatientStudy>): void {
    if (!patientStudy.patientId) {
      throw new ValidationError('El ID del paciente es requerido', 'patientId');
    }
    if (!patientStudy.studyType) {
      throw new ValidationError('El tipo de estudio es requerido', 'studyType');
    }
    if (!patientStudy.studyData) {
      throw new ValidationError('Los datos del estudio son requeridos', 'studyData');
    }
    this.validateStudy(patientStudy.studyData);
  }

  public validateAIAnalysis(analysis: any): void {
    if (!analysis.content?.trim()) {
      throw new ValidationError('El contenido del análisis es requerido', 'content');
    }
    if (!analysis.timestamp) {
      throw new ValidationError('La fecha del análisis es requerida', 'timestamp');
    }
    if (analysis.timestamp && new Date(analysis.timestamp) > new Date()) {
      throw new ValidationError('La fecha del análisis no puede ser futura', 'timestamp');
    }
  }

  public validateEMGResults(results: any): void {
    if (!results.muscle) {
      throw new ValidationError('El músculo es requerido', 'muscle');
    }
    if (!results.side) {
      throw new ValidationError('El lado es requerido', 'side');
    }
    if (!results.insertionalActivity) {
      throw new ValidationError('La actividad insertional es requerida', 'insertionalActivity');
    }
    if (!results.spontaneousActivity) {
      throw new ValidationError('La actividad espontánea es requerida', 'spontaneousActivity');
    }
  }

  public validateNCSResults(results: any): void {
    if (!results.nerve) {
      throw new ValidationError('El nervio es requerido', 'nerve');
    }
    if (!results.side) {
      throw new ValidationError('El lado es requerido', 'side');
    }
    if (results.latency === undefined) {
      throw new ValidationError('La latencia es requerida', 'latency');
    }
    if (results.amplitude === undefined) {
      throw new ValidationError('La amplitud es requerida', 'amplitude');
    }
    if (results.velocity === undefined) {
      throw new ValidationError('La velocidad es requerida', 'velocity');
    }
  }
}

export const validationService = ValidationService.getInstance(); 