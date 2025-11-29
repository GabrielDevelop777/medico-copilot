import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	appType: "spa",
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [react()].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
