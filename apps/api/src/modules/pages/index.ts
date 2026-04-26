import { Elysia } from "elysia";
import { pagesController } from "./pages.controller";

export const pagesModule = new Elysia().use(pagesController);
