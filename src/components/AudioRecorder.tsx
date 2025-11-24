import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder"; // Importe o novo hook
import { Activity, Lightbulb, Loader2, Mic, Square } from "lucide-react";
import type React from "react";

interface AudioRecorderProps {
	onRecordingComplete: (audioBlob: Blob, transcricao: string) => void;
	isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
	onRecordingComplete,
	isProcessing,
}) => {
	// Toda a lógica complexa foi substituída por essa linha simples:
	const { isRecording, startRecording, stopRecording } =
		useAudioRecorder(onRecordingComplete);

	return (
		<div className="flex flex-col items-center justify-center py-10 w-full">
			{/* 1. Área do Botão */}
			<div className="relative mb-6">
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

			{/* 2. Texto de Status */}
			<div className="w-64 text-center h-16 flex flex-col items-center justify-start gap-2">
				<p
					className={`text-lg font-medium transition-colors duration-300 ${
						isRecording ? "text-destructive" : "text-muted-foreground"
					}`}
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
