import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Scale,
  AlertTriangle,
  Download,
  Calendar,
  TrendingUp,
  Eye
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WeightMeasurement {
  id: string;
  user_id: string;
  peso_kg: number;
  imc: number | null;
  gordura_corporal_percent: number | null;
  massa_muscular_kg: number | null;
  device_type: string;
  measurement_date: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export const WeighingMonitoring = () => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState<WeightMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  useEffect(() => {
    fetchMeasurements();
  }, []);

  useEffect(() => {
    filterMeasurements();
  }, [measurements, searchTerm, dateFilter]);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weight_measurements')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('measurement_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMeasurements((data as any) || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMeasurements = () => {
    let filtered = measurements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    const now = new Date();
    switch (dateFilter) {
      case "today":
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(m => new Date(m.measurement_date) >= today);
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.measurement_date) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(m => new Date(m.measurement_date) >= monthAgo);
        break;
    }

    setFilteredMeasurements(filtered);
  };

  const getWeightStatus = (weight: number, imc: number | null) => {
    if (!imc) return "normal";
    
    if (imc < 18.5) return "baixo";
    if (imc >= 18.5 && imc < 25) return "normal";
    if (imc >= 25 && imc < 30) return "sobrepeso";
    return "obesidade";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "baixo":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Baixo Peso</Badge>;
      case "normal":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
      case "sobrepeso":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Sobrepeso</Badge>;
      case "obesidade":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Obesidade</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const getDeviceBadge = (deviceType: string) => {
    switch (deviceType) {
      case "xiaomi_mi_body_scale_2":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Xiaomi</Badge>;
      case "bluetooth_scale":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Bluetooth</Badge>;
      case "manual":
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Manual</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const stats = {
    today: filteredMeasurements.filter(m => {
      const today = new Date();
      const measurementDate = new Date(m.measurement_date);
      return measurementDate.toDateString() === today.toDateString();
    }).length,
    week: filteredMeasurements.filter(m => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(m.measurement_date) >= weekAgo;
    }).length,
    suspicious: filteredMeasurements.filter(m => {
      return m.peso_kg < 30 || m.peso_kg > 200 || (m.imc && (m.imc < 15 || m.imc > 50));
    }).length,
    incomplete: filteredMeasurements.filter(m => {
      return !m.gordura_corporal_percent || !m.massa_muscular_kg;
    }).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Monitoramento de Pesagens
          </h1>
          <p className="text-muted-foreground">Acompanhe todas as pesagens do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Ver Alertas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
            <div className="text-sm text-muted-foreground">Pesagens Hoje</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.week}</div>
            <div className="text-sm text-muted-foreground">Esta Semana</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.suspicious}</div>
            <div className="text-sm text-muted-foreground">Valores Suspeitos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.incomplete}</div>
            <div className="text-sm text-muted-foreground">Dados Incompletos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={dateFilter === "today" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("today")}
              >
                Hoje
              </Button>
              <Button 
                variant={dateFilter === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("week")}
              >
                7 Dias
              </Button>
              <Button 
                variant={dateFilter === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateFilter("month")}
              >
                30 Dias
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Pesagens ({filteredMeasurements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>IMC</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMeasurements.map((measurement) => {
                const status = getWeightStatus(measurement.peso_kg, measurement.imc);
                const isSuspicious = measurement.peso_kg < 30 || measurement.peso_kg > 200 || 
                  (measurement.imc && (measurement.imc < 15 || measurement.imc > 50));
                
                return (
                  <TableRow key={measurement.id} className={isSuspicious ? "bg-red-50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{measurement.profiles?.full_name || "Nome não informado"}</div>
                        <div className="text-xs text-muted-foreground">{measurement.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {measurement.peso_kg} kg
                        {isSuspicious && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      {measurement.imc ? measurement.imc.toFixed(1) : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell>{getDeviceBadge(measurement.device_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(measurement.measurement_date).toLocaleDateString('pt-BR')}
                        <div className="text-xs text-muted-foreground">
                          {new Date(measurement.measurement_date).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};