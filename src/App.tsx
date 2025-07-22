import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CompleteDashboardPage from "./pages/CompleteDashboardPage";
import AdminPage from "./pages/AdminPage";
import CoursePlatform from "./components/CoursePlatform";
import MissionSystem from "./components/MissionSystem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page - standalone without layout */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth page - standalone without layout */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Dashboard - standalone without layout */}
          <Route path="/dashboard" element={<CompleteDashboardPage />} />
          
          {/* Admin - standalone without layout */}
          <Route path="/admin" element={<AdminPage />} />
          
          {/* App routes with layout */}
          <Route path="/app" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="missions" element={<MissionSystem />} />
            <Route path="courses" element={<CoursePlatform />} />
            <Route path="sessions" element={<div className="p-6"><h1 className="text-2xl font-bold">Sessões</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="ranking" element={<div className="p-6"><h1 className="text-2xl font-bold">Ranking</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="assessments" element={<div className="p-6"><h1 className="text-2xl font-bold">Avaliações</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="weekly" element={<div className="p-6"><h1 className="text-2xl font-bold">📊 Semanal</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="weekly-assessment" element={<div className="p-6"><h1 className="text-2xl font-bold">Avaliação Semanal</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="goals" element={<div className="p-6"><h1 className="text-2xl font-bold">Minhas Metas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="challenges" element={<div className="p-6"><h1 className="text-2xl font-bold">Desafios</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="diary" element={<div className="p-6"><h1 className="text-2xl font-bold">Diário de Saúde</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="saboteur-test" element={<div className="p-6"><h1 className="text-2xl font-bold">Teste de Sabotadores</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="progress" element={<div className="p-6"><h1 className="text-2xl font-bold">Meu Progresso</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Análise Avançada</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="google-fit" element={<div className="p-6"><h1 className="text-2xl font-bold">Google Fit</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="scale-test" element={<div className="p-6"><h1 className="text-2xl font-bold">Teste Xiaomi Mi Body Scale 2</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="subscriptions" element={<div className="p-6"><h1 className="text-2xl font-bold">Assinaturas</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="apps" element={<div className="p-6"><h1 className="text-2xl font-bold">Apps</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
            <Route path="help" element={<div className="p-6"><h1 className="text-2xl font-bold">Ajuda</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          </Route>
          
          {/* Standalone routes */}
          <Route path="/ranking" element={<div className="min-h-screen bg-background p-6"><h1 className="text-2xl font-bold">Ranking</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          <Route path="/about" element={<div className="min-h-screen bg-background p-6"><h1 className="text-2xl font-bold">Sobre</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          <Route path="/courses" element={<div className="min-h-screen bg-background p-6"><h1 className="text-2xl font-bold">Cursos Premium</h1><p className="text-muted-foreground">Em desenvolvimento...</p></div>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
