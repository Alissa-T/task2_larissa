const { templateCriacao } = require("../src/utils/emailTemplate");

describe("Email Unit Test 01", () => {
	const mockLancamento = {
		id: 1,
		descricao: "Test Item",
		data_lancamento: "2026-04-15",
		valor: 1500.5,
		tipo_lancamento: "receita",
	};

	test("1. templateCriacao deve retornar um HTML contendo as propriedades vitais", () => {
		const output = templateCriacao(mockLancamento);
		expect(output).toContain("Lançamento registrado");
		expect(output).toContain("Test Item");
		expect(output).toContain("1.500,50");
		expect(output).toContain("receita");
	});
});
