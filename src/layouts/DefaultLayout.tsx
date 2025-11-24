import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import Header from "@/components/common/Header";
import { Outlet } from "react-router-dom"; // Onde o conteúdo da página será renderizado

const DefaultLayout = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-x-hidden">
			{/* Efeitos de Fundo Centralizados */}
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
			<div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
			<div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20 pointer-events-none"></div>

			<ParticleBackground />

			<div className="relative z-10 min-h-screen flex flex-col">
				<Header />

				{/* Aqui entra o conteúdo de cada página (Consulta, Histórico, etc) */}
				<main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl flex-1">
					<Outlet />
				</main>

				<Footer />
			</div>
		</div>
	);
};

export default DefaultLayout;
