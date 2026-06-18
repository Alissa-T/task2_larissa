const emailService = require("../src/utils/emailService");

describe("Email Unit Test 05", () => {
	test("5. emailService.sendEmail falha suavemente se não existir auth do Gmail", async () => {
		const userBkp = process.env.EMAIL_USER;
		const passBkp = process.env.EMAIL_PASS;
		delete process.env.EMAIL_USER;
		delete process.env.EMAIL_PASS;

		const result = await emailService.sendEmail(
			"test@test.com",
			"Subject",
			"Text",
		);
		expect(result).toBe(false);

		process.env.EMAIL_USER = userBkp;
		process.env.EMAIL_PASS = passBkp;
	});
});
