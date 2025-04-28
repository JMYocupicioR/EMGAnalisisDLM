import React from 'react';
import { muscleDatabase } from '../data/muscleData';

interface MuscleSelectorProps {
  selectedMuscles: {
    [muscleName: string]: {
      left: boolean;
      right: boolean;
    };
  };
  onMuscleSelection: (muscle: string) => void;
  onMuscleSideToggle: (muscle: string, side: 'left' | 'right') => void;
  onMuscleRemoval: (muscle: string) => void;
}

const MuscleSelector: React.FC<MuscleSelectorProps> = ({
  selectedMuscles,
  onMuscleSelection,
  onMuscleSideToggle,
  onMuscleRemoval
}) => {
  return (
    <div className="muscle-selector">
      <h3>Músculos</h3>
      
      <div className="selected-muscles">
        {Object.entries(selectedMuscles).map(([muscleName, sides]) => (
          <div key={muscleName} className="selected-muscle">
            <span>{muscleName}</span>
            <div className="muscle-sides">
              <label>
                <input
                  type="checkbox"
                  checked={sides.left}
                  onChange={() => onMuscleSideToggle(muscleName, 'left')}
                />
                Izquierdo
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={sides.right}
                  onChange={() => onMuscleSideToggle(muscleName, 'right')}
                />
                Derecho
              </label>
            </div>
            <button 
              onClick={() => onMuscleRemoval(muscleName)}
              className="remove-muscle"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <select
        value=""
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedMuscle = e.target.value;
          if (selectedMuscle && !selectedMuscles[selectedMuscle]) {
            onMuscleSelection(selectedMuscle);
          }
        }}
      >
        <option value="">Seleccionar músculo...</option>
        {Object.keys(muscleDatabase).map(muscle => (
          <option 
            key={muscle} 
            value={muscle}
            disabled={selectedMuscles[muscle] !== undefined}
          >
            {muscle}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MuscleSelector; 