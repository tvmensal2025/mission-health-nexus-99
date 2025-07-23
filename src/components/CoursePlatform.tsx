import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PremiumContentGuard from './PremiumContentGuard';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  X,
  CheckCircle,
  Lock,
  BarChart3,
  BookOpen,
  FileText,
  Video,
  Target,
  Settings,
  Upload,
  TrendingUp,
  DollarSign,
  Eye
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
  isPremium?: boolean;
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

  // Dados mockados baseados no design original
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
          isPremium: false,
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
          isPremium: false,
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
          price: 29.90,
          isFree: false,
          isPremium: true,
          module: 'fundamentos',
          lessonCount: 4
        }
      ]
    }
  ];

  const mockLessons: Lesson[] = [
    {
      id: '1',
      title: 'Introdução ao Curso',
      description: 'Aula inicial com visão geral do conteúdo',
      thumbnail: 'https://via.placeholder.com/320x180/6366f1/ffffff?text=Aula+1',
      duration: 15,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Conceitos Fundamentais',
      description: 'Aprendendo os conceitos básicos',
      thumbnail: 'https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Aula+2',
      duration: 25,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Prática e Exercícios',
      description: 'Aplicando o conhecimento na prática',
      thumbnail: 'https://via.placeholder.com/320x180/a855f7/ffffff?text=Aula+3',
      duration: 30,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      isCompleted: false
    },
    {
      id: '4',
      title: 'Conclusão e Próximos Passos',
      description: 'Finalizando o curso e planejando o futuro',
      thumbnail: 'https://via.placeholder.com/320x180/ec4899/ffffff?text=Aula+4',
      duration: 20,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoType: 'youtube',
      isCompleted: false
    }
  ];

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Gratuito' : `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Design original baseado na imagem - Painel Administrativo
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400">Gestão completa do sistema</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <Card className="bg-gray-700 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Seções</CardTitle>
              <p className="text-gray-400 text-sm">Navegue entre as diferentes áreas</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
                <span className="ml-auto text-xs text-gray-500">Visão geral do sistema</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Usuários
                <span className="ml-auto text-xs text-gray-500">Gerenciar usuários e permissões</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-600">
                <Target className="h-4 w-4 mr-2" />
                Pesagem
                <span className="ml-auto text-xs text-gray-500">Monitoramento de pesagens</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-orange-400 hover:bg-gray-600 border-l-2 border-orange-400">
                <BookOpen className="h-4 w-4 mr-2" />
                Cursos
                <span className="ml-auto text-xs text-gray-500">Gestão de cursos e conteúdo</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Pagamentos
                <span className="ml-auto text-xs text-gray-500">Gestão de pagamentos Asaas</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
                <span className="ml-auto text-xs text-gray-500">Relatórios avançados</span>
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl">Admin Panel</CardTitle>
                  <Badge className="bg-green-600 text-white mt-2">Sistema Ativo</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    <Upload className="h-4 w-4 mr-2" />
                    Backup
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tabs */}
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-8 bg-gray-700">
                  <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="cursos">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Cursos
                  </TabsTrigger>
                  <TabsTrigger value="modulos">
                    <FileText className="h-4 w-4 mr-2" />
                    Módulos
                  </TabsTrigger>
                  <TabsTrigger value="aulas">
                    <Video className="h-4 w-4 mr-2" />
                    Aulas
                  </TabsTrigger>
                  <TabsTrigger value="jornadas">
                    <Target className="h-4 w-4 mr-2" />
                    Jornadas
                  </TabsTrigger>
                  <TabsTrigger value="quizzes">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Quizzes
                  </TabsTrigger>
                  <TabsTrigger value="anamnese">
                    <FileText className="h-4 w-4 mr-2" />
                    Anamnese
                  </TabsTrigger>
                  <TabsTrigger value="sessoes">
                    <Clock className="h-4 w-4 mr-2" />
                    Sessões
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6 mt-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total de Cursos</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">12</div>
                        <p className="text-xs text-muted-foreground">Cursos ativos</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total de Módulos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">45</div>
                        <p className="text-xs text-muted-foreground">Módulos criados</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total de Aulas</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">180</div>
                        <p className="text-xs text-muted-foreground">Aulas publicadas</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-white">15.420</div>
                        <p className="text-xs text-muted-foreground">Usuários registrados</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bottom Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">Ações Rápidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Adicionar Curso
                        </Button>
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <FileText className="h-4 w-4 mr-2" />
                          Adicionar Módulo
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">Métricas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Visualizações:</span>
                          <span className="text-white font-semibold">45.600</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Receita:</span>
                          <span className="text-white font-semibold">R$ 45.600</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Taxa de:</span>
                          <span className="text-white font-semibold">67%</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">7 CHAVES:</span>
                          <Badge className="bg-yellow-600">1°</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">12 CHÁS:</span>
                          <Badge className="bg-gray-600">2°</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="cursos" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Gestão de Cursos</h3>
                    <p className="text-gray-400">Interface para gerenciar cursos e conteúdo premium.</p>
                  </div>
                </TabsContent>

                <TabsContent value="modulos" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Gestão de Módulos</h3>
                    <p className="text-gray-400">Organize o conteúdo em módulos estruturados.</p>
                  </div>
                </TabsContent>

                <TabsContent value="aulas" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Gestão de Aulas</h3>
                    <p className="text-gray-400">Crie e edite aulas com diferentes tipos de mídia.</p>
                  </div>
                </TabsContent>

                <TabsContent value="jornadas" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Jornadas de Aprendizado</h3>
                    <p className="text-gray-400">Defina caminhos personalizados para os usuários.</p>
                  </div>
                </TabsContent>

                <TabsContent value="quizzes" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Sistema de Quizzes</h3>
                    <p className="text-gray-400">Crie avaliações e testes para os alunos.</p>
                  </div>
                </TabsContent>

                <TabsContent value="anamnese" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Anamnese</h3>
                    <p className="text-gray-400">Coleta de dados e histórico dos usuários.</p>
                  </div>
                </TabsContent>

                <TabsContent value="sessoes" className="mt-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Sessões</h3>
                    <p className="text-gray-400">Agendamento e gestão de sessões ao vivo.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};