import { Toaster } from "@/components/ui/toaster"; // <--- IMPORTANTE: Importar isso
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Consulta from "./pages/Consulta";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";

const App = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Consulta />} />
			<Route path="/historico" element={<Historico />} />

			<Route path="*" element={<NotFound />} />
		</Routes>
		<Toaster />
	</BrowserRouter>
);

export default App;
