import { randomUUID } from "crypto"
import {
  getSetting as getSettingFromDb,
  getSettings as getSettingsFromDb,
  upsertSetting as upsertSettingInDb,
} from "@repository/settings"

export const listSettings = () => getSettingsFromDb()

export const setSetting = (key: string, value: unknown) =>
  upsertSettingInDb({
    id: randomUUID(),
    key,
    value,
  })
