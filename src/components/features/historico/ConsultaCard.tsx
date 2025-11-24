import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConsultaHistorico } from "@/types"; // Importando do arquivo de tipos que criamos
import {
	Calendar,
	FileDown,
	MoreVertical,
	Shield,
	ShieldAlert,
	ShieldCheck,
	Trash2,
} from "lucide-react";
import type React from "react";

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

export default ConsultaCard;
