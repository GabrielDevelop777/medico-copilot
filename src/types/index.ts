export interface Analise {
	diagnosticoSugerido: string;
	examesRecomendados: string[];
	medicamentosSugeridos: string[];
	observacoes?: string;
	prioridade: "Alta" | "Média" | "Baixa";
}

export interface ConsultaHistorico {
	id: string;
	transcricao: string;
	data: string;
	analise: Analise;
}
