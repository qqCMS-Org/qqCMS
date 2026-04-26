import { Elysia } from "elysia";
import { navigationController } from "./navigation.controller";

export const navigationModule = new Elysia().use(navigationController);
