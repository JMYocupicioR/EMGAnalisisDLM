import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClinicalEvaluationForm from './components/ClinicalEvaluation';
import { Activity, AudioWaveform as Waveform, Brain, Zap } from 'lucide-react';
import EvaluationComplete from './components/EvaluationComplete';

const App: React.FC = () => {
  const [showQuestionnaire, setShowQuestionnaire] = React.useState(false);

  const handleSubmit = async (data: any) => {
    console.log('Form data submitted:', data);
    // Aquí puedes agregar la lógica para procesar los datos del formulario
    // Por ejemplo, enviarlos a un servidor o guardarlos en una base de datos
  };

  return (
    <Router>
      <Routes>
        <Route path="/evaluation-complete" element={<EvaluationComplete />} />
        <Route path="/" element={
          showQuestionnaire ? (
            <ClinicalEvaluationForm 
              patientId="123" // Esto debería ser un ID real del paciente
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
              {/* Animated background waves */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-gray-900 to-transparent" />
              </div>

              {/* Main content */}
              <div className="relative z-10">
                <nav className="container mx-auto px-6 py-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-8 w-8 text-blue-400" />
                      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        DLM EMG
                      </span>
                    </div>
                  </div>
                </nav>

                <main className="container mx-auto px-6 pt-20 pb-32">
                  <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center mb-8">
                      <Activity className="h-12 w-12 text-blue-400 mr-4" />
                      <Waveform className="h-12 w-12 text-purple-400" />
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      Electromiografía DLM
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                      Revolucionando el diagnóstico neurofisiológico con tecnología avanzada e inteligencia artificial
                    </p>
                    
                    <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                      Combine la precisión del análisis electromiográfico con herramientas de enseñanza interactivas para un diagnóstico más preciso y una experiencia de aprendizaje enriquecedora
                    </p>

                    <button
                      onClick={() => setShowQuestionnaire(true)}
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all duration-300 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      <Zap className="w-5 h-5 mr-2 animate-pulse" />
                      Iniciar Evaluación
                      <div className="absolute inset-0 bg-white/20 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-3 gap-8 mt-24">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                      <Activity className="h-8 w-8 text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-3">Análisis Preciso</h3>
                      <p className="text-gray-400">Evaluación detallada de la actividad muscular y nerviosa con tecnología de última generación</p>
                    </div>
                    
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                      <Brain className="h-8 w-8 text-purple-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-3">IA Asistida</h3>
                      <p className="text-gray-400">Interpretación avanzada de resultados potenciada por inteligencia artificial</p>
                    </div>
                    
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
                      <Waveform className="h-8 w-8 text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-3">Visualización Dinámica</h3>
                      <p className="text-gray-400">Representación visual clara y detallada de los patrones electromiográficos</p>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;