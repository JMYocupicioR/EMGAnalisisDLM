import { storageService } from './unifiedStorageService';
import { validationService } from './validationService';
import { Patient, Study, PatientStudy } from '../types';

export class TransactionError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'TransactionError';
  }
}

class TransactionService {
  private static instance: TransactionService;

  private constructor() {}

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  public async savePatientWithStudies(
    patient: Patient,
    studies: Study[]
  ): Promise<{ patient: Patient; studies: Study[] }> {
    try {
      // Validar datos
      validationService.validatePatient(patient);
      studies.forEach(study => validationService.validateStudy(study));

      // Iniciar transacción
      const savedPatient = await storageService.savePatient(patient);
      const savedStudies = await Promise.all(
        studies.map(study => storageService.saveStudy(study))
      );

      return { patient: savedPatient, studies: savedStudies };
    } catch (error) {
      throw new TransactionError(
        'Error al guardar paciente y estudios',
        error instanceof Error ? error : undefined
      );
    }
  }

  public async savePatientStudyWithAnalysis(
    patient: Patient,
    study: Study,
    observations?: string,
    conclusion?: string,
    aiAnalysis?: string
  ): Promise<PatientStudy> {
    try {
      // Validar datos
      validationService.validatePatient(patient);
      validationService.validateStudy(study);
      if (aiAnalysis) {
        validationService.validateAIAnalysis({ content: aiAnalysis, timestamp: new Date().toISOString() });
      }

      // Iniciar transacción
      const savedPatient = await storageService.savePatient(patient);
      const savedStudy = await storageService.saveStudy(study);
      const patientStudy = await storageService.savePatientStudy(
        savedPatient,
        study.type,
        savedStudy,
        observations,
        conclusion,
        aiAnalysis
      );

      return patientStudy;
    } catch (error) {
      throw new TransactionError(
        'Error al guardar estudio de paciente con análisis',
        error instanceof Error ? error : undefined
      );
    }
  }

  public async updatePatientStudy(
    patientStudy: PatientStudy,
    updates: Partial<PatientStudy>
  ): Promise<PatientStudy> {
    try {
      // Validar datos actualizados
      const updatedPatientStudy = { ...patientStudy, ...updates };
      validationService.validatePatientStudy(updatedPatientStudy);

      // Iniciar transacción
      const savedStudy = await storageService.saveStudy(updatedPatientStudy.studyData);
      const savedPatientStudy = await storageService.savePatientStudy(
        { id: updatedPatientStudy.patientId } as Patient,
        updatedPatientStudy.studyType,
        savedStudy,
        updatedPatientStudy.observations,
        updatedPatientStudy.conclusion,
        updatedPatientStudy.aiAnalysis?.emgAnalysis?.content
      );

      return savedPatientStudy;
    } catch (error) {
      throw new TransactionError(
        'Error al actualizar estudio de paciente',
        error instanceof Error ? error : undefined
      );
    }
  }
}

export const transactionService = TransactionService.getInstance(); 