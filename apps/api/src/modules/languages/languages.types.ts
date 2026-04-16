import * as v from "valibot"

export const CreateLanguageSchema = v.object({
  code: v.pipe(v.string(), v.minLength(2), v.maxLength(10)),
  label: v.pipe(v.string(), v.minLength(1)),
  isActive: v.optional(v.boolean(), true),
})

export const UpdateLanguageSchema = v.partial(
  v.pick(CreateLanguageSchema, ["label", "isActive"]),
)

export type CreateLanguageInput = v.InferOutput<typeof CreateLanguageSchema>
export type UpdateLanguageInput = v.InferOutput<typeof UpdateLanguageSchema>
