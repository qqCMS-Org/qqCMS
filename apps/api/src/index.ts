import { Logger } from "@core/Logger";
import { config } from "@shared/config";
import { Elysia } from "elysia";

const app = new Elysia().listen(config.port);

Logger.info(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
