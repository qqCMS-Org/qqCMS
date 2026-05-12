import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockCompare = mock(() => Promise.resolve(true));

mock.module("bcryptjs", () => ({
	compare: mockCompare,
}));

mock.module("@api/config", () => ({
	config: {
		admin: {
			login: "admin",
			passwordHash: "$2b$10$hashedpassword",
		},
		jwtSecret: "test-secret",
		corsOrigins: [],
		databaseUrl: "",
		uploadDir: "/tmp/uploads",
		publicClientUrl: "",
		port: 3000,
		debug: false,
	},
}));

const { login } = await import("./auth.service");

describe("login", () => {
	beforeEach(() => {
		mockCompare.mockReset();
	});

	it("returns user object on valid credentials", async () => {
		mockCompare.mockResolvedValueOnce(true);

		const result = await login("admin", "correctpassword");

		expect(result).toEqual({ login: "admin" });
	});

	it("returns null when login does not match", async () => {
		mockCompare.mockResolvedValueOnce(true);

		const result = await login("wronglogin", "anypassword");

		expect(result).toBeNull();
	});

	it("returns null when password does not match", async () => {
		mockCompare.mockResolvedValueOnce(false);

		const result = await login("admin", "wrongpassword");

		expect(result).toBeNull();
	});
});
