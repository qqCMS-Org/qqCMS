import { compare } from "bcryptjs"
import { config } from "@shared/config"

export const login = async (login: string, password: string) => {
  const isLoginValid = login === config.adminLogin
  const isPasswordValid = await compare(password, config.adminPasswordHash)

  if (!isLoginValid || !isPasswordValid) {
    return null
  }

  return { login }
}
