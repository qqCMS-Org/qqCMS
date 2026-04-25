import { Elysia } from "elysia";
import { mediaController } from "./media.controller";

export const mediaModule = new Elysia().use(mediaController);
