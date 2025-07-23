import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  Calendar,
  Target,
  Brain,
  FileText,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { UserSession } from '@/integrations/supabase/types';

const UserSessions: React.FC = () => {
  const { userSessions, loading, error, fetchUserSessions, updateUserSession } = useSessionManagement();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Buscar usuário atual
    const getUser = async () => {
      const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
      if (user) {
        setCurrentUser(user.id);
        fetchUserSessions(user.id);
      }
    };
    getUser();
  }, []);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'saboteur_work':
        return <Brain className="h-4 w-4" />;
      case 'coaching':
        return <Target className="h-4 w-4" />;
      case 'assessment':
        return <FileText className="h-4 w-4" />;
      case 'reflection':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'skipped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'Pendente';
      case 'in_progress':
        return 'Em Progresso';
      case 'completed':
        return 'Concluída';
      case 'skipped':
        return 'Pulada';
      default:
        return status;
    }
  };

  const handleStartSession = async (userSessionId: string) => {
    try {
      await updateUserSession(userSessionId, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  };

  const handleCompleteSession = async (userSessionId: string) => {
    try {
      await updateUserSession(userSessionId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress: 100
      });
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const pendingSessions = userSessions.filter(s => s.status === 'assigned');
  const inProgressSessions = userSessions.filter(s => s.status === 'in_progress');
  const completedSessions = userSessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Minhas Sessões</h2>
        <p className="text-muted-foreground">
          Sessões personalizadas criadas especialmente para você
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Sessões recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando início
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inProgressSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Sendo realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessões Pendentes */}
      {pendingSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sessões Pendentes
          </h3>
          
          <div className="grid gap-4">
            {pendingSessions.map((userSession) => (
              <Card key={userSession.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSessionTypeIcon(userSession.session?.type || '')}
                        <CardTitle className="text-lg">{userSession.session?.title}</CardTitle>
                        <Badge className={getStatusColor(userSession.status)}>
                          {getStatusLabel(userSession.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {userSession.session?.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {userSession.session?.estimated_time || 0} min
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Prazo: {userSession.due_date ? formatDate(userSession.due_date) : 'Não definido'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {userSession.due_date && getDaysRemaining(userSession.due_date) > 0 
                          ? `${getDaysRemaining(userSession.due_date)} dias restantes`
                          : 'Prazo vencido'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleStartSession(userSession.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Sessão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sessões em Progresso */}
      {inProgressSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5" />
            Sessões em Progresso
          </h3>
          
          <div className="grid gap-4">
            {inProgressSessions.map((userSession) => (
              <Card key={userSession.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSessionTypeIcon(userSession.session?.type || '')}
                        <CardTitle className="text-lg">{userSession.session?.title}</CardTitle>
                        <Badge className={getStatusColor(userSession.status)}>
                          {getStatusLabel(userSession.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {userSession.session?.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Progress value={userSession.progress} className="flex-1" />
                      <span className="text-sm font-medium">{userSession.progress}%</span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {userSession.session?.estimated_time || 0} min
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Iniciada em {userSession.started_at ? formatDate(userSession.started_at) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </Button>
                      <Button 
                        onClick={() => handleCompleteSession(userSession.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sessões Concluídas */}
      {completedSessions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sessões Concluídas
          </h3>
          
          <div className="grid gap-4">
            {completedSessions.map((userSession) => (
              <Card key={userSession.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSessionTypeIcon(userSession.session?.type || '')}
                        <CardTitle className="text-lg">{userSession.session?.title}</CardTitle>
                        <Badge className={getStatusColor(userSession.status)}>
                          {getStatusLabel(userSession.status)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {userSession.session?.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Concluída em {userSession.completed_at ? formatDate(userSession.completed_at) : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {userSession.session?.estimated_time || 0} min
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Resultados
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Refazer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {userSessions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma sessão disponível</h3>
              <p className="text-muted-foreground">
                Você ainda não recebeu nenhuma sessão personalizada. 
                Continue usando a plataforma e novas sessões serão criadas especialmente para você.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSessions; 