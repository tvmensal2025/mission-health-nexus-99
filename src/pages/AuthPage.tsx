import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Admin access state
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta ao Instituto dos Sonhos",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos de uso",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada!",
          description: "Bem-vindo ao Instituto dos Sonhos",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAccess = async () => {
    if (!adminData.email || !adminData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha as credenciais de admin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminData.email,
        password: adminData.password,
      });

      if (error) {
        toast({
          title: "Acesso negado",
          description: "Credenciais de administrador inválidas",
          variant: "destructive",
        });
      } else {
        // Note: In a real app, you'd check user roles from a database
        // For now, we'll just redirect to admin dashboard
        toast({
          title: "Acesso administrativo concedido",
          description: "Bem-vindo, administrador",
        });
        navigate("/admin");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAdminAccount = async () => {
    // This is a simplified admin creation - in production, this would be more secure
    if (!adminData.email || !adminData.password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha as credenciais de admin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: "Administrador",
            role: "admin",
          },
        },
      });

      if (error) {
        toast({
          title: "Erro ao criar admin",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta de admin criada!",
          description: "Conta administrativa criada com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Instituto dos Sonhos</h1>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header Text */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Sua transformação completa começa aqui</h1>
            <p className="text-muted-foreground">Faça login ou crie sua conta gratuita</p>
          </div>

          {/* Main Auth Card */}
          <Card className="health-card">
            <CardHeader>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm">Lembrar de mim</Label>
                  </div>

                  <Button 
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-instituto-blue hover:bg-instituto-blue/90"
                  >
                    {isLoading ? "Entrando..." : "Entrar na minha conta"}
                  </Button>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Escolha uma senha"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm">Aceito os termos de uso</Label>
                  </div>

                  <Button 
                    onClick={handleSignup}
                    disabled={isLoading}
                    className="w-full bg-instituto-green hover:bg-instituto-green/90"
                  >
                    {isLoading ? "Criando conta..." : "Criar minha conta"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Admin Access Section */}
          <Card className="health-card mt-6">
            <CardHeader>
              <CardTitle className="text-center text-lg">Acesso Administrativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email do Admin</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@institutodossonhos.com"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha do Admin</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Senha administrativa"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAdminAccess}
                  disabled={isLoading}
                  className="flex-1 bg-instituto-red hover:bg-instituto-red/90"
                >
                  Acesso Administrativo
                </Button>
                
                <Button 
                  onClick={createAdminAccount}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1 bg-instituto-gray hover:bg-instituto-gray/90 text-white border-instituto-gray"
                >
                  Criar Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial */}
          <Card className="mission-card mt-6 text-center">
            <CardContent className="pt-6">
              <p className="text-lg font-medium mb-2">"Transformei minha vida em 30 dias!"</p>
              <p className="text-muted-foreground">- Maria S.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;