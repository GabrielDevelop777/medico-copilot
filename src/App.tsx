import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Consulta from "./pages/Consulta";
import Historico from "./pages/Historico";
import NotFoundPage from "./pages/NotFound";
import Teleconsulta from "./pages/Teleconsulta";

const App = () => (
	<BrowserRouter>
		<Routes>
			{/* Rotas Válidas */}
			<Route path="/" element={<Consulta />} />
			<Route path="/historico" element={<Historico />} />

			{/* O ':roomName' é o parâmetro dinâmico da sala */}
			<Route path="/teleconsulta/:roomName" element={<Teleconsulta />} />

			{/* Rota "Pega-Tudo" (Catch-all) */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
		<Toaster />
	</BrowserRouter>
);

export default App;
