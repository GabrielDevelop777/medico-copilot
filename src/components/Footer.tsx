import { Github, HeartHandshake, Linkedin, Twitter } from "lucide-react";
import React from "react";

const Footer = () => {
	return (
		<footer className="relative z-10 w-full bg-slate-900/40 text-gray-300 backdrop-blur-md border-t border-primary/20 mt-24">
			<div className="container mx-auto px-6 py-12 max-w-6xl">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
					{/* Coluna 1: Logo e Descrição */}
					<div className="col-span-1 md:col-span-3 lg:col-span-1">
						<div className="flex items-center gap-3 mb-4">
							<div className="bg-gradient-to-br from-primary to-primary-hover w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
								<HeartHandshake className="h-6 w-6 text-white" />
							</div>
							<span className="text-2xl font-bold text-white">
								Médico Copilot
							</span>
						</div>
						<p className="text-sm text-gray-400 leading-relaxed">
							Revolucionando o atendimento clínico com o poder da Inteligência
							Artificial.
						</p>
					</div>

					{/* Coluna 2: Links Rápidos */}
					<div>
						<h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
							Navegação
						</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="/"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Nova Consulta
								</a>
							</li>
							<li>
								<a
									href="/historico"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Histórico
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Exportar Dados
								</a>
							</li>
						</ul>
					</div>

					{/* Coluna 3: Legal */}
					<div>
						<h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
							Legal
						</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Política de Privacidade
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Termos de Uso
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-gray-400 hover:text-primary transition-colors"
								>
									Conformidade (HIPAA)
								</a>
							</li>
						</ul>
					</div>

					{/* Coluna 4: Social */}
					<div>
						<h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
							Conecte-se
						</h3>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-gray-400 hover:text-primary transition-colors"
							>
								<Github className="h-6 w-6" />
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-primary transition-colors"
							>
								<Linkedin className="h-6 w-6" />
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-primary transition-colors"
							>
								<Twitter className="h-6 w-6" />
							</a>
						</div>
					</div>
				</div>

				{/* Linha de Copyright */}
				<div className="border-t border-gray-700/50 mt-12 pt-8 text-center">
					<p className="text-sm text-gray-500">
						&copy; {new Date().getFullYear()} Médico Copilot. Todos os direitos
						reservados.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
