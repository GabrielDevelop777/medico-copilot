import { Toaster } from "@/components/ui/toaster";
import DefaultLayout from "@/layouts/DefaultLayout"; // Importe o Layout
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Consulta from "./pages/Consulta";
import Historico from "./pages/Historico";
import NotFoundPage from "./pages/NotFound";
import Teleconsulta from "./pages/Teleconsulta";

const App = () => (
	<BrowserRouter>
		<Routes>
			{/* Grupo de rotas que usam o Layout Padrão (Header, Footer, Background) */}
			<Route element={<DefaultLayout />}>
				<Route path="/" element={<Consulta />} />
				<Route path="/historico" element={<Historico />} />
			</Route>

			{/* Rotas que NÃO usam o Layout Padrão (Tela cheia, designs diferentes) */}
			<Route path="/teleconsulta/:roomName" element={<Teleconsulta />} />
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
		<Toaster />
	</BrowserRouter>
);

export default App;
