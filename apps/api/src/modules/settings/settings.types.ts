import { type Static, t } from "elysia";

export const SetSettingSchema = t.Object({
	value: t.Unknown(),
});

export type SetSettingInput = Static<typeof SetSettingSchema>;
