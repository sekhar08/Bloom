'use server';

import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import {
  createRecordingForUser,
  generateRecordingSummary,
  getRecordingDetails,
  listRecordingsForUser,
} from '@/lib/recordings-db';

export async function createUploadUrl() {
  const session = await requireSession();
  const { recording, upload } = await createRecordingForUser(session.user.id);

  return {
    id: recording.id,
    uploadId: upload.id,
    url: upload.url,
  };
}

export async function listVideos() {
  const session = await requireSession();
  return listRecordingsForUser(session.user.id);
}

export async function getAssetStatus(recordingId: string) {
  const session = await requireSession();
  const details = await getRecordingDetails(recordingId, session.user.id);

  if (!details) {
    notFound();
  }

  return details;
}

export async function generateVideoSummary(recordingId: string) {
  const session = await requireSession();
  return generateRecordingSummary(recordingId, session.user.id);
}
