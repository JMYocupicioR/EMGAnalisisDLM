export interface MuscleData {
  id: string;
  name: string;
  innervation: {
    nerve: string;
    root: string;
  };
  referenceValues: {
    insertionalActivity: {
      normal: string;
      increased: string;
      decreased: string;
    };
    spontaneousActivity: {
      fibrillations: string;
      positiveWaves: string;
      fasciculations: string;
    };
    motorUnitPotentials: {
      duration: {
        min: number;
        max: number;
      };
      amplitude: {
        min: number;
        max: number;
      };
      polyphasia: {
        min: number;
        max: number;
      };
    };
  };
}

export const muscleDatabase: MuscleData[] = [
  {
    id: 'first_dorsal_interosseous',
    name: 'Primer Interóseo Dorsal',
    innervation: {
      nerve: 'ulnar_motor',
      root: 'C8-T1'
    },
    referenceValues: {
      insertionalActivity: {
        normal: 'Breve',
        increased: 'Prolongada',
        decreased: 'Reducida'
      },
      spontaneousActivity: {
        fibrillations: 'Ausentes',
        positiveWaves: 'Ausentes',
        fasciculations: 'Ausentes'
      },
      motorUnitPotentials: {
        duration: {
          min: 5,
          max: 15
        },
        amplitude: {
          min: 200,
          max: 2000
        },
        polyphasia: {
          min: 0,
          max: 20
        }
      }
    }
  },
  {
    id: 'abductor_pollicis_brevis',
    name: 'Abductor Corto del Pulgar',
    innervation: {
      nerve: 'median_motor',
      root: 'C8-T1'
    },
    referenceValues: {
      insertionalActivity: {
        normal: 'Breve',
        increased: 'Prolongada',
        decreased: 'Reducida'
      },
      spontaneousActivity: {
        fibrillations: 'Ausentes',
        positiveWaves: 'Ausentes',
        fasciculations: 'Ausentes'
      },
      motorUnitPotentials: {
        duration: {
          min: 5,
          max: 15
        },
        amplitude: {
          min: 200,
          max: 2000
        },
        polyphasia: {
          min: 0,
          max: 20
        }
      }
    }
  },
  {
    id: 'tibialis_anterior',
    name: 'Tibial Anterior',
    innervation: {
      nerve: 'peroneal',
      root: 'L4-L5'
    },
    referenceValues: {
      insertionalActivity: {
        normal: 'Breve',
        increased: 'Prolongada',
        decreased: 'Reducida'
      },
      spontaneousActivity: {
        fibrillations: 'Ausentes',
        positiveWaves: 'Ausentes',
        fasciculations: 'Ausentes'
      },
      motorUnitPotentials: {
        duration: {
          min: 5,
          max: 15
        },
        amplitude: {
          min: 200,
          max: 2000
        },
        polyphasia: {
          min: 0,
          max: 20
        }
      }
    }
  },
  {
    id: 'gastrocnemius',
    name: 'Gastrocnemio',
    innervation: {
      nerve: 'tibial',
      root: 'S1-S2'
    },
    referenceValues: {
      insertionalActivity: {
        normal: 'Breve',
        increased: 'Prolongada',
        decreased: 'Reducida'
      },
      spontaneousActivity: {
        fibrillations: 'Ausentes',
        positiveWaves: 'Ausentes',
        fasciculations: 'Ausentes'
      },
      motorUnitPotentials: {
        duration: {
          min: 5,
          max: 15
        },
        amplitude: {
          min: 200,
          max: 2000
        },
        polyphasia: {
          min: 0,
          max: 20
        }
      }
    }
  }
]; 