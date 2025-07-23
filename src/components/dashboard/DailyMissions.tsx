import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  Trophy, 
  Droplets, 
  Dumbbell, 
  Heart, 
  Apple, 
  Moon,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
}

interface UserMission {
  id: string;
  mission_id: string;
  is_completed: boolean;
  completed_at: string | null;
  mission: Mission;
}

interface DailyMissionsProps {
  user: User | null;
}

const DailyMissions = ({ user }: DailyMissionsProps) => {
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

  const fetchTodaysMissions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // First, get today's user missions
      const { data: userMissions, error: userMissionsError } = await supabase
        .from('user_missions')
        .select(`
          id,
          mission_id,
          is_completed,
          completed_at,
          missions (
            id,
            title,
            description,
            points,
            category,
            difficulty
          )
        `)
        .eq('user_id', user?.id)
        .eq('date_assigned', today);

      if (userMissionsError) {
        console.error('Error fetching user missions:', userMissionsError);
      }

      // If no missions for today, assign them
      if (!userMissions || userMissions.length === 0) {
        await assignTodaysMissions();
        return;
      }

      // Process the missions data
      const processedMissions = userMissions.map(um => ({
        id: um.id,
        mission_id: um.mission_id,
        is_completed: um.is_completed,
        completed_at: um.completed_at,
        mission: um.missions as unknown as Mission
      }));

      setMissions(processedMissions);
      
      const completed = processedMissions.filter(m => m.is_completed).length;
      setCompletedToday(completed);
      
      const points = processedMissions
        .filter(m => m.is_completed)
        .reduce((sum, m) => sum + m.mission.points, 0);
      setTotalPoints(points);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTodaysMissions();
    }
  }, [user, fetchTodaysMissions]);

  const assignTodaysMissions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all available missions
      const { data: availableMissions, error: missionsError } = await supabase
        .from('missions')
        .select('*')
        .eq('is_active', true)
        .limit(6); // Assign 6 missions per day

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
        return;
      }

      if (!availableMissions || availableMissions.length === 0) return;

      // Create user_missions entries
      const userMissionsToInsert = availableMissions.map(mission => ({
        user_id: user?.id,
        mission_id: mission.id,
        date_assigned: today,
        is_completed: false
      }));

      const { error: insertError } = await supabase
        .from('user_missions')
        .insert(userMissionsToInsert);

      if (insertError) {
        console.error('Error inserting user missions:', insertError);
        return;
      }

      // Fetch the newly created missions
      await fetchTodaysMissions();
      
    } catch (error) {
      console.error('Error assigning missions:', error);
    }
  };

  const toggleMissionComplete = async (missionId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const completedAt = newStatus ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('user_missions')
        .update({
          is_completed: newStatus,
          completed_at: completedAt
        })
        .eq('id', missionId);

      if (error) {
        console.error('Error updating mission:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a missão",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setMissions(prev => prev.map(m => 
        m.id === missionId 
          ? { ...m, is_completed: newStatus, completed_at: completedAt }
          : m
      ));

      // Update counters
      const updatedMissions = missions.map(m => 
        m.id === missionId 
          ? { ...m, is_completed: newStatus }
          : m
      );
      
      const completed = updatedMissions.filter(m => m.is_completed).length;
      setCompletedToday(completed);
      
      const points = updatedMissions
        .filter(m => m.is_completed)
        .reduce((sum, m) => sum + m.mission.points, 0);
      setTotalPoints(points);

      if (newStatus) {
        const mission = missions.find(m => m.id === missionId);
        toast({
          title: "Missão Concluída! 🎉",
          description: `Você ganhou ${mission?.mission.points} pontos!`,
        });
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hydration': return Droplets;
      case 'exercise': return Dumbbell;
      case 'mindset': return Heart;
      case 'nutrition': return Apple;
      case 'sleep': return Moon;
      default: return Target;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hydration': return 'text-blue-500';
      case 'exercise': return 'text-red-500';
      case 'mindset': return 'text-pink-500';
      case 'nutrition': return 'text-green-500';
      case 'sleep': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = missions.length > 0 ? (completedToday / missions.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Target className="h-10 w-10 text-primary" />
          Missão do Dia
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete suas missões diárias e ganhe pontos para subir no ranking!
        </p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}/{missions.length}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(0)}% concluído
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Ganhos</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">
              pontos hoje
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 dias</div>
            <p className="text-xs text-muted-foreground">
              Continue assim!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Missions List */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Suas Missões de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma missão encontrada para hoje</p>
              <Button 
                onClick={assignTodaysMissions} 
                className="mt-4"
              >
                Gerar Missões do Dia
              </Button>
            </div>
          ) : (
            missions.map((userMission) => {
              const Icon = getCategoryIcon(userMission.mission.category);
              const categoryColor = getCategoryColor(userMission.mission.category);
              const difficultyColor = getDifficultyColor(userMission.mission.difficulty);
              
              return (
                <div
                  key={userMission.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    userMission.is_completed 
                      ? 'bg-secondary/20 border-secondary/50' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={userMission.is_completed}
                    onCheckedChange={() => toggleMissionComplete(
                      userMission.id, 
                      userMission.is_completed
                    )}
                    className="w-5 h-5"
                  />
                  
                  <Icon className={`h-6 w-6 ${categoryColor}`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${
                        userMission.is_completed ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {userMission.mission.title}
                      </h3>
                      <Badge 
                        className={`text-xs text-white ${difficultyColor}`}
                        variant="secondary"
                      >
                        {userMission.mission.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {userMission.mission.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{userMission.mission.points}</span>
                    </div>
                    {userMission.is_completed && userMission.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(userMission.completed_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle>Progresso da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
              <div key={day} className="text-center">
                <p className="text-xs text-muted-foreground mb-2">{day}</p>
                <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                  index === new Date().getDay() 
                    ? progressPercentage === 100 
                      ? 'bg-secondary text-white' 
                      : 'bg-primary text-white'
                    : index < new Date().getDay()
                      ? 'bg-secondary text-white'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {index === new Date().getDay() ? progressPercentage.toFixed(0) : index < new Date().getDay() ? '✓' : '·'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMissions;