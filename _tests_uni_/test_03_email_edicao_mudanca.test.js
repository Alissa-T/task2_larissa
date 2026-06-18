const { templateEdicao } = require("../src/utils/emailTemplate");

describe("Email Unit Test 03", () => {
	const mockLancamento = {
		id: 1,
		descricao: "Test Item",
		data_lancamento: "2026-04-15",
		valor: 1500.5,
		tipo_lancamento: "receita",
	};

	test("3. templateEdicao deve listar Antes e Depois se houver mudança de valor", () => {
		const depois = { ...mockLancamento, valor: 2000.0 };
		const output = templateEdicao(mockLancamento, depois);

		expect(output).toContain("Lançamento atualizado");
		expect(output).toContain("1.500,50");
		expect(output).toContain("2.000,00");
		expect(output).not.toContain(
			"Nenhuma alteração de valor de campo detectada",
		);
	});
});
