const PDFDocument = require("pdfkit");
const pool = require("../config/database");

// Helper: formatar data brasileira
function formatDateBR(dateStr) {
	const d = new Date(dateStr);
	const day = String(d.getDate()).padStart(2, "0");
	const month = String(d.getMonth() + 1).padStart(2, "0");
	const year = d.getFullYear();
	return `${day}/${month}/${year}`;
}

// Helper: formatar moeda brasileira
function formatCurrencyBR(value) {
	return `R$ ${parseFloat(value).toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

// ===== PDF INDIVIDUAL de um lançamento =====
const exportarIndividual = async (req, res) => {
	try {
		const { id } = req.params;
		const result = await pool.query(
			"SELECT * FROM lancamento WHERE id = $1 AND situacao = 'ativo'",
			[id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Lançamento não encontrado" });
		}

		const l = result.rows[0];

		const doc = new PDFDocument({ size: "A4", margin: 50 });

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=lancamento_${l.id}.pdf`,
		);
		doc.pipe(res);

		// ===== CABEÇALHO com faixa roxa =====
		doc.rect(0, 0, 595, 100).fill("#7c3aed");

		doc
			.fontSize(24)
			.fill("#ffffff")
			.font("Helvetica-Bold")
			.text("Comprovante de Lançamento", 0, 30, { align: "center" });

		doc
			.fontSize(11)
			.fill("#ddd6fe")
			.font("Helvetica")
			.text("Sistema Financeiro", 0, 62, { align: "center" });

		// ===== LINHA DECORATIVA =====
		doc
			.moveTo(50, 115)
			.lineTo(545, 115)
			.strokeColor("#a78bfa")
			.lineWidth(1)
			.stroke();

		// ===== DADOS DO LANÇAMENTO =====
		const fields = [
			{ label: "ID", value: `#${l.id}` },
			{ label: "Descrição", value: l.descricao },
			{ label: "Data", value: formatDateBR(l.data_lancamento) },
			{
				label: "Valor",
				value: `${l.tipo_lancamento === "despesa" ? "- " : "+ "}${formatCurrencyBR(l.valor)}`,
			},
			{
				label: "Tipo",
				value:
					l.tipo_lancamento.charAt(0).toUpperCase() +
					l.tipo_lancamento.slice(1),
			},
			{ label: "Situação", value: "Ativo" },
		];

		let y = 140;
		const leftX = 70;
		const valueX = 180;

		fields.forEach((field) => {
			// Label
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.fill("#6b7280")
				.text(`${field.label}:`, leftX, y);

			// Value com cor especial para Valor
			if (field.label === "Valor") {
				const color = l.tipo_lancamento === "receita" ? "#059669" : "#dc2626";
				doc
					.fontSize(12)
					.font("Helvetica-Bold")
					.fill(color)
					.text(field.value, valueX, y);
			} else if (field.label === "Tipo") {
				const color = l.tipo_lancamento === "receita" ? "#059669" : "#dc2626";
				doc
					.fontSize(11)
					.font("Helvetica")
					.fill(color)
					.text(field.value, valueX, y);
			} else {
				doc
					.fontSize(11)
					.font("Helvetica")
					.fill("#1e1b4b")
					.text(field.value, valueX, y);
			}

			y += 30;
		});

		// ===== LINHA INFERIOR =====
		y += 15;
		doc
			.moveTo(50, y)
			.lineTo(545, y)
			.strokeColor("#a78bfa")
			.lineWidth(1)
			.stroke();

		// ===== RODAPÉ =====
		y += 15;
		doc
			.fontSize(8)
			.font("Helvetica-Oblique")
			.fill("#9ca3af")
			.text(`Documento gerado em ${new Date().toLocaleString("pt-BR")}`, 0, y, {
				align: "center",
			});

		doc.end();
	} catch (error) {
		console.error("Erro ao gerar PDF individual:", error);
		res.status(500).json({ error: "Erro ao gerar PDF" });
	}
};

// ===== PDF DE TODOS OS LANÇAMENTOS (estilo planilha) =====
const exportarTodos = async (req, res) => {
	try {
		const { tipo, dataInicio, dataFim } = req.query;

		let query = "SELECT * FROM lancamento WHERE situacao = 'ativo'";
		const params = [];
		let paramIndex = 1;

		if (tipo && ["receita", "despesa"].includes(tipo)) {
			query += ` AND tipo_lancamento = $${paramIndex++}`;
			params.push(tipo);
		}

		if (dataInicio) {
			query += ` AND data_lancamento >= $${paramIndex++}`;
			params.push(dataInicio);
		}

		if (dataFim) {
			query += ` AND data_lancamento <= $${paramIndex++}`;
			params.push(`${dataFim}T23:59:59`);
		}

		query += " ORDER BY data_lancamento DESC";

		const result = await pool.query(query, params);
		const lancamentos = result.rows;

		if (lancamentos.length === 0) {
			return res
				.status(404)
				.json({ error: "Nenhum lançamento encontrado para exportar" });
		}

		const doc = new PDFDocument({
			size: "A4",
			layout: "landscape",
			margin: 40,
		});

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			"attachment; filename=lancamentos_financeiros.pdf",
		);
		doc.pipe(res);

		// ===== CABEÇALHO =====
		doc.rect(0, 0, 842, 80).fill("#7c3aed");

		doc
			.fontSize(20)
			.fill("#ffffff")
			.font("Helvetica-Bold")
			.text("Relatório de Lançamentos Financeiros", 0, 22, { align: "center" });

		// Período
		let periodoText = "Sistema Financeiro";
		if (dataInicio || dataFim) {
			const de = dataInicio ? formatDateBR(dataInicio) : "...";
			const ate = dataFim ? formatDateBR(dataFim) : "...";
			periodoText += `  |  Período: ${de} a ${ate}`;
		}
		if (tipo) {
			periodoText += `  |  Filtro: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}s`;
		}
		doc
			.fontSize(10)
			.fill("#ddd6fe")
			.font("Helvetica")
			.text(periodoText, 0, 50, { align: "center" });

		// ===== TABELA =====
		const colWidths = [45, 310, 80, 100, 70];
		const headers = ["ID", "Descrição", "Data", "Valor", "Tipo"];
		const startX = 50;
		let tableY = 100;

		// Header da tabela
		doc
			.rect(startX, tableY, colWidths.reduce((a, b) => a + b, 0) + 80, 28)
			.fill("#7c3aed");

		let hx = startX + 10;
		headers.forEach((header, i) => {
			doc
				.fontSize(9)
				.font("Helvetica-Bold")
				.fill("#ffffff")
				.text(header, hx, tableY + 9, {
					width: colWidths[i],
					align: i === 3 ? "right" : "left",
				});
			hx += colWidths[i] + 16;
		});

		tableY += 28;

		// Linhas da tabela
		lancamentos.forEach((l, index) => {
			// Verificar se precisa de nova página
			if (tableY > 480) {
				doc.addPage();
				tableY = 50;

				// Repetir header na nova página
				doc
					.rect(startX, tableY, colWidths.reduce((a, b) => a + b, 0) + 80, 28)
					.fill("#7c3aed");
				let hx2 = startX + 10;
				headers.forEach((header, i) => {
					doc
						.fontSize(9)
						.font("Helvetica-Bold")
						.fill("#ffffff")
						.text(header, hx2, tableY + 9, {
							width: colWidths[i],
							align: i === 3 ? "right" : "left",
						});
					hx2 += colWidths[i] + 16;
				});
				tableY += 28;
			}

			// Fundo alternado
			if (index % 2 === 0) {
				doc
					.rect(startX, tableY, colWidths.reduce((a, b) => a + b, 0) + 80, 26)
					.fill("#f5f3ff");
			} else {
				doc
					.rect(startX, tableY, colWidths.reduce((a, b) => a + b, 0) + 80, 26)
					.fill("#ffffff");
			}

			// Linha de separação
			doc
				.moveTo(startX, tableY + 26)
				.lineTo(startX + colWidths.reduce((a, b) => a + b, 0) + 80, tableY + 26)
				.strokeColor("#e5e7eb")
				.lineWidth(0.5)
				.stroke();

			let rx = startX + 10;

			// ID
			doc
				.fontSize(9)
				.font("Helvetica")
				.fill("#1e1b4b")
				.text(`#${l.id}`, rx, tableY + 8, { width: colWidths[0] });
			rx += colWidths[0] + 16;

			// Descrição
			doc
				.fontSize(9)
				.font("Helvetica")
				.fill("#1e1b4b")
				.text(l.descricao, rx, tableY + 8, { width: colWidths[1] });
			rx += colWidths[1] + 16;

			// Data
			doc
				.fontSize(9)
				.font("Helvetica")
				.fill("#1e1b4b")
				.text(formatDateBR(l.data_lancamento), rx, tableY + 8, {
					width: colWidths[2],
				});
			rx += colWidths[2] + 16;

			// Valor (colorido)
			const valorColor =
				l.tipo_lancamento === "receita" ? "#059669" : "#dc2626";
			const valorPrefix = l.tipo_lancamento === "despesa" ? "- " : "+ ";
			doc
				.fontSize(9)
				.font("Helvetica-Bold")
				.fill(valorColor)
				.text(`${valorPrefix}${formatCurrencyBR(l.valor)}`, rx, tableY + 8, {
					width: colWidths[3],
					align: "right",
				});
			rx += colWidths[3] + 16;

			// Tipo (colorido)
			const tipoColor = l.tipo_lancamento === "receita" ? "#059669" : "#dc2626";
			doc
				.fontSize(9)
				.font("Helvetica")
				.fill(tipoColor)
				.text(
					l.tipo_lancamento.charAt(0).toUpperCase() +
						l.tipo_lancamento.slice(1),
					rx,
					tableY + 8,
					{ width: colWidths[4] },
				);

			tableY += 26;
		});

		// ===== RESUMO =====
		tableY += 20;

		// Verificar se cabe na página
		if (tableY > 460) {
			doc.addPage();
			tableY = 50;
		}

		const totalReceitas = lancamentos
			.filter((l) => l.tipo_lancamento === "receita")
			.reduce((sum, l) => sum + parseFloat(l.valor), 0);
		const totalDespesas = lancamentos
			.filter((l) => l.tipo_lancamento === "despesa")
			.reduce((sum, l) => sum + parseFloat(l.valor), 0);
		const saldo = totalReceitas - totalDespesas;

		// Caixa de resumo
		const boxWidth = colWidths.reduce((a, b) => a + b, 0) + 80;
		doc
			.roundedRect(startX, tableY, boxWidth, 50, 5)
			.fill("#f5f3ff")
			.strokeColor("#7c3aed")
			.lineWidth(1)
			.stroke();

		// Total Receitas
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fill("#6b7280")
			.text("Total Receitas:", startX + 20, tableY + 18);
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fill("#059669")
			.text(formatCurrencyBR(totalReceitas), startX + 120, tableY + 18);

		// Total Despesas
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fill("#6b7280")
			.text("Total Despesas:", startX + 230, tableY + 18);
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fill("#dc2626")
			.text(formatCurrencyBR(totalDespesas), startX + 340, tableY + 18);

		// Saldo
		doc
			.fontSize(10)
			.font("Helvetica-Bold")
			.fill("#6b7280")
			.text("Saldo:", startX + 450, tableY + 18);
		const saldoColor = saldo >= 0 ? "#059669" : "#dc2626";
		doc
			.fontSize(12)
			.font("Helvetica-Bold")
			.fill(saldoColor)
			.text(formatCurrencyBR(saldo), startX + 490, tableY + 17);

		// Rodapé
		tableY += 65;
		doc
			.fontSize(8)
			.font("Helvetica-Oblique")
			.fill("#9ca3af")
			.text(
				`${lancamentos.length} lançamento(s) • Exportado em ${new Date().toLocaleString("pt-BR")}`,
				0,
				tableY,
				{ align: "center" },
			);

		doc.end();
	} catch (error) {
		console.error("Erro ao gerar PDF geral:", error);
		res.status(500).json({ error: "Erro ao gerar PDF" });
	}
};

module.exports = { exportarIndividual, exportarTodos };
