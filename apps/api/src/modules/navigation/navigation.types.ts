import * as v from "valibot"

export const CreateNavigationItemSchema = v.object({
  label: v.record(v.string(), v.string()),
  href: v.pipe(v.string(), v.minLength(1)),
  order: v.optional(v.number(), 0),
  parentId: v.optional(v.nullable(v.string()), null),
})

export const UpdateNavigationItemSchema = v.partial(CreateNavigationItemSchema)

export const ReorderSchema = v.object({
  orderedIds: v.array(v.string()),
})

export type CreateNavigationItemInput = v.InferOutput<typeof CreateNavigationItemSchema>
export type UpdateNavigationItemInput = v.InferOutput<typeof UpdateNavigationItemSchema>
export type ReorderInput = v.InferOutput<typeof ReorderSchema>
