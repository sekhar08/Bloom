'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUploadUrl } from '@/app/actions';
import {
  Loader2,
  Mic,
  Monitor,
  RotateCcw,
  ScreenShare,
  StopCircle,
  Video,
} from 'lucide-react';

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

  const router = useRouter();

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false,
      });

      screenStreamRef.current = screenStream;
      micStreamRef.current = micStream;

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combinedStream;
      }

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setMediaBlob(blob);

        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = null;
        }

        screenStreamRef.current?.getTracks().forEach((track) => track.stop());
        micStreamRef.current?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      screenStream.getVideoTracks()[0].onended = stopRecording;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    if (!mediaBlob) return;

    setIsUploading(true);

    try {
      const uploadConfig = await createUploadUrl();

      await fetch(uploadConfig.url, {
        method: 'PUT',
        body: mediaBlob,
      });

      router.push(`/recordings/${uploadConfig.id}`);
    } catch (error) {
      console.error('Upload failed', error);
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setMediaBlob(null);
    chunksRef.current = [];
  };

  return (
    <section className="w-full rounded-[2rem] border border-[rgba(255,255,255,0.55)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,252,247,0.78))] p-5 shadow-[0_24px_60px_rgba(24,36,52,0.08)] backdrop-blur md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="ui-badge">
              {isRecording ? 'Live Session' : mediaBlob ? 'Ready to Upload' : 'Recorder'}
            </span>
            <div>
              <h2 className="text-3xl font-semibold text-[var(--foreground)]">
                {isRecording ? 'Recording' : mediaBlob ? 'Ready' : 'New Recording'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-[var(--foreground-soft)] sm:flex">
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-2">
              Screen
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-3 py-2">
              Microphone
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_0.82fr]">
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top,_rgba(44,106,107,0.15),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(233,228,218,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${isRecording ? 'block' : 'hidden'}`}
            />

            {!isRecording && mediaBlob ? (
              <div className="flex h-full flex-col items-center justify-center text-[var(--success)]">
                <Video className="mb-3 h-12 w-12" aria-hidden="true" />
                <span className="text-base font-semibold">Ready to upload</span>
              </div>
            ) : null}

            {!isRecording && !mediaBlob ? (
              <div className="flex h-full flex-col items-center justify-center text-[var(--foreground-soft)]">
                <Monitor className="mb-3 h-12 w-12 opacity-60" aria-hidden="true" />
                <span className="text-base font-semibold">Preview</span>
              </div>
            ) : null}

            {isRecording ? (
              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.82)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.45)]" />
                Recording
              </div>
            ) : null}
          </div>

          <aside className="ui-panel flex flex-col justify-between rounded-[1.75rem] p-5">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">Details</h3>
              <div className="mt-4 space-y-3 text-sm text-[var(--foreground-soft)]">
                <div className="flex items-start gap-3">
                  <ScreenShare className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  <p>Pick a screen.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Mic className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  <p>Mic is included.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Video className="mt-0.5 h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
                  <p>Upload for transcript.</p>
                </div>
              </div>
            </div>

            <div
              aria-live="polite"
              className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-white/70 p-4 text-sm text-[var(--foreground-soft)]"
            >
              {isUploading
                ? 'Uploading…'
                : isRecording
                  ? 'Stop when ready.'
                  : mediaBlob
                    ? 'Upload to continue.'
                    : 'Start to begin.'}
            </div>
          </aside>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          {!isRecording && !mediaBlob ? (
            <button type="button" onClick={startRecording} className="ui-button-primary w-full py-3">
              <ScreenShare className="h-4 w-4" aria-hidden="true" />
              Start Recording
            </button>
          ) : null}

          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#9f3a32,#7f1d1d)] py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(127,29,29,0.18)] hover:-translate-y-px"
            >
              <StopCircle className="h-5 w-5" aria-hidden="true" />
              Stop Recording
            </button>
          ) : null}

          {mediaBlob ? (
            <>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="ui-button-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Video className="h-5 w-5" aria-hidden="true" />
                )}
                {isUploading ? 'Uploading…' : 'Upload Recording'}
              </button>
              <button
                type="button"
                onClick={resetRecording}
                disabled={isUploading}
                className="ui-button-secondary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Record Again
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
