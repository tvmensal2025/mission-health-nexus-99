import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ClipboardList
} from "lucide-react";
import { CourseModal } from "./CourseModal";
import { ModuleModal } from "./ModuleModal";
import { LessonModal } from "./LessonModal";
import { JourneyModal } from "./JourneyModal";
import { QuizModal } from "./QuizModal";

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

interface CourseStats {
  totalCourses: number;
  totalModules: number;
  totalLessons: number;
  totalJourneys: number;
  totalQuizzes: number;
  totalStudents: number;
  views: number;
  revenue: number;
  completionRate: number;
}

export const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 12,
    totalModules: 45,
    totalLessons: 180,
    totalJourneys: 8,
    totalQuizzes: 15,
    totalStudents: 15420,
    views: 45600,
    revenue: 45600,
    completionRate: 67
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "courses", label: "Cursos", icon: BookOpen },
    { id: "modules", label: "Módulos", icon: FileText },
    { id: "lessons", label: "Aulas", icon: Video },
    { id: "journeys", label: "Jornadas", icon: Target },
    { id: "quizzes", label: "Quizzes", icon: CheckCircle },
    { id: "anamnesis", label: "Anamnese", icon: ClipboardList },
    { id: "sessions", label: "Sessões", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "users", label: "Usuários", icon: Users },
    { id: "settings", label: "Configurações", icon: Settings }
  ];

  const quickActions = [
    { label: "Adicionar Curso", icon: BookOpen, action: () => setIsModalOpen(true) },
    { label: "Adicionar Módulo", icon: FileText, action: () => setIsModuleModalOpen(true) },
    { label: "Adicionar Aula Avançada", icon: Video, action: () => setIsLessonModalOpen(true) },
    { label: "Adicionar Jornada", icon: Target, action: () => setIsJourneyModalOpen(true) },
    { label: "Adicionar Quiz", icon: CheckCircle, action: () => setIsQuizModalOpen(true) }
  ];

  const topPerformers = [
    { name: "7 CHAVES", position: "1°" },
    { name: "12 CHÁS", position: "2°" },
    { name: "PÍLULAS DO BEM", position: "3°" }
  ];

  const mockCourses: Course[] = [
    {
      id: "1",
      title: "7 CHAVES",
      description: "Curso completo sobre as 7 chaves para uma vida saudável",
      modules: 7,
      lessons: 28,
      students: 3200,
      rating: 4.8,
      status: 'active',
      category: "Saúde",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20"
    },
    {
      id: "2",
      title: "12 CHÁS",
      description: "Guia completo sobre os 12 chás medicinais",
      modules: 12,
      lessons: 48,
      students: 2800,
      rating: 4.6,
      status: 'active',
      category: "Nutrição",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18"
    },
    {
      id: "3",
      title: "PÍLULAS DO BEM",
      description: "Suplementos naturais para saúde e bem-estar",
      modules: 8,
      lessons: 32,
      students: 2100,
      rating: 4.7,
      status: 'active',
      category: "Suplementação",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-15"
    }
  ];

  const mockModules = [
    { id: "1", title: "Introdução às 7 Chaves", courseId: "1" },
    { id: "2", title: "Chave 1: Alimentação", courseId: "1" },
    { id: "3", title: "Chave 2: Exercícios", courseId: "1" },
    { id: "4", title: "Introdução aos Chás", courseId: "2" },
    { id: "5", title: "Chás Calmantes", courseId: "2" },
    { id: "6", title: "Chás Energéticos", courseId: "2" },
    { id: "7", title: "Introdução aos Suplementos", courseId: "3" },
    { id: "8", title: "Vitaminas Essenciais", courseId: "3" }
  ];

  const mockLessons = [
    { id: "1", title: "Introdução às 7 Chaves da Saúde", courseId: "1", moduleId: "1" },
    { id: "2", title: "Alimentação Saudável - Fundamentos", courseId: "1", moduleId: "2" },
    { id: "3", title: "Exercícios para Iniciantes", courseId: "1", moduleId: "3" },
    { id: "4", title: "História dos Chás Medicinais", courseId: "2", moduleId: "4" },
    { id: "5", title: "Chá de Camomila - Propriedades", courseId: "2", moduleId: "5" },
    { id: "6", title: "Chá Verde - Benefícios", courseId: "2", moduleId: "6" },
    { id: "7", title: "Suplementos Básicos", courseId: "3", moduleId: "7" },
    { id: "8", title: "Vitamina D - Importância", courseId: "3", moduleId: "8" }
  ];

  useEffect(() => {
    setCourses(mockCourses);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateCourse = async (courseData: { title: string; description: string; isActive: boolean; category: string }) => {
    try {
      // Simular criação do curso
      const newCourse: Course = {
        id: Date.now().toString(),
        title: courseData.title,
        description: courseData.description,
        modules: 0,
        lessons: 0,
        students: 0,
        rating: 0,
        status: courseData.isActive ? 'active' : 'draft',
        category: courseData.category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCourses(prev => [newCourse, ...prev]);
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalCourses: prev.totalCourses + 1
      }));

      console.log("Curso criado com sucesso:", newCourse);
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      throw error;
    }
  };

  const handleCreateModule = async (moduleData: { title: string; description: string; courseId: string; order: number; isActive: boolean }) => {
    try {
      // Simular criação do módulo
      const newModule = {
        id: Date.now().toString(),
        title: moduleData.title,
        description: moduleData.description,
        courseId: moduleData.courseId,
        order: moduleData.order,
        isActive: moduleData.isActive,
        createdAt: new Date().toISOString()
      };

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalModules: prev.totalModules + 1
      }));

      // Atualizar o curso correspondente
      setCourses(prev => prev.map(course => 
        course.id === moduleData.courseId 
          ? { ...course, modules: course.modules + 1 }
          : course
      ));

      console.log("Módulo criado com sucesso:", newModule);
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
      throw error;
    }
  };

  const handleCreateLesson = async (lessonData: { title: string; description: string; type: string; duration: string; order: number; isActive: boolean; courseId: string; moduleId: string; videoUrl?: string; richTextContent?: string; mixedContent?: string; objectives?: string[]; prerequisites?: string[]; resources?: string[]; quizJson?: string; tags?: string[] }) => {
    try {
      // Simular criação da aula
      const newLesson = {
        id: Date.now().toString(),
        title: lessonData.title,
        description: lessonData.description,
        type: lessonData.type,
        duration: lessonData.duration,
        order: lessonData.order,
        isActive: lessonData.isActive,
        courseId: lessonData.courseId,
        moduleId: lessonData.moduleId,
        videoUrl: lessonData.videoUrl,
        richTextContent: lessonData.richTextContent,
        mixedContent: lessonData.mixedContent,
        objectives: lessonData.objectives,
        prerequisites: lessonData.prerequisites,
        resources: lessonData.resources,
        quizJson: lessonData.quizJson,
        tags: lessonData.tags,
        createdAt: new Date().toISOString()
      };

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalLessons: prev.totalLessons + 1
      }));

      // Atualizar o curso correspondente
      setCourses(prev => prev.map(course => 
        course.id === lessonData.courseId 
          ? { ...course, lessons: course.lessons + 1 }
          : course
      ));

      console.log("Aula criada com sucesso:", newLesson);
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      throw error;
    }
  };

  const handleCreateJourney = async (journeyData: any) => {
    try {
      // Simular criação da jornada
      const newJourney = {
        id: Date.now().toString(),
        title: journeyData.title,
        description: journeyData.description,
        duration: journeyData.duration,
        isActive: journeyData.isActive,
        items: journeyData.items,
        totalItems: journeyData.items.length,
        totalDuration: journeyData.items.reduce((sum: number, item: any) => sum + item.duration, 0),
        createdAt: new Date().toISOString()
      };

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalJourneys: (prev.totalJourneys || 0) + 1
      }));

      console.log("Jornada criada com sucesso:", newJourney);
    } catch (error) {
      console.error("Erro ao criar jornada:", error);
      throw error;
    }
  };

  const handleCreateQuiz = async (quizData: any) => {
    try {
      // Simular criação do quiz
      const newQuiz = {
        id: Date.now().toString(),
        title: quizData.title,
        description: quizData.description,
        lessonId: quizData.lessonId,
        timeLimit: quizData.timeLimit,
        minimumScore: quizData.minimumScore,
        questions: quizData.questions,
        totalQuestions: quizData.questions.length,
        totalPoints: quizData.questions.reduce((sum: number, question: any) => sum + question.points, 0),
        createdAt: new Date().toISOString()
      };

      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalQuizzes: (prev.totalQuizzes || 0) + 1
      }));

      console.log("Quiz criado com sucesso:", newQuiz);
    } catch (error) {
      console.error("Erro ao criar quiz:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 bg-black text-white min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <Badge variant="outline" className="bg-black border-white text-white text-xs">
              Sistema Ativo
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-black">
            <Upload className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-black">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-red-500 text-white shadow-sm' 
                  : 'text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* First Row - Main Stats */}
        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Cursos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
            <p className="text-xs text-gray-400">Cursos ativos</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Módulos
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalModules}</div>
            <p className="text-xs text-gray-400">Módulos criados</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Aulas
            </CardTitle>
            <Video className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalLessons}</div>
            <p className="text-xs text-gray-400">Aulas publicadas</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-gray-400">Usuários registrados</p>
          </CardContent>
        </Card>

        {/* Second Row - Actions and Metrics */}
        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="h-4 w-4 text-red-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-600 text-white hover:bg-gray-800"
                  onClick={action.action}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Visualizações:</span>
              <span className="font-medium text-white">{stats.views.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Receita:</span>
              <span className="font-medium text-white">R$ {stats.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Taxa de Conclusão:</span>
              <span className="font-medium text-white">{stats.completionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-4 w-4" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{performer.name}</span>
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0 border-white text-white">
                  {performer.position}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Course List Section */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Cursos</h2>
            <Button 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'} className={course.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                      {course.status === 'active' ? 'Ativo' : course.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                  <p className="text-sm text-gray-300">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Módulos:</span>
                      <span className="font-medium text-white">{course.modules}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Aulas:</span>
                      <span className="font-medium text-white">{course.lessons}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Estudantes:</span>
                      <span className="font-medium text-white">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Avaliação:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-white">{course.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-white hover:bg-gray-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 border-gray-600 text-white hover:bg-gray-800">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Anamnese Section */}
      {activeTab === "anamnesis" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Anamnese</h2>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Nova Anamnese
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300">Gestão de formulários de anamnese em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessões Section */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Sessões</h2>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300">Gestão de sessões e consultas em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Section */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Analytics</h2>
            <Button className="bg-red-500 hover:bg-red-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300">Análises e relatórios avançados em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usuários Section */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Usuários</h2>
            <Button className="bg-red-500 hover:bg-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300">Gestão de usuários em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configurações Section */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Configurações</h2>
            <Button className="bg-red-500 hover:bg-red-600">
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300">Configurações do sistema em desenvolvimento...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCourse}
      />

      {/* Module Modal */}
      <ModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSubmit={handleCreateModule}
        courses={courses}
      />

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSubmit={handleCreateLesson}
        courses={courses}
        modules={mockModules}
      />

      {/* Journey Modal */}
      <JourneyModal
        isOpen={isJourneyModalOpen}
        onClose={() => setIsJourneyModalOpen(false)}
        onSubmit={handleCreateJourney}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSubmit={handleCreateQuiz}
        lessons={mockLessons}
      />
    </div>
  );
}; 