import { config } from "@api/config";
import { compare } from "bcryptjs";

export const login = async (loginInput: string, password: string) => {
	if (loginInput !== config.admin.login) return null;

	const isValid = await compare(password, config.admin.passwordHash);
	return isValid ? { login: loginInput } : null;
};
