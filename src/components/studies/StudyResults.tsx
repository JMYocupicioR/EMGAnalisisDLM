import React from 'react';
import { StudyData } from '../../types';
import { Card, Typography, Divider, Space } from 'antd';

const { Title, Text } = Typography;

interface StudyResultsProps {
  data: StudyData;
}

const StudyResults: React.FC<StudyResultsProps> = ({ data }) => {
  const renderSideData = (side: 'left' | 'right', measurements: any) => {
    return (
      <Card>
        <Title level={4}>{side === 'left' ? 'Lado Izquierdo' : 'Lado Derecho'}</Title>
        <Space direction="vertical">
          <Text>Latencia: {measurements.latency} ms</Text>
          <Text>Amplitud: {measurements.amplitude} mV</Text>
          <Text>Velocidad: {measurements.velocity} m/s</Text>
          {measurements.fResponse && (
            <Text>Respuesta F: {measurements.fResponse} ms</Text>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }}>
        {data.sides.left && renderSideData('left', data.sides.left)}
        {data.sides.right && renderSideData('right', data.sides.right)}
        
        {data.notes && (
          <>
            <Divider />
            <Card>
              <Title level={4}>Notas</Title>
              <Text>{data.notes}</Text>
            </Card>
          </>
        )}
      </Space>
    </div>
  );
};

export default StudyResults; 