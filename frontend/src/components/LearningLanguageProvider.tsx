"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getStoredAuth } from "@/lib/auth-storage";
import {
  addUserLearningLanguage,
  fetchUserLearningLanguages,
  setActiveLearningLanguage,
  type UserLearningLanguage,
} from "@/lib/learning-language-api";
import {
  DEFAULT_LEARNING_LANGUAGE,
  readStoredLearningLanguage,
  writeStoredLearningLanguage,
  type LearningLanguageCode,
} from "@/lib/learning-language";

type LearningLanguageContextValue = {
  languageCode: LearningLanguageCode;
  languages: UserLearningLanguage[];
  loading: boolean;
  setActive: (code: LearningLanguageCode) => Promise<void>;
  addLanguage: (code: LearningLanguageCode) => Promise<void>;
  refresh: () => Promise<void>;
};

const LearningLanguageContext =
  createContext<LearningLanguageContextValue | null>(null);

export function LearningLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languageCode, setLanguageCode] = useState<LearningLanguageCode>(
    DEFAULT_LEARNING_LANGUAGE,
  );
  const [languages, setLanguages] = useState<UserLearningLanguage[]>([]);
  const [loading, setLoading] = useState(true);

  const syncFromList = useCallback((rows: UserLearningLanguage[]) => {
    setLanguages(rows);
    const active =
      rows.find((r) => r.isActive)?.languageCode ??
      readStoredLearningLanguage();
    setLanguageCode(active);
    writeStoredLearningLanguage(active);
    window.dispatchEvent(new Event("datn-learning-language"));
  }, []);

  const refresh = useCallback(async () => {
    if (!getStoredAuth()) {
      const local = readStoredLearningLanguage();
      setLanguageCode(local);
      setLanguages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchUserLearningLanguages();
      syncFromList(rows);
    } catch {
      setLanguageCode(readStoredLearningLanguage());
    } finally {
      setLoading(false);
    }
  }, [syncFromList]);

  useEffect(() => {
    const local = readStoredLearningLanguage();
    setLanguageCode(local);
    void refresh();
    const onAuth = () => void refresh();
    window.addEventListener("datn-auth", onAuth);
    return () => window.removeEventListener("datn-auth", onAuth);
  }, [refresh]);

  const setActive = useCallback(
    async (code: LearningLanguageCode) => {
      writeStoredLearningLanguage(code);
      setLanguageCode(code);
      window.dispatchEvent(new Event("datn-learning-language"));
      if (!getStoredAuth()) return;
      const rows = await setActiveLearningLanguage(code);
      syncFromList(rows);
    },
    [syncFromList],
  );

  const addLanguage = useCallback(
    async (code: LearningLanguageCode) => {
      if (!getStoredAuth()) return;
      const rows = await addUserLearningLanguage(code);
      syncFromList(rows);
    },
    [syncFromList],
  );

  const value = useMemo(
    () => ({
      languageCode,
      languages,
      loading,
      setActive,
      addLanguage,
      refresh,
    }),
    [languageCode, languages, loading, setActive, addLanguage, refresh],
  );

  return (
    <LearningLanguageContext.Provider value={value}>
      {children}
    </LearningLanguageContext.Provider>
  );
}

export function useLearningLanguage() {
  const ctx = useContext(LearningLanguageContext);
  if (!ctx) {
    throw new Error(
      "useLearningLanguage must be used within LearningLanguageProvider",
    );
  }
  return ctx;
}
