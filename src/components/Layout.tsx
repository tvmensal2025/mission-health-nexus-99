import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bannerType, setBannerType] = useState<'video' | 'image'>('video');
  
  // Dados mock para os cursos
  const courseSections = [
    {
      title: "Módulo 1: Introdução à Saúde",
      courses: [
        { id: 1, title: "Fundamentos da Saúde", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=01", lessons: 4 },
        { id: 2, title: "Nutrição Básica", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=02", lessons: 4 },
        { id: 3, title: "Exercícios Funcionais", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=03", lessons: 4 }
      ]
    },
    {
      title: "Módulo 2: Saúde Avançada",
      courses: [
        { id: 4, title: "Biohacking", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=11", lessons: 4 },
        { id: 5, title: "Sono de Qualidade", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=12", lessons: 4 },
        { id: 6, title: "Gerenciamento de Estresse", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=13", lessons: 4 },
        { id: 7, title: "Saúde Mental", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=14", lessons: 4 },
        { id: 8, title: "Longevidade", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=15", lessons: 4 },
        { id: 9, title: "Suplementação", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=16", lessons: 4 },
        { id: 10, title: "Jejum Intermitente", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=17", lessons: 4 }
      ]
    },
    {
      title: "Módulo 3: Especialização",
      courses: [
        { id: 11, title: "Nutrição Esportiva", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=21", lessons: 4 },
        { id: 12, title: "Meditação e Mindfulness", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=22", lessons: 4 },
        { id: 13, title: "Yoga para Saúde", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=23", lessons: 4 },
        { id: 14, title: "Treino de Força", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=24", lessons: 4 },
        { id: 15, title: "Alimentação Antiinflamatória", image: "https://via.placeholder.com/320x480/000000/FFFFFF?text=25", lessons: 4 }
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className="w-full">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
          {/* Banner Principal */}
          <div className="relative h-96 overflow-hidden">
            {bannerType === 'video' ? (
              // Banner com vídeo
              <div className="relative h-full bg-gradient-to-r from-orange-500 to-green-500">
                <div className="absolute inset-0 bg-black/30"></div>
                
                {/* Conteúdo do Banner */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                  <h1 className="text-6xl font-bold text-white mb-4">NOVO CONTEÚDO MENSALMENTE</h1>
                  <Button 
                    className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-3 text-lg"
                    size="lg"
                  >
                    Acessar Conteúdo
                  </Button>
                </div>
              </div>
            ) : (
              // Banner com imagem
              <div 
                className="relative h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://via.placeholder.com/1920x600/orange/white?text=BANNER+IMAGE')`,
                }}
              >
                <div className="absolute inset-0 bg-black/50"></div>
                
                {/* Conteúdo do Banner */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
                  <h1 className="text-6xl font-bold text-white mb-4">NOVO CONTEÚDO MENSALMENTE</h1>
                  <Button 
                    className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-3 text-lg"
                    size="lg"
                  >
                    Acessar Conteúdo
                  </Button>
                </div>
              </div>
            )}
            
            {/* Controles do banner */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-white/30 hover:bg-black/70 ${
                  bannerType === 'video' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-black/50 text-white'
                }`}
                onClick={() => setBannerType('video')}
              >
                Vídeo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-white/30 hover:bg-black/70 ${
                  bannerType === 'image' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-black/50 text-white'
                }`}
                onClick={() => setBannerType('image')}
              >
                Imagem
              </Button>
            </div>
          </div>
          
          {/* Carrosséis de Cursos */}
          <div className="container mx-auto px-6 py-8 space-y-12">
            {courseSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                {/* Título da seção */}
                <div className="bg-gray-800 px-6 py-4 rounded-lg">
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                  <span className="text-gray-400 text-sm">{section.courses.length} cursos</span>
                </div>
                
                {/* Grid de Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {section.courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex-shrink-0 w-80 h-[480px] bg-black rounded-lg cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden border border-red-500 flex flex-col items-center justify-center text-center p-6"
                      onClick={() => console.log('Clicou no curso:', course.title)}
                    >
                      {/* Número grande */}
                      <div className="text-8xl font-bold text-white mb-4">
                        {course.image.split('?text=')[1]}
                      </div>
                      
                      {/* Título */}
                      <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                      
                      {/* Número de aulas */}
                      <p className="text-white/90 text-lg mb-6">{course.lessons} aulas</p>
                      
                      {/* Botão Assistir */}
                      <div className="text-white text-lg font-semibold">Assistir</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}