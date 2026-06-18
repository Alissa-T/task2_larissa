const { templateExclusao } = require("../src/utils/emailTemplate");

describe("Email Unit Test 02", () => {
	const mockLancamento = {
		id: 1,
		descricao: "Test Item",
		data_lancamento: "2026-04-15",
		valor: 1500.5,
		tipo_lancamento: "receita",
	};

	test("2. templateExclusao deve retornar um HTML informando remoção", () => {
		const output = templateExclusao(mockLancamento);
		expect(output).toContain("Lançamento excluído");
		expect(output).toContain("removido");
		expect(output).toContain("Test Item");
	});
});
