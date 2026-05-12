import { Elysia } from "elysia";
import { collectionsController } from "./collections.controller";

export const collectionsModule = new Elysia().use(collectionsController);
