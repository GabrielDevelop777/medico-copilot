import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	Filter,
	Loader2,
	Search,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ParticleBackground from "@/components/ParticleBackground";
import Header from "@/components/common/Header";
// Componentes UI e Comuns
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

import AnalysisReport from "@/components/AnalysisReport";
// Componentes de Feature
import ConsultaCard from "@/components/features/historico/ConsultaCard";

// Serviços e Tipos
import { API_URL, deleteConsultaService } from "@/services/api";
import type { ConsultaHistorico } from "@/types";

type FiltroPrioridade = "todas" | "Alta" | "Média" | "Baixa";
type FiltroData = "recentes" | "antigas";

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

	// Lógica de Filtragem
	const consultasFiltradas = useMemo(() => {
		let items = [...consultas];

		if (filtroPrioridade !== "todas") {
			items = items.filter((c) => c.analise.prioridade === filtroPrioridade);
		}

		if (searchTerm) {
			items = items.filter(
				(c) =>
					c.transcricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
					c.analise?.diagnosticoSugerido
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()),
			);
		}

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

	// Ações
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
			});
		} catch (err: any) {
			console.error("Erro ao deletar:", err);
			toast({
				title: "Erro ao excluir",
				description: err.message,
				variant: "destructive",
			});
		}
	};

	const handleExport = (consulta: ConsultaHistorico) => {
		const { analise, transcricao, data } = consulta;
		let reportText = `RELATÓRIO DE CONSULTA MÉDICA (IA)\n\n`;
		reportText += `Data: ${new Date(data).toLocaleString("pt-BR")}\n`;
		reportText += `Prioridade: ${analise.prioridade || "N/A"}\n\n`;
		reportText += `--- Diagnóstico ---\n${analise.diagnosticoSugerido || "N/A"}\n\n`;
		reportText += `--- Transcrição ---\n${transcricao}\n`;

		const element = document.createElement("a");
		const file = new Blob([reportText], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `Relatorio-${consulta.id.substring(0, 8)}.txt`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		toast({ title: "Relatório exportado!", description: "Download iniciado." });
	};

	// Renderização
	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-slate-950">
				<Loader2 className="h-16 w-16 animate-spin text-blue-400" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen flex-col gap-6 bg-slate-950">
				<AlertTriangle className="h-20 w-20 text-red-400" />
				<p className="text-red-200">{error}</p>
				<Button onClick={() => navigate("/")}>Voltar</Button>
			</div>
		);
	}

	return (
		<>
			<div className="max-w-7xl mx-auto space-y-6 relative z-10 p-4 md:p-8">
				<div className="flex items-center gap-4 mb-4">
					<Button
						variant="ghost"
						onClick={() => navigate("/")}
						className="group hover:bg-white/10 text-white hover:text-white backdrop-blur-sm border border-white/10"
					>
						<ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
						Voltar
					</Button>
					<div>
						<h1 className="text-3xl md:text-4xl font-bold text-white">
							Histórico
						</h1>
						<p className="text-blue-200/60 text-sm">
							Gerencie suas consultas anteriores
						</p>
					</div>
				</div>

				<Card className="bg-slate-900/40 backdrop-blur-xl border-white/10 p-6 rounded-2xl border hover:border-white/20 transition-all duration-300">
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
						<div className="flex flex-col md:flex-row gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="w-full md:w-auto bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300 rounded-xl h-12"
									>
										<Filter className="h-4 w-4 mr-2" />
										Prioridade:{" "}
										{filtroPrioridade === "todas" ? "Todas" : filtroPrioridade}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
									{["todas", "Alta", "Média", "Baixa"].map((p) => (
										<DropdownMenuItem
											key={p}
											onClick={() => setFiltroPrioridade(p as any)}
											className="hover:bg-slate-700 cursor-pointer"
										>
											{p.charAt(0).toUpperCase() + p.slice(1)}
										</DropdownMenuItem>
									))}
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
								<AnalysisReport analise={selectedConsulta.analise} />
								<Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden">
									<CardContent className="p-6">
										<h3 className="text-lg font-bold text-blue-100 mb-4 flex items-center gap-2">
											Transcrição Completa
										</h3>
										<div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/30">
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
								variant="outline"
								className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-xl"
							>
								Fechar
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default Historico;
