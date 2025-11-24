import { useToast } from "@/hooks/use-toast";
import { transcreverAudioService } from "@/services/api";
import { useCallback, useRef, useState } from "react";

export const useAudioRecorder = (
	onRecordingComplete: (blob: Blob, text: string) => void,
) => {
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
			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

				toast({
					title: "⏳ Processando áudio...",
					description: "Aguarde enquanto geramos a inteligência clínica.",
					duration: 4000,
				});

				try {
					const data = await transcreverAudioService(audioBlob);
					if (data?.transcricao) {
						onRecordingComplete(audioBlob, data.transcricao);
					}
				} catch (error) {
					console.error(error);
					toast({
						title: "Erro",
						description: "Falha na transcrição.",
						variant: "destructive",
						duration: 3000,
					});
				}

				// Importante: Parar todas as tracks para desligar a luz da câmera/mic
				stream.getTracks().forEach((t) => t.stop());
			};

			mediaRecorder.start(1000);
			mediaRecorderRef.current = mediaRecorder;
			setIsRecording(true);

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

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current?.state !== "inactive") {
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		}
	}, []);

	return {
		isRecording,
		startRecording,
		stopRecording,
	};
};
