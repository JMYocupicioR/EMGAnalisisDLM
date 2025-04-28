export interface DiagnosticPattern {
  id: string;
  name: string;
  description: string;
  keyFindings: {
    parameter: string;
    condition: string;
    importance: 'high' | 'medium' | 'low';
  }[];
}

export const diagnosticPatterns: Record<string, DiagnosticPattern> = {
  'acute_axonal_neuropathy': {
    id: 'acute_axonal_neuropathy',
    name: 'Neuropatía axonal aguda',
    description: 'proceso neuropático de predominio axonal con características agudas',
    keyFindings: [
      {
        parameter: 'fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'positiveWaves',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'chronic_axonal_neuropathy': {
    id: 'chronic_axonal_neuropathy',
    name: 'Neuropatía axonal crónica',
    description: 'proceso neuropático de predominio axonal con características crónicas',
    keyFindings: [
      {
        parameter: 'fibrillations',
        condition: 'absent',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.duration',
        condition: '>12',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.amplitude',
        condition: '>6000',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.phases',
        condition: '>4',
        importance: 'medium'
      },
      {
        parameter: 'recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'demyelinating_neuropathy': {
    id: 'demyelinating_neuropathy',
    name: 'Neuropatía desmielinizante',
    description: 'proceso neuropático de predominio desmielinizante',
    keyFindings: [
      {
        parameter: 'motorUnitPotentials.duration',
        condition: '<8',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.amplitude',
        condition: '<3000',
        importance: 'high'
      },
      {
        parameter: 'recruitment.pattern',
        condition: 'early',
        importance: 'high'
      },
      {
        parameter: 'fibrillations',
        condition: 'absent',
        importance: 'medium'
      }
    ]
  },
  'myopathy': {
    id: 'myopathy',
    name: 'Miopatía',
    description: 'proceso miopático',
    keyFindings: [
      {
        parameter: 'motorUnitPotentials.duration',
        condition: '<8',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.amplitude',
        condition: '<2000',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.phases',
        condition: '>4',
        importance: 'medium'
      },
      {
        parameter: 'recruitment.pattern',
        condition: 'early',
        importance: 'high'
      },
      {
        parameter: 'fibrillations',
        condition: 'present',
        importance: 'medium'
      }
    ]
  },
  'normal': {
    id: 'normal',
    name: 'Normal',
    description: 'estudio electromiográfico normal',
    keyFindings: [
      {
        parameter: 'fibrillations',
        condition: 'absent',
        importance: 'high'
      },
      {
        parameter: 'positiveWaves',
        condition: 'absent',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.duration',
        condition: '=normal',
        importance: 'high'
      },
      {
        parameter: 'motorUnitPotentials.amplitude',
        condition: '=normal',
        importance: 'high'
      },
      {
        parameter: 'recruitment.pattern',
        condition: 'normal',
        importance: 'high'
      }
    ]
  },
  'c5_c6_radiculopathy': {
    id: 'c5_c6_radiculopathy',
    name: 'Radiculopatía C5-C6',
    description: 'compresión de las raíces nerviosas C5 y C6',
    keyFindings: [
      {
        parameter: 'biceps_brachii.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'deltoid.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'biceps_brachii.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'biceps_brachii.motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'biceps_brachii.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'c6_c7_radiculopathy': {
    id: 'c6_c7_radiculopathy',
    name: 'Radiculopatía C6-C7',
    description: 'compresión de las raíces nerviosas C6 y C7',
    keyFindings: [
      {
        parameter: 'triceps_brachii.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'flexor_carpi_radialis.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'triceps_brachii.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'triceps_brachii.motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'triceps_brachii.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'l4_l5_radiculopathy': {
    id: 'l4_l5_radiculopathy',
    name: 'Radiculopatía L4-L5',
    description: 'compresión de las raíces nerviosas L4 y L5',
    keyFindings: [
      {
        parameter: 'tibialis_anterior.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'peroneus_longus.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'tibialis_anterior.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'tibialis_anterior.motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'tibialis_anterior.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'l5_s1_radiculopathy': {
    id: 'l5_s1_radiculopathy',
    name: 'Radiculopatía L5-S1',
    description: 'compresión de las raíces nerviosas L5 y S1',
    keyFindings: [
      {
        parameter: 'gastrocnemius.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'soleus.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'gastrocnemius.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'gastrocnemius.motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'gastrocnemius.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'brachial_plexopathy': {
    id: 'brachial_plexopathy',
    name: 'Plexopatía Braquial',
    description: 'lesión del plexo braquial',
    keyFindings: [
      {
        parameter: 'multiple_muscles.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.amplitude',
        condition: '>5000',
        importance: 'medium'
      },
      {
        parameter: 'multiple_muscles.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      },
      {
        parameter: 'distribution',
        condition: 'multifocal',
        importance: 'high'
      }
    ]
  },
  'carpal_tunnel_syndrome_mild': {
    id: 'carpal_tunnel_syndrome_mild',
    name: 'Síndrome del Túnel Carpiano (Leve)',
    description: 'compresión leve del nervio mediano en el túnel carpiano',
    keyFindings: [
      {
        parameter: 'median_motor.latency',
        condition: '>4.0',
        importance: 'high'
      },
      {
        parameter: 'median_sensory.latency',
        condition: '>3.5',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.fibrillations',
        condition: 'absent',
        importance: 'medium'
      },
      {
        parameter: 'abductor_pollicis_brevis.motorUnitPotentials.duration',
        condition: '=normal',
        importance: 'medium'
      }
    ]
  },
  'carpal_tunnel_syndrome_moderate': {
    id: 'carpal_tunnel_syndrome_moderate',
    name: 'Síndrome del Túnel Carpiano (Moderado)',
    description: 'compresión moderada del nervio mediano en el túnel carpiano',
    keyFindings: [
      {
        parameter: 'median_motor.latency',
        condition: '>4.5',
        importance: 'high'
      },
      {
        parameter: 'median_sensory.latency',
        condition: '>4.0',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.fibrillations',
        condition: 'present',
        importance: 'medium'
      },
      {
        parameter: 'abductor_pollicis_brevis.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'abductor_pollicis_brevis.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'carpal_tunnel_syndrome_severe': {
    id: 'carpal_tunnel_syndrome_severe',
    name: 'Síndrome del Túnel Carpiano (Severo)',
    description: 'compresión severa del nervio mediano en el túnel carpiano',
    keyFindings: [
      {
        parameter: 'median_motor.latency',
        condition: '>5.0',
        importance: 'high'
      },
      {
        parameter: 'median_sensory.latency',
        condition: '>4.5',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.motorUnitPotentials.duration',
        condition: '>12',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.motorUnitPotentials.amplitude',
        condition: '>6000',
        importance: 'high'
      },
      {
        parameter: 'abductor_pollicis_brevis.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'tarsal_tunnel_syndrome': {
    id: 'tarsal_tunnel_syndrome',
    name: 'Síndrome del Túnel Tarsiano',
    description: 'compresión del nervio tibial posterior en el túnel tarsiano',
    keyFindings: [
      {
        parameter: 'tibial_motor.latency',
        condition: '>5.0',
        importance: 'high'
      },
      {
        parameter: 'tibial_motor.amplitude',
        condition: '<4.0',
        importance: 'medium'
      },
      {
        parameter: 'plantar_medial.latency',
        condition: '>4.0',
        importance: 'high'
      },
      {
        parameter: 'abductor_hallucis.fibrillations',
        condition: 'present',
        importance: 'medium'
      },
      {
        parameter: 'abductor_hallucis.motorUnitPotentials.duration',
        condition: '>10',
        importance: 'medium'
      },
      {
        parameter: 'abductor_hallucis.recruitment.pattern',
        condition: 'reduced',
        importance: 'high'
      }
    ]
  },
  'als': {
    id: 'als',
    name: 'Esclerosis Lateral Amiotrófica',
    description: 'enfermedad neurodegenerativa progresiva',
    keyFindings: [
      {
        parameter: 'multiple_muscles.fibrillations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.fasciculations',
        condition: 'present',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.duration',
        condition: '>12',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.amplitude',
        condition: '>6000',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.phases',
        condition: '>4',
        importance: 'medium'
      },
      {
        parameter: 'distribution',
        condition: 'generalized',
        importance: 'high'
      },
      {
        parameter: 'chronicity',
        condition: 'progressive',
        importance: 'high'
      }
    ]
  },
  'myasthenia_gravis': {
    id: 'myasthenia_gravis',
    name: 'Miastenia Gravis',
    description: 'trastorno neuromuscular autoinmune',
    keyFindings: [
      {
        parameter: 'multiple_muscles.motorUnitPotentials.duration',
        condition: '=normal',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.amplitude',
        condition: '=normal',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.motorUnitPotentials.stability',
        condition: 'unstable',
        importance: 'high'
      },
      {
        parameter: 'multiple_muscles.recruitment.pattern',
        condition: 'early',
        importance: 'high'
      },
      {
        parameter: 'distribution',
        condition: 'proximal',
        importance: 'medium'
      }
    ]
  }
};