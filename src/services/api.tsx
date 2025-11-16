export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AnaliseResponse {
	success: boolean;
	analise: {
		diagnosticoSugerido: string;
		examesRecomendados: string[];
		medicamentosSugeridos: string[];
		observacoes?: string;
		prioridade: "Alta" | "Média" | "Baixa";
	};
	consultaId: string;
}

// Rota 2
export const analisarConsultaService = async (transcricao: string) => {
	const response = await fetch(`${API_URL}/api/consulta/analisar`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ transcricao }),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Erro ao conectar com o servidor");
	}

	return response.json() as Promise<AnaliseResponse>;
};

// Rota 1
export const transcreverAudioService = async (audioBlob: Blob) => {
	const formData = new FormData();
	formData.append("audio", audioBlob, "recording.webm");

	const response = await fetch(`${API_URL}/api/consulta/transcrever`, {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		throw new Error("Erro ao enviar áudio para transcrição");
	}

	const data = await response.json();
	return data as { transcricao: string };
};

// Rota 4
export const enviarMensagemChatService = async (
	mensagem: string,
	contexto: any,
) => {
	const response = await fetch(`${API_URL}/api/consulta/chat`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ mensagem, contexto }),
	});

	if (!response.ok) {
		throw new Error("Erro ao enviar mensagem");
	}

	const data = await response.json();
	return data as { resposta: string };
};

// Rota 5
export const deleteConsultaService = async (id: string) => {
	const response = await fetch(`${API_URL}/api/consulta/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Erro ao deletar consulta");
	}

	return response.json();
};
