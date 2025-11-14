import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Home, 
  ArrowLeft, 
  Stethoscope, 
  HeartPulse,
  AlertCircle,
  Search,
  RefreshCw,
  FileQuestion,
  Activity,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Auto redirect countdown opcional
  const handleAutoRedirect = () => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Animação do heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const suggestedPages = [
    { icon: Home, label: "Página Inicial", path: "/" },
    { icon: Activity, label: "Nova Consulta", path: "/consulta" },
    { icon: FileQuestion, label: "Histórico", path: "/historico" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8 text-center">
          
          {/* Logo e Número 404 com ECG */}
          <div className="relative mb-8">
            {/* ECG Line Animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <svg
                className="w-full h-32"
                viewBox="0 0 400 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0,50 L100,50 L120,50 L125,20 L130,80 L135,35 L140,65 L145,50 L400,50"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-primary animate-pulse"
                />
              </svg>
            </div>

            {/* 404 com efeito médico */}
            <div className="relative">
              <div className="flex items-center justify-center gap-4">
                <HeartPulse className={`h-20 w-20 text-destructive transition-all duration-500 ${
                  pulseAnimation ? 'scale-110' : 'scale-100'
                }`} />
                <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-primary via-primary-hover to-accent bg-clip-text text-transparent">
                  404
                </h1>
                <Stethoscope className="h-20 w-20 text-primary animate-bounce" />
              </div>
            </div>
          </div>

          {/* Card principal com mensagem */}
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="space-y-6">
                {/* Ícone e título */}
                <div className="flex justify-center">
                  <div className="p-4 bg-destructive/10 rounded-full">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">
                    Diagnóstico: Página não encontrada
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Parece que você tentou acessar uma página que não existe em nosso sistema médico.
                  </p>
                </div>

                {/* Badge com o caminho tentado */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="px-4 py-2">
                    <Compass className="h-3 w-3 mr-2" />
                    Tentou acessar: {location.pathname}
                  </Badge>
                </div>

                {/* Countdown se ativo */}
                {countdown !== null && (
                  <div className="bg-primary/10 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-sm text-primary font-medium">
                      Redirecionando para página inicial em {countdown} segundos...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ações principais */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-primary-hover hover:shadow-xl transition-all group"
            >
              <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Voltar ao Início
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-muted group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Página Anterior
            </Button>

            <Button 
              size="lg"
              variant="secondary"
              onClick={handleAutoRedirect}
              disabled={countdown !== null}
              className="group"
            >
              <RefreshCw className={`h-5 w-5 mr-2 transition-all ${
                countdown !== null ? 'animate-spin' : 'group-hover:rotate-180'
              }`} />
              {countdown !== null ? 'Redirecionando...' : 'Auto Redirecionar'}
            </Button>
          </div>

          {/* Sugestões de páginas */}
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Páginas sugeridas para você:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              {suggestedPages.map((page, index) => {
                const Icon = page.icon;
                return (
                  <Card
                    key={index}
                    className="border-primary/20 hover:border-primary/40 cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => navigate(page.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{page.label}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Linha de ajuda */}
          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <button 
              onClick={() => navigate('/suporte')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Search className="h-3 w-3" />
              Buscar ajuda
            </button>
            <span className="text-muted-foreground/50">•</span>
            <span>Código: 404</span>
            <span className="text-muted-foreground/50">•</span>
            <button 
              onClick={() => window.location.reload()}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Recarregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;