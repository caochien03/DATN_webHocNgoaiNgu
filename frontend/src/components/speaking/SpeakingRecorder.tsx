"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { BRAND } from "@/components/ui-kit/brand";
import { GradientButton } from "@/components/ui-kit/primitives";

const MAX_SECONDS = 60;

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  disabled?: boolean;
  processing?: boolean;
  processingLabel?: string;
  onSubmit: (blob: Blob, durationSecs: number) => void | Promise<void>;
};

export function SpeakingRecorder({
  disabled,
  processing,
  processingLabel = "Đang xử lý…",
  onSubmit,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      if (mediaRef.current?.state === "recording") {
        mediaRef.current.stop();
      }
      stopTracks();
    };
  }, [clearTimer, stopTracks]);

  async function startRecording() {
    setError(null);
    setPreviewBlob(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt không hỗ trợ ghi âm.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        clearTimer();
        stopTracks();
        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        setPreviewBlob(blob);
        setRecording(false);
      };
      mediaRef.current = recorder;
      elapsedRef.current = 0;
      setElapsed(0);
      recorder.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_SECONDS) {
          recorder.stop();
        }
      }, 1000);
    } catch {
      setError(
        "Không truy cập được micro. Hãy bật quyền micro cho trình duyệt.",
      );
      stopTracks();
    }
  }

  function stopRecording() {
    if (mediaRef.current?.state === "recording") {
      mediaRef.current.stop();
    }
  }

  async function handleSubmit() {
    if (!previewBlob) return;
    await onSubmit(previewBlob, Math.max(1, elapsedRef.current || elapsed));
    setPreviewBlob(null);
    setElapsed(0);
    elapsedRef.current = 0;
  }

  const busy = disabled || processing;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Ghi âm câu trả lời</p>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(elapsed)} / {formatTime(MAX_SECONDS)}
        </span>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {!recording && !previewBlob ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void startRecording()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted/50 disabled:opacity-50"
          >
            <Mic size={16} style={{ color: BRAND.red }} />
            Bắt đầu ghi
          </button>
        ) : null}

        {recording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400"
          >
            <Square size={14} fill="currentColor" />
            Dừng ghi
          </button>
        ) : null}

        {previewBlob && !processing ? (
          <>
            <GradientButton onClick={() => void handleSubmit()} disabled={busy}>
              Gửi câu trả lời
            </GradientButton>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPreviewBlob(null);
                setElapsed(0);
                elapsedRef.current = 0;
              }}
              className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Ghi lại
            </button>
          </>
        ) : null}

        {processing ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            {processingLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
