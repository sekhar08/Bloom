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
    <section className="ui-panel w-full rounded-[2rem] p-5 md:p-8">
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
            <span className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-2">
              Screen
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-2">
              Microphone
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.7fr_0.82fr]">
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--background-strong)] shadow-[inset_0_1px_0_rgba(232,240,235,0.06)]">
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
              <div className="flex h-full flex-col items-center justify-center text-[var(--foreground-muted)]">
                <Monitor className="mb-3 h-12 w-12 opacity-60" aria-hidden="true" />
                <span className="text-base font-semibold text-[var(--foreground-soft)]">Preview</span>
              </div>
            ) : null}

            {isRecording ? (
              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(14,26,18,0.85)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
                <span className="h-2.5 w-2.5 animate-recording-pulse rounded-full bg-red-400" />
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
              className="mt-6 rounded-[1.25rem] border border-[var(--border)] bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[var(--foreground-soft)]"
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
              className="ui-button-danger w-full py-3"
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
