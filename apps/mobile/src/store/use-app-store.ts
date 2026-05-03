import { create } from "zustand";
import type { LanguageCode } from "@kahf/domain";

type AppStore = {
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (language: LanguageCode) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  selectedLanguage: "en",
  setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
}));
