import * as v from "valibot"

export const CreatePageSchema = v.object({
  slug: v.pipe(v.string(), v.minLength(1), v.regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")),
  isHomepage: v.optional(v.boolean(), false),
})

export const UpdatePageSchema = v.partial(CreatePageSchema)

export const UpsertTranslationSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  content: v.unknown(),
})

export type CreatePageInput = v.InferOutput<typeof CreatePageSchema>
export type UpdatePageInput = v.InferOutput<typeof UpdatePageSchema>
export type UpsertTranslationInput = v.InferOutput<typeof UpsertTranslationSchema>
