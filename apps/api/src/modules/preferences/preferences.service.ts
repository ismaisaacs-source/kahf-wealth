import { Injectable } from "@nestjs/common";

@Injectable()
export class PreferencesService {
  getPreferences() {
    return {
      language: "en",
      enableBiometricLock: true,
      zakatReminders: true,
      prayerReminders: true,
    };
  }
}
