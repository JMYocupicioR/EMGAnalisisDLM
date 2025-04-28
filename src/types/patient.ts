export interface MedicalHistory {
  previousDiseases: string[];
  surgeries: string[];
  currentMedications: string[];
  allergies: string[];
  familyHistory?: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  address?: string;
}

export type Sex = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  patientId?: string; // ID externo del hospital o clínica
  firstName: string;
  lastName: string;
  dateOfBirth: string; // Formato ISO: YYYY-MM-DD
  sex: Sex;
  contact: ContactInfo;
  medicalHistory: MedicalHistory;
  mainDiagnosis?: string;
  consultReason?: string;
  additionalNotes?: string;
  createdAt: string; // Fecha de creación del registro
  updatedAt: string; // Fecha de última actualización
}

// Estado vacío para inicializar el formulario
export const emptyPatient: Patient = {
  id: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  sex: 'male',
  contact: {
    phone: '',
    email: '',
    address: '',
  },
  medicalHistory: {
    previousDiseases: [],
    surgeries: [],
    currentMedications: [],
    allergies: [],
    familyHistory: '',
  },
  mainDiagnosis: '',
  consultReason: '',
  additionalNotes: '',
  createdAt: '',
  updatedAt: '',
}; 