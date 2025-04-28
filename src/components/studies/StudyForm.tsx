import React, { useState } from 'react';
import { StudyType, Side, NerveMeasurement, StudyData } from '../../types';
import { Button, Form, Input, Select, Space, Typography, Divider } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface StudyFormProps {
  studyType: StudyType;
  onSubmit: (data: StudyData) => void;
}

const StudyForm: React.FC<StudyFormProps> = ({ studyType, onSubmit }) => {
  const [form] = Form.useForm();
  const [selectedSides, setSelectedSides] = useState<Side[]>([]);

  const handleSideChange = (value: Side[]) => {
    setSelectedSides(value);
  };

  const handleSubmit = (values: any) => {
    const studyData: StudyData = {
      sides: {},
      notes: values.notes
    };

    if (selectedSides.includes('left')) {
      studyData.sides.left = {
        latency: values.leftLatency,
        amplitude: values.leftAmplitude,
        velocity: values.leftVelocity,
        fResponse: values.leftFResponse
      };
    }

    if (selectedSides.includes('right')) {
      studyData.sides.right = {
        latency: values.rightLatency,
        amplitude: values.rightAmplitude,
        velocity: values.rightVelocity,
        fResponse: values.rightFResponse
      };
    }

    onSubmit(studyData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ sides: [] }}
    >
      <Form.Item
        name="sides"
        label="Lados a evaluar"
        rules={[{ required: true, message: 'Seleccione al menos un lado' }]}
      >
        <Select
          mode="multiple"
          placeholder="Seleccione los lados"
          onChange={handleSideChange}
        >
          <Option value="left">Izquierdo</Option>
          <Option value="right">Derecho</Option>
        </Select>
      </Form.Item>

      {selectedSides.includes('left') && (
        <>
          <Divider orientation="left">Lado Izquierdo</Divider>
          <Form.Item
            name="leftLatency"
            label="Latencia (ms)"
            rules={[{ required: true, message: 'Ingrese la latencia' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="leftAmplitude"
            label="Amplitud (mV)"
            rules={[{ required: true, message: 'Ingrese la amplitud' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="leftVelocity"
            label="Velocidad (m/s)"
            rules={[{ required: true, message: 'Ingrese la velocidad' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="leftFResponse"
            label="Respuesta F (ms)"
          >
            <Input type="number" step="0.1" />
          </Form.Item>
        </>
      )}

      {selectedSides.includes('right') && (
        <>
          <Divider orientation="left">Lado Derecho</Divider>
          <Form.Item
            name="rightLatency"
            label="Latencia (ms)"
            rules={[{ required: true, message: 'Ingrese la latencia' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="rightAmplitude"
            label="Amplitud (mV)"
            rules={[{ required: true, message: 'Ingrese la amplitud' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="rightVelocity"
            label="Velocidad (m/s)"
            rules={[{ required: true, message: 'Ingrese la velocidad' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
          <Form.Item
            name="rightFResponse"
            label="Respuesta F (ms)"
          >
            <Input type="number" step="0.1" />
          </Form.Item>
        </>
      )}

      <Form.Item
        name="notes"
        label="Notas"
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Guardar Estudio
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudyForm; 