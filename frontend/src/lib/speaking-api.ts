import { fetchWithAuth, parseApiError, uploadWithAuth } from "./api-fetch";
import type {
  SpeakingSelfLevel,
  SpeakingSessionDetail,
  SpeakingSessionListItem,
  SpeakingSituationRow,
  SpeakingSubmitTurnResult,
  SpeakingTopicRow,
} from "./types";

export const SPEAKING_LEVEL_OPTIONS: {
  value: SpeakingSelfLevel;
  label: string;
  hint: string;
}[] = [
  {
    value: "BEGINNER",
    label: "Sơ cấp",
    hint: "Câu ngắn, giao tiếp cơ bản",
  },
  {
    value: "INTERMEDIATE",
    label: "Trung cấp",
    hint: "Hội thoại hàng ngày",
  },
  {
    value: "ADVANCED",
    label: "Khá",
    hint: "Kể chuyện, xử lý tình huống phức tạp",
  },
];

export function speakingLevelLabel(level: SpeakingSelfLevel): string {
  return SPEAKING_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(await parseApiError(res));
  return (await res.json()) as T;
}

export async function fetchSpeakingTopics(): Promise<SpeakingTopicRow[]> {
  return jsonOrThrow(await fetchWithAuth("/speaking/topics"));
}

export async function fetchSpeakingSituations(params: {
  topicIds: string[];
  level?: SpeakingSelfLevel;
}): Promise<SpeakingSituationRow[]> {
  const q = new URLSearchParams();
  if (params.topicIds.length > 0) {
    q.set("topicIds", params.topicIds.join(","));
  }
  if (params.level) q.set("level", params.level);
  const query = q.toString();
  return jsonOrThrow(
    await fetchWithAuth(`/speaking/situations${query ? `?${query}` : ""}`),
  );
}

export async function fetchSpeakingSessions(): Promise<SpeakingSessionListItem[]> {
  return jsonOrThrow(await fetchWithAuth("/speaking/sessions"));
}

export async function fetchSpeakingSession(
  id: string,
): Promise<SpeakingSessionDetail> {
  return jsonOrThrow(await fetchWithAuth(`/speaking/sessions/${id}`));
}

export async function createSpeakingSession(body: {
  situationId: string;
  selectedTopicIds: string[];
  selfLevel: SpeakingSelfLevel;
}): Promise<SpeakingSessionDetail> {
  return jsonOrThrow(
    await fetchWithAuth("/speaking/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

export async function submitSpeakingTurn(
  sessionId: string,
  audio: Blob,
  durationSecs?: number,
): Promise<SpeakingSubmitTurnResult> {
  const form = new FormData();
  form.append("audio", audio, "recording.webm");
  if (durationSecs != null) {
    form.append("durationSecs", String(durationSecs));
  }
  return jsonOrThrow(
    await uploadWithAuth(`/speaking/sessions/${sessionId}/turns`, form),
  );
}

export async function completeSpeakingSession(
  sessionId: string,
): Promise<SpeakingSessionDetail> {
  return jsonOrThrow(
    await fetchWithAuth(`/speaking/sessions/${sessionId}/complete`, {
      method: "POST",
    }),
  );
}
