import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Activity, GraduationCap, FileText, Trophy, ClipboardList, 
  Calendar, Target, Award, Settings, BarChart3, Scale, CreditCard, 
  Grid, HelpCircle, Menu, X, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onShowCoursePlatform?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'inicio', label: 'Missão do Dia', icon: Zap, path: '/missions', highlight: true },
  { id: 'plataforma-sonhos', label: 'Plataforma dos Sonhos', icon: GraduationCap, path: '/app/courses' },
  { id: 'sessoes', label: 'Sessões', icon: FileText, path: '/sessions' },
  { id: 'ranking', label: 'Ranking', icon: Trophy, path: '/ranking' },
  { id: 'avaliacoes', label: 'Avaliações', icon: ClipboardList, path: '/assessments' },
  { id: 'semanal', label: '📊 Semanal', icon: Calendar, path: '/weekly', highlight: true },
  { id: 'avaliacao-semanal', label: 'Avaliação Semanal', icon: Calendar, path: '/weekly-assessment' },
  { id: 'metas', label: 'Minhas Metas', icon: Target, path: '/goals' },
  { id: 'desafios', label: 'Desafios', icon: Award, path: '/challenges' },
  { id: 'diario', label: 'Diário de Saúde', icon: FileText, path: '/diary' },
  { id: 'teste-sabotadores', label: 'Teste de Sabotadores', icon: Settings, path: '/saboteur-test' },
  { id: 'meu-progresso', label: 'Meu Progresso', icon: BarChart3, path: '/progress' },
  { id: 'analise-avancada', label: 'Análise Avançada', icon: BarChart3, path: '/analytics' },
  { id: 'google-fit', label: 'Google Fit', icon: Activity, path: '/google-fit' },
  { id: 'openScale-test', label: 'Teste Xiaomi Mi Body Scale 2', icon: Scale, path: '/scale-test' },
  { id: 'assinaturas', label: 'Assinaturas', icon: CreditCard, path: '/subscriptions' },
  { id: 'apps', label: 'Apps', icon: Grid, path: '/apps' },
  { id: 'ajuda', label: 'Ajuda', icon: HelpCircle, path: '/help' }
];

export default function Sidebar({ isOpen, onToggle, onShowCoursePlatform }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (item: any) => {
    // Se for "Plataforma dos Sonhos", apenas chamar a função onShowCoursePlatform sem navegar
    if (item.id === 'plataforma-sonhos') {
      if (onShowCoursePlatform) {
        onShowCoursePlatform();
      }
    } else if (item.id === 'dashboard') {
      // Para o dashboard, navegar mas não resetar a seção ativa
      navigate('/');
    } else {
      navigate(item.path);
    }
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-gradient-dark border-r border-border/30 z-50 transition-transform duration-300",
        "w-80 lg:w-72",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Health Platform</h1>
              <p className="text-sm text-muted-foreground">Sua jornada de saúde</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth text-sm font-medium w-full text-left",
                  "hover:bg-muted/50 group",
                  (location.pathname === item.path || (item.id === 'plataforma-sonhos' && location.pathname === '/app/courses'))
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "text-foreground/80",
                  item.highlight && !(location.pathname === item.path || (item.id === 'plataforma-sonhos' && location.pathname === '/app/courses')) && "bg-accent/10 text-accent border border-accent/20"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-smooth",
                  "group-hover:scale-110"
                )} />
                <span className="flex-1">{item.label}</span>
                {item.highlight && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/30">
          <div className="bg-gradient-primary rounded-lg p-4 text-center">
            <h3 className="text-white font-semibold mb-1">Premium</h3>
            <p className="text-white/80 text-xs mb-3">Desbloqueie todos os recursos</p>
            <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90">
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}