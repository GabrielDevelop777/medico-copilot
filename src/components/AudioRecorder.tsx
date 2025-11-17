import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { transcreverAudioService } from "@/services/api";
import { Activity, Lightbulb, Loader2, Mic, Square } from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";

interface AudioRecorderProps {
	onRecordingComplete: (audioBlob: Blob, transcricao: string) => void;
	isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
	onRecordingComplete,
	isProcessing,
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const { toast } = useToast();

	const startRecording = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream, {
				mimeType: "audio/webm;codecs=opus",
			});

			chunksRef.current = [];
			mediaRecorder.ondataavailable = (e) =>
				e.data.size > 0 && chunksRef.current.push(e.data);

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

				// Notificação de Processamento
				toast({
					title: "⏳ Processando áudio...",
					description: "Aguarde enquanto geramos a inteligência clínica.",
					duration: 4000,
				});

				try {
					const data = await transcreverAudioService(audioBlob);
					if (data?.transcricao)
						onRecordingComplete(audioBlob, data.transcricao);
				} catch (error) {
					console.error(error);
					toast({
						title: "Erro",
						description: "Falha na transcrição.",
						variant: "destructive",
						duration: 3000,
					});
				}
				stream.getTracks().forEach((t) => t.stop());
			};

			mediaRecorder.start(1000);
			mediaRecorderRef.current = mediaRecorder;
			setIsRecording(true);

			// Notificação de Início
			toast({
				title: "🎙️ Gravação Iniciada",
				description: "Fale normalmente durante a consulta.",
				className: "bg-blue-50 border-blue-200 text-blue-800",
			});
		} catch (error) {
			toast({
				title: "Erro",
				description: "Permita o uso do microfone.",
				variant: "destructive",
				duration: 3000,
			});
		}
	}, [onRecordingComplete, toast]);

	const stopRecording = () => {
		if (mediaRecorderRef.current?.state !== "inactive") {
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center py-10 w-full">
			{/* 1. Área do Botão */}
			<div className="relative mb-6">
				{" "}
				{/* Margem inferior para separar do texto */}
				<Button
					onClick={isRecording ? stopRecording : startRecording}
					disabled={isProcessing}
					className={`
            relative z-10 rounded-full w-32 h-32 flex items-center justify-center transition-all duration-500
            ${
							isRecording
								? "bg-destructive hover:bg-destructive/90 animate-record-pulse scale-110"
								: "bg-primary hover:bg-primary/90 hover:scale-105 shadow-xl shadow-primary/20"
						}
          `}
				>
					{isProcessing ? (
						<Loader2 className="w-12 h-12 text-white animate-spin" />
					) : isRecording ? (
						<Square className="w-10 h-10 text-white fill-current" />
					) : (
						<Mic className="w-12 h-12 text-white" />
					)}
				</Button>
			</div>

			{/* 2. Texto de Status (AGORA NO FLUXO NORMAL) */}
			<div className="w-64 text-center h-16 flex flex-col items-center justify-start gap-2">
				<p
					className={`text-lg font-medium transition-colors duration-300 ${isRecording ? "text-destructive" : "text-muted-foreground"}`}
				>
					{isProcessing
						? "Processando inteligência..."
						: isRecording
							? "Ouvindo consulta..."
							: "Toque para iniciar"}
				</p>
				{isRecording && (
					<Activity className="w-6 h-6 text-destructive animate-bounce" />
				)}
			</div>

			{/* 3. Dica para o usuário */}
			{!isRecording && !isProcessing && (
				<div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
					<div className="bg-blue-50/80 border border-blue-100 p-4 rounded-xl max-w-md flex items-start gap-3 text-left shadow-sm">
						<div className="bg-blue-100 p-2 rounded-full shrink-0">
							<Lightbulb className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<p className="text-sm font-bold text-blue-900 mb-1">
								Dica para melhor resultado:
							</p>
							<p className="text-sm text-blue-700 leading-relaxed">
								Para uma análise precisa, relate com detalhes o que o paciente
								está sentindo, sintomas e duração.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AudioRecorder;
