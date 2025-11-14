import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Search,
  AlertTriangle,
  FileDown,
  Trash2,
  MoreVertical,
  X,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Filter,
  FileText, // Importado corretamente
} from 'lucide-react';
import { API_URL } from '@/services/api';
import AnalysisReport from '@/components/AnalysisReport';
import { deleteConsultaService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import ParticleBackground from '@/components/ParticleBackground';

// --- Tipagem ---
interface Analise {
  diagnosticoSugerido: string;
  examesRecomendados: string[];
  medicamentosSugeridos: string[];
  observacoes?: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

interface ConsultaHistorico {
  id: string;
  transcricao: string;
  data: string;
  analise: Analise;
}

type FiltroPrioridade = 'todas' | 'Alta' | 'Média' | 'Baixa';
type FiltroData = 'recentes' | 'antigas';

// --- Componente do Histórico ---
const Historico = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados
  const [consultas, setConsultas] = useState<ConsultaHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState<FiltroPrioridade>('todas');
  const [filtroData, setFiltroData] = useState<FiltroData>('recentes');

  // Estados do Modal
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaHistorico | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Busca inicial dos dados
  const fetchHistorico = async () => {
    setLoading(true);
    try {
      // CORREÇÃO AQUI: Adicionamos o prefixo /api/consulta/
      const response = await fetch(`${API_URL}/api/consulta/historico`);
      if (!response.ok) throw new Error('Erro ao carregar histórico');
      const data = await response.json();
      setConsultas(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  // Lógica de Filtragem e Busca
  const consultasFiltradas = useMemo(() => {
    let items = [...consultas];

    // 1. Filtro de Prioridade
    if (filtroPrioridade !== 'todas') {
      items = items.filter(c => c.analise.prioridade === filtroPrioridade);
    }

    // 2. Filtro de Busca (Termo)
    if (searchTerm) {
      items = items.filter(
        c =>
          c.transcricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.analise.diagnosticoSugerido && 
           c.analise.diagnosticoSugerido.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 3. Filtro de Data
    if (filtroData === 'antigas') {
      items.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    } else {
      items.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    }

    return items;
  }, [consultas, searchTerm, filtroPrioridade, filtroData]);

  // --- Ações ---

  const handleOpenModal = (consulta: ConsultaHistorico) => {
    setSelectedConsulta(consulta);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Usando um modal customizado em vez de window.confirm
    if (!confirm('Tem certeza que deseja excluir esta análise? Esta ação é irreversível.')) {
      return;
    }
    
    try {
      await deleteConsultaService(id);
      setConsultas(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Sucesso!',
        description: 'Análise excluída permanentemente.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch (err: any) {
      console.error('Erro ao deletar:', err);
      toast({
        title: 'Erro ao excluir',
        description: err.message || 'Não foi possível remover a análise.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = (consulta: ConsultaHistorico) => {
    const { analise, transcricao, data } = consulta;
    let reportText = `RELATÓRIO DE CONSULTA MÉDICA (IA)\n`;
    reportText += `=====================================\n\n`;
    reportText += `Data: ${new Date(data).toLocaleString('pt-BR')}\n`;
    reportText += `Prioridade: ${analise.prioridade || 'N/A'}\n\n`;
    reportText += `--- Diagnóstico Sugerido ---\n${analise.diagnosticoSugerido || 'N/A'}\n\n`;
    reportText += `--- Transcrição ---\n${transcricao}\n\n`;
    reportText += `--- Exames Recomendados ---\n`;
    reportText += `- ${analise.examesRecomendados.join('\n- ') || 'Nenhum'}\n\n`;
    reportText += `--- Medicamentos Sugeridos ---\n`;
    reportText += `- ${analise.medicamentosSugeridos.join('\n- ') || 'Nenhum'}\n\n`;
    reportText += `--- Observações ---\n${analise.observacoes || 'Nenhuma'}\n`;

    const element = document.createElement('a');
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Relatorio-Consulta-${consulta.id.substring(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({ title: 'Relatório exportado!', description: 'Download iniciado.' });
  };

  // --- Renderização ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-medical-plexus">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4 bg-medical-plexus">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-white">Erro ao carregar dados</h2>
        <p className="text-white/70">{error}</p>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-medical-plexus relative p-4 md:p-8">
        
        <ParticleBackground />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* Header da Página */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="hover:bg-white/10 text-white hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white">
              Histórico de Consultas
            </h1>
          </div>

          {/* Barra de Busca e Filtros */}
          <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por diagnóstico ou palavra-chave na transcrição..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Prioridade: {filtroPrioridade === 'todas' ? 'Todas' : filtroPrioridade}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFiltroPrioridade('todas')}>Todas</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroPrioridade('Alta')}>Alta</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroPrioridade('Média')}>Média</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroPrioridade('Baixa')}>Baixa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Calendar className="h-4 w-4 mr-2" />
                      {filtroData === 'recentes' ? 'Mais Recentes' : 'Mais Antigas'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFiltroData('recentes')}>Mais Recentes</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFiltroData('antigas')}>Mais Antigas</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>

          {/* Grid de Consultas */}
          {consultasFiltradas.length === 0 ? (
            <div className="text-center text-white/70 p-12 border-2 border-dashed border-white/30 rounded-lg">
              <p>Nenhum resultado encontrado para os filtros aplicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {consultasFiltradas.map(consulta => (
                <ConsultaCard
                  key={consulta.id}
                  consulta={consulta}
                  onCardClick={handleOpenModal}
                  onDelete={handleDelete}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Modal de Detalhes --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes da Consulta</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-6">
            {selectedConsulta && (
              <div className="space-y-6">
                {/* 1. Relatório de Análise (Componente Reutilizado) */}
                <AnalysisReport analise={selectedConsulta.analise} />
                
                {/* 2. Transcrição Completa */}
                <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      Transcrição Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background/60 p-4 rounded-lg border border-primary/10 max-h-64 overflow-y-auto">
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {selectedConsulta.transcricao}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- Componente Card (Separado para organizar) ---

interface ConsultaCardProps {
  consulta: ConsultaHistorico;
  onCardClick: (consulta: ConsultaHistorico) => void;
  onDelete: (id: string) => void;
  onExport: (consulta: ConsultaHistorico) => void;
}

const ConsultaCard: React.FC<ConsultaCardProps> = ({ consulta, onCardClick, onDelete, onExport }) => {
  
  const getPrioridadeBadge = (prioridade?: string) => { 
    switch (prioridade) {
      case 'Alta':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> Alta Prioridade
          </Badge>
        );
      case 'Média':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> Média Prioridade
          </Badge>
        );
      case 'Baixa':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Baixa Prioridade
          </Badge>
        );
      default:
        return <Badge variant="secondary">Não definida</Badge>;
    }
  };

  const dataFormatada = new Date(consulta.data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm flex flex-col justify-between hover:shadow-primary/20 transition-all duration-300">
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => onCardClick(consulta)}
      >
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold text-primary mb-2">
            {consulta.analise.diagnosticoSugerido}
          </CardTitle>
          {getPrioridadeBadge(consulta.analise.prioridade)}
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <Calendar className="h-4 w-4" />
          <span>{dataFormatada}</span>
        </div>
      </CardHeader>
      
      <CardContent 
        className="flex-1 cursor-pointer" 
        onClick={() => onCardClick(consulta)}
      >
        <p className="text-muted-foreground line-clamp-3">
          {consulta.transcricao}
        </p>
      </CardContent>
      
      <div className="border-t p-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport(consulta)}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar (.txt)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(consulta.id)} 
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Análise
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default Historico;