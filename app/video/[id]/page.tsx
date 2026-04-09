import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { getRecordingForUserByPlaybackId } from '@/lib/recordings-db';

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id: playbackId } = await params;
  const recording = await getRecordingForUserByPlaybackId(playbackId, session.user.id);

  if (!recording) {
    redirect('/dashboard');
  }

  redirect(`/recordings/${recording.id}`);
}
