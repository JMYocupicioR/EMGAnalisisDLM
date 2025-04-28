import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  studies: Array<{
    timestamp: string;
    measurements: {
      latency: number;
      amplitude: number;
      velocity: number;
    };
  }>;
  nerve: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ studies, nerve }) => {
  const sortedStudies = [...studies].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const data = {
    labels: sortedStudies.map(study => 
      new Date(study.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Latencia (ms)',
        data: sortedStudies.map(study => study.measurements.latency),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Amplitud (mV)',
        data: sortedStudies.map(study => study.measurements.amplitude),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Velocidad (m/s)',
        data: sortedStudies.map(study => study.measurements.velocity),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Tendencia de Mediciones - ${nerve}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Line data={data} options={options} />
    </div>
  );
};

export default TrendChart;