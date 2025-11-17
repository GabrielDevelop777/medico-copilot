import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Calendar, Clock, Copy, Loader2, PhoneOff, Video } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const Teleconsulta = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { roomName } = useParams<{ roomName: string }>();

	// Função para "desligar" e voltar para a home
	const handleLeaveCall = () => {
		navigate("/");
	};

	// Função para copiar o link de convite
	const handleCopyLink = () => {
		const inviteLink = window.location.href;
		navigator.clipboard
			.writeText(inviteLink)
			.then(() => {
				toast({
					title: "✅ Link Copiado!",
					description: "O link de convite está na sua área de transferência.",
					duration: 3000,
				});
			})
			.catch((err) => {
				console.error("Falha ao copiar link: ", err);
			});
	};

	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
			<ParticleBackground />

			{/* Grid pattern overlay */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

			<div className="relative z-10 flex flex-col h-screen p-6 md:p-8">
				{/* Header Minimalista e Profissional */}
				<div className="bg-slate-900/80 backdrop-blur-lg border border-slate-800/50 rounded-xl shadow-xl mb-6">
					<div className="flex flex-col lg:flex-row items-stretch">
						{/* Info da Sala */}
						<div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-slate-800/50">
							<div className="flex items-start gap-4">
								<div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20 flex-shrink-0">
									<Video className="h-6 w-6 text-white" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3 mb-2">
										<h1 className="text-lg font-bold text-white">
											Teleconsulta Médica
										</h1>
										<span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 text-xs font-semibold rounded-md border border-blue-600/30 uppercase tracking-wider">
											Ativa
										</span>
									</div>
									<div className="space-y-1.5">
										<div className="flex items-center gap-2 text-sm text-slate-400">
											<Calendar className="h-3.5 w-3.5" />
											<span className="font-medium">Sala:</span>
											<span className="text-blue-400 font-mono text-xs break-all">
												{roomName}
											</span>
										</div>
										<div className="flex items-center gap-2 text-sm text-slate-400">
											<Clock className="h-3.5 w-3.5" />
											<span>Sessão iniciada</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Ações */}
						<div className="flex flex-col sm:flex-row lg:flex-col justify-center gap-3 p-6 bg-slate-900/50">
							<Button
								variant="outline"
								onClick={handleCopyLink}
								className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 rounded-lg h-11 px-6 font-medium"
							>
								<Copy className="h-4 w-4 mr-2" />
								Copiar Link
							</Button>
							<Button
								variant="destructive"
								onClick={handleLeaveCall}
								className="bg-red-600 hover:bg-red-700 border-0 shadow-lg shadow-red-600/20 rounded-lg h-11 px-6 font-medium"
							>
								<PhoneOff className="h-4 w-4 mr-2" />
								Encerrar
							</Button>
						</div>
					</div>
				</div>

				{/* Frame da Videochamada */}
				<div className="flex-1 relative">
					<div className="h-full bg-slate-900/80 backdrop-blur-lg border border-slate-800/50 rounded-xl shadow-2xl overflow-hidden">
						{/* Header interno do vídeo */}
						<div className="bg-slate-950/90 border-b border-slate-800/50 px-4 py-2.5 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
								<span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
									Em Transmissão
								</span>
							</div>
							<div className="text-xs text-slate-500 font-mono">
								Dr. Assistente Copilot
							</div>
						</div>

						{/* Área do vídeo */}
						<div className="h-[calc(100%-44px)] w-full bg-slate-950">
							{!roomName ? (
								<div className="flex h-full w-full items-center justify-center">
									<div className="text-center space-y-4 p-8">
										<div className="p-6 bg-red-600/10 border border-red-600/30 rounded-xl inline-block">
											<Video className="h-12 w-12 text-red-400" />
										</div>
										<h2 className="text-xl font-semibold text-red-400">
											Erro: Nome da sala não fornecido
										</h2>
										<p className="text-sm text-slate-500">
											Verifique o link e tente novamente
										</p>
									</div>
								</div>
							) : (
								<JitsiMeeting
									roomName={roomName}
									configOverwrite={{
										startWithAudioMuted: false,
										startWithVideoMuted: false,
										prejoinPageEnabled: false,
									}}
									interfaceConfigOverwrite={{
										SHOW_LEAVE_PAGE: false,
										SHOW_CHROME_EXTENSION_BANNER: false,
										SETTINGS_SECTIONS: ["devices", "profile", "sounds"],
										TOOLBAR_BUTTONS: [
											"camera",
											"chat",
											"closedcaptions",
											"desktop",
											"fullscreen",
											"hangup",
											"microphone",
											"profile",
											"raisehand",
											"settings",
											"tileview",
										],
									}}
									userInfo={{
										displayName: "Dr. Assistente Copilot",
									}}
									getIFrameRef={(iframeRef) => {
										iframeRef.style.height = "100%";
										iframeRef.style.width = "100%";
									}}
									onReadyToClose={handleLeaveCall}
									spinner={() => (
										<div className="flex h-full w-full items-center justify-center bg-slate-950">
											<div className="text-center space-y-4">
												<Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
												<div className="space-y-2">
													<h3 className="text-xl font-semibold text-white">
														Conectando à teleconsulta
													</h3>
													<p className="text-sm text-slate-400">
														Configurando ambiente seguro...
													</p>
												</div>
											</div>
										</div>
									)}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Teleconsulta;
