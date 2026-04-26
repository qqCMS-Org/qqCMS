import { authPlugin } from "@shared/middleware/auth.middleware";
import { Elysia } from "elysia";
import {
	createNavigationItem,
	deleteNavigationItem,
	listNavigationItems,
	reorderItems,
	updateNavigationItem,
} from "./navigation.service";
import { CreateNavigationItemSchema, ReorderSchema, UpdateNavigationItemSchema } from "./navigation.types";

export const navigationController = new Elysia({ prefix: "/navigation" })
	.use(authPlugin)
	.get("/", () => listNavigationItems())
	.post("/", ({ body }) => createNavigationItem(body), {
		body: CreateNavigationItemSchema,
		requireAuth: true,
	})
	.patch("/reorder", ({ body }) => reorderItems(body), {
		body: ReorderSchema,
		requireAuth: true,
	})
	.patch("/:id", ({ params, body }) => updateNavigationItem(params.id, body), {
		body: UpdateNavigationItemSchema,
		requireAuth: true,
	})
	.delete(
		"/:id",
		async ({ params, set }) => {
			await deleteNavigationItem(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	);
