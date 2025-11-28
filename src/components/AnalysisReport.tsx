import { Card, CardContent } from "@/components/ui/card";
import {
	Activity,
	AlertCircle,
	Clock,
	FileText,
	Pill,
	Stethoscope,
} from "lucide-react";

interface Analise {
	diagnosticoSugerido: string;
	examesRecomendados: string[];
	medicamentosSugeridos: string[];
	observacoes?: string;
}

const AnalysisReport = ({ analise }: { analise: Analise }) => {
	// Data atual formatada
	const dataAtual = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});

	const horaAtual = new Date().toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<div
			id="relatorio-para-pdf"
			className="w-full max-w-5xl mx-auto mt-8 animate-medical-reveal"
		>
			<Card className="border border-slate-200 shadow-2xl bg-white overflow-hidden">
				{/* Header Médico Profissional */}
				<div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
					{/* Pattern de fundo */}
					<div className="absolute inset-0 opacity-5">
						<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
					</div>

					<div className="relative px-8 py-6">
						<div className="flex items-start justify-between flex-wrap gap-4">
							{/* Título Principal */}
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-600 rounded-xl shadow-lg">
									<Stethoscope className="h-7 w-7 text-white" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
										Relatório de Análise Clínica
									</h2>
									<p className="text-slate-300 text-sm font-medium">
										Diagnóstico assistido por Inteligência Artificial
									</p>
								</div>
							</div>

							{/* Metadata */}
							<div className="flex flex-col gap-1.5 text-right">
								<div className="flex items-center gap-2 text-slate-300 text-sm">
									<Clock className="h-4 w-4" />
									<span>{dataAtual}</span>
								</div>
								<div className="flex items-center gap-2 text-slate-400 text-xs">
									<Activity className="h-3.5 w-3.5" />
									<span>Gerado às {horaAtual}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Linha decorativa */}
					<div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />
				</div>

				<CardContent className="p-8 space-y-8">
					{/* Diagnóstico Principal - Destaque Premium */}
					<div className="relative group">
						<div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
						<div className="relative bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-8 rounded-2xl border-2 border-blue-200 shadow-lg">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-blue-600 rounded-lg">
									<Stethoscope className="h-5 w-5 text-white" />
								</div>
								<h3 className="text-blue-900 font-bold text-xl">
									Diagnóstico Sugerido
								</h3>
							</div>
							<p className="text-2xl font-semibold text-slate-800 leading-relaxed">
								{analise.diagnosticoSugerido}
							</p>
						</div>
					</div>

					{/* Grid de Medicamentos e Exames */}
					<div className="grid lg:grid-cols-2 gap-6">
						{/* Medicamentos Sugeridos */}
						<div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
							<div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-200">
								<div className="p-2.5 bg-purple-600 rounded-lg shadow-md">
									<Pill className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-purple-900 font-bold text-lg">
										Medicamentos Sugeridos
									</h3>
									<p className="text-xs text-slate-500 mt-0.5">
										{analise.medicamentosSugeridos.length}{" "}
										{analise.medicamentosSugeridos.length === 1
											? "medicamento"
											: "medicamentos"}
									</p>
								</div>
							</div>
							<ul className="space-y-3">
								{analise.medicamentosSugeridos.map((item, i) => (
									<li
										key={i}
										className="flex items-start gap-3 bg-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group"
									>
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-500 text-sm font-bold text-white shadow-md">
											{i + 1}
										</span>
										<span className="text-slate-700 font-medium leading-relaxed pt-0.5 group-hover:text-slate-900 transition-colors">
											{item}
										</span>
									</li>
								))}
							</ul>
						</div>

						{/* Exames Recomendados */}
						<div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
							<div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-200">
								<div className="p-2.5 bg-emerald-600 rounded-lg shadow-md">
									<FileText className="h-5 w-5 text-white" />
								</div>
								<div>
									<h3 className="text-emerald-900 font-bold text-lg">
										Exames Recomendados
									</h3>
									<p className="text-xs text-slate-500 mt-0.5">
										{analise.examesRecomendados.length}{" "}
										{analise.examesRecomendados.length === 1
											? "exame"
											: "exames"}
									</p>
								</div>
							</div>
							<ul className="space-y-3">
								{analise.examesRecomendados.map((item, i) => (
									<li
										key={i}
										className="flex items-start gap-3 bg-white p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all group"
									>
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 text-sm font-bold text-white shadow-md">
											{i + 1}
										</span>
										<span className="text-slate-700 font-medium leading-relaxed pt-0.5 group-hover:text-slate-900 transition-colors">
											{item}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Observações Clínicas */}
					{analise.observacoes && (
						<div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-md">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-2 bg-amber-600 rounded-lg">
									<AlertCircle className="h-5 w-5 text-white" />
								</div>
								<h3 className="text-amber-900 font-bold text-lg">
									Observações Clínicas Importantes
								</h3>
							</div>
							<div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-amber-200">
								<p className="text-slate-700 leading-relaxed text-base">
									{analise.observacoes}
								</p>
							</div>
						</div>
					)}

					{/* Footer com aviso legal */}
					<div className="pt-6 border-t-2 border-slate-200">
						<p className="text-xs text-slate-500 text-center leading-relaxed">
							Este relatório é gerado por inteligência artificial e serve como
							apoio ao diagnóstico médico, não substituindo a avaliação e
							decisão de um profissional de saúde qualificado.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AnalysisReport;
