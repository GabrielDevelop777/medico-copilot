import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import type React from "react";

interface TranscriptionDisplayProps {
	transcricao: string | null;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
	transcricao,
}) => {
	if (!transcricao) {
		return null;
	}

	return (
		<Card className="bg-card border-border shadow-md">
			<CardHeader className="border-b border-border/50">
				<CardTitle className="flex items-center gap-2 text-lg">
					<FileText className="h-5 w-5 text-primary" />
					Transcrição da Consulta
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<ScrollArea className="h-[200px] w-full rounded-md border border-border/30 bg-muted/30 p-4">
					<p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
						{transcricao}
					</p>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};

export default TranscriptionDisplay;
