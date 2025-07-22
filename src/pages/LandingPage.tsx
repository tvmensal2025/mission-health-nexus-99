import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Trophy, Users, Star, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Instituto dos Sonhos</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="outline" className="hover:bg-muted">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-up">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Transforme sua vida
            </span>
            <br />
            <span className="text-foreground">em 30 dias</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-up">
            Metodologia comprovada para emagrecimento saudável
          </p>
          
          <Link to="/auth">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 bg-primary hover:bg-primary/90 shadow-glow animate-scale-in"
            >
              ENTRAR NO INSTITUTO
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Por que escolher o Instituto?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="health-card text-center">
              <CardContent className="pt-6">
                <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Metodologia Comprovada</h3>
                <p className="text-muted-foreground">
                  Sistema científico desenvolvido para resultados reais e duradouros
                </p>
              </CardContent>
            </Card>
            
            <Card className="health-card text-center">
              <CardContent className="pt-6">
                <Users className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Comunidade Ativa</h3>
                <p className="text-muted-foreground">
                  Apoio de milhares de pessoas em jornadas semelhantes à sua
                </p>
              </CardContent>
            </Card>
            
            <Card className="health-card text-center">
              <CardContent className="pt-6">
                <Zap className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Resultados Rápidos</h3>
                <p className="text-muted-foreground">
                  Primeiros resultados visíveis já na primeira semana
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Números que comprovam nossa eficácia</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="stat-card">
              <div className="text-4xl font-bold text-primary mb-2">5.000+</div>
              <div className="text-muted-foreground">Vidas transformadas</div>
            </div>
            
            <div className="stat-card">
              <div className="text-4xl font-bold text-secondary mb-2">30</div>
              <div className="text-muted-foreground">Dias para ver resultados</div>
            </div>
            
            <div className="stat-card">
              <div className="text-4xl font-bold text-accent mb-2">98%</div>
              <div className="text-muted-foreground">Taxa de sucesso</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Top 5 Usuários Mais Ativos</h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { name: "Maria Silva", points: 2850, position: 1 },
              { name: "João Santos", points: 2720, position: 2 },
              { name: "Ana Costa", points: 2650, position: 3 },
              { name: "Pedro Lima", points: 2480, position: 4 },
              { name: "Carla Mendes", points: 2350, position: 5 },
            ].map((user) => (
              <Card key={user.position} className="mission-card">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.position === 1 ? 'bg-yellow-500' :
                      user.position === 2 ? 'bg-gray-400' :
                      user.position === 3 ? 'bg-amber-600' : 'bg-muted'
                    }`}>
                      {user.position}
                    </div>
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.points} pontos</p>
                    </div>
                  </div>
                  {user.position <= 3 && <Trophy className="h-5 w-5 text-primary" />}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/ranking">
              <Button variant="outline" className="hover:bg-muted">
                Ver Ranking Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para transformar sua vida?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já conseguiram seus objetivos
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-glow">
                ENTRAR NO INSTITUTO
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="hover:bg-muted">
                CURSOS PREMIUM
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold">Instituto dos Sonhos</h3>
              </div>
              <p className="text-muted-foreground">
                Transformando vidas através do emagrecimento saudável
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navegação</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/ranking" className="hover:text-primary">Ranking</Link></li>
                <li><Link to="/courses" className="hover:text-primary">Cursos</Link></li>
                <li><Link to="/about" className="hover:text-primary">Sobre</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>contato@institutodossonhos.com</li>
                <li>(11) 99999-9999</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Redes Sociais</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Instagram</a></li>
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
                <li><a href="#" className="hover:text-primary">YouTube</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/20 text-center text-muted-foreground">
            <p>&copy; 2024 Instituto dos Sonhos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;