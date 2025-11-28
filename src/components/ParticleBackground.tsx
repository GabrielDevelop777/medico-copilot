import { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const ParticleBackground = () => {
	const particlesInit = useCallback(async (engine: any) => {
		await loadSlim(engine);
	}, []);

	const particlesLoaded = useCallback(async (container: any) => {}, []);

	// Configuração das partículas (o "Plexus" médico)
	const options = useMemo(
		() => ({
			background: {
				color: {
					value: "transparent",
				},
			},
			fpsLimit: 60,
			interactivity: {
				events: {
					onHover: {
						enable: true,
						mode: "grab", // Efeito de "segurar" as partículas
					},
				},
				modes: {
					grab: {
						distance: 140,
						links: {
							opacity: 0.8,
						},
					},
				},
			},
			particles: {
				color: {
					value: "#ffffff", // Partículas brancas
				},
				links: {
					color: "#ffffff", // Linhas de conexão brancas
					distance: 150,
					enable: true,
					opacity: 0.2, // Opacidade fraca para ser sutil
					width: 1,
				},
				collisions: {
					enable: false,
				},
				move: {
					direction: "none",
					enable: true,
					outModes: {
						default: "bounce",
					},
					random: false,
					speed: 0.5, // Velocidade lenta
					straight: false,
				},
				number: {
					density: {
						enable: true,
						area: 800,
					},
					value: 80, // Quantidade de partículas
				},
				opacity: {
					value: 0.3, // Opacidade das partículas
				},
				shape: {
					type: "circle",
				},
				size: {
					value: { min: 1, max: 3 },
				},
			},
			detectRetina: true,
			// Posição: Fica fixo no fundo
			style: {
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 0, // Camada 0 (fundo)
			},
		}),
		[],
	);

	return (
		<Particles
			id="tsparticles"
			init={particlesInit}
			loaded={particlesLoaded}
			options={options}
		/>
	);
};

export default ParticleBackground;
