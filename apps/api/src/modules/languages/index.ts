import { Elysia } from "elysia";
import { languagesController } from "./languages.controller";

export const languagesModule = new Elysia().use(languagesController);
