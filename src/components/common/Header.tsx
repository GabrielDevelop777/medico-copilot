import { Button } from "@/components/ui/button"; // O alias @ ajuda muito aqui, não precisa mudar
import { HeartHandshake, History, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20">
			<div className="container mx-auto px-3 sm:px-4 h-16 sm:h-20 flex justify-between items-center relative overflow-x-hidden">
				<div
					className={`
            absolute inset-0 flex justify-center items-center gap-2 sm:gap-3
            transition-all duration-500 ease-in-out
            ${isMenuOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}
          `}
				>
					<div className="relative group">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
						<div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-xl">
							<HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
						</div>
					</div>
					<div className="min-w-0">
						<h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-purple-200 bg-clip-text text-transparent truncate">
							Médico Copilot
						</h1>
						<p className="text-[10px] sm:text-xs md:text-sm text-blue-200/60 flex items-center gap-1 sm:gap-2 truncate">
							<Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400 flex-shrink-0" />
							Assistente Clínico com IA
						</p>
					</div>
				</div>

				<div
					className={`
            absolute inset-0 flex justify-center items-center
            transition-all duration-500 ease-in-out md:hidden
            ${isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          `}
				>
					<Button
						variant="ghost"
						size="lg"
						onClick={() => {
							navigate("/historico");
							setIsMenuOpen(false);
						}}
						className="
              group bg-gradient-to-r from-blue-600 to-purple-600 text-white
              shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-105
              transition-all duration-300 ease-in-out rounded-2xl px-6 py-5
            "
					>
						<History className="h-8 w-8 sm:h-10 sm:w-10 mr-3 sm:mr-4 transition-transform duration-300 group-hover:-rotate-12" />
						<span className="text-base sm:text-lg font-semibold">
							Histórico
						</span>
					</Button>
				</div>

				<div className="hidden md:flex ml-auto z-10">
					<Button
						onClick={() => navigate("/historico")}
						className="
              group bg-gradient-to-r from-blue-600 to-purple-600 text-white
              shadow-lg shadow-blue-500/20 hover:shadow-xl hover:scale-105
              transition-all duration-300 ease-in-out rounded-xl px-5 py-4
            "
					>
						<History className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
						<span className="font-medium">Histórico</span>
					</Button>
				</div>

				<div className="md:hidden z-10 ml-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110 rounded-xl w-10 h-10 sm:w-12 sm:h-12"
					>
						{isMenuOpen ? (
							<X className="h-6 w-6 sm:h-7 sm:w-7" />
						) : (
							<Menu className="h-6 w-6 sm:h-7 sm:w-7" />
						)}
					</Button>
				</div>
			</div>
		</header>
	);
};

export default Header;
