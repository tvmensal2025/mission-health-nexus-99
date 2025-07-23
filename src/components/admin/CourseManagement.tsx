import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  FileText, 
  Video, 
  Target, 
  CheckCircle, 
  FileText as FileTextIcon,
  Calendar,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  Share2,
  Star,
  Users,
  Clock,
  TrendingUp,
  Award,
  Upload,
  Settings,
  ClipboardList,
  Shield,
  Monitor
} from "lucide-react";
import { CourseModal } from "./CourseModal";
import { ModuleModal } from "./ModuleModal";
import { LessonModal } from "./LessonModal";
import { JourneyModal } from "./JourneyModal";
import { QuizModal } from "./QuizModal";
import { QuizSystem } from "./QuizSystem";

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  students: number;
  rating: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Dados mockados
  const courses: Course[] = [
    {
      id: "1",
      title: "7 CHAVES",
      description: "7 chaves que me ajudam no dia a dia",
      modules: 7,
      lessons: 7,
      students: 1247,
      rating: 4.8,
      status: 'active',
      category: 'Mindset',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: "2",
      title: "E-BOOK 12 CHÁS",
      description: "Guia completo dos 12 chás medicinais",
      modules: 3,
      lessons: 12,
      students: 892,
      rating: 4.9,
      status: 'active',
      category: 'Nutrição',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: "3",
      title: "PÍLULAS DO BEM",
      description: "Suplementos naturais e eficazes",
      modules: 2,
      lessons: 8,
      students: 634,
      rating: 4.7,
      status: 'active',
      category: 'Saúde',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-15'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão de Cursos</h2>
          <p className="text-gray-400">Gerencie cursos, módulos, aulas, jornadas e quizzes</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Modo Admin Ativo
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Monitor className="h-4 w-4 mr-2" />
            Visualizar como Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-gray-400">+2 este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Módulos</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">45</div>
            <p className="text-xs text-gray-400">+8 este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Aulas</CardTitle>
            <Video className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">180</div>
            <p className="text-xs text-gray-400">+25 este mês</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2,773</div>
            <p className="text-xs text-gray-400">+156 este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes seções */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 bg-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="modules">
            <FileText className="h-4 w-4 mr-2" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <Video className="h-4 w-4 mr-2" />
            Aulas
          </TabsTrigger>
          <TabsTrigger value="journeys">
            <Target className="h-4 w-4 mr-2" />
            Jornadas
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <CheckCircle className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="anamnese">
            <ClipboardList className="h-4 w-4 mr-2" />
            Anamnese
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="h-4 w-4 mr-2" />
            Sessões
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cursos em Destaque */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Cursos em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-white">{course.title}</h4>
                      <p className="text-sm text-gray-400">{course.students} alunos</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-600">★ {course.rating}</Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">Nova aula adicionada ao curso "7 CHAVES"</p>
                      <p className="text-xs text-gray-400">2 horas atrás</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">Quiz "Avaliação Final" foi completado por 15 alunos</p>
                      <p className="text-xs text-gray-400">4 horas atrás</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">Novo módulo criado em "PÍLULAS DO BEM"</p>
                      <p className="text-xs text-gray-400">1 dia atrás</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  className="h-20 bg-blue-600 hover:bg-blue-700 flex flex-col"
                  onClick={() => setShowCourseModal(true)}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  Novo Curso
                </Button>
                <Button 
                  className="h-20 bg-green-600 hover:bg-green-700 flex flex-col"
                  onClick={() => setShowModuleModal(true)}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Novo Módulo
                </Button>
                <Button 
                  className="h-20 bg-purple-600 hover:bg-purple-700 flex flex-col"
                  onClick={() => setShowLessonModal(true)}
                >
                  <Video className="h-6 w-6 mb-2" />
                  Nova Aula
                </Button>
                <Button 
                  className="h-20 bg-orange-600 hover:bg-orange-700 flex flex-col"
                  onClick={() => setShowQuizModal(true)}
                >
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Novo Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestão de Cursos */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Gestão de Cursos</h3>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowCourseModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Curso
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                    <Badge className={`${
                      course.status === 'active' ? 'bg-green-600' : 
                      course.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{course.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">{course.modules} módulos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">{course.lessons} aulas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">{course.students} alunos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sistema de Quizzes */}
        <TabsContent value="quizzes" className="space-y-6">
          <QuizSystem courseId="1" />
        </TabsContent>

        {/* Outras abas */}
        <TabsContent value="modules">
          <div className="text-center py-8 text-gray-400">
            Gestão de Módulos em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="lessons">
          <div className="text-center py-8 text-gray-400">
            Gestão de Aulas em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="journeys">
          <div className="text-center py-8 text-gray-400">
            Gestão de Jornadas em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="anamnese">
          <div className="text-center py-8 text-gray-400">
            Sistema de Anamnese em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="text-center py-8 text-gray-400">
            Gestão de Sessões em desenvolvimento...
          </div>
        </TabsContent>
      </Tabs>

      {/* Modais */}
      {showCourseModal && (
        <CourseModal 
          isOpen={showCourseModal}
          onClose={() => setShowCourseModal(false)}
          onSubmit={(data) => {
            console.log('Curso criado:', data);
            setShowCourseModal(false);
          }}
        />
      )}
      {showModuleModal && (
        <ModuleModal 
          isOpen={showModuleModal}
          onClose={() => setShowModuleModal(false)}
          onSubmit={(data) => {
            console.log('Módulo criado:', data);
            setShowModuleModal(false);
          }}
          courses={courses}
        />
      )}
      {showLessonModal && (
        <LessonModal 
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          onSubmit={(data) => {
            console.log('Aula criada:', data);
            setShowLessonModal(false);
          }}
          courses={courses}
          modules={[]}
        />
      )}
      {showJourneyModal && (
        <JourneyModal 
          isOpen={showJourneyModal}
          onClose={() => setShowJourneyModal(false)}
          onSubmit={(data) => {
            console.log('Jornada criada:', data);
            setShowJourneyModal(false);
          }}
        />
      )}
      {showQuizModal && (
        <QuizModal 
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          onSubmit={(data) => {
            console.log('Quiz criado:', data);
            setShowQuizModal(false);
          }}
          lessons={[]}
        />
      )}
    </div>
  );
}; 