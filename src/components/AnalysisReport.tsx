import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Pill, FileText, AlertCircle } from 'lucide-react';

interface Analise {
  diagnosticoSugerido: string;
  examesRecomendados: string[];
  medicamentosSugeridos: string[];
  observacoes?: string;
}

const AnalysisReport = ({ analise }: { analise: Analise }) => {
  return (
    // Aqui aplicamos a animação personalizada que criamos no CSS
    <div id="relatorio-para-pdf" className="w-full max-w-4xl mx-auto mt-8 animate-medical-reveal">
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
        
        {/* Cabeçalho com Gradiente Linear Profissional */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-8 w-8 opacity-90" />
            <h2 className="text-2xl font-bold tracking-tight">Análise Clínica IA</h2>
          </div>
          <p className="text-blue-100 opacity-90 pl-11">Diagnóstico gerado em tempo real</p>
        </div>

        <CardContent className="p-8 grid gap-8">
          
          {/* Diagnóstico Principal - Destaque */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-blue-800 font-semibold mb-2 text-lg">Diagnóstico Sugerido</h3>
            <p className="text-2xl font-medium text-slate-800 leading-relaxed">
              {analise.diagnosticoSugerido}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Medicamentos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-lg border-b pb-2 border-purple-100">
                <Pill className="h-5 w-5" />
                <h3>Medicamentos</h3>
              </div>
              <ul className="space-y-3">
                {analise.medicamentosSugeridos.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-purple-50/50 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exames */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-lg border-b pb-2 border-emerald-100">
                <FileText className="h-5 w-5" />
                <h3>Exames Recomendados</h3>
              </div>
              <ul className="space-y-3">
                {analise.examesRecomendados.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Observações */}
          {analise.observacoes && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-2">
              <div className="flex items-center gap-2 text-slate-600 font-semibold mb-2">
                <AlertCircle className="h-5 w-5" />
                <h3>Observações Clínicas</h3>
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "{analise.observacoes}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisReport;