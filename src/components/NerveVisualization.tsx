import React, { useState } from 'react';

const NerveVisualization = () => {
  const [selectedNerve, setSelectedNerve] = useState('median');
  const [highlightSegment, setHighlightSegment] = useState(null);
  
  const nerveOptions = [
    { id: 'median', name: 'Nervio Mediano' },
    { id: 'ulnar', name: 'Nervio Cubital' },
    { id: 'peroneal', name: 'Nervio Peroneo' },
    { id: 'tibial', name: 'Nervio Tibial' }
  ];
  
  const renderMedianNerve = () => (
    <svg viewBox="0 0 300 800" className="w-full max-w-md">
      {/* Shoulder */}
      <circle cx="150" cy="50" r="40" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Arm */}
      <rect x="130" y="90" width="40" height="200" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Elbow */}
      <circle cx="150" cy="300" r="30" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Forearm */}
      <rect x="130" y="330" width="40" height="180" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Wrist */}
      <rect x="115" y="510" width="70" height="30" rx="15" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Hand */}
      <path d="M120,540 C100,580 100,630 120,670 L180,670 C200,630 200,580 180,540 Z" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Fingers */}
      <rect x="130" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      <rect x="145" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      <rect x="160" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Nerve path */}
      <path 
        d="M150,50 C150,50 150,150 150,300 C150,300 150,400 145,510 C145,510 145,590 140,670" 
        fill="none" 
        stroke={highlightSegment === 'proximal' ? "#3b82f6" : "#4ade80"} 
        strokeWidth="5" 
        strokeDasharray="0" 
        strokeLinecap="round"
        onMouseEnter={() => setHighlightSegment('proximal')}
        onMouseLeave={() => setHighlightSegment(null)}
      />
      
      <path 
        d="M145,510 C145,510 145,590 140,670" 
        fill="none" 
        stroke={highlightSegment === 'distal' ? "#3b82f6" : "#4ade80"} 
        strokeWidth="5" 
        strokeDasharray="0" 
        strokeLinecap="round"
        onMouseEnter={() => setHighlightSegment('distal')}
        onMouseLeave={() => setHighlightSegment(null)}
      />
      
      {/* Study points */}
      <circle cx="150" cy="100" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      <circle cx="150" cy="420" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      <circle cx="145" cy="540" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      
      {/* Labels */}
      <text x="170" y="100" fontSize="12" fill="#000">Punto Erb</text>
      <text x="170" y="420" fontSize="12" fill="#000">Codo</text>
      <text x="170" y="540" fontSize="12" fill="#000">Muñeca</text>
    </svg>
  );
  
  const renderUlnarNerve = () => (
    <svg viewBox="0 0 300 800" className="w-full max-w-md">
      {/* Shoulder */}
      <circle cx="150" cy="50" r="40" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Arm */}
      <rect x="130" y="90" width="40" height="200" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Elbow */}
      <circle cx="150" cy="300" r="30" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Forearm */}
      <rect x="130" y="330" width="40" height="180" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Wrist */}
      <rect x="115" y="510" width="70" height="30" rx="15" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Hand */}
      <path d="M120,540 C100,580 100,630 120,670 L180,670 C200,630 200,580 180,540 Z" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Fingers */}
      <rect x="130" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      <rect x="145" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      <rect x="160" y="670" width="10" height="100" rx="5" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
      
      {/* Nerve path - follows a different route around the elbow */}
      <path 
        d="M150,50 C150,50 150,150 160,300 C190,310 185,290 180,300 C175,320 165,400 160,510 C160,510 160,590 155,670" 
        fill="none" 
        stroke={highlightSegment === 'proximal' ? "#3b82f6" : "#f58025"} 
        strokeWidth="5" 
        strokeDasharray="0" 
        strokeLinecap="round"
        onMouseEnter={() => setHighlightSegment('proximal')}
        onMouseLeave={() => setHighlightSegment(null)}
      />
      
      <path 
        d="M160,510 C160,510 160,590 155,670" 
        fill="none" 
        stroke={highlightSegment === 'distal' ? "#3b82f6" : "#f58025"} 
        strokeWidth="5"
        strokeDasharray="0" 
        strokeLinecap="round"
        onMouseEnter={() => setHighlightSegment('distal')}
        onMouseLeave={() => setHighlightSegment(null)}
      />
      
      {/* Study points */}
      <circle cx="150" cy="100" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      <circle cx="180" cy="300" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      <circle cx="160" cy="540" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
      
      {/* Labels */}
      <text x="170" y="100" fontSize="12" fill="#000">Punto Erb</text>
      <text x="200" y="300" fontSize="12" fill="#000">Canal Cubital</text>
      <text x="180" y="540" fontSize="12" fill="#000">Muñeca</text>
    </svg>
  );
  
  const renderPeronealNerve = () => (
    <svg viewBox="0 0 300 800" className="w-full max-w-md">
      <g transform="translate(0, 50)">
        {/* Hip */}
        <circle cx="150" cy="50" r="40" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Thigh */}
        <rect x="130" y="90" width="40" height="200" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Knee */}
        <circle cx="150" cy="300" r="30" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Lower leg */}
        <rect x="130" y="330" width="40" height="180" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Ankle */}
        <circle cx="150" cy="530" r="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Foot */}
        <path d="M130,550 L100,600 L200,600 L170,550 Z" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Peroneal nerve path */}
        <path 
          d="M150,50 C150,50 150,150 165,300 C165,300 190,320 190,340 C190,380 190,450 190,540" 
          fill="none" 
          stroke="#9333ea" 
          strokeWidth="5" 
          strokeDasharray="0" 
          strokeLinecap="round"
        />
        
        {/* Study points */}
        <circle cx="150" cy="100" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        <circle cx="165" cy="300" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        <circle cx="190" cy="340" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        
        {/* Labels */}
        <text x="170" y="100" fontSize="12" fill="#000">Plexo</text>
        <text x="180" y="300" fontSize="12" fill="#000">Rodilla</text>
        <text x="200" y="340" fontSize="12" fill="#000">Cabeza Peroné</text>
      </g>
    </svg>
  );
  
  const renderTibialNerve = () => (
    <svg viewBox="0 0 300 800" className="w-full max-w-md">
      <g transform="translate(0, 50)">
        {/* Hip */}
        <circle cx="150" cy="50" r="40" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Thigh */}
        <rect x="130" y="90" width="40" height="200" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Knee */}
        <circle cx="150" cy="300" r="30" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Lower leg */}
        <rect x="130" y="330" width="40" height="180" rx="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Ankle */}
        <circle cx="150" cy="530" r="20" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Foot */}
        <path d="M130,550 L100,600 L200,600 L170,550 Z" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
        
        {/* Tibial nerve path */}
        <path 
          d="M150,50 C150,50 150,150 150,300 C150,300 150,350 140,400 C130,470 120,520 120,550" 
          fill="none" 
          stroke="#0891b2" 
          strokeWidth="5" 
          strokeDasharray="0" 
          strokeLinecap="round"
        />
        
        {/* Study points */}
        <circle cx="150" cy="100" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        <circle cx="150" cy="300" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        <circle cx="120" cy="530" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1" />
        
        {/* Labels */}
        <text x="170" y="100" fontSize="12" fill="#000">Plexo</text>
        <text x="170" y="300" fontSize="12" fill="#000">Hueco Poplíteo</text>
        <text x="80" y="530" fontSize="12" fill="#000">Maleolo Medial</text>
      </g>
    </svg>
  );
  
  const renderSelectedNerve = () => {
    switch(selectedNerve) {
      case 'median':
        return renderMedianNerve();
      case 'ulnar':
        return renderUlnarNerve();
      case 'peroneal':
        return renderPeronealNerve();
      case 'tibial':
        return renderTibialNerve();
      default:
        return renderMedianNerve();
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Visualización de Nervios</h2>
      
      <div className="mb-4">
        <select
          value={selectedNerve}
          onChange={(e) => setSelectedNerve(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {nerveOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="bg-white border rounded-lg p-4 flex flex-col items-center">
        {renderSelectedNerve()}
        
        <div className="mt-4 text-sm">
          <p className="text-gray-700">
            <strong>Instrucciones:</strong> Observe la representación del nervio {
              nerveOptions.find(opt => opt.id === selectedNerve)?.name
            }. Los puntos rojos indican los sitios comunes de estimulación en los estudios de neuroconducción.
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Información Relevante</h3>
        <div className="bg-blue-50 p-4 rounded-md">
          {selectedNerve === 'median' && (
            <div>
              <p className="mb-2">El nervio mediano es comúnmente evaluado en casos de:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Síndrome del túnel carpiano</li>
                <li>Lesiones del plexo braquial</li>
                <li>Polineuropatías metabólicas (ej. diabetes)</li>
                <li>Evaluación de radiculopatía C6-C7</li>
              </ul>
            </div>
          )}
          
          {selectedNerve === 'ulnar' && (
            <div>
              <p className="mb-2">El nervio cubital es comúnmente evaluado en casos de:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Neuropatía cubital en el codo (atrapamiento en canal cubital)</li>
                <li>Síndrome del canal de Guyon</li>
                <li>Lesiones del plexo braquial</li>
                <li>Evaluación de radiculopatía C8-T1</li>
              </ul>
            </div>
          )}
          
          {selectedNerve === 'peroneal' && (
            <div>
              <p className="mb-2">El nervio peroneo es comúnmente evaluado en casos de:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Neuropatía del peroneo común (pie caído)</li>
                <li>Atrapamiento en la cabeza del peroné</li>
                <li>Polineuropatías periféricas</li>
                <li>Evaluación de radiculopatía L4-L5</li>
              </ul>
            </div>
          )}
          
          {selectedNerve === 'tibial' && (
            <div>
              <p className="mb-2">El nervio tibial es comúnmente evaluado en casos de:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>Síndrome del túnel tarsiano</li>
                <li>Neuropatías periféricas</li>
                <li>Radiculopatías lumbosacras (L5-S1)</li>
                <li>Polineuropatías metabólicas y tóxicas</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NerveVisualization;