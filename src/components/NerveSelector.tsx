import React from 'react';
import { nerveDatabase } from '../data/nerveData';

interface NerveSelectorProps {
  type: 'motor' | 'sensory';
  selectedNerves: string[];
  onNerveSelection: (nerve: string) => void;
  onNerveRemoval: (nerve: string) => void;
}

const NerveSelector: React.FC<NerveSelectorProps> = ({
  type,
  selectedNerves,
  onNerveSelection,
  onNerveRemoval
}) => {
  const availableNerves = type === 'motor' 
    ? nerveDatabase.filter(nerve => nerve.type === 'motor' || nerve.type === 'mixed')
    : nerveDatabase.filter(nerve => nerve.type === 'sensory' || nerve.type === 'mixed');

  return (
    <div className="nerve-selector">
      <h3>{type === 'motor' ? 'Nervios Motores' : 'Nervios Sensitivos'}</h3>
      
      <div className="selected-nerves">
        {selectedNerves.map(nerve => (
          <div key={nerve} className="selected-nerve">
            <span>{nerve}</span>
            <button 
              onClick={() => onNerveRemoval(nerve)}
              className="remove-nerve"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <select
        value=""
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedNerve = e.target.value;
          if (selectedNerve && !selectedNerves.includes(selectedNerve)) {
            onNerveSelection(selectedNerve);
          }
        }}
      >
        <option value="">Seleccionar nervio...</option>
        {availableNerves.map(nerve => (
          <option 
            key={nerve.id} 
            value={nerve.id}
            disabled={selectedNerves.includes(nerve.id)}
          >
            {nerve.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NerveSelector; 