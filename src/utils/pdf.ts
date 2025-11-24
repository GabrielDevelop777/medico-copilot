import jsPDF from "jspdf";

export interface AtestadoData {
	tipo: "ATESTADO";
	nomePaciente: string;
	diasAfastamento: string;
	dataInicio: string;
	cid: string;
	nomeMedico: string;
	crm: string;
}

export const gerarAtestadoPDF = (data: AtestadoData) => {
	const doc = new jsPDF();

	// Cabeçalho
	doc.setFontSize(22);
	doc.setFont("helvetica", "bold");
	doc.text("ATESTADO MÉDICO", 105, 30, { align: "center" });

	// Corpo do Atestado
	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");

	const textoCorpo = `Atesto para os devidos fins que o(a) Sr(a) ${data.nomePaciente} necessita de ${data.diasAfastamento} de afastamento de suas atividades laborais, a partir de ${data.dataInicio}, por motivos de doença.`;

	const splitText = doc.splitTextToSize(textoCorpo, 170);
	doc.text(splitText, 20, 50);

	if (data.cid) {
		doc.text(`CID: ${data.cid}`, 20, 70);
	}

	const dataAtual = new Date().toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
	doc.text(`Duque de Caxias, ${dataAtual}.`, 105, 100, { align: "center" });

	doc.text("___________________________________", 105, 120, {
		align: "center",
	});
	doc.text(data.nomeMedico, 105, 125, { align: "center" });
	doc.text(data.crm, 105, 130, { align: "center" });

	doc.save("atestado_medico.pdf");
};
