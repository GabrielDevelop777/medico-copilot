import AnalysisReport from "@/components/AnalysisReport";
import ParticleBackground from "@/components/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/services/api";
import { deleteConsultaService } from "@/services/api";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	FileDown,
	FileText,
	Filter,
	Loader2,
	MoreVertical,
	Search,
	Shield,
	ShieldAlert,
	ShieldCheck,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Tipagem ---
interface Analise {
	diagnosticoSugerido: string;
	examesRecomendados: string[];
	medicamentosSugeridos: string[];
	observacoes?: string;
	prioridade: "Alta" | "Média" | "Baixa";
}

interface ConsultaHistorico {
	id: string;
	transcricao: string;
	data: string;
	analise: Analise;
}

type FiltroPrioridade = "todas" | "Alta" | "Média" | "Baixa";
type FiltroData = "recentes" | "antigas";

// --- Componente do Histórico ---
const Historico = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	// Estados
	const [consultas, setConsultas] = useState<ConsultaHistorico[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Estados dos Filtros
	const [searchTerm, setSearchTerm] = useState("");
	const [filtroPrioridade, setFiltroPrioridade] =
		useState<FiltroPrioridade>("todas");
	const [filtroData, setFiltroData] = useState<FiltroData>("recentes");

	// Estados do Modal
	const [selectedConsulta, setSelectedConsulta] =
		useState<ConsultaHistorico | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Busca inicial dos dados
	const fetchHistorico = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/api/consulta/historico`);
			if (!response.ok) throw new Error("Erro ao carregar histórico");
			const data = await response.json();
			setConsultas(data);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Não foi possível carregar o histórico.");
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
		if (filtroPrioridade !== "todas") {
			items = items.filter((c) => c.analise.prioridade === filtroPrioridade);
		}

		// 2. Filtro de Busca (Termo)
		if (searchTerm) {
			items = items.filter(
				(c) =>
					c.transcricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(c.analise.diagnosticoSugerido &&
						c.analise.diagnosticoSugerido
							.toLowerCase()
							.includes(searchTerm.toLowerCase())),
			);
		}

		// 3. Filtro de Data
		if (filtroData === "antigas") {
			items.sort(
				(a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
			);
		} else {
			items.sort(
				(a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
			);
		}

		return items;
	}, [consultas, searchTerm, filtroPrioridade, filtroData]);

	// --- Ações ---

	const handleOpenModal = (consulta: ConsultaHistorico) => {
		setSelectedConsulta(consulta);
		setIsModalOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (
			!confirm(
				"Tem certeza que deseja excluir esta análise? Esta ação é irreversível.",
			)
		) {
			return;
		}

		try {
			await deleteConsultaService(id);
			setConsultas((prev) => prev.filter((c) => c.id !== id));
			toast({
				title: "Sucesso!",
				description: "Análise excluída permanentemente.",
				className: "bg-green-50 border-green-200 text-green-800",
				duration: 3000,
			});
		} catch (err: any) {
			console.error("Erro ao deletar:", err);
			toast({
				title: "Erro ao excluir",
				description: err.message || "Não foi possível remover a análise.",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const handleExport = (consulta: ConsultaHistorico) => {
		const { analise, transcricao, data } = consulta;
		let reportText = `RELATÓRIO DE CONSULTA MÉDICA (IA)\n`;
		reportText += `=====================================\n\n`;
		reportText += `Data: ${new Date(data).toLocaleString("pt-BR")}\n`;
		reportText += `Prioridade: ${analise.prioridade || "N/A"}\n\n`;
		reportText += `--- Diagnóstico Sugerido ---\n${analise.diagnosticoSugerido || "N/A"}\n\n`;
		reportText += `--- Transcrição ---\n${transcricao}\n\n`;
		reportText += `--- Exames Recomendados ---\n`;
		reportText += `- ${analise.examesRecomendados.join("\n- ") || "Nenhum"}\n\n`;
		reportText += `--- Medicamentos Sugeridos ---\n`;
		reportText += `- ${analise.medicamentosSugeridos.join("\n- ") || "Nenhum"}\n\n`;
		reportText += `--- Observações ---\n${analise.observacoes || "Nenhuma"}\n`;

		const element = document.createElement("a");
		const file = new Blob([reportText], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `Relatorio-Consulta-${consulta.id.substring(0, 8)}.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);

		toast({ title: "Relatório exportado!", description: "Download iniciado." });
	};

	// --- Renderização ---

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
				<div className="relative z-10 flex flex-col items-center gap-4">
					<div className="relative">
						<Loader2 className="h-16 w-16 animate-spin text-blue-400" />
						<div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-blue-400/20"></div>
					</div>
					<p className="text-blue-200 text-lg font-medium animate-pulse">
						Carregando histórico...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen flex-col gap-6 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-900 relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent"></div>
				<div className="relative z-10 flex flex-col items-center gap-6 p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-red-500/20 shadow-2xl">
					<div className="relative">
						<AlertTriangle className="h-20 w-20 text-red-400" />
						<div className="absolute inset-0 h-20 w-20 animate-pulse rounded-full bg-red-400/10"></div>
					</div>
					<h2 className="text-2xl font-bold text-white">
						Erro ao carregar dados
					</h2>
					<p className="text-red-200/70 text-center max-w-md">{error}</p>
					<Button
						onClick={() => navigate("/")}
						className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20 transition-all duration-300"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative p-4 md:p-8 overflow-hidden">
				{/* Background Effects */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
				<ParticleBackground />

				<div className="max-w-7xl mx-auto space-y-6 relative z-10">
					{/* Header da Página com Glassmorphism */}
					<div className="flex items-center gap-4 mb-8">
						<Button
							variant="ghost"
							onClick={() => navigate("/")}
							className="group hover:bg-white/10 text-white hover:text-white backdrop-blur-sm border border-white/10 transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:shadow-blue-500/10"
						>
							<ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
							Voltar
						</Button>
						<div className="flex-1">
							<h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-purple-200 bg-clip-text text-transparent">
								Histórico de Consultas
							</h1>
							<p className="text-blue-200/60 mt-1 text-sm">
								Gerencie e visualize suas análises médicas anteriores
							</p>
						</div>
					</div>

					{/* Barra de Busca e Filtros com Glass Effect */}
					<Card className="shadow-2xl border-0 bg-slate-900/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="relative flex-1 group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300/50 group-hover:text-blue-300 transition-colors" />
								<Input
									placeholder="Buscar por diagnóstico ou palavra-chave na transcrição..."
									className="pl-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl h-12 transition-all duration-300"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex gap-3">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full md:w-auto bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300 rounded-xl h-12"
										>
											<Filter className="h-4 w-4 mr-2" />
											Prioridade:{" "}
											{filtroPrioridade === "todas"
												? "Todas"
												: filtroPrioridade}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
										<DropdownMenuItem
											onClick={() => setFiltroPrioridade("todas")}
											className="hover:bg-slate-700"
										>
											Todas
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFiltroPrioridade("Alta")}
											className="hover:bg-slate-700"
										>
											Alta
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFiltroPrioridade("Média")}
											className="hover:bg-slate-700"
										>
											Média
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFiltroPrioridade("Baixa")}
											className="hover:bg-slate-700"
										>
											Baixa
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full md:w-auto bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300 rounded-xl h-12"
										>
											<Calendar className="h-4 w-4 mr-2" />
											{filtroData === "recentes"
												? "Mais Recentes"
												: "Mais Antigas"}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
										<DropdownMenuItem
											onClick={() => setFiltroData("recentes")}
											className="hover:bg-slate-700"
										>
											Mais Recentes
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => setFiltroData("antigas")}
											className="hover:bg-slate-700"
										>
											Mais Antigas
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</Card>

					{/* Grid de Consultas */}
					{consultasFiltradas.length === 0 ? (
						<div className="text-center text-blue-200/50 p-16 border-2 border-dashed border-blue-500/20 rounded-2xl bg-slate-900/20 backdrop-blur-sm">
							<div className="flex flex-col items-center gap-4">
								<div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center">
									<Search className="h-8 w-8 text-blue-400/50" />
								</div>
								<p className="text-lg">
									Nenhum resultado encontrado para os filtros aplicados.
								</p>
								<p className="text-sm text-blue-300/40">
									Tente ajustar seus critérios de busca
								</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{consultasFiltradas.map((consulta) => (
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
				<DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-900 border-slate-700/50 text-white">
					<DialogHeader className="border-b border-slate-700/50 pb-4">
						<DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
							Detalhes da Consulta
						</DialogTitle>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto pr-6 custom-scrollbar">
						{selectedConsulta && (
							<div className="space-y-6 py-4">
								{/* 1. Relatório de Análise (Componente Reutilizado) */}
								<AnalysisReport analise={selectedConsulta.analise} />

								{/* 2. Transcrição Completa */}
								<Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden">
									<CardHeader className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-slate-700/30">
										<CardTitle className="flex items-center gap-2 text-xl text-blue-100">
											<div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
												<FileText className="h-5 w-5 text-blue-400" />
											</div>
											Transcrição Completa
										</CardTitle>
									</CardHeader>
									<CardContent className="p-6">
										<div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/30 max-h-64 overflow-y-auto custom-scrollbar">
											<p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
												{selectedConsulta.transcricao}
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>

					<DialogFooter className="mt-4 border-t border-slate-700/50 pt-4">
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-xl"
							>
								<X className="h-4 w-4 mr-2" />
								Fechar
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
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

const ConsultaCard: React.FC<ConsultaCardProps> = ({
	consulta,
	onCardClick,
	onDelete,
	onExport,
}) => {
	const getPrioridadeBadge = (prioridade?: string) => {
		switch (prioridade) {
			case "Alta":
				return (
					<Badge className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/20 px-3 py-1">
						<ShieldAlert className="h-3 w-3" /> Alta Prioridade
					</Badge>
				);
			case "Média":
				return (
					<Badge className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg shadow-yellow-500/20 px-3 py-1">
						<Shield className="h-3 w-3" /> Média Prioridade
					</Badge>
				);
			case "Baixa":
				return (
					<Badge className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/20 px-3 py-1">
						<ShieldCheck className="h-3 w-3" /> Baixa Prioridade
					</Badge>
				);
			default:
				return (
					<Badge className="bg-slate-700 text-slate-200 border-0">
						Não definida
					</Badge>
				);
		}
	};

	const dataFormatada = new Date(consulta.data).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

	return (
		<Card className="group shadow-2xl border-0 bg-slate-900/40 backdrop-blur-xl flex flex-col justify-between hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:bg-slate-900/60 border border-slate-700/30 hover:border-blue-500/30 rounded-2xl overflow-hidden">
			{/* Accent Line */}
			<div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

			<CardHeader
				className="cursor-pointer transition-all duration-300 group-hover:bg-slate-800/30"
				onClick={() => onCardClick(consulta)}
			>
				<div className="flex justify-between items-start gap-3">
					<CardTitle className="text-xl font-bold text-blue-100 mb-2 line-clamp-2 group-hover:text-blue-50 transition-colors">
						{consulta.analise.diagnosticoSugerido}
					</CardTitle>
					{getPrioridadeBadge(consulta.analise.prioridade)}
				</div>
				<div className="flex items-center text-sm text-blue-300/60 gap-2 mt-2">
					<Calendar className="h-4 w-4" />
					<span className="group-hover:text-blue-300/80 transition-colors">
						{dataFormatada}
					</span>
				</div>
			</CardHeader>

			<CardContent
				className="flex-1 cursor-pointer pt-0 pb-4"
				onClick={() => onCardClick(consulta)}
			>
				<p className="text-slate-300/70 line-clamp-3 leading-relaxed group-hover:text-slate-300/90 transition-colors">
					{consulta.transcricao}
				</p>
			</CardContent>

			<div className="border-t border-slate-700/30 p-4 flex justify-end bg-slate-900/20 group-hover:bg-slate-800/30 transition-all duration-300">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-300 rounded-lg"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="bg-slate-800 border-slate-700 text-white rounded-xl"
					>
						<DropdownMenuItem
							onClick={() => onExport(consulta)}
							className="hover:bg-slate-700 cursor-pointer rounded-lg"
						>
							<FileDown className="h-4 w-4 mr-2 text-blue-400" />
							Exportar (.txt)
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(consulta.id)}
							className="text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer rounded-lg"
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
