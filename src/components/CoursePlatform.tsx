import React, { useState } from 'react';
import { 
  Play, Clock, Users, Star, BookOpen, Award, 
  ChevronRight, Search, Filter, Grid, List
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock course data
const courses = [
  {
    id: 1,
    title: "Fundamentos da Saúde",
    category: "Saúde Básica",
    instructor: "Dr. Ana Silva",
    duration: "2h 30min",
    progress: 75,
    rating: 4.8,
    students: 1250,
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=225&fit=crop",
    description: "Aprenda os conceitos fundamentais para uma vida saudável e equilibrada.",
    episodes: [
      { id: 1, title: "Introdução à Saúde", duration: "15min", completed: true },
      { id: 2, title: "Nutrição Básica", duration: "20min", completed: true },
      { id: 3, title: "Exercícios Essenciais", duration: "25min", completed: false },
      { id: 4, title: "Sono e Recuperação", duration: "18min", completed: false }
    ]
  },
  {
    id: 2,
    title: "Emagrecimento Sustentável",
    category: "Emagrecimento",
    instructor: "Dra. Maria Santos",
    duration: "3h 45min",
    progress: 45,
    rating: 4.9,
    students: 890,
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
    description: "Estratégias científicas para perder peso de forma saudável e duradoura.",
    episodes: [
      { id: 1, title: "Mitos e Verdades", duration: "18min", completed: true },
      { id: 2, title: "Déficit Calórico", duration: "25min", completed: false },
      { id: 3, title: "Exercícios para Queima", duration: "30min", completed: false }
    ]
  },
  {
    id: 3,
    title: "Mindfulness e Bem-estar",
    category: "Saúde Mental",
    instructor: "Prof. Carlos Lima",
    duration: "1h 45min",
    progress: 0,
    rating: 4.7,
    students: 2100,
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=400&h=225&fit=crop",
    description: "Técnicas de meditação e mindfulness para reduzir o estresse.",
    episodes: [
      { id: 1, title: "O que é Mindfulness", duration: "12min", completed: false },
      { id: 2, title: "Respiração Consciente", duration: "15min", completed: false },
      { id: 3, title: "Meditação Guiada", duration: "20min", completed: false }
    ]
  },
  {
    id: 4,
    title: "Nutrição Avançada",
    category: "Nutrição",
    instructor: "Dra. Fernanda Costa",
    duration: "4h 20min",
    progress: 20,
    rating: 4.8,
    students: 756,
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop",
    description: "Aprofunde seus conhecimentos em nutrição e planejamento alimentar.",
    episodes: [
      { id: 1, title: "Macronutrientes", duration: "22min", completed: true },
      { id: 2, title: "Micronutrientes", duration: "18min", completed: false },
      { id: 3, title: "Timing Nutricional", duration: "25min", completed: false }
    ]
  },
  {
    id: 5,
    title: "Treino Funcional",
    category: "Exercício",
    instructor: "Prof. Roberto Alves",
    duration: "2h 15min",
    progress: 0,
    rating: 4.6,
    students: 1890,
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
    description: "Exercícios funcionais para melhorar força, flexibilidade e coordenação.",
    episodes: [
      { id: 1, title: "Aquecimento Dinâmico", duration: "10min", completed: false },
      { id: 2, title: "Exercícios de Core", duration: "20min", completed: false },
      { id: 3, title: "Treino Completo", duration: "30min", completed: false }
    ]
  },
  {
    id: 6,
    title: "Sono e Recuperação",
    category: "Recuperação",
    instructor: "Dr. João Pereira",
    duration: "1h 30min",
    progress: 100,
    rating: 4.9,
    students: 1456,
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop",
    description: "Otimize seu sono para melhor recuperação e performance.",
    episodes: [
      { id: 1, title: "Ciclos do Sono", duration: "15min", completed: true },
      { id: 2, title: "Higiene do Sono", duration: "18min", completed: true },
      { id: 3, title: "Técnicas de Relaxamento", duration: "12min", completed: true }
    ]
  }
];

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  thumbnail: string;
  progress: number;
  episodes?: { id: number; title: string; duration: string; completed: boolean; }[];
}

const categories = ["Todos", "Saúde Básica", "Emagrecimento", "Saúde Mental", "Nutrição", "Exercício", "Recuperação"];

const CourseCard = ({ course, viewMode }: { course: Course; viewMode: 'grid' | 'list' }) => {
  if (viewMode === 'list') {
    return (
      <Card className="health-card flex flex-row">
        <div className="w-48 h-32 relative overflow-hidden rounded-l-2xl">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="mb-2">{course.category}</Badge>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">{course.title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{course.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{course.students}</span>
              </div>
              <span>por {course.instructor}</span>
            </div>
            
            <Button variant="gradient">
              {course.progress > 0 ? 'Continuar' : 'Começar'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {course.progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="health-card group cursor-pointer">
      <div className="relative overflow-hidden rounded-t-2xl">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
        
        {/* Progress overlay */}
        {course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <div className="flex justify-between text-white text-xs mb-1">
              <span>Progresso</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-1" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{course.category}</Badge>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {course.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.students}</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">por {course.instructor}</p>
        
        <Button className="w-full bg-gradient-primary hover:opacity-90">
          {course.progress > 0 ? 'Continuar Curso' : 'Começar Curso'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CoursePlatform() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const inProgressCourses = courses.filter(course => course.progress > 0 && course.progress < 100);
  const completedCourses = courses.filter(course => course.progress === 100);

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Plataforma dos Sonhos</h1>
          <p className="text-muted-foreground">Sua jornada de aprendizado em saúde</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-primary' : ''}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Sections */}
      <Tabs defaultValue="todos" className="space-y-6">
        <TabsList className="bg-card">
          <TabsTrigger value="todos">Todos os Cursos</TabsTrigger>
          <TabsTrigger value="progresso">Em Progresso ({inProgressCourses.length})</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos ({completedCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-6">
          {/* Featured Course */}
          <Card className="bg-gradient-primary text-white overflow-hidden">
            <div className="p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative z-10">
                <Badge className="bg-white/20 text-white mb-4">✨ Destaque da Semana</Badge>
                <h2 className="text-2xl font-bold mb-2">Fundamentos da Saúde</h2>
                <p className="text-white/90 mb-4 max-w-md">
                  Comece sua jornada de transformação com nosso curso mais popular. 
                  Aprenda os pilares fundamentais de uma vida saudável.
                </p>
                <div className="flex items-center space-x-4 text-sm mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>2h 30min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>1,250 alunos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Play className="w-4 h-4 mr-2" />
                  Assistir Agora
                </Button>
              </div>
            </div>
          </Card>

          {/* All Courses Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} viewMode={viewMode} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progresso">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} course={course} viewMode={viewMode} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="concluidos">
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {completedCourses.map((course) => (
              <div key={course.id} className="relative">
                <CourseCard course={course} viewMode={viewMode} />
                <div className="absolute top-4 right-4 bg-success text-white p-2 rounded-full">
                  <Award className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}