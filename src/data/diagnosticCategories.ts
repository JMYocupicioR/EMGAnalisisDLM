export interface DiagnosticCategory {
  id: string;
  name: string;
  description: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

export const diagnosticCategories: DiagnosticCategory[] = [
  {
    id: 'mononeuropatias',
    name: 'Mononeuropatías',
    description: 'Afectación de un nervio periférico específico',
    subcategories: [
      { id: 'upperLimb', name: 'Miembro Superior' },
      { id: 'lowerLimb', name: 'Miembro Inferior' },
      { id: 'cranial', name: 'Nervios Craneales' }
    ]
  },
  {
    id: 'polineuropatias',
    name: 'Polineuropatías',
    description: 'Afectación simétrica y difusa de múltiples nervios',
    subcategories: [
      { id: 'axonal', name: 'Axonal' },
      { id: 'demyelinating', name: 'Desmielinizante' },
      { id: 'mixed', name: 'Mixta' }
    ]
  },
  {
    id: 'radiculopatias',
    name: 'Radiculopatías',
    description: 'Afectación de raíces nerviosas',
    subcategories: [
      { id: 'cervical', name: 'Cervical' },
      { id: 'lumbar', name: 'Lumbar' },
      { id: 'sacral', name: 'Sacra' }
    ]
  },
  {
    id: 'miopatias',
    name: 'Miopatías',
    description: 'Afectación primaria del músculo',
    subcategories: [
      { id: 'inflammatory', name: 'Inflamatoria' },
      { id: 'metabolic', name: 'Metabólica' },
      { id: 'dystrophic', name: 'Distrófica' }
    ]
  },
  {
    id: 'plexopatias',
    name: 'Plexopatías',
    description: 'Afectación de plexos nerviosos',
    subcategories: [
      { id: 'brachial', name: 'Braquial' },
      { id: 'lumbosacral', name: 'Lumbosacral' }
    ]
  },
  {
    id: 'desconocido',
    name: 'Diagnóstico Desconocido',
    description: 'Etiología no determinada',
    subcategories: [
      { id: 'upperLimbUnknown', name: 'Miembro Superior' },
      { id: 'lowerLimbUnknown', name: 'Miembro Inferior' },
      { id: 'generalizedUnknown', name: 'Generalizada' }
    ]
  }
];