import jsPDF from "jspdf";
import {
	Bot,
	Download,
	Loader2,
	MessageSquarePlus,
	Send,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { enviarMensagemChatService } from "../services/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface ChatProps {
	contextoAnalise: any;
	onOpen?: () => void;
}

interface Message {
	role: "user" | "assistant";
	content: string;
	atestadoData?: AtestadoData;
}

// Estrutura do JSON que o back-end vai mandar
interface AtestadoData {
	tipo: "ATESTADO";
	nomePaciente: string;
	diasAfastamento: string;
	dataInicio: string;
	cid: string;
	nomeMedico: string;
	crm: string;
}

// --- FUNÇÃO DE GERAR PDF ---
const gerarAtestadoPDF = (data: AtestadoData) => {
	const doc = new jsPDF();

	// Cabeçalho
	doc.setFontSize(22);
	doc.setFont("helvetica", "bold");
	doc.text("ATESTADO MÉDICO", 105, 30, { align: "center" });

	// Corpo do Atestado
	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");

	const textoCorpo = `Atesto para os devidos fins que o(a) Sr(a) ${data.nomePaciente} necessita de ${data.diasAfastamento} de afastamento de suas atividades laborais, a partir de ${data.dataInicio}, por motivos de doença.`;

	const splitText = doc.splitTextToSize(textoCorpo, 170); // 170mm de largura
	doc.text(splitText, 20, 50);

	// CID (se houver)
	if (data.cid) {
		doc.text(`CID: ${data.cid}`, 20, 70);
	}

	// Assinatura
	const dataAtual = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
	doc.text(`Duque de Caxias, ${dataAtual}.`, 105, 100, { align: "center" });

	doc.text("___________________________________", 105, 120, {
		align: "center",
	});
	doc.text(data.nomeMedico, 105, 125, { align: "center" });
	doc.text(data.crm, 105, 130, { align: "center" });

	doc.save("atestado_medico.pdf");
};

// --- COMPONENTE DO CHAT ---
const ChatDoctor: React.FC<ChatProps> = ({ contextoAnalise, onOpen }) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	const handleSend = async () => {
		if (!inputValue.trim()) return;

		const userMsg = inputValue;
		setInputValue("");

		if (!hasInteracted && onOpen) {
			onOpen();
			setHasInteracted(true);
		}

		setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
		setIsLoading(true);

		try {
			const data = await enviarMensagemChatService(userMsg, contextoAnalise);

			let iaMsgContent = data.resposta;
			let atestadoData: AtestadoData | undefined = undefined;

			try {
				// 1. Procura por um bloco JSON ({...}) dentro da resposta da IA
				const jsonMatch = data.resposta.match(/\{[\s\S]*\}/);

				if (jsonMatch) {
					// 2. Se achou um bloco, tenta parsear SÓ ELE
					const parsedJson = JSON.parse(jsonMatch[0]);

					// 3. Verifica se é um atestado
					if (parsedJson && parsedJson.tipo === "ATESTADO") {
						iaMsgContent =
							"Gerei o atestado solicitado. Clique no botão abaixo para fazer o download.";
						atestadoData = parsedJson;
					} else {
						// É um JSON, mas não é um atestado (raro)
						iaMsgContent = data.resposta;
					}
				} else {
					// 4. Não achou JSON, é só texto normal
					iaMsgContent = data.resposta;
				}
			} catch (e) {
				// 5. Deu erro no parse ou era só texto mesmo.
				iaMsgContent = data.resposta;
			}

			// Adiciona resposta da IA na tela
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: iaMsgContent,
					atestadoData: atestadoData,
				},
			]);
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: "Desculpe, tive um erro ao processar sua pergunta.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFocus = () => {
		if (!hasInteracted && onOpen) {
			onOpen();
			setHasInteracted(true);
		}
	};

	return (
		<Card className="w-full max-w-4xl mx-auto mt-8 border-t-4 border-t-primary shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
			<CardHeader className="bg-muted/30 pb-4">
				<CardTitle className="flex items-center gap-2 text-xl">
					<MessageSquarePlus className="text-primary h-6 w-6" />
					Copilot Chat
					<span className="text-sm font-normal text-muted-foreground ml-2">
						Faça perguntas sobre este caso clínico
					</span>
				</CardTitle>
			</CardHeader>

			<CardContent className="p-0">
				{/* Área de Mensagens */}
				<div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-slate-50/50">
					{messages.length === 0 && (
						<div className="text-center text-muted-foreground mt-10 opacity-60">
							<p>Exemplos de perguntas:</p>
							<p className="text-sm italic">"Crie um atestado de 3 dias"</p>
							<p className="text-sm italic">
								"Qual a posologia infantil para o medicamento sugerido?"
							</p>
						</div>
					)}

					{messages.map((msg, idx) => (
						<div
							key={idx}
							className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`flex max-w-[80%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
							>
								<div
									className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-white" : "bg-emerald-600 text-white"}`}
								>
									{msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
								</div>
								<div
									className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
										msg.role === "user"
											? "bg-primary text-primary-foreground rounded-tr-none"
											: "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
									}`}
								>
									<p className="whitespace-pre-wrap">{msg.content}</p>

									{/* --- BOTÃO DE DOWNLOAD (NOVO) --- */}
									{msg.atestadoData && (
										<Button
											variant="outline"
											size="sm"
											className="mt-3 bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
											onClick={() => gerarAtestadoPDF(msg.atestadoData!)}
										>
											<Download className="h-4 w-4 mr-2" />
											Baixar Atestado (PDF)
										</Button>
									)}
								</div>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
								<span className="text-xs text-muted-foreground">
									Digitando...
								</span>
							</div>
						</div>
					)}
					<div ref={scrollRef} />
				</div>

				{/* Área de Input */}
				<div className="p-4 bg-white border-t flex gap-2">
					<Input
						placeholder="Digite sua pergunta sobre o caso..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
						onFocus={handleFocus}
						className="flex-1"
						disabled={isLoading}
					/>
					<Button
						onClick={handleSend}
						disabled={isLoading || !inputValue.trim()}
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default ChatDoctor;
