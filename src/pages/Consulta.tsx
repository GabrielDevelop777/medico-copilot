import AnalysisReport from "@/components/AnalysisReport";
import AudioRecorder from "@/components/AudioRecorder";
import ChatDoctor from "@/components/ChatDoctor";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { type AnaliseResponse, analisarConsultaService } from "@/services/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
	Activity,
	AlertCircle,
	Brain,
	CheckCircle,
	FileText,
	HeartHandshake,
	History,
	Menu,
	RefreshCw,
	Sparkles,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Tipagem ---
interface Analise {
	diagnosticoSugerido: string;
	examesRecomendados: string[];
	medicamentosSugeridos: string[];
	observacoes?: string;
	prioridade: "Alta" | "Média" | "Baixa";
}

// --- Componente StepIndicator ---
interface StepIndicatorProps {
	currentStep: number;
	steps: Array<{
		icon: React.ElementType;
		label: string;
		description: string;
	}>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
	currentStep,
	steps,
}) => {
	return (
		<div className="flex items-start justify-around px-2 sm:px-4">
			{steps.map((step, index) => {
				const Icon = step.icon;
				const isCompleted = index <= currentStep;
				const isActive = index === currentStep && !isCompleted;

				return (
					<div key={index} className="relative">
						<div className="flex flex-col items-center w-20 sm:w-24">
							<div
								className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 relative overflow-hidden
                ${
									isCompleted
										? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 scale-110"
										: isActive
											? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110"
											: "bg-slate-800/50 border-2 border-slate-700/50"
								}
              `}
							>
								{(isCompleted || isActive) && (
									<div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
								)}
								{isCompleted ? (
									<CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 animate-bounce" />
								) : (
									<Icon
										className={`h-6 w-6 sm:h-7 sm:w-7 relative z-10 ${
											isActive ? "text-white animate-pulse" : "text-slate-400"
										}`}
									/>
								)}
							</div>
							<div className="mt-2 sm:mt-3 text-center">
								<p
									className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${
										isCompleted
											? "text-green-400"
											: isActive
												? "text-blue-400"
												: "text-slate-500"
									}`}
								>
									{step.label}
								</p>
								<p className="text-[10px] sm:text-xs text-slate-400 hidden md:block mt-1">
									{step.description}
								</p>
							</div>
						</div>
						{index < steps.length - 1 && (
							<div
								className={`
                absolute top-6 sm:top-7 left-[calc(50%_+_3rem)] sm:left-[calc(50%_+_4rem)] w-[calc(100%_-_2.5rem)] sm:w-[calc(100%_-_3rem)] h-1 -z-10
                hidden md:block rounded-full
                transition-all duration-500 overflow-hidden
                ${index + 1 <= currentStep ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-slate-800/50"}
              `}
							>
								{index + 1 <= currentStep && (
									<div className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

// --- FUNÇÃO HELPER DE ESPERA ---
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Componente Principal ---
const Consulta = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const analysisRef = useRef<HTMLDivElement>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [transcricao, setTranscricao] = useState<string | null>(null);
	const [analise, setAnalise] = useState<Analise | null>(null);
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);

	const steps = [
		{ icon: Activity, label: "Gravação", description: "Capture o áudio" },
		{ icon: Brain, label: "Processamento", description: "IA analisando" },
		{ icon: FileText, label: "Análise", description: "Relatório detalhado" },
	];

	const analisarComRetentativa = async (
		transcricaoText: string,
		maxTentativas = 3,
	): Promise<AnaliseResponse> => {
		let tentativa = 1;
		while (tentativa <= maxTentativas) {
			try {
				const data = await analisarConsultaService(transcricaoText);
				return data;
			} catch (error: any) {
				console.error(`Erro na tentativa ${tentativa}:`, error);
				if (tentativa === maxTentativas) {
					throw error;
				}
				toast({
					title: "⏳ Servidor lento...",
					description: `A análise falhou (tentativa ${tentativa}/${maxTentativas}). Tentando novamente em 2s...`,
					variant: "destructive",
					duration: 2000,
				});
				await sleep(2000);
				tentativa++;
			}
		}
		throw new Error("Falha na análise após retentativas.");
	};

	const handleRecordingComplete = async (
		audioBlob: Blob,
		transcricaoText: string,
	) => {
		setIsProcessing(true);
		setTranscricao(transcricaoText);
		setAnalise(null);
		setCurrentStep(1);

		const progressInterval = setInterval(() => {
			setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
		}, 200);

		try {
			const data = await analisarComRetentativa(transcricaoText);

			if (data.success && data.analise) {
				setAnalise(data.analise);
				setProgress(100);
				setCurrentStep(2);

				toast({
					title: "✨ Análise Concluída com Sucesso!",
					description: "Relatório gerado. Verifique abaixo.",
					className:
						"bg-gradient-to-r from-green-50 to-emerald-50 border-green-300",
					duration: 7000,
				});

				setTimeout(() => {
					analysisRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}, 500);
			} else {
				throw new Error("Análise retornou incompleta");
			}
		} catch (error: any) {
			console.error("Erro ao processar consulta (final):", error);
			toast({
				title: "❌ Erro ao processar",
				description:
					"O servidor falhou em responder após 3 tentativas. Verifique o back-end e tente novamente.",
				variant: "destructive",
			});
			setCurrentStep(0);
			setProgress(0);
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
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleChatOpen = () => {
		// Ação removida
	};

	const handleExportPDF = () => {
		const input = document.getElementById("relatorio-para-pdf");
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
		html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4");
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
			pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
			pdf.save("relatorio-medico-copilot.pdf");
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-x-hidden">
			{/* Background Effects */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

			<ParticleBackground />

			<div className="relative z-10 min-h-screen flex flex-col">
				{/* === HEADER === */}
				<header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20">
					<div className="container mx-auto px-3 sm:px-4 h-16 sm:h-20 flex justify-between items-center relative overflow-x-hidden">
						<div
							className={`
                absolute inset-0 flex justify-center items-center gap-2 sm:gap-3
                transition-all duration-500 ease-in-out
                ${isMenuOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}
              `}
						>
							<div className="relative group">
								<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
								<div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-xl">
									<HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
								</div>
							</div>
							<div className="min-w-0">
								<h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-purple-200 bg-clip-text text-transparent truncate">
									Médico Copilot
								</h1>
								<p className="text-[10px] sm:text-xs md:text-sm text-blue-200/60 flex items-center gap-1 sm:gap-2 truncate">
									<Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400 flex-shrink-0" />
									Assistente Clínico com IA
								</p>
							</div>
						</div>

						<div
							className={`
                absolute inset-0 flex justify-center items-center
                transition-all duration-500 ease-in-out md:hidden
                ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
              `}
						>
							<Button
								variant="ghost"
								size="lg"
								onClick={() => {
									navigate("/historico");
									setIsMenuOpen(false);
								}}
								className="
                  group bg-gradient-to-r from-blue-600 to-purple-600 text-white
                  shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-105
                  transition-all duration-300 ease-in-out rounded-2xl px-6 py-5
                "
							>
								<History className="h-8 w-8 sm:h-10 sm:w-10 mr-3 sm:mr-4 transition-transform duration-300 group-hover:-rotate-12" />
								<span className="text-base sm:text-lg font-semibold">
									Histórico
								</span>
							</Button>
						</div>

						<div className="hidden md:flex ml-auto z-10">
							<Button
								onClick={() => navigate("/historico")}
								className="
                  group bg-gradient-to-r from-blue-600 to-purple-600 text-white
                  shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-105
                  transition-all duration-300 ease-in-out rounded-xl px-5 py-4
                "
							>
								<History className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
								<span className="font-medium">Histórico</span>
							</Button>
						</div>

						<div className="md:hidden z-10 ml-auto">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110 rounded-xl w-10 h-10 sm:w-12 sm:h-12"
							>
								{isMenuOpen ? (
									<X className="h-6 w-6 sm:h-7 sm:w-7" />
								) : (
									<Menu className="h-6 w-6 sm:h-7 sm:w-7" />
								)}
							</Button>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl flex-1">
					{/* Step Indicator */}
					<Card className="mb-6 sm:mb-8 border-0 shadow-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
						<div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
						<CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6">
							<StepIndicator currentStep={currentStep} steps={steps} />
						</CardContent>
					</Card>

					{/* Barra de Progresso */}
					{isProcessing && (
						<Card className="mb-4 sm:mb-6 border-0 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 border border-blue-500/20">
							<div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-shimmer"></div>
							<CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
								<div className="flex items-center justify-between mb-3">
									<p className="text-xs sm:text-sm font-semibold text-blue-200 flex items-center gap-2">
										<Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
										Processando análise médica...
									</p>
									<span className="text-xs sm:text-sm text-blue-300 font-mono bg-blue-950/50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
										{progress}%
									</span>
								</div>
								<Progress
									value={progress}
									className="h-2 sm:h-2.5 bg-slate-800/50"
								/>
								<p className="text-[10px] sm:text-xs text-blue-200/60 mt-2 sm:mt-3 flex items-center gap-2">
									<Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
									Analisando sintomas e gerando recomendações
								</p>
							</CardContent>
						</Card>
					)}

					{/* Layout Responsivo */}
					<div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
						{/* Coluna Principal */}
						<div className="lg:col-span-2 space-y-4 sm:space-y-6">
							{/* Card de Gravação */}
							<Card className="shadow-2xl border-0 bg-slate-900/40 backdrop-blur-xl overflow-hidden rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 group">
								<div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 group-hover:h-1.5 transition-all duration-300"></div>
								<CardHeader className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 sm:p-6">
									<CardTitle className="flex items-center gap-2 sm:gap-3 text-blue-100">
										<div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
											<Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
										</div>
										<span className="text-base sm:text-xl font-bold truncate">
											Central de Gravação
										</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 sm:p-6">
									<AudioRecorder
										onRecordingComplete={handleRecordingComplete}
										isProcessing={isProcessing}
									/>
								</CardContent>
							</Card>

							{/* Card de Transcrição */}
							{transcricao && (
								<Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-2xl border border-green-500/20 overflow-hidden">
									<div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
									<CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-4 sm:p-6">
										<CardTitle className="flex items-center gap-2 sm:gap-3 text-green-100">
											<div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
												<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
											</div>
											<span className="text-base sm:text-xl font-bold truncate">
												Transcrição da Consulta
											</span>
										</CardTitle>
									</CardHeader>
									<CardContent className="p-4 sm:p-6">
										<div className="bg-slate-950/50 p-4 sm:p-6 rounded-xl border border-green-500/10 backdrop-blur-sm">
											<p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
												{transcricao}
											</p>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Card de Análise */}
							{analise && (
								<div
									ref={analysisRef}
									className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
								>
									<AnalysisReport analise={analise} />
								</div>
							)}

							{/* Card de Chat */}
							{analise && (
								<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
									<ChatDoctor
										contextoAnalise={analise}
										onOpen={handleChatOpen}
									/>
								</div>
							)}
						</div>

						{/* Sidebar */}
						<div className="space-y-4 sm:space-y-6">
							{/* Ações Rápidas */}
							{analise && (
								<Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
									<div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
									<CardHeader className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 sm:p-6">
										<CardTitle className="text-base sm:text-lg flex items-center gap-2 text-blue-100">
											<div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
												<Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-400" />
											</div>
											Ações Rápidas
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
										<Button
											onClick={handleNovaConsulta}
											className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl h-10 sm:h-12 font-medium text-sm sm:text-base"
										>
											<RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
											Nova Consulta
										</Button>
										<Button
											variant="outline"
											className="w-full bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
											onClick={() => window.print()}
										>
											Imprimir Relatório
										</Button>
										<Button
											variant="outline"
											className="w-full bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-xl h-9 sm:h-11 text-xs sm:text-sm"
											onClick={handleExportPDF}
										>
											Exportar PDF
										</Button>
									</CardContent>
								</Card>
							)}

							{/* Dicas de Uso */}
							<Card className="shadow-2xl border-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-emerald-500/20 overflow-hidden">
								<div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
								<CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-4 sm:p-6">
									<CardTitle className="text-base sm:text-lg flex items-center gap-2 text-emerald-100">
										<div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
											<AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
										</div>
										Dicas de Uso
									</CardTitle>
								</CardHeader>
								<CardContent className="p-4 sm:p-6">
									<ul className="space-y-2 sm:space-y-3">
										<li className="flex items-start gap-2 sm:gap-3 group">
											<div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
												<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
											</div>
											<span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
												Grave em ambiente silencioso
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3 group">
											<div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
												<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
											</div>
											<span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
												Inclua todos os sintomas relatados
											</span>
										</li>
										<li className="flex items-start gap-2 sm:gap-3 group">
											<div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
												<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
											</div>
											<span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
												Use o chat para gerar atestados
											</span>
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>

				<Footer />
			</div>

			<style jsx>{`
				@keyframes shimmer {
					0% { transform: translateX(-100%); }
					100% { transform: translateX(100%); }
				}
				.animate-shimmer {
					animation: shimmer 2s infinite;
				}
			`}</style>
		</div>
	);
};

export default Consulta;
