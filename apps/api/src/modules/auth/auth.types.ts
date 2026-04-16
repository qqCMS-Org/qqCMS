import * as v from "valibot"

export const LoginSchema = v.object({
  login: v.pipe(v.string(), v.minLength(1)),
  password: v.pipe(v.string(), v.minLength(1)),
})

export type LoginInput = v.InferOutput<typeof LoginSchema>
