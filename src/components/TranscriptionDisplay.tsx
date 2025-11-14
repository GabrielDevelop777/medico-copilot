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

// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { FileText } from 'lucide-react';

// interface TranscriptionDisplayProps {
//   transcricao: string | null;
// }

// const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ transcricao }) => {
//   if (!transcricao) {
//     return null;
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
//       <Card className="border-none shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden backdrop-blur-sm">
//         {/* Header com Gradiente Profissional */}
//         <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 pb-4">
//           <CardTitle className="flex items-center gap-3 text-white">
//             <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
//               <FileText className="h-5 w-5" />
//             </div>
//             <div>
//               <h3 className="text-lg font-bold">Transcrição da Consulta</h3>
//               <p className="text-slate-200 text-sm font-normal mt-1">
//                 Relato capturado em tempo real
//               </p>
//             </div>
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="p-6">
//           {/* Container com gradiente sutil */}
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-inner">
//             <ScrollArea className="h-[180px] pr-3">
//               <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
//                 {transcricao}
//               </p>
//             </ScrollArea>
//           </div>

//           {/* Badge de informação */}
//           <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
//             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
//             <span>Transcrição processada com IA</span>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TranscriptionDisplay;
