import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import AudioRecorder from '../components/AudioRecorder';
import AnalysisReport from '../components/AnalysisReport';
import { useToast } from '../hooks/use-toast';
import ChatDoctor from '../components/ChatDoctor';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  History,
  Sparkles,
  MessageSquare,
  FileText,
  Activity,
  ChevronRight,
  Brain,
  HeartHandshake,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { analisarConsultaService } from '../services/api';
import { Progress } from '../components/ui/progress';
import ParticleBackground from '../components/ParticleBackground'; // 1. IMPORTE AS PARTÍCULAS

interface Analise {
  diagnosticoSugerido: string;
  examesRecomendados: string[];
  medicamentosSugeridos: string[];
  observacoes?: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{
    icon: React.ElementType;
    label: string;
    description: string;
  }>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex-1 relative">
            <div className="flex flex-col items-center">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                ${
                  isActive
                    ? 'bg-primary shadow-lg scale-110'
                    : isCompleted
                    ? 'bg-green-500'
                    : 'bg-muted border-2 border-muted-foreground/20'
                }
              `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <Icon
                    className={`h-6 w-6 ${
                      isActive ? 'text-white' : 'text-muted-foreground'
                    }`}
                  />
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-sm font-medium ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground hidden md:block mt-1">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                absolute top-6 left-[60%] w-full h-0.5 -z-10 transition-all duration-500
                ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'}
              `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const Consulta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [transcricao, setTranscricao] = useState<string | null>(null);
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    startTime: new Date(),
    duration: 0,
  });

  const steps = [
    { icon: Activity, label: 'Gravação', description: 'Capture o áudio' },
    { icon: Brain, label: 'Processamento', description: 'IA analisando' },
    { icon: FileText, label: 'Análise', description: 'Relatório detalhado' },
    { icon: MessageSquare, label: 'Discussão', description: 'Chat com IA' },
  ];

  const handleRecordingComplete = async (
    audioBlob: Blob,
    transcricaoText: string,
  ) => {
    setIsProcessing(true);
    setTranscricao(transcricaoText);
    setAnalise(null);
    setCurrentStep(1);

    // Simula progresso de processamento
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const data = await analisarConsultaService(transcricaoText);

      if (data.success && data.analise) {
        setAnalise(data.analise);
        setProgress(100);
        setCurrentStep(2);

        // Notificação aprimorada com animação
        toast({
          title: '✨ Análise Concluída com Sucesso!',
          description: (
            <div className="flex flex-col gap-2 mt-2">
              <p>Diagnóstico: {data.analise.diagnosticoSugerido}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {data.analise.examesRecomendados.length} exames
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {data.analise.medicamentosSugeridos.length} medicamentos
                </Badge>
              </div>
            </div>
          ),
          className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300',
          duration: 7000,
        });

        // Atualiza stats da sessão
        setSessionStats(prev => ({
          ...prev,
          duration: Math.floor(
            (new Date().getTime() - prev.startTime.getTime()) / 1000,
          ),
        }));
      } else {
        throw new Error('Análise retornou incompleta');
      }
    } catch (error: any) {
      console.error('Erro ao processar consulta:', error);
      toast({
        title: '❌ Erro ao processar',
        description: error.message || 'Verifique se o servidor backend está rodando.',
        variant: 'destructive',
      });
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const handleNovaConsulta = () => {
    setTranscricao(null);
    setAnalise(null);
    setProgress(0);
    setCurrentStep(0);
    setSessionStats({
      startTime: new Date(),
      duration: 0,
    });
  };

  const handleExportPDF = () => {
    const input = document.getElementById('relatorio-para-pdf');
    if (!input) {
      toast({
        title: "Erro ao Exportar",
        description: "Não foi possível encontrar o componente do relatório.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Gerando PDF...",
      description: "Aguarde, estamos preparando seu download.",
    });

    // Usa html2canvas para "fotografar" a div
    html2canvas(input, {
      scale: 2, // Aumenta a escala para melhor qualidade de imagem
      useCORS: true // Permite que imagens externas (se houver) sejam carregadas
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        
        // Configura o PDF (formato A4, retrato)
        const pdf = new jsPDF('p', 'mm', 'a4'); 
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Adiciona a "foto" ao PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Salva o arquivo
        pdf.save("relatorio-medico-copilot.pdf");
      });
  };

  const handleChatOpen = () => {
    setCurrentStep(3);
  };

  return (
    // 2. APLIQUE A NOVA CLASSE DE FUNDO E 'relative'
    <div className="min-h-screen bg-medical-plexus relative">
      
      {/* 3. ADICIONE O COMPONENTE DE PARTÍCULAS */}
      <ParticleBackground />

      {/* 4. ENVOLVA TODO O CONTEÚDO EM UM 'z-10' */}
      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="border-b bg-card/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary to-primary-hover w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                    <HeartHandshake className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                    Médico Copilot
                  </h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Assistente Clínico com IA Avançada
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {sessionStats.duration > 0 && (
                  <Badge
                    variant="outline"
                    className="hidden md:flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {Math.floor(sessionStats.duration / 60)}m{' '}
                    {sessionStats.duration % 60}s
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => navigate('/historico')}
                  className="group hover:border-primary transition-all"
                >
                  <History className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Histórico
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Progress Indicator */}
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Step Indicator */}
          <Card className="mb-8 border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <StepIndicator currentStep={currentStep} steps={steps} />
            </CardContent>
          </Card>

          {/* Processing Progress Bar */}
          {isProcessing && (
            <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary">
                    Processando análise médica...
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Analisando sintomas e gerando recomendações personalizadas
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Audio Recorder Card */}
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-1" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Central de Gravação
                    </span>
                    {!transcricao && !analise && (
                      <Badge variant="secondary" className="animate-pulse">
                        Pronto para gravar
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>

              {/* Transcription Card */}
              {transcricao && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      Transcrição da Consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background/60 p-4 rounded-lg border border-primary/10">
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {transcricao}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {transcricao.split(' ').length} palavras
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {transcricao.length} caracteres
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Report */}
              {analise && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <AnalysisReport analise={analise} />
                </div>
              )}

              {/* Chat Doctor */}
              {analise && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <ChatDoctor
                    contextoAnalise={analise}
                    onOpen={handleChatOpen}
                  />
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              {analise && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Ações Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={handleNovaConsulta}
                      className="w-full bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg transition-all"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Nova Consulta
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.print()}
                    >
                      Imprimir Relatório
                    </Button>
                   <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportPDF}
                    >
                      Exportar PDF
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Tips Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-accent/10 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-accent" />
                    Dicas de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle
                        className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Grave em ambiente silencioso para melhor transcrição
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle
                        className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Inclua todos os sintomas relatados pelo paciente
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle
                        className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Use o chat para esclarecer dúvidas sobre o diagnóstico
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Session Stats */}
              {(transcricao || analise) && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Estatísticas da Sessão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <Badge variant={analise ? 'success' : 'secondary'}>
                          {analise ? 'Completa' : 'Em andamento'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Início
                        </span>
                        <span className="text-sm font-medium">
                          {sessionStats.startTime.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {sessionStats.duration > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Duração
                          </span>
                          <span className="text-sm font-medium">
                            {Math.floor(sessionStats.duration / 60)}m{' '}
                            {sessionStats.duration % 60}s
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div> {/* Fim do div z-10 */}
    </div>
  );
};

export default Consulta;