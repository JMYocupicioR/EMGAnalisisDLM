import { Patient } from '../types/patient';
import { Study, StudyType } from '../types';
import { PatientStudy } from '../types/patientStudy';

// Claves de almacenamiento
const STORAGE_KEYS = {
  PATIENTS: 'emg_patients',
  STUDIES: 'emg_studies',
  TEMP_PATIENT: 'emg_temp_patient'
};

// Tipos de error personalizados
export class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

class UnifiedStorageService {
  private static instance: UnifiedStorageService;
  private db: IDBDatabase | null = null;
  private readonly dbName = 'ClinicalEvaluationDB';
  private readonly dbVersion = 1;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): UnifiedStorageService {
    if (!UnifiedStorageService.instance) {
      UnifiedStorageService.instance = new UnifiedStorageService();
    }
    return UnifiedStorageService.instance;
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(new StorageError('Error al abrir la base de datos', 'DB_INIT_ERROR'));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('studies')) {
          db.createObjectStore('studies', { keyPath: 'id' });
        }
      };
    });
  }

  // Métodos para pacientes
  public async savePatient(patient: Patient): Promise<Patient> {
    try {
      // Generar ID si no existe
      if (!patient.id) {
        patient.id = crypto.randomUUID();
      }

      // Establecer timestamps
      const now = new Date().toISOString();
      if (!patient.createdAt) {
        patient.createdAt = now;
      }
      patient.updatedAt = now;

      // Guardar en IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['patients'], 'readwrite');
        const store = transaction.objectStore('patients');
        await new Promise<void>((resolve, reject) => {
          const request = store.put(patient);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(new StorageError('Error al guardar paciente en IndexedDB', 'DB_SAVE_ERROR'));
        });
      }

      // Guardar en localStorage como respaldo
      const patients = this.getAllPatients();
      const existingIndex = patients.findIndex(p => p.id === patient.id);
      if (existingIndex >= 0) {
        patients[existingIndex] = patient;
      } else {
        patients.push(patient);
      }
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));

      return patient;
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : 'Error desconocido al guardar paciente',
        'SAVE_PATIENT_ERROR'
      );
    }
  }

  public getAllPatients(): Patient[] {
    const patientsJson = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return patientsJson ? JSON.parse(patientsJson) : [];
  }

  // Métodos para estudios
  public async saveStudy(study: Study): Promise<Study> {
    try {
      if (!study.id) {
        study.id = crypto.randomUUID();
      }

      // Guardar en IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['studies'], 'readwrite');
        const store = transaction.objectStore('studies');
        await new Promise<void>((resolve, reject) => {
          const request = store.put(study);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(new StorageError('Error al guardar estudio en IndexedDB', 'DB_SAVE_ERROR'));
        });
      }

      // Guardar en localStorage como respaldo
      const studies = this.getAllStudies();
      const existingIndex = studies.findIndex(s => s.id === study.id);
      if (existingIndex >= 0) {
        studies[existingIndex] = study;
      } else {
        studies.push(study);
      }
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));

      return study;
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : 'Error desconocido al guardar estudio',
        'SAVE_STUDY_ERROR'
      );
    }
  }

  public getAllStudies(): Study[] {
    const studiesJson = localStorage.getItem(STORAGE_KEYS.STUDIES);
    return studiesJson ? JSON.parse(studiesJson) : [];
  }

  // Métodos para estudios de pacientes
  public async savePatientStudy(
    patient: Patient,
    studyType: StudyType,
    studyData: Study,
    observations?: string,
    conclusion?: string,
    aiEmgAnalysis?: string
  ): Promise<PatientStudy> {
    try {
      const studyId = crypto.randomUUID();
      const patientStudy: PatientStudy = {
        id: studyId,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        studyType,
        studyData,
        timestamp: new Date().toISOString(),
        observations,
        conclusion
      };

      if (aiEmgAnalysis) {
        patientStudy.aiAnalysis = {
          emgAnalysis: {
            id: crypto.randomUUID(),
            studyId: studyId,
            content: aiEmgAnalysis,
            timestamp: new Date().toISOString(),
            modelVersion: 'gpt-4'
          }
        };
      }

      // Guardar en IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['studies'], 'readwrite');
        const store = transaction.objectStore('studies');
        await new Promise<void>((resolve, reject) => {
          const request = store.put(patientStudy);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(new StorageError('Error al guardar estudio de paciente en IndexedDB', 'DB_SAVE_ERROR'));
        });
      }

      // Guardar en localStorage como respaldo
      const patientStudies = this.getAllPatientStudies();
      patientStudies.push(patientStudy);
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(patientStudies));

      return patientStudy;
    } catch (error) {
      throw new StorageError(
        error instanceof Error ? error.message : 'Error desconocido al guardar estudio de paciente',
        'SAVE_PATIENT_STUDY_ERROR'
      );
    }
  }

  public getAllPatientStudies(): PatientStudy[] {
    const studiesJson = localStorage.getItem(STORAGE_KEYS.STUDIES);
    return studiesJson ? JSON.parse(studiesJson) : [];
  }

  // Métodos para datos temporales
  public saveTemporaryPatient(patient: Partial<Patient>): void {
    localStorage.setItem(STORAGE_KEYS.TEMP_PATIENT, JSON.stringify(patient));
  }

  public getTemporaryPatient(): Partial<Patient> | null {
    const patientJson = localStorage.getItem(STORAGE_KEYS.TEMP_PATIENT);
    return patientJson ? JSON.parse(patientJson) : null;
  }

  public clearTemporaryPatient(): void {
    localStorage.removeItem(STORAGE_KEYS.TEMP_PATIENT);
  }
}

export const storageService = UnifiedStorageService.getInstance(); 