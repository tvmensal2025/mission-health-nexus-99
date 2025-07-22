import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Trophy, TrendingUp, Heart, Droplets, Zap, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  full_name: string | null;
  current_weight: number | null;
  target_weight: number | null;
  height: number | null;
}

interface DashboardOverviewProps {
  user: User | null;
}

const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = () => {
    if (!profile?.current_weight || !profile?.height) return null;
    const heightInMeters = profile.height / 100;
    return (profile.current_weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const calculateProgress = () => {
    if (!profile?.current_weight || !profile?.target_weight) return 0;
    const initialWeight = profile.current_weight + 10; // Assumindo 10kg inicial para demonstração
    const totalToLose = initialWeight - profile.target_weight;
    const currentProgress = initialWeight - profile.current_weight;
    return Math.max(0, Math.min(100, (currentProgress / totalToLose) * 100));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Olá, {userName}! 👋</h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo de volta ao seu painel de transformação
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Atual</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.current_weight ? `${profile.current_weight} kg` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Meta: {profile?.target_weight ? `${profile.target_weight} kg` : 'Não definida'}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IMC</CardTitle>
            <Heart className="h-4 w-4 text-health-heart" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateBMI() || '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateBMI() ? 
                (parseFloat(calculateBMI()!) < 25 ? 'Normal' : 'Acima do peso') : 
                'Dados incompletos'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProgress().toFixed(0)}%</div>
            <Progress value={calculateProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 dias</div>
            <p className="text-xs text-muted-foreground">
              Continue assim!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Missions Preview */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Missões de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Droplets className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Hidratação</p>
                <p className="text-xs text-muted-foreground">2/2 litros</p>
              </div>
              <Badge variant="secondary" className="ml-auto">✓</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Zap className="h-6 w-6 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Exercício</p>
                <p className="text-xs text-muted-foreground">0/30 min</p>
              </div>
              <Badge variant="outline">Pendente</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Heart className="h-6 w-6 text-pink-500" />
              <div>
                <p className="text-sm font-medium">Mindfulness</p>
                <p className="text-xs text-muted-foreground">0/10 min</p>
              </div>
              <Badge variant="outline">Pendente</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Moon className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Sono</p>
                <p className="text-xs text-muted-foreground">8 horas</p>
              </div>
              <Badge variant="secondary" className="ml-auto">✓</Badge>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Ver Todas as Missões
            </Button>
            <Button size="sm" variant="outline">
              Registrar Atividade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart and Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Evolução do Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Gráfico de evolução será exibido aqui</p>
              <Button variant="outline" className="mt-4">
                Registrar Nova Pesagem
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Próximas Atividades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Sessão com Nutricionista</p>
                <p className="text-xs text-muted-foreground">Hoje às 15:00</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Avaliação Semanal</p>
                <p className="text-xs text-muted-foreground">Amanhã</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Novo Curso Disponível</p>
                <p className="text-xs text-muted-foreground">"Receitas Fit Deliciosas"</p>
              </div>
            </div>
            
            <Button size="sm" variant="outline" className="w-full">
              Ver Calendário Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card className="health-card bg-gradient-primary text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">💪 Frase do Dia</h3>
            <p className="text-lg italic">"O sucesso é a soma de pequenos esforços repetidos dia após dia."</p>
            <p className="text-sm mt-2 opacity-90">- Robert Collier</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;