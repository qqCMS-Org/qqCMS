import { Elysia } from "elysia";
import { settingsController } from "./settings.controller";

export const settingsModule = new Elysia().use(settingsController);
