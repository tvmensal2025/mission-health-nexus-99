import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  Target,
  BookOpen,
  Brain,
  FileText,
  Lightbulb
} from 'lucide-react';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { Session, SessionFormData } from '@/integrations/supabase/types';


const SessionManagement: React.FC = () => {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    deleteSession,
    fetchUsersForSession
  } = useSessionManagement();

  // Estados para o formulário de criação
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'saboteur_work' as const,
    difficulty: 'beginner' as const,
    estimated_time: 30,
    content: {
      sections: [
        {
          title: 'Atividade Principal',
          activities: [''],
          description: ''
        }
      ]
    }
  });

  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
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

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'saboteur_work':
        return 'Trabalho com Sabotadores';
      case 'coaching':
        return 'Coaching';
      case 'assessment':
        return 'Avaliação';
      case 'reflection':
        return 'Reflexão';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await deleteSession(sessionId);
        toast({
          title: "Sessão excluída",
          description: "A sessão foi excluída com sucesso.",
        });
      } catch (error) {
        console.error('Erro ao deletar sessão:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir a sessão.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendSession = async (sessionId: string) => {
    setSelectedSession(sessions.find(s => s.id === sessionId) || null);
    setShowSendModal(sessionId);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setShowEditModal(true);
  };

  const handleCreateSession = async () => {
    try {
      if (!formData.title.trim()) {
        toast({
          title: "Erro",
          description: "O título é obrigatório",
          variant: "destructive",
        });
        return;
      }

      const sessionData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        difficulty: formData.difficulty,
        estimated_time: formData.estimated_time,
        content: formData.content,
        target_saboteurs: [],
        materials_needed: [],
        follow_up_questions: []
      };

      console.log('Dados sendo enviados:', sessionData);
      console.log('FormData atual:', formData);

      await createSession(sessionData);
      
      toast({
        title: "Sessão criada",
        description: "Sessão criada com sucesso!",
      });
      
      // Limpar formulário
      setFormData({
        title: '',
        description: '',
        type: 'saboteur_work' as const,
        difficulty: 'beginner' as const,
        estimated_time: 30,
        content: {
          sections: [
            {
              title: 'Atividade Principal',
              activities: [''],
              description: ''
            }
          ]
        }
      });
      
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar a sessão",
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Sessões</h2>
          <p className="text-muted-foreground">
            Crie e gerencie sessões personalizadas para os usuários
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Sessão
        </Button>
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
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Sessões criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para envio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Sessão</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(sessions.map(s => s.type)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Categorias diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 
                ? Math.round(sessions.reduce((acc, s) => acc + (s.estimated_time || 0), 0) / sessions.length)
                : 0
              } min
            </div>
            <p className="text-xs text-muted-foreground">
              Duração média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Sessões Criadas</h3>
        
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma sessão criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira sessão para começar a ajudar os usuários
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSessionTypeIcon(session.type)}
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {session.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getSessionTypeLabel(session.type)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{session.estimated_time || 0} min</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getDifficultyColor(session.difficulty)}>
                        {session.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {session.target_saboteurs?.length || 0} sabotadores
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleSendSession(session.id)}
                      disabled={!session.is_active}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Criar Sessão</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Digite o título da sessão"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Descrição</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  rows={3}
                  placeholder="Digite a descrição da sessão"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Tipo</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="saboteur_work">Trabalho com Sabotadores</option>
                  <option value="coaching">Coaching</option>
                  <option value="assessment">Avaliação</option>
                  <option value="reflection">Reflexão</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800">
                  Cancelar
                </Button>
                <Button onClick={handleCreateSession}>
                  Criar Sessão
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envio */}
      {showSendModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-white">Enviar Sessão</h3>
            <div className="space-y-4">
              <p className="text-gray-300">
                Enviar "{selectedSession.title}" para usuários selecionados
              </p>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-200">Usuários</label>
                <select className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500" multiple>
                  <option value="user1">Usuário 1</option>
                  <option value="user2">Usuário 2</option>
                  <option value="user3">Usuário 3</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setShowSendModal(null);
                  setSelectedSession(null);
                }} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800">
                  Cancelar
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Sessão enviada",
                    description: "Sessão enviada com sucesso!",
                  });
                  setShowSendModal(null);
                  setSelectedSession(null);
                }}>
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement; 