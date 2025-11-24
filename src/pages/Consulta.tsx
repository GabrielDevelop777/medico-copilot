import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
	Activity,
	AlertCircle,
	Brain,
	CheckCircle,
	FileText,
	RefreshCw,
	Sparkles,
	Video,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { analisarConsultaComRetry } from "@/services/api";
import type { Analise } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import AnalysisReport from "@/components/AnalysisReport";
import AudioRecorder from "@/components/AudioRecorder";
import ChatDoctor from "@/components/ChatDoctor";
import StepIndicator from "@/components/features/consulta/StepIndicator";

const Consulta = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
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
			const data = await analisarConsultaComRetry(
				transcricaoText,
				3,
				(tentativa) => {
					toast({
						title: "⏳ Servidor lento...",
						description: `A análise falhou (tentativa ${tentativa}/3). Tentando novamente...`,
						variant: "destructive",
						duration: 2000,
					});
				},
			);

			if (data.success && data.analise) {
				setAnalise(data.analise);
				setProgress(100);
				setCurrentStep(2);

				toast({
					title: "✨ Análise Concluída com Sucesso!",
					description: "Relatório gerado. Verifique abaixo.",
					className:
						"bg-gradient-to-r from-green-50 to-emerald-50 border-green-300",
					duration: 4000,
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
				duration: 4000,
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

	const handleChatOpen = () => {};

	const handleExportPDF = () => {
		const input = document.getElementById("relatorio-para-pdf");
		if (!input) {
			toast({
				title: "Erro ao Exportar",
				description: "Não foi possível encontrar o componente do relatório.",
				variant: "destructive",
				duration: 3000,
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

	const handleStartVideoCall = () => {
		const roomName = `MedCopilot-${crypto.randomUUID().substring(0, 8)}`;
		const inviteLink = `${window.location.origin}/teleconsulta/${roomName}`;

		navigator.clipboard
			.writeText(inviteLink)
			.then(() => {
				toast({
					title: "✅ Link de Convite Copiado!",
					description:
						"O link da teleconsulta está na sua área de transferência.",
					duration: 3000,
				});
			})
			.catch((err) => {
				console.error("Falha ao copiar link: ", err);
				toast({
					title: "Erro ao copiar link",
					description: "Copie o link da URL do navegador.",
					variant: "destructive",
					duration: 3000,
				});
			});

		navigate(`/teleconsulta/${roomName}`);
	};

	return (
		<>
			<Card className="mb-6 sm:mb-8 border-0 shadow-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
				<div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
				<CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6">
					<StepIndicator currentStep={currentStep} steps={steps} />
				</CardContent>
			</Card>

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

			<div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
				<div className="lg:col-span-2 space-y-4 sm:space-y-6">
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

					{analise && (
						<div
							ref={analysisRef}
							className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
						>
							<AnalysisReport analise={analise} />
						</div>
					)}

					{analise && (
						<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
							<ChatDoctor contextoAnalise={analise} onOpen={handleChatOpen} />
						</div>
					)}
				</div>

				<div className="space-y-4 sm:space-y-6">
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
										Clique para começar ou encerrar a gravação
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
								<li className="flex items-start gap-2 sm:gap-3 group">
									<div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-green-500/10 flex items-center justify-center mt-0.5 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
										<CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400" />
									</div>
									<span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
										Grave em ambiente silencioso
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>

			<Button
				onClick={handleStartVideoCall}
				className="
          group fixed z-50 bottom-6 right-6 sm:bottom-10 sm:right-10
          w-16 h-16 sm:w-20 sm:h-20
          bg-gradient-to-r from-green-500 to-emerald-600 text-white
          rounded-full shadow-2xl shadow-black/40
          hover:shadow-green-500/30 hover:scale-110
          transition-all duration-300 ease-in-out
        "
			>
				<span className="sr-only">Iniciar Teleconsulta</span>
				<Video className="h-7 w-7 sm:h-9 sm:w-9 transition-transform duration-300 group-hover:scale-110" />
			</Button>
		</>
	);
};

export default Consulta;
