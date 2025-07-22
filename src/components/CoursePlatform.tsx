import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  X,
  CheckCircle
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  students: number;
  rating: number;
  price: number;
  isFree: boolean;
  module: string;
  lessonCount: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'panda' | 'upload';
  isCompleted: boolean;
}

interface Module {
  id: string;
  title: string;
  courses: Course[];
}

interface CoursePlatformProps {
  viewMode: 'courses' | 'modules';
}

export const CoursePlatform: React.FC<CoursePlatformProps> = ({ viewMode = 'courses' }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - Módulos organizados
  const mockModules: Module[] = [
    {
      id: '1',
      title: 'MÓDULO 1: FUNDAMENTOS',
      courses: [
        {
          id: '1',
          title: '7 CHAVES',
          description: 'Fundamentos essenciais para sua transformação',
          thumbnail: 'https://via.placeholder.com/320x480/6366f1/ffffff?text=7+CHAVES',
          duration: 60,
          students: 15420,
          rating: 4.8,
          price: 0,
          isFree: true,
          module: 'fundamentos',
          lessonCount: 4
        },
        {
          id: '2',
          title: '12 CHÁS',
          description: 'Chás medicinais para saúde e bem-estar',
          thumbnail: 'https://via.placeholder.com/320x480/8b5cf6/ffffff?text=12+CHAS',
          duration: 45,
          students: 8920,
          rating: 4.9,
          price: 0,
          isFree: true,
          module: 'fundamentos',
          lessonCount: 4
        },
        {
          id: '3',
          title: 'PÍLULAS DO BEM',
          description: 'Suplementação natural e eficaz',
          thumbnail: 'https://via.placeholder.com/320x480/a855f7/ffffff?text=PILULAS+DO+BEM',
          duration: 90,
          students: 12340,
          rating: 4.7,
          price: 0,
          isFree: true,
          module: 'fundamentos',
          lessonCount: 4
        }
      ]
    },
    {
      id: '2',
      title: 'MÓDULO 2: NUTRIÇÃO',
      courses: [
        {
          id: '4',
          title: 'JEJUM INTERMITENTE',
          description: 'Guia completo do jejum intermitente',
          thumbnail: 'https://via.placeholder.com/320x480/ec4899/ffffff?text=JEJUM+INTERMITENTE',
          duration: 120,
          students: 9870,
          rating: 4.6,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '5',
          title: 'DIA A DIA',
          description: 'Rotina diária para uma vida saudável',
          thumbnail: '/api/placeholder/320/480/5',
          duration: 75,
          students: 7560,
          rating: 4.8,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '6',
          title: 'DOCES KIDS!',
          description: 'Receitas doces saudáveis para crianças',
          thumbnail: '/api/placeholder/320/480/6',
          duration: 60,
          students: 5430,
          rating: 4.9,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '7',
          title: 'ZERO LACTOSE',
          description: 'Alimentação sem lactose',
          thumbnail: '/api/placeholder/320/480/7',
          duration: 80,
          students: 4320,
          rating: 4.7,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '8',
          title: 'DIABÉTICOS',
          description: 'Nutrição para diabéticos',
          thumbnail: '/api/placeholder/320/480/8',
          duration: 90,
          students: 3210,
          rating: 4.8,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '9',
          title: 'LOW CARB',
          description: 'Dieta low carb eficaz',
          thumbnail: '/api/placeholder/320/480/9',
          duration: 100,
          students: 6540,
          rating: 4.6,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        },
        {
          id: '10',
          title: 'ZERO GLÚTEN',
          description: 'Vida sem glúten',
          thumbnail: '/api/placeholder/320/480/10',
          duration: 70,
          students: 5430,
          rating: 4.9,
          price: 0,
          isFree: true,
          module: 'nutricao',
          lessonCount: 4
        }
      ]
    },
    {
      id: '3',
      title: 'MÓDULO 3: FITNESS',
      courses: [
        {
          id: '11',
          title: 'MEMBROS SUPERIORES',
          description: 'Treino focado em braços e ombros',
          thumbnail: '/api/placeholder/320/480/11',
          duration: 60,
          students: 8760,
          rating: 4.7,
          price: 0,
          isFree: true,
          module: 'fitness',
          lessonCount: 4
        },
        {
          id: '12',
          title: 'TREINO PARA GESTANTES',
          description: 'Exercícios seguros para gestantes',
          thumbnail: '/api/placeholder/320/480/12',
          duration: 45,
          students: 5430,
          rating: 4.9,
          price: 0,
          isFree: true,
          module: 'fitness',
          lessonCount: 4
        },
        {
          id: '13',
          title: 'PERNAS DEFINIDAS',
          description: 'Treino para pernas tonificadas',
          thumbnail: '/api/placeholder/320/480/13',
          duration: 75,
          students: 9870,
          rating: 4.8,
          price: 0,
          isFree: true,
          module: 'fitness',
          lessonCount: 4
        },
        {
          id: '14',
          title: 'TREINO DE MOBILIDADE',
          description: 'Flexibilidade e mobilidade',
          thumbnail: '/api/placeholder/320/480/14',
          duration: 50,
          students: 6540,
          rating: 4.6,
          price: 0,
          isFree: true,
          module: 'fitness',
          lessonCount: 4
        },
        {
          id: '15',
          title: 'BUM BUM NA NUCA',
          description: 'Treino focado em glúteos',
          thumbnail: '/api/placeholder/320/480/15',
          duration: 65,
          students: 12340,
          rating: 4.9,
          price: 0,
          isFree: true,
          module: 'fitness',
          lessonCount: 4
        }
      ]
    }
  ];

  const mockLessons: Lesson[] = [
    {
      id: '1',
      title: 'Introdução ao HTML',
      description: 'Conceitos básicos de HTML e estrutura de páginas web',
      thumbnail: 'https://via.placeholder.com/200x120/6366f1/ffffff?text=HTML',
      duration: 15,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      isCompleted: false
    },
    {
      id: '2',
      title: 'CSS Básico',
      description: 'Estilização de páginas web com CSS',
      thumbnail: 'https://via.placeholder.com/200x120/8b5cf6/ffffff?text=CSS',
      duration: 20,
      videoUrl: 'https://vimeo.com/123456789',
      videoType: 'vimeo',
      isCompleted: false
    },
    {
      id: '3',
      title: 'JavaScript Fundamentos',
      description: 'Programação básica com JavaScript',
      thumbnail: 'https://via.placeholder.com/200x120/a855f7/ffffff?text=JavaScript',
      duration: 25,
      videoUrl: 'https://panda.com/video/abc123',
      videoType: 'panda',
      isCompleted: false
    },
    {
      id: '4',
      title: 'React Hooks',
      description: 'Gerenciamento de estado com React Hooks',
      thumbnail: 'https://via.placeholder.com/200x120/ec4899/ffffff?text=React',
      duration: 30,
      videoUrl: '/uploads/video.mp4',
      videoType: 'upload',
      isCompleted: false
    }
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuito' : `R$ ${price}`;
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedLesson(null);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
  };

  const filteredModules = mockModules.map(module => ({
    ...module,
    courses: module.courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(module => module.courses.length > 0);

  // Renderização da página inicial (grid de cursos)
  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Módulos */}
        <div className="container mx-auto px-6 py-8 space-y-12">
          {filteredModules.map((module) => (
            <div key={module.id} className="space-y-6">
              {/* Título do Módulo */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">{module.title}</h3>
                <span className="text-gray-400 text-sm">{module.courses.length} cursos</span>
              </div>
              
              {/* Grid de Cursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {module.courses.map((course) => (
                  <div
                    key={course.id}
                    className="w-80 h-96 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg cursor-pointer group transition-all duration-300 hover:scale-105 relative overflow-hidden border border-purple-500/30"
                    style={{
                      backgroundImage: `url(${course.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={() => handleCourseClick(course)}
                  >
                    {/* Overlay escuro */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                    
                    {/* Conteúdo do card */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                      <p className="text-white/90 text-sm mb-4">{course.lessonCount} aulas</p>
                      
                      {/* Botão Assistir */}
                      <Button 
                        className="bg-white text-purple-600 hover:bg-white/90 font-semibold w-full"
                        size="sm"
                      >
                        Assistir
                      </Button>
                    </div>
                    
                    {/* Badge de gratuito */}
                    {course.isFree && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 hover:bg-green-600 text-white">
                          Gratuito
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderização da página de aulas do curso
  if (selectedCourse && !selectedLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCourses}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-white">{selectedCourse.title}</h1>
            </div>
          </div>
        </header>

        {/* Banner do Curso */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">{selectedCourse.title}</h2>
              <p className="text-lg opacity-90">{selectedCourse.description}</p>
            </div>
          </div>
        </div>

        {/* Grid de Aulas */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="bg-gray-800/50 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                onClick={() => handleLessonClick(lesson)}
              >
                <div className="relative">
                  <div 
                    className="w-full h-40 bg-gradient-to-br from-purple-500 to-blue-600 rounded-t-lg flex items-center justify-center"
                    style={{
                      backgroundImage: `url(${lesson.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                    <div className="relative z-10">
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {lesson.isCompleted && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 hover:bg-green-600">
                        ✓ Concluída
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2">{lesson.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{lesson.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lesson.videoType.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Renderização do Player de Vídeo
  if (selectedCourse && selectedLesson) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header do Player */}
        <header className="bg-black border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToLessons}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
                Voltar ao Curso
              </Button>
              <h1 className="text-lg font-semibold text-white">{selectedCourse.title}</h1>
            </div>
            

          </div>
        </header>

        <div className="flex">
          {/* Player Principal */}
          <div className="flex-1">
            <div className="p-6">
              {/* Player de Vídeo */}
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                <div className="relative w-full" style={{ height: '776px' }}>
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎬</div>
                      <h3 className="text-2xl font-bold mb-2">{selectedLesson.title}</h3>
                      <p className="text-lg opacity-90">{selectedLesson.description}</p>
                      <div className="mt-4">
                        <Badge className="bg-purple-500 hover:bg-purple-600">
                          {selectedLesson.videoType.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações da Aula */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">{selectedLesson.title}</h2>
                <p className="text-gray-300">{selectedLesson.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(selectedLesson.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>1.2k visualizações</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar com Lista de Aulas */}
          <div className="w-80 bg-gray-900 border-l border-gray-800">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Aulas do Curso</h3>
                
                <div className="space-y-2">
                  {mockLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        lesson.id === selectedLesson.id 
                          ? 'bg-purple-600 text-white' 
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="w-16 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center">
                        <Play className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                        <p className="text-xs opacity-75">{formatDuration(lesson.duration)}</p>
                      </div>
                      
                      {lesson.isCompleted && (
                        <div className="text-green-400">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }

  return null;
};