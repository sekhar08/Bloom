'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAssetStatus } from '@/app/actions';
import { Loader2 } from 'lucide-react';

export default function VideoStatusPoller({ 
  recordingId,
  isVideoReady 
}: { 
  recordingId: string;
  isVideoReady: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const { recording } = await getAssetStatus(recordingId);
      
      if (!isVideoReady && recording.status === 'ready') {
        router.refresh();
      }
      
      if (isVideoReady && recording.transcriptStatus === 'ready') {
        router.refresh();
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [recordingId, isVideoReady, router]);

  if (isVideoReady) return null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[rgba(255,252,247,0.8)] text-[var(--foreground-soft)]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" aria-hidden="true" />
      <p className="text-sm font-medium">Processing recording…</p>
    </div>
  );
}
