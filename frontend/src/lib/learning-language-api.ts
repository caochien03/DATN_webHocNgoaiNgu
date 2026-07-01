import { fetchWithAuth, parseApiError } from "./api-fetch";
import type { LearningLanguageCode } from "./learning-language";

export type UserLearningLanguage = {
  languageCode: LearningLanguageCode;
  nameVi: string;
  isActive: boolean;
  addedAt: string;
};

export function appendLanguageQuery(
  path: string,
  languageCode: string,
): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}languageCode=${encodeURIComponent(languageCode)}`;
}

export async function fetchUserLearningLanguages(): Promise<
  UserLearningLanguage[]
> {
  const res = await fetchWithAuth("/users/me/languages");
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as UserLearningLanguage[];
}

export async function addUserLearningLanguage(
  languageCode: LearningLanguageCode,
): Promise<UserLearningLanguage[]> {
  const res = await fetchWithAuth("/users/me/languages", {
    method: "POST",
    body: JSON.stringify({ languageCode }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as UserLearningLanguage[];
}

export async function setActiveLearningLanguage(
  languageCode: LearningLanguageCode,
): Promise<UserLearningLanguage[]> {
  const res = await fetchWithAuth("/users/me/languages/active", {
    method: "PATCH",
    body: JSON.stringify({ languageCode }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as UserLearningLanguage[];
}
