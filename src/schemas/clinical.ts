import { z } from 'zod';
import { ClinicalEvaluation, NCSResults, EMGResults, DiagnosticCriteria, IntegratedDiagnosis } from '../types/clinical';

export const clinicalEvaluationSchema = z.object({
  reasonForStudy: z.object({
    weakness: z.object({
      present: z.boolean(),
      distribution: z.array(z.string()),
      severity: z.enum(['mild', 'moderate', 'severe']),
      progression: z.string()
    }),
    paresthesias: z.object({
      present: z.boolean(),
      distribution: z.array(z.string()),
      characteristics: z.array(z.string()),
      duration: z.string()
    }),
    pain: z.object({
      present: z.boolean(),
      type: z.array(z.string()),
      distribution: z.array(z.string()),
      intensity: z.number().min(0).max(10)
    }),
    atrophy: z.object({
      present: z.boolean(),
      muscles: z.array(z.string()),
      severity: z.enum(['mild', 'moderate', 'severe'])
    }),
    reflexes: z.object({
      status: z.enum(['normal', 'increased', 'decreased', 'absent']),
      distribution: z.array(z.string())
    })
  }),
  clinicalFindings: z.object({
    muscleTone: z.object({
      status: z.enum(['normal', 'increased', 'decreased']),
      distribution: z.array(z.string())
    }),
    muscleStrength: z.object({
      grading: z.record(z.string(), z.number().min(0).max(5)),
      distribution: z.array(z.string())
    }),
    sensoryExamination: z.object({
      modalities: z.object({
        touch: z.boolean(),
        pain: z.boolean(),
        temperature: z.boolean(),
        vibration: z.boolean(),
        position: z.boolean()
      }),
      distribution: z.array(z.string())
    })
  }),
  preliminaryDiagnosis: z.string().min(1),
  studyIndications: z.array(z.string()),
  recommendedProtocol: z.enum(['NCS', 'NCS_EMG'])
});

export const ncsResultsSchema = z.object({
  motor: z.object({
    latency: z.number().positive(),
    amplitude: z.number().positive(),
    conductionVelocity: z.number().positive(),
    fWave: z.object({
      latency: z.number().positive(),
      persistence: z.number().min(0).max(100)
    })
  }),
  sensory: z.object({
    latency: z.number().positive(),
    amplitude: z.number().positive(),
    conductionVelocity: z.number().positive()
  })
});

export const emgResultsSchema = z.object({
  insertionalActivity: z.string(),
  spontaneousActivity: z.object({
    fibrillations: z.boolean(),
    positiveWaves: z.boolean(),
    fasciculations: z.boolean()
  }),
  motorUnitPotentials: z.object({
    amplitude: z.number().positive(),
    duration: z.number().positive(),
    polyphasia: z.number().min(0).max(100)
  }),
  recruitmentPattern: z.string()
});

export const diagnosticCriteriaSchema = z.object({
  canSkipEMG: z.boolean(),
  reasons: z.array(z.string()),
  requiresEMG: z.boolean(),
  emgReasons: z.array(z.string())
});

export const integratedDiagnosisSchema = z.object({
  clinicalCorrelation: z.string(),
  lesionType: z.enum(['axonal', 'demyelinating', 'mixed']),
  pathologyType: z.enum(['neuropathic', 'myopathic', 'mixed']),
  severity: z.enum(['mild', 'moderate', 'severe']),
  chronicity: z.enum(['acute', 'subacute', 'chronic']),
  distribution: z.array(z.string()),
  finalDiagnosis: z.string(),
  recommendations: z.array(z.string())
}); 