import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { enviarMensagemChatService } from "@/services/api"; // Ajuste no import path
import { type AtestadoData, gerarAtestadoPDF } from "@/utils/pdf"; // Importando do novo utilitário
import {
	Bot,
	Download,
	FileText,
	Loader2,
	MessageSquare,
	Send,
	Sparkles,
	User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatProps {
	contextoAnalise: any;
	onOpen?: () => void;
}

interface Message {
	role: "user" | "assistant";
	content: string;
	atestadoData?: AtestadoData;
}

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
				// Tenta encontrar um JSON na resposta para atestado
				const jsonMatch = data.resposta.match(/\{[\s\S]*\}/);

				if (jsonMatch) {
					const parsedJson = JSON.parse(jsonMatch[0]);

					if (parsedJson && parsedJson.tipo === "ATESTADO") {
						iaMsgContent =
							"Gerei o atestado solicitado. Clique no botão abaixo para fazer o download.";
						atestadoData = parsedJson;
					}
				}
			} catch (e) {
				// Se falhar o parse, mantém o texto original
				console.log("Não foi possível fazer parse de JSON na resposta");
			}

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
		<Card className="w-full max-w-5xl mx-auto mt-8 border-2 border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
			{/* Header Premium */}
			<CardHeader className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden p-0">
				<div className="absolute inset-0 opacity-5">
					<div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px]" />
				</div>

				<div className="relative px-6 py-5">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
								<MessageSquare className="h-6 w-6 text-white" />
							</div>
							<div>
								<h3 className="text-xl font-bold text-white flex items-center gap-2">
									Copilot Chat Médico
									<span className="px-2.5 py-1 bg-blue-600/20 text-blue-300 text-xs font-semibold rounded-md border border-blue-500/30 uppercase tracking-wider">
										IA
									</span>
								</h3>
								<p className="text-slate-300 text-sm mt-0.5">
									Assistente inteligente para análise clínica
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
							<Sparkles className="h-4 w-4 text-yellow-400" />
							<span className="text-xs text-slate-300 font-medium">
								Powered by AI
							</span>
						</div>
					</div>
				</div>

				<div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
			</CardHeader>

			<CardContent className="p-0">
				{/* Área de Mensagens */}
				<div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-slate-100/50">
					{messages.length === 0 && (
						<div className="flex items-center justify-center h-full">
							<div className="text-center space-y-6 max-w-md">
								<div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-md">
									<Bot className="h-12 w-12 text-blue-600 mx-auto" />
								</div>
								<div className="space-y-3">
									<h4 className="text-lg font-semibold text-slate-800">
										Como posso ajudar?
									</h4>
									<div className="space-y-2 text-sm text-slate-600">
										<div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
											<FileText className="h-4 w-4 inline mr-2 text-blue-600" />
											"Crie um atestado de 3 dias"
										</div>
										<div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
											<Bot className="h-4 w-4 inline mr-2 text-indigo-600" />
											"Qual a posologia infantil?"
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{messages.map((msg, idx) => (
						<div
							key={idx}
							className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
						>
							<div
								className={`flex max-w-[85%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
							>
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${
										msg.role === "user"
											? "bg-gradient-to-br from-blue-600 to-blue-500"
											: "bg-gradient-to-br from-emerald-600 to-emerald-500"
									}`}
								>
									{msg.role === "user" ? (
										<User size={18} className="text-white" />
									) : (
										<Bot size={18} className="text-white" />
									)}
								</div>

								<div
									className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
										msg.role === "user"
											? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm"
											: "bg-white border-2 border-slate-200 text-slate-800 rounded-tl-sm"
									}`}
								>
									<p className="whitespace-pre-wrap">{msg.content}</p>

									{/* Botão de Download do Atestado */}
									{msg.atestadoData && (
										<Button
											variant="outline"
											size="sm"
											className="mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 text-emerald-800 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-400 font-semibold shadow-md hover:shadow-lg transition-all group"
											onClick={() => gerarAtestadoPDF(msg.atestadoData!)}
										>
											<Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
											Baixar Atestado (PDF)
										</Button>
									)}
								</div>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex justify-start animate-in fade-in duration-300">
							<div className="flex gap-3">
								<div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-md">
									<Bot size={18} className="text-white" />
								</div>
								<div className="bg-white border-2 border-slate-200 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3 shadow-lg">
									<Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
									<span className="text-sm text-slate-600 font-medium">
										Analisando...
									</span>
								</div>
							</div>
						</div>
					)}
					<div ref={scrollRef} />
				</div>

				{/* Área de Input */}
				<div className="p-5 bg-white border-t-2 border-slate-200">
					<div className="flex gap-3 items-end">
						<div className="flex-1 relative">
							<Input
								placeholder="Digite sua pergunta sobre o caso clínico..."
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSend()}
								onFocus={handleFocus}
								disabled={isLoading}
								className="h-12 pr-4 pl-4 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm text-base"
							/>
						</div>
						<Button
							onClick={handleSend}
							disabled={isLoading || !inputValue.trim()}
							className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
						>
							<Send className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ChatDoctor;
