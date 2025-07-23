import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Calendar,
  Activity,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  user_id: string;
  measurements: number;
  lastActivity: string;
  averageWeight: number;
  status: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Buscar medições
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg')
        .order('measurement_date', { ascending: false });

      if (measurementsError) {
        console.error('Error fetching measurements:', measurementsError);
        return;
      }

      // Agrupar dados por usuário
      const userStats = new Map<string, {
        measurements: number;
        weights: number[];
        lastActivity: string;
      }>();

      measurements?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStats.get(userId) || {
          measurements: 0,
          weights: [],
          lastActivity: ''
        };

        existing.measurements++;
        if (measurement.peso_kg) {
          existing.weights.push(measurement.peso_kg);
        }
        if (!existing.lastActivity || measurement.measurement_date > existing.lastActivity) {
          existing.lastActivity = measurement.measurement_date;
        }

        userStats.set(userId, existing);
      });

      // Converter para array e determinar status
      const usersData: UserData[] = Array.from(userStats.entries()).map(([userId, stats]) => {
        const averageWeight = stats.weights.length > 0 
          ? stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length 
          : 0;

        // Determinar status baseado na atividade recente (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = new Date(stats.lastActivity) >= thirtyDaysAgo;

        return {
          user_id: userId,
          measurements: stats.measurements,
          lastActivity: stats.lastActivity,
          averageWeight: Math.round(averageWeight * 10) / 10,
          status: isActive ? 'active' : 'inactive'
        };
      });

      setUsers(usersData);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
              </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            {users.length} usuários registrados no sistema
          </p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Exportar Lista
          </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
              >
                Ativos
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
              >
                Inativos
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.user_id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Usuário {user.user_id.slice(0, 8)}...
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {user.measurements} medições
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {user.averageWeight}kg
                          </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.lastActivity)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(user.status)}
                  <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Medições</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 
                ? Math.round(users.reduce((sum, u) => sum + u.measurements, 0) / users.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Por usuário
            </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default UserManagement;